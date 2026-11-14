import { api, DEMO } from "./api.js";
import { STORE_URL } from "./config.js";
import { t, getLang, setLang, hasChosenLang, locale, LANGS } from "./i18n.js";
import { THEMES, BACKGROUNDS, DEFAULT_SHOP, applyShop, themeColor } from "./shop.js";
import { cleanEntry } from "./clean.js";
import { mascot, portrait, reaction } from "./mascot.js";
import { CHARACTERS } from "./characters.js";
import { logoIcon, wordmark } from "./logo.js";
import { CHARACTER_LINES } from "./character-lines.js";
import { initDuel } from "./duel.js";
import { initFriends } from "./friends.js";
import { SIGNATURES } from "./signatures.js";
import { WORD_LISTS } from "./wordlists.js";
import { WORD_DEFS } from "./worddefs.js";
import { buildQuizSet, makeQuestions, applyAnswer, isCorrect, spellingDiff, MASTER_STREAK } from "./quiz.js";

const app = document.getElementById("app");

// Tiny element builder. Text always goes in as text nodes, never as HTML.
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else if (key === "class") el.className = value;
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }
  el.append(...kids.flat(Infinity).filter((kid) => kid != null && kid !== false));
  return el;
}

// Static line icons (fixed markup, no user data).
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  words: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5.5"/>',
  rank: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  friends: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.2a5 5 0 0 1 4.5 5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};
function icon(name) {
  const el = document.createElement("span");
  el.className = "ico";
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  return el;
}

const state = {
  user: api.getUser(),
  words: [],
  tab: "search", // search | words | quiz
  query: "",
  busy: false,
  notice: null, // { text, suggestion? }
  entry: null, // the word shown on the search tab
  filter: "all", // all | favorites | review
  wordLang: "recent", // which part of the word list is showing: recent (both languages) | en | ko
  scope: { type: "days", days: 7 },
  quiz: null, // { cards, index, phase: "ask" | "result", typed, correct, results }
  hidden: {}, // term_norm -> Set of section names picked to start covered
  revealed: {}, // term_norm -> Set of uncovered section names
  greeting: Math.random(), // picks which hello the home screen shows
  focus: null, // id of the element to focus after the next render
};

const ERRORS = () => ({
  daily_limit: t("오늘 새로 찾을 수 있는 단어 수를 모두 썼어요. 내일 다시 찾아 주세요."),
  invalid_term: t("한글이나 영어 단어(40자 이내)만 찾을 수 있어요."),
  refused: t("이 단어는 설명을 만들 수 없어요."),
  busy: t("지금 사용자가 많아요. 잠시 후 다시 시도해 주세요."),
  invite_required: t("초대 코드로 가입한 뒤에 쓸 수 있어요."),
  search_limit: t("오늘 검색을 모두 썼어요. 내일 다시 만나요! 플러스는 무제한으로 찾을 수 있어요."),
});

