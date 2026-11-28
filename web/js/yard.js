// The web version's yard: the student's own character lives along the bottom of the window (with
// any others the student put there). It walks about, stops, hops now and then, suggests what to do
// next, and reacts when tapped. Three more things happen here:
//  - the stage: when the app draws the student's character somewhere on the screen (a result, the
//    start of a duel), the one in the yard jumps there instead of standing below as a second one,
//    and jumps back down when that drawing is gone (stageYard);
//  - visitors: now and then another of the student's characters runs across the yard or looks out
//    from under a menu, from the side of the window or from behind the word box; catching it (a
//    click) is worth something, which the app decides (opts.visitors, opts.onCatch);
//  - leaving: when the window becomes a phone's, everybody runs to the dictionary tab (leaveYard).
// The app only says who is there and what a tap does; everything that moves is in here.
// The page needs an element with the id "yard" (the web version's index.html has one).
import { portrait, giftArt } from "./mascot.js?v=0.1.28-tp7oez";

const still = () => Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const rand = (a, b) => a + Math.random() * (b - a);
const between = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const walkers = new Map(); // id -> { el, x, timer, away }
let root = null;
let opts = {};
let leaving = false; // on their way out (leaveYard): nothing else touches them until they are gone

const room = (w) => Math.max(0, root.clientWidth - (w?.el.offsetWidth || 90) - 44); // how far right a character may stand (the button at the end stays free)
// Where a character likes to stand: beside the column of the screen, not on it. opts.clear() gives
// the column (its left and right edge in the window). A side is used when the character fits there
// with at most a third of itself over the column; with no such side, the whole yard is used.
function sides(w) {
  const max = room(w), width = w.el.offsetWidth || 90;
  const clear = opts.clear?.();
  if (!clear) return [[0, max]];
  const base = root.getBoundingClientRect().left;
  // First with hardly any of the character over the column; if no side has that much room, with a third of it.
  for (const share of [0.1, 0.33]) {
    const slack = width * share;
    const leftEnd = Math.min(max, clear.left - base - width + slack), rightStart = Math.max(0, clear.right - base - slack);
    const out = [];
    if (leftEnd >= 0) out.push([0, leftEnd]);
    if (rightStart <= max) out.push([rightStart, max]);
    if (out.length) return out;
  }
  return [[0, max]];
}
function place(w, x, seconds = 0) {
  w.x = Math.round(x);
  w.el.style.transitionDuration = `${seconds}s`;
  w.el.style.transform = `translateX(${w.x}px)`;
}
function hop(w) {
  w.el.classList.remove("hop");
  void w.el.offsetWidth; // so the same animation can start again
  w.el.classList.add("hop");
}

// One thing after another, for as long as the character is in the yard: a walk to somewhere near,
// a hop on the spot, or a moment of standing about.
function stroll(w) {
  clearTimeout(w.timer);
  if (w.away) return; // on the stage: it comes back by itself (jumpBack)
  if (still() || document.hidden) { w.timer = setTimeout(() => stroll(w), 4000); return; }
  const places = sides(w);
  // Told to keep out of the way (opts.stay "right": a screen that needs its whole width, like the
  // shop): the right side of the column, or the far right end of the yard when there is no such side.
  const last = places[places.length - 1];
  const clearOf = opts.stay === "right" ? opts.clear?.() : null;
  const past = clearOf ? clearOf.right - root.getBoundingClientRect().left + 8 : Infinity; // wholly to the right of the column, when there is room
  const keep = opts.stay === "right" ? (past <= room(w) ? [past, room(w)] : last[0] > 0 ? last : [Math.max(0, room(w) - 80), room(w)]) : null;
  const off = !places.some(([lo, hi]) => w.x >= lo && w.x <= hi); // the screen changed under it: it stands on the column now
  const outside = off || (Boolean(keep) && (w.x < keep[0] || w.x > keep[1])); // not where it should be: it goes now, briskly
  const roll = Math.random();
  if (!outside && roll < 0.2) { hop(w); w.timer = setTimeout(() => stroll(w), rand(900, 2400)); return; }
  if (!outside && roll < 0.42) { w.timer = setTimeout(() => stroll(w), rand(1500, 5000)); return; }
  // Otherwise it mostly keeps to a side of the column (the nearer one); now and then it walks across to anywhere.
  const near = places.reduce((best, p) => (Math.abs(between(w.x, p[0], p[1]) - w.x) < Math.abs(between(w.x, best[0], best[1]) - w.x) ? p : best));
  const [lo, hi] = keep || (Math.random() < 0.22 ? places[Math.floor(Math.random() * places.length)] : near);
  const to = w.x < lo || w.x > hi ? rand(lo, hi) : between(w.x + rand(-280, 280), lo, hi);
  const seconds = Math.max(0.6, Math.abs(to - w.x) / (outside ? rand(170, 210) : rand(26, 44))); // pixels a second: an unhurried walk
  w.el.classList.toggle("left", to < w.x);
  w.el.classList.add("walk");
  place(w, to, seconds);
  w.timer = setTimeout(() => {
    w.el.classList.remove("walk");
    w.timer = setTimeout(() => stroll(w), rand(500, 3200));
  }, seconds * 1000);
}

