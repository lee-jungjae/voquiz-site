import { api, DEMO } from "./api.js?v=0.1.28-tp7tpx";
import { STORE_URL, DOWNLOAD_URL, HOME_URL } from "./config.js?v=0.1.28-tp7tpx";
import { t, tIn, getLang, setLang, tryLang, hasChosenLang, locale, LANGS, sentences } from "./i18n.js?v=0.1.28-tp7tpx";
import { THEMES, BACKGROUNDS, FONTS, DEFAULT_SHOP, CATALOG_REV, applyShop, themeColor, loadFont } from "./shop.js?v=0.1.28-tp7tpx";
import { cleanEntry } from "./clean.js?v=0.1.28-tp7tpx";
import { mascot, portrait, reaction, giftArt } from "./mascot.js?v=0.1.28-tp7tpx";
import { CHARACTERS, baseOf, lookOf } from "./characters.js?v=0.1.28-tp7tpx";
import { CONCEPTS, WEARS, SKINS, conceptById, wearById, skinKey, wearCost } from "./goods.js?v=0.1.28-tp7tpx";
import { initGrow } from "./grow.js?v=0.1.28-tp7tpx";
import { logoIcon, wordmark } from "./logo.js?v=0.1.28-tp7tpx";
import { art, artToCss } from "./art.js?v=0.1.28-tp7tpx";
import { academicWords } from "./academic.js?v=0.1.28-tp7tpx";
artToCss();
setTimeout(() => peekSoon(true), 0);
import { film } from "./film.js?v=0.1.28-tp7tpx";
import { showYard, leaveYard, cheerYard, stageYard, visitNow } from "./yard.js?v=0.1.28-tp7tpx";
import { confetti, fireworks, stamp, miss as missFx, combo as comboFx } from "./fx.js?v=0.1.28-tp7tpx";
import { initDesktop } from "./desktop.js?v=0.1.28-tp7tpx";
import { clockNow } from "./clock.js?v=0.1.28-tp7tpx";
import { BANDS, bandOf } from "./levels.js?v=0.1.28-tp7tpx";
import { CHARACTER_LINES } from "./character-lines.js?v=0.1.28-tp7tpx";
import { initDuel } from "./duel.js?v=0.1.28-tp7tpx";
import { initFriends } from "./friends.js?v=0.1.28-tp7tpx";
import { MOTTOS } from "./mottos.js?v=0.1.28-tp7tpx";
import { leagueCharacters, place, outcome, TIERS, MOVE } from "./league.js?v=0.1.28-tp7tpx";
import { SIGNATURES } from "./signatures.js?v=0.1.28-tp7tpx";
import { sfx, soundOn, setSound } from "./sound.js?v=0.1.28-tp7tpx";
import { tuning, setTuning } from "./tuning.js?v=0.1.28-tp7tpx";
import { WORD_LISTS } from "./wordlists.js?v=0.1.28-tp7tpx";
import { WORD_DEFS } from "./worddefs.js?v=0.1.28-tp7tpx";
import { buildQuizSet, quizPool, makeQuestions, askedContent, applyAnswer, isCorrect, spellingDiff, MASTER_STREAK, RETEST_DAYS, isLearned, canRetest, retestPatch } from "./quiz.js?v=0.1.28-tp7tpx";

const app = document.getElementById("app");
// The web version (site/web): the same app in a browser tab. Its page marks itself with class="web".
const WEB = document.documentElement.classList.contains("web");
// On a phone the web version looks exactly like the extension. Only a wide window (a tablet on its
// side, a desktop) gets the bare home, the tabs at the top and the yard.
const wideQuery = WEB ? globalThis.matchMedia?.("(min-width: 860px)") : null;
const WIDE = () => Boolean(wideQuery?.matches);

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
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
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
  openSense: {}, // word -> Set of the meanings that are open
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
  if (state.user?.grade) grow().sync(); // words learned before levels came count at once (their presents wait on the road)
  render();
  openAtStart();
  if (state.user?.grade) {
    loadPlan();
    settleLeague(); // last week's league: up, down or the same tier
    duel().refresh(true); // challenges received, and what finished duels paid
    friends().refresh(true); // friend requests received
    loadQuestStats(); // duel wins, for the characters that are earned
  }
}

// ----- free and Plus -----
// Free students search a set number of different words a day; Plus students search without limit,
// see each character's own trick, and get a present on the home screen every day.
// Plus is switched on with a coupon (Settings). state.plan: { plus, until, off } - off means the
// database part (0007_plus.sql) is not installed, so there is no limit and no Plus to show.
const FREE_SEARCHES = 20; // keep in step with FREE_DAILY_SEARCHES of the lookup function
const planKey = () => `wb_plan_${state.user.id}`;
const isPlus = () => Boolean(state.plan?.plus && state.plan.until && new Date(state.plan.until) > nowDate());
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
const searchedToday = () => state.words.filter((w) => dayOf(w.last_searched_at) === todayKey()).length;
const searchesLeft = () => Math.max(0, FREE_SEARCHES - searchedToday());
const limitReached = () => plansOn() && !isPlus() && searchesLeft() === 0;

// The daily present: once a day the character on the home screen holds a present. Tapping it
// puts three boxes on the table, each with a different number of points inside, and the student
// picks one; then all three open, so the choice is seen to have mattered. What the boxes may hold
// and how often is in tuning.js ("gift"). A Plus student picks twice a day.
// The day and how many were picked are kept with the account ({ day, picks }). It is the field
// older versions use for the Plus present ({ day }), which counts here as one pick, so no present
// is given twice whichever version is open.
const giftPicks = () => (isToday(state.user.gift?.day) ? state.user.gift.picks ?? 1 : 0);
const giftAllowed = () => (isPlus() ? tuning("gift").plusPicks : tuning("gift").picks);
const giftWaiting = () => giftPicks() < giftAllowed();
function drawPrize() {
  const { prizes } = tuning("gift");
  let roll = Math.random() * prizes.reduce((sum, [, often]) => sum + often, 0);
  return (prizes.find(([, often]) => (roll -= often) < 0) || prizes[0])[0];
}
function openDailyGift() {
  document.getElementById("sheet")?.remove();
  const inside = []; // three different prizes (the same number twice only if the list is that short)
  for (let tries = 0; inside.length < 3; tries++) {
    const prize = drawPrize();
    if (!inside.includes(prize) || tries > 30) inside.push(prize);
  }
  let taken = false;
  const extra = giftPicks() > 0; // a second pick of the day (Plus)
  // Days in a row: each day in a row adds a little to the present, and every seventh day adds a
  // ticket for the capsule machine. The strip shows the week of it, and what tomorrow brings.
  const runOf = () => { const b = state.user.gift || {}; return isToday(b.day) ? b.run || 1 : b.day === dayOf(clockNow() - 86400000) ? (b.run || 1) + 1 : 1; };
  const runBonus = (run) => (run % 7 === 0 ? 0 : Math.min(30, ((run - 1) % 7) * 5));
  // The week of it, day by day with what each day adds: the days done, today, and tomorrow, which
  // is the one made to stand out (it is why to come back).
  const strip = (run) => {
    const pos = ((run - 1) % 7) + 1;
    return h("div", { class: "run-strip steps", role: "img", "aria-label": t("연속 {n}일", { n: run }) },
      Array.from({ length: 7 }, (_, i) => {
        const day = i + 1;
        return h("i", { class: `${day < pos ? "on" : day === pos ? "on today" : day === pos + 1 ? "next" : ""}${day === 7 ? " last" : ""}` },
          // what the day adds, standing on a step that is higher every day
          h("span", { class: "run-add" }, day === 7 ? grow().ticketArt("basic") : day === 1 ? art("gift") : [h("em", { class: "coin-i", "aria-hidden": "true" }, "P"), h("b", null, `+${(day - 1) * 5}`)]),
          h("u", { style: `height:${8 + day * 6}px` }),
          h("small", null, day === pos ? t("오늘") : day === pos + 1 ? t("내일") : String(day)));
      }));
  };
  const tomorrow = (run) => h("p", { class: "run-next" }, art("spark"), (run + 1) % 7 === 0 ? t("내일 오면 뽑기권을 받아요!") : t("내일 오면 보너스 +{p} 더!", { p: runBonus(run + 1) }));
  const runBox = h("div", { class: "run-box" }, h("b", null, t("연속 {n}일", { n: runOf() })), strip(runOf()), tomorrow(runOf()));
  const title = h("h2", null, extra ? t("한 번 더 뽑기") : t("오늘의 선물"), extra && h("em", { class: "plus-badge" }, "PLUS"));
  const text = h("p", null, t("상자 하나를 골라요. 안에 든 포인트가 모두 달라요!"));
  // After a pick: "great", or straight on to the next pick when there is one left today.
  const done = h("button", { class: "btn wide", hidden: true, onclick: () => (giftWaiting() ? openDailyGift() : close()) }, t("좋아요!"));
  const later = h("button", { class: "link", onclick: close }, t("나중에 고를게요"));
  const boxes = inside.map((prize, i) => h("button", {
    class: "gift-box", style: `--hue:${[0, 205, 95][i]}deg;--i:${i}`, "aria-label": t("선물 상자 {n}", { n: i + 1 }),
    onclick: () => {
      if (taken) return;
      taken = true;
      // run: days in a row with a present taken; best: the longest such run (it earns a character).
      if (!giftWaiting()) return close(); // today's present was taken meanwhile (in another window)
      const before = state.user.gift || {};
      const run = isToday(before.day) ? before.run || 1 : before.day === dayOf(clockNow() - 86400000) ? (before.run || 1) + 1 : 1;
      state.user.gift = { day: keepDay(before.day), picks: giftPicks() + 1, run, best: Math.max(before.best || 0, run) };
      api.saveProfile({ gift: state.user.gift }).catch(console.error);
      // The box rocks for a moment before it opens (the choice is already kept: closing now loses
      // only the look of it). A big present (100 or more, or the biggest of the three) is opened
      // with lights and confetti, and the character cheers.
      const best = Math.max(...inside);
      const big = prize >= 100 || prize === best;
      boxes.forEach((box, n) => { box.disabled = true; if (n === i) box.classList.add("rock"); });
      later.hidden = true;
      sfx.chirp(myShop().character);
      setTimeout(() => {
        award(prize, t("오늘의 선물"));
        if (!extra) {
          if (run % 7 === 0) grow().give([{ ticket: "basic", n: 1 }]);
          else if (runBonus(run) > 0) setTimeout(() => award(runBonus(run), t("연속 {n}일 보너스", { n: run })), 1500);
        }
        boxes.forEach((box, n) => { box.classList.remove("rock"); box.classList.add(n === i ? "mine" : "other"); });
        el.classList.add("opened");
        if (big) {
          el.classList.add("jackpot");
          boxes[i].append(h("span", { class: "g-burst", "aria-hidden": "true" }, Array.from({ length: 18 }, (_, k) => h("i", { style: `--a:${k * 20}deg;--c:${["#ff8fb8", "#ffd84d", "#7fd6c2", "#9aa5ff", "#ffa45c", "#fff"][k % 6]};--d:${60 + (k % 4) * 20}px` }))));
          sfx.cheer(myShop().character);
        }
        title.textContent = prize === best && prize >= 100 ? t("대박! +{p}포인트!", { p: prize }) : prize === best ? t("최고의 상자! +{p}포인트!", { p: prize }) : t("+{p}포인트!", { p: prize });
        const again = giftWaiting();
        text.textContent = again ? t("플러스라서 한 번 더 뽑을 수 있어요!")
          : !extra && run % 7 === 0 ? t("연속 {n}일! 뽑기권도 받았어요.", { n: run })
            : prize === best ? t("세 상자 중에 가장 큰 선물을 골랐어요!") : t("내일은 어떤 상자를 고를까요?");
        if (again) done.textContent = t("한 번 더 뽑기");
        done.hidden = false;
        done.focus();
      }, 800);
    },
  }, giftArt(), h("b", { class: "gift-prize" }, `+${prize}`)));
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet gift-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("오늘의 선물") },
      title, text, h("div", { class: "gift-boxes" }, boxes), !extra && runBox, done, later));
  document.body.append(el);
  return t("상자 하나를 골라 봐!");
}

// Santa's presents: whoever owns Santa gets 200 points a day from 1 to 24 December and 1000 on
// the 25th. Like the Plus present, the character on the home screen holds it until it is tapped.
const SANTA_DAILY = 200;
const SANTA_BIG = 1000;
const santaDay = (now = nowDate()) => (now.getMonth() === 11 && now.getDate() <= 25 ? now.getDate() : 0);
const santaWaiting = () => santaDay() > 0 && myShop().owned.includes("character:santa") && !isToday(state.user.santa?.day);
function takeSantaGift() {
  const big = santaDay() === 25;
  state.user.santa = { day: keepDay(state.user.santa?.day) };
  api.saveProfile({ santa: state.user.santa }).catch(console.error);
  award(big ? SANTA_BIG : SANTA_DAILY, big ? t("메리 크리스마스!") : t("산타의 선물"), true);
  return big ? t("메리 크리스마스! 내년 12월에 또 만나") : t("산타의 선물이야! 내일 또 올게");
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
    t("매일 선물 뽑기 한 번 더 (하루 {n}번)", { n: tuning("gift").plusPicks }),
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
           h("button", { class: "btn", disabled: state.busy }, t("적용")))]
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
  if (localStorage.getItem(memberKey())) { state.member = true; localStorage.removeItem(TYPED_CODE); return; }
  state.member = undefined;
  try {
    state.member = Boolean(await api.isMember());
  } catch (err) {
    // 404: the database part is not installed, so nobody is kept out. Any other trouble: let the
    // student in for now (the server still refuses to look words up for non-members).
    console.error(err);
    if (err?.status === 401) return fail(err).then(render);
    state.member = true;
    localStorage.removeItem(TYPED_CODE);
    return render();
  }
  if (state.member) localStorage.setItem(memberKey(), "1");
  // A code typed before signing in (the web version's first screen): a new student joins with it at once.
  const typed = typedCode();
  localStorage.removeItem(TYPED_CODE);
  render();
  if (!state.member && typed) await joinWithCode(typed);
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
    // For someone who installed VOQUIZ without a code: how to get one.
    h("div", { class: "gate-help" },
      h("b", null, t("초대 코드가 없나요?")),
      h("ol", { class: "guide-steps" },
        h("li", null, t("VOQUIZ를 쓰는 친구에게 초대를 부탁해요.")),
        h("li", null, t("친구가 화면 위의 사람 아이콘 → ‘친구에게 공유하기’를 누르면 초대 코드가 나와요. (한 사람당 5장)")),
        h("li", null, t("받은 코드 6자리를 위 칸에 입력하면 바로 가입돼요."))),
      h("p", { class: "small muted" }, t("지금은 초대받은 학생만 가입할 수 있어요. 초대 코드는 따로 신청받거나 판매하지 않아요.")),
      h("p", { class: "small" }, h("a", { class: "link", href: "https://lee-jungjae.github.io/voquiz-site/", target: "_blank", rel: "noopener" }, t("VOQUIZ가 어떤 서비스인지 보기")))),
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
  else render(); // a member this computer already knows, with no grade yet: checkMember drew nothing
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
    state.level = null;
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
// A short line others see under the student's name on the rankings. It is picked from a list
// (mottos.js) and saved as its id; anything else that may be stored is simply not shown.
const mottoOf = (id) => MOTTOS[id]?.[Math.max(0, ["ko", "en", "zh"].indexOf(getLang()))] || "";
async function saveMotto(id) {
  const motto = MOTTOS[id] ? id : "";
  state.user.motto = motto;
  await api.saveProfile({ motto }).catch(console.error);
  publishRank();
  return true;
}

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
    week_start: weekKey(), week_points: weekEarned(), tier: myTier(), character: myShop().character, motto: state.user.motto || "",
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
  state.level = null; // a new search shows the student's own level again
  if (limitReached()) {
    const again = state.words.find((w) => dayOf(w.last_searched_at) === todayKey() && [w.headword, w.term_norm, w.content?.counterpart].some((x) => (x || "").toLowerCase() === term.toLowerCase()));
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
      const firstToday = !before || dayOf(before.last_searched_at) !== todayKey();
      state.words = [result.word, ...state.words.filter((w) => w.term_norm !== result.word.term_norm)];
      state.entry = result.word;
      state.listWord = null; // beside the word list, the newest word shows again
      if (firstToday) awardSearch(result.word.headword);
      dailyWordBonus(result.word);
      checkWeekly();
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
const QUESTION_MS = 10000; // to pick an answer
const TYPED_MS = 20000; // to type one
const limitFor = (typed) => (typed ? TYPED_MS : QUESTION_MS);
let questionTimer = 0;
function startQuestionTimer() {
  clearTimeout(questionTimer);
  const quiz = state.quiz;
  if (!quiz || quiz.index >= quiz.cards.length) return;
  const index = quiz.index;
  quiz.limit = limitFor(quiz.questions[index].kind === "type");
  quiz.deadline = Date.now() + quiz.limit;
  questionTimer = setTimeout(() => {
    if (state.quiz !== quiz || quiz.index !== index || quiz.phase !== "ask") return;
    quiz.timedOut = true;
    submitAnswer("");
    render();
  }, quiz.limit);
}

function startQuiz() {
  const cards = buildQuizSet(state.words, state.scope, clockNow(), tuning("quiz").max);
  if (!cards.length) return;
  const fee = quizFee(cards.length);
  award(-fee, t("퀴즈에 사용"));
  // Each card becomes a typed question or a multiple-choice one, mixed at random.
  const questions = makeQuestions(cards, state.words);
  state.quiz = { cards, questions, fee, index: 0, phase: "ask", typed: "", correct: false, results: [] };
  state.focus = "answer";
  if (WIDE()) { comboFx(0); stamp(t("시작!"), "go"); }
  startQuestionTimer();
  render();
}

// Check the answer (typed text, or the word picked from the choices), show the result right away,
// and save the progress.
function submitAnswer(typed, picked) {
  const quiz = state.quiz;
  clearTimeout(questionTimer);
  const word = quiz.cards[quiz.index];
  const correct = picked ? picked === word : isCorrect(typed, askedContent(word, quiz.questions[quiz.index]));
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
  if (correct) { sfx.right(myShop().character); cheerYard(); } else sfx.wrong();
  if (WIDE()) gameFx(correct, quizRun(quiz), perfect);
  if (last) recordPlay({ k: "q", r: quiz.results.filter((r) => r.correct).length, n: quiz.results.length, p: quiz.earned - quiz.fee });
  // A word that has just been learned gets the celebration to itself (the points still arrive).
  const patch = applyAnswer(word, correct, !picked);
  const learned = Boolean(patch.mastered_at);
  award(earned, perfect ? t("전부 정답!") : lucky ? t("럭키 보너스!") : null, (perfect || lucky) && !learned);
  if (learned) celebrate(0, word.headword, t("다 익힘"));
  // A right answer moves on by itself; a wrong one waits, so there is time to read the correction.
  // (Set before the redraw below, so the button shows its countdown.)
  if (correct) startAutoNext();
  else state.quiz.auto = false;
  patchWord(word, patch);
  if (learned) { checkWeekly(); grow().learnedOne(); }
}

// How many right answers in a row the quiz has just now.
const quizRun = (quiz) => { let n = 0; for (let i = quiz.results.length - 1; i >= 0 && quiz.results[i].correct; i--) n += 1; return n; };
// The desktop frame shows an answer with more than a sound: paper in the air (more of it the longer
// the run), a stamp for the run, a glow round the window; a shake and a red flash for a miss.
function gameFx(correct, run, grand) {
  if (!correct) { missFx(); comboFx(0); return; }
  confetti(26 + Math.min(run, 6) * 12, 0.8 + Math.min(run, 6) * 0.05);
  comboFx(run);
  if (run >= 2) stamp(t("{n}연속", { n: run }), run >= 4 ? "combo hot" : "combo");
  if (grand) setTimeout(() => fireworks(4), 250);
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
// league: false keeps the points out of this week's league (a prize for last week's league).
function award(points, label, big, { league = true } = {}) {
  if (!points || !state.user) return;
  state.user.points = (state.user.points || 0) + points;
  rollWeek();
  // What is earned (never what is spent) also counts for this week's league.
  if (league) state.user.weekly = { ...(state.user.weekly || {}), week: weekKey(), earned: weekEarned() + points };
  (big ? celebrate : toast)(points, label || t("단어포인트"));
  if (!big) sfx[points > 0 ? "coin" : "spend"]();
  countUp(points);
  saveSoon();
}
// The games played, newest first (the last 20), kept with the account: a word-list quiz is
// { k: "q", at, r: right answers, n: questions, p: points won less points used }, a streak run is
// { k: "s", at, n: answers in a row, p: points won, rec: 1 for a new record }. Duels have their own record on the server.
function recordPlay(play) {
  state.user.plays = [{ ...play, at: nowDate().toISOString() }, ...(Array.isArray(state.user.plays) ? state.user.plays : [])].slice(0, 20);
  saveSoon();
}
function saveSoon() {
  clearTimeout(saveTimer); // several changes in a row become one save
  saveTimer = setTimeout(() => {
    api.saveProfile({ points: state.user.points, search: state.user.search, shop: state.user.shop, challenge: state.user.challenge, weekly: state.user.weekly, plays: state.user.plays || [] }).catch(console.error);
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
// "Today" is the server's day, not the computer's (clock.js): the day's limits do not start again
// when the clock of the computer is moved.
const nowDate = () => new Date(clockNow());
const todayKey = () => dayOf(clockNow());
// A day kept with the account (or on this computer) counts as today when it is today, or tomorrow:
// a time zone can put a computer a day ahead, and setting it back must not open the day again.
// A day further ahead than that was written by a wrong clock and counts as past.
const isToday = (day) => Boolean(day) && (day === todayKey() || day === dayOf(clockNow() + 86400000));
const keepDay = (day) => (isToday(day) ? day : todayKey()); // what to write: never an earlier day over a later one

function searchPointsToday() {
  const search = state.user?.search;
  return isToday(search?.day) ? search.points : 0;
}

// What the Golden sunshine background has added to today's search points (it comes on top of
// the day's limit), and today's words with what each paid: [[word, points, bonus], ...].
const searchBonusToday = () => (isToday(state.user.search?.day) ? state.user.search.bonus || 0 : 0);
const searchLogToday = () => (isToday(state.user.search?.day) && Array.isArray(state.user.search.log) ? state.user.search.log : []);
// The word of the day: one word from the list of the student's grade, the same all day (chosen by
// the date). Looking it up pays a bonus of its own, once a day, on top of the search points and
// whether or not the day's search points are used up. Kept in `search` ({ dw: true } for the day).
const DAILY_WORD_POINTS = 20;
function dailyWord() {
  const grade = Math.min(12, Math.max(3, state.user?.grade || 3));
  const list = academicWords(grade, gradeList(grade)); // academic words only (academic.js)
  if (!list.length) return "";
  let n = 7;
  for (const ch of `${todayKey()}:${grade}`) n = (n * 31 + ch.charCodeAt(0)) % 1000003;
  return list[n % list.length];
}
const dailyWordDone = () => Boolean(isToday(state.user.search?.day) && state.user.search.dw);
function dailyWordBonus(word) {
  const today = dailyWord().toLowerCase();
  if (!today || dailyWordDone()) return;
  if (![word?.term_norm, word?.headword, word?.counterpart].some((x) => String(x || "").toLowerCase() === today)) return;
  state.user.search = { day: keepDay(state.user.search?.day), points: searchPointsToday(), bonus: searchBonusToday(), log: searchLogToday(), dw: true };
  setTimeout(() => award(DAILY_WORD_POINTS, t("오늘의 단어 보너스"), true), 2300);
}
// On the first screen, where it cannot be missed: the word, and what looking it up pays.
function dailyWordCard() {
  const word = dailyWord();
  if (!word || !state.user?.grade) return null;
  const done = dailyWordDone();
  return h("button", { class: `daily-word${done ? " done" : ""}`, title: t("오늘의 단어 찾아보기"), onclick: () => search(word) },
    art("cap"),
    h("span", { class: "dw-text" }, h("small", null, h("em", null, "ACADEMIC"), t("오늘의 아카데믹 단어")), h("b", null, word)),
    done ? h("span", { class: "dw-got" }, h("i", { class: "check-i", "aria-hidden": "true" }), t("받았어요"))
      : h("span", { class: "dw-pay" }, h("i", { class: "coin-i", "aria-hidden": "true" }, "P"), `+${DAILY_WORD_POINTS}`));
}
// The evening before the week closes (Saturday, Sunday): what is still within reach.
function eveLine() {
  const day = nowDate().getDay();
  if (day !== 6 && day !== 0) return null;
  const left = weekGoal() - weekCount();
  if (left > 0 && left <= 10) return { text: day === 0 ? t("오늘까지 {n}개만 더 익히면 주간 목표 달성!", { n: left }) : t("내일까지 {n}개만 더 익히면 주간 목표 달성!", { n: left }), tab: "quiz" };
  if (day === 0 && weekEarned() > 0) return { text: t("오늘 밤 이번 주 리그가 끝나요. 순위 볼래?"), tab: "rank" };
  return null;
}
function awardSearch(word) {
  const sofar = searchPointsToday();
  const add = Math.min(SEARCH_POINTS, SEARCH_DAILY_MAX - sofar);
  if (add <= 0) return;
  const bonus = sunriseOn() ? SUNRISE_BONUS : 0;
  state.user.search = {
    dw: dailyWordDone(),
    day: keepDay(state.user.search?.day), points: sofar + add, bonus: searchBonusToday() + bonus,
    log: [...searchLogToday(), [String(word || "").slice(0, 24), add, bonus]].slice(-40),
  };
  const total = sofar + add;
  const reached = total >= SEARCH_DAILY_MAX;
  const halfway = sofar < SEARCH_DAILY_MAX / 2 && total >= SEARCH_DAILY_MAX / 2;
  award(add, reached ? t("오늘 검색 포인트 달성!") : halfway ? t("벌써 절반!") : t("검색 포인트"), reached || halfway);
  if (bonus) setTimeout(() => award(bonus, t("황금 햇살 보너스")), reached || halfway ? 2200 : 350);
  if (reached) setTimeout(happyMoment, 2600);
}
// Today's search points, word by word (opened from the pill on the home screen).
function searchPointsSheet() {
  document.getElementById("sheet")?.remove();
  const close = () => el.remove();
  const log = searchLogToday();
  const total = searchPointsToday() + searchBonusToday();
  const left = Math.max(0, Math.ceil((SEARCH_DAILY_MAX - searchPointsToday()) / SEARCH_POINTS));
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet points-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("오늘 검색 포인트") },
      h("h2", null, t("오늘 검색 포인트"), " ", h("b", { class: "points-total" }, `+${total}`)),
      h("p", null, t("그날 처음 찾는 단어마다 +{p}점, 하루 {m}점까지 받아요.", { p: SEARCH_POINTS, m: SEARCH_DAILY_MAX }), " ",
        myShop().owned.includes("bg:sunrise")
          ? (sunriseOn() ? t("황금 햇살 배경을 쓰는 중이라 단어마다 +{p}점을 더 받아요.", { p: SUNRISE_BONUS }) : t("황금 햇살 배경을 쓰면 단어마다 +{p}점을 더 받아요.", { p: SUNRISE_BONUS }))
          : ""),
      log.length
        ? h("ol", { class: "points-log" }, log.map(([word, points, bonus]) =>
            h("li", null, h("span", { class: "points-word" }, word), h("b", null, `+${points}`), bonus > 0 && h("em", { title: t("황금 햇살 보너스") }, art("sun"), ` +${bonus}`))))
        : h("p", { class: "points-none" }, total > 0 ? t("이 기기에서 찾은 기록이 없어요. 포인트는 그대로 받았어요.") : t("오늘은 아직 찾은 단어가 없어요.")),
      h("p", { class: "small muted" }, left > 0 ? t("오늘 {n}개 더 찾으면 검색 포인트를 다 받아요.", { n: left }) : t("오늘 검색 포인트를 다 받았어요!")),
      h("button", { class: "btn wide", onclick: close }, t("확인"))));
  document.body.append(el);
  el.querySelector("button.btn")?.focus();
}

// Today's search goal, shown right under the search bar.
// ----- a goal for the week -----
// "Look up N different words this week" (the week starts on Monday). Reaching it pays a bonus
// in proportion to the goal, once a week. Kept with the account: { goal, claimed: <week> }.
const WEEK_GOALS = [10, 20, 35, 50, 70];
const WEEK_DEFAULT = 35;
function weekStart(when = nowDate()) {
  const d = new Date(when.getFullYear(), when.getMonth(), when.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // back to Monday
  return d;
}
const weekKey = (when) => dayOf(weekStart(when));
const weekGoal = () => (WEEK_GOALS.includes(state.user.weekly?.goal) ? state.user.weekly.goal : WEEK_DEFAULT);
// The week's goal counts the words LEARNED since Monday (three right answers in a row, one typed).
const weekCount = () => state.words.filter((w) => w.mastered_at && new Date(w.mastered_at) >= weekStart()).length;
// Points earned since Monday: what the weekly league ranks.
const weekEarned = () => (state.user?.weekly?.week === weekKey() ? state.user.weekly.earned || 0 : 0);
// What reaching the goal pays: so many points for every word of it, and never less than the minimum (tuning.js).
const weekBonus = (goal) => Math.max(tuning("weekly").min, Math.round(goal * tuning("weekly").perWord));
function saveWeekly(change) {
  state.user.weekly = { goal: weekGoal(), ...(state.user.weekly || {}), ...change };
  api.saveProfile({ weekly: state.user.weekly }).catch(console.error);
}
// Called after a search: the first time the count reaches the goal in a week, the bonus is paid.
// The goal reached several weeks running earns a background that cannot be bought ("sunrise").
// weekly.run counts the weeks in a row; a week without the goal starts it again.
const GOAL_RUN = 3;
const SUNRISE_BONUS = 5; // more points for every word looked up while the background is in use
const lastWeekKey = () => weekKey(new Date(weekStart().getTime() - 3 * 86400000));
const goalRun = () => {
  const w = state.user.weekly || {};
  return w.claimed === weekKey() || w.claimed === lastWeekKey() ? w.run || 1 : 0;
};
const sunriseOn = () => myShop().bg === "sunrise" && myShop().owned.includes("bg:sunrise");
function checkWeekly() {
  if (weekCount() < weekGoal() || state.user.weekly?.claimed === weekKey()) return;
  const run = state.user.weekly?.claimed === lastWeekKey() ? (state.user.weekly.run || 1) + 1 : 1;
  saveWeekly({ claimed: weekKey(), run });
  setTimeout(() => award(weekBonus(weekGoal()), t("주간 목표 달성!"), true), 1500);
  if (run >= GOAL_RUN && !myShop().owned.includes("bg:sunrise")) setTimeout(earnSunrise, 4400);
}
function earnSunrise() {
  if (!state.user || myShop().owned.includes("bg:sunrise")) return;
  const shop = myShop();
  state.user.shop = { ...shop, owned: [...shop.owned, "bg:sunrise"] };
  api.saveProfile({ shop: state.user.shop }).catch(console.error);
  sfx.grand(shop.character);
  sheet({
    art: art("sunrise"), title: t("특별한 배경을 얻었어요!"),
    text: t("이번 주 목표를 {n}주 연속으로 달성했어요! '황금 햇살' 배경을 쓰는 동안에는 단어를 찾을 때마다 +{p}포인트를 더 받아요.", { n: GOAL_RUN, p: SUNRISE_BONUS }),
    actions: [
      { label: t("지금 적용하기"), kind: "main", run: () => { saveShop({ ...myShop(), bg: "sunrise" }); } },
      { label: t("나중에 할게요"), run: () => true },
    ],
  });
}
// The goal is chosen once a week: after that it stands until next Monday, so it means something.
const weekLocked = () => state.user.weekly?.set === weekKey();
function weeklyGoalSheet() {
  if (weekLocked()) {
    // Once chosen, the pill cheers the student on, or congratulates them when the goal is reached.
    const goal = weekGoal(), count = weekCount(), left = goal - count, p = weekBonus(goal);
    const next = t("다음 주 월요일에 새 목표를 정할 수 있어요.");
    if (left <= 0) {
      return sheet({
        art: art("party"), title: t("이번 주 목표 달성!"),
        text: `${t("이번 주에 단어를 {c}개나 익혔어요. 목표 {n}개를 해냈어요, 정말 멋져요! 보너스 +{p}포인트도 받았어요.", { c: count, n: goal, p })} ${next}`,
        actions: [{ label: t("야호!"), kind: "main", run: () => true }],
      });
    }
    const cheer = count === 0 ? t("퀴즈로 첫 단어부터 익혀 봐요. {n}개까지 함께 가요!", { n: goal })
      : left <= 3 ? t("거의 다 왔어요! {l}개만 더 익히면 목표 달성이에요.", { l: left })
      : count * 2 >= goal ? t("벌써 절반을 넘었어요! {l}개만 더 익히면 돼요.", { l: left })
      : t("잘하고 있어요! 벌써 {c}개 익혔어요. {l}개 더 익혀 봐요.", { c: count, l: left });
    return sheet({
      art: art("flag"), title: t("이번 주 {c} / {n}개", { c: count, n: goal }),
      text: `${cheer} ${t("목표를 채우면 +{p}포인트!", { p })}`,
      actions: [{ label: t("힘낼게요!"), kind: "main", run: () => true }],
    });
  }
  let chosen = weekGoal();
  sheet({
    art: art("target"), title: t("이번 주 목표"),
    text: t("일주일(월~일) 동안 다 익힐 단어 수를 정해요. 퀴즈에서 3번 연속(쓰기 1번 포함) 맞히면 익힌 단어예요. 목표를 채우면 보너스 포인트를 받고, 목표가 클수록 더 많이 받아요. 한 번 정하면 이번 주에는 바꿀 수 없어요."),
    actions: [
      { label: t("이 목표로 정하기"), kind: "main", run: () => {
        saveWeekly({ goal: chosen, set: weekKey() });
        render();
        toastText(t("이번 주 목표: {n}개", { n: chosen }));
        checkWeekly();
      } },
      { label: t("나중에 정하기"), run: () => true },
    ],
  });
  const row = h("div", { class: "goal-picks" }, WEEK_GOALS.map((goal) =>
    h("button", {
      class: "goal-pick", "aria-pressed": String(chosen === goal),
      onclick: (e) => {
        chosen = goal;
        for (const pick of row.children) pick.setAttribute("aria-pressed", String(pick === e.currentTarget));
      },
    }, h("b", null, String(goal)), h("small", null, `+${weekBonus(goal)}`))));
  document.querySelector("#sheet .sheet p")?.after(row);
}

// Two small pills under the search box, the same shape: today's search points, and this week's
// words against the goal. (How many searches are left, and tips, are the character's to say.)
function dailyGoal() {
  const got = searchPointsToday();
  const count = weekCount(), goal = weekGoal();
  const ring = (ratio) => h("i", { class: "goal-ring", style: `--p:${Math.min(1, ratio) * 360}deg`, "aria-hidden": "true" });
  return [h("div", { class: "goals" },
    // What searching has paid today, the Golden sunshine bonus included (so it can read 200 / 100). A tap lists the words.
    h("button", { class: `goal${got >= SEARCH_DAILY_MAX ? " done" : ""}`, title: t("단어를 찾을 때마다 +{p}점", { p: SEARCH_POINTS }), onclick: searchPointsSheet },
      ring(got / SEARCH_DAILY_MAX),
      h("span", { class: "goal-text" }, h("small", null, t("오늘 검색 포인트"), isPlus() && h("em", { class: "plus-badge" }, "PLUS")), h("b", null, `${got + searchBonusToday()} / ${SEARCH_DAILY_MAX}`))),
    h("button", { class: `goal${count >= goal ? " done" : ""}`, title: weekLocked() ? t("이번 주 목표") : t("이번 주 목표 정하기"), onclick: weeklyGoalSheet },
      ring(count / goal),
      h("span", { class: "goal-text" }, h("small", null, weekLocked() ? t("이번 주 익힌 단어") : t("이번 주 목표")), h("b", null, `${count} / ${goal}`)),
      !weekLocked() && h("span", { class: "goal-set" }, t("정하기"))))];
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
    state.user && reaction(myLook(), "cheer"));
  document.body.append(el);
  if (state.user) sfx.cheer(myShop().character);
  if (WEB) syncStage();
  setTimeout(() => { el.remove(); if (WEB) syncStage(); }, 2000);
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
function sheet({ art, title, text, body, actions }) { // body: anything to show between the text and the buttons
  document.getElementById("sheet")?.remove();
  const close = () => el.remove();
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "sheet-art", "aria-hidden": "true" }, art),
      h("h2", null, title),
      h("p", null, text),
      body,
      actions.map(({ label, kind, run }) =>
        h("button", { class: kind === "main" ? "btn wide" : "link", onclick: () => { if (run() !== false) close(); } }, label))));
  document.body.append(el);
  el.querySelector("button")?.focus();
}