async function fail(err) {
  console.error(err);
  if (err?.status === 401) {
    await api.signOut();
    state.user = null;
    state.notice = null;
  } else {
    state.notice = { text: ERRORS()[err?.code] || t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.") };
  }
}

// ---------- actions ----------

// A page that shows the app inside itself (the try-out on the home page) can open it at a given
// place: ?tab=words|quiz|rank, ?mode=review|streak|duel, ?q=a word to look up. Read once.
let startAt = new URLSearchParams(location.search);
function openAtStart() {
  const at = startAt;
  startAt = null;
  if (!at || !state.user?.grade) return;
  if (["review", "streak", "duel"].includes(at.get("mode"))) state.quizMode = at.get("mode");
  const tab = at.get("tab");
  if (tab === "rank") return openRankings();
  if (["words", "quiz"].includes(tab)) { state.tab = tab; render(); }
  if (at.get("q")) search(at.get("q").slice(0, 40));
}

async function loadWords() {
  try {
    state.words = (await api.listWords()).map((word) => ({ ...word, content: cleanEntry(word.content) }));
  } catch (err) {
    await fail(err);
  }
  render();
  openAtStart();
  if (state.user?.grade) {
    loadPlan();
    duel().refresh(true); // challenges received, and what finished duels paid
    friends().refresh(true); // friend requests received
  }
}

// ----- free and Plus -----
// Free students search a set number of different words a day; Plus students search without limit,
// see each character's own trick, and get a present on the home screen every day.
// Plus is switched on with a coupon (Settings). state.plan: { plus, until, off } - off means the
// database part (0007_plus.sql) is not installed, so there is no limit and no Plus to show.
const FREE_SEARCHES = 20; // keep in step with FREE_DAILY_SEARCHES of the lookup function
const PLUS_GIFT = 20; // points in the daily present
const planKey = () => `wb_plan_${state.user.id}`;
const isPlus = () => Boolean(state.plan?.plus && state.plan.until && new Date(state.plan.until) > new Date());
const plansOn = () => Boolean(state.plan && !state.plan.off);
async function loadPlan() {
  if (!state.user) return;
  state.plan = JSON.parse(localStorage.getItem(planKey()) || "null") || state.plan;
  try {
    state.plan = await api.myPlan();
  } catch (err) {
    if (err?.status === 404) state.plan = { plus: false, until: null, off: true };
    else console.error(err);
  }
  if (state.plan) localStorage.setItem(planKey(), JSON.stringify(state.plan));
  render();
}
// Different words searched today, and whether a free student has used them all.
const searchedToday = () => state.words.filter((w) => dayOf(w.last_searched_at) === dayOf(new Date())).length;
const searchesLeft = () => Math.max(0, FREE_SEARCHES - searchedToday());
const limitReached = () => plansOn() && !isPlus() && searchesLeft() === 0;

// The daily present of Plus: taken by tapping the character while it holds it.
const giftWaiting = () => isPlus() && state.user.gift?.day !== dayOf(new Date());
function takeDailyGift() {
  state.user.gift = { day: dayOf(new Date()) };
  api.saveProfile({ gift: state.user.gift }).catch(console.error);
  award(PLUS_GIFT, t("오늘의 플러스 선물"), true);
  return t("선물이야! 내일 또 줄게");
}

async function redeemCoupon(code) {
  if (!code || state.busy) return;
  state.busy = true;
  state.notice = null;
  render();
  try {
    state.plan = await api.redeemCoupon(code);
    localStorage.setItem(planKey(), JSON.stringify(state.plan));
    state.plusOpen = false;
    celebrate(0, t("플러스 시작!"), "PLUS");
  } catch (err) {
    console.error(err);
    if (err?.status === 401) { state.busy = false; await fail(err); return render(); }
    state.notice = { text: {
      coupon_invalid: t("없는 쿠폰 코드예요. 다시 확인해 주세요."),
      coupon_used: t("이미 사용한 쿠폰이에요."),
      coupon_empty: t("이 쿠폰은 모두 사용됐어요."),
      coupon_expired: t("기간이 지난 쿠폰이에요."),
    }[err?.code] || (err?.status === 404 ? t("플러스를 쓰려면 Supabase SQL Editor에서 0007_plus.sql을 한 번 실행해야 해요.") : t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.")) };
  }
  state.busy = false;
  render();
}

function plusSection() {
  const perks = [
    t("단어 검색 무제한 (무료는 하루 {n}개)", { n: FREE_SEARCHES }),
    t("캐릭터마다 다른 전용 애니메이션"),
    t("매일 메인 화면에서 캐릭터가 주는 선물 +{n}포인트", { n: PLUS_GIFT }),
  ];
  const until = state.plan?.until ? new Date(state.plan.until) : null;
  return h("section", { class: `block plus${isPlus() ? " on" : ""}` },
    h("h3", null, t("VOQUIZ 플러스"), isPlus() && h("em", { class: "plus-badge" }, "PLUS")),
    isPlus() && h("p", { class: "plus-until" }, until && until.getFullYear() - new Date().getFullYear() > 50
      ? t("플러스를 기한 없이 사용 중이에요.")
      : t("{date}까지 플러스를 사용해요.", { date: until.toLocaleDateString(locale(), { year: "numeric", month: "long", day: "numeric" }) })),
    h("ul", { class: "perks" }, perks.map((perk) => h("li", null, perk))),
    state.plusOpen
      ? [h("form", { class: "row", style: "margin-top:12px", onsubmit: (e) => { e.preventDefault(); redeemCoupon(document.getElementById("coupon").value.trim()); } },
           h("input", { type: "text", id: "coupon", maxLength: 40, autocomplete: "off", autocapitalize: "characters", spellcheck: false, placeholder: t("쿠폰 코드"), "aria-label": t("쿠폰 코드"), style: "flex:1" }),
           h("button", { class: "btn", disabled: state.busy }, t("적용"))),
         h("p", { class: "small muted hint" }, t("쿠폰 하나는 한 달 사용권이에요. 플러스를 쓰는 중에 넣으면 한 달이 더해져요."))]
      : h("p", { style: "margin-top:12px" },
          h("button", { class: `btn wide${isPlus() ? " ghost" : ""}`, onclick: () => { state.plusOpen = true; state.notice = null; state.focus = "coupon"; render(); } },
            isPlus() ? t("쿠폰으로 한 달 더하기") : t("플러스 전환하기"))));
}

// ----- invite only -----
// VOQUIZ is used by invitation. A student who has just signed in and is not a member yet sees one
// screen: enter a friend's invite code. state.member: undefined = not known yet, true, false.
const memberKey = () => `wb_member_${state.user.id}`;
async function checkMember() {
  if (!state.user) return;
  if (localStorage.getItem(memberKey())) { state.member = true; return; }
  state.member = undefined;
  try {
    state.member = Boolean(await api.isMember());
  } catch (err) {
    // 404: the database part is not installed, so nobody is kept out. Any other trouble: let the
    // student in for now (the server still refuses to look words up for non-members).
    console.error(err);
    if (err?.status === 401) return fail(err).then(render);
    state.member = true;
    return render();
  }
  if (state.member) localStorage.setItem(memberKey(), "1");
  render();
}

async function joinWithCode(code) {
  if (!code || state.busy) return;
  state.busy = true;
  state.notice = null;
  render();
  try {
    const inviter = await api.useInvite(code);
    state.member = true;
    localStorage.setItem(memberKey(), "1");
    toastText(t("{name}의 초대로 가입했어요. 둘은 이제 친구예요!", { name: nameOf(inviter.nickname, inviter.tag) }));
  } catch (err) {
    console.error(err);
    if (err?.status === 401) { state.busy = false; await fail(err); return render(); }
    state.notice = { text: {
      invite_invalid: t("없는 초대 코드예요. 다시 확인해 주세요."),
      invite_used: t("이미 다른 친구가 쓴 초대 코드예요."),
      invite_self: t("내 초대 코드는 내가 쓸 수 없어요."),
      invite_once: t("초대 코드는 한 번만 입력할 수 있어요."),
    }[err?.code] || t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.") };
  }
  state.busy = false;
  render();
  if (state.member && state.user?.grade) loadWords();
}

function inviteGate() {
  return h("div", { class: "step splash" },
    h("div", { class: "big-logo art", "aria-hidden": "true" }, logoIcon(76)),
    h("h1", null, t("초대 코드가 필요해요")),
    h("p", null, t("VOQUIZ는 초대받은 친구만 쓸 수 있어요. 친구에게 받은 초대 코드를 입력해 주세요.")),
    h("form", { class: "row gate", onsubmit: (e) => { e.preventDefault(); joinWithCode(document.getElementById("gate-code").value.trim()); } },
      h("input", { type: "text", id: "gate-code", maxLength: 8, autocomplete: "off", autocapitalize: "characters", spellcheck: false, placeholder: t("초대 코드 6자리"), "aria-label": t("초대 코드 6자리") }),
      h("button", { class: "btn", disabled: state.busy }, t("가입하기"))),
    noticeBox(),
    h("p", { class: "small muted" }, t("VOQUIZ를 쓰는 친구의 친구 페이지에 초대 코드가 5장씩 있어요.")),
    h("p", null, h("button", { class: "link", onclick: signOut }, t("다른 계정으로 로그인"))));
}

async function signIn() {
  state.busy = true;
  state.notice = null;
  render();
  try {
    state.user = await api.signIn();
  } catch (err) {
    console.error(err);
    state.notice = { text: t("로그인하지 못했어요. 다시 시도해 주세요.") };
  }
  state.busy = false;
  render();
  await checkMember();
  if (state.member && state.user?.grade) loadWords();
}

// Deletes the account and everything that belongs to it, after the student has typed the word.
async function leave(typed) {
  if (state.busy) return;
  if (![t("탈퇴"), "탈퇴", "DELETE", "delete"].includes(typed)) {
    state.notice = { text: t("“탈퇴”라고 정확히 써 주세요.") };
    return render();
  }
  state.busy = true;
  state.notice = null;
  render();
  try {
    const id = state.user.id;
    await api.deleteAccount();
    for (const key of Object.keys(localStorage)) if (key.endsWith(`_${id}`)) localStorage.removeItem(key);
    Object.assign(state, { user: null, words: [], entry: null, quiz: null, challenge: null, duel: null, duels: null, friends: null, invites: undefined, plan: null, leaving: false, tab: "search", busy: false });
    render();
    toastText(t("탈퇴했어요. 그동안 고마웠어요!"));
    return;
  } catch (err) {
    console.error(err);
    state.notice = { text: err?.status === 404
      ? t("탈퇴 기능을 쓰려면 Supabase SQL Editor에서 0008_duel_options_and_leaving.sql을 한 번 실행해야 해요.")
      : t("탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.") };
  }
  state.busy = false;
  render();
}

async function signOut() {
  await api.signOut();
  Object.assign(state, { user: null, words: [], entry: null, quiz: null, notice: null, query: "" });
  render();
}

async function chooseGrade(grade) {
  const typedName = document.getElementById("first-name")?.value || "";
  try {
    const first = !state.user.grade;
    state.user = await api.setGrade(grade);
    if (first && typedName.trim()) await saveName(typedName);
    if (first) return loadWords();
  } catch (err) {
    await fail(err);
  }
  render();
}

// Choosing a name is free the first time. After that each change costs points, and the price
// doubles every time (50, 100, 200, ...), so a name is something to settle on, not to keep flipping.
const NAME_BASE_COST = 50;
function nameCost() {
  const changes = state.user.nameChanges || 0;
  if (!state.user.nickname && !changes) return 0;
  return NAME_BASE_COST * 2 ** Math.min(changes, 7);
}

// Returns true when the name was saved.
async function saveName(name) {
  name = name.trim().slice(0, 20);
  if (name === (state.user.nickname || "")) return true; // nothing to change, nothing to pay
  const cost = nameCost();
  if ((state.user.points || 0) < cost) return false;
  const nameChanges = (state.user.nameChanges || 0) + (cost > 0 ? 1 : 0);
  try {
    await api.saveProfile({ nickname: name, nameChanges });
    Object.assign(state.user, { nickname: name, nameChanges });
    if (cost > 0) award(-cost, t("이름 변경")); // also saves the new balance and updates the rankings
    else publishRank();
    return true;
  } catch (err) {
    await fail(err);
    return false;
  }
}

// No name yet? Use a temporary one that stays the same for this account, like "탐험가 482".
function myTag() {
  let hash = 0;
  for (const ch of state.user.id || "") hash = (hash * 31 + ch.charCodeAt(0)) % 900;
  return 100 + hash;
}
const nameOf = (nickname, tag) => nickname || `${t("탐험가")} ${tag}`;
const displayName = () => nameOf(state.user.nickname, myTag());

// Keeps this student's line on the rankings up to date. Best effort: the app works without it.
function publishRank() {
  if (!state.user) return;
  api.publishRank({
    nickname: state.user.nickname || "", tag: myTag(), points: state.user.points || 0,
    grade: state.user.grade || null, best_streak: state.user.challenge?.best || 0,
  }).catch(() => {});
}

// A different hello each time the home screen opens.
const GREETINGS = () => [
  t("안녕, {name}! 오늘은 어떤 단어를 만나 볼까?"),
  t("{name}, 다시 만나서 반가워!"),
  t("좋은 하루야, {name}! 새 단어 하나 찾아볼까?"),
  t("{name}, 오늘도 단어 모험 출발!"),
  t("어서 와, {name}! 궁금한 단어가 있어?"),
  t("{name}, 오늘의 첫 단어는 뭘까?"),
  t("{name}, 준비됐어? 단어 사냥을 시작하자!"),
  t("반가워, {name}! 한 단어씩 천천히 가 보자."),
];
// The greeting is shown on two lines, split where a person would pause: after the first
// exclamation or question ("안녕, 도은! / 오늘은 …"), or else after the first comma ("도은, / 다시 만나서 반가워!").
function greeting() {
  const list = GREETINGS();
  const text = list[Math.floor(state.greeting * list.length)].replaceAll("{name}", displayName());
  const parts = text.match(/^(.*?[!?！？])\s*(\S.*)$/s) || text.match(/^(.*?[,，])\s*(\S.*)$/s);
  return parts ? `${parts[1]}\n${parts[2]}` : text;
}

async function search(term) {
  term = term.trim();
  if (!term || state.busy) return;
  if (limitReached()) {
    const again = state.words.find((w) => dayOf(w.last_searched_at) === dayOf(new Date()) && [w.headword, w.term_norm, w.content?.counterpart].some((x) => (x || "").toLowerCase() === term.toLowerCase()));
    Object.assign(state, { tab: "search", query: term, entry: again || null, notice: again ? null : { text: ERRORS().search_limit } });
    return render();
  }
  Object.assign(state, { tab: "search", query: term, busy: true, notice: null, entry: null });
  render();
  try {
    state.live = null;
    const result = await api.lookup(term, showPartial);
    if (result.word) result.word.content = cleanEntry(result.word.content);
    if (result.valid) {
      const before = state.words.find((w) => w.term_norm === result.word.term_norm);
      const firstToday = !before || dayOf(before.last_searched_at) !== dayOf(new Date());
      state.words = [result.word, ...state.words.filter((w) => w.term_norm !== result.word.term_norm)];
      state.entry = result.word;
      if (firstToday) awardSearch();
      // Nobody had looked this word up before: it goes down as this student's discovery.
      if (result.discovered) setTimeout(() => award(DISCOVERY_POINTS, t("처음 발견한 단어!"), true), firstToday ? 1300 : 0);
    } else {
      state.notice = { text: t('"{term}"은(는) 사전에서 찾지 못했어요.', { term }), suggestion: result.content?.suggestion };
    }
  } catch (err) {
    await fail(err);
  }
  state.busy = false;
  render();
}

async function patchWord(word, patch) {
  Object.assign(word, patch);
  render();
  try {
    await api.updateWord(word.term_norm, patch);
  } catch (err) {
    await fail(err);
    render();
  }
}

async function removeWord(word) {
  state.words = state.words.filter((w) => w !== word);
  if (state.entry === word) state.entry = null;
  render();
  try {
    await api.deleteWord(word.term_norm);
  } catch (err) {
    await fail(err);
    render();
  }
}

// A quiz is a small bet: it costs QUIZ_FEE points per question to enter. Right answers pay 5 to 10
// each (plus bonuses), so a good run wins back more than it cost, and a run with every answer wrong
// wins nothing. A student who cannot afford the full fee pays what they have, so nobody is locked out.
const QUIZ_FEE = 3;
const quizFee = (questions) => Math.min(questions * QUIZ_FEE, state.user.points || 0);

// The most a quiz of this size can pay: every answer right (typed 10, picked 5) plus the all-correct bonus.
// Lucky bonuses come on top. Mirrors makeQuestions: kinds alternate starting with a typed question.
function quizMax(questions) {
  const mixed = state.words.length >= 4;
  const typed = mixed ? Math.ceil(questions / 2) : questions;
  return typed * 10 + (questions - typed) * 5 + (questions >= 3 ? 20 : 0);
}

// Each quiz question has a time limit. When it runs out the question counts as not known.
const QUESTION_MS = 10000;
let questionTimer = 0;
function startQuestionTimer() {
  clearTimeout(questionTimer);
  const quiz = state.quiz;
  if (!quiz || quiz.index >= quiz.cards.length) return;
  const index = quiz.index;
  quiz.deadline = Date.now() + QUESTION_MS;
  questionTimer = setTimeout(() => {
    if (state.quiz !== quiz || quiz.index !== index || quiz.phase !== "ask") return;
    quiz.timedOut = true;
    submitAnswer("");
    render();
  }, QUESTION_MS);
}

function startQuiz() {
  const cards = buildQuizSet(state.words, state.scope);
  if (!cards.length) return;
  const fee = quizFee(cards.length);
  award(-fee, t("퀴즈에 사용"));
  // Each card becomes a typed question or a multiple-choice one, mixed at random.
  const questions = makeQuestions(cards, state.words);
  state.quiz = { cards, questions, fee, index: 0, phase: "ask", typed: "", correct: false, results: [] };
  state.focus = "answer";
  startQuestionTimer();
  render();
}

// Check the answer (typed text, or the word picked from the choices), show the result right away,
// and save the progress.
function submitAnswer(typed, picked) {
  const quiz = state.quiz;
  clearTimeout(questionTimer);
  const word = quiz.cards[quiz.index];
  const correct = picked ? picked === word : isCorrect(typed, word.content);
  // Typing the word is harder than picking it, so it earns more. A lucky bonus drops now and then.
  const lucky = correct && Math.random() < 0.25;
  let earned = 0;
  if (correct) earned = (picked ? 5 : 10) + (lucky ? randomInt(1, 10) : 0);
  const last = quiz.index + 1 >= quiz.cards.length;
  const perfect = last && correct && quiz.results.every((r) => r.correct) && quiz.cards.length >= 3;
  if (perfect) earned += 20;
  Object.assign(quiz, { phase: "result", typed: typed.trim(), correct, perfect, earned: (quiz.earned || 0) + earned });
  quiz.results.push({ word, correct });
  state.focus = "next";
  award(earned, perfect ? t("전부 정답!") : lucky ? t("럭키 보너스!") : null, perfect || lucky);
  // A right answer moves on by itself; a wrong one waits, so there is time to read the correction.
  // (Set before the redraw below, so the button shows its countdown.)
  if (correct) startAutoNext();
  else state.quiz.auto = false;
  patchWord(word, applyAnswer(word, correct));
}

// After a right answer the quiz moves on by itself. Tapping the result card stops the countdown;
// the button then waits to be pressed, as it always does after a wrong answer.
const AUTO_NEXT_MS = 3000;
let autoNext = 0;
function startAutoNext() {
  clearTimeout(autoNext);
  state.quiz.auto = true;
  autoNext = setTimeout(() => {
    if (state.quiz?.phase === "result" && state.quiz.auto && state.tab === "quiz") nextCard();
  }, AUTO_NEXT_MS);
}
function stopAutoNext() {
  clearTimeout(autoNext);
  if (!state.quiz?.auto) return;
  state.quiz.auto = false;
  document.getElementById("next")?.classList.remove("auto");
  document.getElementById("auto-hint")?.remove();
}

function nextCard() {
  clearTimeout(autoNext);
  Object.assign(state.quiz, { index: state.quiz.index + 1, phase: "ask", typed: "", correct: false, timedOut: false });
  startQuestionTimer();
  const { results, cards, index } = state.quiz;
  if (index >= cards.length && results.filter((r) => r.correct).length / results.length >= 0.8) setTimeout(happyMoment, 1200);
  state.focus = "answer";
  render();
}

// ---------- word points ----------
// Points are just for fun: a random bonus now and then while exploring a word, and a reward per quiz answer.

let saveTimer = null;
function award(points, label, big) {
  if (!points || !state.user) return;
  state.user.points = (state.user.points || 0) + points;
  (big ? celebrate : toast)(points, label || t("단어포인트"));
  countUp(points);
  saveSoon();
}
function saveSoon() {
  clearTimeout(saveTimer); // several changes in a row become one save
  saveTimer = setTimeout(() => {
    api.saveProfile({ points: state.user.points, search: state.user.search, shop: state.user.shop, challenge: state.user.challenge }).catch(console.error);
    publishRank();
  }, 1500);
}

// Points being used: the score shakes and coins fall out of it.
function spendFx(points) {
  const pill = document.getElementById("points");
  if (!points || !pill) return;
  const box = pill.getBoundingClientRect();
  pill.classList.remove("spent");
  void pill.offsetWidth;
  pill.classList.add("spent");
  const coins = Array.from({ length: Math.min(6, Math.max(3, Math.round(points / 4))) }, (_, i) =>
    h("i", { style: `--dx:${Math.round((Math.random() * 2 - 1) * 40)}px;--dy:${80 + Math.round(Math.random() * 60)}px;animation-delay:${i * 70}ms` }));
  const el = h("div", { class: "spend", "aria-hidden": "true", style: `left:${box.left + 16}px;top:${box.bottom - 8}px` }, coins);
  document.body.append(el);
  setTimeout(() => el.remove(), 1700);
}

// Searching earns points too: SEARCH_POINTS for each word looked up for the first time that day,
// until the day's total reaches SEARCH_DAILY_MAX.
const DISCOVERY_POINTS = 10;
const SEARCH_POINTS = 5;
const SEARCH_DAILY_MAX = 100;
const dayOf = (when) => new Date(when).toLocaleDateString("sv"); // local date as YYYY-MM-DD

function searchPointsToday() {
  const search = state.user?.search;
  return search?.day === dayOf(new Date()) ? search.points : 0;
}

function awardSearch() {
  const sofar = searchPointsToday();
  const add = Math.min(SEARCH_POINTS, SEARCH_DAILY_MAX - sofar);
  if (add <= 0) return;
  state.user.search = { day: dayOf(new Date()), points: sofar + add };
  const total = sofar + add;
  const reached = total >= SEARCH_DAILY_MAX;
  const halfway = sofar < SEARCH_DAILY_MAX / 2 && total >= SEARCH_DAILY_MAX / 2;
  award(add, reached ? t("오늘 검색 포인트 달성!") : halfway ? t("벌써 절반!") : t("검색 포인트"), reached || halfway);
  if (reached) setTimeout(happyMoment, 2600);
}

// Today's search goal, shown right under the search bar.
function dailyGoal() {
  const got = searchPointsToday();
  const done = got >= SEARCH_DAILY_MAX;
  return h("div", { class: `daily${done ? " done" : ""}` },
    h("div", { class: "daily-label" }, h("span", null, t("오늘 검색 포인트"), isPlus() && h("em", { class: "plus-badge" }, "PLUS")), h("b", null, `${got} / ${SEARCH_DAILY_MAX}`)),
    h("div", { class: "bar" }, h("i", { style: `width:${(got / SEARCH_DAILY_MAX) * 100}%` })),
    // One short line. How many searches are left is the character's to say, so it is not repeated here.
    h("div", { class: "daily-hint" }, done
      ? (isPlus() ? t("오늘 검색 포인트를 다 모았어요. 단어는 계속 찾을 수 있어요.") : t("오늘 검색 포인트를 다 모았어요. 내일 또 만나요!"))
      : t("단어를 찾을 때마다 +{p}점", { p: SEARCH_POINTS })));
}

// Every change to the score is shown in one place: right under the score in the header.
// Points earned rise into the score (green, +N); points used drop out of it (red, -N, with coins).
function toast(points, label) {
  const pill = document.getElementById("points");
  if (!pill) return;
  const box = pill.getBoundingClientRect();
  let lane = document.getElementById("point-lane");
  if (!lane) document.body.append((lane = h("div", { id: "point-lane", "aria-live": "polite" })));
  lane.style.top = `${box.bottom + 6}px`;
  lane.style.right = `${Math.max(8, window.innerWidth - box.right)}px`;
  const spent = points < 0;
  const el = h("div", { class: `pt-chip ${spent ? "spend" : "gain"}` },
    h("i", { "aria-hidden": "true" }), h("b", null, `${spent ? "" : "+"}${points}`), h("span", null, label));
  lane.append(el);
  setTimeout(() => el.remove(), 2300);
  // After the screen has been redrawn (starting a quiz redraws the header), so the effect is not lost.
  if (spent) setTimeout(() => spendFx(-points), 30);
}

// The big moment: a coin pops in the middle with a ring and sparks, then flies up to the score.
const SPARKS = ["#bbd86b", "#655f9f", "#23552b", "#a9a4d4"];
function celebrate(points, label, text = `+${points}`) {
  const sparks = Array.from({ length: 18 }, (_, i) => h("i", {
    style: `--a:${i * 20}deg;--d:${60 + Math.random() * 60}px;--c:${SPARKS[i % SPARKS.length]};animation-delay:${Math.random() * 0.12}s`,
  }));
  const el = h("div", { class: "celebrate", role: "status" },
    h("div", { class: "burst" },
      h("div", { class: "ring" }), h("div", { class: "ring late" }), sparks,
      h("div", { class: "coin" }, h("b", null, text), h("span", null, label))),
    state.user && reaction(myShop().character, "cheer"));
  document.body.append(el);
  setTimeout(() => el.remove(), 2000);
}

// The score in the header counts up to its new value instead of jumping.
function countUp(added) {
  const to = state.user.points, from = to - added, start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / 900);
    const number = document.querySelector("#points span");
    if (number) number.textContent = String(Math.round(from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else document.getElementById("points")?.classList.add("bump");
  };
  requestAnimationFrame(step);
}

const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Uncover one hidden section of a word. Sometimes a lucky bonus drops.
function reveal(word, name) {
  (state.revealed[word.term_norm] ??= new Set()).add(name);
  state.justRevealed = name;
  if (Math.random() < 0.35) award(randomInt(1, 10), t("럭키 보너스!"), true);
  render();
}

// ---------- share / rate prompts ----------
// Shown only at a happy moment (a good quiz, the day's goal reached), never while the student is
// in the middle of something, and never again once dismissed for good.

// Where friends install the extension. The demo uses the store's front page as a stand-in.
const storeUrl = STORE_URL || (DEMO ? "https://chromewebstore.google.com/" : "");
const PROMPTS_KEY = "wb_prompts";
const DAY_MS = 24 * 60 * 60 * 1000;
const SHARE_REWARD = 30;

function promptLog() {
  const log = JSON.parse(localStorage.getItem(PROMPTS_KEY) || "null") || { firstUse: Date.now(), share: {}, rate: {} };
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(log));
  return log;
}
function notePrompt(kind, patch) {
  const log = promptLog();
  log[kind] = { ...log[kind], ...patch };
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(log));
}

// A card that slides up from the bottom, over whatever screen is showing.
function sheet({ art, title, text, actions }) {
  document.getElementById("sheet")?.remove();
  const close = () => el.remove();
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "sheet-art", "aria-hidden": "true" }, art),
      h("h2", null, title),
      h("p", null, text),
      actions.map(({ label, kind, run }) =>
        h("button", { class: kind === "main" ? "btn wide" : "link", onclick: () => { if (run() !== false) close(); } }, label))));
  document.body.append(el);
  el.querySelector("button")?.focus();
}

