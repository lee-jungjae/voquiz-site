// Duels: one student answers as many questions as they can in three minutes and challenges
// another, who then tries to beat that score on the very same questions. The two never have to be
// online together: the challenger's run is replayed as a "ghost" racing alongside.
//
// This file holds the rules and the screens. It gets what it needs from app.js through `c`
// (the element builder, translations, the shared state, points, the character drawings).
import { WORD_LISTS } from "./wordlists.js?v=0.1.28-tp7tpx";
import { WORD_DEFS } from "./worddefs.js?v=0.1.28-tp7tpx";
import { clockNow } from "./clock.js?v=0.1.28-tp7tpx";

export const DUEL_LENGTHS = [60, 100, 180]; // seconds; the challenger chooses
export const DUEL_CHARGES = 3; // challenges a student can hold
export const DUEL_REFILL_MS = 60 * 60 * 1000; // one comes back every hour

// How many challenges are left, worked out from the times the earlier ones were sent: every
// challenge uses a charge, and while fewer than DUEL_CHARGES are held one returns each hour.
// (create_duel in 0016_duel_charges.sql counts the same way.)  -> { left, nextAt }
export function duelCharges(sentTimes, now = clockNow()) {
  let left = DUEL_CHARGES;
  let since = 0; // when the hour that is running began
  const refill = (at) => {
    if (left >= DUEL_CHARGES) return;
    const back = Math.floor((at - since) / DUEL_REFILL_MS);
    left = Math.min(DUEL_CHARGES, left + back);
    since += back * DUEL_REFILL_MS;
  };
  for (const at of [...sentTimes].sort((a, b) => a - b)) {
    if (at > now) continue;
    refill(at);
    if (left >= DUEL_CHARGES) since = at;
    left = Math.max(0, left - 1);
  }
  refill(now);
  return { left, nextAt: left < DUEL_CHARGES ? since + DUEL_REFILL_MS : 0 };
}
const FREEZE_MS = 3000; // a wrong answer costs three seconds
const FEE = 10; // points to take part
const WIN = 25;
const DRAW = 10;

