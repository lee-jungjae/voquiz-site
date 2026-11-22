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
  // Which words (the filters), in which language and gathered how (the "view" menu), and what can be
  // done to a word (star, group, back into the quizzes, delete: they show when the row is pointed at).
  const FILTERS = () => [["all", t("전체"), t("전체")], ["favorites", "★", t("★ 즐겨찾기")], ["review", t("복습"), t("복습 필요")], ["learned", t("익힘"), t("✓ 다 익힘")], ["found", "✦", t("✦ 내가 발견")]];
  const LANGS = () => [["recent", t("전체")], ["en", t("영어")], ["ko", t("한국어")]];
  const inLang = (lang) => (lang === "recent" ? state.words : state.words.filter((w) => (w.content?.language === "ko" ? "ko" : "en") === lang));
  const filterNow = () => (["favorites", "review", "learned", "found"].includes(state.filter) ? state.filter : "all");
  function viewMenu() {
    const lang = state.wordLang || "recent", by = state.groupBy || "day";
    const set = (patch) => () => { Object.assign(state, patch); render(); };
    const choice = (on, label, act, count) => h("button", { "aria-pressed": String(on), onclick: act }, label, count != null && h("small", null, String(count)));
    // The button says what is chosen when it is not the usual view (every word, by day).
    const now = [lang !== "recent" && LANGS().find(([id]) => id === lang)[1], by === "week" && t("주")].filter(Boolean).join(" · ");
    return h("div", { class: "dk-view-wrap" },
      h("button", { class: `dk-view${now ? " set" : ""}`, "aria-expanded": String(Boolean(state.dkView)), onclick: () => { state.dkView = !state.dkView; render(); } }, now || t("보기"), h("i", { "aria-hidden": "true" }, "▾")),
      state.dkView && h("div", { class: "dk-view-menu", role: "dialog", "aria-label": t("보기") },
        h("h5", null, t("언어")),
        h("div", { class: "dk-opts", role: "group", "aria-label": t("언어") }, LANGS().map(([id, label]) => choice(lang === id, label, set({ wordLang: id }), inLang(id).length))),
        h("h5", null, t("묶어 보기")),
        h("div", { class: "dk-opts", role: "group", "aria-label": t("묶어 보기") }, [["day", t("날짜")], ["week", t("주")]].map(([id, label]) => choice(by === id, label, set({ groupBy: id })))),
        h("p", { class: "dk-key" }, "★ ", t("즐겨찾기"), " · ✦ ", t("첫 발견"), " · ↻ ", t("복습"), " · ✓ ", t("다 익힘"))));
  }
  document.addEventListener("click", (e) => { // a click anywhere else closes the view menu
    if (state.dkView && !e.target.closest?.(".dk-view-wrap")) { state.dkView = false; render(); }
  });
  function wordsPanel() {
    const open = (w) => { Object.assign(state, { tab: "search", entry: w, notice: null, level: null, query: "", confirmDelete: null }); render(); };
    const filter = filterNow();
    const grouped = filter === "favorites" && c.canGroup();
    const group = grouped && c.folders().includes(state.folder) ? state.folder : null;
    const matches = (w) => (filter === "favorites" ? w.favorite && (!group || w.folder === group) : filter === "review" ? w.needs_review : filter === "learned" ? c.isLearned(w) : filter === "found" ? w.discovered : true);
    const inView = inLang(state.wordLang || "recent").filter(matches);
    const old = filter === "learned" ? inView.filter((w) => c.canRetest(w)) : []; // learned long enough ago to go back into the quizzes
    const mark = (symbol, name) => h("i", { class: "dk-mark", title: name, "aria-label": name, role: "img" }, symbol);
    const row = (w) => {
      const asking = state.confirmDelete === w.term_norm;
      const many = c.meanings(w.content);
      const when = filter === "learned" && c.isLearned(w) && t("{d}에 익힘", { d: new Date(w.mastered_at).toLocaleDateString(c.locale(), { month: "short", day: "numeric" }) });
      return h("div", { class: `dk-word${state.tab === "search" && state.entry?.term_norm === w.term_norm ? " on" : ""}${asking ? " asking" : ""}` },
        h("button", { class: "dk-open", onclick: () => open(w) },
          h("b", null, h("span", null, w.headword), w.favorite && mark("★", t("즐겨찾기")), w.discovered && mark("✦", t("첫 발견")), w.needs_review && mark("↻", t("복습")), c.isLearned(w) && mark("✓", t("다 익힘"))),
          h("span", null, [many ? many.join(" · ") : w.content?.counterpart || "", grouped && w.folder, when].filter(Boolean).join("  ·  "))),
        // Deleting asks once more, right in the row, with a way back next to it.
        asking
          ? h("span", { class: "dk-acts ask" },
              h("button", { onclick: () => { state.confirmDelete = null; render(); } }, t("취소")),
              h("button", { class: "sure", onclick: () => { state.confirmDelete = null; c.removeWord(w); } }, t("삭제")))
          : h("span", { class: "dk-acts" },
              filter === "learned" && c.canRetest(w) && h("button", { class: "text", onclick: () => c.retest([w]) }, t("다시 퀴즈")),
              grouped && w.favorite && h("button", { class: w.folder ? "on" : null, title: t("그룹 정하기"), "aria-label": t("그룹 정하기"), onclick: () => c.folderSheet(w) }, c.icon("folder")),
              c.star(w),
              h("button", { title: t("단어 삭제"), "aria-label": t("단어 삭제"), onclick: () => { state.confirmDelete = w.term_norm; render(); } }, "✕")));
    };
    const rows = () => {
      const q = (state.wordsFind || "").trim().toLowerCase();
      const shown = inView.filter((w) => !q || w.headword.toLowerCase().includes(q) || String(w.content?.counterpart || "").toLowerCase().includes(q));
      if (!shown.length) return [h("p", { class: "dk-none" }, state.words.length ? t("여기에 해당하는 단어가 없어요.") : t("아직 찾아본 단어가 없어요."))];
      // Words arrive newest first, so the days (or weeks) come out newest first too.
      const byWeek = state.groupBy === "week";
      const parts = new Map();
      for (const w of shown) {
        const key = byWeek ? c.weekKey(new Date(w.last_searched_at)) : c.dayOf(w.last_searched_at);
        if (!parts.has(key)) parts.set(key, []);
        parts.get(key).push(w);
      }
      if (!byWeek) return [...parts].map(([day, words]) => h("section", null, h("h4", null, c.dayLabel(day), h("small", null, String(words.length))), words.map(row)));
      // By week, only this week starts open; the others open when their title is pressed (all of them while finding).
      state.openWeeks ||= new Set([c.weekKey()]);
      return [...parts].map(([key, words]) => {
        const isOpen = Boolean(q) || state.openWeeks.has(key);
        return h("section", null,
          h("button", { class: "dk-week", "aria-expanded": String(isOpen), onclick: () => { state.openWeeks[state.openWeeks.has(key) ? "delete" : "add"](key); render(); } },
            h("span", null, c.weekLabel(key)), h("small", null, String(words.length)), h("i", { "aria-hidden": "true" }, isOpen ? "▾" : "▸")),
          isOpen && words.map(row));
      });
    };
    const list = h("div", { class: "dk-list" }, rows());
    // The list keeps its place when the screen is drawn again; typing in the box only redraws the list.
    list.addEventListener("scroll", () => { state.dkListScroll = list.scrollTop; }, { passive: true });
    requestAnimationFrame(() => { list.scrollTop = state.dkListScroll || 0; });
    return h("aside", { class: "dk-words", "aria-label": t("단어장") },
      h("div", { class: "dk-words-head" },
        h("b", null, t("단어장")), h("small", null, String(state.words.length)),
        viewMenu(),
        h("button", { class: `dk-fold${Date.now() - cameOut < SHOW_MS ? " hint" : ""}`, title: t("단어장 접기"), "aria-label": t("단어장 접기"), onclick: () => fold(true) }, "◂")),
      h("input", { type: "search", id: "dk-find", value: state.wordsFind || "", autocomplete: "off", placeholder: t("내 단어에서 찾기"), "aria-label": t("내 단어에서 찾기"),
        oninput: (e) => { state.wordsFind = e.target.value; list.replaceChildren(...rows().flat()); } }),
      h("div", { class: "dk-filters", role: "group", "aria-label": t("거르기") }, FILTERS().map(([id, label, name]) =>
        h("button", { "aria-pressed": String(filter === id), title: name, "aria-label": name, onclick: () => { Object.assign(state, { filter: id, dkListScroll: 0 }); render(); } }, label))),
      // Favourites can be narrowed to one group (Plus); learned words say when they may be asked again.
      filter === "favorites" && (!c.canGroup()
        ? h("button", { class: "dk-plus", onclick: c.openPlus }, h("em", { class: "plus-badge" }, "PLUS"), h("span", null, t("즐겨찾기를 그룹으로 나눌 수 있어요")))
        : c.folders().length
          ? h("div", { class: "dk-groups", role: "group", "aria-label": t("그룹") }, [[null, t("모든 그룹")], ...c.folders().map((name) => [name, name])].map(([id, label]) =>
              h("button", { "aria-pressed": String(group === id), onclick: () => { state.folder = id; render(); } }, label)))
          : inView.length > 0 && h("p", { class: "dk-info" }, t("폴더 버튼을 눌러 즐겨찾기를 그룹으로 나눠 보세요."))),
      filter === "learned" && h("div", { class: "dk-info" },
        h("p", null, t("{n}번 연속(쓰기 1번 포함) 맞힌 단어예요. 퀴즈에는 나오지 않아요.", { n: c.MASTER_STREAK }), " ", t("익힌 지 {d}일이 지나면 다시 퀴즈에 넣을 수 있어요.", { d: c.RETEST_DAYS })),
        old.length > 1 && h("button", { onclick: () => c.retest(old) }, t("{d}일 지난 단어 {n}개 모두 다시 넣기", { d: c.RETEST_DAYS, n: old.length }))),
      list);
  }

  // ----- the top: logo and menu on the left, the word box in the middle, the student's corner on the right -----
  // "오늘" opens what the day holds (the present, today's points, the week's goal, today's words
  // with the way on to a quiz, the character quest): it is one click away from every screen
  // without taking a column of its own.
  function todayMenu() {
    return h("div", { class: "dk-today-wrap" },
      h("button", { class: "dk-link", "aria-expanded": String(Boolean(state.todayOpen)), onclick: () => { state.todayOpen = !state.todayOpen; render(); } },
        t("오늘"), c.presentWaiting() && !c.webHome() && h("em", { class: "dot", "aria-hidden": "true" }), !state.todayOpen && pop(3)),
      state.todayOpen && h("div", { class: "dk-today", role: "dialog", "aria-label": t("오늘") },
        c.presentWaiting() && h("button", { class: "dk-present", onclick: () => { state.todayOpen = false; c.openPresent(); } }, c.giftArt(), t("오늘의 선물 받기")),
        c.dailyGoal(),
        c.todayBox(),
        c.questHint()));
  }
  document.addEventListener("click", (e) => { // a click anywhere else closes it
    if (state.todayOpen && !e.target.closest?.(".dk-today-wrap") && !e.target.closest?.("#sheet")) { state.todayOpen = false; render(); }
  });
  const pop = (n) => {
    const id = c.residents()[n];
    return id ? h("span", { class: "dk-pop", "aria-hidden": "true" }, c.portrait(id)) : null;
  };
  function top(bare) {
    const item = (id, label, n) => h("button", { "aria-current": state.tab === id ? "page" : null, onclick: () => c.goTab(id) },
      label, id === "quiz" && c.duelBadge() > 0 && h("em", { class: "dot" }, String(c.duelBadge())), pop(n));
    return h("header", { class: "dk-top" },
      h("div", { class: "dk-left" },
        h("button", { class: "dk-logo", title: t("처음 화면으로"), "aria-label": t("처음 화면으로"), onclick: c.goHome }, c.logoIcon(28), c.wordmark(24)),
        h("nav", { class: "dk-nav" }, item("search", t("사전"), 0), item("quiz", t("퀴즈"), 1), item("rank", t("랭킹"), 2))),
      bare ? h("span", { class: "dk-gap" }) : c.searchForm(true),
      h("div", { class: "dk-me" },
        todayMenu(),
        h("button", { class: "dk-link", "aria-pressed": String(state.tab === "friends"), onclick: () => c.openPage("friends") },
          t("친구"), c.friendsBadge() > 0 && h("em", { class: "dot" }, String(c.friendsBadge())), pop(4)),
        h("button", { class: "dk-link", "aria-pressed": String(state.tab === "settings"), onclick: c.openSettings }, t("설정"), pop(5)),
        h("button", { class: "points dk-points", id: "points", title: t("포인트샵 열기"), "aria-pressed": String(state.tab === "shop"), onclick: c.openShop },
          h("i", { "aria-hidden": "true" }, "P"), h("span", null, String(state.user.points || 0)), c.shopMark())));
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
        ? h("button", { class: "dk-unfold", title: t("단어장 펼치기"), "aria-label": t("단어장 펼치기"), onclick: () => fold(false) }, h("i", { "aria-hidden": "true" }, "▸"), h("span", null, t("단어장")))
        : wordsPanel(),
      h("main", { class: mainClass },
        banners,
        // Back is the browser's own button; this arrow, at the top left of the screen, does the same.
        !bare && !focus && h("button", { class: "dk-back", title: t("뒤로"), "aria-label": t("뒤로"), onclick: () => history.back() }, "←"),
        view));
  }
  // A wide window has no separate word list screen: the list on the left is it, so it is unfolded when asked for.
  const showWords = () => { state.wordsFolded = false; comesOut = false; };
  return { frame, showWords };
}