async function copyInvite() {
  const message = `${t("단어가 쉬워지는 VOQUIZ, 같이 써 보자!")} ${storeUrl}`;
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    return toastText(t("복사하지 못했어요. 다시 눌러 주세요."));
  }
  notePrompt("share", { shared: true });
  // A one-time thank-you for inviting a friend.
  if (!promptLog().share.rewarded) {
    notePrompt("share", { rewarded: true });
    award(SHARE_REWARD, t("초대 링크 복사 완료!"), true);
  } else {
    toastText(t("초대 링크를 복사했어요. 친구에게 붙여 넣어 보내세요!"));
  }
}

function toastText(text) {
  let box = document.getElementById("toasts");
  if (!box) document.body.append((box = h("div", { id: "toasts", "aria-live": "polite" })));
  const el = h("div", { class: "toast" }, h("span", null, text));
  box.append(el);
  setTimeout(() => el.remove(), 2600);
}

function sharePrompt() {
  if (!storeUrl) return;
  notePrompt("share", { last: Date.now() });
  sheet({
    art: "💌",
    title: t("친구랑 같이 하면 더 재미있어요"),
    text: t("초대 링크를 보내면 친구도 바로 설치할 수 있어요. 처음 복사하면 {n} 단어포인트를 드려요!", { n: SHARE_REWARD }),
    actions: [
      { label: t("초대 링크 복사하기"), kind: "main", run: () => { copyInvite(); } },
      { label: t("나중에"), run: () => {} },
      { label: t("다시 보지 않기"), run: () => notePrompt("share", { never: true }) },
    ],
  });
}

function ratePrompt() {
  if (!storeUrl) return;
  notePrompt("rate", { last: Date.now() });
  sheet({
    art: "⭐",
    title: t("VOQUIZ가 도움이 되고 있나요?"),
    text: t("별점과 한 줄 평가를 남겨 주면 더 좋은 VOQUIZ를 만드는 데 큰 힘이 돼요."),
    actions: [
      { label: t("평가하러 가기"), kind: "main", run: () => { notePrompt("rate", { done: true }); window.open(`${storeUrl.replace(/\/$/, "")}/reviews`, "_blank", "noopener"); } },
      { label: t("나중에"), run: () => {} },
      { label: t("다시 보지 않기"), run: () => notePrompt("rate", { never: true }) },
    ],
  });
}

// Called after something went well. Shows at most one prompt, and only when it has earned its place:
// the rating prompt after a few days of real use, the share prompt once the student has a small word list.
function happyMoment() {
  if (!storeUrl || document.getElementById("sheet")) return;
  const log = promptLog();
  const now = Date.now();
  const words = state.words.length;
  const rested = (entry, days) => !entry.last || now - entry.last > days * DAY_MS;
  if (!log.rate.never && !log.rate.done && words >= 20 && now - log.firstUse > 3 * DAY_MS && rested(log.rate, 14)) return ratePrompt();
  if (!log.share.never && words >= 8 && rested(log.share, 7)) return sharePrompt();
}

// ---------- helpers ----------

const both = (ko, en) => [ko && h("p", null, ko), en && h("p", { class: "en" }, en)];
// Where a saying comes from. Entries written before this was recorded get a plain guess from the
// text itself: Hangul means a Korean saying, anything else an English one.
function sayingSource(r) {
  const given = getLang() === "ko" ? r.source_ko : r.source_en;
  if (given) return given;
  const korean = /[가-힣]/.test(r.text || "");
  if (r.kind === "four_character_idiom") return t("한자 문화권의 사자성어");
  return korean ? t("한국 속담") : r.kind === "idiom" ? t("영어 관용구") : t("영어 속담");
}
const KIND = () => ({ proverb: t("속담 · Proverb"), idiom: t("관용구 · Idiom"), four_character_idiom: t("사자성어") });
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// The English and Korean word of an entry, whichever one was the headword.
function pair(c) {
  return c.language === "en" ? { en: c.headword, ko: c.counterpart } : { en: c.counterpart, ko: c.headword };
}

