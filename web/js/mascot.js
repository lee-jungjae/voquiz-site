// The VOQUIZ mascot: a small speech-bubble creature that juggles letters on the home screen.
// Drawn here as fixed SVG (no user data), animated in app.css (.mascot ...). It takes the theme colour.
//
// A tap sets off one of a dozen moods. A mood is a body move, a pair of eyes, a mouth, the little
// things that float up, and sometimes a line of speech (often it just shows the feeling).
// Left alone, it lives a little life of its own: it glances about, hums and yawns, wanders from
// side to side, rolls, sits down for a song, or lies down for a nap until someone taps it awake.
import { characterById } from "./characters.js?v=0.1.28-tp7ugm";

// The face is the same for every character; moods swap its eyes and mouth.
const FACE = `
    <g class="m-face">
      <ellipse class="m-cheek" cx="78" cy="93" rx="7" ry="4.5"/>
      <ellipse class="m-cheek" cx="122" cy="93" rx="7" ry="4.5"/>
      <g class="m-look">
        <g class="m-eyes e e-default">
          <circle cx="86" cy="82" r="5.5"/><circle cx="114" cy="82" r="5.5"/>
          <circle class="m-glint" cx="88" cy="80" r="1.9"/><circle class="m-glint" cx="116" cy="80" r="1.9"/>
        </g>
        <g class="e e-wide">
          <circle cx="86" cy="81" r="7.5"/><circle cx="114" cy="81" r="7.5"/>
          <circle class="m-glint" cx="89" cy="78" r="2.6"/><circle class="m-glint" cx="117" cy="78" r="2.6"/>
        </g>
        <g class="e e-wink">
          <circle cx="86" cy="82" r="5.5"/><circle class="m-glint" cx="88" cy="80" r="1.9"/>
          <path class="line" d="M108 84 q6 -8 12 0"/>
        </g>
      </g>
      <g class="e e-happy"><path class="line" d="M80 84 q6 -8 12 0"/><path class="line" d="M108 84 q6 -8 12 0"/></g>
      <g class="e e-closed"><path class="line" d="M80 82 q6 5 12 0"/><path class="line" d="M108 82 q6 5 12 0"/></g>
      <g class="e e-laugh"><path class="line" d="M81 77 l9 5 l-9 5"/><path class="line" d="M119 77 l-9 5 l9 5"/></g>
      <g class="e e-dizzy"><path class="line" d="M81 77 l10 10 M91 77 l-10 10"/><path class="line" d="M109 77 l10 10 M119 77 l-10 10"/></g>
      <g class="e e-heart">
        <path d="M86 88 l-7 -7 a4 4 0 0 1 7 -4 a4 4 0 0 1 7 4 z"/><path d="M114 88 l-7 -7 a4 4 0 0 1 7 -4 a4 4 0 0 1 7 4 z"/>
      </g>
      <g class="e e-star">
        <path d="M86 74 l2.4 5 l5.6 .7 l-4.1 3.8 l1.1 5.5 l-5 -2.8 l-5 2.8 l1.1 -5.5 l-4.1 -3.8 l5.6 -.7 z"/>
        <path d="M114 74 l2.4 5 l5.6 .7 l-4.1 3.8 l1.1 5.5 l-5 -2.8 l-5 2.8 l1.1 -5.5 l-4.1 -3.8 l5.6 -.7 z"/>
      </g>
      <path class="m-smile mo mo-smile" d="M95 90 q5 5 10 0"/>
      <path class="mo mo-cat line" d="M93 90 q3.5 4.5 7 0 q3.5 4.5 7 0"/>
      <path class="mo mo-wavy line" d="M93 92 q3.5 -4 7 0 q3.5 4 7 0"/>
      <ellipse class="mo mo-o" cx="100" cy="93" rx="3.6" ry="4.6"/>
      <g class="mo mo-yawn"><ellipse cx="100" cy="94" rx="6" ry="7.5"/><ellipse class="m-tongue" cx="100" cy="98" rx="3.6" ry="2.6"/></g>
      <g class="mo mo-laugh"><path d="M93 89 h14 a7 7 0 0 1 -14 0 z"/><path class="m-tongue" d="M96 93.5 a4 3 0 0 1 8 0 a7 7 0 0 1 -8 0 z"/></g>
    </g>`;

