// The desktop frame of the web version (a wide window). It is a layout of its own, not the phone's
// screens stretched: the logo and the menu along the top, the student's words always on the left
// (they can be folded away), the chosen screen in the middle, and on the right what matters at the
// moment. Everything the app can do is still here; only how it is laid out and reached is new.
// A phone never sees any of this (app.js draws this frame only when the window is wide).
export function initDesktop(c) {
  const { h, t, state, render } = c;
  // Each visit begins with the word list folded away. The first word looked up brings it out, and
  // the fold button moves for a few seconds (no words needed): the list can go back in at any time.
  // A student who folded it by hand keeps it folded (FOLD is "1") until they open it themselves.
  const FOLD = "wb_dk_words", SHOW_MS = 5000;
  state.wordsFolded = true;
  let comesOut = localStorage.getItem(FOLD) !== "1"; // may it come out by itself at the first word?
  let cameOut = 0; // when it did
  const fold = (on) => {
    state.wordsFolded = on;
    comesOut = false;
    cameOut = 0;
    localStorage.setItem(FOLD, on ? "1" : "0");
    render();
  };

  // ----- the words, always at hand on the left: the whole word list -----
  // It is the extension's own word list (c.wordsList: the same tabs, filter chips, day/week switch,
  // coloured marks, rows and what can be done to a word), so the two feel the same. The panel adds
  // what a desktop adds: a box to find a word in the list, and the button that folds the list away.
  function wordsPanel() {
    const body = h("div", { class: "dk-wl" }, c.wordsList());
    // The list keeps its place when the screen is drawn again; typing in the box only redraws the list.
    body.addEventListener("scroll", () => { state.dkListScroll = body.scrollTop; }, { passive: true });
    requestAnimationFrame(() => { body.scrollTop = state.dkListScroll || 0; });
    return h("aside", { class: "dk-words", "aria-label": t("단어장") },
      h("div", { class: "dk-words-head" },
        h("b", null, t("단어장")), h("small", null, String(state.words.length)),
        h("button", { class: `dk-fold${Date.now() - cameOut < SHOW_MS ? " hint" : ""}`, title: t("단어장 접기"), "aria-label": t("단어장 접기"), onclick: () => fold(true) }, "«")),
      h("input", { type: "search", id: "dk-find", value: state.wordsFind || "", autocomplete: "off", placeholder: t("내 단어에서 찾기"), "aria-label": t("내 단어에서 찾기"),
        oninput: (e) => { state.wordsFind = e.target.value; body.replaceChildren(...h("div", null, c.wordsList()).childNodes); } }),
      body);
  }

  // ----- the top: logo and menu on the left, the word box in the middle, the student's corner on the right -----
  const pop = () => null; // the other characters come out by themselves now and then (yard.js, visitors), not under the pointer
  function top(bare) {
    const item = (id, label, n) => h("button", { "aria-current": state.tab === id ? "page" : null, onclick: () => c.goTab(id) },
      c.icon(id), label, id === "quiz" && c.duelBadge() > 0 && h("em", { class: "dot" }, String(c.duelBadge())), pop(n));
    return h("header", { class: "dk-top" },
      h("div", { class: "dk-left" },
        h("button", { class: "dk-logo", title: t("처음 화면으로"), "aria-label": t("처음 화면으로"), onclick: c.goHome }, c.logoIcon(28), c.wordmark(24)),
        h("nav", { class: "dk-nav" }, item("search", t("사전"), 0), item("quiz", t("퀴즈"), 1), item("rank", t("랭킹"), 2))),
      bare ? h("span", { class: "dk-gap" }) : c.searchForm(true),
      // The student's corner, in the order of the extension: points (the shop), friends, settings.
      h("div", { class: "dk-me" },
        h("button", { class: "points dk-points", id: "points", title: t("포인트샵 열기"), "aria-pressed": String(state.tab === "shop"), onclick: c.openShop },
          h("i", { "aria-hidden": "true" }, "P"), h("span", null, String(state.user.points || 0)), c.shopMark()),
        h("button", { class: "dk-link", "aria-pressed": String(state.tab === "friends"), onclick: () => c.openPage("friends") },
          c.icon("friends"), t("친구"), c.friendsBadge() > 0 && h("em", { class: "dot" }, String(c.friendsBadge())), pop(4)),
        h("button", { class: "dk-link", "aria-pressed": String(state.tab === "settings"), onclick: c.openSettings }, c.icon("settings"), t("설정"), pop(5))));
  }

  // ----- the frame -----
  // banners: the lines the app shows above a screen (demo, urgent, update). view: the chosen screen.
  // focus: a game is in play; the frame steps back (no word list, no menu, no way back but the game's own).
  function frame({ banners, view, mainClass, focus }) {
    const bare = c.webHome();
    if (comesOut && state.wordsFolded && state.tab === "search" && state.entry) { // the first word of the visit
      comesOut = false;
      state.wordsFolded = false;
      cameOut = Date.now();
      setTimeout(() => document.querySelector(".dk-fold.hint")?.classList.remove("hint"), SHOW_MS);
      setTimeout(() => document.querySelector(".dk.opening")?.classList.remove("opening"), 800);
    }
    const since = Date.now() - cameOut; // the slide out goes on from where it was when the screen is drawn again
    return h("div", { class: `dk${state.wordsFolded ? " folded" : ""}${bare ? " bare" : ""}${focus ? " focus" : ""}${since < 700 ? " opening" : ""}`, style: since < SHOW_MS ? `--since:${since}` : null },
      top(bare),
      state.wordsFolded
        ? h("button", { class: "dk-unfold", title: t("단어장 펼치기"), "aria-label": t("단어장 펼치기"), onclick: () => fold(false) }, h("i", { "aria-hidden": "true" }, "»"), h("span", null, t("단어장")))
        : wordsPanel(),
      h("main", { class: mainClass },
        banners,
        // Back is the browser's own button; this arrow, at the top left of the screen, does the same.
        !bare && !focus && state.tab === "search" && h("button", { class: "dk-back", title: t("뒤로"), "aria-label": t("뒤로"), onclick: () => history.back() }, "←"),
        view));
  }
  // A wide window has no separate word list screen: the list on the left is it, so it is unfolded when asked for.
  const showWords = () => { state.wordsFolded = false; comesOut = false; };
  return { frame, showWords };
}
