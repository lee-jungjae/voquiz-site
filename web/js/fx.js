// What a game in play looks like in the desktop frame of the web version: paper shot up from both
// corners of the window on a right answer (more of it the longer the run of right answers), a
// stamp for the run, a glow round the window that grows with it, a shake and a red flash on a
// wrong answer, fireworks at a good result. Nothing here changes a game; it only shows it.
// (A phone, and the extension's side panel, never call any of this.)
import { focusOn } from "./prefs.js?v=0.1.28-tp83ws";
const still = () => Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const COLORS = ["#655f9f", "#bbd86b", "#ffd166", "#ff8fab", "#7cc6fe", "#23552b", "#a9a4d4", "#ff9f43"];
const can = () => !still() && !focusOn() && Boolean(document.body.animate);
function layer(ms) {
  const el = document.createElement("div");
  el.className = "fx-layer";
  el.setAttribute("aria-hidden", "true");
  document.body.append(el);
  setTimeout(() => el.remove(), ms);
  return el;
}

// Paper from the two bottom corners, up and across, then down. amount: how many pieces; power: how far.
export function confetti(amount = 40, power = 1) {
  if (!can()) return;
  const box = layer(3000);
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < amount; i++) {
    const p = document.createElement("i");
    const left = i % 2 === 0, kind = i % 5; // 0-2 paper, 3 a dot, 4 a streamer
    const w = kind === 4 ? 4 : 7 + Math.random() * 6;
    const h = kind === 4 ? 16 + Math.random() * 10 : kind === 3 ? w : 5 + Math.random() * 8;
    p.style.cssText = `width:${w}px;height:${h}px;background:${COLORS[i % COLORS.length]};border-radius:${kind === 3 ? "50%" : "2px"};left:${left ? -12 : W + 12}px;top:${H * (0.78 + Math.random() * 0.14)}px`;
    const reach = W * (0.16 + Math.random() * 0.44) * (left ? 1 : -1) * power;
    const rise = H * (0.42 + Math.random() * 0.4) * power;
    const turn = (Math.random() * 2 - 1) * 900;
    box.append(p);
    p.animate([
      { transform: "translate(0, 0) rotate(0deg)", opacity: 1, easing: "cubic-bezier(.15, .7, .3, 1)" },
      { transform: `translate(${reach * 0.75}px, ${-rise}px) rotate(${turn * 0.5}deg)`, opacity: 1, offset: 0.45, easing: "cubic-bezier(.5, 0, .85, .5)" },
      { transform: `translate(${reach}px, ${-rise + H * (0.5 + Math.random() * 0.4)}px) rotate(${turn}deg)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 900, delay: Math.random() * 140, fill: "both" });
  }
}

// Bursts in the upper half of the window, one after another.
export function fireworks(times = 3) {
  if (!can()) return;
  const box = layer(times * 320 + 1600);
  for (let n = 0; n < times; n++) {
    const cx = innerWidth * (0.2 + Math.random() * 0.6), cy = innerHeight * (0.16 + Math.random() * 0.3);
    const color = COLORS[(n * 3 + 2) % COLORS.length];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("i");
      const a = (i / 26) * Math.PI * 2, d = 70 + Math.random() * 110;
      p.style.cssText = `width:6px;height:6px;border-radius:50%;background:${i % 3 ? color : "#ffd166"};left:${cx}px;top:${cy}px`;
      box.append(p);
      p.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 1, easing: "cubic-bezier(.1, .8, .3, 1)" },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(1)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${Math.cos(a) * d * 1.1}px, ${Math.sin(a) * d * 1.1 + 46}px) scale(.3)`, opacity: 0 },
      ], { duration: 1100, delay: n * 320 + Math.random() * 60, fill: "both" });
    }
  }
}

// A word that pops in the upper middle of the window for a moment ("시작!", "🔥 3연속").
export function stamp(text, kind = "") {
  document.querySelector(".fx-stamp")?.remove();
  const el = document.createElement("div");
  el.className = `fx-stamp ${kind}`.trim();
  el.setAttribute("role", "status");
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 1300);
}

// A wrong answer: the screen shakes once and flashes red at its edges.
export function miss() {
  if (!can()) return;
  setTimeout(() => { // after the screen has been drawn again
    document.querySelector(".dk > main")?.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-10px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-5px)" }, { transform: "translateX(0)" }],
      { duration: 340, easing: "ease-out" });
  }, 20);
  const flash = document.createElement("div");
  flash.className = "fx-flash";
  flash.setAttribute("aria-hidden", "true");
  document.body.append(flash);
  setTimeout(() => flash.remove(), 520);
}

// The run of right answers: from two on, the window glows at its edges, warmer and quicker the
// longer the run (the look is in app.css, body[data-combo]). 0 puts the glow out.
export function combo(n) {
  if (n >= 2) document.body.dataset.combo = String(Math.min(n, 5));
  else delete document.body.dataset.combo;
}