async function copyInvite(message, withCode) {
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    return toastText(t("복사하지 못했어요. 다시 눌러 주세요."));
  }
  notePrompt("share", { shared: true });
  // A one-time thank-you for inviting a friend.
  if (!promptLog().share.rewarded) {
    notePrompt("share", { rewarded: true });
    award(SHARE_REWARD, withCode ? t("초대 메시지 복사 완료!") : t("초대 링크 복사 완료!"), true);
  } else {
    toastText(withCode ? t("초대 메시지를 복사했어요. 친구에게 붙여 넣어 보내세요!") : t("초대 링크를 복사했어요. 친구에게 붙여 넣어 보내세요!"));
  }
}

function toastText(text) {
  let box = document.getElementById("toasts");
  if (!box) document.body.append((box = h("div", { id: "toasts", "aria-live": "polite" })));
  const el = h("div", { class: "toast" }, h("span", null, text));
  box.append(el);
  setTimeout(() => el.remove(), 2600);
}

// What gets shared is an invitation, not just a link: VOQUIZ is invite-only, so a friend needs a code.
// The sheet shows one of my unused invite codes and the very message that will be copied (the same
// one as on the friends page). With no code left, it falls back to the link alone.
async function sharePrompt() {
  if (!storeUrl) return;
  notePrompt("share", { last: Date.now() });
  if (state.user && !state.invites) await friends().loadInvites();
  const code = friends().unusedInvites()[0]?.code;
  const message = code ? friends().inviteText(code) : `${t("단어가 쉬워지는 VOQUIZ, 같이 써 보자!")} ${storeUrl}`;
  sheet({
    art: art("letter"),
    title: t("친구랑 같이 하면 더 재미있어요"),
    text: code
      ? t("초대 코드와 설치 링크를 함께 보내요. 친구는 설치한 뒤 이 코드로 가입해요. 처음 복사하면 {n} 단어포인트를 드려요!", { n: SHARE_REWARD })
      : `${t("초대장을 모두 썼어요.")} ${t("초대 링크를 보내면 친구도 바로 설치할 수 있어요. 처음 복사하면 {n} 단어포인트를 드려요!", { n: SHARE_REWARD })}`,
    body: code && [
      h("div", { class: "ticket-code" }, h("small", null, t("초대 코드"), " · ", t("남은 초대장 {n}장", { n: friends().unusedInvites().length })), h("b", null, code)),
      h("div", { class: "share-preview" }, h("small", null, t("이렇게 보내져요")), h("p", null, message)),
    ],
    actions: [
      { label: code ? t("초대 메시지 복사하기") : t("초대 링크 복사하기"), kind: "main", run: () => { copyInvite(message, Boolean(code)); } },
      { label: t("나중에"), run: () => {} },
      { label: t("다시 보지 않기"), run: () => notePrompt("share", { never: true }) },
    ],
  });
}