// Builds a character's drawing on the shared skeleton. Colours not given by the character
// (the default one) come from the theme, in app.css.
function draw(character) {
  const c = character;
  const paint = (fill, stroke, width) =>
    [fill && `fill:${fill}`, stroke && `stroke:${stroke};stroke-width:${width || 2.5};stroke-linejoin:round`].filter(Boolean).join(";");
  const limb = c.limb ? ` style="stroke:${c.limb}"` : "";
  const [a, b, d] = c.tiles || ["A", "가", "?"];
  return `
<svg viewBox="0 0 200 150" role="img" aria-label="VOQUIZ">
  <ellipse class="m-shadow" cx="100" cy="139" rx="32" ry="5"/>
  <g class="m-tiles">
    <g class="m-tile t1"><rect x="-11" y="-11" width="22" height="22" rx="6"/><text y="5">${a}</text></g>
    <g class="m-tile t2"><rect x="-11" y="-11" width="22" height="22" rx="6"/><text y="5">${b}</text></g>
    <g class="m-tile t3"><rect x="-11" y="-11" width="22" height="22" rx="6"/><text y="5">${d}</text></g>
  </g>
  <g class="m-legs"${c.noLegs ? ' style="display:none"' : ""}>
    <path class="m-leg l"${limb} d="M89 106 v24 h-8"/>
    <path class="m-leg r"${limb} d="M111 106 v24 h8"/>
  </g>
  <g class="m-bob">
    <path class="m-arm l"${limb} d="M72 80 Q50 72 58 52"/>
    <path class="m-arm r"${limb} d="M128 80 Q150 72 142 52"/>
    ${c.wearBack ? `<g class="m-wear back">${c.wearBack}</g>` : ""}
    ${c.back || ""}
    <path class="m-body" d="${c.body}"${c.fill || c.stroke ? ` style="${paint(c.fill, c.stroke, c.strokeWidth)}"` : ""}/>
    ${c.deco || ""}
    ${c.topper || ""}
    ${FACE}
    ${c.wearFront ? `<g class="m-wear">${c.wearFront}</g>` : ""}
  </g>
</svg>`;
}

// A character's drawing as markup, for scenes that move it themselves (the story film).
export const art = (id) => draw(characterById(id));

// A character on the shop shelf. It is not tappable, but it is alive: every few seconds it acts
// out one of its moods, each character at its own moment.
export function portrait(id) {
  const el = document.createElement("span");
  el.className = "mascot portrait";
  el.innerHTML = draw(characterById(id));
  const act = () => {
    if (!el.isConnected) return;
    const mood = pick(SHOW);
    el.classList.remove(...MOVES);
    void el.offsetWidth;
    el.classList.add(mood.move);
    Object.assign(el.dataset, { eyes: mood.eyes, mouth: mood.mouth, blush: mood.blush ? "1" : "" });
    setTimeout(() => {
      el.classList.remove(...MOVES);
      Object.assign(el.dataset, { eyes: "default", mouth: "smile", blush: "" });
    }, mood.time || 1000);
    setTimeout(act, 2600 + Math.random() * 5000);
  };
  setTimeout(act, 300 + Math.random() * 4000);
  return el;
}

