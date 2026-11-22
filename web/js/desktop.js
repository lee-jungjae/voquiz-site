// The desktop frame of the web version (a wide window). It is a layout of its own, not the phone's
// screens stretched: the logo and the menu along the top, the student's words always on the left
// (they can be folded away), the chosen screen in the middle, and on the right what matters at the
// moment. Everything the app can do is still here; only how it is laid out and reached is new.
// A phone never sees any of this (app.js draws this frame only when the window is wide).
export function initDesktop(c) {
  const { h, t, state, render } = c;
  const FOLD = "wb_dk_words";
  state.wordsFolded = localStorage.getItem(FOLD) === "1";
  const fold = (on) => {
    state.wordsFolded = on;
    localStorage.setItem(FOLD, on ? "1" : "0");
    render();
  };

  // ----- the words, always at hand on the left -----
  const FILTERS = () => [["all", t("전체")], ["favorites", "★"], ["review", t("복습")], ["learned", t("익힘")]];
  function wordsPanel() {
    const open = (w) => { Object.assign(state, { tab: "search", entry: w, notice: null, level: null, query: "" }); render(); };
    const rows = () => {
      const q = (state.wordsFind || "").trim().toLowerCase();
      const shown = state.words.filter((w) =>
        (state.filter === "favorites" ? w.favorite : state.filter === "review" ? w.needs_review : state.filter === "learned" ? c.isLearned(w) : true)
        && (!q || w.headword.toLowerCase().includes(q) || String(w.content?.counterpart || "").toLowerCase().includes(q)));
      if (!shown.length) return [h("p", { class: "dk-none" }, state.words.length ? t("여기에 해당하는 단어가 없어요.") : t("아직 찾아본 단어가 없어요."))];
      const days = new Map();
      for (const w of shown) {
        const day = c.dayOf(w.last_searched_at);
        if (!days.has(day)) days.set(day, []);
        days.get(day).push(w);
      }
      return [...days].map(([day, words]) => h("section", null,
        h("h4", null, c.dayLabel(day), h("small", null, String(words.length))),
        words.map((w) => h("div", { class: `dk-word${state.tab === "search" && state.entry?.term_norm === w.term_norm ? " on" : ""}` },
          h("button", { class: "dk-open", onclick: () => open(w) }, h("b", null, w.headword), h("span", null, w.content?.counterpart || "")),
          c.isLearned(w) ? h("i", { class: "dk-mark", title: t("다 익힘") }, "✓") : w.needs_review ? h("i", { class: "dk-mark", title: t("복습") }, "↻") : null,
          c.star(w)))));
    };
    const list = h("div", { class: "dk-list" }, rows());
    // The list keeps its place when the screen is drawn again; typing in the box only redraws the list.
    list.addEventListener("scroll", () => { state.dkListScroll = list.scrollTop; }, { passive: true });
    requestAnimationFrame(() => { list.scrollTop = state.dkListScroll || 0; });
    return h("aside", { class: "dk-words", "aria-label": t("단어장") },
      h("div", { class: "dk-words-head" },
        h("b", null, t("단어장")), h("small", null, String(state.words.length)),
        h("button", { class: "dk-fold", title: t("단어장 접기"), "aria-label": t("단어장 접기"), onclick: () => fold(true) }, "◂")),
      h("input", { type: "search", id: "dk-find", value: state.wordsFind || "", autocomplete: "off", placeholder: t("내 단어에서 찾기"), "aria-label": t("내 단어에서 찾기"),
        oninput: (e) => { state.wordsFind = e.target.value; list.replaceChildren(...rows()); } }),
      h("div", { class: "dk-filters", role: "group", "aria-label": t("거르기") }, FILTERS().map(([id, label]) =>
        h("button", { "aria-pressed": String(state.filter === id || (id === "all" && !["favorites", "review", "learned"].includes(state.filter))), onclick: () => { state.filter = id; render(); } }, label))),
      list,
      // Everything else the word list can do (groups, by week, putting learned words back) is one step away.
      h("button", { class: "dk-manage", "aria-pressed": String(state.tab === "words"), onclick: () => { Object.assign(state, { tab: "words", notice: null }); render(); } }, t("단어장 전체 보기")));
  }

  // ----- the top: logo and menu on the left, the word box in the middle, the student's corner on the right -----
  // "오늘" opens what the day holds (the present, today's points, the week's goal, today's words
  // with the way on to a quiz, the character quest): it is one click away from every screen
  // without taking a column of its own.
  function todayMenu() {
    return h("div", { class: "dk-today-wrap" },
      h("button", { class: "dk-link", "aria-expanded": String(Boolean(state.todayOpen)), onclick: () => { state.todayOpen = !state.todayOpen; render(); } },
        t("오늘"), c.presentWaiting() && h("em", { class: "dot", "aria-hidden": "true" })),
      state.todayOpen && h("div", { class: "dk-today", role: "dialog", "aria-label": t("오늘") },
        c.presentWaiting() && h("button", { class: "dk-present", onclick: () => { state.todayOpen = false; c.openPresent(); } }, c.giftArt(), t("오늘의 선물 받기")),
        c.dailyGoal(),
        c.todayBox(),
        c.questHint()));
  }
  document.addEventListener("click", (e) => { // a click anywhere else closes it
    if (state.todayOpen && !e.target.closest?.(".dk-today-wrap") && !e.target.closest?.("#sheet")) { state.todayOpen = false; render(); }
  });
  function top(bare) {
    const item = (id, label) => h("button", { "aria-current": state.tab === id ? "page" : null, onclick: () => c.goTab(id) },
      label, id === "quiz" && c.duelBadge() > 0 && h("em", { class: "dot" }, String(c.duelBadge())));
    return h("header", { class: "dk-top" },
      h("div", { class: "dk-left" },
        h("button", { class: "dk-logo", title: t("처음 화면으로"), "aria-label": t("처음 화면으로"), onclick: c.goHome }, c.logoIcon(28), c.wordmark(24)),
        h("nav", { class: "dk-nav" }, item("search", t("사전")), item("quiz", t("퀴즈")), item("rank", t("랭킹")))),
      bare ? h("span", { class: "dk-gap" }) : c.searchForm(true),
      h("div", { class: "dk-me" },
        todayMenu(),
        h("button", { class: "dk-link", "aria-pressed": String(state.tab === "friends"), onclick: () => c.openPage("friends") },
          t("친구"), c.friendsBadge() > 0 && h("em", { class: "dot" }, String(c.friendsBadge()))),
        h("button", { class: "dk-link", "aria-pressed": String(state.tab === "settings"), onclick: c.openSettings }, t("설정")),
        h("button", { class: "points dk-points", id: "points", title: t("포인트샵 열기"), "aria-pressed": String(state.tab === "shop"), onclick: c.openShop },
          h("i", { "aria-hidden": "true" }, "P"), h("span", null, String(state.user.points || 0)), c.shopMark())));
  }

  // ----- the frame -----
  // banners: the lines the app shows above a screen (demo, urgent, update). view: the chosen screen.
  function frame({ banners, view, mainClass }) {
    const bare = c.webHome();
    return h("div", { class: `dk${state.wordsFolded ? " folded" : ""}${bare ? " bare" : ""}` },
      top(bare),
      state.wordsFolded
        ? h("button", { class: "dk-unfold", title: t("단어장 펼치기"), "aria-label": t("단어장 펼치기"), onclick: () => fold(false) }, h("i", { "aria-hidden": "true" }, "▸"), h("span", null, t("단어장")))
        : wordsPanel(),
      h("main", { class: mainClass },
        banners,
        // Back is the browser's own button; this arrow, at the top left of the screen, does the same.
        !bare && h("button", { class: "dk-back", title: t("뒤로"), "aria-label": t("뒤로"), onclick: () => history.back() }, "←"),
        view));
  }
  return { frame };
}