function ratePrompt() {
  if (!storeUrl) return;
  notePrompt("rate", { last: Date.now() });
  sheet({
    art: art("star"),
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

// Explanations come in both languages. With the screen in Korean or Chinese the Korean one is
// first; with the screen in English the English one is. The second is shown a little quieter.
const koFirst = () => getLang() !== "en";
const both = (ko, en) => {
  const [first, second] = koFirst() ? [ko, en] : [en, ko];
  return [first && h("p", null, first), second && h("p", { class: "en" }, second)];
};
// Where a saying comes from. Entries written before this was recorded get a plain guess from the
// text itself: Hangul means a Korean saying, anything else an English one.
function sayingSource(r) {
  const given = getLang() === "ko" ? r.source_ko : r.source_en;
  if (given) return given;
  const korean = /[가-힣]/.test(r.text || "");
  if (r.kind === "four_character_idiom") return t("한자 문화권의 사자성어");
  return korean ? t("한국 속담") : r.kind === "idiom" ? t("영어 관용구") : t("영어 속담");
}
// The same explanation in the two languages, each in its own labelled box so that it is plain
// which is which. The language of the screen comes first.
function inBoth(ko, en) {
  const parts = [["ko", "한국어", ko], ["en", "English", en]].filter(([, , text]) => text);
  if (!koFirst()) parts.reverse();
  return h("div", { class: "langs-2" }, parts.map(([lang, label, text]) =>
    h("div", { class: `lang-box ${lang}`, lang }, h("span", { class: "lang-tag" }, label), h("p", null, text))));
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

const title = (text, en, ko) => h("h3", null, text, getLang() !== "en" ? h("small", null, en) : WIDE() && ko ? h("small", null, ko) : null);

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
  const english = parts.length > 0 && h("div", { class: "eq-row en" },
    h("span", { class: "lang-tag" }, "English"),
    h("div", { class: "eq" },
      parts.map((p, i) => [
        i > 0 && h("span", { class: "op" }, "+"),
        h("div", { class: "tile" }, h("b", null, p.part), h("span", null, p.meaning_ko), h("small", null, p.meaning_en)),
      ]),
      h("span", { class: "sum" }, h("span", { class: "op" }, "="), h("span", { class: "result" }, en))));
  const korean = hanja.length > 0 && h("div", { class: "eq-row ko" },
    h("span", { class: "lang-tag" }, "한국어"),
    h("div", { class: "eq" },
      hanja.map(syllableTile),
      h("span", { class: "sum" }, h("span", { class: "op" }, "="), h("span", { class: "result" }, ko))));
  return h("div", { class: "eq-rows" }, koFirst() ? [korean, english] : [english, korean]);
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

function kinRows(c, synonyms, antonyms) {
  if (!(synonyms?.length > 0 || antonyms?.length > 0)) return null;
  return h("div", { class: "kin" },
    [[t("비슷한 말"), synonyms, "syn"], [t("반대말"), antonyms, "ant"]].map(([label, list, kind]) =>
      list?.length > 0 && h("div", { class: `kin-row ${kind}` },
        h("span", { class: "kin-label" }, label),
        h("div", { class: "kin-words" }, list.map((w) =>
          h("button", { class: "kin-word", title: t("이 단어 찾기"), onclick: () => search(c.language === "ko" ? w.ko : w.en) },
            h("b", null, w.en), h("span", null, w.ko)))))));
}
// What else to know about a meaning (where it ends, how it differs from a near word). It stands apart
// from the meaning, which stays one sentence, so the meaning is read at a glance.
function noteBox(sense) {
  const lines = (koFirst() ? [sense?.note_ko, sense?.note_en] : [sense?.note_en, sense?.note_ko]).filter(Boolean);
  if (!lines.length) return null;
  return h("div", { class: "sense-note" },
    h("span", { class: "sense-label" }, t("알아 두기")),
    lines.map((text, n) => h("p", { class: n ? "sense-line second" : "sense-line" }, text)));
}
// How the word is used in one meaning: its sentence frames and partner words (balance A on B), each
// with what it is in the other language. The pattern itself, in the headword's language, comes first.
function useRows(c, patterns) {
  const list = (Array.isArray(patterns) ? patterns : []).filter((p) => p?.en && p?.ko);
  if (!list.length) return null;
  return h("div", { class: "sense-use" },
    h("span", { class: "sense-label" }, t("이렇게 써요")),
    list.map((p) => h("p", { class: "use-row" },
      h("b", null, c.language === "ko" ? p.ko : p.en), h("span", null, c.language === "ko" ? p.en : p.ko))));
}
// ----- a wide window: a word's two languages side by side -----
// Two dictionaries next to each other. For an English word: an English-English one (the word
// explained in English) and an English-Korean one (the same word explained in Korean); for a
// Korean word the same the other way round. The language of the screen stands on the left (an
// English screen: English-English on the left; a Korean or Chinese one: English-Korean on the left).
// Each side is whole by itself (its own word and part of speech, its own labels, its own text), so
// either column can be read alone from top to bottom. What is being explained stands on both sides
// as it is: the sentence the word is used in, a pattern, a similar word, the syllables of the Korean
// word. The side of the other language adds what each of them means.
const DUO_ALL = "wb_dk_senses"; // "open": the student asked for every meaning opened
const duoOpen = new Map(); // word -> the places of its meanings that are open
let duoFresh = ""; // "word|place" of the meaning opened by the last press: only that one comes in with a move
function duoSides() {
  const far = getLang() === "en" ? "ko" : "en";
  return [{ lang: koFirst() ? "ko" : "en", say: (key) => t(key) }, { lang: far, say: (key) => tIn(far, key) }];
}
function duoSense(c, sense, whole = false) { // whole: a word's only meaning (its examples, origin and similar words have sections of their own)
  const sides = duoSides();
  const own = c.language === "ko" ? "ko" : "en"; // the language of the word itself
  // One row: the same thing on the two sides. flat: the same once, for a window with no room for two columns.
  const row = (kind, cell, flat = null) => {
    const cells = sides.map(cell);
    if (!cells.some(Boolean)) return null;
    return h("div", { class: `duo d-${kind}` },
      cells.map((content, n) => h("div", { class: n ? "duo-cell other" : "duo-cell" }, content)),
      flat && h("div", { class: "duo-flat" }, flat));
  };
  const labelled = (side, key, content) => [h("span", { class: "sense-label" }, side.say(key)), content];
  const line = (text) => h("p", { class: "sense-line" }, text);
  const pos = String(sense.part_of_speech || "").split("·").map((part) => part.trim()); // "noun · 명사"
  const word = (lang) => (lang === own ? c.headword : sense.counterpart || c.counterpart);
  const patterns = (Array.isArray(sense.patterns) ? sense.patterns : []).filter((p) => p?.en && p?.ko);
  const tiles = () => h("div", { class: "eq-rows" }, h("div", { class: "eq-row ko" }, h("div", { class: "eq" },
    String(sense.hun_eum).split("+").map((part) => part.trim()).filter(Boolean).map((part) => syllableTile({ hun_eum: part, meaning_en: "" })),
    h("span", { class: "sum" }, h("span", { class: "op" }, "="), h("span", { class: "result" }, word("ko"))))));
  const kin = [["비슷한 말", sense.synonyms, "syn"], ["반대말", sense.antonyms, "ant"]]
    .map(([key, list, kind]) => [key, (Array.isArray(list) ? list : []).filter((w) => w?.[own]), kind]).filter(([, list]) => list.length > 0);
  return [
    row("head", (side) => {
      const kind = side.lang === "ko" ? pos[1] || pos[0] : pos[0], name = word(side.lang);
      return kind || name ? [kind && h("span", { class: "sense-pos" }, kind), name && h("b", null, name)] : null;
    }),
    row("def", (side) => sense[`definition_${side.lang}`] && h("p", { class: "sense-def" }, sense[`definition_${side.lang}`])),
    row("note", (side) => sense[`note_${side.lang}`] && labelled(side, "알아 두기", line(sense[`note_${side.lang}`]))),
    // The sentence itself on both sides, and what it says on the side of the other language.
    !whole && (sense.example_ko || sense.example_en) && row("ex", (side) => labelled(side, "예문", [
      sense[`example_${own}`] && line(sense[`example_${own}`]),
      side.lang !== own && sense[`example_${side.lang}`] && h("p", { class: "sense-line gloss" }, sense[`example_${side.lang}`])]),
      h("div", { class: "sense-ex" }, h("span", { class: "sense-label" }, t("예문")),
        (koFirst() ? [sense.example_ko, sense.example_en] : [sense.example_en, sense.example_ko]).filter(Boolean).map((text, n) => h("p", { class: n ? "sense-line second" : "sense-line" }, text)))),
    // How the word is used: the pattern itself on both sides, and what it means on the side of the other language.
    patterns.length > 0 && row("use", (side) => labelled(side, "이렇게 써요", patterns.map((p) =>
      h("p", { class: "use-row" }, h("b", null, p[own]), side.lang !== own && h("span", null, p[side.lang])))), useRows(c, patterns)),
    !whole && row("origin", (side) => (sense.hun_eum || sense[`origin_${side.lang}`])
      && labelled(side, "어디서 온 말일까?", [sense.hun_eum && tiles(), sense[`origin_${side.lang}`] && line(sense[`origin_${side.lang}`])])),
    // Similar and opposite words: the words themselves on both sides, each with its meaning on the side of the other language.
    !whole && kin.length > 0 && row("kin", (side) => h("div", { class: "kin" }, kin.map(([key, list, kind]) =>
      h("div", { class: `kin-row ${kind}` },
        h("span", { class: "kin-label" }, side.say(key)),
        h("div", { class: "kin-words" }, list.map((w) =>
          h("button", { class: "kin-word", title: side.say("이 단어 찾기"), onclick: () => search(w[own]) },
            h("b", null, w[own]), side.lang !== own && w[side.lang] && h("span", null, w[side.lang]))))))),
      kinRows(c, sense.synonyms, sense.antonyms)),
  ];
}
// A sentence of a word with one meaning, in both languages. In a wide window it is two columns
// like the meanings: the sentence alone on the side of the word's own language, the sentence and
// what it says on the other side.
function exampleLines(e, c) {
  if (!WIDE()) return h("div", null, koFirst()
    ? [h("p", null, highlight(e.ko, c)), h("p", { class: "en" }, highlight(e.en, c))]
    : [h("p", null, highlight(e.en, c)), h("p", { class: "en" }, highlight(e.ko, c))]);
  const own = c.language === "ko" ? "ko" : "en";
  return h("div", { class: "duo-ex" }, duoSides().map((side) => h("div", { class: side.lang === own ? "mono" : "" },
    h("p", null, highlight(e[own], c)), side.lang !== own && h("p", { class: "en" }, highlight(e[side.lang], c)))));
}
// Do the meanings carry their own similar and opposite words? (Entries written before that do not.)
const kinBySense = (c) => manySenses(c) && c.senses.some((sense) => Array.isArray(sense?.synonyms) || Array.isArray(sense?.antonyms));
const WHOLE_WORD = ["story", "kin", "say"]; // order of the sections under a word with several meanings
function entryBlocks(word) {
  const c = word.content;
  const sections = [
    ["kin", title(t("비슷한 말 · 반대말"), "SYNONYMS · ANTONYMS", "비슷한 말 · 반대말"), !kinBySense(c) && kinRows(c, c.synonyms, c.antonyms)],
    // The word split into its parts and the story of where it comes from are one thing: both say
    // what the word is made of. (How to remember a meaning is shown with that meaning.)
    ["story", title(t("어디서 온 말일까?"), "ORIGIN", "어디서 온 말일까?"),
      (buildBlock(c) || c.origin_ko || c.origin_en) && [
        buildBlock(c),
        (c.origin_ko || c.origin_en) && h("div", { class: "tip-box" }, inBoth(c.origin_ko, c.origin_en)),
      ]],
    ["ex", title(t("예문"), "EXAMPLES", "예문"),
      c.examples?.length > 0 && h("ol", null, c.examples.map((e, i) => h("li", null,
        h("span", { class: "num" }, String(i + 1)),
        exampleLines(e, c))))],
    ["say", title(t("속담·사자성어"), "SAYINGS", "속담·사자성어"),
      c.related?.length > 0 && h("ul", null, c.related.map((r) => h("li", null,
        h("span", { class: "tag" }, KIND()[r.kind] || ""),
        h("span", { class: "tag from" }, sayingSource(r)),
        h("p", { class: "saying" }, r.text),
        WIDE() ? h("div", { class: "pair" }, both(r.meaning_ko, r.meaning_en)) : both(r.meaning_ko, r.meaning_en))))],
  ].filter(([name, , content]) => content && !(manySenses(c) && name === "ex"))
    .sort((a, b) => (manySenses(c) ? WHOLE_WORD.indexOf(a[0]) - WHOLE_WORD.indexOf(b[0]) : 0));

  // A random one to three sections start covered (picked once per word), so there is always
  // something to uncover without hiding the whole entry.
  state.hidden[word.term_norm] ??= new Set(
    sections.map(([name]) => name).sort(() => Math.random() - 0.5).slice(0, randomInt(1, 3)));
  return sections.map(([name, heading, content]) => block(word, name, heading, content));
}

// ----- hearing the word -----
// The device's own voices read it (the browser's speech synthesis): nothing is sent anywhere, it
// costs nothing and it works for every word. An English word is read the American way, a Korean
// word in standard Korean. (A British button was tried and taken out: some devices list a British
// voice and then read with the default one, which the page cannot notice.)
const SAY = { en: ["en-US", "미국식 발음 듣기"], ko: ["ko-KR", "발음 듣기"] }; // an English word is read the American way
const canSay = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
if (canSay()) speechSynthesis.getVoices(); // asks the browser to load its list early
function voiceFor(lang) {
  const all = speechSynthesis.getVoices();
  const fit = all.filter((v) => String(v.lang).replace("_", "-").toLowerCase() === lang.toLowerCase());
  // A device lists many voices for one language, some of them toys. The natural ones first:
  // Chrome's "Google" voices and the systems' newer ones, then each system's standard voice.
  const score = (v) => (/Google|Natural|Premium|Enhanced|Siri/i.test(v.name) ? 4 : 0)
    + (/Samantha|Ava|Allison|Daniel|Kate|Serena|Yuna|Zira|Aria|Jenny|Hazel|Sonia|Libby|Heami|SunHi/i.test(v.name) ? 2 : 0)
    + (v.default ? 1 : 0)
    - (/Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Albert|Bad News|Good News|Bahh|Bells|Boing|Bubbles|Cellos|Jester|Junior|Kathy|Organ|Ralph|Fred|Superstar|Trinoids|Whisper|Wobble|Zarvox/i.test(v.name) ? 6 : 0);
  const voice = fit.reduce((best, v) => (!best || score(v) > score(best) ? v : best), null);
  return { loaded: all.length > 0, voice };
}
function sayWord(text, lang, button) {
  const { loaded, voice } = voiceFor(lang);
  if (loaded && !voice) return toastText(t("이 기기에는 이 발음을 들려줄 음성이 없어요."));
  speechSynthesis.cancel();
  const say = new SpeechSynthesisUtterance(text);
  say.lang = voice?.lang || lang;
  if (voice) say.voice = voice;
  say.rate = 0.9; // a little slower than talk, so each sound is heard
  document.querySelectorAll(".speak.on").forEach((el) => el.classList.remove("on"));
  button?.classList.add("on");
  say.onend = say.onerror = () => button?.classList.remove("on");
  speechSynthesis.speak(say);
}
function sayButtons(c) {
  if (!canSay() || !c?.headword || !SAY[c.language]) return null;
  const [lang, title] = SAY[c.language];
  return h("button", { class: "speak", title: t(title), "aria-label": t(title), onclick: (e) => sayWord(c.headword, lang, e.currentTarget) },
    h("i", { "aria-hidden": "true" }, "▶"));
}

function hero(c, word) {
  const duo = WIDE() && !manySenses(c); // a wide window: the one meaning in two columns, each with the word in its language
  return h("section", { class: "hero" },
    word && star(word),
    word?.discovered && h("div", { class: "found-line" }, h("i", { "aria-hidden": "true" }, "✦"), t("내가 처음 발견한 단어")),
    h("h2", null, c.headword),
    !manySenses(c) && !duo && h("div", { class: "cp" }, h("small", null, "⇄"), c.counterpart),
    h("div", { class: "meta" }, [c.pronunciation, !manySenses(c) && !duo && c.part_of_speech].filter(Boolean).join("  ·  "), sayButtons(c)),
    word && levelBar(word), // always here: under the word, above its meanings
    manySenses(c) ? sensesList(c, word?.term_norm || c.headword)
    : duo ? h("div", { class: "duo-rows" }, duoSense(c, { ...(c.senses?.[0] || {}), definition_ko: c.definition_ko, definition_en: c.definition_en, part_of_speech: c.part_of_speech, counterpart: c.counterpart }, true))
    : [
      h("div", { class: "def" }, koFirst()
        ? [h("p", null, c.definition_ko), h("p", null, c.definition_en)]
        : [h("p", null, c.definition_en), h("p", null, c.definition_ko)]),
      noteBox(c.senses?.[0]),
      useRows(c, c.senses?.[0]?.patterns),
    ]);
}
// A word with several parts of speech or meanings: each one with its own label, its equivalent in
// the other language, its meaning in both languages and an example. (Older entries have one.)
const manySenses = (c) => Array.isArray(c.senses) && c.senses.filter((sense) => sense?.definition_ko || sense?.definition_en).length > 1;
// The meanings as a list that opens: each row shows the part of speech, the word in the other
// language and the meaning at a glance; opening a row adds the other language, an example and a
// way to remember that meaning. The first one starts open.
const posIn = (label) => { const parts = String(label || "").split("·").map((part) => part.trim()); return (koFirst() ? parts[1] : parts[0]) || parts[0] || ""; };
function sensesList(c, key) {
  const senses = c.senses.filter((sense) => sense?.definition_ko || sense?.definition_en);
  const wide = WIDE(); // the two languages of each meaning side by side (duoSense)
  const open = wide ? new Set() : (state.openSense[key] ??= new Set([0]));
  const pair = (ko, en) => (koFirst() ? [ko, en] : [en, ko]).filter(Boolean);
  // "동사 2 · 명사 1": what kinds of word this is, at a glance.
  const kinds = new Map();
  for (const sense of senses) kinds.set(posIn(sense.part_of_speech), (kinds.get(posIn(sense.part_of_speech)) || 0) + 1);
  // A wide window: every meaning shows its word and what it means, and no more, so that all the
  // meanings are seen at once. A press on a meaning opens the rest of it (its example, how it is
  // used, where it comes from, similar words). "모두 펼치기" is remembered for the words after this one.
  if (wide) {
    if (!duoOpen.has(key)) duoOpen.set(key, new Set(localStorage.getItem(DUO_ALL) === "open" ? senses.keys() : []));
    const shown = duoOpen.get(key);
    const parts = senses.map((sense) => {
      const rows = duoSense(c, sense).filter(Boolean);
      const top = (row) => row.classList.contains("d-head") || row.classList.contains("d-def");
      return { top: rows.filter(top), more: rows.filter((row) => !top(row)) };
    });
    const allOpen = parts.every((part, i) => !part.more.length || shown.has(i));
    const setAll = (on) => {
      on ? localStorage.setItem(DUO_ALL, "open") : localStorage.removeItem(DUO_ALL);
      duoOpen.clear();
      duoOpen.set(key, new Set(on ? senses.keys() : []));
      render();
    };
    return h("div", { class: "senses-box" },
      h("div", { class: "senses-sum" },
        h("b", null, t("뜻 {n}개", { n: senses.length })),
        [...kinds].filter(([kind]) => kind).map(([kind, n]) => h("span", { class: "sense-pos" }, n > 1 ? `${kind} ${n}` : kind)),
        parts.some((part) => part.more.length > 0) && h("button", { class: "link senses-all duo-all", onclick: () => setAll(!allOpen) }, allOpen ? t("모두 접기") : t("모두 펼치기"))),
      h("ol", { class: "senses" }, parts.map(({ top, more }, i) => {
        const isOpen = more.length > 0 && shown.has(i);
        const fresh = isOpen && duoFresh === `${key}|${i}`;
        if (fresh) duoFresh = "";
        const toggle = () => { shown.has(i) ? shown.delete(i) : shown.add(i); duoFresh = shown.has(i) ? `${key}|${i}` : ""; render(); };
        // The word and its meaning are the handle too (not while text in them is being selected).
        if (more.length) for (const row of top) { row.classList.add("duo-tap"); row.onclick = () => { if (!String(getSelection())) toggle(); }; }
        return h("li", { class: `duo-li${isOpen ? " open" : ""}${fresh ? " fresh" : ""}` },
          h("span", { class: "sense-no", "aria-hidden": "true" }, String(i + 1)),
          h("div", { class: "duo-rows" }, top, isOpen && more),
          more.length > 0 && h("button", { class: "duo-toggle", "aria-expanded": String(isOpen), title: isOpen ? t("접기") : t("펼치기"), "aria-label": isOpen ? t("접기") : t("펼치기"), onclick: toggle },
            h("span", null, isOpen ? t("접기") : t("펼치기")), h("i", { "aria-hidden": "true" }, "⌄")));
      })));
  }
  return h("div", { class: "senses-box" },
    h("div", { class: "senses-sum" },
      h("b", null, t("뜻 {n}개", { n: senses.length })),
      [...kinds].filter(([kind]) => kind).map(([kind, n]) => h("span", { class: "sense-pos" }, n > 1 ? `${kind} ${n}` : kind)),
      h("button", { class: "link senses-all", onclick: () => { state.openSense[key] = open.size === senses.length ? new Set() : new Set(senses.keys()); render(); } },
        open.size === senses.length ? t("모두 접기") : t("모두 펼치기"))),
    h("ol", { class: "senses" }, senses.map((sense, i) => {
      const [first, second] = pair(sense.definition_ko, sense.definition_en);
      const shown = open.has(i);
      return h("li", { class: shown ? "open" : "" },
        h("button", { class: "sense-row", "aria-expanded": String(shown), onclick: () => { shown ? open.delete(i) : open.add(i); render(); } },
          h("span", { class: "sense-no", "aria-hidden": "true" }, String(i + 1)),
          h("span", { class: "sense-main" },
            h("span", { class: "sense-head" }, sense.part_of_speech && h("span", { class: "sense-pos" }, posIn(sense.part_of_speech)), sense.counterpart && h("b", null, sense.counterpart)),
            h("span", { class: "sense-def" }, first)),
          h("i", { class: "sense-chev", "aria-hidden": "true" }, "⌄")),
        shown && h("div", { class: "sense-more" },
          second && h("p", { class: "sense-def second" }, second),
          noteBox(sense),
          (sense.example_ko || sense.example_en) && h("div", { class: "sense-ex" },
            h("span", { class: "sense-label" }, t("예문")),
            pair(sense.example_ko, sense.example_en).map((text, n) => h("p", { class: n ? "sense-line second" : "sense-line" }, text))),
          useRows(c, sense.patterns),
          // Words that are only spelled alike (가정: a home, a supposition) each come from somewhere else.
          (sense.hun_eum || sense.origin_ko || sense.origin_en) && h("div", { class: "sense-origin" },
            h("span", { class: "sense-label" }, t("어디서 온 말일까?")),
            sense.hun_eum && h("div", { class: "eq-rows" }, h("div", { class: "eq-row ko" }, h("div", { class: "eq" },
              String(sense.hun_eum).split("+").map((part) => part.trim()).filter(Boolean).map((part) => syllableTile({ hun_eum: part, meaning_en: "" })),
              h("span", { class: "sum" }, h("span", { class: "op" }, "="), h("span", { class: "result" }, c.language === "ko" ? c.headword : sense.counterpart))))),
            pair(sense.origin_ko, sense.origin_en).map((text, n) => h("p", { class: n ? "sense-line second" : "sense-line" }, text))),
          kinRows(c, sense.synonyms, sense.antonyms)));
    })));
}

// ----- another level of explanation ("더 쉽게 / 더 자세히") -----
// The same word as it is explained to another group of grades. It is only looked at: the word list,
// the quizzes and the daily search count stay with the student's own grade.
const levelCache = new Map(); // "term|band" -> content
const levelOf = (word) => (state.level?.term === word.term_norm ? state.level : null);
const shownBand = (word) => BANDS.find((band) => band.id === levelOf(word)?.band) || bandOf(state.user.grade);
const shownContent = (word) => levelOf(word)?.content || word.content;
async function showLevel(word, band) {
  if (band === bandOf(state.user.grade)) { state.level = null; return render(); }
  const key = `${word.term_norm}|${band.id}`;
  const settle = (content) => ({ term: word.term_norm, band: band.id, content });
  if (levelCache.has(key)) { state.level = settle(levelCache.get(key)); return render(); }
  const before = levelOf(word);
  const mine = () => state.level?.term === word.term_norm && state.level.band === band.id; // still the one asked for?
  state.level = { ...settle(before?.content || null), busy: true };
  render();
  try {
    const result = await api.lookupLevel(word.term_norm, band.id, (partial) => showLevelPartial(word, band, partial));
    if (!result.valid) throw new Error("level_unavailable");
    levelCache.set(key, cleanEntry(result.content));
    if (mine()) state.level = settle(levelCache.get(key));
  } catch (err) {
    console.error(err);
    if (mine()) state.level = before?.content ? before : null;
    toastText(t("이 수준의 설명을 가져오지 못했어요. 잠시 뒤에 다시 눌러 주세요."));
  }
  render();
}
// A level nobody has opened yet is written on the spot, which takes a while: its text is shown as
// it arrives, the way a new word is. (A level that is already stored comes at once, and nothing of
// this is seen.) The first piece switches the card to the live view; later pieces only change it.
let levelFrame = 0;
function showLevelPartial(word, band, partial) {
  const level = state.level;
  if (!level?.busy || level.term !== word.term_norm || level.band !== band.id) return; // not the one asked for any more
  if (!partial || partial.valid === false || !partial.headword) return;
  const first = !level.live;
  level.live = cleanEntry(partial);
  if (first) return render();
  if (levelFrame) return;
  levelFrame = setTimeout(() => {
    levelFrame = 0;
    const box = document.getElementById("level-live");
    if (box?.liveParts && state.level?.live) updateLive(box.liveParts, state.level.live);
  }, 60);
}
function levelLive(word) {
  const box = h("div", { id: "level-live", role: "status", "aria-live": "polite" });
  box.liveParts = buildLive(box, levelBar(word));
  if (manySenses(word.content)) box.liveParts.cp.remove(); // as in the finished card, so the switch does not move
  updateLive(box.liveParts, levelOf(word).live);
  return box;
}
function levelBar(word) {
  const own = bandOf(state.user.grade), at = shownBand(word), i = BANDS.indexOf(at), busy = Boolean(levelOf(word)?.busy);
  return h("div", { class: `level-bar${busy ? " busy" : ""}` },
    h("button", { class: "level-step", disabled: busy || i === 0, onclick: () => showLevel(word, BANDS[i - 1]) }, h("i", { "aria-hidden": "true" }, "‹"), t("더 쉽게")),
    h("div", { class: "level-now", role: "status", title: t(at.name) },
      h("span", { class: "level-meter", "aria-hidden": "true" }, BANDS.map((_, n) => h("i", { class: n <= i ? "on" : "" }))),
      h("b", { class: "level-chip" }, at.label),
      busy ? h("small", { class: "level-wait" }, t("준비 중…")) : at === own ? h("small", { class: "level-mine" }, t("내 학년")) : h("span", { class: "sr-only" }, t(at.name))),
    h("button", { class: "level-step", disabled: busy || i === BANDS.length - 1, onclick: () => showLevel(word, BANDS[i + 1]) }, t("더 자세히"), h("i", { "aria-hidden": "true" }, "›")));
}

// Beside a result in a wide window: the words looked up today, each one tap away, and the next
// step from here: a quiz on exactly these words, or the whole list.
function todayBox() {
  const today = state.words.filter((w) => dayOf(w.last_searched_at) === todayKey());
  if (!today.length) return null;
  const open = (w) => { Object.assign(state, { entry: w, notice: null, level: null }); render(); };
  return h("section", { class: "today-box" },
    h("h3", null, t("오늘 찾은 단어"), h("small", null, t("{n}개", { n: today.length }))),
    h("div", { class: "chips" }, today.slice(0, 14).map((w) =>
      h("button", { class: "chip", "aria-pressed": String(state.entry?.term_norm === w.term_norm), onclick: () => open(w) }, w.headword))),
    h("button", { class: "btn ghost wide", onclick: () => { Object.assign(state, { tab: "quiz", notice: null, scope: { type: "days", days: 1, custom: true } }); render(); } }, t("오늘 찾은 단어로 퀴즈")),
    h("button", { class: "link", onclick: () => { Object.assign(state, { tab: "words", wordLang: "recent", filter: "all", listWord: null, notice: null }); render(); } }, t("단어장에서 모두 보기")));
}
// Desktop: what stands beside an open word, in the right column (its origin, sayings, similar words).
function entrySide(word) {
  if (levelOf(word)?.busy && levelOf(word).live) return null;
  const content = shownContent(word);
  return entryBlocks(content === word.content ? word : { ...word, content }).filter((el) => el && !el.classList.contains("ex"));
}
function entryCard(word, flat = false) { // flat: one column even in a wide window (beside the word list)
  if (levelOf(word)?.busy && levelOf(word).live) return h("article", { class: "entry" }, levelLive(word));
  const content = shownContent(word);
  const blocks = entryBlocks(content === word.content ? word : { ...word, content }).filter(Boolean);
  const foot = h("div", { class: "card-foot" },
    h("button", { class: "link", onclick: () => removeWord(word) }, t("단어장에서 삭제")));
  // A wide window: the meanings (and the examples of a one-meaning word) on the left, to read down;
  // beside them, staying in view, where the word comes from, its sayings and its similar words.
  return h("article", { class: "entry" }, hero(content, word), blocks, foot);
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
  ["senses", t("다른 품사와 뜻")],
  ["hanja_word", t("어디서 온 말일까?")],
  ["examples", t("예문")],
  ["related", t("속담·사자성어")],
];

// The live view is built once and then only its text and marks are changed. Rebuilding it for every
// piece that arrives restarted every animation, which made the checklist flash.
function buildLive(box, between = null) { // between: what goes under the word (the level switch)
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
  el.def.append(...(koFirst() ? [el.defKo, el.defEn] : [el.defEn, el.defKo]));
  box.className = "live-box";
  box.replaceChildren(h("div", { class: "live" },
    h("section", { class: "hero" }, el.headword, el.cp, el.meta, between, el.def),
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
// What the character on the first screen offers when it is tapped, when something waits (the rule
// of design.md, section 13: what to do next is the character's to say). The first that applies:
// what it says, and the faint link that then shows under it. A new feature adds a line here.
function petOffer() {
  const eve = eveLine();
  return [
    claimable().length > 0 && { say: t("받을 수 있는 캐릭터가 있어!"), label: t("캐릭터 받기"), act: openShop },
    grow().waiting().length > 0 && { say: t("레벨 선물이 기다려! 받으러 갈까?"), label: t("레벨 선물 받기"), act: () => grow().openLevels() },
    grow().canDraw() && { say: t("뽑기를 돌릴 수 있어!"), label: t("뽑기 하러 가기"), act: () => grow().openGacha() },
    eve && { say: eve.text, label: eve.tab === "rank" ? t("순위 보러 가기") : t("퀴즈 하러 가기"), act: () => goTab(eve.tab) },
  ].find(Boolean) || null;
}
// What a character says of itself when it is tapped, so that it feels like a pet with a nature of
// its own: its own line (character-lines.js), lines for its kind (an animal, a plant, a sweet, a
// thing), and a few any character may say. They come between the offers, at random.
const PET_LINES = {
  "동물": ["쓰다듬어 줘서 좋아! 한 번 더?", "킁킁, 새 단어 냄새가 나!", "산책하듯 단어 하나 찾으러 갈래?"],
  "식물·과일": ["햇빛이랑 단어만 있으면 쑥쑥 커!", "오늘도 한 뼘 자랐어. 너도 그렇지?", "물 대신 단어 한 모금 줄래?"],
  "디저트": ["달콤한 단어 하나 먹을래?", "한 입만… 아니, 한 단어만 더!", "공부하고 나면 내가 더 달아져!"],
  "물건": ["딸깍! 준비 완료야.", "오늘도 반짝반짝 닦아 뒀어!", "나를 꺼내 줘서 고마워!"],
  "기타": ["오늘 기분 어때? 나는 최고야!", "네가 오면 심심하지 않아.", "비밀인데, 네가 제일 좋아."],
  all: ["간지러워, 히히!", "오늘 뭐 배웠는지 말해 줘!", "나 여기 있었어. 기다렸지?"],
};
function petTalk() {
  const id = myShop().character;
  const own = CHARACTER_LINES[id]?.[["ko", "en", "zh"].indexOf(getLang())] || "";
  const who = CHARACTERS.find((c) => c.id === id);
  const pool = [own, own, grow().nextGiftLine(), ...(PET_LINES[who ? kindOf(who) : "기타"] || PET_LINES["기타"]).map((line) => t(line)), ...PET_LINES.all.map((line) => t(line))].filter(Boolean);
  let line = pool[Math.floor(Math.random() * pool.length)];
  if (line === state.petSaid) line = pool[(pool.indexOf(line) + 1) % pool.length]; // never the same line twice in a row
  state.petSaid = line;
  return line;
}
// A tap on the character: what it gives or says. A present now and then; what waits, every other
// tap; otherwise something of its own, or a word to try.
function petTap() {
  state.pets = (state.pets || 0) + 1;
  return mascotGift() || (state.pets % 2 === 1 && petOffer()?.say) || (Math.random() < 0.65 ? petTalk() : mascotSuggests()) || petTalk();
}
function mascotGift() {
  const key = `wb_gift_${state.user.id}`;
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  const given = isToday(saved?.day) ? saved.points : 0;
  if (given >= GIFT_DAILY_MAX || Math.random() >= GIFT_CHANCE) return null;
  const gift = Math.min(randomInt(1, 3), GIFT_DAILY_MAX - given);
  localStorage.setItem(key, JSON.stringify({ day: keepDay(saved?.day), points: given + gift }));
  award(gift, t("캐릭터가 준 선물!"));
  return t("선물이야!");
}

const quotaKey = () => `${todayKey()}:${searchesLeft()}:${weekCount()}`;
// How many searches are left today, in the character's own words. It says so when the home
// screen opens and again whenever the number has changed, not on every redraw.
function quotaLine() {
  if (state.quotaSaid === quotaKey()) return null;
  // Sometimes it is about the week instead of the day.
  const toGo = weekGoal() - weekCount();
  const week = toGo > 0 ? t("이번 주 목표까지 {n}개 더 익히면 돼!", { n: toGo }) : null;
  if (!plansOn() || isPlus() || limitReached()) return week;
  if (week && Math.random() < 0.4) return week;
  const left = searchesLeft();
  return left === FREE_SEARCHES ? t("오늘은 단어 {n}개를 찾을 수 있어!", { n: left })
    : left <= 3 ? t("오늘은 {n}번만 더 찾을 수 있어!", { n: left })
    : t("오늘 {n}번 더 찾을 수 있어!", { n: left });
}

// ----- the web version's home: as bare as a search engine's -----
// The word box in the middle, two things worth doing next under it, and nothing else. The
// student's characters are in the yard at the bottom of the window instead of in the page.
const webHome = () => WIDE() && state.tab === "search" && !state.busy && !state.entry && !state.notice;
// One line about collecting characters: a character ready to be taken, or else the quest nearest
// to done with how far it has come. It opens the point shop, where the quests are.
function questHint() {
  if (claimable().length > 0) return h("button", { class: "quest-hint ready", onclick: openShop }, t("받을 수 있는 캐릭터가 있어요"), h("i", { "aria-hidden": "true" }, " →"));
  const next = earnedCharacters().filter((c) => !ownsCharacter(c) && QUESTS[c.earn.by])
    .sort((a, b) => questNow(b) / b.earn.goal - questNow(a) / a.earn.goal)[0];
  if (!next) return null;
  return h("button", { class: "quest-hint", title: t("포인트샵 열기"), onclick: openShop },
    h("span", { class: "quest-face", "aria-hidden": "true" }, portrait(next.id)),
    h("span", null, t("캐릭터 퀘스트"), " · ", QUESTS[next.earn.by].text(next.earn.goal)),
    h("b", null, `${questNow(next)} / ${next.earn.goal}`));
}
// The day at a glance, on the first screen of the desktop frame: what searching has paid today, how
// far the week's goal is, and the character quest that is nearest. Each opens its own detail.
function todayRow() {
  const got = searchPointsToday(), count = weekCount(), goal = weekGoal();
  const meter = (ratio, label, value, act, title) => h("button", { class: `today-meter${ratio >= 1 ? " done" : ""}`, title, onclick: act },
    h("i", { class: "goal-ring", style: `--p:${Math.min(1, Math.max(0, ratio)) * 360}deg`, "aria-hidden": "true" }),
    h("span", null, label), h("b", null, value));
  const quest = earnedCharacters().filter((c) => !ownsCharacter(c) && QUESTS[c.earn.by])
    .sort((a, b) => questNow(b) / b.earn.goal - questNow(a) / a.earn.goal)[0];
  return h("div", { class: "web-today", role: "group", "aria-label": t("오늘") },
    meter(got / SEARCH_DAILY_MAX, t("오늘 검색 포인트"), `${got + searchBonusToday()} / ${SEARCH_DAILY_MAX}`, searchPointsSheet, t("단어를 찾을 때마다 +{p}점", { p: SEARCH_POINTS })),
    meter(count / goal, weekLocked() ? t("이번 주 익힌 단어") : t("이번 주 목표"), `${count} / ${goal}`, weeklyGoalSheet, weekLocked() ? t("이번 주 목표") : t("이번 주 목표 정하기")),
    claimable().length === 0 && quest && meter(questNow(quest) / quest.earn.goal, `${t("캐릭터 퀘스트")} · ${QUESTS[quest.earn.by].text(quest.earn.goal)}`, `${questNow(quest)} / ${quest.earn.goal}`, openShop, t("포인트샵 열기")));
}
// Under the word box of the first screen: only how the day and the week stand. What to do next
// (the present, a quiz, the word of the day, a character to take) is the yard character's to say.
function webActions() {
  return [dailyWordCard(), todayRow()];
}
function webQuiet() {
  const recent = WIDE() ? [] : state.words.slice(0, 8);
  const open = (w) => { Object.assign(state, { entry: w, notice: null }); render(); };
  return h("div", { class: "web-quiet" },
    duel().banner(),
    friends().banner(),
    limitReached() && h("p", { class: "small muted" }, t("오늘 검색 {n}개를 모두 썼어요. 이미 찾은 단어는 단어장에서 볼 수 있어요.", { n: FREE_SEARCHES })),
    recent.length > 0 && h("div", { class: "chips center recent" }, recent.map((w) => h("button", { class: "chip", onclick: () => open(w) }, w.headword))));
}
// Who is in the yard: the student's own character, and the others they chose to put there.
let yardCast = null;
let yardTurn = 0; // how many suggestions the characters have made
let yardHeld = false; // while the frame is redrawn for a phone, the yard keeps its characters for their run out
const YARD_MAX = 8; // besides the student's own character: nine in all
function yardSheet() {
  document.getElementById("sheet")?.remove();
  const lead = myShop().character;
  const mine = ALL_CHARACTERS.filter((c) => c.id !== lead && (ownsCharacter(c) || (c.cost === 0 && !c.earn)));
  // Starts from what is in the yard now, so opening the sheet changes nothing by itself.
  let picked = (Array.isArray(myShop().yard) ? myShop().yard : []).filter((id) => mine.some((c) => c.id === id));
  const close = () => el.remove();
  const count = h("b", null);
  const grid = h("div", { class: "yard-grid" });
  const empty = h("button", { class: "link small", onclick: () => { picked = []; saveShop({ ...myShop(), yard: picked }); draw(); } }, t("모두 빼기"));
  const draw = () => {
    count.textContent = `${picked.length} / ${YARD_MAX}`;
    empty.hidden = picked.length === 0;
    for (const button of grid.children) button.setAttribute("aria-pressed", String(picked.includes(button.dataset.id)));
  };
  const toggle = (id) => {
    if (picked.includes(id)) picked = picked.filter((x) => x !== id);
    else if (picked.length < YARD_MAX) picked = [...picked, id];
    else return toastText(t("내 캐릭터까지 {n}마리가 함께 다닐 수 있어요.", { n: YARD_MAX + 1 }));
    saveShop({ ...myShop(), yard: picked }); // kept with the account, so the yard is the same on every computer
    draw();
  };
  grid.append(...mine.map((c) => h("button", { class: "yard-pick", "data-id": c.id, title: c.name, "aria-label": c.name, onclick: () => toggle(c.id) }, portrait(c.id))));
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet yard-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("함께 다닐 캐릭터 고르기") },
      h("h2", null, t("함께 다닐 캐릭터 고르기")),
      h("p", null, t("눌러서 넣거나 빼세요. 고른 캐릭터는 화면 아래에서 내 캐릭터와 함께 다녀요."), " ", count, " ", empty),
      mine.length > 0 ? grid : h("p", { class: "small" }, t("아직 다른 캐릭터가 없어요. 포인트샵에서 캐릭터를 모아 보세요.")),
      h("button", { class: "btn wide", onclick: close }, t("닫기"))));
  draw();
  document.body.append(el);
}
// Where the app draws the student's own character (a result, the start of a duel, a celebration):
// the one in the yard goes there instead of standing below as a second one (yard.js, the stage).
const OWN_ART = ".feedback .art .mascot, .score-art .mascot, .versus .side.me .face .mascot, .lane.me .runner .mascot, .league-join-art .mascot, .celebrate .mascot";
const syncStage = () => stageYard(WIDE() ? document.querySelector(OWN_ART) : null);
// Catching a visitor: a few points, CATCH_DAILY times a day on this computer.
const CATCH_MOST = 5, CATCH_DAILY = 10, CATCH_KEY = "wb_catch"; // a catch is worth 1 to CATCH_MOST points, by chance
const catchKept = () => { try { return JSON.parse(localStorage.getItem(CATCH_KEY) || "{}") || {}; } catch { return {}; } };
function catchesToday() {
  const kept = catchKept();
  return isToday(kept.day) ? kept.n || 0 : 0;
}
function catchVisitor(id) {
  const n = catchesToday();
  sfx.chirp(id);
  if (n >= CATCH_DAILY) return "♥";
  localStorage.setItem(CATCH_KEY, JSON.stringify({ day: keepDay(catchKept().day), n: n + 1 }));
  const worth = randomInt(1, CATCH_MOST);
  award(worth, t("{name} 발견!", { name: t(ALL_CHARACTERS.find((c) => c.id === id)?.name || "") }));
  return `+${worth}`;
}
// In the side panel and on a phone there is no yard: there a character looks out from the right
// edge now and then, for a few seconds. Catching it (a tap) is the same catch as in the yard.
let peekTimer = null;
function peekSoon(first) {
  clearTimeout(peekTimer);
  peekTimer = setTimeout(peekNow, (first ? 12 : 30) * 1000 + Math.random() * 25000);
}
function peekNow() {
  peekSoon();
  const ok = !WIDE() && state.user?.grade && state.member && hasChosenLang() && state.update !== "force" && !presentWaiting()
    && !playing() && !document.getElementById("sheet") && !document.hidden && !document.querySelector(".peek") && catchesToday() < CATCH_DAILY;
  if (!ok) return;
  const lead = myShop().character;
  const mine = ALL_CHARACTERS.filter((c) => c.id !== lead && (ownsCharacter(c) || (c.cost === 0 && !c.earn)));
  const pool = mine.length ? mine : ALL_CHARACTERS.filter((c) => c.id !== lead);
  const who = pool[Math.floor(Math.random() * pool.length)];
  if (!who) return;
  const side = Math.random() < 0.5 ? "left" : "right";
  const el = h("button", { class: `peek ${side}`, style: `bottom:${90 + Math.floor(Math.random() * 180)}px`, "aria-label": t("{name} 발견!", { name: t(who.name) }),
    onclick: () => {
      if (el.classList.contains("caught")) return;
      const worth = catchVisitor(who.id);
      el.classList.add("caught");
      el.append(h("b", { class: "peek-worth" }, worth));
      setTimeout(() => el.remove(), 900);
    } }, portrait(who.id));
  document.body.append(el);
  setTimeout(() => { if (!el.classList.contains("caught")) { el.classList.add("away"); setTimeout(() => el.remove(), 500); } }, 5200);
}
if (DEMO) { globalThis.voquizVisit = visitNow; globalThis.voquizPeek = peekNow; } // for trying a visitor out in the demo

function syncYard() {
  if (yardHeld) return;
  const inside = WIDE() && state.user?.grade && state.member && hasChosenLang() && state.update !== "force" && !presentWaiting();
  if (!inside) return showYard(null);
  const lead = myShop().character;
  const mine = ALL_CHARACTERS.filter((c) => c.id !== lead && (ownsCharacter(c) || (c.cost === 0 && !c.earn))).map((c) => c.id);
  // In the yard: the student's own character and the ones they put there themselves (yardSheet).
  // Everybody else stays in hiding (they look out from under the menus).
  const picked = Array.isArray(myShop().yard) ? myShop().yard.filter((id) => mine.includes(id)).slice(0, YARD_MAX) : [];
  const dressed = myLook(); // the lead as it is dressed: drawn by this, known to the rest of the app by `lead`
  const key = [dressed, mine.length, picked.join(",")].join("|");
  if (yardCast?.key !== key) {
    yardCast = { key, ids: [dressed, ...picked], rest: mine.filter((id) => !picked.includes(id)).sort(() => Math.random() - 0.5) };
  }
  // What a character suggests, one thing at a time. What is waiting (a present, a duel, a friend's
  // request) comes every other time; the everyday ones take turns in between.
  const to = (tab) => () => goTab(tab);
  const gift = () => giftWaiting() || santaWaiting();
  const nudges = () => [
    gift() && { waits: true, text: t("오늘의 선물 받을래?"), act: () => (giftWaiting() ? openDailyGift() : takeSantaGift()) },
    claimable().length > 0 && state.tab !== "shop" && { waits: true, text: t("받을 수 있는 캐릭터가 있어!"), act: openShop },
    grow().waiting().length > 0 && { waits: true, text: t("레벨 선물이 기다려!"), act: () => grow().openLevels() },
    grow().canDraw() && state.tab !== "shop" && { waits: true, text: t("뽑기를 돌릴 수 있어!"), act: () => grow().openGacha() },
    eveLine() && { waits: true, text: eveLine().text, act: to(eveLine().tab) },
    duel().badge() > 0 && state.tab !== "quiz" && { waits: true, text: t("대결 신청이 왔어!"), act: to("quiz") },
    friends().gifts() > 0 && { waits: true, text: t("친구가 선물을 보냈어!"), act: () => friends().collect() },
    friends().badge() > friends().gifts() && state.tab !== "friends" && { waits: true, text: t("친구 신청이 왔어!"), act: () => friends().open() },
    !dailyWordDone() && dailyWord() && !limitReached() && webHome() && { text: t("오늘의 아카데믹 단어 {w}, 찾아볼까?", { w: dailyWord() }), act: () => search(dailyWord()) },
    grow().nextGiftLine() && { text: grow().nextGiftLine(), act: () => grow().openLevels() },
    state.words.length > 0 && state.tab !== "quiz" && { text: t("퀴즈 한 판 어때?"), act: to("quiz") },
    state.tab !== "rank" && { text: t("이번 주 순위 볼래?"), act: to("rank") },
    { text: t("새 단어 찾으러 가자!"), act: () => { if (state.tab !== "search") goTab("search"); document.getElementById("q")?.focus(); } },
  ].filter(Boolean);
  const nextNudge = (asked) => {
    // Not in the middle of a question or a sheet, and (unless the student asked by tapping) not while they type.
    if (playing() || document.querySelector("main .choices, main .search.answer") || document.getElementById("sheet")) return null;
    if (!asked && document.activeElement?.matches?.("input, textarea")) return null;
    const list = nudges(), waiting = list.filter((n) => n.waits), rest = list.filter((n) => !n.waits);
    yardTurn += 1;
    if (!waiting.length) return rest[yardTurn % rest.length];
    const pool = yardTurn % 2 === 1 ? waiting : rest;
    return pool[(yardTurn >> 1) % pool.length];
  };
  showYard({
    ids: yardCast.ids, lead: dressed, gift: gift(),
    onEdit: yardSheet, editLabel: t("함께 다닐 캐릭터 고르기"),
    label: (id) => ALL_CHARACTERS.find((c) => c.id === baseOf(id))?.name || baseOf(id),
    nudge: () => nextNudge(false),
    // The others come by now and then; catching one is worth a few points (a few times a day).
    visitors: () => (playing() || document.getElementById("sheet") || catchesToday() >= CATCH_DAILY ? [] : yardCast.rest),
    onCatch: catchVisitor,
    stay: state.tab === "shop" ? "right" : null, // the shop is looked at tile by tile: nobody stands on it
    eager: webHome(), // on the first screen the character is the one who says what to do next: it speaks up sooner and more often
    // The column of the screen (what is read and pressed): the characters stand beside it.
    clear: () => {
      const boxes = [...document.querySelectorAll(".dk > main > *")].filter((el) => !el.matches(".dk-back, .fx-hurry") && el.offsetWidth > 0).map((el) => el.getBoundingClientRect());
      return boxes.length ? { left: Math.min(...boxes.map((b) => b.left)), right: Math.max(...boxes.map((b) => b.right)) } : null;
    },
    onTap: (id, isLead) => {
      sfx.chirp(id);
      if (isLead && gift()) { (giftWaiting() ? openDailyGift : takeSantaGift)(); return ""; } // the present it holds
      return nextNudge(true);
    },
  });
  syncStage();
}

function searchHome() {
  if (WIDE()) return webQuiet();
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
         !WEB && h("p", { class: "small" }, t("웹페이지에서 단어를 선택해 우클릭해도 돼요."))],
    mascot({
      character: myLook(), t, onTap: () => { sfx.chirp(myShop().character); state.petted = true; document.querySelectorAll(".dress-go").forEach((el) => el.classList.add("show")); return petTap(); },
      signature: isPlus() ? { pops: SIGNATURES[myShop().character] || ["✦", "♥", "★"], line: CHARACTER_LINES[myShop().character]?.[["ko", "en", "zh"].indexOf(getLang())] || "" } : null,
      gift: giftWaiting() || santaWaiting(), onGift: () => (giftWaiting() ? openDailyGift() : takeSantaGift()),
      resting: limitReached() ? t("오늘은 여기까지! 내일 또 만나요") : null,
      greet: quotaLine(), onGreet: () => { state.quotaSaid = quotaKey(); }, // marked as said only once it has spoken
    }),
    // Shown faintly once the character has been tapped (the tap itself does what it always did).
    petOffer() && h("button", { class: `link small dress-go gift-go${state.petted ? " show" : ""}`, onclick: petOffer().act }, petOffer().label),
    h("button", { class: `link small dress-go${state.petted ? " show" : ""}`, onclick: () => grow().openWardrobe() }, t("내 캐릭터 꾸미기")),
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

// The word box. In a wide window it sits in the top bar on every screen but the bare home, so a
// word can be looked up from anywhere (as on any dictionary site); otherwise it heads the search tab.
function searchForm(top = false) {
  state.suggest ||= suggestWord();
  const input = h("input", {
    type: "text", id: "q", value: state.query, maxLength: 40, autocomplete: "off",
    placeholder: state.suggest || t("단어 입력 · Type a word"), "aria-label": t("찾을 단어"),
    oninput: (e) => (state.query = e.target.value),
    onfocus: (e) => e.target.select(), // the next word replaces the last one
  });
  return h("form", { class: `search${top ? " top" : ""}${searchPointsToday() < SEARCH_DAILY_MAX ? " tempt" : ""}`, onsubmit: (e) => { e.preventDefault(); const typed = input.value.trim(); if (!typed) state.suggest = null; search(typed || input.placeholder); } },
    input, h("button", { class: "btn", disabled: state.busy }, t("찾기")));
}
const topSearch = () => WIDE() && !webHome(); // the word box is in the top bar
function searchView() {
  const home = webHome();
  return [
    home && h("p", { class: "dk-hello" }, greeting()),
    !topSearch() && searchForm(),
    !WIDE() && !state.busy && !state.entry && !state.notice && dailyWordCard(), // right under the word box: it is a word to look up
    home ? webActions() : !WIDE() && dailyGoal(),
    noticeBox(),
    state.busy && loadingView(),
    state.entry && entryCard(state.entry),
    !state.busy && !state.entry && !state.notice && searchHome(),
  ];
}

// ---------- word list tab ----------

function dayLabel(day) {
  const today = nowDate();
  if (day === dayOf(today)) return t("오늘");
  if (day === dayOf(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))) return t("어제");
  return new Date(day + "T12:00:00").toLocaleDateString(locale(), { month: "long", day: "numeric", weekday: "short" });
}

// Learned words go back into the quizzes: they start again from no right answers.
function retest(words) {
  for (const word of words) {
    Object.assign(word, retestPatch());
    api.updateWord(word.term_norm, retestPatch()).catch(console.error);
  }
  toastText(t("{n}개를 다시 퀴즈에 넣었어요.", { n: words.length }));
  render();
}

// ----- groups of favourites (Plus) -----
// A favourite may sit in one group. A group is just its name, kept on the word, so it exists as
// long as a favourite carries it.
const canGroup = () => !plansOn() || isPlus();
const folders = () => [...new Set(state.words.filter((w) => w.favorite && w.folder).map((w) => w.folder))].sort((a, b) => a.localeCompare(b));
async function setFolder(word, folder) {
  const before = word.folder;
  word.folder = folder;
  render();
  try {
    await api.updateWord(word.term_norm, { folder });
  } catch (err) {
    console.error(err);
    word.folder = before;
    state.notice = { text: err?.status === 400 || err?.status === 403
      ? t("그룹을 쓰려면 Supabase SQL Editor에서 0014_groups_gift_duel.sql을 한 번 실행해야 해요.")
      : t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.") };
    render();
  }
}
function folderSheet(word) {
  document.getElementById("sheet")?.remove();
  const close = () => el.remove();
  const choose = (name) => { close(); if ((word.folder || null) !== name) setFolder(word, name); };
  const input = h("input", { type: "text", maxLength: 12, autocomplete: "off", placeholder: t("새 그룹 이름"), "aria-label": t("새 그룹 이름") });
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet folder-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("그룹 정하기") },
      h("h2", null, t("그룹 정하기")),
      h("p", null, word.headword),
      folders().length > 0 && h("div", { class: "chips" }, folders().map((name) =>
        h("button", { class: "chip", "aria-pressed": String(word.folder === name), onclick: () => choose(name) }, name))),
      h("form", { class: "row", onsubmit: (e) => { e.preventDefault(); const name = input.value.trim(); if (name) choose(name); } },
        input, h("button", { class: "btn" }, t("만들기"))),
      word.folder && h("button", { class: "link", onclick: () => choose(null) }, t("그룹에서 빼기")),
      h("button", { class: "link", onclick: close }, t("닫기"))));
  document.body.append(el);
}

// The marks beside a word are one symbol each, the same in every language; the name is the tooltip.
const tag = (kind, symbol, name) => h("span", { class: `badge sym ${kind}`, title: name, "aria-label": name, role: "img" }, symbol);

// The equivalents of every meaning of a word, in order (null for a word with one meaning).
function meanings(c) {
  if (!manySenses(c)) return null;
  const list = [...new Set(c.senses.map((sense) => (sense?.counterpart || "").trim()).filter(Boolean))];
  return list.length > 1 ? list : null;
}

function wordRow(w) {
  const many = meanings(w.content);
  const grouping = state.filter === "favorites" && canGroup() && w.favorite;
  // A wide window keeps the list and shows the word beside it; a phone opens the word in the dictionary tab.
  const open = () => { Object.assign(state, { entry: w, tab: "search", query: "", notice: null }); render(); };
  const shownNow = WIDE() && state.tab === "search" && state.entry?.term_norm === w.term_norm; // the word open beside the list
  return h("div", { class: `item${shownNow ? " on" : ""}` },
    h("div", { class: "avatar", "aria-hidden": "true" }, [...w.headword][0].toUpperCase()),
    h("button", { class: "open", onclick: open },
      h("div", { class: "word" }, w.headword, w.discovered && tag("found", "✦", t("첫 발견")), w.needs_review && tag("review", "↻", t("복습")), isLearned(w) && tag("learned", "✓", t("다 익힘")), grouping && w.folder && h("span", { class: "badge folder" }, w.folder)),
      h("div", { class: `sub${many ? " many" : ""}` }, many ? many.map((meaning, i) => h("span", { class: "mean" }, h("i", { "aria-hidden": "true" }, String(i + 1)), meaning)) : w.content.counterpart, state.filter === "learned" && isLearned(w) && h("small", { class: "learned-on" }, t("{d}에 익힘", { d: new Date(w.mastered_at).toLocaleDateString(locale(), { month: "short", day: "numeric" }) })))),
    grouping && state.confirmDelete !== w.term_norm && h("button", { class: `folder-btn${w.folder ? " on" : ""}`, "aria-label": t("그룹 정하기"), title: t("그룹 정하기"), onclick: () => folderSheet(w) }, icon("folder")),
    // A learned word that has rested long enough can go back into the quizzes, one at a time.
    state.filter === "learned" && canRetest(w) && state.confirmDelete !== w.term_norm &&
      h("button", { class: "mini retest", onclick: () => retest([w]) }, t("다시 퀴즈")),
    state.confirmDelete !== w.term_norm && star(w),
    // Deleting asks once more, right in the row, with a way back next to it.
    state.confirmDelete === w.term_norm
      ? h("span", { class: "trash-ask" },
          h("button", { class: "trash keep", onclick: () => { state.confirmDelete = null; render(); } }, t("취소")),
          h("button", { class: "trash sure", onclick: () => { state.confirmDelete = null; removeWord(w); } }, t("삭제")))
      : h("button", { class: "trash", "aria-label": t("단어 삭제"), title: t("단어 삭제"), onclick: () => { state.confirmDelete = w.term_norm; render(); } }, "✕"));
}

// The filters scroll sideways when they do not fit. So that this shows, the row fades out at
// the side where more is hidden, and an arrow there scrolls to it.
function filterChips(filters) {
  const chips = h("div", { class: "chips one-line" }, filters.map(([id, label]) =>
    h("button", { class: "chip", "aria-pressed": String(state.filter === id), onclick: () => { state.chipScroll = chips.scrollLeft; state.filter = id; render(); } }, label)));
  const box = h("div", { class: "chip-scroll" }, chips,
    h("button", { class: "chip-more left", "aria-hidden": "true", tabindex: "-1", onclick: () => chips.scrollBy({ left: -140, behavior: "smooth" }) }, "‹"),
    h("button", { class: "chip-more right", "aria-hidden": "true", tabindex: "-1", onclick: () => chips.scrollBy({ left: 140, behavior: "smooth" }) }, "›"));
  const mark = () => {
    box.classList.toggle("more-left", chips.scrollLeft > 4);
    box.classList.toggle("more-right", chips.scrollLeft + chips.clientWidth < chips.scrollWidth - 4);
  };
  chips.addEventListener("scroll", mark, { passive: true });
  requestAnimationFrame(() => { chips.scrollLeft = state.chipScroll || 0; mark(); });
  return box;
}

// The word shown beside the list in a wide window: the one picked, or the newest until one is.
const chosenWord = () => state.words.find((w) => w.term_norm === state.listWord) || state.words[0] || null;
function wordsView() {
  return wordsList();
}
function wordsList() {
  const langs = [["recent", t("최근")], ["en", t("영어")], ["ko", t("한국어")]];
  const filters = [["all", t("전체")], ["favorites", t("★ 즐겨찾기")], ["review", t("복습 필요")], ["learned", t("✓ 다 익힘")], ["found", t("✦ 내가 발견")]];
  // "recent" is every word, newest first, whichever language it was searched in.
  const inLang = (lang) => (lang === "recent" ? state.words : state.words.filter((w) => (w.content.language === "ko" ? "ko" : "en") === lang));
  // Favourites can be narrowed to one group (Plus).
  const grouped = state.filter === "favorites" && canGroup();
  const group = grouped && folders().includes(state.folder) ? state.folder : null;
  const find = WIDE() ? (state.wordsFind || "").trim().toLowerCase() : ""; // the desktop panel's box: a word of the list, or its other-language word
  const shown = inLang(state.wordLang).filter((w) =>
    state.filter === "favorites" ? w.favorite && (!group || w.folder === group) : state.filter === "review" ? w.needs_review : state.filter === "learned" ? isLearned(w) : state.filter === "found" ? w.discovered : true)
    .filter((w) => !find || w.headword.toLowerCase().includes(find) || String(w.content?.counterpart || "").toLowerCase().includes(find));
  // Learned words: those learned a month or more ago can go back into the quizzes.
  const old = state.filter === "learned" ? shown.filter((w) => canRetest(w)) : [];
  const learnedRow = state.filter !== "learned" ? null : h("div", { class: "learned-box" },
    h("p", { class: "small muted" }, t("{n}번 연속(쓰기 1번 포함) 맞힌 단어예요. 퀴즈에는 나오지 않아요.", { n: MASTER_STREAK })),
    h("p", { class: "small muted" }, t("익힌 지 {d}일이 지나면 다시 퀴즈에 넣을 수 있어요.", { d: RETEST_DAYS })),
    old.length > 1 && h("button", { class: "btn ghost wide", onclick: () => retest(old) },
      t("{d}일 지난 단어 {n}개 모두 다시 넣기", { d: RETEST_DAYS, n: old.length })));
  const groupRow = state.filter !== "favorites" ? null
    : !canGroup()
      ? h("button", { class: "group-plus", onclick: () => { state.plusOpen = true; openSettings(); } },
          h("em", { class: "plus-badge" }, "PLUS"), h("span", null, t("즐겨찾기를 그룹으로 나눌 수 있어요")), h("span", { class: "chev", "aria-hidden": "true" }, "›"))
      : folders().length
        ? h("div", { class: "chips group-chips", role: "group", "aria-label": t("그룹") },
            [[null, t("모든 그룹")], ...folders().map((name) => [name, name])].map(([id, label]) =>
              h("button", { class: "chip", "aria-pressed": String(group === id), onclick: () => { state.folder = id; render(); } }, id && icon("folder"), label)))
        : inLang(state.wordLang).some((w) => w.favorite) && h("p", { class: "small muted group-hint" }, icon("folder"), t("폴더 버튼을 눌러 즐겨찾기를 그룹으로 나눠 보세요."));

  // Words arrive newest first, so the days (or weeks) come out newest first too.
  const byWeek = state.groupBy === "week";
  const groups = new Map();
  for (const w of shown) {
    const key = byWeek ? weekKey(new Date(w.last_searched_at)) : dayOf(w.last_searched_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  // By week, only this week starts open; the others open when their title is pressed.
  state.openWeeks ||= new Set([weekKey()]);
  const weekSection = ([key, words]) => {
    const current = key === weekKey();
    const open = Boolean(find) || state.openWeeks.has(key); // every week is open while finding a word
    const whole = state.filter === "all" && state.wordLang === "recent"; // the goal counts every word of the week
    return h("section", { class: `day week${open ? " open" : ""}` },
      h("button", { class: "week-head", "aria-expanded": String(open), onclick: () => { state.openWeeks[open ? "delete" : "add"](key); render(); } },
        h("span", { class: "week-name" }, weekLabel(key)),
        h("small", null, t("{n}개", { n: words.length })),
        h("span", { class: "chev", "aria-hidden": "true" }, open ? "▾" : "▸")),
      open && h("div", { class: "list" }, words.map(wordRow)));
  };

  return [
    h("div", { class: "segment three", role: "tablist" }, langs.map(([id, label]) =>
      h("button", { role: "tab", "aria-selected": String(state.wordLang === id), onclick: () => { state.wordLang = id; render(); } },
        label, h("small", null, String(inLang(id).length))))),
    h("div", { class: "filter-row" }, filterChips(filters)),
    // the same words, gathered by day or by week: on a line of its own, so the filters have the whole width
    h("div", { class: "group-by" },
      h("span", { class: "tag-key" }, "✦ ", t("첫 발견"), " · ↻ ", t("복습"), " · ✓ ", t("다 익힘")),
      h("div", { class: "by-toggle", role: "group", "aria-label": t("묶어 보기") }, [["day", t("날짜")], ["week", t("주")]].map(([id, label]) =>
        h("button", { "aria-pressed": String((state.groupBy || "day") === id), onclick: () => { state.groupBy = id; render(); } }, label)))),
    groupRow,
    learnedRow,
    !WIDE() && noticeBox(), // in the desktop frame the screen beside the list shows notices
    shown.length === 0
      ? h("div", { class: "empty" },
          state.words.length ? t("여기에 해당하는 단어가 없어요.") : t("아직 찾아본 단어가 없어요."))
      : byWeek ? [...groups].map(weekSection)
      : [...groups].map(([day, words]) => h("section", { class: "day" },
          h("h3", null, dayLabel(day), h("small", null, t("{n}개", { n: words.length }))),
          h("div", { class: "list" }, words.map(wordRow)))),
  ];
}
// "This week", "Last week", or the dates the week ran from and to.
function weekLabel(key) {
  const start = new Date(key + "T12:00:00");
  if (key === weekKey()) return t("이번 주");
  const lastWeek = nowDate(); lastWeek.setDate(lastWeek.getDate() - 7);
  if (key === weekKey(lastWeek)) return t("지난주");
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const show = (d) => d.toLocaleDateString(locale(), { month: "long", day: "numeric" });
  return `${show(start)} ~ ${show(end)}`;
}

// ---------- streak challenge ----------
// Words come from the recommended list of the student's grade, one after another, until a miss.
// (A run that gets through a whole grade's list goes on with the next grade's.)
// The run climbs through stages: every `step` right answers is a new stage, a right answer pays
// more in each stage, and reaching a stage pays a bonus. The numbers are in tuning.js ("streak").
// Each stage has its own look: a colour, a sign, things drifting up the screen.
const STAGES = [ // the last look holds for every later stage
  { id: "sprout", name: "새싹", icon: "sprout", fx: ["sprout", "leaf"] },
  { id: "spark", name: "불씨", icon: "spark", fx: ["spark", "star"] },
  { id: "flame", name: "불꽃", icon: "fire", fx: ["fire", "spark"] },
  { id: "bolt", name: "번개", icon: "bolt", fx: ["bolt", "spark"] },
  { id: "storm", name: "폭풍", icon: "storm", fx: ["storm", "wind", "bolt"] },
  { id: "space", name: "우주", icon: "rocket", fx: ["rocket", "star", "planet"] },
  { id: "legend", name: "전설", icon: "crown", fx: ["crown", "gem", "spark"] },
];
const streakRules = () => tuning("streak");
const stageOf = (streak) => Math.floor(streak / streakRules().step); // 0 = the first stage
const stageLook = (stage) => STAGES[Math.min(stage, STAGES.length - 1)];
const stagePoints = (stage) => { const points = streakRules().points; return points[Math.min(stage, points.length - 1)]; };
// What reaching `stage` pays (1 = the second stage, the first one that is reached).
const stageBonus = (stage) => { const bonus = streakRules().bonus; return bonus[Math.min(stage - 1, bonus.length - 1)] || 0; };
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);
const gradeList = (grade) => WORD_LISTS[grade] || [];
const bestStreak = () => state.user.challenge?.best || 0;
// Runs left today. The profile keeps the day and how many runs were started on it.
const triesUsed = () => (isToday(state.user.challenge?.day) ? state.user.challenge.tries || 0 : 0);
const triesAll = () => streakRules().tries;
const triesLeft = () => Math.max(0, triesAll() - triesUsed());

// ----- the start screens of the two games: the character explains, three steps, the numbers -----
function guideHero(title, text) {
  return h("div", { class: "guide" },
    h("div", { class: "guide-art", "aria-hidden": "true" }, portrait(myLook())),
    h("div", { class: "guide-say" }, h("b", null, title), h("span", null, text)));
}
const guideSteps = (steps) => h("ol", { class: "guide-steps" }, steps.map((step) => h("li", null, step)));
const coin = () => h("i", { "aria-hidden": "true" }, "P");
const guideStat = (label, value, kind) => h("div", { class: `stat${kind ? ` ${kind}` : ""}` }, h("b", null, value), h("span", null, label));

const challengeSteps = (grade) => [
  t("G{g} 권장 단어 {n}개에서 문제가 나와요. 알맞은 답을 골라요.", { g: grade, n: gradeList(grade).length }),
  t("{n}개를 맞힐 때마다 단계가 올라가고, 정답 점수도 커져요.", { n: streakRules().step }),
  t("단계가 오르면 보너스를 받아요. 한 번 틀리면 끝나요."),
];
// The stages ahead, with what a right answer pays in each.
const stageLadder = () => h("div", { class: "stage-ladder", role: "list", "aria-label": t("단계") }, STAGES.map((look, i) =>
  h("div", { class: "stage-rung", role: "listitem", "data-stage": look.id },
    h("i", { "aria-hidden": "true" }, art(look.icon)), h("b", null, t(look.name)), h("small", null, `+${stagePoints(i)}`))));

function challengeCard() {
  const grade = Math.min(12, Math.max(3, state.user.grade));
  return [
    guideHero(t("어디까지 갈 수 있을까?"), t("틀릴 때까지 이어지는 도전이야. 내 최고 기록을 깨 보자!")),
    // My record, large: it is what this game is about.
    h("div", { class: `record${bestStreak() > 0 ? "" : " none"}` },
      h("span", { class: "record-label" }, t("내 최고 기록")),
      h("div", { class: "record-number" }, h("b", null, String(bestStreak())), h("span", null, t("연속"))),
      h("p", null, bestStreak() > 0 ? t("{n}연속을 넘으면 새 기록!", { n: bestStreak() }) : t("첫 기록을 세워 봐요!"))),
    guideSteps(challengeSteps(grade)),
    stageLadder(),
    h("p", { class: "streak-note" },
      h("span", null, t("오늘 남은 도전"), " ", h("b", null, `${triesLeft()} / ${triesAll()}`)),
      h("span", null, t("단계 보너스"), " ", h("b", null, `+${stageBonus(1)}~${stageBonus(STAGES.length)}`))),
    h("p", { class: "act" }, h("button", { class: "btn wide", disabled: triesLeft() === 0, onclick: startChallenge },
      triesLeft() ? t("도전 시작") : t("오늘 도전은 끝! 내일 또 만나요"))),
  ];
}

function startChallenge() {
  if (triesLeft() === 0) return;
  const grade = Math.min(12, Math.max(3, state.user.grade));
  state.user.challenge = { best: bestStreak(), day: keepDay(state.user.challenge?.day), tries: triesUsed() + 1 };
  api.saveProfile({ challenge: state.user.challenge }).catch(console.error); // at once, so that closing the panel does not give the run back
  state.challenge = { grade, queue: challengeQueue(grade), streak: 0, levels: 0, earned: 0, phase: "ask" };
  nextChallengeWord();
  render();
}

// The order of a grade's words in a run: the words this student has met least in the challenge
// come first, and words already learned (in the word list) come late, so that a run brings new
// words instead of the same ones again. How often each word has come up is kept on this
// computer, by account. Within the same count the order is random.
const metKey = () => `wb_met_${state.user?.id || "x"}`;
let metCache = null;
function metCounts() {
  if (metCache?.key !== metKey()) {
    let map = {};
    try { map = JSON.parse(localStorage.getItem(metKey()) || "{}") || {}; } catch { map = {}; }
    metCache = { key: metKey(), map };
  }
  return metCache.map;
}
function challengeSeen(english) {
  const map = metCounts();
  map[english] = Math.min(99, (map[english] || 0) + 1);
  try { localStorage.setItem(metKey(), JSON.stringify(map)); } catch { /* the store is full: the order is simply random again */ }
}
function challengeQueue(grade) {
  const map = metCounts();
  const learned = new Set(state.words.filter(isLearned).map((w) => w.term_norm));
  const weight = ([english]) => (map[english] || 0) + (learned.has(english) ? 2 : 0);
  // popped from the end: the heaviest (most met) first in the list, the least met last
  return shuffle(gradeList(grade)).sort((a, b) => weight(b) - weight(a));
}
function nextChallengeWord() {
  const c = state.challenge;
  if (!c.queue.length) {
    if (c.grade >= 12) return finishChallenge(true);
    c.grade += 1;
    c.levels += 1;
    c.queue = challengeQueue(c.grade);
  }
  const [english, korean] = c.queue.pop();
  challengeSeen(english);
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
  // Every question is answered by picking one of four.
  const kinds = [ // [shown, asked for]
    ["en", "ko"], ["ko", "en"],
    ...(hasDefs ? [["dko", "ko"], ["den", "en"], ["ko", "dko"], ["en", "den"], ["dko", "en"], ["den", "ko"]] : []),
  ];
  const [shown, asked] = kinds[Math.floor(Math.random() * kinds.length)];
  Object.assign(c, {
    phase: "ask",
    picked: null,
    question: {
      shown, asked,
      prompt: side[shown]([english, korean]),
      answer: side[asked]([english, korean]),
      options: shuffle([[english, korean], ...others]).map(side[asked]),
      hint: asked.startsWith("d") ? t("알맞은 뜻을 골라 보세요.") : t("알맞은 단어를 골라 보세요."),
    },
  });
  // The same time limit as the quiz. Running out of time ends the run like a wrong answer.
  clearTimeout(challengeTimer);
  c.limit = limitFor(false);
  c.deadline = Date.now() + c.limit;
  c.timedOut = false;
  const question = c.question;
  challengeTimer = setTimeout(() => {
    if (state.challenge !== c || c.phase !== "ask" || c.question !== question) return;
    Object.assign(c, { timedOut: true, picked: "", phase: "wrong" });
    sfx.time();
    render();
    setTimeout(() => { if (state.challenge === c && c.phase === "wrong") missChallenge(); }, 1700);
  }, c.limit);
}
let challengeTimer = 0;

function pickChallenge(option) {
  const c = state.challenge;
  if (c.phase !== "ask") return;
  clearTimeout(challengeTimer);
  c.picked = option;
  if (option === c.question.answer) {
    const stage = stageOf(c.streak); // the stage this question belonged to
    const points = stagePoints(stage); // every right answer pays at once
    const { step } = streakRules();
    c.streak += 1;
    c.earned += points;
    c.phase = "right";
    sfx.climb(c.streak % step || step, step); // one note higher with every answer of the stage
    if (WIDE()) { confetti(20 + Math.min(stage, 5) * 10, 0.8); comboFx(Math.min(5, 1 + Math.floor(c.streak / 3))); }
    award(points, t("{n}연속", { n: c.streak }));
    const reached = stageOf(c.streak);
    setTimeout(() => {
      if (state.challenge !== c || c.phase !== "right") return;
      if (reached === stage) { nextChallengeWord(); return render(); }
      // A new stage: the run stops for a moment to show it, and the bonus arrives.
      c.phase = "stage";
      c.bonus = stageBonus(reached);
      c.earned += c.bonus;
      sfx.cheer(myShop().character);
      if (WIDE()) { fireworks(3); confetti(70, 1); }
      if (c.bonus) award(c.bonus, t("{n}단계 돌파!", { n: reached + 1 }));
      render();
      setTimeout(() => {
        if (state.challenge !== c || c.phase !== "stage") return;
        nextChallengeWord();
        render();
      }, 2300);
    }, 500);
  } else {
    sfx.wrong();
    if (WIDE()) { missFx(); comboFx(0); }
    c.phase = "wrong"; // show the right answer for a moment before the result
    setTimeout(() => { if (state.challenge === c && c.phase === "wrong") missChallenge(); }, 1700);
  }
  render();
}

// A miss ends the run, except once per run for whoever is using the skeleton or the rose (their special power).
function missChallenge() {
  const c = state.challenge;
  const saver = ["skull", "rose"].find(using);
  if (!saver || c.revived) return finishChallenge(false);
  c.revived = true;
  sfx.chirp(saver);
  toastText(saver === "rose" ? t("귤이 한 번 살려 줬어요! 계속 가요.") : t("본즈가 한 번 살려 줬어요! 계속 가요."));
  nextChallengeWord();
  render();
}

function finishChallenge(clearedAll) {
  const c = state.challenge;
  if (c.phase === "over") return;
  clearTimeout(challengeTimer);
  c.phase = "over";
  c.clearedAll = clearedAll;
  c.record = c.streak > bestStreak();
  recordPlay({ k: "s", n: c.streak, p: c.earned, rec: c.record ? 1 : 0 });
  if (c.record) {
    state.user.challenge = { ...state.user.challenge, best: c.streak };
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
        h("div", { class: "score-art", "aria-hidden": "true" }, reaction(myLook(), c.record || c.clearedAll || c.streak >= 10 ? "cheer" : "comfort")),
        h("div", { class: "muted" }, c.clearedAll ? t("모든 학년의 권장 단어를 다 맞혔어요!") : t("연속으로 맞힌 단어")),
        h("div", { class: "score" }, String(c.streak)),
        c.record && h("p", { class: "earned" }, t("새 최고 기록!")),
        !c.clearedAll && c.question && h("p", { class: "small muted", style: "margin-top:8px" }, `${c.question.prompt} = ${c.question.answer}`),
        h("div", { class: "settle" },
          h("div", { class: "best-line" }, h("span", null, t("내 최고 기록")), h("b", null, t("{n}연속", { n: bestStreak() }))),
          h("div", null, h("span", null, t("도달한 단계")), h("b", null, art(stageLook(stageOf(c.streak)).icon), ` ${t("{n}단계", { n: stageOf(c.streak) + 1 })} · ${t(stageLook(stageOf(c.streak)).name)}`)),
          h("div", { class: c.earned ? "net up" : "net" }, h("span", null, t("획득")), h("b", null, `+${c.earned}`)),
          h("div", null, h("span", null, t("오늘 남은 도전")), h("b", null, `${triesLeft()} / ${triesAll()}`)))),
      h("p", { class: "act" }, h("button", { class: "btn wide", disabled: triesLeft() === 0, onclick: startChallenge },
        triesLeft() ? t("다시 도전") : t("오늘 도전은 끝! 내일 또 만나요"))),
      h("p", { class: "center act-note" },
        h("button", { class: "link", onclick: () => { state.challenge = null; render(); } }, t("닫기"))),
    ];
  }
  const { step } = streakRules();
  const stage = stageOf(c.streak);
  const look = stageLook(stage);
  const inStage = c.streak % step; // right answers so far in this stage
  const mark = (option) =>
    c.phase === "ask" ? "" : option === c.question.answer ? " ok" : option === c.picked ? " no" : " dim";
  // Things of the stage drift up behind the question: more of them, and faster, the higher the stage.
  // Where each one is depends only on the clock, so redrawing the screen does not make them jump.
  const drift = h("div", { class: "stage-fx", "aria-hidden": "true" },
    Array.from({ length: Math.min(14, 5 + stage * 2) }, (_, i) => {
      const seconds = Math.max(4, 9 - stage * 0.6) + (i % 4) * 0.9;
      return h("i", { style: `left:${(i * 37 + 11) % 96}%;font-size:${14 + (i % 3) * 6}px;animation-duration:${seconds}s;animation-delay:-${((Date.now() / 1000 + i * 1.7) % seconds).toFixed(2)}s` }, art(look.fx[i % look.fx.length]));
    }));
  const top = h("div", { class: "ch-top" },
    h("div", { class: `ch-streak${c.phase === "right" ? " bump" : ""}` }, h("b", null, String(c.streak)), h("span", null, t("연속"))),
    h("div", { class: `ch-best${c.streak > bestStreak() ? " beaten" : ""}` },
      h("small", null, t("내 최고 기록")),
      h("b", null, String(Math.max(bestStreak(), c.streak))),
      h("span", null, c.streak > bestStreak() ? t("새 기록!") : bestStreak() - c.streak === 0 ? t("타이 기록!") : t("{n}개 남음", { n: bestStreak() - c.streak }))),
    h("div", { class: "ch-stage" }, h("i", { "aria-hidden": "true" }, art(look.icon)),
      h("b", null, t("{n}단계", { n: stage + 1 })), h("small", null, `${t(look.name)} · +${stagePoints(stage)}`)));
  // Ten lamps: one lights with every right answer; the tenth opens the next stage.
  const lamps = h("div", { class: "stage-lamps", role: "img", "aria-label": t("다음 단계까지 {n}개", { n: step - inStage }) },
    Array.from({ length: step }, (_, i) => h("i", { class: i < inStage ? "on" : i === inStage && c.phase === "ask" ? "next" : "" })));
  if (c.phase === "stage") {
    // Just reached a new stage: its name and what changes, for a moment, before the next word.
    return [
      drift, top, lamps,
      h("div", { class: "stage-up", role: "status" },
        h("div", { class: "stage-up-icon", "aria-hidden": "true" }, art(look.icon)),
        h("small", null, t("{n}단계", { n: stage + 1 })),
        h("b", null, t(look.name)),
        c.bonus > 0 && h("p", { class: "stage-up-bonus" }, t("단계 보너스"), ` +${c.bonus}`),
        h("p", null, t("이제 정답마다 +{p}점!", { p: stagePoints(stage) }))),
    ];
  }
  return [
    drift,
    top, lamps,
    c.phase === "ask" && h("div", { class: "timer", role: "timer", "aria-label": t("남은 시간") },
      h("i", { style: `animation-duration:${c.limit}ms;animation-delay:-${Math.max(0, c.limit - (c.deadline - Date.now()))}ms` })),
    c.phase === "ask" && hurry(c.deadline),
    c.timedOut && h("p", { class: "center act-note timeout" }, t("시간이 다 됐어요!")),
    h("div", { class: `ch-prompt${c.question.shown.startsWith("d") ? " long" : ""}` }, c.question.prompt),
    h("div", { class: `choices act${c.question.asked.startsWith("d") ? " wide defs" : c.question.options.some((o) => o.length > 9) ? " wide" : ""}` },
      c.question.options.map((option, i) =>
        h("button", { class: `choice${mark(option)}`, disabled: c.phase !== "ask", onclick: () => pickChallenge(option) },
          h("span", { class: "num" }, String(i + 1)), option))),
    h("p", { class: "small muted center act-note" }, c.question.hint),
    h("p", { class: "center act-note" },
      h("button", { class: "link", onclick: () => finishChallenge(false) }, t("그만하기"))),
  ];
}

