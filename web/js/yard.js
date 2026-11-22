// The web version's yard: the characters a student owns live along the bottom of the window.
// They walk about, stop, hop now and then, and react when tapped. The app only says who is there
// (showYard) and what a tap does; everything that moves is in here.
// The page needs an element with the id "yard" (the web version's index.html has one).
import { portrait, giftArt } from "./mascot.js?v=0.1.23-tovy7z";

const still = () => Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const rand = (a, b) => a + Math.random() * (b - a);
const walkers = new Map(); // id -> { el, x, timer }
let root = null;
let opts = {};
let leaving = false; // on their way out (leaveYard): nothing else touches them until they are gone

const room = () => Math.max(0, root.clientWidth - 90); // how far right a character may stand
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
  if (still() || document.hidden) { w.timer = setTimeout(() => stroll(w), 4000); return; }
  const roll = Math.random();
  if (roll < 0.2) { hop(w); w.timer = setTimeout(() => stroll(w), rand(900, 2400)); return; }
  if (roll < 0.42) { w.timer = setTimeout(() => stroll(w), rand(1500, 5000)); return; }
  const to = Math.min(room(), Math.max(0, w.x + rand(-280, 280)));
  const seconds = Math.max(0.6, Math.abs(to - w.x) / rand(26, 44)); // pixels a second: an unhurried walk
  w.el.classList.toggle("left", to < w.x);
  w.el.classList.add("walk");
  place(w, to, seconds);
  w.timer = setTimeout(() => {
    w.el.classList.remove("walk");
    w.timer = setTimeout(() => stroll(w), rand(500, 3200));
  }, seconds * 1000);
}

function say(w, text) {
  w.el.querySelector(".yard-say")?.remove();
  if (!text) return;
  const bubble = document.createElement("span");
  bubble.className = "yard-say";
  bubble.textContent = text;
  w.el.append(bubble);
  setTimeout(() => bubble.remove(), 3800);
}

function add(id) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "walker";
  const flip = document.createElement("span"); // turns to face the way it walks
  const bob = document.createElement("span"); // bobs while walking, jumps on a hop
  flip.className = "walker-flip";
  bob.className = "walker-bob";
  bob.append(portrait(id)); // the app's own living drawing: it blinks and makes faces by itself
  flip.append(bob);
  el.append(flip);
  const w = { el, x: 0, timer: 0 };
  el.addEventListener("click", () => {
    hop(w);
    say(w, opts.onTap?.(id, id === opts.lead) || "");
  });
  root.append(el);
  place(w, rand(0, room()));
  walkers.set(id, w);
  w.timer = setTimeout(() => stroll(w), rand(300, 2600));
}

// next: { ids: who lives here, lead: the student's own character (a little bigger, in front),
//         onEdit / editLabel: the button that opens the choice of who lives here,
//         gift: true when the lead has something to hand over, label(id): its name for screen
//         readers, onTap(id, isLead): called on a tap; what it returns is said in a bubble }.
// An empty list (or nothing) empties the yard.
export function showYard(next) {
  root ??= document.getElementById("yard");
  if (!root || leaving) return;
  opts = next || {};
  const ids = opts.ids || [];
  root.hidden = ids.length === 0;
  for (const [id, w] of walkers) {
    if (ids.includes(id)) continue;
    clearTimeout(w.timer);
    w.el.remove();
    walkers.delete(id);
  }
  for (const id of ids) if (!walkers.has(id)) add(id);
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

// The window became a phone's, where the yard does not exist: everybody runs to `to` (a point on
// the screen: the dictionary tab), jumps in and is gone. onArrive is called as each one lands.
export function leaveYard(to, onArrive) {
  if (!root || walkers.size === 0 || leaving) return;
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
  [...walkers.values()].forEach((w, i) => setTimeout(() => hop(w), i * 70));
}

// A narrower window: nobody is left standing outside it.
globalThis.addEventListener?.("resize", () => {
  if (!root) return;
  for (const w of walkers.values()) if (w.x > room()) place(w, room());
});