// move: body animation (app.css) · eyes / mouth: which face parts show · pops: what floats up
// say: lines it may speak (Korean keys, translated by the app); about a third of taps stay silent
const MOODS = {
  joy: { move: "jump", eyes: "happy", mouth: "laugh", pops: ["♥", "✦", "♥"], say: ["히히!", "야호!", "좋아 좋아!"] },
  love: { move: "wiggle", eyes: "heart", mouth: "cat", pops: ["♥", "♥", "♥"], blush: true, say: ["좋아해!", "반가워!"] },
  dizzy: { move: "spin", eyes: "dizzy", mouth: "wavy", pops: ["★", "✦", "★"], say: ["어지러워~", "빙글빙글~"] },
  shy: { move: "shrink", eyes: "closed", mouth: "wavy", pops: ["♥"], blush: true, say: ["부끄러워…", "에헤헤"] },
  surprised: { move: "pop", eyes: "wide", mouth: "o", pops: ["!", "!", "?"], say: ["깜짝이야!", "앗!"] },
  sleepy: { move: "sway", eyes: "closed", mouth: "yawn", pops: ["z", "Z", "z"], time: 1700, say: ["하암…", "졸려…"] },
  proud: { move: "flip", eyes: "star", mouth: "cat", pops: ["★", "✦", "★"], say: ["짜잔!", "멋지지?"] },
  giggle: { move: "shake", eyes: "laugh", mouth: "laugh", pops: ["✦", "♥", "✦"], say: ["간지러워!", "하하하!"] },
  curious: { move: "tilt", eyes: "wide", mouth: "o", pops: ["?", "?"], say: ["뭐야 뭐야?", "단어 찾으러 가자!"] },
  sing: { move: "bounce", eyes: "happy", mouth: "o", pops: ["♪", "♫", "♪"], say: ["랄랄라~", "룰루~"] },
  wink: { move: "squish", eyes: "wink", mouth: "cat", pops: ["✦", "♥"], say: ["찡긋!", "또 눌러 줘!"] },
  cheer: { move: "stretch", eyes: "star", mouth: "laugh", pops: ["✦", "A", "가"], say: ["오늘도 화이팅!", "한 번 더!", "오늘 기분 최고!"] },
};
const PARTY = { move: "party", eyes: "heart", mouth: "laugh", pops: ["♥", "★", "✦", "♪", "A", "가"], blush: true, time: 1300 };
const TIRED = { move: "sway", eyes: "dizzy", mouth: "wavy", pops: ["~", "~"], time: 1500, say: ["잠깐 쉬자~", "휴, 숨 좀 돌리자~"] };
// What it does by itself between taps (no speech).
const IDLE = [
  { look: "l", time: 1100 }, { look: "r", time: 1100 }, { look: "u", time: 900 },
  { move: "hop", time: 700 },
  { move: "sway", eyes: "closed", mouth: "yawn", pops: ["z"], time: 1600 },
  { move: "bounce", eyes: "happy", mouth: "o", pops: ["♪"], time: 1000 },
  { eyes: "wink", mouth: "cat", time: 800 },
  { eyes: "happy", mouth: "smile", time: 900 },
];
const MOVES = ["jump", "spin", "wiggle", "squish", "stretch", "flip", "party", "shrink", "pop", "sway", "shake", "tilt", "bounce", "hop"];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// What a character on the shelf may do.
const SHOW = [MOODS.joy, MOODS.love, MOODS.dizzy, MOODS.surprised, MOODS.proud, MOODS.giggle, MOODS.sing, MOODS.wink, MOODS.cheer, MOODS.curious];

