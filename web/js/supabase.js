// Minimal Supabase client over fetch (no build step, no bundled library).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js?v=0.1.28-tp7oez";
import { parsePartial } from "./partial.js?v=0.1.28-tp7oez";
import { syncClock, clockNow } from "./clock.js?v=0.1.28-tp7oez";

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
  syncClock(res.headers.get("date")); // the server's time (clock.js)
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

const toUser = (u) => ({ id: u.id, email: u.email, level: u.user_metadata?.level ?? null, bag: u.user_metadata?.bag ?? null, hearts: u.user_metadata?.hearts ?? null, grade: u.user_metadata?.grade ?? null, points: u.user_metadata?.points ?? 0, search: u.user_metadata?.search ?? null, nickname: u.user_metadata?.nickname ?? "", shop: u.user_metadata?.shop ?? null, challenge: u.user_metadata?.challenge ?? null, nameChanges: u.user_metadata?.nameChanges ?? 0, noDuels: u.user_metadata?.noDuels ?? false, gift: u.user_metadata?.gift ?? null, weekly: u.user_metadata?.weekly ?? null, plays: Array.isArray(u.user_metadata?.plays) ? u.user_metadata.plays : [], motto: u.user_metadata?.motto ?? "", welcome: u.user_metadata?.welcome ?? "", santa: u.user_metadata?.santa ?? null, duelFrom: u.user_metadata?.duelFrom ?? (u.user_metadata?.noDuels ? "none" : "all") });

export function getUser() {
  return session ? toUser(session.user) : null;
}

// Web only: back from Google, the address carries the session after "#". It is stored and taken
// out of the address before the app starts (index.html calls this first). -> true if signed in.
export async function finishSignIn() {
  const params = new URLSearchParams(location.hash.slice(1));
  const access_token = params.get("access_token");
  if (!access_token && !params.get("error")) return false;
  history.replaceState(null, "", location.pathname + location.search);
  if (!access_token) return false;
  try {
    const user = await request("/auth/v1/user", { token: access_token });
    save({
      access_token,
      refresh_token: params.get("refresh_token"),
      expires_at: Number(params.get("expires_at")) || Math.floor(Date.now() / 1000) + Number(params.get("expires_in") || 3600),
      user,
    });
    return true;
  } catch {
    return false;
  }
}

// Google sign-in through Supabase. In the extension Chrome runs it in a popup of its own. On the
// web the page leaves for Google and comes back to this address (see finishSignIn); that address
// has to be on the project's list of redirect addresses.
export async function signIn() {
  if (!globalThis.chrome?.identity) {
    const back = new URL("./", location.href).href; // always the folder itself (…/web/), so one allowed address is enough
    location.assign(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(back)}`);
    return new Promise(() => {}); // the page is on its way out
  }
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
    body: { user_id: session.user.id, ...body, updated_at: new Date(clockNow()).toISOString() },
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
export async function lookup(term, onPartial, view) { // view: another group's explanation (see lookupLevel)
  const res = await fetch(`${SUPABASE_URL}/functions/v1/lookup`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ term, grade: getUser().grade, ...(view ? { view } : {}) }),
  });
  syncClock(res.headers.get("date"));
  const toResult = (data) => ({
    valid: data.valid,
    content: data.content,
    word: data.word && { ...data.word, content: data.content },
    discovered: data.valid && !data.cached && data.word?.discovered === true,
    view: data.view || null,
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

// The same word as it is explained to another group of grades (band: "g3_5" | "g6_8" | "g9_12"),
// for a word already in the student's list. Only to look at: the server adds nothing to the word
// list and counts it neither as a search nor as a discovery.
export async function lookupLevel(term, band, onPartial) {
  const result = await lookup(term, onPartial, band);
  if (result.view !== band) throw new ApiError("level_unavailable", 501); // a server from before this existed
  return result;
}

const COLUMNS = "term_norm,headword,favorite,search_count,first_searched_at,last_searched_at,needs_review,streak,last_reviewed_at";

export async function listWords() {
  const query = (columns) =>
    authed(`/rest/v1/user_words?select=${columns},entry:word_entries(content)&order=last_searched_at.desc&limit=2000`);
  let rows;
  // Newer columns first; a database that has not been migrated that far answers 400.
  const tries = [`${COLUMNS},discovered,folder,typed_ok,mastered_at`, `${COLUMNS},discovered,folder`, `${COLUMNS},discovered`, COLUMNS];
  for (const [i, columns] of tries.entries()) {
    try {
      rows = await query(columns);
      break;
    } catch (err) {
      if (err.status !== 400 || i === tries.length - 1) throw err;
    }
  }
  return rows.map(({ entry, ...row }) => ({ ...row, content: entry.content }));
}

const rowFilter = (termNorm) =>
  `/rest/v1/user_words?user_id=eq.${session.user.id}&term_norm=eq.${encodeURIComponent(termNorm)}`;

export async function updateWord(termNorm, patch) {
  try {
    await authed(rowFilter(termNorm), { method: "PATCH", body: patch });
  } catch (err) {
    // Before 0015_learned_words.sql the two columns do not exist: save the rest.
    if (err.status !== 400 || !("typed_ok" in patch || "mastered_at" in patch)) throw err;
    const { typed_ok, mastered_at, ...rest } = patch;
    if (Object.keys(rest).length) await authed(rowFilter(termNorm), { method: "PATCH", body: rest });
  }
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
  // p_rule "charge": three challenges held, one back every hour (0016_duel_charges.sql). A database
  // without it does not know the argument (404) and is asked the older way.
  try {
    return await rpc("create_duel", { ...body, p_seconds: seconds, p_rule: "charge" });
  } catch (err) {
    if (err.status !== 404) throw err;
  }
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
// Numbers the server may override (tuning.js): {} when nothing is set. (needs 0018_tuning_and_point_cap.sql)
export const appConfig = () => request("/rest/v1/rpc/app_config", { method: "POST", body: {}, token: SUPABASE_ANON_KEY });
// Notices to show now: [{ id, kind: "urgent" | "news", title: { ko, en, zh }, body: {...}, action }]
// (needs 0012_notices.sql)
// The app says which version it is, so that a notice meant for older versions ("update to ...") is
// not sent to this one. A database without 0019_notice_versions.sql does not know the argument (404).
export const notices = (version) => {
  const ask = (body) => request("/rest/v1/rpc/active_notices", { method: "POST", body, token: SUPABASE_ANON_KEY });
  return version ? ask({ p_version: version }).catch((err) => (err.status === 404 ? ask({}) : Promise.reject(err))) : ask({});
};
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
// ---------- points given between friends (supabase/migrations/0020_point_gifts.sql) ----------
// day: the student's own date (YYYY-MM-DD). -> { sent: [friend id], waiting: [{ id, points, at, from }], got: [{ points, at, from }] }
export const pointGifts = (day) => rpc("my_point_gifts", { p_day: day });
export const sendPointGift = (friend, day) => rpc("send_point_gift", { p_friend: friend, p_day: day });
// -> { points, gifts: [{ points, from }] }. from: only that friend's (0022_claim_one_gift.sql); a
// database without that part knows only "all of them", and that is what it then does.
export async function claimPointGifts(from) {
  if (!from) return rpc("claim_point_gifts");
  try {
    return await rpc("claim_point_gifts", { p_from: from });
  } catch (err) {
    if (err?.status === 404 || err?.code === "PGRST202") return rpc("claim_point_gifts");
    throw err;
  }
}
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
