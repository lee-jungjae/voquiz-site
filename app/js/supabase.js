// Minimal Supabase client over fetch (no build step, no bundled library).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import { parsePartial } from "./partial.js";

const SESSION_KEY = "wb_session";
let session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
let refreshing = null;

function save(next) {
  session = next;
  if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  else localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  const res = await fetch(SUPABASE_URL + path, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  // A database function that refuses (raise exception 'duel_off') answers with code P0001 and the reason as its message.
  if (!res.ok) throw new ApiError(data?.error || data?.error_code || (data?.code === "P0001" ? data.message : data?.code) || "request_failed", res.status);
  return data;
}

// Returns a valid access token, refreshing it shortly before it expires.
async function accessToken() {
  if (!session) throw new ApiError("unauthorized", 401);
  if (session.expires_at * 1000 - Date.now() > 60_000) return session.access_token;
  refreshing ??= request("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: { refresh_token: session.refresh_token },
  })
    .then((s) => save({ access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at, user: s.user }))
    .catch((err) => {
      if (err.status === 400 || err.status === 401) save(null); // refresh token no longer valid
      throw new ApiError("unauthorized", 401);
    })
    .finally(() => (refreshing = null));
  await refreshing;
  return session.access_token;
}

const authed = async (path, options = {}) => request(path, { ...options, token: await accessToken() });

const toUser = (u) => ({ id: u.id, email: u.email, grade: u.user_metadata?.grade ?? null, points: u.user_metadata?.points ?? 0, search: u.user_metadata?.search ?? null, nickname: u.user_metadata?.nickname ?? "", shop: u.user_metadata?.shop ?? null, challenge: u.user_metadata?.challenge ?? null, nameChanges: u.user_metadata?.nameChanges ?? 0, noDuels: u.user_metadata?.noDuels ?? false, gift: u.user_metadata?.gift ?? null, weekly: u.user_metadata?.weekly ?? null, motto: u.user_metadata?.motto ?? "", duelFrom: u.user_metadata?.duelFrom ?? (u.user_metadata?.noDuels ? "none" : "all") });

export function getUser() {
  return session ? toUser(session.user) : null;
}

// Google sign-in through Supabase, in a browser popup managed by Chrome.
export async function signIn() {
  const redirect = chrome.identity.getRedirectURL();
  const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;
  const result = await chrome.identity.launchWebAuthFlow({ url, interactive: true });
  const params = new URLSearchParams(new URL(result).hash.slice(1));
  const access_token = params.get("access_token");
  if (!access_token) throw new ApiError(params.get("error_description") || "sign_in_failed", 400);
  const user = await request("/auth/v1/user", { token: access_token });
  save({
    access_token,
    refresh_token: params.get("refresh_token"),
    expires_at: Number(params.get("expires_at")) || Math.floor(Date.now() / 1000) + Number(params.get("expires_in") || 3600),
    user,
  });
  return toUser(user);
}

export async function signOut() {
  const token = session?.access_token;
  save(null);
  if (token) await request("/auth/v1/logout", { method: "POST", token }).catch(() => {});
}

export async function setGrade(grade) {
  const user = await authed("/auth/v1/user", { method: "PUT", body: { data: { grade } } });
  save({ ...session, user });
  return toUser(user);
}

// Word points live in the account's profile data, so they follow the student to any computer.
export async function saveProfile(data) {
  const user = await authed("/auth/v1/user", { method: "PUT", body: { data } });
  save({ ...session, user });
}

// What this student shows on the rankings. Kept in its own table so that names and points can be
// ranked across students without exposing anyone's account.
export async function publishRank(row) {
  const send = (body) => authed("/rest/v1/profiles?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: { user_id: session.user.id, ...body, updated_at: new Date().toISOString() },
  });
  try {
    await send(row);
  } catch (err) {
    // Without 0009_weekly_league.sql the table has no place for the week's points, the character
    // and the line: the rest is still published.
    if (err.status !== 400) throw err;
    const { tier, ...noTier } = row; // 0010_league_tiers.sql is not there yet
    try {
      await send(noTier);
    } catch (again) {
      if (again.status !== 400) throw again;
      const { week_start, week_points, character, motto, ...old } = noTier;
      await send(old);
    }
  }
}

// -> { points: [...], found: [...], words: [...], streak: [...] }, each row { rank, nickname, tag, score, me }
// `streak` ranks the students of one grade by their best run in the streak challenge.
// friends: only my friends and me (needs 0005_friends.sql; without it everyone is ranked).
export async function getRankings(grade, friends = false) {
  const call = (body) => authed("/rest/v1/rpc/get_rankings", { method: "POST", body });
  try {
    return await call({ p_limit: 20, p_grade: grade, p_friends: friends });
  } catch (err) {
    if (err.status !== 404) throw err;
    return call({ p_limit: 20, p_grade: grade });
  }
}

// Re-reads the account (grade, points) in case another computer changed it.
export async function refreshUser() {
  if (!session) return null;
  const user = await authed("/auth/v1/user");
  save({ ...session, user });
  return toUser(user);
}

