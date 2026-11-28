// The story film of the first screens (choosing a language, signing in): five little stories, each
// a problem and then what VOQUIZ does about it, acted out by the characters. The homepage plays the
// same film at its top (tools/site_film there); a change to the story belongs in both.
//
// A scene is some markup on a 480 x 300 stage and a list of timed steps. A step either adds a class
// to the scene (s1, s2, …: the styles in app.css do the rest) or makes a character act.
// film() always returns the same element, so it keeps playing where it was when the screen is drawn
// again, and it speaks the language of the screen: change the language and the scene starts over in it.
import { t, getLang } from "./i18n.js?v=0.1.28-tp7viw";
import { art } from "./mascot.js?v=0.1.28-tp7viw";
import { CHARACTERS } from "./characters.js?v=0.1.28-tp7viw";
import { ICON_SVG, WORDMARK_SVG } from "./logo.js?v=0.1.28-tp7viw";

const actor = (id, name, place) => `<span class="mascot f-actor ${name}" style="${place}" data-eyes="default" data-mouth="smile">${art(id)}</span>`;
const mini = (id, step) => `<span class="mascot shade ${step}">${art(id)}</span>`;
const bar = '<div class="fw-bar"><i></i><i></i><i></i></div>';
const page = '<div class="fw-page"><s style="width:70%"></s><p>… the whole <mark>ecosystem</mark> depends on …</p><s></s><s style="width:80%"></s><s style="width:55%"></s></div>';
const pointer = '<svg viewBox="0 0 24 24"><path d="M5 3 l13 9 l-6 1.2 l-2.5 6 z" fill="#2e2a47" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
// a few one-word labels that mean something else elsewhere in the app, so they are kept here
const word = (ko, en, zh) => ({ ko, en, zh })[getLang()] || ko;