// ---------- rankings tab ----------

async function openRankings() {
  Object.assign(state, { tab: "rank", notice: null, nameSaved: false, confirmBuy: null, rankError: false, leagueInfo: false });
  state.rankGrade ||= state.user.grade;
  render();
  await settleLeague();
  try {
    const onlyFriends = state.rankScope === "friends";
    state.rankings = await api.getRankings(state.rankGrade, onlyFriends);
    // Duels won come from their own function, which may not be installed yet.
    state.rankings.duel = await api.duelRankings(onlyFriends).catch(() => []);
    noteClimb();
  } catch (err) {
    console.error(err);
    if (err?.status === 401) await fail(err);
    else state.rankError = true;
  }
  render();
}

// ----- the weekly league (the points board) -----
// This week's points of the students, with some of the app's characters playing along (only on
// the board of everyone). Without 0009_weekly_league.sql the server still sends all-time points,
// which cannot be compared with a week: then the student is shown among the characters only.
// ----- tiers: up, down or the same, once a week -----
// Presents when a week of the league is settled (tuning.js, "league").
const promotionPrize = () => tuning("league").promotion;
const medalPrize = (rank) => (rank >= 1 && rank <= 3 ? tuning("league").medals[rank - 1] || 0 : 0);
// Paper falling over a result worth celebrating.
function confettiRain() {
  const el = h("div", { class: "confetti rain", "aria-hidden": "true" },
    Array.from({ length: 46 }, (_, i) => h("i", { style: `left:${Math.random() * 100}%;background:${CONFETTI[i % CONFETTI.length]};animation-delay:${Math.random() * 1.1}s;animation-duration:${1.8 + Math.random() * 1.4}s` })));
  document.body.append(el);
  setTimeout(() => el.remove(), 4500);
}
const myTier = () => Math.min(TIERS.length - 1, Math.max(0, Number(state.user?.weekly?.tier) || 0));
const tierName = (tier) => {
  const name = TIERS[tier].names[Math.max(0, ["ko", "en", "zh"].indexOf(getLang()))];
  return getLang() === "en" ? `${name} League` : getLang() === "zh" ? `${name}联赛` : `${name} 리그`;
};
// The highest tier ever reached: the worlds beyond it are still a mystery.
const topTier = () => Math.max(myTier(), Number(state.user?.weekly?.top) || 0);
// All the worlds in a row at the top of the league's info page: where I am, where I have been, and the
// ones not reached yet as silhouettes.
function tierStrip() {
  const tier = myTier(), top = topTier();
  return h("div", { class: "tier-strip", role: "img", "aria-label": t("내 등급: {name}", { name: tierName(tier) }) },
    TIERS.map((one, i) => h("span", { class: `tier-dot ${i === tier ? "now" : i <= top ? "seen" : "locked"}`, style: leagueStyle(one), title: i <= top ? tierName(i) : t("아직 가 보지 못한 세계") },
      h("i", { "aria-hidden": "true" }, art(one.icon)),
      i === tier && h("em", null, tierName(tier)))));
}
// When a new week has begun, the finished week is set aside to be settled.
function rollWeek() {
  const w = state.user?.weekly;
  if (!w?.week || w.week === weekKey() || w.settle) return;
  state.user.weekly = { ...w, settle: { week: w.week, earned: w.earned || 0 }, week: weekKey(), earned: 0 };
}
// Works out where the student finished last week (among the students of the tier and the
// characters) and moves them up or down a tier. A week without a single point is a step down.
async function settleLeague() {
  if (!state.user || state.settling) return;
  rollWeek();
  const done = state.user.weekly?.settle;
  if (!done) return;
  state.settling = true;
  try {
    const tier = myTier();
    let result = tier > 0 ? "rest" : "none", rank = 0;
    if (done.earned > 0) {
      const lastWeek = weekKey(new Date(weekStart().getTime() - 3 * 86400000));
      let others = [];
      if (done.week === lastWeek) {
        try {
          others = await api.leagueLastWeek(tier);
        } catch (err) {
          if (err?.status !== 404 && err?.code !== "PGRST202") return; // try again later
        }
      }
      const monday = new Date(`${done.week}T00:00:00`);
      const characters = leagueCharacters(done.week, monday, tier, monday.getTime() + 8 * 86400000).map((c) => ({ bot: true, score: c.final }));
      const rows = place([...others, { me: true, score: done.earned }, ...characters]);
      rank = rows.find((row) => row.me).rank;
      result = outcome(rows, tier);
    }
    const next = tier + (result === "up" ? 1 : result === "down" || result === "rest" ? -1 : 0);
    const { settle, ...weekly } = state.user.weekly;
    state.user.weekly = { ...weekly, tier: next, top: Math.max(topTier(), next) };
    await api.saveProfile({ weekly: state.user.weekly }).catch(console.error);
    publishRank();
    // Presents for last week: for moving up, and for finishing first, second or third.
    const medalGift = done.earned > 0 ? medalPrize(rank) : 0;
    const upGift = result === "up" ? promotionPrize() : 0;
    const gifts = [
      upGift > 0 && t("승급 선물 +{p}포인트", { p: upGift }),
      medalGift > 0 && t("{r}등 메달 선물 +{p}포인트", { r: rank, p: medalGift }),
    ].filter(Boolean).join(" · ");
    const art = medalGift > 0 || (rank >= 1 && rank <= 3 && done.earned > 0) ? h("span", { class: "sheet-medal" }, medal(rank), art(TIERS[next].icon)) : art(TIERS[next].icon);
    const celebrateWeek = () => {
      // The new week opens with a celebration: paper, a fanfare, and the presents arriving.
      confettiRain();
      sfx.grand(myShop().character);
      if (upGift + medalGift > 0) award(upGift + medalGift, t("주간 리그 선물"), false, { league: false });
    };
    if (result === "up") {
      sheet({ art, title: t("{name}로 승급!", { name: tierName(next) }),
        text: `${t("지난주 {old}에서 {r}등을 했어요. 정말 멋져요!", { old: tierName(tier), r: rank })} ${gifts}`,
        actions: [{ label: t("야호!"), kind: "main", run: () => true }] });
      celebrateWeek();
    } else if (result === "stay" && medalGift > 0) {
      sheet({ art, title: t("{name} {r}등!", { name: tierName(next), r: rank }),
        text: `${t("지난주에 {r}등을 했어요. 정말 멋져요!", { r: rank })} ${gifts}`,
        actions: [{ label: t("야호!"), kind: "main", run: () => true }] });
      celebrateWeek();
    } else if (result === "down") {
      sfx.aww();
      sheet({ art: art(TIERS[next].icon), title: t("{name}로 내려왔어요", { name: tierName(next) }),
        text: t("지난주 {old}에서 {r}등이었어요. 괜찮아요, 이번 주에 다시 올라가 봐요!", { old: tierName(tier), r: rank }),
        actions: [{ label: t("다시 도전!"), kind: "main", run: () => true }] });
    } else if (result === "rest") {
      sheet({ art: art(TIERS[next].icon), title: t("{name}로 내려왔어요", { name: tierName(next) }),
        text: t("지난주에 리그를 쉬어서 한 등급 내려왔어요. 이번 주에 다시 올라가 봐요!"),
        actions: [{ label: t("다시 도전!"), kind: "main", run: () => true }] });
    } else if (result === "stay") {
      sfx.chirp(myShop().character); // a new week begins
      sheet({ art: art(TIERS[next].icon), title: t("{name} 유지", { name: tierName(next) }),
        text: t("지난주에 {r}등이었어요. 이번 주도 힘내요!", { r: rank }),
        actions: [{ label: t("확인"), kind: "main", run: () => true }] });
    }
    render();
  } finally {
    state.settling = false;
  }
}