// Pieces of the two words to look for inside sentences (Korean verbs drop their ending).
function needles(c) {
  const { en, ko } = pair(c);
  const koStem = ko?.endsWith("하다") ? ko.slice(0, -2) : ko?.endsWith("다") ? ko.slice(0, -1) : ko;
  return [en, koStem].filter((n) => n && n.length > 1).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

// Splits text around the entry's words; `wrap` turns each match into a node.
function around(text, c, wrap) {
  const list = needles(c);
  if (!text || !list.length) return [text];
  return text.split(new RegExp(`(${list.join("|")})`, "i")).map((part, i) => (i % 2 ? wrap(part) : part));
}
const highlight = (text, c) => around(text, c, (part) => h("mark", null, part));
const mask = (text, c) => around(text, c, () => "＿＿＿");

function star(word) {
  return h("button", {
    class: "star",
    "aria-pressed": String(word.favorite),
    "aria-label": word.favorite ? t("즐겨찾기 해제") : t("즐겨찾기"),
    title: word.favorite ? t("즐겨찾기 해제") : t("즐겨찾기"),
    onclick: () => patchWord(word, { favorite: !word.favorite }),
  }, word.favorite ? "★" : "☆");
}

const title = (text, en) => h("h3", null, text, getLang() !== "en" && h("small", null, en));

// ---------- dictionary entry ----------

// "빛 광" → big 광 with its meaning 빛 underneath. The hanja glyph itself is not shown.
function syllableTile(x) {
  const words = (x.hun_eum || "").trim().split(/\s+/);
  const sound = words.length > 1 ? words.pop() : "";
  return h("div", { class: "tile syl" }, h("b", null, sound || words.join(" ")), sound && h("span", null, words.join(" ")), h("small", null, x.meaning_en));
}

// "How the word is built": [photo- 빛] + [synthesis 합성] = photosynthesis, and 光 合 成 = 광합성
function buildBlock(c) {
  const { en, ko } = pair(c);
  const parts = c.word_parts || [];
  const hanja = c.hanja || [];
  if (!parts.length && !hanja.length) return null;
  return h("div", null,
    parts.length > 0 && h("div", { class: "eq" },
      parts.map((p, i) => [
        i > 0 && h("span", { class: "op" }, "+"),
        h("div", { class: "tile" }, h("b", null, p.part), h("span", null, p.meaning_ko), h("small", null, p.meaning_en)),
      ]),
      h("span", { class: "sum" }, h("span", { class: "op" }, "="), h("span", { class: "result" }, en))),
    hanja.length > 0 && h("div", { class: "eq" },
      hanja.map(syllableTile),
      h("span", { class: "sum" }, h("span", { class: "op" }, "="), h("span", { class: "result" }, ko))));
}

// One section of an entry. Until the student taps it, only the title shows and the content is blurred.
function block(word, name, heading, content) {
  if (!content) return null;
  const open = !state.hidden[word.term_norm].has(name) || state.revealed[word.term_norm]?.has(name);
  const fresh = open && state.justRevealed === name;
  return h("section", { class: `block ${name}${open ? "" : " locked"}${fresh ? " fresh" : ""}` },
    heading,
    h("div", { class: "veiled" },
      h("div", { class: "inner", inert: !open, "aria-hidden": open ? null : "true" }, content),
      !open && h("button", { class: "veil", onclick: () => reveal(word, name) }, h("span", null, h("i", { "aria-hidden": "true" }, "✦"), t("눌러서 보기")))));
}

function entryBlocks(word) {
  const c = word.content;
  const sections = [
    // Breaking the word into parts and the memory tip belong together: both are ways to remember it.
    ["easy", title(t("쉽게 기억하기"), "REMEMBER IT"),
      (buildBlock(c) || c.memory_tip_ko || c.memory_tip_en) && [
        buildBlock(c),
        (c.memory_tip_ko || c.memory_tip_en) && h("div", { class: "note tip" }, h("b", null, t("이렇게 기억해요")), both(c.memory_tip_ko, c.memory_tip_en)),
      ]],
    ["story", title(t("어디서 온 말일까?"), "ORIGIN"), (c.origin_ko || c.origin_en) && both(c.origin_ko, c.origin_en)],
    ["ex", title(t("예문"), "EXAMPLES"),
      c.examples?.length > 0 && h("ol", null, c.examples.map((e, i) => h("li", null,
        h("span", { class: "num" }, String(i + 1)),
        h("div", null, h("p", null, highlight(e.ko, c)), h("p", { class: "en" }, highlight(e.en, c))))))],
    ["kin", title(t("비슷한 말 · 반대말"), "SYNONYMS · ANTONYMS"),
      (c.synonyms?.length > 0 || c.antonyms?.length > 0) && h("div", { class: "kin" },
        [[t("비슷한 말"), c.synonyms, "syn"], [t("반대말"), c.antonyms, "ant"]].map(([label, list, kind]) =>
          list?.length > 0 && h("div", { class: `kin-row ${kind}` },
            h("span", { class: "kin-label" }, label),
            h("div", { class: "kin-words" }, list.map((w) =>
              h("button", { class: "kin-word", title: t("이 단어 찾기"), onclick: () => search(c.language === "ko" ? w.ko : w.en) },
                h("b", null, w.en), h("span", null, w.ko)))))))],
    ["say", title(t("속담·사자성어"), "SAYINGS"),
      c.related?.length > 0 && h("ul", null, c.related.map((r) => h("li", null,
        h("span", { class: "tag" }, KIND()[r.kind] || ""),
        h("span", { class: "tag from" }, sayingSource(r)),
        h("p", { class: "saying" }, r.text),
        both(r.meaning_ko, r.meaning_en))))],
  ].filter(([, , content]) => content);

  // A random one to three sections start covered (picked once per word), so there is always
  // something to uncover without hiding the whole entry.
  state.hidden[word.term_norm] ??= new Set(
    sections.map(([name]) => name).sort(() => Math.random() - 0.5).slice(0, randomInt(1, 3)));
  return sections.map(([name, heading, content]) => block(word, name, heading, content));
}

function hero(c, word) {
  return h("section", { class: "hero" },
    word && star(word),
    word?.discovered && h("div", { class: "found-line" }, h("i", { "aria-hidden": "true" }, "✦"), t("내가 처음 발견한 단어")),
    h("h2", null, c.headword),
    h("div", { class: "cp" }, h("small", null, "⇄"), c.counterpart),
    h("div", { class: "meta" }, [c.pronunciation, c.part_of_speech].filter(Boolean).join("  ·  ")),
    h("div", { class: "def" }, h("p", null, c.definition_ko), h("p", null, c.definition_en)));
}

function entryCard(word) {
  return h("article", { class: "entry" },
    hero(word.content, word),
    entryBlocks(word),
    h("div", { class: "card-foot" },
      h("button", { class: "link", onclick: () => removeWord(word) }, t("단어장에서 삭제"))));
}

function noticeBox() {
  const n = state.notice;
  if (!n) return null;
  return h("div", { class: "notice", role: "status" }, n.text,
    n.suggestion && [t(" 혹시 "), h("button", { class: "link", onclick: () => search(n.suggestion) }, n.suggestion), t(" 을(를) 찾으셨나요?")]);
}

// ---------- search tab ----------

const LOADING_STEPS = () => [
  t("사전에서 찾는 중…"),
  t("어디서 온 말인지 살펴보는 중…"),
  t("어근과 한자를 풀이하는 중…"),
  t("기억 팁을 떠올리는 중…"),
  t("예문을 쓰는 중…"),
  t("거의 다 됐어요…"),
];
let loadingTimer = null;

function loadingView() {
  return h("div", { class: "loading", id: "live", role: "status", "aria-live": "polite" },
    h("div", { class: "word", "aria-hidden": "true" },
      [...state.query].map((ch, i) => h("span", { style: `animation-delay:${i * 0.08}s` }, ch))),
    h("div", { class: "dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
    h("div", { class: "msg", id: "loading-msg" }, LOADING_STEPS()[0]),
    h("div", { class: "sub" }, t("처음 찾는 단어는 조금 걸려요. 다음부터는 바로 나와요!")),
    h("div", { class: "bar", "aria-hidden": "true" }, h("i")),
    h("div", { "aria-hidden": "true" }, h("div", { class: "skel" }), h("div", { class: "skel" }), h("div", { class: "skel" })));
}

// ----- a new word, shown while Claude is still writing it -----
// The word, its counterpart and the meaning appear within a couple of seconds; the list underneath
// ticks off each part of the entry as it is finished.
const LIVE_STEPS = () => [
  ["definition_ko", t("뜻")],
  ["hanja_word", t("단어 쪼개 보기")],
  ["origin_ko", t("어디서 온 말일까?")],
  ["memory_tip_ko", t("이렇게 기억해요")],
  ["examples", t("예문")],
  ["related", t("속담·사자성어")],
];

// The live view is built once and then only its text and marks are changed. Rebuilding it for every
// piece that arrives restarted every animation, which made the checklist flash.
function buildLive(box) {
  const el = {
    headword: h("h2", null, state.query),
    counterpart: h("span"),
    cp: h("div", { class: "cp", hidden: true }, h("small", null, "⇄")),
    meta: h("div", { class: "meta" }),
    defKo: h("p"),
    defEn: h("p"),
    def: h("div", { class: "def typing", hidden: true }),
    steps: LIVE_STEPS().map(([key, label]) => {
      const mark = h("i", { "aria-hidden": "true" });
      return { key, mark, row: h("li", null, mark, label) };
    }),
  };
  el.cp.append(el.counterpart);
  el.def.append(el.defKo, el.defEn);
  box.className = "live-box";
  box.replaceChildren(h("div", { class: "live" },
    h("section", { class: "hero" }, el.headword, el.cp, el.meta, el.def),
    h("ul", { class: "steps" }, el.steps.map((step) => step.row)),
    h("div", { class: "bar", "aria-hidden": "true" }, h("i"))));
  return el;
}

function updateLive(el, c) {
  const text = (node, value) => { if (node.textContent !== (value || "")) node.textContent = value || ""; };
  const show = (node, on) => { if (node.hidden === on) node.hidden = !on; };
  text(el.headword, c.headword || state.query);
  text(el.counterpart, c.counterpart);
  show(el.cp, !!c.counterpart);
  text(el.meta, [c.pronunciation, c.part_of_speech].filter(Boolean).join("  ·  "));
  text(el.defKo, c.definition_ko);
  text(el.defEn, c.definition_en);
  show(el.defEn, !!c.definition_en);
  show(el.def, !!(c.definition_ko || c.definition_en));

  const keys = Object.keys(c);
  const reached = el.steps.map((step) => keys.includes(step.key));
  el.steps.forEach((step, i) => {
    const done = reached[i] && reached.slice(i + 1).some(Boolean);
    const state = done ? "done" : reached[i] ? "now" : "";
    if (step.row.className !== state) {
      step.row.className = state;
      step.mark.textContent = done ? "✓" : "";
    }
  });
}

// Called for every piece that arrives; redraws at most about 16 times a second.
// (A timer, not requestAnimationFrame: the browser pauses animation frames while the panel is hidden.)
let liveFrame = 0;
function showPartial(partial) {
  if (!partial || partial.valid === false || !partial.headword) return;
  state.live = cleanEntry(partial);
  if (liveFrame) return;
  liveFrame = setTimeout(() => {
    liveFrame = 0;
    const box = document.getElementById("live");
    if (!box || !state.live) return;
    box.liveParts ??= buildLive(box);
    updateLive(box.liveParts, state.live);
  }, 60);
}

// Steps through the messages while a search is running.
function animateLoading() {
  clearInterval(loadingTimer);
  if (!state.busy || state.tab !== "search" || !state.user) return;
  let step = 0;
  loadingTimer = setInterval(() => {
    const msg = document.getElementById("loading-msg");
    if (!msg) return clearInterval(loadingTimer);
    step = Math.min(step + 1, LOADING_STEPS().length - 1);
    msg.replaceWith(h("div", { class: "msg", id: "loading-msg" }, LOADING_STEPS()[step]));
  }, 2500);
}

// Now and then a tap is rewarded with a point or three, up to a small daily total so that
// tapping stays a treat and does not replace learning. Returns what the mascot says about it.
const GIFT_CHANCE = 0.1;
const GIFT_DAILY_MAX = 20;
function mascotGift() {
  const key = `wb_gift_${state.user.id}`;
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  const today = dayOf(new Date());
  const given = saved?.day === today ? saved.points : 0;
  if (given >= GIFT_DAILY_MAX || Math.random() >= GIFT_CHANCE) return null;
  const gift = Math.min(randomInt(1, 3), GIFT_DAILY_MAX - given);
  localStorage.setItem(key, JSON.stringify({ day: today, points: given + gift }));
  award(gift, t("캐릭터가 준 선물!"));
  return t("선물이야!");
}

const quotaKey = () => `${dayOf(new Date())}:${searchesLeft()}`;
// How many searches are left today, in the character's own words. It says so when the home
// screen opens and again whenever the number has changed, not on every redraw.
function quotaLine() {
  if (!plansOn() || isPlus() || limitReached()) return null;
  const left = searchesLeft();
  if (state.quotaSaid === quotaKey()) return null;
  return left === FREE_SEARCHES ? t("오늘은 단어 {n}개를 찾을 수 있어!", { n: left })
    : left <= 3 ? t("오늘은 {n}번만 더 찾을 수 있어!", { n: left })
    : t("오늘 {n}번 더 찾을 수 있어!", { n: left });
}

function searchHome() {
  const RECENT = 6;
  const recent = state.words.slice(0, RECENT);
  const open = (w) => { Object.assign(state, { entry: w, notice: null }); render(); };
  return h("div", { class: "empty" },
    duel().banner(),
    friends().banner(),
    h("p", { class: "hello" }, greeting()),
    limitReached()
      ? [h("p", { class: "small" }, t("오늘 검색 {n}개를 모두 썼어요. 이미 찾은 단어는 단어장에서 볼 수 있어요.", { n: FREE_SEARCHES })),
         h("p", { class: "small" }, h("button", { class: "link", onclick: () => { state.plusOpen = true; openSettings(); } }, t("플러스로 전환하면 무제한으로 찾을 수 있어요")))]
      : [h("p", { class: "small" }, t("한국어나 영어 단어를 찾아보세요.")),
         h("p", { class: "small" }, t("웹페이지에서 단어를 선택해 우클릭해도 돼요."))],
    mascot({
      character: myShop().character, t, onTap: () => mascotGift() || mascotSuggests(),
      signature: isPlus() ? { pops: SIGNATURES[myShop().character] || ["✦", "♥", "★"], line: CHARACTER_LINES[myShop().character]?.[["ko", "en", "zh"].indexOf(getLang())] || "" } : null,
      gift: giftWaiting(), onGift: takeDailyGift,
      resting: limitReached() ? t("오늘은 여기까지! 내일 또 만나요") : null,
      greet: quotaLine(), onGreet: () => { state.quotaSaid = quotaKey(); }, // marked as said only once it has spoken
    }),
    recent.length > 0
      ? [h("div", { class: "hint" }, t("최근 찾은 단어")),
         h("div", { class: "chips center recent" }, recent.map((w) => h("button", { class: "chip", onclick: () => open(w) }, w.headword))),
         // The rest are in the word list, under its "recent" tab.
         state.words.length > RECENT && h("button", { class: "link more", onclick: () => { Object.assign(state, { tab: "words", wordLang: "recent", filter: "all", entry: null, notice: null }); render(); } },
           t("더보기 ({n})", { n: state.words.length - RECENT }))]
      : [h("div", { class: "hint" }, t("이런 단어는 어때요?")),
         h("div", { class: "chips center" }, ["democracy", "노력", "transport"].map((t) => h("button", { class: "chip", onclick: () => search(t) }, t)))]);
}

// A word to try, from the recommended words of the student's grade (academic ones in the upper
// grades). It sits faintly in the search box; searching with the box empty looks it up.
function suggestWord() {
  const list = gradeList(Math.min(12, Math.max(3, state.user.grade || 3)));
  const known = new Set(state.words.map((w) => w.term_norm));
  const fresh = list.filter(([english]) => !known.has(english));
  const from = fresh.length ? fresh : list;
  return from.length ? from[Math.floor(Math.random() * from.length)][0] : "";
}
// The character sometimes suggests one when tapped.
function mascotSuggests() {
  if (Math.random() >= 0.3) return null;
  state.suggest = suggestWord();
  const box = document.getElementById("q");
  if (!state.suggest || !box) return null;
  box.placeholder = state.suggest;
  box.classList.remove("hinted");
  void box.offsetWidth;
  box.classList.add("hinted");
  return t("이 단어 어때? {w}", { w: state.suggest });
}

function searchView() {
  state.suggest ||= suggestWord();
  const input = h("input", {
    type: "text", id: "q", value: state.query, maxLength: 40, autocomplete: "off",
    placeholder: state.suggest || t("단어 입력 · Type a word"), "aria-label": t("찾을 단어"),
    oninput: (e) => (state.query = e.target.value),
  });
  return [
    h("form", { class: `search${searchPointsToday() < SEARCH_DAILY_MAX ? " tempt" : ""}`, onsubmit: (e) => { e.preventDefault(); const typed = input.value.trim(); if (!typed) state.suggest = null; search(typed || input.placeholder); } },
      input, h("button", { class: "btn", disabled: state.busy }, t("찾기"))),
    dailyGoal(),
    noticeBox(),
    state.busy && loadingView(),
    state.entry && entryCard(state.entry),
    !state.busy && !state.entry && !state.notice && searchHome(),
  ];
}

// ---------- word list tab ----------

function dayLabel(day) {
  const today = new Date();
  if (day === dayOf(today)) return t("오늘");
  if (day === dayOf(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))) return t("어제");
  return new Date(day + "T12:00:00").toLocaleDateString(locale(), { month: "long", day: "numeric", weekday: "short" });
}

function wordRow(w) {
  return h("div", { class: "item" },
    h("div", { class: "avatar", "aria-hidden": "true" }, [...w.headword][0].toUpperCase()),
    h("button", { class: "open", onclick: () => { Object.assign(state, { entry: w, tab: "search", query: "", notice: null }); render(); } },
      h("div", { class: "word" }, w.headword, w.discovered && h("span", { class: "badge found" }, t("첫 발견")), w.needs_review && h("span", { class: "badge" }, t("복습"))),
      h("div", { class: "sub" }, w.content.counterpart)),
    star(w),
    // Deleting asks once more, right in the row.
    state.confirmDelete === w.term_norm
      ? h("button", { class: "trash sure", onclick: () => { state.confirmDelete = null; removeWord(w); } }, t("삭제"))
      : h("button", { class: "trash", "aria-label": t("단어 삭제"), title: t("단어 삭제"), onclick: () => { state.confirmDelete = w.term_norm; render(); } }, "✕"));
}

function wordsView() {
  const langs = [["recent", t("최근")], ["en", t("영어")], ["ko", t("한국어")]];
  const filters = [["all", t("전체")], ["favorites", t("★ 즐겨찾기")], ["review", t("복습 필요")], ["found", t("✦ 내가 발견")]];
  // "recent" is every word, newest first, whichever language it was searched in.
  const inLang = (lang) => (lang === "recent" ? state.words : state.words.filter((w) => (w.content.language === "ko" ? "ko" : "en") === lang));
  const shown = inLang(state.wordLang).filter((w) =>
    state.filter === "favorites" ? w.favorite : state.filter === "review" ? w.needs_review : state.filter === "found" ? w.discovered : true);

  // Words arrive newest first, so the days come out newest first too.
  const days = new Map();
  for (const w of shown) {
    const day = dayOf(w.last_searched_at);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(w);
  }

  return [
    h("div", { class: "segment three", role: "tablist" }, langs.map(([id, label]) =>
      h("button", { role: "tab", "aria-selected": String(state.wordLang === id), onclick: () => { state.wordLang = id; render(); } },
        label, h("small", null, String(inLang(id).length))))),
    h("div", { class: "chips one-line" }, filters.map(([id, label]) =>
      h("button", { class: "chip", "aria-pressed": String(state.filter === id), onclick: () => { state.filter = id; render(); } }, label))),
    noticeBox(),
    shown.length === 0
      ? h("div", { class: "empty" },
          state.words.length ? t("여기에 해당하는 단어가 없어요.") : t("아직 찾아본 단어가 없어요."))
      : [...days].map(([day, words]) => h("section", { class: "day" },
          h("h3", null, dayLabel(day), h("small", null, t("{n}개", { n: words.length }))),
          h("div", { class: "list" }, words.map(wordRow)))),
  ];
}

// ---------- streak challenge ----------
// Words come from the recommended list of the student's grade, one after another, until a miss.
// Getting every word of a grade right moves the run up to the next grade's list.

const CHALLENGE_FEE = 10; // points a run uses; a student with fewer pays what they have
const CHALLENGE_POINT = 1; // per right answer picked from the choices
const CHALLENGE_TYPED = 2; // per right answer typed
const LEVEL_BONUS = 20; // per grade list cleared
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);
const gradeList = (grade) => WORD_LISTS[grade] || [];
const bestStreak = () => state.user.challenge?.best || 0;

// ----- the start screens of the two games: the character explains, three steps, the numbers -----
function guideHero(title, text) {
  return h("div", { class: "guide" },
    h("div", { class: "guide-art", "aria-hidden": "true" }, portrait(myShop().character)),
    h("div", { class: "guide-say" }, h("b", null, title), h("span", null, text)));
}
const guideSteps = (steps) => h("ol", { class: "guide-steps" }, steps.map((step) => h("li", null, step)));
const coin = () => h("i", { "aria-hidden": "true" }, "P");
const guideStat = (label, value, kind) => h("div", { class: `stat${kind ? ` ${kind}` : ""}` }, h("b", null, value), h("span", null, label));

function challengeCard() {
  const grade = Math.min(12, Math.max(3, state.user.grade));
  return [
    guideHero(t("어디까지 갈 수 있을까?"), t("틀릴 때까지 이어지는 도전이야. 내 최고 기록을 깨 보자!")),
    // My record, large: it is what this game is about.
    h("div", { class: `record${bestStreak() > 0 ? "" : " none"}` },
      h("span", { class: "record-label" }, t("내 최고 기록")),
      h("div", { class: "record-number" }, h("b", null, String(bestStreak())), h("span", null, t("연속"))),
      h("p", null, bestStreak() > 0 ? t("{n}연속을 넘으면 새 기록!", { n: bestStreak() }) : t("첫 기록을 세워 봐요!"))),
    guideSteps([
      t("G{g} 권장 단어 {n}개가 고르기와 쓰기로 섞여 나와요.", { g: grade, n: gradeList(grade).length }),
      t("맞힐 때마다 바로 포인트를 받고, 한 번 틀리면 끝나요."),
      t("한 학년을 다 맞히면 다음 학년으로 올라가요."),
    ]),
    h("div", { class: "guide-stats" },
      guideStat(t("쓰는 포인트"), [coin(), `-${Math.min(CHALLENGE_FEE, state.user.points || 0)}`], "use"),
      guideStat(t("맞힐 때마다"), [coin(), `+${CHALLENGE_POINT}~${CHALLENGE_TYPED}`], "gain"),
      guideStat(t("학년 통과"), [coin(), `+${LEVEL_BONUS}`], "gain")),
    h("p", { class: "act" }, h("button", { class: "btn wide", onclick: startChallenge }, t("도전 시작"))),
  ];
}

function startChallenge() {
  const grade = Math.min(12, Math.max(3, state.user.grade));
  const fee = Math.min(CHALLENGE_FEE, state.user.points || 0);
  award(-fee, t("연속 도전에 사용"));
  state.challenge = { grade, fee, queue: shuffle(gradeList(grade)), streak: 0, levels: 0, earned: 0, phase: "ask" };
  nextChallengeWord();
  render();
}

function nextChallengeWord() {
  const c = state.challenge;
  if (!c.queue.length) {
    if (c.grade >= 12) return finishChallenge(true);
    c.grade += 1;
    c.levels += 1;
    c.queue = shuffle(gradeList(c.grade));
    c.earned += LEVEL_BONUS;
    award(LEVEL_BONUS, `${t("레벨 업!")} G${c.grade}`, true);
  }
  const [english, korean] = c.queue.pop();
  // Wrong choices: three other words of the grade whose meaning differs from the answer's and from
  // each other's, so that no two choices are both right (big and large are both 큰).
  const hasDefs = Boolean(WORD_DEFS[english]);
  const others = [];
  for (const pair of shuffle(gradeList(c.grade))) {
    if (others.length === 3) break;
    if (hasDefs && !WORD_DEFS[pair[0]]) continue;
    const clash = [[english, korean], ...others].some((used) => used[0] === pair[0] || used[1] === pair[1]);
    if (!clash) others.push(pair);
  }
  // Kinds of question are mixed. Each shows one side of a word and asks for another:
  // en / ko = the word in that language, den / dko = its definition in that language.
  const side = {
    en: (pair) => pair[0], ko: (pair) => pair[1],
    den: (pair) => WORD_DEFS[pair[0]][0], dko: (pair) => WORD_DEFS[pair[0]][1],
  };
  const kinds = [ // [shown, asked for, typed?, how often]
    ["en", "ko", false, 2], ["ko", "en", false, 2], ["ko", "en", true, 2],
    ...(hasDefs ? [
      ["dko", "ko", false, 2], ["dko", "ko", true, 1], ["den", "en", false, 2], ["den", "en", true, 2],
      ["ko", "dko", false, 2], ["en", "den", false, 2], ["dko", "en", false, 2], ["den", "ko", false, 2],
    ] : []),
  ];
  let roll = Math.random() * kinds.reduce((sum, kind) => sum + kind[3], 0);
  const [shown, asked, typed] = kinds.find((kind) => (roll -= kind[3]) < 0) || kinds[0];
  Object.assign(c, {
    phase: "ask",
    picked: null,
    question: {
      kind: typed ? "type" : "choice",
      shown, asked,
      prompt: side[shown]([english, korean]),
      answer: side[asked]([english, korean]),
      options: typed ? null : shuffle([[english, korean], ...others]).map(side[asked]),
      hint: typed ? (asked === "en" ? t("영어 단어로 써 보세요.") : t("한국어 단어로 써 보세요."))
        : asked.startsWith("d") ? t("알맞은 뜻을 골라 보세요.") : t("알맞은 단어를 골라 보세요."),
    },
  });
  if (typed) state.focus = "answer";
  // The same time limit as the quiz. Running out of time ends the run like a wrong answer.
  clearTimeout(challengeTimer);
  c.deadline = Date.now() + QUESTION_MS;
  c.timedOut = false;
  const question = c.question;
  challengeTimer = setTimeout(() => {
    if (state.challenge !== c || c.phase !== "ask" || c.question !== question) return;
    Object.assign(c, { timedOut: true, picked: "", phase: "wrong" });
    render();
    setTimeout(() => { if (state.challenge === c && c.phase === "wrong") finishChallenge(false); }, 1700);
  }, QUESTION_MS);
}
let challengeTimer = 0;

function pickChallenge(option) {
  const c = state.challenge;
  if (c.phase !== "ask") return;
  clearTimeout(challengeTimer);
  c.picked = option;
  // Typed Korean is judged kindly: 수출 is as right as 수출하다.
  const plain = (s) => s.trim().toLowerCase().replace(/\s+/g, "");
  const stem = (s) => plain(s).replace(/(하다|되다|적인|스러운|하는|한|적|의|다)$/, "");
  const same = (a, b) => plain(a) === plain(b) || (c.question.kind === "type" && c.question.asked === "ko" && stem(a).length > 0 && stem(a) === stem(b));
  if (same(option, c.question.answer)) {
    // Every right answer pays at once; typing the word pays more than picking it.
    const points = c.question.kind === "type" ? CHALLENGE_TYPED : CHALLENGE_POINT;
    c.streak += 1;
    c.earned += points;
    c.phase = "right";
    award(points, t("{n}연속", { n: c.streak }));
    setTimeout(() => {
      if (state.challenge !== c || c.phase !== "right") return;
      nextChallengeWord();
      render();
    }, 500);
  } else {
    c.phase = "wrong"; // show the right answer for a moment before the result
    setTimeout(() => { if (state.challenge === c && c.phase === "wrong") finishChallenge(false); }, 1700);
  }
  render();
}

function finishChallenge(clearedAll) {
  const c = state.challenge;
  if (c.phase === "over") return;
  clearTimeout(challengeTimer);
  c.phase = "over";
  c.clearedAll = clearedAll;
  c.record = c.streak > bestStreak();
  if (c.record) {
    state.user.challenge = { best: c.streak };
    celebrate(0, t("새 최고 기록!"), String(c.streak));
    saveSoon(); // the points were paid answer by answer; this saves the record and updates the rankings
  }
  render();
}

function challengeView() {
  const c = state.challenge;
  if (c.phase === "over") {
    return [
      h("div", { class: "card center" },
        h("div", { class: "score-art", "aria-hidden": "true" }, reaction(myShop().character, c.record || c.clearedAll || c.earned > c.fee ? "cheer" : "comfort")),
        h("div", { class: "muted" }, c.clearedAll ? t("모든 학년의 권장 단어를 다 맞혔어요!") : t("연속으로 맞힌 단어")),
        h("div", { class: "score" }, String(c.streak)),
        c.record && h("p", { class: "earned" }, t("새 최고 기록!")),
        !c.clearedAll && c.question && h("p", { class: "small muted", style: "margin-top:8px" }, `${c.question.prompt} = ${c.question.answer}`),
        h("div", { class: "settle" },
          h("div", { class: "best-line" }, h("span", null, t("내 최고 기록")), h("b", null, t("{n}연속", { n: bestStreak() }))),
          h("div", null, h("span", null, t("사용")), h("b", null, `-${c.fee}`)),
          h("div", null, h("span", null, t("획득")), h("b", null, `+${c.earned}`)),
          h("div", { class: `net ${c.earned > c.fee ? "up" : c.earned < c.fee ? "down" : ""}` }, h("span", null, t("결과")), h("b", null, `${c.earned - c.fee > 0 ? "+" : ""}${c.earned - c.fee}`)))),
      h("p", { class: "act" }, h("button", { class: "btn wide", onclick: startChallenge }, t("다시 도전"))),
      h("p", { class: "center act-note" },
        h("button", { class: "link", onclick: () => { state.challenge = null; render(); } }, t("닫기"))),
    ];
  }
  const total = gradeList(c.grade).length;
  const answered = total - c.queue.length - (c.phase === "ask" ? 1 : 0);
  const mark = (option) =>
    c.phase === "ask" ? "" : option === c.question.answer ? " ok" : option === c.picked ? " no" : " dim";
  const typedAnswer = () => {
    const input = h("input", {
      type: "text", id: "answer", maxLength: 40, autocomplete: "off", autocapitalize: "off", spellcheck: false,
      placeholder: t("단어를 써 보세요"), "aria-label": t("정답 입력"), disabled: c.phase !== "ask", value: c.phase === "ask" ? "" : c.picked || "",
    });
    return [
      h("form", { class: `search answer act${c.phase === "right" ? " ok" : c.phase === "wrong" ? " no" : ""}`,
        onsubmit: (e) => { e.preventDefault(); if (input.value.trim()) pickChallenge(input.value.trim()); } },
        input, h("button", { class: "btn", disabled: c.phase !== "ask" }, t("확인"))),
      c.phase === "wrong"
        ? h("p", { class: "ch-correct act-note" }, t("정답은"), " ", h("b", null, c.question.answer))
        : h("p", { class: "small muted center act-note" }, c.question.hint),
    ];
  };
  return [
    h("div", { class: "ch-top" },
      h("div", { class: `ch-streak${c.phase === "right" ? " bump" : ""}` }, h("b", null, String(c.streak)), h("span", null, t("연속"))),
      h("div", { class: `ch-best${c.streak > bestStreak() ? " beaten" : ""}` },
        h("small", null, t("내 최고 기록")),
        h("b", null, String(Math.max(bestStreak(), c.streak))),
        h("span", null, c.streak > bestStreak() ? t("새 기록!") : bestStreak() - c.streak === 0 ? t("타이 기록!") : t("{n}개 남음", { n: bestStreak() - c.streak }))),
      h("div", { class: "ch-level" }, `G${c.grade}`, h("small", null, `${answered} / ${total}`))),
    h("div", { class: "progress" }, h("div", { class: "bar" }, h("i", { style: `width:${(answered / total) * 100}%` }))),
    c.phase === "ask" && h("div", { class: "timer", role: "timer", "aria-label": t("남은 시간") },
      h("i", { style: `animation-duration:${QUESTION_MS}ms;animation-delay:-${Math.max(0, QUESTION_MS - (c.deadline - Date.now()))}ms` })),
    c.timedOut && h("p", { class: "center act-note timeout" }, t("시간이 다 됐어요!")),
    h("div", { class: `ch-prompt${c.question.shown.startsWith("d") ? " long" : ""}` }, c.question.prompt),
    c.question.kind === "type" ? typedAnswer() : h("div", { class: `choices act${c.question.asked.startsWith("d") ? " wide defs" : c.question.options.some((o) => o.length > 9) ? " wide" : ""}` },
      c.question.options.map((option, i) =>
        h("button", { class: `choice${mark(option)}`, disabled: c.phase !== "ask", onclick: () => pickChallenge(option) },
          h("span", { class: "num" }, String(i + 1)), option))),
    c.question.kind !== "type" && h("p", { class: "small muted center act-note" }, c.question.hint),
    h("p", { class: "center act-note" },
      h("button", { class: "link", onclick: () => finishChallenge(false) }, t("그만하기"))),
  ];
}

// ---------- rankings tab ----------

async function openRankings() {
  Object.assign(state, { tab: "rank", notice: null, nameSaved: false, confirmBuy: null, rankError: false });
  state.rankGrade ||= state.user.grade;
  render();
  try {
    const onlyFriends = state.rankScope === "friends";
    state.rankings = await api.getRankings(state.rankGrade, onlyFriends);
    // Duels won come from their own function, which may not be installed yet.
    state.rankings.duel = await api.duelRankings(onlyFriends).catch(() => []);
  } catch (err) {
    console.error(err);
    if (err?.status === 401) await fail(err);
    else state.rankError = true;
  }
  render();
}

function rankView() {
  const boards = [["points", t("포인트")], ["found", t("첫 발견")], ["streak", t("연속 도전")], ["duel", t("대결")]];
  const kind = state.rankKind || "points";
  const rows = state.rankings?.[kind] || [];
  const score = (n) => (kind === "points" ? `P ${n}` : kind === "streak" ? t("{n}연속", { n }) : kind === "duel" ? t("{n}승", { n }) : t("{n}개", { n }));
  const top = rows.filter((row) => row.score > 0 && row.rank <= 20);
  const mine = rows.find((row) => row.me);
  const line = (row) => h("li", { class: `rank-row${row.me ? " me" : ""}${row.rank <= 3 && row.score > 0 ? ` top${row.rank}` : ""}` },
    h("span", { class: "place" }, String(row.rank)),
    h("span", { class: "who" }, nameOf(row.nickname, row.tag), row.me && h("small", null, t("나"))),
    h("b", null, score(row.score)));

  return [
    h("div", { class: "rank-head" },
      h("h2", { class: "page-title" }, t("랭킹")),
      // Everyone, or only my friends and me.
      h("div", { class: "scope", role: "group", "aria-label": t("랭킹 범위") }, [["all", t("전체")], ["friends", t("친구")]].map(([id, label]) =>
        h("button", { "aria-pressed": String((state.rankScope || "all") === id), onclick: () => { state.rankScope = id; state.rankings = null; openRankings(); } }, label)))),
    h("div", { class: "segment four", role: "tablist" }, boards.map(([id, label]) =>
      h("button", { role: "tab", "aria-selected": String(kind === id), onclick: () => { state.rankKind = id; render(); } }, label))),
    kind === "streak" && h("div", { class: "chips grade-chips" }, GRADES.map((g) =>
      h("button", { class: "chip", "aria-pressed": String(state.rankGrade === g), onclick: () => { state.rankGrade = g; openRankings(); } }, `G${g}`))),
    state.rankError
      ? h("div", { class: "empty" }, t("랭킹을 불러오지 못했어요."))
      : !state.rankings
        ? h("div", { class: "empty" }, t("랭킹을 불러오는 중…"))
        : top.length === 0
          ? h("div", { class: "empty" }, t("아직 순위가 없어요. 첫 순위에 올라 보세요!"),
              state.rankScope === "friends" && h("p", { style: "margin-top:12px" }, h("button", { class: "btn ghost", onclick: () => openPage("friends") }, t("친구 추가하기"))))
          : [
              h("ol", { class: "rank-list" }, top.map(line)),
              mine && !top.includes(mine) && [h("div", { class: "rank-gap" }, "⋯"), h("ol", { class: "rank-list" }, line(mine))],
            ],
    h("p", { class: "small muted center", style: "margin-top:16px" }, t("이름을 정하지 않으면 임시 이름으로 보여요. 설정에서 바꿀 수 있어요.")),
  ];
}

// ---------- quiz tab ----------

function quizSetup() {
  const scope = state.scope;
  const setScope = (next) => { state.scope = next; render(); };
  const cards = buildQuizSet(state.words, scope);
  const review = cards.filter((w) => w.needs_review).length;
  const today = new Date().toISOString().slice(0, 10);
  const select = h("select", {
    id: "scope", "aria-label": t("시험 범위"),
    onchange: (e) => setScope({
      "7": { type: "days", days: 7 },
      days: { type: "days", days: 14, custom: true },
      range: { type: "range", from: today, to: today },
      favorites: { type: "favorites" },
      review: { type: "review" },
      all: { type: "all" },
    }[e.target.value]),
  },
    h("option", { value: "7" }, t("지난 7일")),
    h("option", { value: "days" }, t("지난 며칠 (직접 입력)")),
    h("option", { value: "range" }, t("날짜 범위")),
    h("option", { value: "favorites" }, t("즐겨찾기")),
    h("option", { value: "review" }, t("퀴즈에서 틀린 단어만")),
    h("option", { value: "all" }, t("전체 단어")));
  select.value = scope.type === "days" ? (scope.custom ? "days" : "7") : scope.type;

  return [
    guideHero(t("오늘 찾은 단어, 기억나?"), t("내 단어장에서 문제를 낼게. 틀려도 괜찮아, 다시 나오니까!")),
    guideSteps([
      t("뜻을 보고 단어를 쓰거나 골라요."),
      t("한 문제에 {n}초예요.", { n: QUESTION_MS / 1000 }),
      t("틀린 단어는 {n}번 연속으로 맞힐 때까지 다시 나와요.", { n: MASTER_STREAK }),
    ]),
    h("div", { class: "guide-form" },
      h("div", { class: "field" }, h("label", { htmlFor: "scope" }, t("시험 범위")), select),
      scope.custom && h("div", { class: "field" },
        h("label", { htmlFor: "days" }, t("최근 며칠 동안 찾은 단어")),
        h("div", { class: "row" },
          h("input", {
            type: "number", id: "days", min: 1, max: 365, value: scope.days,
            onchange: (e) => setScope({ ...scope, days: Math.max(1, Math.min(365, Number(e.target.value) || 1)) }),
          }), t("일"))),
      scope.type === "range" && h("div", { class: "field" },
        h("label", null, t("찾은 날짜")),
        h("div", { class: "row" },
          h("input", { type: "date", "aria-label": t("시작일"), value: scope.from, max: today, onchange: (e) => setScope({ ...scope, from: e.target.value }) }),
          "~",
          h("input", { type: "date", "aria-label": t("종료일"), value: scope.to, max: today, onchange: (e) => setScope({ ...scope, to: e.target.value }) })))),
    h("div", { class: "guide-stats" },
      guideStat(t("문제 수"), t("{n}개", { n: cards.length }), "best"),
      guideStat(t("쓰는 포인트"), [coin(), `-${quizFee(cards.length)}`], "use"),
      guideStat(t("다 맞히면"), [coin(), t("최대 +{n}", { n: quizMax(cards.length) })], "gain")),
    h("p", { class: "small muted center", id: "quiz-count" },
      cards.length === 0 ? (scope.type === "review" ? t("지금은 틀린 단어가 없어요!") : t("이 범위에는 단어가 없어요. 범위를 바꿔 보세요."))
        : review > 0 && scope.type !== "review" ? t("지난번에 틀린 복습 단어 {n}개 포함", { n: review }) : ""),
    h("p", { class: "act" }, h("button", { class: "btn wide", disabled: cards.length === 0, onclick: startQuiz }, t("퀴즈 시작"))),
  ];
}

function quizProgress() {
  const { cards, index, phase } = state.quiz;
  const done = index + (phase === "result" ? 1 : 0);
  return h("div", { class: "progress" },
    `${Math.min(index + 1, cards.length)} / ${cards.length}`,
    h("div", { class: "bar" }, h("i", { style: `width:${(done / cards.length) * 100}%` })));
}

// The quiz leads with the language of the screen: Korean on a Korean screen, English otherwise.
const quizMain = () => (getLang() === "ko" ? "ko" : "en");
// The Korean or the English word of an entry, whichever way round it was searched.
function wordIn(c, lang) {
  const headIsKorean = /[가-힣]/.test(c.headword);
  return (lang === "ko") === headIsKorean ? c.headword : c.counterpart || c.headword;
}

function quizAsk() {
  const quiz = state.quiz;
  const word = quiz.cards[quiz.index];
  const question = quiz.questions[quiz.index];
  const c = word.content;
  const main = quizMain();
  const [first, second] = main === "ko" ? [c.definition_ko, c.definition_en] : [c.definition_en, c.definition_ko];
  const input = h("input", {
    type: "text", id: "answer", maxLength: 60, autocomplete: "off", autocapitalize: "off", spellcheck: false,
    placeholder: t("단어를 써 보세요"), "aria-label": t("정답 입력"),
  });
  return [
    quizProgress(),
    h("div", { class: "timer", role: "timer", "aria-label": t("남은 시간") },
      h("i", { style: `animation-duration:${QUESTION_MS}ms;animation-delay:-${Math.max(0, QUESTION_MS - (quiz.deadline - Date.now()))}ms` })),
    h("div", { class: `question${(first || "").length > (main === "ko" ? 55 : 95) ? " long" : ""}` },
      h("div", { class: "q-label" }, t("이 뜻을 가진 단어는?"),
        word.needs_review && h("span", { class: "badge" },
          `${t("복습")} ${"●".repeat(Math.min(word.streak, MASTER_STREAK))}${"○".repeat(Math.max(0, MASTER_STREAK - word.streak))}`)),
      h("p", { class: "q-ko" }, mask(first, c)),
      h("p", { class: "q-en" }, mask(second, c))),
    question.kind === "choice"
      ? [h("div", { class: `choices act${question.options.some((o) => wordIn(o.content, main).length > 13) ? " wide" : ""}` }, question.options.map((option, i) =>
          h("button", { class: "choice", onclick: () => submitAnswer(option.headword, option) },
            h("span", { class: "num" }, String(i + 1)), wordIn(option.content, main)))),
         h("p", { class: "small muted center act-note" }, t("알맞은 단어를 골라 보세요."))]
      : [h("form", { class: "search answer act", onsubmit: (e) => { e.preventDefault(); if (input.value.trim()) submitAnswer(input.value); } },
          input, h("button", { class: "btn" }, t("확인"))),
         h("p", { class: "small muted center act-note" }, t("한국어와 영어 중 어느 쪽으로 써도 정답이에요."))],
    h("p", { class: "center act-note" },
      h("button", { class: "link", onclick: () => submitAnswer("") }, t("모르겠어요")), "  ·  ",
      h("button", { class: "link", onclick: () => { state.quiz = null; render(); } }, t("그만하기"))),
  ];
}

const CHEERS = () => [t("정답! 대단해요!"), t("완벽해요!"), t("바로 그거예요!"), t("멋져요, 기억하고 있었네요!"), "Great job!"];
const COMFORTS = () => [t("괜찮아요, 다음엔 맞힐 수 있어요."), t("아쉬워요! 한 번 더 보면 기억날 거예요."), t("틀려도 괜찮아요. 이렇게 배우는 거예요."), t("Almost! 다음에 다시 만나요.")];
const CONFETTI = ["#655f9f", "#574f82", "#23552b", "#bbd86b", "#a9a4d4", "#7fae4a"];

// Wrong spelling, shown letter by letter: wrong or extra letters are crossed out in "my answer",
// and the letters that were missing or different are highlighted in the correct word.
function spellingView(diff) {
  const letters = (list, cls) => list.map(({ ch, ok }) => h("span", { class: ok ? null : cls }, ch));
  return h("div", { class: "spell" },
    h("div", { class: "spell-title" }, t("철자를 비교해 보세요")),
    h("div", { class: "spell-row" }, h("small", null, t("내가 쓴 답")), h("div", { class: "letters" }, letters(diff.typed, "wrong"))),
    h("div", { class: "spell-row" }, h("small", null, t("정답")), h("div", { class: "letters" }, letters(diff.answer, "fix"))));
}

function quizResult() {
  const quiz = state.quiz;
  const word = quiz.cards[quiz.index];
  const c = word.content;
  const spelling = !quiz.correct && quiz.questions[quiz.index].kind === "type" ? spellingDiff(quiz.typed, c) : null;
  const last = quiz.index + 1 >= quiz.cards.length;
  const mastered = quiz.correct && !word.needs_review && word.streak === MASTER_STREAK;
  return [
    quizProgress(),
    h("div", { class: `feedback ${quiz.correct ? "good" : "bad"}`, role: "status", onclick: stopAutoNext },
      quiz.correct && h("div", { class: "confetti", "aria-hidden": "true" },
        Array.from({ length: 30 }, (_, i) => h("i", {
          style: `left:${Math.random() * 100}%;background:${CONFETTI[i % CONFETTI.length]};animation-delay:${Math.random() * 0.5}s;animation-duration:${1.2 + Math.random()}s`,
        }))),
      h("div", { class: "art", "aria-hidden": "true" }, reaction(myShop().character, quiz.correct ? "cheer" : "comfort")),
      h("div", { class: "fb-title" }, quiz.correct ? pick(CHEERS()) : quiz.timedOut ? t("시간이 다 됐어요!") : pick(COMFORTS())),
      quiz.correct && word.streak > 1 && h("div", { class: "fb-sub" }, t("🔥 {n}번 연속 정답", { n: word.streak })),
      mastered && h("div", { class: "fb-sub" }, t("복습 완료! 이제 이 단어는 졸업이에요.")),
      !quiz.correct && quiz.typed && (spelling ? spellingView(spelling) : h("div", { class: "fb-sub" }, t("내가 쓴 답: "), h("s", null, quiz.typed))),
      h("div", { class: "fb-answer" }, wordIn(c, quizMain()), h("small", null, "⇄"), wordIn(c, quizMain() === "ko" ? "en" : "ko")),
      !quiz.correct && (c.memory_tip_ko || c.memory_tip_en) && h("div", { class: "fb-tip" }, "💡 ", quizMain() === "ko" ? c.memory_tip_ko || c.memory_tip_en : c.memory_tip_en || c.memory_tip_ko)),
    h("p", { class: "act" },
      h("button", { class: `btn wide${quiz.auto ? " auto" : ""}`, id: "next", onclick: nextCard }, last ? t("결과 보기") : t("다음 문제 →"))),
    quiz.auto && h("p", { class: "small muted center act-note", id: "auto-hint" }, t("잠시 후 자동으로 넘어가요. 더 보려면 결과 카드를 누르세요.")),
  ];
}

// What the quiz cost, what it won, and the difference.
function settlement(quiz) {
  const won = quiz.earned || 0;
  const net = won - quiz.fee;
  const signed = (n) => `${n > 0 ? "+" : ""}${n}`;
  return h("div", { class: "settle" },
    h("div", null, h("span", null, t("사용")), h("b", null, signed(-quiz.fee))),
    h("div", null, h("span", null, t("획득")), h("b", null, signed(won))),
    h("div", { class: `net ${net > 0 ? "up" : net < 0 ? "down" : ""}` }, h("span", null, t("결과")), h("b", null, signed(net))),
    h("p", null,
      won === 0 ? t("이번엔 포인트를 얻지 못했어요. 다시 도전해 봐요!")
        : net > 0 ? t("쓴 포인트보다 {n}점 더 얻었어요!", { n: net })
        : net < 0 ? t("이번엔 쓴 포인트보다 조금 적게 얻었어요. 한 번 더 풀어 봐요!")
        : t("쓴 만큼 다시 얻었어요."),
      quiz.perfect && h("small", null, t("전부 정답 보너스 +{n} 포함", { n: 20 }))));
}

function quizDone() {
  const { results } = state.quiz;
  const wrong = results.filter((r) => !r.correct);
  const ratio = (results.length - wrong.length) / results.length;
  return [
    h("div", { class: "card center" },
      h("div", { class: "score-art", "aria-hidden": "true" }, reaction(myShop().character, ratio >= 0.6 ? "cheer" : "comfort")),
      h("div", { class: "score" }, `${results.length - wrong.length} / ${results.length}`),
      h("p", { class: "small muted" }, wrong.length ? t("틀린 단어는 다음 퀴즈에 다시 나와요.") : t("모두 맞혔어요! 최고예요!")),
      settlement(state.quiz)),
    wrong.length > 0 && h("div", { class: "list", style: "margin-top:10px" }, wrong.map(({ word }) =>
      h("div", { class: "item" },
        h("div", { class: "avatar", "aria-hidden": "true" }, [...word.headword][0].toUpperCase()),
        h("div", { class: "open" },
          h("div", { class: "word" }, word.headword),
          h("div", { class: "sub" }, word.content.counterpart))))),
    h("p", { class: "act" }, h("button", { class: "btn wide", onclick: () => { state.quiz = null; render(); } }, t("확인"))),
  ];
}

let duelModule = null;
function duel() {
  return (duelModule ||= initDuel({
    h, t, state, api, render, award, fail, reaction, portrait, myShop, displayName, nameOf,
    guideHero, guideSteps, guideStat, coin, toastText, locale,
    askFriend: (email) => friends().ask(email),
    refreshFriends: (force) => friends().refresh(force),
    openFriends: () => { state.duel = null; friends().open(); },
  }));
}
let friendsModule = null;
function friends() {
  return (friendsModule ||= initFriends({
    h, t, state, api, render, fail, nameOf, toastText, openPage, storeUrl, logoIcon, displayName,
    startDuel: (other) => duel().start({ other }),
  }));
}

function quizView() {
  if (state.challenge) return challengeView();
  if (state.duel) return duel().view();
  const quiz = state.quiz;
  if (!quiz) {
    // Two ways to play, one at a time so the start screen fits without scrolling.
    const modes = [["review", t("단어장 퀴즈")], ["streak", t("연속 도전")], ["duel", t("대결")]];
    const waiting = duel().badge();
    const mode = state.quizMode || "review";
    return [
      h("div", { class: "segment three", role: "tablist" }, modes.map(([id, label]) =>
        h("button", { role: "tab", "aria-selected": String(mode === id), onclick: () => { state.quizMode = id; if (id === "duel") state.duelNews = []; render(); } },
          label, id === "duel" && waiting > 0 && h("em", { class: "dot" }, String(waiting))))),
      mode === "duel" ? duel().home() : mode === "streak" ? challengeCard() : quizSetup(),
    ];
  }
  if (quiz.index >= quiz.cards.length) return quizDone();
  return quiz.phase === "ask" ? quizAsk() : quizResult();
}

// ---------- shell ----------

const GRADES = Array.from({ length: 10 }, (_, i) => i + 3);

// First run only: pick the screen language. Later it is changed in Settings.
function languageStep() {
  return h("div", { class: "step" },
    h("div", { class: "big-logo art", "aria-hidden": "true" }, logoIcon(76)),
    h("h1", null, "언어 · Language · 语言"),
    h("div", { class: "langs" },
      LANGS.map(([id, label]) => h("button", { onclick: () => { setLang(id); render(); } }, label))));
}

// The VOQUIZ title is the way home: the search screen with the greeting.
function goHome() {
  state.quotaSaid = null;
  Object.assign(state, { tab: "search", entry: null, query: "", notice: null, nameSaved: false, confirmBuy: null });
  render();
  document.getElementById("q")?.focus();
}

// Settings and the point shop are pages of their own, opened from the header. Opening one from
// the other keeps the place to go back to.
function openPage(page) {
  const fromPage = ["settings", "shop", "friends"].includes(state.tab);
  if (state.tab === page) Object.assign(state, { tab: state.backTo || "search" });
  else Object.assign(state, { backTo: fromPage ? state.backTo : state.tab, tab: page });
  Object.assign(state, { notice: null, nameSaved: false, confirmBuy: null });
  render();
}
const openSettings = () => openPage("settings");
const openShop = () => openPage("shop");

const myShop = () => ({ ...DEFAULT_SHOP, ...(state.user?.shop || {}) });

function saveShop(shop) {
  state.user.shop = shop;
  state.confirmBuy = null;
  clearTimeout(saveTimer);
  api.saveProfile({ points: state.user.points, search: state.user.search, shop }).catch(console.error);
  publishRank();
  render();
}

function buy(kind, item) {
  const shop = myShop();
  if ((state.user.points || 0) < item.cost) return;
  state.user.points -= item.cost;
  celebrate(0, t(item.name), "✓");
  countUp(-item.cost);
  saveShop({ ...shop, owned: [...shop.owned, `${kind}:${item.id}`], [kind]: item.id });
}

// One shelf of the shop: theme colours or backgrounds.
function shelf(kind, heading, items) {
  const shop = myShop();
  const points = state.user.points || 0;
  return [
    heading && h("h4", null, heading),
    h("div", { class: "shelf" }, items.map((item) => {
      const key = `${kind}:${item.id}`;
      const owned = item.cost === 0 || shop.owned.includes(key);
      const active = shop[kind] === item.id;
      const action = active
        ? h("span", { class: "tagline" }, t("사용 중"))
        : owned
          ? h("button", { class: "mini", onclick: () => saveShop({ ...shop, [kind]: item.id }) }, t("적용하기"))
          : state.confirmBuy === key
            ? h("button", { class: "mini buy", onclick: () => buy(kind, item) }, t("살까요?"))
            : h("button", {
                class: "mini price", disabled: points < item.cost, title: points < item.cost ? t("포인트 부족") : null,
                onclick: () => { state.confirmBuy = key; render(); },
              }, h("i", { "aria-hidden": "true" }, "P"), String(item.cost));
      return h("div", { class: `swatch${active ? " active" : ""}${item.special ? " special" : ""}` },
        item.special && h("span", { class: "ribbon" }, t("스페셜")),
        kind === "character" && portrait(item.id),
        kind !== "character" && h("div", {
          class: "preview", "aria-hidden": "true", "data-bg": kind === "bg" ? item.id : null,
          style: kind === "theme" ? `background:${themeColor(item.id)}` : null,
        }),
        h("div", { class: "swatch-name" }, t(item.name), kind === "character" && h("small", null, t(item.vibe))),
        kind === "character" && h("p", { class: "swatch-line" }, CHARACTER_LINES[item.id]?.[["ko", "en", "zh"].indexOf(getLang())] || ""),
        action);
    })),
  ];
}

// Every character on one shelf, cheapest first, so the whole collection is in view.
const ALL_CHARACTERS = [...CHARACTERS].sort((a, b) => a.cost - b.cost);

function shopSection() {
  const tabs = [["character", t("캐릭터"), CHARACTERS.length], ["theme", t("색상"), THEMES.length], ["bg", t("배경"), BACKGROUNDS.length]];
  const tab = state.shopTab || "character";
  return h("section", { class: "shop" },
    h("div", { class: "segment three", role: "tablist" }, tabs.map(([id, label, count]) =>
      h("button", { role: "tab", "aria-selected": String(tab === id), onclick: () => { Object.assign(state, { shopTab: id, confirmBuy: null }); render(); } },
        label, h("small", null, String(count))))),
    tab === "character" && shelf("character", null, ALL_CHARACTERS),
    tab === "theme" && shelf("theme", null, THEMES),
    tab === "bg" && shelf("bg", null, BACKGROUNDS));
}

// Tapping the score: go to Settings and bring the theme shop into view.
function shopView() {
  return [
    h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: openShop }, "←"),
      h("h2", { class: "page-title" }, t("포인트샵"))),
    shopSection(),
  ];
}