// -> { valid, content, word }   (word is null when the term is not a real word)
// A cached word comes back as plain JSON. A new word comes back as a stream of JSON lines while Claude
// writes it; `onPartial` is called with the entry as far as it has been written.
export async function lookup(term, onPartial) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/lookup`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ term, grade: getUser().grade }),
  });
  const toResult = (data) => ({
    valid: data.valid,
    content: data.content,
    word: data.word && { ...data.word, content: data.content },
    discovered: data.valid && !data.cached && data.word?.discovered === true,
  });

  if (!(res.headers.get("Content-Type") || "").includes("ndjson")) {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.error || "request_failed", res.status);
    return toResult(data);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let pending = "", written = "";
  for (;;) {
    const { done, value } = await reader.read();
    pending += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = pending.split("\n");
    pending = lines.pop();
    for (const line of lines.filter(Boolean)) {
      const message = JSON.parse(line);
      if (message.type === "delta") {
        written += message.text;
        onPartial?.(parsePartial(written));
      } else if (message.type === "done") {
        return toResult(message);
      } else if (message.type === "error") {
        throw new ApiError(message.error, message.error === "busy" ? 429 : message.error === "refused" ? 422 : 502);
      }
    }
    if (done) throw new ApiError("ai_error", 502); // the stream ended without a result
  }
}

const COLUMNS = "term_norm,headword,favorite,search_count,first_searched_at,last_searched_at,needs_review,streak,last_reviewed_at";

export async function listWords() {
  const query = (columns) =>
    authed(`/rest/v1/user_words?select=${columns},entry:word_entries(content)&order=last_searched_at.desc&limit=2000`);
  let rows;
  try {
    rows = await query(`${COLUMNS},discovered`);
  } catch (err) {
    if (err.status !== 400) throw err;
    rows = await query(COLUMNS); // database not migrated to 0002_discovered.sql yet
  }
  return rows.map(({ entry, ...row }) => ({ ...row, content: entry.content }));
}

const rowFilter = (termNorm) =>
  `/rest/v1/user_words?user_id=eq.${session.user.id}&term_norm=eq.${encodeURIComponent(termNorm)}`;

export async function updateWord(termNorm, patch) {
  await authed(rowFilter(termNorm), { method: "PATCH", body: patch });
}

export async function deleteWord(termNorm) {
  await authed(rowFilter(termNorm), { method: "DELETE" });
}

// ---------- duels (supabase/migrations/0004_duels.sql) ----------
const rpc = (name, body = {}) => authed(`/rest/v1/rpc/${name}`, { method: "POST", body });
export const listDuels = () => rpc("my_duels");
export const duelPlayers = () => rpc("duel_players", { p_limit: 30 });
export const findPlayer = (email) => rpc("find_player", { p_email: email });
// befriend: the duel is also a friend invitation.  seconds: how long it lasts (60, 100 or 180).
// A database that has not had 0008_duel_options_and_leaving.sql yet only knows three-minute duels.
export async function createDuel({ opponent, grade, seed, score, marks, character, befriend = false, seconds = 180 }) {
  const body = { p_opponent: opponent, p_grade: grade, p_seed: seed, p_score: score, p_marks: marks, p_character: character, p_befriend: befriend };
  try {
    return await rpc("create_duel", { ...body, p_seconds: seconds });
  } catch (err) {
    if (err.status !== 404 || seconds !== 180) throw err;
    return rpc("create_duel", body);
  }
}
export const answerDuel = (id, score, character, marks = []) =>
  rpc("answer_duel", { p_id: id, p_score: score, p_character: character, p_marks: marks })
    .catch((err) => (err.status === 404 ? rpc("answer_duel", { p_id: id, p_score: score, p_character: character }) : Promise.reject(err)));
export const claimDuel = (id) => rpc("claim_duel", { p_id: id });
// The newest version of the app and the oldest still allowed: { latest, minimum }. Asked without
// signing in (needs 0011_app_version.sql).
export const appVersion = () => request("/rest/v1/rpc/app_version", { method: "POST", body: {}, token: SUPABASE_ANON_KEY });
// The board for the people who run VOQUIZ (admins only; needs 0013_admin_board.sql).
export const adminBoard = () => rpc("admin_board");
// Notices to show now: [{ id, kind: "urgent" | "news", title: { ko, en, zh }, body: {...}, action }]
// (needs 0012_notices.sql)
export const notices = () => request("/rest/v1/rpc/active_notices", { method: "POST", body: {}, token: SUPABASE_ANON_KEY });
// Last week's final points of the other students of a tier: [{ nickname, tag, character, score }]
export const leagueLastWeek = (tier) => rpc("league_last_week", { p_tier: tier });
export const duelRankings = (friends = false) =>
  rpc("duel_rankings", { p_limit: 20, p_friends: friends }).catch((err) => (err.status === 404 ? rpc("duel_rankings", { p_limit: 20 }) : Promise.reject(err)));
export const setNoDuels = (off) => rpc("set_no_duels", { p_off: off });

// ---------- friends and invite codes (supabase/migrations/0005_friends.sql) ----------
export const listFriends = () => rpc("my_friends");
export const requestFriend = (email) => rpc("request_friend", { p_email: email }); // -> "pending" | "accepted"
export const answerFriend = (id, accept) => rpc("answer_friend", { p_id: id, p_accept: accept });
export const removeFriend = (id) => rpc("remove_friend", { p_id: id });
export const myInvites = () => rpc("my_invites");
export const useInvite = (code) => rpc("use_invite", { p_code: code });

// ---------- invite only (0006_open_duels_and_invite_only.sql) ----------
export const isMember = () => rpc("is_member");
// Who may challenge me: "all" | "friends" | "none".
export const setDuelFrom = (from) => rpc("set_duel_from", { p_from: from });

// ---------- VOQUIZ Plus (0007_plus.sql) ----------
export const myPlan = () => rpc("my_plan"); // -> { plus, until }
export const redeemCoupon = (code) => rpc("redeem_coupon", { p_code: code });

// ---------- leaving (0008_duel_options_and_leaving.sql) ----------
export async function deleteAccount() {
  await rpc("delete_my_account");
  save(null); // the session is gone with the account
}