function leagueRows() {
  const lang = ["ko", "en", "zh"].indexOf(getLang());
  const friendsOnly = state.rankScope === "friends";
  const weekly = Boolean(state.rankings?.week);
  const mine = { me: true, nickname: state.user.nickname || "", tag: myTag(), score: weekEarned(), character: myShop().character, motto: state.user.motto || "" };
  const others = weekly ? (state.rankings?.points || []).filter((row) => !row.me && row.score > 0) : [];
  const characters = friendsOnly ? [] : leagueCharacters(weekKey(), weekStart(), myTier()).map((c) => ({
    bot: true, nickname: t(c.character.name), character: c.character.id, score: c.score, final: c.final,
    motto: CHARACTER_LINES[c.character.id]?.[Math.max(0, lang)] || "",
  }));
  // On the board of everyone, the top places go up a tier and the bottom ones go down.
  const rows = place([...others, mine, ...characters]);
  const tier = myTier();
  return rows.map((row, i) => ({
    ...row,
    zone: friendsOnly ? "" : tier < TIERS.length - 1 && row.rank <= MOVE ? "up" : tier > 0 && i >= rows.length - MOVE ? "down" : "",
  }));
}
// Remembers the place seen last time this week, to say "you went up" when it got better.
function noteClimb() {
  state.leagueUp = 0;
  if (state.rankScope === "friends" || weekEarned() === 0) return;
  const key = `wb_league_${state.user.id}`;
  const rank = leagueRows().find((row) => row.me)?.rank;
  let seen = null;
  try { seen = JSON.parse(localStorage.getItem(key)); } catch { /* first time */ }
  if (seen?.week === weekKey() && rank < seen.rank) state.leagueUp = seen.rank - rank;
  localStorage.setItem(key, JSON.stringify({ week: weekKey(), rank }));
}
// A tier's colours and picture.
const leagueStyle = (league) => `--league-bg:${league.bg};--league-mid:${league.mid};--league-ink:${league.ink}`;
const leagueBadge = (league) => h("span", { class: "league-badge", "aria-hidden": "true" }, art(league.icon));

function leagueCard(rows) {
  const tier = myTier(), league = TIERS[tier];
  const index = rows.findIndex((row) => row.me), me = rows[index];
  const ahead = [...rows].reverse().find((row) => row.score > me.score);
  const left = 7 - ((nowDate().getDay() + 6) % 7);
  const up = state.leagueUp > 0;
  const friendsOnly = state.rankScope === "friends";
  const safe = rows[rows.length - MOVE - 1]; // the last place that stays
  const hint = friendsOnly || (tier === TIERS.length - 1 && me.zone !== "down")
    ? (!ahead ? t("1등이에요! 이 자리를 지켜 봐요.")
        : t("{n}점만 더 모으면 {r}등 {name}을(를) 앞질러요.", { name: ahead.bot ? ahead.nickname : nameOf(ahead.nickname, ahead.tag), n: ahead.score - me.score + 1, r: ahead.rank }))
    : me.zone === "up" ? t("승급권이에요! 일요일까지 지키면 {name}로 올라가요.", { name: tierName(tier + 1) })
    : me.zone === "down" ? t("강등권이에요. {n}점만 더 모으면 벗어나요.", { n: safe.score - me.score + 1 })
    : t("{n}점만 더 모으면 승급권({r}등)이에요.", { n: rows[MOVE - 1].score - me.score + 1, r: MOVE });
  return h("button", { class: `league themed${up ? " up" : ""}`, style: leagueStyle(league), title: t("리그 안내 보기"), onclick: () => { state.leagueInfo = true; render(); } },
    leagueBadge(league),
    h("div", { class: "league-text" },
      h("small", null, h("strong", null, tierName(tier)), " · ", left <= 1 ? t("오늘 끝나요") : t("{n}일 남음", { n: left })),
      h("b", null, up ? t("▲ {n}계단 올랐어요! 지금 {r}등", { n: state.leagueUp, r: me.rank }) : t("지금 {r}등 · 이번 주 {p}점", { r: me.rank, p: me.score })),
      h("span", null, hint)),
    h("i", { class: "league-more", "aria-hidden": "true" }, "›"));
}

// What the league is, when it starts again, how points are earned, and who is playing this week
// (with where each character will stand on Sunday night, so the week can be planned).
function leagueInfoView() {
  const from = weekStart(), to = new Date(from.getTime() + 6 * 86400000);
  const date = (d) => d.toLocaleDateString(locale(), { month: "short", day: "numeric", weekday: "short" });
  const left = 7 - ((nowDate().getDay() + 6) % 7);
  const tier = myTier(), league = TIERS[tier];
  const rows = leagueRows();
  const me = rows.find((row) => row.me);
  const rule = (icon, title, text) => h("li", null, h("span", { class: "info-icon", "aria-hidden": "true" }, icon), h("div", null, h("b", null, title), h("p", null, text)));
  return [
    h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: () => { state.leagueInfo = false; render(); } }, "←"),
      h("h2", { class: "page-title" }, t("주간 리그 안내"))),
    tierStrip(),
    h("div", { class: "league themed static", style: leagueStyle(league) },
      leagueBadge(league),
      h("div", { class: "league-text" },
        h("small", null, t("내 등급"), " · ", t("{n}단계 / {m}", { n: tier + 1, m: TIERS.length })),
        h("b", null, tierName(tier)),
        h("span", null, `${date(from)} ~ ${date(to)}`),
        h("span", null, left <= 1 ? t("오늘 밤에 끝나고, 내일 새 리그가 시작돼요.") : t("{n}일 남았어요. 다음 월요일에 새 리그가 시작돼요.", { n: left })))),
    h("section", { class: "block" },
      h("h3", null, t("리그는 이렇게 돼요")),
      h("ul", { class: "info-list" },
        rule(art("finish"), t("같은 등급끼리, 매주 새로"), t("같은 등급의 친구들과 겨뤄요. 월요일마다 0점에서 다시 시작해요.")),
        rule(art("up"), t("{n}등 안에 들면 승급", { n: MOVE }), t("일요일 밤에 {n}등 안에 있으면 다음 주에 한 등급 올라가고, 승급 선물 +{p}포인트를 받아요.", { n: MOVE, p: promotionPrize() })),
        rule(art("gift"), t("1·2·3등 메달 선물"), t("한 주를 1·2·3등으로 마치면 +{a} · +{b} · +{c}포인트를 선물로 받아요.", { a: medalPrize(1), b: medalPrize(2), c: medalPrize(3) })),
        rule("⬇️", t("아래 {n}명은 강등", { n: MOVE }), t("순위표의 마지막 {n}명은 한 등급 내려가요. {name}에서는 내려가지 않아요.", { n: MOVE, name: tierName(0) })),
        rule(art("star"), t("이번 주에 모은 포인트로"), t("이번 주에 받은 포인트만 세요. 포인트샵에서 써도 리그 점수는 줄지 않아요.")),
        rule(art("door"), t("첫 포인트를 받으면 참가"), t("그 주에 포인트를 한 번이라도 받으면 리그에 들어가요.")),
        rule(art("sleep"), t("쉬면 한 등급 강등"), t("한 주 동안 포인트를 한 번도 받지 않으면 다음 주에 한 등급 내려가요. 단어 하나만 찾아도 참가예요!")),
        rule(art("mascot"), t("캐릭터도 함께 뛰어요"), t("‘캐릭터’ 표시가 있는 친구는 VOQUIZ 캐릭터예요. 매주 다른 캐릭터가 나오고, 등급이 높을수록 더 빨라요.")))),
    h("section", { class: "block" },
      h("h3", null, t("포인트는 이렇게 모아요")),
      h("ul", { class: "info-list small-gap" },
        rule(art("search"), t("단어 찾기"), t("새 단어를 찾을 때마다 포인트를 받아요. 하루 {n}점까지.", { n: SEARCH_DAILY_MAX })),
        rule(art("pencil"), t("퀴즈와 연속 도전"), t("맞힐 때마다 포인트가 쌓여요.")),
        rule(art("swords"), t("대결"), t("친구와 겨뤄 이기면 포인트를 받아요.")),
        rule(art("target"), t("이번 주 단어 목표"), t("목표를 채우면 보너스를 받아요. 목표가 클수록 더 많이 받고, 지금 목표로는 +{p}점이에요.", { p: weekBonus(weekGoal()) })))),
  ];
}