// A bubble over a character. With `act`, the bubble is something to press: it does what it says.
function say(w, text, act) {
  w.el.querySelector(".yard-say")?.remove();
  if (!text) return;
  const bubble = document.createElement("span");
  bubble.className = act ? "yard-say act" : "yard-say";
  bubble.textContent = text;
  if (act) {
    bubble.setAttribute("role", "button");
    bubble.addEventListener("click", (e) => { e.stopPropagation(); bubble.remove(); act(); });
  }
  w.el.append(bubble);
  setTimeout(() => bubble.remove(), act ? 9000 : 3800);
}

// Every so often the student's own character suggests the next thing to do (opts.nudge decides what).
let nudgeTimer = 0;
function nudge() {
  clearTimeout(nudgeTimer);
  const w = walkers.get(opts.lead);
  const next = !leaving && !document.hidden && w && !w.away ? opts.nudge?.() : null;
  if (next) { hop(w); say(w, next.text, next.act); }
  nudgeTimer = setTimeout(nudge, opts.eager ? 15000 : 40000);
}

// What can be pressed right under the pointer, behind a character (nothing: the character itself is meant).
const PRESSABLE = "button, a, input, select, textarea, label, summary, [role=button], [role=tab], [role=option]";
function under(e) {
  if (e.clientX == null || e.target.closest?.(".yard-say")) return null;
  for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
    if (root.contains(el)) continue;
    const control = el.closest?.(PRESSABLE);
    if (control && !control.disabled) return control;
    if (el.closest?.("main, aside, header")) return null; // plain content: nothing to press there
  }
  return null;
}
function body(id) {
  const flip = document.createElement("span"); // turns to face the way it walks
  const bob = document.createElement("span"); // bobs while walking, jumps on a hop
  flip.className = "walker-flip";
  bob.className = "walker-bob";
  bob.append(portrait(id)); // the app's own living drawing: it blinks and makes faces by itself
  flip.append(bob);
  return flip;
}
function add(id) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "walker";
  el.append(body(id));
  const w = { el, x: 0, timer: 0, away: false };
  // Standing on something that can be pressed: the press goes to that, not to the character, and
  // the character fades while the pointer is on it so that what is under it can be seen.
  el.addEventListener("pointermove", (e) => el.classList.toggle("thin", Boolean(under(e))));
  el.addEventListener("pointerleave", () => el.classList.remove("thin"));
  el.addEventListener("click", (e) => {
    if (w.away) return;
    const below = under(e);
    if (below) { below.focus?.(); below.click(); return; }
    hop(w);
    const said = opts.onTap?.(id, id === opts.lead);
    if (said && typeof said === "object") say(w, said.text, said.act); else say(w, said || "");
  });
  root.append(el);
  const [lo, hi] = (() => { const places = sides(w); return places[Math.floor(Math.random() * places.length)]; })();
  place(w, rand(lo, hi));
  walkers.set(id, w);
  w.timer = setTimeout(() => stroll(w), rand(300, 2600));
}