// A small seeded random generator: the same seed gives both players the same questions.
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function mixed(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The questions of a duel: multiple choice only, built from the grade's recommended words.
export function duelQuestions(grade, seed, count = 240) {
  const rand = seeded(seed);
  const list = WORD_LISTS[grade] || [];
  const side = {
    en: (pair) => pair[0], ko: (pair) => pair[1],
    den: (pair) => WORD_DEFS[pair[0]][0], dko: (pair) => WORD_DEFS[pair[0]][1],
  };
  return mixed(list, rand).slice(0, count).map((pair) => {
    const hasDefs = Boolean(WORD_DEFS[pair[0]]);
    // Three wrong choices that cannot also be right.
    const others = [];
    for (let tries = 0; others.length < 3 && tries < 300; tries++) {
      const other = list[Math.floor(rand() * list.length)];
      if (hasDefs && !WORD_DEFS[other[0]]) continue;
      if ([pair, ...others].some((used) => used[0] === other[0] || used[1] === other[1])) continue;
      others.push(other);
    }
    const kinds = hasDefs
      ? [["en", "ko"], ["ko", "en"], ["dko", "ko"], ["den", "en"], ["dko", "en"], ["den", "ko"]]
      : [["en", "ko"], ["ko", "en"]];
    const [shown, asked] = kinds[Math.floor(rand() * kinds.length)];
    return {
      prompt: side[shown](pair),
      answer: side[asked](pair),
      options: mixed([pair, ...others], rand).map(side[asked]),
      long: shown.startsWith("d"),
    };
  });
}

export function initDuel(c) {
  const { h, t, state, api } = c;
  let ticker = 0;
  let lastFetch = 0;

  const who = (other) => c.nameOf(other.nickname, other.tag);
  // What a finished duel pays: a win, a draw, or a little for taking part.
  const reward = (mine, theirs) => (mine > theirs ? WIN : mine === theirs ? DRAW : Math.min(5, Math.floor(mine / 5)));
  const incoming = () => (state.duels || []).filter((d) => d.role === "opponent" && d.status === "open");
  const seconds = () => (DUEL_LENGTHS.includes(state.duelSeconds) ? state.duelSeconds : 60);
  // Challenges sent in the last 24 hours, and how many are left (the database counts the same way).
  const charges = () => duelCharges((state.duels || []).filter((d) => d.role === "challenger").map((d) => new Date(d.created_at).getTime())
    .filter((at) => clockNow() - at < 24 * 60 * 60 * 1000));
  const sendsLeft = () => charges().left;
  // Until the next charge: a clock that counts down every second. It changes only its own text,
  // and the screen is drawn again when the charge arrives.
  let chargeTicker = 0;
  const waitLeft = () => Math.max(0, Math.ceil((charges().nextAt - clockNow()) / 1000));
  const waitLabel = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function waitClock() {
    if (!charges().nextAt) return null;
    clearInterval(chargeTicker);
    chargeTicker = setInterval(() => {
      const clocks = document.querySelectorAll(".charge-clock");
      if (!clocks.length) return clearInterval(chargeTicker);
      if (!charges().nextAt || waitLeft() === 0) { clearInterval(chargeTicker); return c.render(); }
      for (const el of clocks) el.querySelector(".time").textContent = waitLabel(waitLeft());
    }, 1000);
    // what arrives, and the time until it does
    return h("small", { class: "charge-clock", role: "timer", "aria-label": t("다음 충전까지") }, h("em", null, "+1"), t("충전까지 남은 시간"), " : ", h("span", { class: "time" }, waitLabel(waitLeft())));
  }
  const stopwatch = (size = 20) => {
    const el = document.createElement("span");
    el.className = "stopwatch";
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5V6M18.5 6.5l1.5-1.5"/></svg>`;
    return el;
  };
  const sendsLine = () => h("p", { class: `duel-left${sendsLeft() ? "" : " none"}` },
    h("span", null, t("보낼 수 있는 도전"), waitClock()),
    h("span", { class: "pips", "aria-hidden": "true" }, Array.from({ length: DUEL_CHARGES }, (_, i) => h("i", { class: i < sendsLeft() ? "on" : "" }))),
    h("b", null, `${sendsLeft()} / ${DUEL_CHARGES}`));
  const lengthLabel = (s) => (s === 60 ? t("1분") : s === 180 ? t("3분") : t("{n}초", { n: s }));
  const clockText = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const ERRORS = () => ({
    duel_off: t("이 친구는 대결을 받지 않아요."),
    duel_pending: t("이 친구에게 보낸 도전이 아직 남아 있어요."),
    duel_limit: t("도전 신청을 다 썼어요. 1시간마다 1개씩 충전돼요."),
    duel_closed: t("이미 끝났거나 기한이 지난 대결이에요."),
    duel_nobody: t("상대를 찾지 못했어요."),
    duel_not_friends: t("대결은 친구끼리만 할 수 있어요."),
    duel_friends_only: t("이 친구는 친구의 대결만 받아요."),
    duel_invalid: t("기록이 올바르지 않아 저장하지 못했어요."),
  });

  // ---------- data ----------

  // Reads my duels (at most once a minute unless forced) and collects what finished ones paid.
  async function refresh(force) {
    if (!state.user || (!force && Date.now() - lastFetch < 60000)) return;
    lastFetch = Date.now();
    try {
      state.duels = await api.listDuels();
      state.duelSetup = false;
    } catch (err) {
      // The database part (0004_duels.sql) has not been installed yet.
      if (err?.status === 404 || err?.code === "PGRST202") state.duelSetup = true;
      else console.error(err);
      return;
    }
    await settle(false);
    c.render();
  }

  // Collects the points of duels that are over. The database lets each side claim a duel once.
  async function settle(quiet) {
    for (const d of state.duels || []) {
      if (d.claimed || d.status === "open" || (d.status === "expired" && d.role !== "challenger")) continue;
      try {
        const first = await api.claimDuel(d.id);
        d.claimed = true;
        if (!first) continue;
      } catch (err) {
        console.error(err);
        continue;
      }
      if (d.status === "expired") {
        c.award(FEE, t("받지 않은 대결 환불"));
        continue;
      }
      const won = reward(d.my_score, d.their_score);
      const label = d.my_score > d.their_score ? t("대결 승리") : d.my_score === d.their_score ? t("대결 무승부") : t("대결 참가");
      if (won) c.award(won, `${label} · ${who(d.other)}`, !quiet && d.my_score > d.their_score);
      // The lion's special power: a little more for every win while it is the character in use.
      if (d.my_score > d.their_score && c.winBonus()) c.award(c.winBonus(), t("사자왕 보너스"));
      if (!quiet) (state.duelNews ||= []).unshift(d.id);
    }
  }

  // ---------- notices on the home screen and the tab ----------

  const badge = () => incoming().length;

  function openTab() {
    Object.assign(state, { tab: "quiz", quizMode: "duel", duelNews: [], notice: null, entry: null });
    c.render();
  }

  function banner() {
    const waiting = incoming();
    const news = (state.duelNews || []).map((id) => (state.duels || []).find((d) => d.id === id)).filter(Boolean);
    if (!waiting.length && !news.length) return null;
    return h("div", { class: "duel-banners" },
      waiting.slice(0, 2).map((d) =>
        h("button", { class: "duel-banner", onclick: () => start(d) },
          h("span", { class: "duel-vs", "aria-hidden": "true" }, "VS"),
          h("span", { class: "duel-text" },
            h("b", null, t("{name}의 도전이 왔어요!", { name: who(d.other) })),
            h("small", null, t("{n}개를 넘으면 승리", { n: d.their_score }))),
          h("span", { class: "go" }, t("받기")))),
      news.slice(0, 1).map((d) =>
        h("button", { class: "duel-banner news", onclick: openTab },
          h("span", { class: "duel-vs", "aria-hidden": "true" }, d.my_score > d.their_score ? "W" : d.my_score === d.their_score ? "=" : "L"),
          h("span", { class: "duel-text" },
            h("b", null, t("{name}와의 대결 결과가 나왔어요", { name: who(d.other) })),
            h("small", null, `${d.my_score} : ${d.their_score}`)),
          h("span", { class: "go" }, t("보기")))));
  }

  // ---------- the duel tab ----------

  function home() {
    const hero = c.guideHero(t("한판 붙어 볼까?"), t("정해진 시간 동안 누가 더 많이 맞히는지 겨뤄요. 둘 다 같은 문제를 풀어요!"));
    if (state.duelSetup) {
      return [hero, h("div", { class: "notice" }, t("대결을 쓰려면 Supabase SQL Editor에서 0004_duels.sql을 한 번 실행해야 해요."))];
    }
    refresh(false);
    const list = state.duels || [];
    const waiting = incoming();
    const sent = list.filter((d) => d.role === "challenger" && d.status === "open");
    const done = list.filter((d) => d.status === "done").slice(0, 5);
    const outcome = (d) => (d.my_score > d.their_score ? ["win", t("승")] : d.my_score === d.their_score ? ["draw", t("무")] : ["lose", t("패")]);
    return [
      hero,
      waiting.length > 0
        ? h("section", { class: "duel-list" },
            h("h3", null, t("받은 도전"), h("small", null, String(waiting.length))),
            waiting.map((d) => h("div", { class: "duel-row hot" },
              h("span", { class: "who" }, who(d.other), h("small", null, t("{n}개를 넘으면 승리", { n: d.their_score }))),
              h("button", { class: "mini buy", onclick: () => start(d) }, t("받기")))))
        : c.guideSteps([
            t("상대와 시간을 고르고 문제를 풀어 기록을 세워요."),
            t("상대가 같은 문제로 내 기록에 도전해요. 틀리면 3초 동안 멈춰요."),
            t("더 많이 맞힌 쪽이 이겨요. 도전은 7일 동안 기다려요."),
          ]),
      h("div", { class: "guide-stats" },
        c.guideStat(t("쓰는 포인트"), [c.coin(), `-${Math.min(FEE, state.user.points || 0)}`], "use"),
        c.guideStat(t("이기면"), [c.coin(), `+${WIN}`], "gain"),
        c.guideStat(t("비기면"), [c.coin(), `+${DRAW}`], "gain")),
      sent.length > 0 && h("section", { class: "duel-list" },
        h("h3", null, t("답을 기다리는 중")),
        sent.map((d) => h("div", { class: "duel-row" },
          h("span", { class: "who" }, who(d.other), h("small", null, t("내 기록 {n}개", { n: d.my_score }))),
          h("span", { class: "tagline" }, t("대기 중"))))),
      done.length > 0 && h("section", { class: "duel-list" },
        h("h3", null, t("최근 결과")),
        done.map((d) => h("button", { class: "duel-row tap", title: t("결과 다시 보기"), onclick: () => openDetail(d) },
          h("span", { class: `mark ${outcome(d)[0]}` }, outcome(d)[1]),
          h("span", { class: "who" }, who(d.other), h("small", null, lengthLabel(d.seconds || 180))),
          h("b", { class: "tally" }, `${d.my_score} : ${d.their_score}`),
          h("span", { class: "chev", "aria-hidden": "true" }, "›")))),
      sendsLine(),
      h("p", { class: "act" }, h("button", { class: "btn wide", disabled: sendsLeft() === 0, onclick: openPicker },
        sendsLeft() ? t("상대 고르기") : t("충전을 기다리는 중"))),
      sendsLeft() === 0 && h("p", { class: "small muted center" }, t("받은 도전은 횟수와 상관없이 받을 수 있어요.")),
    ];
  }

  // The duel on the quiz page of the desktop frame: what its card shows, and the lists under the
  // cards. A past duel shows both characters, glad or sad, so who won is plain at a glance.
  const STEPS = () => [
    t("상대와 시간을 고르고 문제를 풀어 기록을 세워요."),
    t("상대가 같은 문제로 내 기록에 도전해요. 틀리면 3초 동안 멈춰요."),
    t("더 많이 맞힌 쪽이 이겨요. 도전은 7일 동안 기다려요."),
  ];
  function desk() {
    if (state.duelSetup) return { setup: t("대결을 쓰려면 Supabase SQL Editor에서 0004_duels.sql을 한 번 실행해야 해요."), steps: STEPS(), lists: [] };
    refresh(false);
    const list = state.duels || [];
    const waiting = incoming();
    const sent = list.filter((d) => d.role === "challenger" && d.status === "open");
    const done = list.filter((d) => d.status === "done").slice(0, 6);
    const how = (d) => (d.my_score > d.their_score ? "win" : d.my_score === d.their_score ? "draw" : "lose");
    const word = { win: t("승"), draw: t("무"), lose: t("패") };
    return {
      fee: Math.min(FEE, state.user.points || 0), win: WIN, draw: DRAW,
      sendsLeft: sendsLeft(), sendsAll: DUEL_CHARGES, wait: sendsLeft() === 0 ? waitClock() : null, pick: openPicker, steps: STEPS(),
      // Past duels, for the list of every game played: when it ended, and its row (both characters, glad or sad).
      records: done.map((d) => {
        const r = how(d);
        return {
          at: d.finished_at || d.created_at,
          row: (when) => h("button", { class: `play-row duel ${r}`, title: t("결과 다시 보기"), onclick: () => openDetail(d) },
            h("span", { class: "play-who" },
              face(mine(d.my_character), r === "lose" ? "comfort" : "cheer", false, true),
              h("span", { class: "them" }, face(d.their_character || "bubble", r === "win" ? "comfort" : "cheer", false, true))),
            h("span", { class: "play-what" }, h("b", null, t("대결"), " · ", who(d.other)), h("small", null, `${when} · ${lengthLabel(d.seconds || 180)}`)),
            h("b", { class: "play-score" }, `${d.my_score} : ${d.their_score}`),
            h("span", { class: `mark ${r}` }, word[r])),
        };
      }),
      lists: [
        waiting.length > 0 && h("section", { class: "duel-list" },
          h("h3", null, t("받은 도전"), h("small", null, String(waiting.length))),
          waiting.map((d) => h("div", { class: "duel-row hot" },
            h("span", { class: "who" }, who(d.other), h("small", null, t("{n}개를 넘으면 승리", { n: d.their_score }))),
            h("button", { class: "mini buy", onclick: () => start(d) }, t("받기"))))),
        sent.length > 0 && h("section", { class: "duel-list" },
          h("h3", null, t("답을 기다리는 중")),
          sent.map((d) => h("div", { class: "duel-row" },
            h("span", { class: "who" }, who(d.other), h("small", null, t("내 기록 {n}개", { n: d.my_score }))),
            h("span", { class: "tagline" }, t("대기 중"))))),
      ],
    };
  }

  function openPicker() {
    state.duel = { mode: "pick", email: "", notice: null };
    c.render();
    c.refreshFriends(true);
  }

  // A duel with someone found by email. It doubles as a friend invitation: taking it makes friends.
  async function byEmail() {
    const d = state.duel;
    d.email = document.getElementById("friend-email").value.trim();
    if (!d.email || d.busy) return;
    d.busy = true;
    try {
      const found = await api.findPlayer(d.email);
      if (state.duel !== d) return;
      d.busy = false;
      if (!found) d.notice = t("이 이메일로 가입한 친구를 찾지 못했어요.");
      else if (found.no_duels) d.notice = t("이 친구는 대결을 받지 않아요.");
      else return start({ other: found, befriend: true });
    } catch (err) {
      console.error(err);
      d.busy = false;
      d.notice = t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
    }
    c.render();
  }

  // A duel with someone picked at random among the students who accept duels.
  async function random() {
    const d = state.duel;
    if (d.busy) return;
    d.busy = true;
    try {
      const waiting = (state.duels || []).filter((x) => x.role === "challenger" && x.status === "open").map((x) => x.other.id);
      const players = (await api.duelPlayers()).filter((p) => !p.no_duels && !waiting.includes(p.id));
      if (state.duel !== d) return;
      d.busy = false;
      if (players.length) return start({ other: players[Math.floor(Math.random() * players.length)] });
      d.notice = t("지금은 대결할 수 있는 상대가 없어요.");
    } catch (err) {
      console.error(err);
      d.busy = false;
      d.notice = t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
    }
    c.render();
  }

  function pickView() {
    const d = state.duel;
    const list = state.friends || [];
    const friends = list.filter((f) => f.status === "accepted");
    return [
      h("div", { class: "page-head" },
        h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: close }, "←"),
        h("h2", { class: "page-title" }, t("상대 고르기"))),
      d.notice && h("div", { class: "notice" }, d.notice),
      sendsLine(),
      h("section", { class: "duel-list" },
        h("h3", null, t("랜덤 대결")),
        h("button", { class: "random", onclick: random },
          h("span", { class: "dice", "aria-hidden": "true" }, "?"),
          h("span", { class: "duel-text" }, h("b", null, t("랜덤 상대와 대결")), h("small", null, t("누가 걸릴지 몰라요. 대결을 받는 친구 중에서 뽑아요."))),
          h("span", { class: "go" }, t("도전")))),
      h("section", { class: "duel-list" },
        h("h3", null, t("이메일로 대결 신청")),
        h("form", { class: "row", onsubmit: (e) => { e.preventDefault(); byEmail(); } },
          h("input", { type: "email", id: "friend-email", autocomplete: "off", value: d.email, placeholder: t("친구의 이메일"), "aria-label": t("친구의 이메일"), style: "flex:1" }),
          h("button", { class: "btn" }, t("도전"))),
        h("p", { class: "small muted hint" }, t("바로 대결을 시작해요. 친구가 대결을 받으면 자동으로 친구가 돼요."))),
      h("section", { class: "duel-list" },
        h("h3", null, t("내 친구")),
        state.friendSetup ? h("div", { class: "empty small" }, t("친구 기능을 쓰려면 Supabase SQL Editor에서 0005_friends.sql을 한 번 실행해야 해요."))
          : !state.friends ? h("div", { class: "empty small" }, t("불러오는 중…"))
          : friends.length === 0 ? h("div", { class: "empty small" }, t("아직 친구가 없어요. 이메일로 대결을 신청하면 친구가 될 수 있어요."))
          : friends.map((f) => h("div", { class: "duel-row" },
              h("span", { class: "who" }, who(f.other), h("small", null, [f.other.grade && `G${f.other.grade}`, f.other.no_duels && t("대결 안 받음")].filter(Boolean).join(" · "))),
              h("button", { class: "mini buy", disabled: Boolean(f.other.no_duels), onclick: () => start({ other: f.other }) }, t("도전"))))),
      h("p", { class: "center", style: "margin-top:14px" }, h("button", { class: "link", onclick: c.openFriends }, t("친구 관리"))),
    ];
  }

  // The step between choosing an opponent and playing: the length of the duel, one tap each.
  function timeView() {
    const { target } = state.duel;
    const notes = { 60: t("빠르게 한판"), 100: t("적당하게"), 180: t("길게 겨루기") };
    return [
      h("div", { class: "page-head" },
        h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: openPicker }, "←"),
        h("h2", { class: "page-title" }, t("대결 시간 고르기"))),
      h("div", { class: "time-hero" }, stopwatch(54), h("b", null, t("몇 분 동안 겨룰까요?")),
        h("span", null, t("{name}도 같은 시간 동안 풀어요.", { name: who(target.other) }))),
      h("div", { class: "time-options", role: "group", "aria-label": t("대결 시간") }, DUEL_LENGTHS.map((s) =>
        h("button", { class: "time-option", "aria-pressed": String(seconds() === s), onclick: () => { state.duelSeconds = s; c.render(); } },
          stopwatch(22), h("b", null, lengthLabel(s)), h("small", null, notes[s])))),
      h("p", { class: "act" }, h("button", { class: "btn wide", onclick: () => start({ ...target, timed: true }) }, t("{time} 대결 시작", { time: lengthLabel(seconds()) }))),
    ];
  }

  // ---------- playing ----------

  // target: a duel I was sent (I answer it), or { other } (I challenge them).
  function start(target) {
    const answering = Boolean(target.id);
    if (!answering) {
      const mine = (state.duels || []).filter((d) => d.role === "challenger");
      const problem = mine.some((d) => d.status === "open" && d.other.id === target.other.id) ? "duel_pending"
        : sendsLeft() === 0 ? "duel_limit" : null;
      if (problem) {
        if (state.duel?.mode === "pick") state.duel.notice = ERRORS()[problem];
        else c.toastText(ERRORS()[problem]);
        return c.render();
      }
      // A step of its own: how long the duel lasts.
      if (!target.timed) {
        state.duel = { mode: "time", target };
        Object.assign(state, { tab: "quiz", quizMode: "duel", notice: null, entry: null });
        return c.render();
      }
    }
    const myGrade = state.user.grade || 12;
    const grade = Math.min(12, Math.max(3, answering ? target.grade : Math.min(myGrade, target.other.grade || myGrade)));
    const seed = answering ? target.seed : Math.floor(Math.random() * 2147483647);
    const length = answering ? (DUEL_LENGTHS.includes(target.seconds) ? target.seconds : 180) : seconds();
    const d = (state.duel = {
      mode: "intro", answering, seconds: length, ms: length * 1000, id: target.id, other: target.other, grade, seed, befriend: Boolean(target.befriend),
      questions: duelQuestions(grade, seed), index: 0, score: 0, marks: [], picked: null, frozenUntil: 0, ghost: 0,
      their: answering ? { score: target.their_score, marks: target.their_marks || [], character: target.their_character || "bubble" } : null,
    });
    Object.assign(state, { tab: "quiz", quizMode: "duel", notice: null, entry: null });
    c.render();
    // The two characters face each other for a moment, then the clock starts.
    setTimeout(() => { if (state.duel === d && d.mode === "intro") begin(); }, 2800);
  }

  function begin() {
    const d = state.duel;
    d.fee = Math.min(FEE, state.user.points || 0);
    c.award(-d.fee, t("대결에 사용"));
    c.sfx.go();
    Object.assign(d, { mode: "play", startedAt: Date.now(), endsAt: Date.now() + d.ms });
    clearInterval(ticker);
    ticker = setInterval(tick, 200);
    c.render();
  }

  // How many the challenger had right at this moment of their own run.
  function ghostNow(d) {
    const elapsed = (Date.now() - d.startedAt) / 1000;
    if (d.their.marks.length) return d.their.marks.filter((second) => second <= elapsed).length;
    return Math.min(d.their.score, Math.floor((d.their.score * elapsed * 1000) / d.ms)); // no record of the pace: an even one
  }
  const raceMax = (d) => Math.max(d.their ? d.their.score : 0, d.score, 5) + 2;
  const raceAt = (d, n) => `${Math.min(100, (n / raceMax(d)) * 100)}%`;
  function raceLine(d) {
    if (!d.their) return t("{name}에게 보낼 기록을 세우는 중!", { name: who(d.other) });
    const lead = d.score - d.ghost;
    if (d.score > d.their.score) return t("기록을 넘었어요! 계속 달려요!");
    return lead > 0 ? t("{n}개 앞서고 있어요!", { n: lead }) : lead < 0 ? t("{n}개 뒤처졌어요. 따라잡아요!", { n: -lead }) : t("막상막하!");
  }

  // Runs five times a second: the clock, the ghost and the freeze countdown move without redrawing the screen.
  function tick() {
    const d = state.duel;
    if (!d || d.mode !== "play") return clearInterval(ticker);
    const left = d.endsAt - Date.now();
    if (left <= 0) return finish();
    const clock = document.getElementById("duel-clock");
    if (clock) {
      clock.textContent = clockText(left);
      clock.classList.toggle("hurry", left < 20000);
    }
    const bar = document.querySelector("#duel-bar i");
    if (bar) bar.style.width = `${(left / d.ms) * 100}%`;
    if (d.their) {
      d.ghost = ghostNow(d);
      const runner = document.getElementById("race-them");
      if (runner) {
        runner.style.left = raceAt(d, d.ghost);
        runner.querySelector("b").textContent = String(d.ghost);
      }
      const line = document.getElementById("race-line");
      if (line) line.textContent = raceLine(d);
    }
    const freeze = document.getElementById("duel-freeze");
    if (freeze && d.frozenUntil) freeze.textContent = String(Math.max(1, Math.ceil((d.frozenUntil - Date.now()) / 1000)));
  }

  function pick(option) {
    const d = state.duel;
    if (!d || d.mode !== "play" || d.frozenUntil > Date.now()) return;
    const q = d.questions[d.index % d.questions.length];
    if (option === q.answer) {
      c.sfx.right(c.myShop().character);
      c.cheer?.();
      d.score += 1;
      d.marks.push(Math.round((Date.now() - d.startedAt) / 1000));
      d.index += 1;
    } else {
      // Wrong: the right answer is shown and everything stops for three seconds.
      c.sfx.wrong();
      c.miss?.();
      d.picked = option;
      d.frozenUntil = Date.now() + FREEZE_MS;
      setTimeout(() => {
        if (state.duel !== d || d.mode !== "play") return;
        Object.assign(d, { frozenUntil: 0, picked: null, index: d.index + 1 });
        c.render();
      }, FREEZE_MS);
    }
    c.render();
  }

  async function finish() {
    const d = state.duel;
    if (!d || d.mode !== "play") return;
    clearInterval(ticker);
    c.sfx.time();
    d.mode = "saving";
    c.render();
    const character = c.myShop().character;
    try {
      if (d.answering) {
        await api.answerDuel(d.id, d.score, character, d.marks);
        const row = (state.duels || []).find((x) => x.id === d.id);
        if (row) Object.assign(row, { my_score: d.score, my_character: character, my_marks: d.marks, status: "done" });
        d.won = reward(d.score, d.their.score);
        d.mode = "result";
        if (d.score > d.their.score) { c.sfx.grand(character); c.win?.(); } else if (d.score < d.their.score) c.sfx.aww();
        c.render();
        await settle(true);
        if (d.befriend) {
          // The duel was also a friend invitation: we are friends now.
          c.toastText(t("{name}와(과) 친구가 됐어요!", { name: who(d.other) }));
          c.refreshFriends(true);
        }
      } else {
        await api.createDuel({ opponent: d.other.id, grade: d.grade, seed: d.seed, score: d.score, marks: d.marks, character, befriend: d.befriend, seconds: d.seconds });
        d.mode = "result";
        lastFetch = 0;
      }
    } catch (err) {
      console.error(err);
      if (err?.status === 401) { state.duel = null; await c.fail(err); return c.render(); }
      d.error = ERRORS()[err?.code] || t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
      if (d.fee) c.award(d.fee, t("대결 취소 환불"));
      d.mode = "result";
    }
    c.render();
  }

  // Giving up while setting a score: nothing is sent to the other student, and the points come back.
  function cancel() {
    const d = state.duel;
    if (!d || d.mode !== "play" || d.answering) return;
    clearInterval(ticker);
    state.duel = null;
    if (d.fee) c.award(d.fee, t("대결 취소 환불"));
    c.toastText(t("도전을 그만뒀어요. 도전장은 보내지 않았어요."));
    c.render();
  }

  // Leaving in the middle: a challenge being set is dropped; an answer counts as far as it got.
  function stop() {
    const d = state.duel;
    if (d?.mode === "play") (d.answering ? finish : cancel)();
    else if (d?.mode === "intro" || d?.mode === "time") state.duel = null;
  }

  // ----- looking at a finished duel again -----
  function openDetail(row) {
    state.duel = { mode: "detail", row };
    c.render();
  }
  // Both runs on one chart: right answers so far (up) against time (across).
  function chart(mine, theirs, length, theirName) {
    const W = 300, H = 120, L = 22, B = 16, T = 6;
    const top = Math.max(mine.length, theirs.length, 1);
    const x = (s) => L + (Math.min(s, length) / length) * (W - L - 4);
    const y = (n) => H - B - (n / top) * (H - B - T);
    const steps = (marks) => `M${x(0)} ${y(0)}` + marks.map((s, i) => ` H${x(s).toFixed(1)} V${y(i + 1).toFixed(1)}`).join("") + ` H${x(length)}`;
    const el = document.createElement("div");
    el.className = "duel-chart";
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("시간에 따른 맞힌 개수")}">
      <line x1="${L}" y1="${y(0)}" x2="${W - 4}" y2="${y(0)}" class="axis"/><line x1="${L}" y1="${T}" x2="${L}" y2="${y(0)}" class="axis"/>
      <line x1="${x(length / 2)}" y1="${T}" x2="${x(length / 2)}" y2="${y(0)}" class="half"/>
      <text x="${L - 4}" y="${y(top) + 4}" class="tick end">${top}</text><text x="${L - 4}" y="${y(0) + 3}" class="tick end">0</text>
      <text x="${x(length / 2)}" y="${H - 3}" class="tick mid">${clockText((length / 2) * 1000)}</text><text x="${W - 4}" y="${H - 3}" class="tick end">${clockText(length * 1000)}</text>
      <path d="${steps(theirs)}" class="them"/><path d="${steps(mine)}" class="me"/></svg>
      <div class="legend"><span class="me">${t("나")} ${mine.length}</span><span class="them">${theirName} ${theirs.length}</span></div>`;
    // Where it was decided: the first half against the second.
    const half = (marks, late) => marks.filter((s) => (s > length / 2) === late).length;
    const note = document.createElement("p");
    note.className = "small muted";
    note.textContent = t("전반 {a} : {b} · 후반 {c} : {d}", { a: half(mine, false), b: half(theirs, false), c: half(mine, true), d: half(theirs, true) });
    el.append(note);
    return el;
  }
  function detailView() {
    const r = state.duel.row;
    const win = r.my_score > r.their_score, draw = r.my_score === r.their_score;
    const gap = Math.abs(r.my_score - r.their_score);
    const mine = r.my_marks || [], theirs = r.their_marks || [];
    const when = new Date(r.finished_at || r.created_at).toLocaleDateString(c.locale(), { month: "long", day: "numeric" });
    return [
      h("div", { class: "page-head" },
        h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: close }, "←"),
        h("h2", { class: "page-title" }, t("대결 결과"))),
      h("div", { class: `duel-result detail ${win ? "win" : draw ? "draw" : "lose"}` },
        h("div", { class: "duel-title" }, win ? t("승리!") : draw ? t("무승부!") : t("아쉬워요!")),
        h("div", { class: "versus" },
          h("div", { class: "side me" }, face(mine(r.my_character), win || draw ? "cheer" : "comfort"), h("em", null, String(r.my_score)), h("b", null, c.displayName())),
          h("div", { class: "vs" }, ":"),
          h("div", { class: "side them" }, face(r.their_character || "bubble", win ? "comfort" : "cheer"), h("em", null, String(r.their_score)), h("b", null, who(r.other)))),
        h("p", { class: "duel-sum" }, win ? t("{n}개 차이로 이겼어요!", { n: gap }) : draw ? t("똑같이 맞혔어요.") : t("{name}이(가) {n}개 더 맞혔어요.", { name: who(r.other), n: gap })),
        h("p", { class: "small muted" }, `${when} · G${r.grade} · ${lengthLabel(r.seconds || 180)}`),
        mine.length || theirs.length
          ? chart(mine, theirs, r.seconds || 180, who(r.other))
          : h("p", { class: "small muted" }, t("이 대결은 진행 기록이 남아 있지 않아요."))),
      h("p", { class: "center act-note" }, h("button", { class: "link", onclick: () => start({ other: r.other }) }, t("이번엔 내가 도전하기"))),
      h("p", { class: "act" }, h("button", { class: "btn wide", onclick: close }, t("확인"))),
    ];
  }

  function close() {
    clearInterval(ticker);
    state.duel = null;
    lastFetch = 0;
    refresh(true);
    c.render();
  }

  // ---------- screens ----------

  // My side of a duel: the character as it is dressed now, unless the duel was played with another one.
  const mine = (played) => (played && played !== c.myShop().character ? played : c.myLook());
  const face = (character, mood, mystery, still) =>
    h("div", { class: `face${mystery ? " mystery" : ""}`, "aria-hidden": "true" }, c.reaction(character, mood, Boolean(still)), mystery && h("i", null, "?"));

  function introView() {
    const d = state.duel;
    return h("div", { class: "duel-intro" },
      h("div", { class: "versus" },
        h("div", { class: "side me" }, face(c.myLook(), "cheer"), h("b", null, c.displayName())),
        h("div", { class: "vs" }, "VS"),
        h("div", { class: "side them" }, face(d.their ? d.their.character : "bubble", "cheer", !d.their), h("b", null, who(d.other)))),
      h("p", { class: "duel-time" }, stopwatch(22), h("b", null, lengthLabel(d.seconds))),
      h("p", { class: "duel-goal" }, d.answering ? t("{n}개를 넘으면 승리!", { n: d.their.score }) : t("{time} 동안 기록을 세워 도전장을 보내요!", { time: lengthLabel(d.seconds) })),
      d.befriend && h("p", { class: "duel-friend" }, d.answering ? t("이 대결을 받으면 {name}와(과) 친구가 돼요.", { name: who(d.other) }) : t("대결을 받으면 자동으로 친구가 돼요.")),
      h("p", { class: "small muted center" }, t("G{g} 권장 단어 · {time} · 틀리면 3초 멈춤", { g: d.grade, time: lengthLabel(d.seconds) })));
  }

  function raceView() {
    const d = state.duel;
    const lane = (id, label, n, character, kind) => h("div", { class: `lane ${kind}` },
      h("span", { class: "lane-name" }, label),
      h("div", { class: "lane-track" },
        d.their && kind === "me" && h("i", { class: "goal", style: `left:${raceAt(d, d.their.score)}`, title: t("목표") }),
        h("div", { class: "runner", id, style: `left:${raceAt(d, n)}` }, c.portrait(character), h("b", null, String(n)))));
    return h("div", { class: "race" },
      d.their && lane("race-them", who(d.other), d.ghost, d.their.character, "them"),
      lane("race-me", t("나"), d.score, c.myLook(), "me"),
      h("p", { class: "race-line", id: "race-line" }, raceLine(d)));
  }

  function playView() {
    const d = state.duel;
    const q = d.questions[d.index % d.questions.length];
    const left = d.endsAt - Date.now();
    const frozen = d.frozenUntil > Date.now();
    const mark = (option) => (!frozen ? "" : option === q.answer ? " ok" : option === d.picked ? " no" : " dim");
    return [
      h("div", { class: "duel-top" },
        h("div", { class: `duel-clock${left < 20000 ? " hurry" : ""}`, id: "duel-clock", role: "timer" }, clockText(left)),
        d.their && h("div", { class: "duel-target" }, t("목표"), h("b", null, String(d.their.score))),
        h("div", { class: "duel-score" }, h("b", null, String(d.score)), h("span", null, t("개")))),
      h("div", { class: "duel-bar", id: "duel-bar" }, h("i", { style: `width:${(left / d.ms) * 100}%` })),
      raceView(),
      h("div", { class: `ch-prompt${q.long ? " long" : ""}` }, q.prompt),
      frozen && h("p", { class: "duel-freeze act-note" }, t("틀렸어요! 잠깐 멈춤"), h("b", { id: "duel-freeze" }, String(Math.ceil((d.frozenUntil - Date.now()) / 1000)))),
      h("div", { class: `choices act${q.options.some((o) => o.length > 9) ? " wide" : ""}` }, q.options.map((option, i) =>
        h("button", { class: `choice${mark(option)}`, disabled: frozen, onclick: () => pick(option) },
          h("span", { class: "num" }, String(i + 1)), option))),
      h("p", { class: "center act-note" }, d.answering
        ? h("button", { class: "link", onclick: finish }, t("여기까지 하기"))
        : h("button", { class: "link", onclick: cancel }, t("포기하기 (도전장을 보내지 않아요)"))),
    ];
  }

  function resultView() {
    const d = state.duel;
    const done = h("p", { class: "act" }, h("button", { class: "btn wide", onclick: close }, t("확인")));
    if (d.error) {
      return [h("div", { class: "duel-result" }, h("div", { class: "duel-title" }, t("대결을 저장하지 못했어요")), h("p", { class: "muted" }, d.error)), done];
    }
    if (!d.answering) {
      return [
        h("div", { class: "duel-result" },
          h("div", { class: "duel-title" }, t("도전장을 보냈어요!")),
          h("div", { class: "versus sent" },
            h("div", { class: "side me" }, face(c.myLook(), "cheer"), h("b", null, t("내 기록 {n}개", { n: d.score }))),
            h("div", { class: "letter", "aria-hidden": "true" }, "✉"),
            h("div", { class: "side them" }, face("bubble", "cheer", true), h("b", null, who(d.other)))),
          h("p", { class: "muted" }, t("{name}이(가) 7일 안에 도전을 받으면 결과를 알려 드릴게요.", { name: who(d.other) })),
          d.befriend && h("p", { class: "small muted" }, t("대결을 받으면 자동으로 친구가 돼요."))),
        done,
      ];
    }
    const win = d.score > d.their.score;
    const draw = d.score === d.their.score;
    return [
      h("div", { class: `duel-result ${win ? "win" : draw ? "draw" : "lose"}` },
        h("div", { class: "duel-title" }, win ? t("승리!") : draw ? t("무승부!") : t("아쉬워요!")),
        h("div", { class: "versus" },
          h("div", { class: "side me" }, face(c.myLook(), win || draw ? "cheer" : "comfort"), h("em", null, String(d.score)), h("b", null, c.displayName())),
          h("div", { class: "vs" }, ":"),
          h("div", { class: "side them" }, face(d.their.character, win ? "comfort" : "cheer"), h("em", null, String(d.their.score)), h("b", null, who(d.other)))),
        (d.marks.length > 0 || d.their.marks.length > 0) && chart(d.marks, d.their.marks, d.seconds, who(d.other)),
        h("div", { class: "settle" },
          h("div", null, h("span", null, t("사용")), h("b", null, `-${d.fee}`)),
          h("div", null, h("span", null, t("획득")), h("b", null, `+${d.won}`)))),
      h("p", { class: "center act-note" }, h("button", { class: "link", onclick: () => start({ other: d.other }) }, t("이번엔 내가 도전하기"))),
      done,
    ];
  }

  function view() {
    const d = state.duel;
    if (d.mode === "pick") return pickView();
    if (d.mode === "time") return timeView();
    if (d.mode === "detail") return detailView();
    if (d.mode === "intro") return introView();
    if (d.mode === "play") return playView();
    if (d.mode === "saving") return h("div", { class: "empty" }, t("기록을 보내는 중…"));
    return resultView();
  }

  return { refresh, badge, banner, home, view, stop, openTab, start, desk };
}