// Who may challenge me to a duel: "all" (anyone), "friends" or "none". Shown as two switches:
// friends, and anyone. Anyone includes friends, so the second cannot be on without the first.
const duelFrom = () => state.user.duelFrom || (state.user.noDuels ? "none" : "all");
async function setDuelFrom(next) {
  const before = duelFrom();
  if (next === before) return;
  state.user.duelFrom = next;
  render();
  try {
    await api.setDuelFrom(next);
    await api.saveProfile({ duelFrom: next, noDuels: next === "none" });
    state.user.noDuels = next === "none";
    toastText(next === "none" ? t("이제 대결 신청을 받지 않아요.") : next === "friends" ? t("이제 친구에게만 대결 신청을 받아요.") : t("이제 누구에게나 대결 신청을 받아요."));
  } catch (err) {
    // Not saved: put the switches back and say so.
    console.error(err);
    state.user.duelFrom = before;
    toastText(t("설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
  }
  render();
}
function duelSwitch(kind, title, text) {
  const on = kind === "friends" ? duelFrom() !== "none" : duelFrom() === "all";
  // friends off -> nobody; friends on -> friends; anyone on -> all; anyone off -> friends only
  const next = kind === "friends" ? (on ? "none" : "friends") : on ? "friends" : "all";
  return h("div", { class: "setting" },
    h("div", { class: "setting-text" }, h("b", null, title), h("small", null, text)),
    h("button", { class: "switch", role: "switch", "aria-checked": String(on), "aria-label": title, onclick: () => setDuelFrom(next) }, h("i", null)));
}

function settingsView() {
  const cost = nameCost();
  const short = (state.user.points || 0) < cost;
  // Name, language and grade, kept compact.
  const grade = h("select", { id: "grade-select", "aria-label": t("학년"), onchange: (e) => chooseGrade(Number(e.target.value)) },
    GRADES.map((g) => h("option", { value: String(g) }, `G${g}`)));
  grade.value = String(state.user.grade);
  return [
    h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: openSettings }, "←"),
      h("h2", { class: "page-title" }, t("설정"))),
    h("section", { class: "block prefs" },
      h("form", { class: "row", onsubmit: async (e) => {
        e.preventDefault();
        state.notice = null;
        state.nameSaved = await saveName(document.getElementById("nickname").value);
        if (state.nameSaved) toastText(t("이름을 저장했어요: {name}", { name: displayName() }));
        render();
      } },
        h("input", {
          type: "text", id: "nickname", maxLength: 20, autocomplete: "off", value: state.user.nickname || "",
          placeholder: `${t("이름")} · ${displayName()}`, "aria-label": t("이름"), style: "flex:1",
          // Typing again means there is something new to save.
          oninput: () => {
            if (!state.nameSaved) return;
            state.nameSaved = false;
            render();
          },
        }),
        state.nameSaved
          ? h("button", { class: "btn saved", id: "save-name" }, t("✓ 저장됨"))
          : h("button", { class: "btn with-cost", id: "save-name", disabled: short },
              t("저장"), cost > 0 && h("span", { class: "cost" }, h("i", { "aria-hidden": "true" }, "P"), String(cost)))),
      h("p", { class: "small muted hint" },
        state.nameSaved ? t("이제 “{name}”(이)라고 부를게요.", { name: displayName() })
          : cost === 0 ? t("첫 이름은 무료예요. 비워 두면 임시 이름으로 불러요.")
          : short ? t("이름을 바꾸려면 {n}포인트가 필요해요. 포인트를 더 모아 보세요.", { n: cost })
          : t("이름을 바꾸려면 {n}포인트가 필요해요. 바꿀 때마다 두 배로 늘어나요.", { n: cost })),
      noticeBox(),
      h("div", { class: "pref-row" },
        h("div", { class: "chips", role: "group", "aria-label": t("언어") }, LANGS.map(([id, label]) =>
          h("button", { class: "chip", "aria-pressed": String(getLang() === id), onclick: () => { setLang(id); render(); } }, label))),
        h("label", { class: "grade-pick" }, t("학년"), grade))),
    plansOn() && plusSection(),
    // Duels: a switch for whether classmates may challenge me. Challenging others stays possible.
    h("section", { class: "block" },
      h("h3", null, t("대결")),
      duelSwitch("friends", t("친구의 대결 신청 받기"), t("친구 목록에 있는 친구가 나에게 도전할 수 있어요.")),
      duelSwitch("all", t("누구에게나 대결 신청 받기"), t("친구가 아니어도 도전할 수 있고, 랜덤 대결 상대로도 뽑혀요.")),
      h("p", { class: "small muted", style: "margin-top:10px" },
        duelFrom() === "none" ? t("지금은 아무에게도 대결 신청을 받지 않아요.") : duelFrom() === "friends" ? t("지금은 친구에게만 대결 신청을 받아요.") : t("지금은 누구에게나 대결 신청을 받아요."),
        " ", t("꺼 두어도 내가 도전하는 것과, 이미 받은 도전에 답하는 것은 할 수 있어요."))),
    storeUrl && h("section", { class: "block" },
      h("h3", null, t("VOQUIZ 알리기")),
      h("div", { class: "row" },
        h("button", { class: "btn ghost", style: "flex:1", onclick: sharePrompt }, t("친구에게 공유")),
        h("button", { class: "btn ghost", style: "flex:1", onclick: ratePrompt }, t("평가하기")))),
    h("section", { class: "block" },
      h("h3", null, t("계정")),
      h("p", { class: "muted" }, state.user.email),
      h("p", { style: "margin-top:14px" }, h("button", { class: "btn ghost", onclick: signOut }, t("로그아웃"))),
      state.leaving
        ? h("div", { class: "leave" },
            h("b", null, t("정말 탈퇴할까요?")),
            h("p", null, t("단어장, 포인트, 캐릭터, 친구, 대결 기록, 초대장, 플러스가 모두 지워지고 되돌릴 수 없어요. 다시 쓰려면 초대 코드가 필요해요.")),
            h("label", { htmlFor: "leave-word" }, t("확인을 위해 아래에 “탈퇴”라고 써 주세요.")),
            h("form", { class: "row", onsubmit: (e) => { e.preventDefault(); leave(document.getElementById("leave-word").value.trim()); } },
              h("input", { type: "text", id: "leave-word", autocomplete: "off", maxLength: 10, placeholder: t("탈퇴"), style: "flex:1" }),
              h("button", { class: "btn danger", disabled: state.busy }, t("탈퇴하기"))),
            noticeBox(),
            h("p", null, h("button", { class: "link", onclick: () => { state.leaving = false; state.notice = null; render(); } }, t("취소"))))
        : h("p", { style: "margin-top:18px" }, h("button", { class: "link quiet", onclick: () => { state.leaving = true; state.notice = null; state.focus = "leave-word"; render(); } }, t("회원 탈퇴")))),
    // Required credit for the recommended word lists (CC BY-SA 4.0).
    h("p", { class: "small muted credit" },
      t("연속 도전의 권장 단어는 New General Service List와 New Academic Word List(Browne, Culligan, Phillips)를 바탕으로 했으며, CC BY-SA 4.0에 따라 이용합니다."),
      " ", h("a", { href: "https://www.newgeneralservicelist.com", target: "_blank", rel: "noopener" }, "newgeneralservicelist.com")),
  ];
}