// next: { ids: who lives here, lead: the student's own character (bigger, in front),
//         onEdit / editLabel: the button that opens the choice of who lives here,
//         gift: true when the lead has something to hand over, label(id): its name for screen
//         readers, onTap(id, isLead): called on a tap; what it returns is said in a bubble (a
//         { text, act } is a bubble that can be pressed), nudge(): the same, asked for now and then,
//         visitors(): the characters that may come by, onCatch(id): one was caught; what it
//         returns is shown where it was caught ("+2"), clear(): the column of the screen
//         ({ left, right } in the window) that the characters keep beside,
//         stay: "right" when they should keep to the right, out of the way of the screen,
//         eager: true where the lead is the one to say what to do next (it speaks sooner, more often) }.
// An empty list (or nothing) empties the yard.
export function showYard(next) {
  root ??= document.getElementById("yard");
  if (!root || leaving) return;
  const asked = (next?.stay || null) !== (opts.stay || null); // asked to move over, or free again
  const speakUp = Boolean(next?.eager) && !opts.eager; // just arrived on a screen where the character leads
  opts = next || {};
  const ids = opts.ids || [];
  root.hidden = ids.length === 0;
  if (ids.length === 0) {
    clearTimeout(nudgeTimer); nudgeTimer = 0;
    clearTimeout(visitTimer); visitTimer = 0;
    sendHome();
    offStage();
  } else {
    if (!nudgeTimer) nudgeTimer = setTimeout(nudge, 2500);
    else if (speakUp) { clearTimeout(nudgeTimer); nudgeTimer = setTimeout(nudge, 1200); }
    if (!visitTimer) visitTimer = setTimeout(visit, rand(14000, 24000));
    if (visitor && !visitor.fits()) sendHome(); // the place it was looking out from is gone
  }
  for (const [id, w] of walkers) {
    if (ids.includes(id)) continue;
    clearTimeout(w.timer);
    w.el.remove();
    walkers.delete(id);
    if (id === stageOf) offStage();
  }
  for (const id of ids) if (!walkers.has(id)) add(id);
  if (asked && opts.stay) for (const w of walkers.values()) if (!w.away) stroll(w); // on their way at once
  // The screen changed under them (the word list opened, another screen): whoever now stands on the column moves beside it.
  for (const w of walkers.values()) {
    if (w.away || w.el.classList.contains("walk") || w.moving) continue;
    if (!sides(w).some(([lo, hi]) => w.x >= lo && w.x <= hi)) { w.moving = true; clearTimeout(w.timer); w.timer = setTimeout(() => { w.moving = false; stroll(w); }, 350); }
  }
  // A small button at the end of the yard opens the choice of who lives here.
  let edit = root.querySelector(".yard-edit");
  if (opts.onEdit && ids.length && !edit) {
    edit = document.createElement("button");
    edit.type = "button";
    edit.className = "yard-edit";
    edit.textContent = "✎";
    edit.addEventListener("click", () => opts.onEdit?.());
    root.append(edit);
  }
  if (edit) {
    edit.hidden = !(opts.onEdit && ids.length);
    edit.title = opts.editLabel || "";
    edit.setAttribute("aria-label", opts.editLabel || "");
  }
  for (const [id, w] of walkers) {
    w.el.classList.toggle("lead", id === opts.lead);
    const holds = id === opts.lead && Boolean(opts.gift);
    w.el.classList.toggle("gift", holds);
    if (holds && !w.el.querySelector(".gift-art")) w.el.append(giftArt()); // today's present, held up
    if (!holds) w.el.querySelector(".gift-art")?.remove();
    w.el.setAttribute("aria-label", opts.label?.(id) || id);
  }
}