// A character acting out a feeling by itself, for quiz results and celebrations (not tappable).
// kind: "cheer" (celebrating) or "comfort" (a little sad at first, then encouraging).
const REACTIONS = {
  cheer: [MOODS.joy, MOODS.proud, MOODS.cheer, MOODS.giggle, PARTY, MOODS.sing],
  comfort: [
    { move: "sway", eyes: "closed", mouth: "wavy", time: 1500 },
    { move: "tilt", eyes: "wide", mouth: "o", time: 1100 },
    { move: "squish", eyes: "wink", mouth: "cat", time: 1100 },
    { move: "stretch", eyes: "happy", mouth: "smile", time: 1100 },
  ],
};
// still: one face and no movement at all (a list of past results, where many of them stand together).
export function reaction(id, kind = "cheer", still = false) {
  const el = document.createElement("span");
  el.className = `mascot reaction ${kind}${still ? " still" : ""}`;
  el.innerHTML = `<span class="m-pose">${draw(characterById(id))}</span>`;
  if (still) {
    el.dataset.eyes = kind === "comfort" ? "closed" : "happy";
    el.dataset.mouth = kind === "comfort" ? "wavy" : "laugh";
    el.dataset.blush = "";
    return el;
  }
  let step = 0;
  const play = () => {
    // Cheering picks moods at random; comforting goes through its moods in order.
    const mood = kind === "comfort" ? REACTIONS.comfort[Math.min(step, REACTIONS.comfort.length - 1)] : pick(REACTIONS.cheer);
    el.classList.remove(...MOVES);
    void el.offsetWidth;
    if (mood.move) el.classList.add(mood.move);
    el.dataset.eyes = mood.eyes;
    el.dataset.mouth = mood.mouth;
    el.dataset.blush = mood.blush ? "1" : "";
    step += 1;
    setTimeout(() => { if (el.isConnected) play(); }, (mood.time || 1000) + 250);
  };
  play();
  return el;
}

// A character's own trick (VOQUIZ Plus): two moves in a row and a face, always the same for one
// character and different from its neighbours'.
const TRICKS = [["flip", "jump"], ["spin", "stretch"], ["party", "wiggle"], ["jump", "spin"], ["stretch", "flip"], ["squish", "party"], ["bounce", "flip"], ["wiggle", "jump"], ["tilt", "spin"], ["shake", "stretch"]];
const TRICK_EYES = ["star", "heart", "happy", "wink", "laugh"];
const TRICK_MOUTHS = ["laugh", "cat", "o"];
function trickOf(id) {
  let n = 0;
  for (const ch of id) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  const [first, second] = TRICKS[n % TRICKS.length];
  const face = { eyes: TRICK_EYES[(n >>> 4) % TRICK_EYES.length], mouth: TRICK_MOUTHS[(n >>> 8) % TRICK_MOUTHS.length], blush: true };
  return [{ move: first, ...face, time: 700 }, { move: second, ...face, time: 900 }];
}

// A wrapped present, held up until it is taken.
const GIFT = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="16" width="28" height="20" rx="4" fill="#ff8fab"/><rect x="4" y="11" width="32" height="8" rx="3" fill="#ffb3c7"/><rect x="17" y="11" width="6" height="25" fill="#ffd166"/><path d="M20 11 q-9 -10 -12 -4 q-1 4 12 4 z M20 11 q9 -10 12 -4 q1 4 -12 4 z" fill="#ffd166" stroke="#e6a700" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

// The wrapped present on its own (the boxes of the daily present).
export function giftArt() {
  const el = document.createElement("span");
  el.className = "gift-art";
  el.innerHTML = GIFT;
  return el;
}