function gradePicker() {
  return h("div", { class: "step" },
    h("h1", null, t("몇 학년인가요?")),
    h("input", { type: "text", id: "first-name", maxLength: 20, autocomplete: "off", placeholder: t("이름 (안 써도 돼요)"), "aria-label": t("이름") }),
    h("p", null, t("학년에 맞는 수준으로 설명해 드려요. 나중에 바꿀 수 있어요.")),
    h("div", { class: "grades" },
      GRADES.map((g) => h("button", { onclick: () => chooseGrade(g) }, `G${g}`))));
}

function loginView() {
  return h("div", { class: "step splash" },
    h("div", { class: "big-logo art", "aria-hidden": "true" }, logoIcon(76)),
    h("h1", { class: "brand" }, wordmark(46)),
    h("p", null, t("한국어와 영어, 두 언어로 단어를 쉽게 익혀요.")),
    h("button", { class: "btn", disabled: state.busy, onclick: signIn }, DEMO ? t("데모로 시작하기") : t("Google 계정으로 로그인")),
    noticeBox());
}

let lastScreen = null;

function render() {
  applyShop(state.user?.shop);
  const keepFocus = state.focus || document.activeElement?.id;
  state.focus = null;
  // Same screen as before (a section uncovered, a star toggled)? Then stay exactly where the student was.
  const screen = [state.tab, state.entry?.term_norm, state.busy, state.quiz && `${state.quiz.index}:${state.quiz.phase}`, state.tab === "rank" && `${state.rankKind}:${state.rankGrade}:${state.rankScope}`, state.tab === "quiz" && state.quizMode, state.duel && `${state.duel.mode}:${state.duel.index}:${state.duel.frozenUntil}`,
    state.challenge && `${state.challenge.streak}:${state.challenge.phase}:${state.challenge.grade}`].join("|");
  const sameScreen = screen === lastScreen;
  const scrollTop = sameScreen ? document.querySelector("main")?.scrollTop || 0 : 0;
  lastScreen = screen;
  if (!sameScreen) state.greeting = Math.random();
  const banner = DEMO && h("div", { class: "banner" }, t("데모 모드 · 이 브라우저에만 저장돼요"));

  if (!hasChosenLang()) app.replaceChildren(languageStep());
  else if (!state.user) app.replaceChildren(loginView());
  else if (state.member === undefined) app.replaceChildren(h("div", { class: "step splash" }, h("div", { class: "big-logo art", "aria-hidden": "true" }, logoIcon(76)), h("p", { class: "muted" }, t("확인하는 중…"))));
  else if (state.member === false) app.replaceChildren(...[banner, inviteGate()].filter(Boolean));
  else if (!state.user.grade) app.replaceChildren(...[banner, gradePicker()].filter(Boolean));
  else {
    const tabs = [["search", t("사전")], ["words", t("단어장")], ["quiz", t("퀴즈")], ["rank", t("랭킹")]];
    const view = { search: searchView, words: wordsView, quiz: quizView, rank: rankView, settings: settingsView, shop: shopView, friends: () => friends().view() }[state.tab]();
    app.replaceChildren(...[
      h("header", null,
        h("h1", null, h("button", { class: "home", title: t("처음 화면으로"), onclick: goHome }, logoIcon(28), wordmark(25))),
        h("button", { class: "points", id: "points", title: t("포인트샵 열기"), "aria-pressed": String(state.tab === "shop"), "aria-label": t("단어포인트"), onclick: openShop }, h("i", { "aria-hidden": "true" }, "P"), h("span", null, String(state.user.points || 0))),
        h("button", { class: "gear people", "aria-label": t("친구"), title: t("친구"), "aria-pressed": String(state.tab === "friends"), onclick: () => openPage("friends") },
          icon("friends"), friends().badge() > 0 && h("em", { class: "dot" }, String(friends().badge()))),
        h("button", { class: "gear", "aria-label": t("설정"), title: t("설정"), "aria-pressed": String(state.tab === "settings"), onclick: openSettings }, icon("settings"))),
      banner,
      h("main", { class: sameScreen ? "still" : null }, view),
      h("nav", null, tabs.map(([id, label]) => h("button", {
        "aria-current": state.tab === id ? "page" : null,
        onclick: () => {
          // Leaving the quiz tab ends a run that is still going, and closes a finished one.
          if (state.challenge && state.challenge.phase !== "over") finishChallenge(false);
          if (state.challenge && id !== "quiz") state.challenge = null;
          // A duel being played ends with the score so far; other duel screens just close.
          if (state.duel) { if (state.duel.mode === "play" || state.duel.mode === "saving") duel().stop(); else state.duel = null; }
          if (id === "rank") return openRankings();
          Object.assign(state, { tab: id, notice: null, nameSaved: false, confirmBuy: null });
          render();
        },
      }, icon(id), h("span", null, label), id === "quiz" && duel().badge() > 0 && h("em", { class: "dot" }, String(duel().badge()))))),
    ].filter(Boolean));
  }
  state.justRevealed = null;
  const main = document.querySelector("main");
  if (main) main.scrollTop = scrollTop;
  // The grade row of the streak ranking scrolls sideways; keep the chosen grade in view.
  for (const row of document.querySelectorAll(".grade-chips, .group-chips")) {
    const on = row.querySelector("[aria-pressed=\"true\"]");
    if (on) row.scrollLeft = on.offsetLeft - row.clientWidth / 2 + on.clientWidth / 2;
  }
  if (keepFocus) document.getElementById(keepFocus)?.focus();
  animateLoading();
}

// A word picked with right-click → "VOQUIZ" arrives through session storage.
async function takePendingTerm() {
  const { pendingTerm } = await chrome.storage.session.get("pendingTerm");
  if (!pendingTerm) return;
  await chrome.storage.session.remove("pendingTerm");
  if (state.user?.grade && Date.now() - pendingTerm.at < 30_000) search(pendingTerm.text.slice(0, 40));
}
if (globalThis.chrome?.storage?.session) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "session" && changes.pendingTerm?.newValue) takePendingTerm();
  });
}

globalThis.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", () => render());
// A member seen on this computer before is let straight in; anyone else is checked first.
if (state.user) state.member = localStorage.getItem(memberKey()) ? true : undefined;
render();
if (state.user && state.member === undefined) checkMember().then(() => { if (state.member && state.user?.grade) loadWords(); });
{
  const forced = new URLSearchParams(location.search).get("prompt");
  if (forced === "share") sharePrompt();
  if (forced === "rate") ratePrompt();
}
api.refreshUser?.().then((user) => { if (user && state.user) { state.user = user; render(); } }).catch(() => {}).finally(publishRank);
if (state.user?.grade && state.member) loadWords().then(() => globalThis.chrome?.storage?.session && takePendingTerm());