// ----- the stage -----
// art: the element in which the app has drawn the student's own character (or nothing). The app
// calls this every time it has drawn the screen. While the character is on its way the drawing is
// held back; it appears as the character lands. With no drawing left, the character jumps back.
let stage = null; // { art, box, there }: the drawing the lead is at, or on its way to
let stageOf = null; // which character that is
let flight = null; // the jump in progress
const boxOf = (el) => { const b = el?.getBoundingClientRect?.(); return b && b.width > 8 && b.height > 8 ? b : null; };
const hold = (art) => { art.style.visibility = "hidden"; };
function show(art, pop) {
  art.style.visibility = "";
  if (pop && art.animate && !still()) art.animate([{ transform: "scale(.5)" }, { transform: "scale(1.1)", offset: 0.65 }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
}
function offStage() { // forget the stage without any jump (the yard was emptied)
  flight?.cancel();
  flight = null;
  if (stage?.art?.isConnected) show(stage.art);
  stage = null;
  stageOf = null;
  root?.classList.remove("flying");
}
export function stageYard(art) {
  if (!root || leaving) return;
  const w = walkers.get(opts.lead);
  const box = art && boxOf(art);
  if (!w || root.hidden) return;
  if (box) {
    if (stage) { // already there, or on its way: the screen was only drawn again
      stage.art = art;
      stage.box = box;
      if (!stage.there) hold(art);
      return;
    }
    stage = { art, box, there: false };
    stageOf = opts.lead;
    hold(art);
    jumpTo(w);
  } else if (stage) {
    jumpBack(w);
  }
}
function jumpTo(w) {
  clearTimeout(w.timer);
  w.away = true;
  w.el.querySelector(".yard-say")?.remove();
  w.el.classList.remove("hop", "walk");
  const from = w.el.getBoundingClientRect();
  const base = root.getBoundingClientRect();
  const x0 = from.left - base.left;
  place(w, x0); // stops where it is (this is also where it will come back to)
  const arrive = () => {
    flight = null;
    root.classList.remove("flying");
    if (!stage) return;
    stage.there = true;
    w.el.style.visibility = "hidden";
    for (const move of w.el.getAnimations?.() || []) move.cancel(); // hidden now: back in its own place, unseen
    if (stage.art?.isConnected) show(stage.art, true);
  };
  if (still() || !w.el.animate) return arrive();
  const to = stage.box;
  const scale = between(to.width / from.width, 0.25, 1.8);
  const x1 = to.left + to.width / 2 - base.left - from.width / 2;
  const y1 = to.top + to.height / 2 - (from.top + from.height / 2);
  w.el.classList.toggle("left", x1 < x0);
  root.classList.add("flying");
  flight = w.el.animate([
    { transform: `translate(${x0}px, 0) scale(1.08, .84)`, offset: 0 }, // crouches
    { transform: `translate(${x0 + (x1 - x0) * 0.55}px, ${Math.min(y1, 0) - 70}px) scale(${(1 + scale) / 2})`, offset: 0.62 }, // up and over
    { transform: `translate(${x1}px, ${y1}px) scale(${scale})`, offset: 1 }, // lands where the drawing is
  ], { duration: between(300 + Math.hypot(x1 - x0, y1) * 0.4, 380, 640), easing: "cubic-bezier(.3, .7, .35, 1)", fill: "forwards" });
  flight.finished.then(arrive, () => {});
}
function jumpBack(w) {
  const from = stage.box, wasThere = stage.there;
  stage = null;
  stageOf = null;
  const land = () => {
    flight = null;
    for (const move of w.el.getAnimations?.() || []) move.cancel();
    root.classList.remove("flying");
    w.away = false;
    w.el.style.visibility = "";
    place(w, between(w.x, 0, room(w)));
    hop(w);
    w.timer = setTimeout(() => stroll(w), rand(900, 2400));
  };
  if (flight) { flight.cancel(); flight = null; return land(); } // it was still on its way: it stays in the yard
  w.el.style.visibility = "";
  if (!wasThere || still() || !w.el.animate) return land();
  const base = root.getBoundingClientRect();
  const width = w.el.offsetWidth, height = w.el.offsetHeight;
  const home = between(w.x, 0, room(w));
  const x0 = from.left + from.width / 2 - base.left - width / 2;
  const y0 = from.top + from.height / 2 - (base.bottom - height / 2);
  const scale = between(from.width / width, 0.25, 1.8);
  w.el.classList.toggle("left", home < x0);
  root.classList.add("flying");
  flight = w.el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(${scale})`, offset: 0 },
    { transform: `translate(${x0 + (home - x0) * 0.4}px, ${Math.min(y0, 0) - 46}px) scale(${(1 + scale) / 2})`, offset: 0.38 }, // hops off
    { transform: `translate(${home}px, 0) scale(1)`, offset: 0.9 },
    { transform: `translate(${home}px, 0) scale(1.07, .9)`, offset: 0.95 }, // lands with a little squash
    { transform: `translate(${home}px, 0) scale(1)`, offset: 1 },
  ], { duration: between(340 + Math.hypot(home - x0, y0) * 0.4, 420, 720), easing: "ease-in-out" });
  flight.finished.then(land, () => {});
}

// ----- visitors -----
// One at a time. `visitor` is the one that is out: { el, fits(): its place still exists, home(): it leaves }.
let visitTimer = 0;
let visitor = null;
function sendHome() { visitor?.home(true); }
function visit() {
  clearTimeout(visitTimer);
  visitTimer = setTimeout(visit, rand(38000, 75000));
  if (visitor || leaving || document.hidden || still() || !root || root.hidden) return;
  const ids = opts.visitors?.() || [];
  if (!ids.length) return;
  const id = ids[Math.floor(Math.random() * ids.length)];
  const ways = [runBy, lookOut, lookOut]; // across the yard, or out from behind something
  ways[Math.floor(Math.random() * ways.length)](id);
}
// Caught: it jumps for joy, what the catch was worth floats up from it, and it is gone.
function caught(el, id, done) {
  const worth = opts.onCatch?.(id);
  el.disabled = true;
  el.classList.add("caught");
  if (worth) {
    const box = el.getBoundingClientRect();
    const tag = document.createElement("b");
    tag.className = "catch-worth";
    tag.textContent = worth;
    tag.style.left = `${box.left + box.width / 2}px`;
    tag.style.top = `${box.top}px`;
    document.body.append(tag);
    setTimeout(() => tag.remove(), 1200);
  }
  setTimeout(done, 520);
}
// A run across the yard, from one side to the other.
function runBy(id) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "walker visitor walk";
  el.setAttribute("aria-label", opts.label?.(id) || id);
  el.append(body(id));
  root.append(el);
  const fromLeft = Math.random() < 0.5;
  const width = el.offsetWidth || 100, span = root.clientWidth;
  const x0 = fromLeft ? -width - 10 : span + 10, x1 = fromLeft ? span + 10 : -width - 10;
  el.classList.toggle("left", !fromLeft);
  const run = el.animate([{ transform: `translateX(${x0}px)` }, { transform: `translateX(${x1}px)` }], { duration: between(span * 7, 5500, 10000), easing: "linear", fill: "forwards" });
  const gone = () => { el.remove(); if (visitor?.el === el) visitor = null; };
  visitor = { el, fits: () => true, home: gone };
  run.finished.then(gone, () => {});
  el.addEventListener("click", () => {
    const at = el.getBoundingClientRect().left - root.getBoundingClientRect().left;
    run.cancel();
    el.classList.remove("walk");
    el.style.transform = `translateX(${at}px)`;
    caught(el, id, gone);
  });
}
// Looking out for a few seconds: hanging head down under a menu of the top bar, leaning in from
// the right side of the window, or (on the first screen) sitting up behind the word box.
function lookOut(id) {
  const spots = [];
  const menus = [...document.querySelectorAll(".dk:not(.focus) .dk-nav button, .dk:not(.focus) .dk-me .dk-link")].filter((b) => boxOf(b));
  if (menus.length) spots.push(() => {
    const menu = menus[Math.floor(Math.random() * menus.length)], box = menu.getBoundingClientRect();
    const bar = document.querySelector(".dk-top")?.getBoundingClientRect();
    return { kind: "hang", left: box.left + box.width / 2, top: bar ? bar.bottom : box.bottom + 14, fits: () => Boolean(document.querySelector(".dk:not(.focus) .dk-top")) };
  });
  spots.push(() => ({ kind: "lean", left: innerWidth, top: innerHeight * rand(0.3, 0.6), fits: () => true }));
  const wordBox = document.querySelector("main.home .search");
  if (wordBox) spots.push(() => {
    const box = wordBox.getBoundingClientRect();
    return { kind: "sit", left: box.right - rand(90, 200), top: box.top, fits: () => Boolean(document.querySelector("main.home .search")) };
  });
  const spot = spots[Math.floor(Math.random() * spots.length)]();
  const el = document.createElement("button");
  el.type = "button";
  el.className = `peeker ${spot.kind}`;
  el.setAttribute("aria-label", opts.label?.(id) || id);
  el.style.left = `${Math.round(spot.left)}px`;
  el.style.top = `${Math.round(spot.top)}px`;
  el.append(portrait(id));
  document.body.append(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("out")));
  let timer = 0;
  const gone = (now) => {
    clearTimeout(timer);
    if (visitor?.el === el) visitor = null;
    el.classList.remove("out");
    setTimeout(() => el.remove(), now === true ? 0 : 320);
  };
  visitor = { el, fits: spot.fits, home: gone };
  timer = setTimeout(gone, 5200);
  el.addEventListener("click", () => { clearTimeout(timer); caught(el, id, gone); });
}
// For trying things out from the console or a test: a visitor right now (way: "run", "hang", "lean", "sit").
export function visitNow(way) {
  sendHome();
  const ids = opts.visitors?.() || [];
  if (!ids.length || !root || root.hidden) return false;
  const id = ids[Math.floor(Math.random() * ids.length)];
  if (way === "run") { runBy(id); return true; }
  const want = way || "lean";
  // lookOut picks its spot at random: keep asking until it is the wanted one (a few tries at most).
  for (let i = 0; i < 12; i++) {
    lookOut(id);
    if (visitor?.el.classList.contains(want)) return true;
    sendHome();
  }
  return false;
}

// The window became a phone's, where the yard does not exist: everybody runs to `to` (a point on
// the screen: the dictionary tab), jumps in and is gone. onArrive is called as each one lands.
export function leaveYard(to, onArrive) {
  if (!root || walkers.size === 0 || leaving) return;
  sendHome();
  offStage();
  for (const w of walkers.values()) { w.away = false; w.el.style.visibility = ""; }
  if (still() || !to || !root.animate) return showYard(null);
  leaving = true;
  root.hidden = false;
  root.classList.add("leaving"); // shown for the length of the run, whatever the window's width
  const base = root.getBoundingClientRect();
  const cast = [...walkers.values()].map((w) => ({ w, box: w.el.getBoundingClientRect() }))
    .sort((a, b) => Math.abs(a.box.left - to.x) - Math.abs(b.box.left - to.x)); // the nearest goes in first
  const runs = cast.map(({ w, box }, i) => {
    clearTimeout(w.timer);
    const x0 = box.left - base.left, x1 = to.x - base.left - box.width / 2, y1 = to.y - (box.top + box.height / 2);
    w.el.classList.remove("hop");
    w.el.classList.add("walk");
    w.el.classList.toggle("left", x1 < x0);
    w.el.style.transition = "none";
    w.el.style.transform = `translateX(${x0}px)`;
    const run = Math.min(1000, 260 + Math.abs(x1 - x0) * 1.2); // a short run for the near ones, a longer one from far
    const near = x0 + (x1 - x0) * 0.78;
    const move = w.el.animate([
      { transform: `translate(${x0}px, 0) scale(1)`, opacity: 1, offset: 0 },
      { transform: `translate(${near}px, 0) scale(1)`, opacity: 1, offset: 0.62 }, // runs up to it
      { transform: `translate(${x0 + (x1 - x0) * 0.92}px, ${Math.min(-52, y1 - 44)}px) scale(.85)`, opacity: 1, offset: 0.84 }, // leaps
      { transform: `translate(${x1}px, ${y1}px) scale(.1)`, opacity: 0, offset: 1 }, // and dives in
    ], { duration: run + 460, delay: i * 120, fill: "forwards", easing: "ease-in-out" });
    return move.finished.catch(() => {}).then(() => onArrive?.());
  });
  Promise.all(runs).then(() => {
    for (const w of walkers.values()) w.el.remove();
    walkers.clear();
    root.classList.remove("leaving");
    root.hidden = true;
    leaving = false;
  });
}

// A right answer in a quiz: everybody in the yard jumps, one after another.
export function cheerYard() {
  if (!root || leaving || still()) return;
  [...walkers.values()].filter((w) => !w.away).forEach((w, i) => setTimeout(() => hop(w), i * 70));
}

// A narrower window: nobody is left standing outside it.
globalThis.addEventListener?.("resize", () => {
  if (!root) return;
  for (const w of walkers.values()) if (!w.away && w.x > room(w)) place(w, room(w));
});