// character: which one to show.  t(key): translates a line of speech.
// onTap({ combo }): may return a line to say instead.
// signature: { pops, line } = the character's own trick is on (VOQUIZ Plus).
// gift / onGift(): it holds a present; the tap that takes it calls onGift (may return a line).
// resting: a line to show while it lies asleep (nothing more to do today).
// greet / onGreet(): a line it says by itself a moment after it appears; onGreet runs once it has.
export function mascot({ character, t = (key) => key, onTap, signature, gift, onGift, resting, greet, onGreet } = {}) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "mascot";
  el.setAttribute("aria-label", "VOQUIZ");
  el.innerHTML = `<span class="m-pose">${draw(characterById(character))}</span>`;
  // The stage is the strip it walks along.
  const stage = document.createElement("div");
  stage.className = "mascot-stage";
  stage.append(el);
  const bubble = document.createElement("span");
  bubble.className = "m-say";
  bubble.setAttribute("aria-live", "polite");
  el.append(bubble);

  const trick = signature ? trickOf(character || "bubble") : null;
  let present = null;
  if (gift && !resting) {
    present = document.createElement("span");
    present.className = "m-gift";
    present.innerHTML = GIFT;
    el.append(present);
  }
  let combo = 0, lastTap = 0, lastMood = "", calm = 0, hush = 0, busyUntil = 0;
  let x = 0, rest = 0, stride = 0; // where it stands on the stage, and timers for a rest or a walk

  function show({ move, eyes, mouth, blush, look, time = 1000 }) {
    el.classList.remove(...MOVES);
    void el.offsetWidth; // lets the same move play again
    if (move) el.classList.add(move);
    el.dataset.eyes = eyes || "default";
    el.dataset.mouth = mouth || "smile";
    el.dataset.blush = blush ? "1" : "";
    el.dataset.look = look || "";
    busyUntil = Date.now() + time;
    clearTimeout(calm);
    calm = setTimeout(() => {
      el.classList.remove(...MOVES);
      Object.assign(el.dataset, { eyes: "default", mouth: "smile", blush: "", look: "" });
    }, time);
  }

  // ----- getting about -----
  function walkTo(target, rolling) {
    const time = Math.max(700, (Math.abs(target - x) / (rolling ? 80 : 45)) * 1000);
    el.style.setProperty("--walk", `${time}ms`);
    el.style.setProperty("--x", `${target}px`);
    el.dataset.dir = target > x ? "r" : "l";
    el.classList.add(rolling ? "rolling" : "walking");
    x = target;
    busyUntil = Date.now() + time;
    clearTimeout(stride);
    stride = setTimeout(() => el.classList.remove("walking", "rolling"), time);
  }
  function wander(rolling) {
    const reach = Math.max(0, (stage.clientWidth - el.clientWidth) / 2 - 4);
    if (reach < 20) return;
    let target = x;
    while (Math.abs(target - x) < 36) target = Math.round((Math.random() * 2 - 1) * reach);
    walkTo(target, rolling);
  }
  // Sitting or lying down for a while; `then` runs when it gets up by itself.
  function settle(pose, face, time, then) {
    el.dataset.pose = pose;
    show({ ...face, time });
    clearTimeout(rest);
    rest = setTimeout(() => { el.dataset.pose = ""; then?.(); }, time);
  }
  function nap() {
    settle("lie", { eyes: "closed", mouth: "wavy" }, 5200, () => show({ move: "stretch", eyes: "closed", mouth: "yawn", time: 1300 }));
    for (const wait of [900, 2300, 3700]) {
      setTimeout(() => { if (el.dataset.pose === "lie") burst(["z", "Z"], 1, el.clientWidth * 0.72, el.clientHeight * 0.55); }, wait);
    }
  }
  function sitAndSing() {
    settle("sit", { eyes: "happy", mouth: "o" }, 3600, () => show({ move: "hop", time: 700 }));
    for (const wait of [500, 1500, 2500]) {
      setTimeout(() => { if (el.dataset.pose === "sit") burst(["♪", "♫"], 1, el.clientWidth / 2 + 24, el.clientHeight * 0.3); }, wait);
    }
  }
  // A tap always gets it back on its feet.
  function wake() {
    const wasResting = !!el.dataset.pose;
    clearTimeout(rest);
    el.dataset.pose = "";
    return wasResting;
  }

  function burst(chars, count, x, y) {
    for (let i = 0; i < count; i++) {
      const pop = document.createElement("span");
      pop.className = "m-pop";
      pop.textContent = chars[i % chars.length];
      const angle = Math.random() * Math.PI * 2;
      const reach = 34 + Math.random() * 46;
      pop.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(angle) * reach}px;--dy:${-Math.abs(Math.sin(angle)) * reach - 24}px;` +
        `--turn:${Math.random() * 80 - 40}deg;animation-delay:${i * 18}ms`;
      el.append(pop);
      setTimeout(() => pop.remove(), 1100);
    }
  }

  function say(text, time = 1500) {
    clearTimeout(hush);
    bubble.classList.remove("show");
    if (!text) return;
    bubble.textContent = text;
    bubble.style.animationDuration = `${time}ms`;
    void bubble.offsetWidth;
    bubble.classList.add("show");
    hush = setTimeout(() => bubble.classList.remove("show"), time);
  }

  el.addEventListener("click", (event) => {
    const now = Date.now();
    combo = now - lastTap < 1200 ? combo + 1 : 1;
    lastTap = now;
    const box = el.getBoundingClientRect();
    const x = event.clientX ? event.clientX - box.left : box.width / 2;
    const y = event.clientY ? event.clientY - box.top : box.height / 2;

    if (resting) { // asleep for the day: it only stirs
      burst(["z", "Z", "♥"], 2, x, y);
      return;
    }
    if (present) { // the present is taken first
      present.remove();
      present = null;
      show(PARTY);
      burst(["🎁", "✦", "♥", "★"], 16, x, y);
      say(onGift?.() || "");
      return;
    }
    let mood, line, special = false;
    if (wake()) { // tapped while sitting or napping: startled awake
      mood = MOODS.surprised;
      line = t(pick(mood.say));
    } else if (combo >= 15) { // tapped a lot in a row: it needs a breather, and the count starts over
      mood = TIRED;
      line = t(pick(TIRED.say));
      combo = 0;
    } else if (combo % 5 === 0) {
      mood = PARTY;
      line = `${combo} ♥`;
    } else if (trick && (combo % 3 === 0 || Math.random() < 0.25)) { // its own trick
      mood = trick[0];
      line = signature.line;
      special = true;
    } else {
      const names = Object.keys(MOODS).filter((name) => name !== lastMood); // never the same mood twice running
      lastMood = pick(names);
      mood = MOODS[lastMood];
      line = Math.random() < 0.65 ? t(pick(mood.say)) : ""; // sometimes the feeling alone says it
    }
    show(mood);
    if (special) {
      setTimeout(() => { if (el.isConnected && !el.dataset.pose) show(trick[1]); }, 640);
      burst(signature.pops, 10, x, y);
    } else burst(mood.pops, mood === PARTY ? 16 : 3 + Math.floor(Math.random() * 3), x, y);
    say(onTap?.({ combo }) || line);
  });

  if (greet && !resting) {
    setTimeout(() => {
      if (!el.isConnected || el.dataset.pose) return;
      show({ move: "hop", eyes: "happy", mouth: "smile", time: 900 });
      say(greet, 3600);
      onGreet?.();
    }, 1200);
  }
  if (resting) {
    // Lying down asleep, with the reason in its speech bubble.
    el.dataset.pose = "lie";
    el.dataset.eyes = "closed";
    el.dataset.mouth = "wavy";
    el.classList.add("resting");
    bubble.textContent = resting;
    bubble.classList.add("stay");
    const snore = setInterval(() => {
      if (!el.isConnected) return clearInterval(snore);
      if (!document.hidden) burst(["z", "Z"], 1, el.clientWidth * 0.72, el.clientHeight * 0.55);
    }, 1500);
  }

  // Its own little life while nobody is tapping: mostly small looks and walks, now and then a
  // roll, a sit-down song or a nap.
  const idle = setInterval(() => {
    if (!el.isConnected) return clearInterval(idle);
    if (document.hidden || el.dataset.pose || Date.now() < busyUntil + 1200) return;
    const roll = Math.random();
    if (roll < 0.34) {
      const act = pick(IDLE);
      show(act);
      if (act.pops) burst(act.pops, 1, el.clientWidth / 2 + 26, el.clientHeight * 0.3);
    } else if (roll < 0.72) wander(false);
    else if (roll < 0.82) wander(true);
    else if (roll < 0.91) sitAndSing();
    else nap();
  }, 3200 + Math.random() * 1600);

  return stage;
}