// the same meaning, as it is written for the oldest and for the youngest (explanations are Korean or English only)
const HARD = () => word("질량을 가진 모든 물체 사이에 작용하는 인력으로, 거리의 제곱에 반비례한다.", "The attractive force between all masses, inversely proportional to the square of the distance.", "The attractive force between all masses, inversely proportional to the square of the distance.");
const EASY = () => word("물건을 땅으로 끌어당기는 힘이에요.", "The force that pulls things down to the ground.", "The force that pulls things down to the ground.");
// name: what its dot is called · scenes: the problem, then the answer (cap: the line under the chip)
const STORIES = [
  { name: "두 언어로", scenes: [
    { ms: 4300, cap: "영어로 찾았더니 영어 뜻만… 한국어로는 뭐라고 하지?",
      html: () => `${actor("rabbit", "a", "left:-20px;bottom:6px")}
        <div class="f-prop p1 f-card f-dict" style="left:186px;top:40px;width:270px"><small>English dictionary</small><b class="f-hw">photosynthesis</b><p>the process by which green plants make their own food from sunlight</p></div>
        <div class="f-prop p2 f-say" style="left:20px;top:100px">${t("한국어로는… 뭐지?")}</div>
        <i class="f-q q2" style="left:150px;top:160px">?</i><i class="f-q q2 f-late" style="left:14px;top:150px">?</i>`,
      steps: [[300, "s1"], [1300, ["a", "wide", "o", "pop"]], [2100, "s2"], [2100, ["a", "wide", "wavy", "tilt"]], [3300, ["a", "closed", "wavy", "sway"]]] },
    { ms: 4500, cap: "VOQUIZ는 한 번 찾으면 한국어와 영어, 두 언어로 알려 줘!",
      html: () => `${actor("rabbit", "a", "left:-20px;bottom:6px")}
        <div class="f-prop p1 f-card" style="left:178px;top:24px;width:286px">
          <span class="f-vq-top">${ICON_SVG}VOQUIZ</span>
          <div class="f-vq-head"><b class="f-hw">photosynthesis</b><em class="f-prop p2">광합성</em></div>
          <p class="f-prop p2 f-line"><i>${word("한", "KO", "韩")}</i>식물이 햇빛으로 양분을 만드는 일</p>
          <p class="f-prop p3 f-line"><i class="en">EN</i>how plants make food from sunlight</p>
        </div>
        <i class="f-spark k3" style="left:158px;top:14px">✦</i><i class="f-spark k3 f-late" style="left:448px;top:176px">✦</i>`,
      steps: [[250, "s1"], [900, "s2"], [1500, "s3"], [1700, ["a", "star", "laugh", "jump"]], [3000, ["a", "heart", "cat", "wiggle"]]] },
  ] },
  { name: "내 수준에 맞게", scenes: [
    { ms: 4300, cap: "설명이 너무 어려워… 무슨 말인지 모르겠어.",
      html: () => `${actor("cupcake", "a", "left:-20px;bottom:6px")}
        <div class="f-prop p1 f-card f-dict" style="left:186px;top:36px;width:272px"><small>${t("사전")}</small><b class="f-hw">gravity</b><p>${HARD()}</p></div>
        <div class="f-prop p2 f-say" style="left:36px;top:100px">${t("너무 어려워…")}</div>
        <i class="f-q q2" style="left:150px;top:160px">?</i><i class="f-q q2 f-late" style="left:14px;top:150px">?</i>`,
      steps: [[300, "s1"], [1300, ["a", "wide", "o", "pop"]], [2100, "s2"], [2100, ["a", "dizzy", "wavy", "shake"]], [3300, ["a", "closed", "wavy", "sway"]]] },
    { ms: 4800, cap: "더 쉽게, 더 자세히! 설명을 내 수준에 맞게 바꿔 볼 수 있어.",
      html: () => `${actor("cupcake", "a", "left:-20px;bottom:6px")}
        <div class="f-prop p1 f-card" style="left:178px;top:20px;width:286px">
          <span class="f-vq-top">${ICON_SVG}VOQUIZ</span>
          <div class="f-vq-head"><b class="f-hw">gravity</b><em>중력</em></div>
          <div class="f-swap"><p class="f-old">${HARD()}</p><p class="f-new">${EASY()}</p></div>
          <div class="f-levels"><span class="f-lv f-easy">‹ ${t("더 쉽게")}</span><span class="f-lvnow"><b class="f-old">G9–12</b><b class="f-new">G3–5</b></span><span class="f-lv">${t("더 자세히")} ›</span></div>
        </div>
        <div class="f-prop p2 h3 f-tap" style="left:204px;top:184px">${pointer}</div>
        <i class="f-spark k3" style="left:158px;top:10px">✦</i><i class="f-spark k3 f-late" style="left:452px;top:150px">✦</i>`,
      steps: [[250, "s1"], [1300, "s2"], [2100, "s3"], [2300, ["a", "star", "laugh", "jump"]], [3500, ["a", "heart", "cat", "wiggle"]]] },
  ] },
  { name: "단어장", scenes: [
    { ms: 4300, cap: "어제 찾아본 단어인데… 뭐였더라?",
      html: () => `${actor("penguin", "a", "left:125px;bottom:6px")}
        <div class="f-prop p1 f-card f-cloud" style="left:112px;top:20px;width:256px"><small>${t("어제 찾아본 단어")}</small>
          <div class="f-cloud-word"><b class="f-hw f-fly">resilient</b><b class="f-hw f-gone">${t("뭐였더라…?")}</b></div></div>
        <i class="f-prop p1 f-dot" style="left:226px;top:120px"></i><i class="f-prop p1 f-dot small" style="left:238px;top:144px"></i>
        <i class="f-q q3" style="left:150px;top:160px">?</i><i class="f-q q3 f-late" style="left:316px;top:150px">?</i>`,
      steps: [[300, "s1"], [1400, "s2"], [1500, ["a", "wide", "o", "pop"]], [2500, "s3"], [2500, ["a", "dizzy", "wavy", "shake"]], [3500, ["a", "closed", "wavy", "sway"]]] },
    { ms: 4500, cap: "찾은 단어는 단어장에 알아서 쏙! 언제든 다시 볼 수 있어.",
      html: () => `${actor("penguin", "a", "left:-18px;bottom:6px")}
        <div class="f-prop p1 f-card" style="left:192px;top:20px;width:268px">
          <div class="f-list-top"><b>${t("단어장")}</b><small>${t("오늘")}</small></div>
          <div class="f-prop p2 f-row"><span>resilient</span><em>회복력 있는</em><i>✓</i></div>
          <div class="f-prop p3 f-row"><span>photosynthesis</span><em>광합성</em><i class="found">✦</i></div>
          <div class="f-prop p4 f-row"><span>ecosystem</span><em>생태계</em><i class="review">↻</i></div>
        </div>`,
      steps: [[250, "s1"], [700, "s2"], [1150, "s3"], [1600, "s4"], [1900, ["a", "heart", "cat", "wiggle"]], [3100, ["a", "happy", "laugh", "jump"]]] },
  ] },
  { name: "바로 옆에서", scenes: [
    { ms: 4400, cap: "모르는 단어마다 새 창 열고, 검색하고, 돌아오고…",
      html: () => `<div class="f-prop p1 f-win" style="left:22px;top:24px;width:300px;height:188px">${bar}${page}</div>
        <div class="f-prop p2 f-tab" style="left:150px;top:10px;--r:-4deg"><b>${t("새 탭")}</b><s></s></div>
        <div class="f-prop p3 f-tab" style="left:204px;top:58px;--r:5deg"><b>${t("검색: ecosystem")}</b><s></s></div>
        <div class="f-prop p4 f-tab" style="left:134px;top:104px;--r:-6deg"><b>${t("사전")}</b><s></s></div>
        <div class="f-prop p5 f-tab" style="left:214px;top:148px;--r:4deg"><b>${t("번역기")}</b><s></s></div>
        ${actor("bee", "a", "left:286px;bottom:6px")}`,
      steps: [[300, "s1"], [900, "s2"], [1300, "s3"], [1700, "s4"], [2100, "s5"], [2300, ["a", "dizzy", "wavy", "spin"]], [3400, ["a", "dizzy", "wavy", "shake"]]] },
    { ms: 4600, cap: "보던 페이지 바로 옆에서! 단어를 고르고 우클릭하면 끝.",
      html: () => `<div class="f-prop p1 f-win" style="left:20px;top:22px;width:336px;height:196px">${bar}${page}
          <div class="fw-panel">${ICON_SVG}<b>ecosystem</b><em>생태계</em><s></s><s style="width:70%"></s></div></div>
        <div class="f-prop p2 h3 f-menu" style="left:92px;top:98px">${pointer}VOQUIZ: "ecosystem"</div>
        ${actor("bee", "a", "left:290px;bottom:6px")}`,
      steps: [[300, "s1"], [1000, "s2"], [1900, "s3"], [2200, ["a", "wink", "cat", "squish"]], [3400, ["a", "happy", "laugh", "jump"]]] },
  ] },
  { name: "퀴즈와 대결", scenes: [
    { ms: 4400, cap: "혼자서는 테스트하기 어려워. 누가 문제 좀 내 줘!",
      html: () => `${actor("cat", "a", "left:16px;bottom:6px")}
        <div class="f-prop p1 f-flash" style="left:250px;top:96px"><div class="f-flip"><span>resilient</span><span class="back">회복력 있는</span></div></div>
        <div class="f-prop p2 h3 f-say" style="left:70px;top:106px">${t("앗, 답이 보여!")}</div>
        <div class="f-prop p3 f-say" style="left:52px;top:106px">${t("누가 문제 좀 내 줘…")}</div>`,
      steps: [[300, "s1"], [1300, "s2"], [1300, ["a", "wide", "o", "pop"]], [2600, "s3"], [2600, ["a", "closed", "wavy", "shrink"]]] },
    { ms: 4800, cap: "내가 찾은 단어로 퀴즈가 뚝딱! 친구와 대결도 할 수 있어.",
      html: () => `${actor("cat", "a", "left:-34px;bottom:6px")}
        <div class="f-prop p1 f-card f-quiz" style="left:142px;top:12px;width:210px"><small>${t("퀴즈")}</small><b>${t("‘회복력 있는’은 영어로?")}</b>
          <div class="f-opts"><span>fragile</span><span class="right">resilient</span><span>ancient</span><span>narrow</span></div></div>
        <div class="f-prop p2 f-ok" style="left:322px;top:2px">${t("정답!")}</div>
        ${actor("fox", "b", "left:286px;bottom:6px")}
        <div class="f-prop p3 f-score" style="left:146px;top:208px;width:202px"><b>${word("나", "Me", "我")} 7</b><em>${t("대결")}</em><b>6 ${word("친구", "Friend", "朋友")}</b></div>`,
      steps: [[250, "s1"], [1200, "s2"], [1200, ["a", "star", "laugh", "jump"]], [2300, "s3"], [2500, ["b", "happy", "cat", "bounce"]], [3400, ["a", "heart", "laugh", "party"]], [3500, ["b", "star", "laugh", "jump"]]] },
  ] },
  { name: "모으는 재미", scenes: [
    { ms: 4100, cap: "단어 찾기? 귀찮아… 내일 할래.",
      html: () => `${actor("burger", "a", "left:110px;bottom:6px")}
        <div class="f-prop p1 f-say" style="left:150px;top:104px">${t("귀찮아… 내일 할래")}</div>
        <i class="f-z z2" style="left:286px;top:160px">z</i><i class="f-z z2 f-late" style="left:306px;top:134px">Z</i><i class="f-z z2 f-later" style="left:326px;top:106px">z</i>
        <div class="f-prop p1 f-book" style="left:356px;top:216px">${word("단어", "Words", "单词")}</div>`,
      steps: [[300, "s1"], [1000, "s2"], [1000, ["a", "closed", "yawn", "sway"]], [2600, ["a", "closed", "wavy", "sway"]]] },
    { ms: 5000, cap: "찾을수록 포인트가 쌓여! 캐릭터도 모으고 리그에서 겨뤄.",
      html: () => `${actor("burger", "a", "left:-30px;bottom:6px")}
        <i class="f-coin c1" style="left:66px;top:138px">+5</i><i class="f-coin c1 f-late" style="left:116px;top:152px">+5</i><i class="f-coin c1 f-later" style="left:22px;top:158px">+5</i>
        <div class="f-prop p2 f-card" style="left:174px;top:18px;width:288px"><small>${t("모으는 캐릭터 {n}종", { n: CHARACTERS.length })}</small>
          <div class="f-mini">${mini("sunflower", "m3")}${mini("butterfly", "m4")}${mini("cupcake", "m5")}${mini("robot", "m6")}</div></div>
        <div class="f-prop p7 f-league" style="left:190px;top:178px"><i>1</i><b>${t("주간 리그 1위!")}</b><em>+300</em></div>`,
      steps: [[250, "s1"], [250, ["a", "star", "laugh", "jump"]], [900, "s2"], [1300, "s3"], [1650, "s4"], [2000, "s5"], [2350, "s6"], [2900, "s7"], [2900, ["a", "heart", "laugh", "party"]], [4000, ["a", "star", "laugh", "jump"]]] },
  ] },
];
const END = { ms: 3800, cap: "이제 VOQUIZ랑 같이 해 볼까?",
  html: () => `<div class="f-prop p1 f-logo" style="left:130px;top:22px;width:220px">${WORDMARK_SVG}</div>${actor("bubble", "a", "left:125px;bottom:14px")}
    <i class="f-spark k1" style="left:96px;top:120px">✦</i><i class="f-spark k1 f-late" style="left:366px;top:104px">✦</i><i class="f-spark k1 f-later" style="left:330px;top:210px">✦</i>`,
  steps: [[200, "s1"], [500, ["a", "star", "laugh", "party"]], [2000, ["a", "wink", "cat", "squish"]]] };