// Medals for the first three places, drawn like the characters: round shapes, a soft shine, a
// ribbon in the app's own purple and lime.
const MEDALS = {
  1: { rim: "#e0a92e", face: "#ffd966", glow: "#fff3bf", deep: "#c98a12" },
  2: { rim: "#9aa3b2", face: "#dfe4ec", glow: "#f6f8fb", deep: "#7f8898" },
  3: { rim: "#b9713f", face: "#eab489", glow: "#f8d9c0", deep: "#a45f30" },
};
// The higher the place, the grander the medal: third has a plain ribbon, second a striped one
// and a ring, first a wide ribbon, a sunburst rim, a crown and sparkles.
function medal(rank) {
  const c = MEDALS[rank];
  const el = document.createElement("span");
  el.className = `place medal m${rank}`;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", String(rank));
  const burst = Array.from({ length: 28 }, (_, i) => {
    const r = i % 2 ? 14.6 : 17, a = (Math.PI * 2 * i) / 28;
    return `${(22 + r * Math.sin(a)).toFixed(1)},${(32 - r * Math.cos(a)).toFixed(1)}`;
  }).join(" ");
  const ribbon = {
    3: `<path d="M12 3 h8 l4.5 13 h-9 z" fill="#655f9f"/><path d="M32 3 h-8 l-4.5 13 h9 z" fill="#7d77b6"/>`,
    2: `<path d="M11 1 h9 l5 15 h-10 z" fill="#655f9f"/><path d="M33 1 h-9 l-5 15 h10 z" fill="#7d77b6"/>
        <path d="M14.2 1 h2.6 l5 15 h-2.6 z" fill="#bbd86b"/><path d="M29.8 1 h-2.6 l-5 15 h2.6 z" fill="#bbd86b"/>`,
    1: `<path d="M7 0 h13 l5 17 h-14 z" fill="#655f9f"/><path d="M37 0 h-13 l-5 17 h14 z" fill="#7d77b6"/>
        <path d="M9.6 0 h2.2 l5 17 h-2.2 z" fill="#ffd966"/><path d="M15 0 h2.4 l5 17 h-2.4 z" fill="#bbd86b"/>
        <path d="M34.4 0 h-2.2 l-5 17 h2.2 z" fill="#ffd966"/><path d="M29 0 h-2.4 l-5 17 h2.4 z" fill="#bbd86b"/>`,
  }[rank];
  const disc = {
    3: `<circle cx="22" cy="32" r="13" fill="${c.rim}"/><circle cx="22" cy="32" r="10" fill="${c.face}"/>`,
    2: `<circle cx="22" cy="32" r="14.5" fill="${c.rim}"/><circle cx="22" cy="32" r="11.5" fill="${c.face}"/>
        <circle cx="22" cy="32" r="9" fill="none" stroke="${c.rim}" stroke-width="1" opacity=".7"/>`,
    1: `<polygon points="${burst}" fill="${c.rim}" stroke="${c.deep}" stroke-width=".8" stroke-linejoin="round"/>
        <circle cx="22" cy="32" r="12" fill="${c.face}"/>
        <circle cx="22" cy="32" r="9.6" fill="none" stroke="${c.rim}" stroke-width="1.1"/>`,
  }[rank];
  const extras = rank === 1 ? `
    <path d="M15.5 19.5 l-1.6 -7.6 l4.3 3.6 l3.8 -6 l3.8 6 l4.3 -3.6 l-1.6 7.6 z" fill="#ffd966" stroke="${c.deep}" stroke-width="1.1" stroke-linejoin="round"/>
    <circle cx="22" cy="9.6" r="1.3" fill="#ff8fab"/><circle cx="13.9" cy="11.9" r="1.1" fill="#bbd86b"/><circle cx="30.1" cy="11.9" r="1.1" fill="#bbd86b"/>
    <path class="spark" d="M40 20 l1.2 2.8 l2.8 1.2 l-2.8 1.2 l-1.2 2.8 l-1.2 -2.8 l-2.8 -1.2 l2.8 -1.2 z" fill="#fff" stroke="${c.rim}" stroke-width=".8" stroke-linejoin="round"/>
    <path class="spark late" d="M3.5 36 l.9 2 l2 .9 l-2 .9 l-.9 2 l-.9 -2 l-2 -.9 l2 -.9 z" fill="#fff" stroke="${c.rim}" stroke-width=".7" stroke-linejoin="round"/>` : "";
  const size = { 1: 16.5, 2: 15, 3: 13.5 }[rank];
  el.innerHTML = `<svg viewBox="0 0 44 50" aria-hidden="true">
    ${ribbon}${disc}
    <path d="M${rank === 3 ? 14.6 : 13.6} 28 a9 9 0 0 1 ${rank === 3 ? 8 : 9.4} -${rank === 3 ? 4.6 : 5.4}" fill="none" stroke="${c.glow}" stroke-width="2.4" stroke-linecap="round"/>
    <text x="22" y="${(32 + size * 0.36).toFixed(1)}" text-anchor="middle" font-size="${size}" font-weight="900" fill="#fff" stroke="${c.deep}" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke">${rank}</text>
    ${extras}
  </svg>`;
  return el;
}

function rankView() {
  if (state.leagueInfo) return leagueInfoView();
  const boards = [["points", t("주간 리그")], ["found", getLang() === "en" ? "Discoveries" : t("첫 발견")], ["streak", t("연속 도전")], ["duel", t("대결")]]; // the badge on a word says "Discovered"; the board is the plural
  const kind = state.rankKind || "points";
  const league = kind === "points" && state.rankings ? leagueRows() : null;
  const rows = league || state.rankings?.[kind] || [];
  const score = (n) => (kind === "points" ? `P ${n}` : kind === "streak" ? t("{n}연속", { n }) : kind === "duel" ? t("{n}승", { n }) : t("{n}개", { n }));
  const top = league || rows.filter((row) => row.score > 0 && row.rank <= 20);
  const mine = rows.find((row) => row.me);
  // Each row: place, the student's own character, name (with their line under it), score.
  const line = (row) => h("li", { class: `rank-row${row.me ? " me" : ""}${row.rank <= 3 && row.score > 0 ? ` top${row.rank}` : ""}${row.zone ? ` zone-${row.zone}` : ""}` },
    row.rank <= 3 && row.score > 0 ? medal(row.rank) : h("span", { class: "place" }, String(row.rank)),
    h("span", { class: "ava", "aria-hidden": "true" }, portrait(row.me ? myLook() : row.character || "bubble")),
    h("span", { class: "who" },
      h("span", { class: "who-name" }, row.bot ? row.nickname : nameOf(row.nickname, row.tag),
        row.me && h("small", null, t("나")), row.bot && h("small", { class: "bot" }, getLang() === "en" ? "character" : t("캐릭터"))),
      row.me
        ? h("button", { class: "who-motto edit", title: t("한마디 바꾸기"), onclick: () => { state.mottoEdit = !state.mottoEdit; render(); } },
            mottoOf(state.user.motto) || t("한마디 고르기"), h("i", { "aria-hidden": "true" }, "✎"))
        : (row.bot ? row.motto : mottoOf(row.motto)) && h("span", { class: "who-motto" }, row.bot ? row.motto : mottoOf(row.motto))),
    h("b", null, score(row.score)));
  // Picking the line happens right here, under the student's own row.
  const choose = async (id) => {
    await saveMotto(id);
    state.mottoEdit = false;
    toastText(id ? t("한마디를 저장했어요.") : t("한마디를 지웠어요."));
    render();
  };
  const mottoForm = () => h("li", { class: "motto-edit" },
    h("p", { class: "small muted hint" }, t("내 이름 아래에 보일 한마디를 골라요.")),
    h("div", { class: "motto-chips", role: "group", "aria-label": t("한마디") },
      Object.keys(MOTTOS).map((id) => h("button", { class: "chip", "aria-pressed": String(state.user.motto === id), onclick: () => choose(id) }, mottoOf(id)))),
    h("p", { class: "center", style: "margin:8px 0 0" },
      state.user.motto && MOTTOS[state.user.motto] && h("button", { class: "link", onclick: () => choose("") }, t("한마디 없이")),
      " ", h("button", { class: "link", onclick: () => { state.mottoEdit = false; render(); } }, t("닫기"))));
  // Between the places that go up, stay and go down, a line says so.
  const lines = (list) => list.flatMap((row, i) => [
    row.zone === "down" && list[i - 1] && list[i - 1].zone !== "down" && h("li", { class: "zone-line down" }, t("▼ 여기부터 강등")),
    line(row),
    row.me && state.mottoEdit && mottoForm(),
    row.zone === "up" && list[i + 1] && list[i + 1].zone !== "up" && h("li", { class: "zone-line up" }, t("▲ 여기까지 승급")),
  ].filter(Boolean));

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
    // Like other leagues, this week's board opens with the first point earned this week.
    kind === "points" && weekEarned() === 0
      ? h("div", { class: "league-join" },
          h("div", { class: "league-join-art", "aria-hidden": "true" }, portrait(myLook())),
          h("span", { class: "league-chip", style: leagueStyle(TIERS[myTier()]) }, art(TIERS[myTier()].icon), " ", t("내 등급: {name}", { name: tierName(myTier()) })),
          h("b", null, t("이번 주 리그에 아직 참여하지 않았어요")),
          h("p", null, t("단어를 찾거나 퀴즈를 풀어 포인트를 모으면 이번 주 리그가 열려요. 리그는 월요일마다 새로 시작해요.")),
          h("button", { class: "btn wide", onclick: () => { Object.assign(state, { tab: "search", entry: null, query: "", notice: null }); render(); } }, t("단어 찾으러 가기")))
      : state.rankError
      ? h("div", { class: "empty" }, t("랭킹을 불러오지 못했어요."))
      : !state.rankings
        ? h("div", { class: "empty" }, t("랭킹을 불러오는 중…"))
        : top.length === 0
          ? h("div", { class: "empty" }, t("아직 순위가 없어요. 첫 순위에 올라 보세요!"),
              state.rankScope === "friends" && h("p", { style: "margin-top:12px" }, h("button", { class: "btn ghost", onclick: () => openPage("friends") }, t("친구 추가하기"))))
          : [
              league && leagueCard(league),
              h("ol", { class: "rank-list" }, lines(top)),
              mine && !top.includes(mine) && [h("div", { class: "rank-gap" }, "⋯"), h("ol", { class: "rank-list" }, lines([mine]))],
            ],
    h("p", { class: "small muted center", style: "margin-top:16px" },
      kind === "points" && weekEarned() === 0 ? null : kind === "points" ? t("이번 주에 모은 포인트로 겨뤄요. 월요일마다 새로 시작해요. ‘캐릭터’ 표시는 함께 뛰는 VOQUIZ 캐릭터예요.")
        : t("이름을 정하지 않으면 임시 이름으로 보여요. 설정에서 바꿀 수 있어요.")),
  ];
}

// ---------- quiz tab ----------

// A choice from a short list in the desktop frame, drawn like the rest of the app: a button that
// shows the choice, and a list that opens under it. (A phone and the extension keep the browser's
// own select.) options: [value, text] pairs; a plain string is a heading between them.
function pickMenu(id, label, options, value, onPick) {
  const open = state.pickOpen === id;
  const same = (o) => Array.isArray(o) && String(o[0]) === String(value);
  const now = options.find(same);
  return h("div", { class: `pick${open ? " open" : ""}` },
    h("button", { type: "button", id, class: "pick-button", "aria-haspopup": "listbox", "aria-expanded": String(open), "aria-label": label,
      onclick: () => { state.pickOpen = open ? null : id; render(); } },
      h("span", null, now ? String(now[1]).replace(/\s*[(（].*[)）]\s*$/, "") : ""), h("i", { "aria-hidden": "true" }, "▾")),
    open && h("div", { class: "pick-menu", role: "listbox", "aria-label": label }, options.map((o) => (Array.isArray(o)
      ? h("button", { type: "button", role: "option", "aria-selected": String(same(o)), onclick: () => { state.pickOpen = null; onPick(o[0]); } },
          h("span", null, o[1]), same(o) && h("i", { "aria-hidden": "true" }, "✓"))
      : h("h6", null, o)))));
}
document.addEventListener("click", (e) => { // a click anywhere else closes an open menu
  if (state.pickOpen && !e.target.closest?.(".pick")) { state.pickOpen = null; render(); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.pickOpen) { state.pickOpen = null; render(); }
});

function quizScope() {
  const scope = state.scope;
  const setScope = (next) => { state.scope = next; render(); };
  const inRange = quizPool(state.words, scope).length; // a quiz asks at most tuning("quiz").max of them
  const cards = buildQuizSet(state.words, scope, clockNow(), tuning("quiz").max);
  const review = cards.filter((w) => w.needs_review).length;
  const today = nowDate().toISOString().slice(0, 10);
  const select = h("select", {
    id: "scope", "aria-label": t("시험 범위"),
    onchange: (e) => setScope({
      "7": { type: "days", days: 7 },
      days: { type: "days", days: 14, custom: true },
      range: { type: "range", from: today, to: today },
      favorites: { type: "favorites" },
      review: { type: "review" },
      learned: { type: "learned" },
      all: { type: "all" },
    }[e.target.value]),
  },
    h("option", { value: "7" }, t("지난 7일")),
    h("option", { value: "days" }, t("지난 며칠 (직접 입력)")),
    h("option", { value: "range" }, t("날짜 범위")),
    h("option", { value: "favorites" }, t("즐겨찾기")),
    h("option", { value: "review" }, t("퀴즈에서 틀린 단어만")),
    h("option", { value: "learned" }, t("다 익힌 단어 다시 확인 ({d}일 지난 것)", { d: RETEST_DAYS })),
    h("option", { value: "all" }, t("전체 단어")));
  select.value = scope.type === "days" ? (scope.custom ? "days" : "7") : scope.type;
  // The same choice as a menu of the desktop frame.
  const picker = () => pickMenu("scope", t("시험 범위"), [...select.options].map((o) => [o.value, o.textContent]), select.value,
    (v) => { select.value = v; select.dispatchEvent(new Event("change")); });

  const daysInput = () => h("input", {
    type: "number", id: "days", min: 1, max: 365, value: scope.days, "aria-label": t("최근 며칠 동안 찾은 단어"),
    onchange: (e) => setScope({ ...scope, days: Math.max(1, Math.min(365, Number(e.target.value) || 1)) }),
  });
  const dateInputs = () => [
    h("input", { type: "date", "aria-label": t("시작일"), value: scope.from, max: today, onchange: (e) => setScope({ ...scope, from: e.target.value }) }),
    "~",
    h("input", { type: "date", "aria-label": t("종료일"), value: scope.to, max: today, onchange: (e) => setScope({ ...scope, to: e.target.value }) }),
  ];
  const fields = [
    h("div", { class: "field" }, h("label", { htmlFor: "scope" }, t("시험 범위")), select),
    scope.custom && h("div", { class: "field" },
      h("label", { htmlFor: "days" }, t("최근 며칠 동안 찾은 단어")),
      h("div", { class: "row" }, daysInput(), t("일"))),
    scope.type === "range" && h("div", { class: "field" },
      h("label", null, t("찾은 날짜")),
      h("div", { class: "row" }, dateInputs())),
  ];
  // The same in one line, for the card of a phone: the number of days, or the two dates, sit in the
  // line of the choice itself, so nothing under it moves. (The list beside them shows only its arrow.)
  const inline = scope.custom ? [h("span", null, t("시험 범위")), h("span", { class: "qz-custom" }, daysInput(), t("일"))]
    : scope.type === "range" ? [h("span", { class: "qz-custom dates" }, dateInputs())] : null;
  // One line under the numbers: why the count is what it is.
  const note = cards.length === 0 ? (scope.type === "review" ? t("지금은 틀린 단어가 없어요!") : scope.type === "learned" && inRange === 0 ? t("익힌 지 {d}일이 지난 단어가 아직 없어요.", { d: RETEST_DAYS }) : t("이 범위에는 단어가 없어요. 범위를 바꿔 보세요."))
    : inRange > cards.length ? t("범위에 {n}개가 있어요. 그중 {m}개를 골라서 내요.", { n: inRange, m: cards.length })
    : review > 0 && scope.type !== "review" ? t("지난번에 틀린 복습 단어 {n}개 포함", { n: review }) : "";
  // The same in short, for the desktop card: nothing to ask (a line), or what the count holds (tags).
  const empty = cards.length === 0 ? note : "";
  return { scope, fields, select, picker, custom: fields.slice(1), inline, cards, inRange, review: scope.type !== "review" ? review : 0, note, empty };
}
const QUIZ_STEPS = () => [
  t("뜻을 보고 단어를 쓰거나 골라요."),
  t("고르는 문제는 {a}초, 쓰는 문제는 {b}초예요.", { a: QUESTION_MS / 1000, b: TYPED_MS / 1000 }),
  t("{n}번 연속(쓰기 1번 포함) 맞히면 다 익힌 단어가 되어 퀴즈에서 빠져요.", { n: MASTER_STREAK }),
];
function quizSetup() {
  const { scope, fields, cards, inRange, review } = quizScope();

  return [
    guideHero(t("오늘 찾은 단어, 기억나?"), t("내 단어장에서 문제를 낼게. 틀려도 괜찮아, 다시 나오니까!")),
    guideSteps(QUIZ_STEPS()),
    h("div", { class: "guide-form" }, fields),
    inRange > cards.length && h("p", { class: "small muted quiz-cut" }, t("범위에 {n}개가 있어요. 그중 {m}개를 골라서 내요.", { n: inRange, m: cards.length })),
    scope.type === "learned" && inRange === 0 && h("p", { class: "small muted quiz-cut" }, t("익힌 지 {d}일이 지난 단어가 아직 없어요.", { d: RETEST_DAYS })),
    h("div", { class: "guide-stats" },
      guideStat(t("문제 수"), t("{n}개", { n: cards.length }), "best"),
      guideStat(t("쓰는 포인트"), [coin(), `-${quizFee(cards.length)}`], "use"),
      guideStat(t("다 맞히면 최대"), [coin(), `+${quizMax(cards.length)}`], "gain")),
    h("p", { class: "small muted center", id: "quiz-count" },
      cards.length === 0 ? (scope.type === "review" ? t("지금은 틀린 단어가 없어요!") : t("이 범위에는 단어가 없어요. 범위를 바꿔 보세요."))
        : review > 0 && scope.type !== "review" ? t("지난번에 틀린 복습 단어 {n}개 포함", { n: review }) : ""),
    h("p", { class: "act" }, h("button", { class: "btn wide", disabled: cards.length === 0, onclick: startQuiz }, t("퀴즈 시작"))),
  ];
}

function quizProgress() {
  const { cards, index, phase } = state.quiz;
  const done = index + (phase === "result" ? 1 : 0);
  // The desktop frame shows each question as a dot (green for right, red for wrong) and the run of right answers.
  if (WIDE()) {
    const { results } = state.quiz, run = quizRun(state.quiz);
    return h("div", { class: "progress dots" },
      h("span", null, `${Math.min(index + 1, cards.length)} / ${cards.length}`),
      h("div", { class: "qz-dots", "aria-hidden": "true" }, cards.map((_, i) => h("i", { class: results[i] ? (results[i].correct ? "ok" : "no") : i === index ? "now" : "" }))),
      run >= 2 && h("b", { class: "qz-run" }, art("fire"), ` ${t("{n}연속", { n: run })}`));
  }
  return h("div", { class: "progress" },
    `${Math.min(index + 1, cards.length)} / ${cards.length}`,
    h("div", { class: "bar" }, h("i", { style: `width:${(done / cards.length) * 100}%` })));
}

// The quiz leads with the language of the screen: Korean on a Korean screen, English otherwise.
const quizMain = () => (getLang() === "en" ? "en" : "ko"); // Korean and Chinese screens lead with Korean
// The Korean or the English word of an entry, whichever way round it was searched.
function wordIn(c, lang) {
  const headIsKorean = /[가-힣]/.test(c.headword);
  return (lang === "ko") === headIsKorean ? c.headword : c.counterpart || c.headword;
}

// The last three seconds of a question in the desktop frame: the edges of the window beat red.
const hurry = (deadline) => WIDE() && h("i", { class: "fx-hurry", "aria-hidden": "true", style: `animation-delay:${Math.max(0, deadline - Date.now() - 3000)}ms` });