// one flat list to play through: problem, answer, problem, answer, …, the closing card
const SCENES = [];
STORIES.forEach((story, n) => story.scenes.forEach((scene, part) => SCENES.push({ ...scene, story: n, mood: part ? "answer" : "problem", before: part ? story.scenes[0].ms : 0, whole: story.scenes[0].ms + story.scenes[1].ms })));
SCENES.push({ ...END, story: STORIES.length, mood: "end" });
const CHIP = { problem: "이럴 때 있지?", answer: "VOQUIZ라면!" };
const MOVES = ["jump", "spin", "wiggle", "squish", "stretch", "flip", "party", "shrink", "pop", "sway", "shake", "tilt", "bounce", "hop"];

let made = null; // { root, redraw }

function make() {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches; // then nothing plays by itself: each story shows its answer
  const root = document.createElement("section");
  root.className = "film";
  root.dataset.mood = "problem";
  root.innerHTML = `<div class="film-words"><span class="film-chip"></span><p class="film-caption"></p></div>
    <div class="film-box"><div class="film-stage" aria-hidden="true"></div></div>
    <div class="film-controls"><div class="film-dots">${STORIES.map(() => '<button type="button"><span><i></i></span></button>').join("")}</div><button type="button" class="film-pause"></button></div>`;
  const stage = root.querySelector(".film-stage"), chip = root.querySelector(".film-chip"), caption = root.querySelector(".film-caption"), pause = root.querySelector(".film-pause");
  const dots = [...root.querySelectorAll(".film-dots button")];
  let index = calm ? 1 : 0, timers = [], paused = false, running = false, seen = false, lang = "";

  function act(scene, who, eyes, mouth, move) {
    const m = scene.querySelector(".f-actor." + who);
    if (!m) return;
    m.dataset.eyes = eyes;
    m.dataset.mouth = mouth;
    m.classList.remove(...MOVES);
    void m.offsetWidth; // lets the same move play again
    if (move) m.classList.add(move);
  }
  function stop() { timers.forEach(clearTimeout); timers = []; running = false; }
  const later = (ms, run) => timers.push(setTimeout(() => (root.isConnected ? run() : stop()), ms)); // off the screen for good: it stops
  function words(s) {
    root.dataset.mood = s.mood;
    chip.textContent = s.mood === "end" ? "VOQUIZ" : t(CHIP[s.mood]);
    const cap = t(s.cap);
    if (caption.textContent !== cap) { caption.textContent = cap; caption.classList.remove("in"); void caption.offsetWidth; caption.classList.add("in"); }
  }
  // Shows scene i. `still`: at its end state, with nothing moving on (reduced motion).
  function show(i, still) {
    stop();
    index = i;
    const s = SCENES[i];
    words(s);
    const old = stage.querySelectorAll(".f-scene");
    const scene = document.createElement("div");
    scene.className = `f-scene ${s.mood}`;
    scene.innerHTML = s.html();
    stage.append(scene);
    void scene.offsetWidth;
    scene.classList.add("on");
    for (const o of old) { o.classList.remove("on"); setTimeout(() => o.remove(), 320); }
    dots.forEach((dot, n) => {
      dot.classList.toggle("done", n < s.story);
      dot.setAttribute("aria-current", String(n === s.story));
      const fill = dot.querySelector("i");
      fill.style.animation = "none";
      fill.style.width = "";
      if (n !== s.story) return;
      if (still) { fill.style.width = "100%"; return; }
      void fill.offsetWidth;
      fill.style.animation = `film-fill ${s.whole}ms linear -${s.before}ms forwards`;
    });
    const run = ([, what]) => (typeof what === "string" ? scene.classList.add(what) : act(scene, ...what));
    if (still) { s.steps.forEach(run); return; }
    running = true;
    for (const step of s.steps) later(step[0], () => run(step));
    later(s.ms, () => show((i + 1) % SCENES.length));
  }
  const first = (story) => SCENES.findIndex((s) => s.story === story);
  dots.forEach((dot, n) => dot.addEventListener("click", () => {
    if (calm) return show(first(n) + 1, true);
    setPaused(false);
    show(first(n));
  }));
  function setPaused(now) {
    paused = now;
    root.classList.toggle("paused", paused);
    pause.textContent = paused ? "▶" : "❙❙";
    pause.setAttribute("aria-label", paused ? t("재생") : t("일시 정지"));
  }
  pause.addEventListener("click", () => {
    setPaused(!paused);
    if (paused) stop(); else show(index);
  });
  pause.hidden = calm;

  // the stage is drawn at 480 wide and scaled to its box
  const box = stage.parentElement;
  new ResizeObserver(() => { if (box.clientWidth) stage.style.setProperty("--k", String(box.clientWidth / 480)); }).observe(box);

  // It plays only while it can be seen: off the screen or in a hidden panel it waits, then starts the scene again.
  const sync = () => {
    if (calm) return;
    const can = seen && root.isConnected && !document.hidden && !paused;
    if (can && !running) show(index);
    else if (!can && running) stop();
  };
  new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; sync(); }, { threshold: 0.25 }).observe(root);
  document.addEventListener("visibilitychange", sync);

  // Called every time the screen is drawn: the labels follow the screen's language, and so does the scene.
  function redraw() {
    root.setAttribute("aria-label", t("VOQUIZ를 소개하는 짧은 애니메이션"));
    dots.forEach((dot, n) => { dot.title = t(STORIES[n].name); dot.setAttribute("aria-label", dot.title); });
    setPaused(paused);
    if (lang === getLang()) return;
    const start = !lang;
    lang = getLang();
    if (calm) show(index, true);
    else if (running) show(index);
    else if (start || stage.firstChild) words(SCENES[index]);
  }
  return { root, redraw };
}

export function film() {
  made ||= make();
  made.redraw();
  return made.root;
}