function quizAsk() {
  const quiz = state.quiz;
  const word = quiz.cards[quiz.index];
  const question = quiz.questions[quiz.index];
  const c = askedContent(word, question); // the meaning this question asks about
  const main = quizMain();
  const [first, second] = main === "ko" ? [c.definition_ko, c.definition_en] : [c.definition_en, c.definition_ko];
  const input = h("input", {
    type: "text", id: "answer", maxLength: 60, autocomplete: "off", autocapitalize: "off", spellcheck: false,
    placeholder: t("단어를 써 보세요"), "aria-label": t("정답 입력"),
  });
  return [
    quizProgress(),
    hurry(quiz.deadline),
    h("div", { class: "timer", role: "timer", "aria-label": t("남은 시간") },
      h("i", { style: `animation-duration:${quiz.limit}ms;animation-delay:-${Math.max(0, quiz.limit - (quiz.deadline - Date.now()))}ms` })),
    h("div", { class: `question${(first || "").length > (main === "ko" ? 55 : 95) ? " long" : ""}` },
      h("div", { class: "q-label" }, t("이 뜻을 가진 단어는?"),
        question.sense?.part_of_speech && h("span", { class: "sense-pos" }, posIn(question.sense.part_of_speech)),
        // How far this word is from being learned: right answers in a row, and whether one was typed.
        h("span", { class: `badge${word.needs_review ? "" : " plain"}`, title: t("{n}번 연속(쓰기 1번 포함) 맞히면 다 익힌 단어가 되어 퀴즈에서 빠져요.", { n: MASTER_STREAK }) },
          `${word.needs_review ? `${t("복습")} ` : ""}${"●".repeat(Math.min(word.streak, MASTER_STREAK))}${"○".repeat(Math.max(0, MASTER_STREAK - word.streak))}${word.typed_ok ? " ✎" : ""}`)),
      h("p", { class: "q-ko" }, mask(first, c)),
      h("p", { class: "q-en" }, mask(second, c))),
    question.kind === "choice"
      ? [h("div", { class: `choices act${question.options.some((o) => wordIn(o.content, main).length > 13) ? " wide" : ""}` }, question.options.map((option, i) =>
          h("button", { class: "choice", onclick: () => submitAnswer(option.headword, option) },
            h("span", { class: "num" }, String(i + 1)), wordIn(option === word ? c : option.content, main)))),
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
  const c = askedContent(word, quiz.questions[quiz.index]);
  const spelling = !quiz.correct && quiz.questions[quiz.index].kind === "type" ? spellingDiff(quiz.typed, c) : null;
  const last = quiz.index + 1 >= quiz.cards.length;
  const mastered = quiz.correct && isLearned(word);
  return [
    quizProgress(),
    h("div", { class: `feedback ${quiz.correct ? "good" : "bad"}`, role: "status", onclick: stopAutoNext },
      quiz.correct && h("div", { class: "confetti", "aria-hidden": "true" },
        Array.from({ length: 30 }, (_, i) => h("i", {
          style: `left:${Math.random() * 100}%;background:${CONFETTI[i % CONFETTI.length]};animation-delay:${Math.random() * 0.5}s;animation-duration:${1.2 + Math.random()}s`,
        }))),
      h("div", { class: "art", "aria-hidden": "true" }, reaction(myLook(), quiz.correct ? "cheer" : "comfort")),
      h("div", { class: "fb-title" }, quiz.correct ? pick(CHEERS()) : quiz.timedOut ? t("시간이 다 됐어요!") : pick(COMFORTS())),
      quiz.correct && word.streak > 1 && h("div", { class: "fb-sub" }, art("fire"), " ", t("{n}번 연속 정답", { n: word.streak })),
      mastered && h("div", { class: "fb-sub" }, t("다 익혔어요! 이제 이 단어는 퀴즈에서 빠져요.")),
      !quiz.correct && quiz.typed && (spelling ? spellingView(spelling) : h("div", { class: "fb-sub" }, t("내가 쓴 답: "), h("s", null, quiz.typed))),
      h("div", { class: "fb-answer" }, wordIn(c, quizMain()), h("small", null, "⇄"), wordIn(c, quizMain() === "ko" ? "en" : "ko"))),
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
  if (WIDE() && !state.quiz.cheered) { // once, as the result appears
    state.quiz.cheered = true;
    comboFx(0);
    if (ratio >= 0.6) { confetti(ratio === 1 ? 110 : 60, 1); setTimeout(() => fireworks(ratio === 1 ? 5 : 2), 200); }
  }
  return [
    h("div", { class: "card center" },
      h("div", { class: "score-art", "aria-hidden": "true" }, reaction(myLook(), ratio >= 0.6 ? "cheer" : "comfort")),
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
    h("p", { class: "act-note center" }, h("button", { class: "link", onclick: () => { state.quiz = null; openRankings(); } }, t("이번 주 내 순위 보기"))),
    WIDE() && questHint(),
  ];
}

let duelModule = null;
function duel() {
  return (duelModule ||= initDuel({
    h, t, state, api, render, award, fail, reaction, portrait, myShop, myLook, displayName, nameOf,
    guideHero, guideSteps, guideStat, coin, toastText, locale, sfx,
    cheer: () => { cheerYard(); if (WIDE()) confetti(16, 0.7); },
    miss: () => { if (WIDE()) missFx(); },
    win: () => { if (WIDE()) { fireworks(4); confetti(90, 1); } },
    winBonus: () => (using("lion") ? LION_BONUS : 0),
    askFriend: (email) => friends().ask(email),
    refreshFriends: (force) => friends().refresh(force),
    openFriends: () => { state.duel = null; friends().open(); },
  }));
}
let friendsModule = null;
function friends() {
  return (friendsModule ||= initFriends({
    h, t, state, api, render, fail, nameOf, toastText, openPage, storeUrl, logoIcon, displayName, award, locale,
    today: todayKey,
    startDuel: (other) => duel().start({ other }),
    addHearts: (n) => grow().addHearts(n), heartBox: () => grow().heartBox(),
  }));
}
// Levels, the capsule machines, what the character wears, hearts (grow.js).
let growModule = null;
function grow() {
  return (growModule ||= initGrow({
    h, t, state, api, render, award, celebrate, toastText, sfx, isLearned, myShop, saveShop, portrait, themeColor,
    CHARACTERS, THEMES, BACKGROUNDS,
    spend: (n) => { state.user.points -= n; countUp(-n); }, countUp,
    openGacha: () => { document.getElementById("sheet")?.remove(); loadQuestStats(); Object.assign(state, { tab: "shop", shopTab: "gacha", confirmBuy: null, notice: null }); render(); },
    tryOn,
    openShopTab: (tab) => { document.getElementById("sheet")?.remove(); Object.assign(state, { tab: "shop", shopTab: tab, confirmBuy: null, notice: null }); render(); },
  }));
}
// The student's own character as it is dressed (its coat of paint and what it wears).
const myLook = () => grow().myLook();

// The quiz page of the desktop frame: three cards side by side, one for each game, so it is plain
// that there are three to choose from. Each card says what the game is, shows its numbers, and has
// its own start button (all three on one line). How a game works is one click away. Under the
// cards: the duels that wait for an answer, and the past ones.
function howSheet(title, steps, extra) {
  document.getElementById("sheet")?.remove();
  const close = () => el.remove();
  const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
    h("div", { class: "sheet how-sheet", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("h2", null, title), guideSteps(steps), extra,
      h("button", { class: "btn wide", onclick: close }, t("닫기"))));
  document.body.append(el);
}
// Under the cards: every game played, newest first, whichever game it was. A word-list quiz and a
// streak run show the student's character (glad or sad) and the result; a duel shows both players.
function playsList(duels, only) { // only: "q" word-list quiz, "s" streak, "d" duel; nothing = every game
  const me = myLook();
  const when = (at) => `${dayLabel(dayOf(at))} ${new Date(at).toLocaleTimeString(locale(), { hour: "numeric", minute: "2-digit" })}`;
  const face = (mood) => h("span", { class: "face", "aria-hidden": "true" }, reaction(me, mood, true)); // glad or sorry, and still
  const signed = (n) => `${n > 0 ? "+" : ""}${n}`;
  const mine = (Array.isArray(state.user.plays) ? state.user.plays : []).filter((p) => !only || p.k === only).map((p) => ({
    at: p.at,
    el: p.k === "q"
      ? h("div", { class: "play-row" },
          h("span", { class: "play-who" }, face(p.n && p.r / p.n >= 0.6 ? "cheer" : "comfort")),
          h("span", { class: "play-what" }, h("b", null, t("단어장 퀴즈")), h("small", null, when(p.at))),
          h("b", { class: "play-score" }, `${p.r} / ${p.n}`),
          h("span", { class: `play-points${p.p > 0 ? " up" : p.p < 0 ? " down" : ""}` }, coin(), signed(p.p)))
      : h("div", { class: "play-row" },
          h("span", { class: "play-who" }, face(p.rec || p.n >= 10 ? "cheer" : "comfort")),
          h("span", { class: "play-what" }, h("b", null, t("연속 도전"), p.rec ? h("em", { class: "play-new" }, t("새 기록!")) : null), h("small", null, when(p.at))),
          h("b", { class: "play-score" }, t("{n}연속", { n: p.n })),
          h("span", { class: `play-points${p.p > 0 ? " up" : ""}` }, coin(), signed(p.p))),
  }));
  const rows = [...mine, ...(!only || only === "d" ? duels : []).map((d) => ({ at: d.at, el: d.row(when(d.at)) }))].filter((r) => r.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 10);
  if (!rows.length) return null;
  return h("section", { class: "plays" }, h("h3", null, t("최근 결과")), rows.map((r) => r.el));
}
// The characters that host the three games on the quiz page: others the student owns first (never
// the one that lives in the yard), then any others.
function quizHosts() {
  const lead = myShop().character;
  return [...(yardCast?.rest || []), ...ALL_CHARACTERS.map((c) => c.id)].filter((id, i, all) => id !== lead && all.indexOf(id) === i).slice(0, 4);
}
function quizGames() {
  const quiz = quizScope();
  const versus = duel().desk();
  const grade = Math.min(12, Math.max(3, state.user.grade));
  const [host1, host2, host3, host4] = quizHosts();
  // Every card is built the same way, so the same kind of thing sits at the same height in all three:
  // who hosts it, its name, two lines about it, one slot (a choice, or what is left today), three numbers, the start.
  const game = (id, art, name, text, slot, numbers, more, start, steps, extra) => h("section", { class: `qz-game ${id}` },
    h("div", { class: "qz-art", "aria-hidden": "true" }, art),
    h("h2", null, name),
    h("p", { class: "qz-text" }, text),
    slot,
    h("div", { class: "guide-stats qz-nums" }, numbers),
    more,
    start,
    h("button", { class: "link qz-how", onclick: () => howSheet(name, steps, extra) }, t("하는 방법")));
  const slot = (label, control, custom) => h("div", { class: `qz-slot${custom ? " custom" : ""}` }, custom || h("span", null, label), control);
  const pips = (left, all) => h("span", { class: "qz-pips" },
    h("span", { class: "pips", "aria-hidden": "true" }, Array.from({ length: all }, (_, i) => h("i", { class: i < left ? "on" : "" }))),
    h("b", null, `${left} / ${all}`));
  const points = streakRules().points;
  return {
    review: game("review", [portrait(host1), h("i", { class: "qz-tile a" }, "A"), h("i", { class: "qz-tile b" }, "가")],
        t("단어장 퀴즈"), t("내가 찾은 단어로 풀어요."),
        WIDE() ? slot(t("시험 범위"), quiz.picker()) : slot(t("시험 범위"), quiz.select, quiz.inline), // a phone keeps the browser's own list
        // How many are asked, and (when the range holds more than a quiz asks) out of how many.
        [guideStat(t("문제 수"), t("{n}개", { n: quiz.inRange > quiz.cards.length ? `${quiz.cards.length} / ${quiz.inRange}` : quiz.cards.length })), guideStat(t("쓰는 포인트"), [coin(), `-${quizFee(quiz.cards.length)}`], "use"), guideStat(t("다 맞히면 최대"), [coin(), `+${quizMax(quiz.cards.length)}`], "gain")],
        [WIDE() && quiz.custom, quiz.empty ? h("p", { class: "qz-note" }, quiz.empty) : quiz.review > 0 && h("p", { class: "qz-tags" }, h("span", { class: "qz-tag" }, "↻ ", t("복습"), " ", h("b", null, String(quiz.review))))],
        h("button", { class: "btn", disabled: quiz.cards.length === 0, onclick: startQuiz }, t("퀴즈 시작")),
        QUIZ_STEPS()),
    streak: game("streak", [portrait(host2), h("i", { class: "qz-step s1" }), h("i", { class: "qz-step s2" }), h("i", { class: "qz-step s3" })],
        t("연속 도전"), t("틀릴 때까지 이어져요."),
        slot(t("오늘 남은 도전"), pips(triesLeft(), triesAll())),
        [guideStat(t("내 최고 기록"), t("{n}연속", { n: bestStreak() })), guideStat(t("정답 점수"), [coin(), `+${points[0]}~${points[points.length - 1]}`], "gain"), guideStat(t("단계 보너스"), [coin(), `+${stageBonus(1)}~${stageBonus(STAGES.length)}`], "gain")],
        triesLeft() === 0 && h("p", { class: "qz-note" }, t("오늘 도전은 끝! 내일 또 만나요")),
        h("button", { class: "btn", disabled: triesLeft() === 0, onclick: startChallenge }, t("도전 시작")),
        challengeSteps(grade), stageLadder()),
    duel: game("duel", [portrait(host3), h("i", { class: "qz-vs" }, "VS"), h("span", { class: "qz-rival" }, portrait(host4))],
        t("대결"), t("친구와 같은 문제로 겨뤄요."),
        versus.setup ? h("p", { class: "qz-note" }, versus.setup) : slot(t("보낼 수 있는 도전"), pips(versus.sendsLeft, versus.sendsAll)),
        versus.setup ? null : [guideStat(t("쓰는 포인트"), [coin(), `-${versus.fee}`], "use"), guideStat(t("이기면"), [coin(), `+${versus.win}`], "gain"), guideStat(t("비기면"), [coin(), `+${versus.draw}`], "gain")],
        versus.wait && h("p", { class: "qz-note" }, versus.wait),
        h("button", { class: "btn", disabled: Boolean(versus.setup) || versus.sendsLeft === 0, onclick: versus.pick }, t("상대 고르기")),
        versus.steps),
    lists: versus.lists,
    records: versus.records || [],
  };
}
// The desktop frame: the three cards side by side, then the duels that wait and every game played.
function quizHub() {
  const games = quizGames();
  return [
    h("h1", { class: "qz-title" }, t("퀴즈")),
    h("p", { class: "qz-lead" }, t("세 가지 퀴즈 중에서 골라 시작해요.")),
    h("div", { class: "qz-games" }, games.review, games.streak, games.duel),
    games.lists,
    playsList(games.records),
  ];
}
// A game is being played (not its start screen, not its result): the desktop frame shows nothing else.
const playing = () => state.tab === "quiz" && Boolean(
  (state.challenge && state.challenge.phase !== "over")
  || (!state.challenge && state.duel && ["intro", "play", "saving"].includes(state.duel.mode))
  || (!state.challenge && !state.duel && state.quiz && state.quiz.index < state.quiz.cards.length));

function quizView() {
  if (state.challenge) return challengeView();
  if (state.duel) return duel().view();
  const quiz = state.quiz;
  if (!quiz) {
    // Two ways to play, one at a time so the start screen fits without scrolling.
    const modes = [["review", t("단어장 퀴즈")], ["streak", t("연속 도전")], ["duel", t("대결")]];
    const waiting = duel().badge();
    const mode = state.quizMode || "review";
    const choose = (id) => () => { state.quizMode = id; if (id === "duel") state.duelNews = []; render(); };
    if (WIDE()) return quizHub();
    // A phone (and the extension's panel): one game at a time under the tabs, as the same card. The
    // start button is at the same height in every tab; what was played lately follows below it.
    const games = quizGames();
    return [
      h("div", { class: "segment three", role: "tablist" }, modes.map(([id, label]) =>
        h("button", { role: "tab", "aria-selected": String(mode === id), onclick: choose(id) },
          label, id === "duel" && waiting > 0 && h("em", { class: "dot" }, String(waiting))))),
      h("div", { class: "qz-games one" }, mode === "duel" ? games.duel : mode === "streak" ? games.streak : games.review),
      mode === "duel" && games.lists,
      playsList(games.records, mode === "duel" ? "d" : mode === "streak" ? "s" : "q"),
    ];
  }
  if (quiz.index >= quiz.cards.length) return quizDone();
  return quiz.phase === "ask" ? quizAsk() : quizResult();
}

// ---------- shell ----------

const GRADES = Array.from({ length: 10 }, (_, i) => i + 3);

// First run only: pick the screen language. Later it is changed in Settings.
// English is marked to begin with. Tapping another shows the screen, and the story film above it,
// in that language; "선택" settles it.
function languageStep() {
  const picked = state.langPick;
  return h("div", { class: "step with-film" },
    film(),
    h("div", { class: "after-film" },
      h("h1", null, "언어 · Language · 语言"),
      h("div", { class: "langs", role: "radiogroup" },
        LANGS.map(([id, label]) => h("button", { role: "radio", "aria-checked": String(id === picked), onclick: () => { state.langPick = id; tryLang(id); render(); } }, label))),
      h("button", { class: "btn", onclick: () => { setLang(picked); render(); } }, t("선택"))));
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
  if (state.tab === "shop") markShopSeen(); // leaving the shop: what was looked at is no longer new
  const fromPage = ["settings", "shop", "friends"].includes(state.tab);
  if (state.tab === page) Object.assign(state, { tab: state.backTo || "search" });
  else Object.assign(state, { backTo: fromPage ? state.backTo : state.tab, tab: page });
  Object.assign(state, { notice: null, nameSaved: false, confirmBuy: null });
  render();
}
const openSettings = () => openPage("settings");
const openShop = () => { loadQuestStats(); openPage("shop"); };

const myShop = () => ({ ...DEFAULT_SHOP, ...(state.user?.shop || {}) });

// Trying a thing on before it is bought or won: a press on it in the shop shows it at once (a
// theme, a colour or a background on the whole app; a character, a thing to wear or a skin on the
// character in the bar at the bottom). Nothing is saved; leaving the shop puts everything back.
function tryOn(kind, id) {
  const same = state.tryOn && state.tryOn.kind === kind && state.tryOn.id === id;
  Object.assign(state, { tryOn: same ? null : { kind, id }, confirmBuy: null });
  render();
}
const trying = (kind, id) => Boolean(state.tryOn) && state.tryOn.kind === kind && state.tryOn.id === id;
function shopShown() {
  const shop = state.user?.shop, on = state.tryOn;
  if (!on || !shop || !["concept", "theme", "bg", "font"].includes(on.kind)) return shop;
  if (on.kind === "font") return { ...myShop(), font: on.id }; // lettering goes with any look
  return { ...myShop(), [on.kind]: on.id, concept: on.kind === "concept" ? on.id : "basic" };
}
// The character as it would look with what is being tried on.
function tryLook() {
  const on = state.tryOn, shop = myShop();
  const wears = Object.values(shop.wear || {}).filter((w) => shop.owned.includes(`wear:${w}`));
  if (on?.kind === "character") return on.id;
  if (on?.kind === "wear") { const w = wearById(on.id); return lookOf(shop.character, shop.skin?.[shop.character] || "", [...wears.filter((x) => wearById(x)?.slot !== w.slot), w.id]); }
  if (on?.kind === "skin") { const skin = SKINS.find((x) => skinKey(x) === on.id); return lookOf(skin.of, skin.id, wears); }
  return myLook();
}
// The bar at the bottom of the shop while something is tried on: what it is, and how to have it.
function tryBar() {
  const on = state.tryOn;
  if (!on) return null;
  const shop = myShop(), points = state.user.points || 0;
  const list = { character: CHARACTERS, concept: CONCEPTS, theme: THEMES, bg: BACKGROUNDS, font: FONTS }[on.kind];
  const item = list ? list.find((x) => x.id === on.id) : on.kind === "wear" ? wearById(on.id) : SKINS.find((x) => skinKey(x) === on.id);
  if (!item) return null;
  const key = on.kind === "skin" ? on.id : `${on.kind}:${on.id}`;
  const owned = (list && item.cost === 0 && !item.earn) || shop.owned.includes(key);
  const lock = () => h("i", { class: "lock-i", "aria-hidden": "true" });
  const how = owned
    ? list
      ? h("button", { class: "mini buy", onclick: () => { if (on.kind === "character") sfx.chirp(item.id); saveShop({ ...shop, [on.kind]: item.id, ...(on.kind === "theme" || on.kind === "bg" ? { concept: "basic" } : {}) }); } }, t("적용하기"))
      : h("span", { class: "tagline" }, t("가지고 있어요"))
    : on.kind === "wear" ? h("button", { class: "mini buy", disabled: points < wearCost(item), title: points < wearCost(item) ? t("포인트 부족") : null, onclick: () => grow().buyWear(item) },
        h("i", { class: "coin-i", "aria-hidden": "true" }, "P"), `${wearCost(item)} · `, t("사기"))
      : !list ? h("span", { class: "tagline earn" }, lock(), t("뽑기에서 나와요"))
      : item.earn ? h("span", { class: "tagline earn" }, lock(), t("도전 과제"))
        : h("button", { class: "mini buy", disabled: points < item.cost, title: points < item.cost ? t("포인트 부족") : null, onclick: () => buy(on.kind, item) },
            h("i", { class: "coin-i", "aria-hidden": "true" }, "P"), `${item.cost} · `, t("사기"));
  return h("div", { class: "try-bar", role: "status" },
    ["character", "wear", "skin"].includes(on.kind) && h("span", { class: "try-art", "aria-hidden": "true" }, portrait(tryLook())),
    h("div", { class: "try-text" }, h("small", null, t("미리 보는 중")), h("b", null, t(item.name))),
    how,
    h("button", { class: "mini", onclick: () => { state.tryOn = null; render(); } }, t("그만 보기")));
}

function saveShop(shop) {
  state.user.shop = shop;
  state.confirmBuy = null;
  state.tryOn = null;
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
  saveShop({ ...shop, owned: [...shop.owned, `${kind}:${item.id}`], [kind]: item.id, ...(kind === "theme" || kind === "bg" ? { concept: "basic" } : {}) });
}

// What the special characters can do. The lion's and the skeleton's powers work while that
// character is the one in use; Santa's presents come to whoever owns him.
const PERKS = {
  lion: "쓰는 동안: 대결에서 이기면 +10포인트 더",
  skull: "쓰는 동안: 연속 도전에서 한 번 틀려도 이어 가요",
  santa: "갖고 있으면: 12월 1~24일 매일 +200, 25일엔 +1000",
  rose: "쓰는 동안: 연속 도전에서 한 번 틀려도 이어 가요",
};
const using = (id) => myShop().character === id;
const LION_BONUS = 10;

// ----- what is new in the shop -----
// An item added in a later version (`added`, a catalogue revision) is marked NEW, on its card, on
// its tab and on the points pill that opens the shop, until the student has opened that tab once.
// What has been seen is kept on this computer, per student and per tab. A student with no record
// yet (first run of this version, or a new account) sees the latest additions as new.
const SHOP_ITEMS = { character: () => CHARACTERS, theme: () => THEMES, bg: () => BACKGROUNDS, concept: () => CONCEPTS, font: () => FONTS, wear: () => [] };
const seenKey = () => `wb_shop_seen_${state.user?.id}`;
function shopSeen() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(seenKey())) || {}; } catch { /* nothing kept */ }
  return { character: CATALOG_REV - 1, theme: CATALOG_REV - 1, bg: CATALOG_REV - 1, concept: CATALOG_REV - 1, wear: CATALOG_REV, ...saved };
}
const isNewItem = (kind, item) => (item.added || 0) > shopSeen()[kind];
const newCount = (kind) => (state.user ? SHOP_ITEMS[kind]().filter((item) => isNewItem(kind, item)).length : 0);
// Called when the student moves on from a tab of the shop they have looked at.
function markShopSeen() {
  if (!state.user || !state.shopViewed?.size) return;
  const seen = shopSeen();
  for (const kind of state.shopViewed) seen[kind] = CATALOG_REV;
  state.shopViewed = new Set();
  try { localStorage.setItem(seenKey(), JSON.stringify(seen)); } catch { /* storage off */ }
}

// ----- characters that are earned, not bought -----
// Each asks for a fair amount of one part of the app (duels, the streak challenge, learning,
// discovering, looking up, the league, friends, the daily present), so that every part gets used.
// What is counted is in the character's `earn: { by, goal }` (characters-more.js).
const QUESTS = {
  duelWins: { now: () => state.quest?.wins || 0, text: (g) => t("대결에서 {g}번 이기기", { g }) },
  streak: { now: () => bestStreak(), text: (g) => t("연속 도전 {g}연속 달성", { g }) },
  learned: { now: () => state.words.filter(isLearned).length, text: (g) => t("단어 {g}개 다 익히기", { g }) },
  found: { now: () => state.words.filter((w) => w.discovered).length, text: (g) => t("첫 발견 {g}개", { g }) },
  words: { now: () => state.words.length, text: (g) => t("단어 {g}개 찾기", { g }) },
  league: { now: () => topTier() + 1, text: (g) => t("{name} 도달", { name: tierName(g - 1) }) },
  friends: { now: () => (state.friends || []).filter((f) => f.status === "accepted").length, text: (g) => t("친구 {g}명 사귀기", { g }) },
  giftDays: { now: () => state.user.gift?.best || 0, text: (g) => t("매일 선물 {g}일 연속 받기", { g }) },
};
const questNow = (c) => Math.min(c.earn.goal, QUESTS[c.earn.by]?.now() || 0);
const questDone = (c) => questNow(c) >= c.earn.goal;
const earnedCharacters = () => CHARACTERS.filter((c) => c.earn);
const ownsCharacter = (c) => myShop().owned.includes(`character:${c.id}`);
// Earned but not yet taken: the shop shows a "take it" button, and the points pill a dot.
const claimable = () => (state.user ? earnedCharacters().filter((c) => !ownsCharacter(c) && questDone(c)) : []);
function claimCharacter(item) {
  if (ownsCharacter(item) || !questDone(item)) return;
  const shop = myShop();
  celebrate(0, t(item.name), "✓");
  setTimeout(() => sfx.chirp(item.id), 1300);
  saveShop({ ...shop, owned: [...shop.owned, `character:${item.id}`], character: item.id });
}
// Duel wins are counted by the server and friends are read on demand: both are fetched when the shop opens.
// (Also when the app opens and every few minutes, so the mark on the points pill does not wait
// for the shop to be opened.)
async function loadQuestStats() {
  if (!state.user?.grade || (state.quest && Date.now() - state.quest.at < 60000)) return;
  const before = state.quest?.wins;
  state.quest = { wins: before || 0, at: Date.now() };
  friends().refresh(false);
  try {
    const rows = await api.duelRankings(false);
    const mine = (rows || []).find((row) => row.me);
    if (mine) state.quest.wins = mine.score || 0;
  } catch { /* duels not installed, or offline: the count stays */ }
  if (state.quest.wins !== before || state.tab === "shop") render();
}
// What the marks are made of arrives while the panel is open (a friend's request, a challenge, a
// duel won): it is read again when the panel is shown and every few minutes. Not in the middle of
// a game, a pop-up, or a word being typed, because reading redraws the screen.
function refreshAlerts() {
  if (!state.user?.grade || document.visibilityState !== "visible") return;
  if (state.quiz || state.challenge || state.duel || state.busy || document.getElementById("sheet")) return;
  const el = document.activeElement;
  if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName) && el.value) return;
  duel().refresh(false);
  friends().refresh(false);
  loadQuestStats();
}

// One shelf of the shop: theme colours or backgrounds.
function shelf(kind, heading, items) {
  const shop = myShop();
  const points = state.user.points || 0;
  return [
    heading && h("h4", null, heading),
    h("div", { class: "shelf" }, items.map((item) => {
      const key = `${kind}:${item.id}`;
      const owned = (item.cost === 0 && !item.earn) || shop.owned.includes(key);
      // A whole theme takes the place of the colour and the background; choosing one of those again puts the plain theme back.
      const whole = (shop.concept || "basic") !== "basic";
      const active = kind === "concept" ? (shop.concept || "basic") === item.id : shop[kind] === item.id && !(whole && (kind === "theme" || kind === "bg"));
      const action = active
        ? h("span", { class: "tagline" }, t("사용 중"))
        : owned
          ? h("button", { class: "mini", onclick: () => { if (kind === "character") sfx.chirp(item.id); saveShop({ ...shop, [kind]: item.id, ...(kind === "theme" || kind === "bg" ? { concept: "basic" } : {}) }); } }, t("적용하기"))
          : item.earn
            // Earned, not bought: a button once it is earned, until then how far along the student is.
            ? kind === "character"
              ? questDone(item)
                ? h("button", { class: "mini buy claim", onclick: () => claimCharacter(item) }, t("캐릭터 받기"))
                : h("span", { class: "tagline earn" }, h("i", { class: "lock-i", "aria-hidden": "true" }), `${questNow(item)} / ${item.earn.goal}`)
              : h("span", { class: "tagline earn" }, h("i", { class: "lock-i", "aria-hidden": "true" }), `${Math.min(goalRun(), GOAL_RUN)} / ${GOAL_RUN}`)
          : state.confirmBuy === key
            ? h("button", { class: "mini buy", onclick: () => buy(kind, item) }, t("살까요?"))
            : h("button", {
                class: "mini price", disabled: points < item.cost, title: points < item.cost ? t("포인트 부족") : null,
                onclick: () => { state.confirmBuy = key; render(); },
              }, h("i", { "aria-hidden": "true" }, "P"), String(item.cost));
      const quest = kind === "character" && item.earn; // an earned character is shown as it is, with what it asks for
      const fresh = isNewItem(kind, item);
      return h("div", { class: `swatch${active ? " active" : ""}${item.special ? " special" : ""}${kind === "character" ? " sounds" : ""}${quest ? " quest" : ""}${quest && !owned && questDone(item) ? " ready" : ""}${item.earn ? " earned-item" : ""}${trying(kind, item.id) ? " trying" : ""}`,
        title: active ? null : t("눌러서 미리 보기"),
        onclick: (e) => { if (e.target.closest("button")) return; if (kind === "character") sfx.chirp(item.id); if (!active) tryOn(kind, item.id); } },
        fresh && h("span", { class: "new-mark" }, "NEW"),
        item.special && h("span", { class: "ribbon" }, t("스페셜")),
        quest && h("span", { class: "ribbon quest" }, t("도전 과제")),
        kind === "character" && portrait(item.id),
        kind === "concept" && grow().conceptArt(item),
        kind !== "character" && kind !== "concept" && kind !== "font" && h("div", {
          class: "preview", "aria-hidden": "true", "data-bg": kind === "bg" ? item.id : null,
          style: kind === "theme" ? `background:${themeColor(item.id)}` : null,
        }),
        kind === "font" && h("div", { class: "preview font-sample", "aria-hidden": "true", style: loadFont(item.id)?.family ? `font-family:"${item.family}", sans-serif` : null }, h("b", null, "Aa 가나"), h("small", null, "word 단어")),
        h("div", { class: "swatch-name" }, t(item.name), kind === "character" && h("small", null, t(item.vibe))),
        // An earned character not yet owned shows what to do and how far along it is, instead of its line.
        quest && !owned && h("p", { class: "swatch-line quest-text" }, QUESTS[item.earn.by].text(item.earn.goal)),
        quest && !owned && h("div", { class: "quest-bar", role: "img", "aria-label": `${questNow(item)} / ${item.earn.goal}` }, h("i", { style: `width:${(questNow(item) / item.earn.goal) * 100}%` })),
        kind === "character" && !(quest && !owned) && h("p", { class: "swatch-line" }, CHARACTER_LINES[item.id]?.[["ko", "en", "zh"].indexOf(getLang())] || ""),
        kind === "character" && PERKS[item.id] && h("p", { class: "perk" }, h("b", null, "✦"), " ", t(PERKS[item.id])),
        kind === "bg" && item.earn && h("p", { class: "perk" }, h("b", null, "✦"), " ", t("쓰는 동안 검색마다 +{p}포인트", { p: SUNRISE_BONUS })),
        kind === "bg" && item.earn && !owned && h("p", { class: "swatch-line quest-text" }, t("주간 목표 {n}주 연속 달성", { n: GOAL_RUN })),
        kind === "bg" && item.earn && !owned && h("div", { class: "quest-bar", role: "img", "aria-label": `${Math.min(goalRun(), GOAL_RUN)} / ${GOAL_RUN}` }, h("i", { style: `width:${(Math.min(goalRun(), GOAL_RUN) / GOAL_RUN) * 100}%` })),
        action);
    })),
  ];
}

// Every character on one shelf: the ones that are earned come first (they are what the shop
// opens on), then the rest from the cheapest up, so the whole collection is in view.
const ALL_CHARACTERS = [...CHARACTERS].sort((a, b) => (b.earn ? 1 : 0) - (a.earn ? 1 : 0) || a.cost - b.cost);

// What kind of thing a character is, for the filter of the shop. The first characters were
// grouped by grade, so their kind is listed here; the later ones carry it as their group.
const FIRST_KINDS = {
  rabbit: "동물", dino: "동물", octopus: "동물", cat: "동물", penguin: "동물",
  mushroom: "식물·과일", cactus: "식물·과일",
  pudding: "디저트", donut: "디저트", icecream: "디저트", macaron: "디저트", coffee: "디저트",
  rocket: "물건", robot: "물건", bulb: "물건", book: "물건",
};
const SHOP_KINDS = ["동물", "식물·과일", "디저트", "물건", "기타"];
const kindOf = (c) => FIRST_KINDS[c.id] || (SHOP_KINDS.includes(c.group) ? c.group : "기타");

function shopSection() {
  const kind = state.shopKind || "all";
  const inKind = (c, id) => id === "all" || (id === "special" ? Boolean(c.special) : id === "quest" ? Boolean(c.earn) : kindOf(c) === id);
  // Among the earned ones: those ready to take first, then those still to earn, then the ones already owned.
  const rank = (c) => (!c.earn ? 3 : ownsCharacter(c) ? 2 : questDone(c) ? 0 : 1);
  const shown = ALL_CHARACTERS.filter((c) => inKind(c, kind)).sort((a, b) => rank(a) - rank(b));
  const kinds = [["all", t("전체")], ["quest", t("도전 과제")], ...SHOP_KINDS.map((k) => [k, t(k)]), ["special", t("스페셜")]];
  // Four tabs: the whole themes, the colours and the backgrounds are three shelves of one tab.
  const tabs = [["gacha", t("뽑기"), null], ["character", t("캐릭터"), CHARACTERS.length], ["wear", t("꾸미기"), WEARS.length + SKINS.length], ["concept", t("테마"), CONCEPTS.length + THEMES.length + BACKGROUNDS.length + FONTS.length]];
  if (state.shopTab === "theme" || state.shopTab === "bg") state.shopTab = "concept";
  const tab = tabs.some(([id]) => id === state.shopTab) ? state.shopTab : "character";
  ["theme", "bg"].forEach((id) => tab === "concept" && state.shopViewed?.add(id));
  (state.shopViewed ||= new Set()).add(tab); // looked at now: its NEW marks go when the student moves on
  const whole = conceptById(myShop().concept);
  const look = ["concept", "theme", "bg", "font"].includes(state.lookKind) ? state.lookKind : "all";
  // While a whole theme is on, the colour and the background are the theme's own.
  const wholeNote = () => whole.vars && h("p", { class: "small muted whole-note" }, t("지금은 ‘{name}’ 테마를 쓰고 있어요. 여기서 하나를 고르면 기본 테마로 돌아가요.", { name: t(whole.name) }));
  return h("section", { class: "shop" },
    h("div", { class: "segment many", role: "tablist" }, tabs.map(([id, label, count]) =>
      h("button", { role: "tab", "aria-selected": String(tab === id), onclick: () => { markShopSeen(); Object.assign(state, { shopTab: id, confirmBuy: null }); render(); } },
        label, count != null && h("small", null, String(count)), (id === "gacha" ? grow().canDraw() : id === "concept" ? newCount("concept") + newCount("theme") + newCount("bg") > 0 : newCount(id) > 0) && h("em", { class: "new-dot", title: id === "gacha" ? t("뽑을 수 있어요") : t("새로 나왔어요") }, "N")))),
    tab === "gacha" && grow().gachaBox(),
    tab === "character" && h("div", { class: "chips one-line shop-kinds", role: "group", "aria-label": t("캐릭터 종류") }, kinds.map(([id, label]) =>
      h("button", { class: "chip", "aria-pressed": String(kind === id), onclick: () => { Object.assign(state, { shopKind: id, confirmBuy: null }); render(); } },
        label, h("small", null, String(ALL_CHARACTERS.filter((c) => inKind(c, id)).length))))),
    tab === "character" && shelf("character", null, shown),
    tab === "wear" && grow().wardrobe(),
    // The same chips as the other tabs: everything, or one kind of look at a time.
    tab === "concept" && h("div", { class: "chips one-line shop-kinds", role: "group", "aria-label": t("테마") },
      [["all", t("전체"), CONCEPTS.length + THEMES.length + BACKGROUNDS.length + FONTS.length], ["concept", t("테마"), CONCEPTS.length], ["theme", t("색상"), THEMES.length], ["bg", t("배경"), BACKGROUNDS.length], ["font", t("글꼴"), FONTS.length]].map(([id, label, count]) =>
        h("button", { class: "chip", "aria-pressed": String(look === id), onclick: () => { Object.assign(state, { lookKind: id, confirmBuy: null }); render(); } }, label, h("small", null, String(count))))),
    tab === "concept" && [
      (look === "all" || look === "concept") && shelf("concept", look === "all" ? t("테마") : null, CONCEPTS),
      look !== "concept" && wholeNote(),
      (look === "all" || look === "theme") && shelf("theme", look === "all" ? t("색상") : null, THEMES),
      (look === "all" || look === "bg") && shelf("bg", look === "all" ? t("배경") : null, BACKGROUNDS),
      (look === "all" || look === "font") && shelf("font", look === "all" ? t("글꼴") : null, FONTS)]);
}

// Tapping the score: go to Settings and bring the theme shop into view.
function shopView() {
  return [
    h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: openShop }, "←"),
      h("h2", { class: "page-title" }, t("포인트샵"))),
    shopSection(),
    tryBar(),
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
  if (storeUrl && state.invites === undefined) friends().loadInvites(); // for the count on the share button
  const cost = nameCost();
  const short = (state.user.points || 0) < cost;
  // Name, language and grade, kept compact.
  const grade = h("select", { id: "grade-select", "aria-label": t("학년"), onchange: (e) => chooseGrade(Number(e.target.value)) },
    BANDS.map((band) => h("optgroup", { label: `${band.label} · ${t(band.name)}` }, band.grades.map((g) => h("option", { value: String(g) }, `G${g}`)))));
  grade.value = String(state.user.grade);
  const gradeMenu = () => pickMenu("grade-select", t("학년"), BANDS.flatMap((band) => [`${band.label} · ${t(band.name)}`, ...band.grades.map((g) => [String(g), `G${g}`])]),
    String(state.user.grade), (v) => chooseGrade(Number(v)));
  return [
    h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: openSettings }, "←"),
      h("h2", { class: "page-title" }, t("설정"))),
    h("section", { class: "block prefs" },
      WIDE() && h("h3", null, t("내 정보")),
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
        WIDE() ? h("div", { class: "grade-pick" }, t("학년"), gradeMenu()) : h("label", { class: "grade-pick" }, t("학년"), grade))),
    plansOn() && plusSection(),
    h("section", { class: "block" },
      h("h3", null, t("소리")),
      h("div", { class: "setting" },
        h("div", { class: "setting-text" }, h("b", null, t("효과음")), h("small", null, t("정답, 축하, 캐릭터 소리가 나요. 캐릭터마다 소리가 달라요."))),
        h("button", { class: "switch", role: "switch", "aria-checked": String(soundOn()), "aria-label": t("효과음"),
          onclick: () => { setSound(!soundOn()); if (soundOn()) sfx.chirp(myShop().character); render(); } }, h("i", null)))),
    // Duels: a switch for whether classmates may challenge me. Challenging others stays possible.
    h("section", { class: "block" },
      h("h3", null, t("대결")),
      duelSwitch("friends", t("친구의 대결 신청 받기"), t("친구 목록에 있는 친구가 나에게 도전할 수 있어요.")),
      duelSwitch("all", t("누구에게나 대결 신청 받기"), t("친구가 아니어도 도전할 수 있고, 랜덤 대결 상대로도 뽑혀요.")),
      h("p", { class: "small muted", style: "margin-top:10px" },
        duelFrom() === "none" ? t("지금은 아무에게도 대결 신청을 받지 않아요.") : duelFrom() === "friends" ? t("지금은 친구에게만 대결 신청을 받아요.") : t("지금은 누구에게나 대결 신청을 받아요."),
        " ", t("꺼 두어도 내가 도전하는 것과, 이미 받은 도전에 답하는 것은 할 수 있어요."))),
    (storeUrl || HOME_URL) && h("section", { class: "block" },
      h("h3", null, t("VOQUIZ 알리기")),
      // one under another, each as wide as the panel: the labels differ a lot in length between languages
      h("div", { class: "btn-stack" },
        storeUrl && h("button", { class: "btn ghost", onclick: sharePrompt }, t("친구에게 공유"),
          state.invites && !WIDE() && h("span", { class: "btn-note" }, t("남은 초대장 {n}장", { n: friends().unusedInvites().length }))),
        storeUrl && h("button", { class: "btn ghost", onclick: ratePrompt }, t("평가하기")),
        HOME_URL && h("button", { class: "btn ghost", onclick: () => window.open(HOME_URL + (getLang() === "ko" ? "" : "en.html"), "_blank", "noopener") }, t("VOQUIZ 홈페이지 열기")),
        // the web version: the same app in a browser tab (not shown inside the web version itself)
        HOME_URL && !WEB && h("button", { class: "btn ghost", onclick: () => window.open(`${HOME_URL}web/`, "_blank", "noopener") }, t("웹 버전 이용해 보기"))),
      WIDE() && storeUrl && state.invites && h("p", { class: "small muted btn-caption" }, t("남은 초대장 {n}장", { n: friends().unusedInvites().length }))),
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

// ----- a welcome present: one of the cheapest characters, chosen once and kept -----
const GIFT_CHOICES = 6;
const giftChoices = () => ALL_CHARACTERS.filter((c) => c.cost > 0 && !myShop().owned.includes(`character:${c.id}`)).slice(0, GIFT_CHOICES);
const presentWaiting = () => !state.user.welcome && giftChoices().length > 0;

function giftPicker() {
  const picked = giftChoices().find((c) => c.id === state.giftPick);
  return h("div", { class: "step gift" },
    h("h1", null, t("선물이 도착했어요!")),
    h("p", null, t("함께할 캐릭터를 하나 골라요. 선물이라 포인트는 들지 않아요.")),
    h("div", { class: "gift-grid" }, giftChoices().map((item) =>
      h("button", { class: "gift-card", "aria-pressed": String(picked === item), onclick: () => { state.giftPick = item.id; sfx.chirp(item.id); render(); } },
        portrait(item.id), h("b", null, t(item.name)), h("small", null, t(item.vibe))))),
    h("button", { class: "btn wide", disabled: !picked, onclick: takePresent }, picked ? t("{name} 받기", { name: t(picked.name) }) : t("캐릭터를 골라 주세요")));
}

function takePresent() {
  const item = giftChoices().find((c) => c.id === state.giftPick);
  if (!item) return;
  const shop = myShop();
  state.user.shop = { ...shop, owned: [...shop.owned, `character:${item.id}`], character: item.id };
  state.user.welcome = item.id;
  state.giftPick = null;
  api.saveProfile({ shop: state.user.shop, welcome: item.id }).catch(console.error);
  publishRank();
  render();
  celebrate(0, t(item.name), "✓");
}

function gradePicker() {
  return h("div", { class: "step" },
    h("h1", null, t("몇 학년인가요?")),
    h("input", { type: "text", id: "first-name", maxLength: 20, autocomplete: "off", placeholder: t("이름 (안 써도 돼요)"), "aria-label": t("이름") }),
    h("p", null, t("학년 구간에 따라 설명이 달라져요. 나중에 바꿀 수 있어요.")),
    // The grades in their three groups: each group gets its own level of explanation.
    h("div", { class: "grade-bands" }, BANDS.map((band) =>
      h("div", { class: "grade-band" },
        h("div", { class: "band-name" }, h("b", null, band.label), h("span", null, t(band.name))),
        h("div", { class: "grades" }, band.grades.map((g) => h("button", { onclick: () => chooseGrade(g) }, `G${g}`)))))));
}

// An invite code typed on the web version's first screen, kept until the student has signed in
// (signing in with Google leaves the page and comes back).
const TYPED_CODE = "wb_invite_typed";
const typedCode = () => localStorage.getItem(TYPED_CODE) || "";
function loginView() {
  // The web version: the logo first, the film in the middle, then the invite code and the way in.
  if (WEB) return h("div", { class: "step splash with-film web-login" },
    h("h1", { class: "brand" }, wordmark(46)),
    h("p", { class: "web-tag" }, t("한국어와 영어, 두 언어로 단어를 쉽게 익혀요.")),
    film(),
    h("div", { class: "after-film" },
      // The way in for everyone who has joined already: no code is asked for.
      h("button", { class: "btn", disabled: state.busy, onclick: () => { localStorage.removeItem(TYPED_CODE); signIn(); } }, DEMO ? t("데모로 시작하기") : t("Google 계정으로 로그인")),
      noticeBox(),
      // A first visit: VOQUIZ is invite-only, so the code a friend gave goes here. It is kept while
      // Google's page is open and used as soon as the student is back, signed in.
      h("form", { class: "login-code", onsubmit: (e) => {
        e.preventDefault();
        const box = document.getElementById("login-code"), code = box.value.trim().toUpperCase();
        if (!code) return box.focus();
        localStorage.setItem(TYPED_CODE, code);
        signIn();
      } },
        h("label", { htmlFor: "login-code" }, t("처음이신가요?")),
        h("div", { class: "row" },
          h("input", { type: "text", id: "login-code", maxLength: 8, autocomplete: "off", autocapitalize: "characters", spellcheck: false,
            value: typedCode(), placeholder: t("초대 코드 6자리"), "aria-label": t("초대 코드 6자리") }),
          h("button", { class: "btn ghost", disabled: state.busy }, t("초대 코드로 가입하기"))),
        h("small", null, t("친구에게 받은 초대 코드를 넣으면 Google 로그인 뒤에 바로 가입돼요.")))));
  return h("div", { class: "step splash with-film" },
    film(),
    h("div", { class: "after-film" },
      h("h1", { class: "brand" }, wordmark(46)),
      h("p", null, t("한국어와 영어, 두 언어로 단어를 쉽게 익혀요.")),
      h("button", { class: "btn", disabled: state.busy, onclick: signIn }, DEMO ? t("데모로 시작하기") : t("Google 계정으로 로그인")),
      noticeBox()));
}

let lastScreen = null;

// Explanations (the text of a sheet, a hint under a field, a rule, a step of a guide) get one
// sentence per line. What a character says, toasts, banners, buttons and titles are left as written.
const PARAGRAPHS = ".sheet p, .league-join p, .info-list p, .hint, .guide-steps li, main p.small, main section > p, .gate p";
const NOT_PARAGRAPHS = ".mascot, .guide-say, .hello, button, a, .chip, .league, .lang-box, .entry, .share-preview";
function tidyParagraphs(root) {
  for (const el of root.querySelectorAll?.(PARAGRAPHS) || []) {
    if (el.closest(NOT_PARAGRAPHS)) continue;
    let changed = false;
    for (const node of el.childNodes) {
      if (node.nodeType !== 3 || node.parentElement.closest(NOT_PARAGRAPHS)) continue;
      const text = sentences(node.nodeValue);
      if (text !== node.nodeValue) { node.nodeValue = text; changed = true; }
    }
    if (changed) el.classList.add("by-sentence");
  }
}
new MutationObserver((changes) => {
  for (const change of changes) for (const node of change.addedNodes) if (node.nodeType === 1) tidyParagraphs(node.parentElement || node);
}).observe(document.documentElement, { childList: true, subtree: true });

// ----- notices from the people who run VOQUIZ -----
// Urgent ones are a band on every screen while they last. News is a pop-up shown once (which ones
// were seen is remembered on this computer), with a button that can open a page of the app.
const SEEN_NOTICES = "wb_seen_notices";
const inMyLanguage = (text) => text?.[getLang()] || text?.ko || "";
const seenNotices = () => { try { return JSON.parse(localStorage.getItem(SEEN_NOTICES)) || []; } catch { return []; } };
async function loadNotices() {
  try {
    const all = await api.notices(APP_VERSION);
    if (!Array.isArray(all)) return;
    // A notice may be meant only for versions below a certain one (an invitation to update).
    const list = all.filter((n) => !n.below || !APP_VERSION || olderThan(APP_VERSION, n.below));
    const before = JSON.stringify(state.notices || []);
    state.notices = list;
    if (JSON.stringify(list) !== before) render();
    showNews();
  } catch { /* not installed yet, or offline */ }
}
const NOTICE_ACTIONS = () => ({
  shop: [t("포인트샵 보러 가기"), () => openShop()],
  rank: [t("랭킹 보러 가기"), () => openRankings()],
  quiz: [t("퀴즈 하러 가기"), () => { Object.assign(state, { tab: "quiz", notice: null }); render(); }],
  friends: [t("친구 보러 가기"), () => openPage("friends")],
  update: [t("업데이트"), () => updateNow()],
});
// One piece of news at a time, and never in the middle of a quiz, a duel or another pop-up.
function showNews() {
  if (!state.user?.grade || !state.member || state.update === "force") return;
  if (state.quiz || state.challenge || state.duel || document.getElementById("sheet")) return;
  const seen = seenNotices();
  const news = (state.notices || []).find((n) => n.kind === "news" && !seen.includes(n.id));
  if (!news) return;
  localStorage.setItem(SEEN_NOTICES, JSON.stringify([...seen, news.id].slice(-50)));
  const action = NOTICE_ACTIONS()[news.action];
  sheet({
    art: art("megaphone"), title: inMyLanguage(news.title), text: inMyLanguage(news.body),
    actions: action
      ? [{ label: action[0], kind: "main", run: () => { action[1](); } }, { label: t("닫기"), run: () => true }]
      : [{ label: t("확인"), kind: "main", run: () => true }],
  });
}
function urgentBand() {
  const urgent = (state.notices || []).filter((n) => n.kind === "urgent").slice(0, 2);
  if (!urgent.length) return null;
  return h("div", { class: "urgent", role: "alert" }, urgent.map((n) =>
    h("p", null, h("b", null, inMyLanguage(n.title)), inMyLanguage(n.body) && h("span", null, inMyLanguage(n.body)))));
}

// ----- is this the newest version? -----
// The server says which version is the newest and which is the oldest still allowed. An older app
// shows a small notice; one that is too old shows only the "update needed" screen.
const APP_VERSION = globalThis.chrome?.runtime?.getManifest?.().version || document.documentElement.dataset.version || new URLSearchParams(location.search).get("v") || null;
function olderThan(mine, other) {
  const a = String(mine).split(".").map(Number), b = String(other).split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0);
  }
  return false;
}
async function checkVersion() {
  if (!APP_VERSION) return;
  try {
    const now = await api.appVersion();
    if (!now?.latest) return;
    const update = olderThan(APP_VERSION, now.minimum || "0") ? "force" : olderThan(APP_VERSION, now.latest) ? "soft" : null;
    if (update !== state.update) { state.update = update; render(); }
  } catch { /* not installed yet, or offline: nothing to say */ }
}
// Asks Chrome to fetch the new version now, and opens it as soon as it has arrived.
// Where this copy came from decides how it is updated. A copy from the Chrome Web Store is kept
// up to date by Chrome (its manifest carries an update address, and its id is the store's): the
// button asks Chrome to fetch the new version now. A copy installed by hand from the download
// page has to be replaced by hand: the button opens that page.
const fromStore = () => {
  const runtime = globalThis.chrome?.runtime;
  return Boolean(runtime?.getManifest?.().update_url || (runtime?.id && STORE_URL.endsWith(`/${runtime.id}`)));
};
function updateNow() {
  if (WEB) return location.reload(); // the site always serves the newest files
  const runtime = globalThis.chrome?.runtime;
  if (!runtime?.requestUpdateCheck || !fromStore()) {
    state.updateNote = t("다운로드 페이지를 열었어요. 새 파일을 받아 폴더를 바꾼 뒤 확장 프로그램을 새로 고쳐 주세요.");
    if (DOWNLOAD_URL) window.open(DOWNLOAD_URL, "_blank", "noopener");
    return render();
  }
  Object.assign(state, { updating: true, updateNote: null });
  render();
  runtime.onUpdateAvailable?.addListener(() => runtime.reload());
  runtime.requestUpdateCheck((status) => {
    if (status === "update_available") return; // onUpdateAvailable reopens the app
    state.updating = false;
    state.updateNote = status === "throttled" ? t("잠시 후 다시 눌러 주세요.") : t("아직 이 컴퓨터에 새 버전이 도착하지 않았어요. 조금 뒤에 다시 눌러 주세요.");
    render();
  });
}
const storeLink = () => STORE_URL && h("a", { class: "link", href: STORE_URL, target: "_blank", rel: "noopener" }, t("스토어에서 보기"));
function updateBanner() {
  if (state.update !== "soft" || state.updateLater) return null;
  return h("div", { class: "update-banner", role: "status" },
    h("span", { class: "update-text" }, h("b", null, t("새 버전이 나왔어요")), state.updateNote && h("small", null, state.updateNote)),
    h("button", { class: "mini", disabled: Boolean(state.updating), onclick: updateNow }, state.updating ? t("받는 중…") : t("업데이트")),
    h("button", { class: "update-later", "aria-label": t("나중에"), title: t("나중에"), onclick: () => { state.updateLater = true; render(); } }, "×"));
}
function updateGate() {
  return h("div", { class: "step splash update-gate" },
    h("div", { class: "big-logo art", "aria-hidden": "true" }, logoIcon(76)),
    h("h2", null, t("업데이트가 필요해요")),
    h("p", { class: "muted" }, t("이 버전은 더 이상 쓸 수 없어요. 새 버전으로 업데이트하면 바로 이어서 쓸 수 있어요.")),
    h("button", { class: "btn wide", disabled: Boolean(state.updating), onclick: updateNow }, state.updating ? t("받는 중…") : t("지금 업데이트")),
    state.updateNote && h("p", { class: "small muted" }, state.updateNote),
    storeLink() && h("p", { class: "center" }, storeLink()),
    h("p", { class: "small muted" }, t("지금 버전 {v}", { v: APP_VERSION })));
}

// The first time the home screen shows in a new week, the goal for the week is asked for once.
// It waits for anything else on screen (a quiz, another pop-up, a celebration) to be over.
let goalAsk = 0;
function askWeekGoal() {
  if (!state.user?.grade || !state.member || state.update === "force" || presentWaiting() || weekLocked()) return;
  if (state.tab !== "search" || state.entry || state.busy || state.quiz || state.challenge || state.duel) return;
  if (document.getElementById("sheet") || document.querySelector(".celebrate")) return;
  const key = `wb_goal_asked_${state.user.id}`;
  if (localStorage.getItem(key) === weekKey()) return;
  localStorage.setItem(key, weekKey());
  weeklyGoalSheet();
}

// Going to one of the main screens (the phone's bar at the bottom, the desktop's menu at the top).
function goTab(id) {
  // Leaving the quiz tab ends a run that is still going, and closes a finished one.
  if (state.challenge && state.challenge.phase !== "over") finishChallenge(false);
  if (state.challenge && id !== "quiz") state.challenge = null;
  // A duel being played ends with the score so far; other duel screens just close.
  if (state.duel) { if (state.duel.mode === "play" || state.duel.mode === "saving") duel().stop(); else state.duel = null; }
  if (state.tab === "shop") markShopSeen();
  if (id === "rank") return openRankings();
  if (id === "search" && state.tab === "search") return goHome(); // pressed again: from a result back to the start
  Object.assign(state, { tab: id, notice: null, nameSaved: false, confirmBuy: null });
  render();
}
let desktopModule;
const desktop = () => (desktopModule ||= initDesktop({
  h, t, state, render, logoIcon, wordmark, levelChip: () => grow().levelChip(), searchForm, goHome, goTab, openShop, openSettings, openPage, webHome, star, isLearned, dayOf, dayLabel,
  wordsList, icon,
  dailyGoal, todayBox, questHint, entrySide, giftArt, portrait,
  residents: () => yardCast?.rest || [], // the characters that are not out in the yard
  duelBadge: () => duel().badge(), friendsBadge: () => friends().badge(),
  shopMark: () => (claimable().length > 0 || (state.tab !== "shop" && newCount("character") + newCount("theme") + newCount("bg") > 0)) && h("em", { class: "dot new" }, "N"),
  presentWaiting: () => giftWaiting() || santaWaiting(), openPresent: () => (giftWaiting() ? openDailyGift() : takeSantaGift()),
}));
// The desktop: the browser's Back and Forward buttons move between the screens that were open.
let navKey = null, navFromHistory = false;
function trackNav() {
  const key = `${state.tab}|${state.tab === "search" ? state.entry?.term_norm || "" : ""}`;
  if (key === navKey) return;
  const first = navKey === null;
  navKey = key;
  if (navFromHistory) return;
  const mark = { voquiz: true, tab: state.tab, term: state.tab === "search" ? state.entry?.term_norm || null : null };
  if (first) history.replaceState(mark, ""); else history.pushState(mark, "");
}
if (WEB) globalThis.addEventListener("popstate", (e) => {
  const mark = e.state;
  if (!mark?.voquiz || !state.user?.grade) return;
  if (state.challenge && state.challenge.phase !== "over") finishChallenge(false);
  if (state.duel) state.duel = null;
  Object.assign(state, { tab: mark.tab, entry: mark.term ? state.words.find((w) => w.term_norm === mark.term) || null : null, notice: null, quiz: null, level: null });
  navFromHistory = true;
  render();
  navFromHistory = false;
});
function render() {
  // The streak challenge colours the screen by its stage (app.css, body[data-stage]).
  const running = state.challenge && state.challenge.phase !== "over" && state.tab === "quiz";
  if (running) document.body.dataset.stage = stageLook(stageOf(state.challenge.streak)).id;
  else delete document.body.dataset.stage;
  clearTimeout(goalAsk);
  goalAsk = setTimeout(askWeekGoal, 700);
  if (state.tab !== "shop") state.tryOn = null;
  applyShop(shopShown());
  const keepFocus = state.focus || document.activeElement?.id;
  state.focus = null;
  // Same screen as before (a section uncovered, a star toggled)? Then stay exactly where the student was.
  const screen = [state.tab, state.entry?.term_norm, state.busy, state.quiz && `${state.quiz.index}:${state.quiz.phase}`, state.tab === "rank" && `${state.rankKind}:${state.rankGrade}:${state.rankScope}`, state.tab === "quiz" && state.quizMode, state.tab === "words" && `${state.wordLang}:${state.groupBy}`, state.duel && `${state.duel.mode}:${state.duel.index}:${state.duel.frozenUntil}`,
    state.challenge && `${state.challenge.streak}:${state.challenge.phase}:${state.challenge.grade}`].join("|");
  const sameScreen = screen === lastScreen;
  const scrollTop = sameScreen ? document.querySelector("main")?.scrollTop || 0 : 0;
  lastScreen = screen;
  if (!sameScreen) state.greeting = Math.random();
  const banner = DEMO && h("div", { class: "banner" }, t("데모 모드 · 이 브라우저에만 저장돼요"));

  if (!hasChosenLang() && !state.langPick) { state.langPick = "en"; tryLang("en"); } // the first-run step starts on English
  if (!hasChosenLang()) app.replaceChildren(languageStep());
  else if (state.update === "force") app.replaceChildren(updateGate());
  else if (!state.user) app.replaceChildren(...[urgentBand(), loginView()].filter(Boolean));
  else if (state.member === undefined) app.replaceChildren(h("div", { class: "step splash" }, h("div", { class: "big-logo art", "aria-hidden": "true" }, logoIcon(76)), h("p", { class: "muted" }, t("확인하는 중…"))));
  else if (state.member === false) app.replaceChildren(...[banner, inviteGate()].filter(Boolean));
  else if (!state.user.grade) app.replaceChildren(...[banner, gradePicker()].filter(Boolean));
  else if (presentWaiting()) app.replaceChildren(...[banner, giftPicker()].filter(Boolean));
  else {
    // A wide window has no word list screen of its own: the list on the left of the frame is the whole word list.
    if (WIDE() && state.tab === "words") { state.tab = "search"; desktop().showWords(); }
    const tabs = [["search", t("사전")], ["words", t("단어장")], ["quiz", t("퀴즈")], ["rank", t("랭킹")]];
    const view = { search: searchView, words: wordsView, quiz: quizView, rank: rankView, settings: settingsView, shop: shopView, friends: () => friends().view() }[state.tab]();
    const wide = WIDE();
    const tabBar = h("nav", null, tabs.map(([id, label]) => h("button", {
      "aria-current": state.tab === id ? "page" : null,
      onclick: () => goTab(id),
    }, icon(id), h("span", null, label), id === "quiz" && duel().badge() > 0 && h("em", { class: "dot" }, String(duel().badge())))));
    if (wide) {
      app.replaceChildren(desktop().frame({ banners: [banner, urgentBand(), updateBanner()].filter(Boolean), view, focus: playing(), mainClass: [sameScreen && "still", webHome() && "home"].filter(Boolean).join(" ") || null }));
      trackNav();
    } else {
      app.replaceChildren(...[
        h("header", null,
          grow().levelChip(),
          h("h1", null, h("button", { class: "home", title: t("처음 화면으로"), onclick: goHome }, wordmark(25))),
          wide && tabBar,
          topSearch() && searchForm(true),
          h("button", { class: "points", id: "points", title: t("포인트샵 열기"), "aria-pressed": String(state.tab === "shop"), "aria-label": t("단어포인트"), onclick: openShop }, h("i", { "aria-hidden": "true" }, "P"), h("span", null, String(state.user.points || 0)), // One mark for the shop: a character is ready to be taken, or something in it is new.
            (claimable().length > 0 || (state.tab !== "shop" && (grow().canDraw() || newCount("character") + newCount("theme") + newCount("bg") > 0)))
              && h("em", { class: "dot new", title: claimable().length > 0 ? t("받을 수 있는 캐릭터가 있어요") : grow().canDraw() ? t("뽑을 수 있어요") : t("새로 나왔어요") }, "N")),
          h("button", { class: "gear people", "aria-label": t("친구"), title: t("친구"), "aria-pressed": String(state.tab === "friends"), onclick: () => openPage("friends") },
            icon("friends"), friends().badge() > 0 && h("em", { class: "dot" }, String(friends().badge()))),
          h("button", { class: "gear", "aria-label": t("설정"), title: t("설정"), "aria-pressed": String(state.tab === "settings"), onclick: openSettings }, icon("settings"))),
        banner,
        urgentBand(),
        updateBanner(),
        h("main", { class: [sameScreen && "still", webHome() && "home"].filter(Boolean).join(" ") || null }, view),
        !wide && tabBar,
      ].filter(Boolean));
    }
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
  if (WEB) { if (!playing()) comboFx(0); syncYard(); }
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

// A keyboard is at hand in a wide window: 1 to 4 pick the choice with that number.
document.addEventListener("keydown", (e) => {
  if (!WIDE() || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") || document.getElementById("sheet")) return;
  // "/" or a letter, with no question on screen: the word box takes it (the next word to look up).
  if ((e.key === "/" || /^[a-zA-Z]$/.test(e.key)) && !document.querySelector("main .choices, main .search.answer")) {
    const box = document.getElementById("q");
    if (box) { if (e.key === "/") e.preventDefault(); box.focus(); }
    return;
  }
  if (e.key === "Enter" && document.activeElement === document.body) return void document.querySelector("main #next")?.click(); // on to the next question
  if (!/^[1-4]$/.test(e.key)) return;
  const choice = document.querySelectorAll("main .choices .choice")[Number(e.key) - 1];
  if (choice && !choice.disabled) { e.preventDefault(); choice.click(); }
});
document.addEventListener("visibilitychange", refreshAlerts);
// The server's time comes with its answers (clock.js). When the window is looked at again after a
// while (the computer slept, or its clock was moved meanwhile), one small question is asked, so
// that the day is right before anything is pressed; the screen is drawn again if the day changed.
let clockAsked = 0;
function refreshClock() {
  if (DEMO || document.hidden || !state.user?.grade || performance.now() - clockAsked < 60_000) return;
  clockAsked = performance.now();
  const before = todayKey();
  api.myPlan().then((plan) => { state.plan = plan; }).catch(() => {}).finally(() => { if (todayKey() !== before) render(); });
}
document.addEventListener("visibilitychange", refreshClock);
window.addEventListener("focus", refreshClock);
setInterval(refreshAlerts, 3 * 60 * 1000);
setTimeout(loadNotices, 3500); // after the first screen (and last week's league result) has settled
setInterval(loadNotices, 15 * 60 * 1000);
checkVersion();
setInterval(checkVersion, 3 * 3600 * 1000); // a panel left open for days still finds out
// Points and limits the server may have changed (tuning.js). The built-in numbers hold until it answers.
const loadTuning = () => api.appConfig().then((config) => { if (setTuning(config)) render(); }).catch(() => { /* not installed yet, or offline */ });
loadTuning();
setInterval(loadTuning, 3 * 3600 * 1000);
globalThis.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", () => render());
// The window was made wide or narrow. Going narrow, the characters of the yard run to the dictionary
// tab (the first one, now at the bottom) and jump in; the tab gives a little gulp for each.
wideQuery?.addEventListener("change", () => {
  const narrowed = !WIDE();
  yardHeld = narrowed;
  render(); // the tabs are at the bottom now (or back in the top bar)
  yardHeld = false;
  if (!narrowed) return;
  const box = document.querySelector("nav button")?.getBoundingClientRect();
  leaveYard(box && { x: box.left + box.width / 2, y: box.top + box.height / 2 - 8 }, () => {
    const tab = document.querySelector("nav button");
    if (!tab) return;
    tab.classList.remove("gulp");
    void tab.offsetWidth;
    tab.classList.add("gulp");
  });
});
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
