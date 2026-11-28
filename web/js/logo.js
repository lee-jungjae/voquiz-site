// The VOQUIZ logo: the mascot's face as the icon, and hand-drawn bouncing letters as the name.
// Both are drawn here (no font), so they look the same on every computer.

export const ICON_SVG = `
<svg viewBox="0 0 128 128" aria-hidden="true">
  <rect width="128" height="128" rx="28" fill="#655f9f"/><g transform="translate(0 -7)">
  <path d="M20 60 c0 -22 18 -33 44 -33 s44 11 44 33 v10 a30 30 0 0 1 -30 30 h-22 l-17 15 l3 -17 a30 30 0 0 1 -22 -28 z" fill="#d6d2f0"/>
  <ellipse cx="39" cy="79" rx="8" ry="5" fill="#ff8fab" opacity=".75"/><ellipse cx="89" cy="79" rx="8" ry="5" fill="#ff8fab" opacity=".75"/>
  <circle cx="48" cy="66" r="7" fill="#2e2a47"/><circle cx="80" cy="66" r="7" fill="#2e2a47"/>
  <circle cx="50.5" cy="63.5" r="2.4" fill="#fff"/><circle cx="82.5" cy="63.5" r="2.4" fill="#fff"/>
  <path d="M57 77 q7 7 14 0" fill="none" stroke="#2e2a47" stroke-width="3.4" stroke-linecap="round"/>
</g></svg>`;

// VOQUIZ = VOcabulary + QUIZ. QUIZ takes the text colour of where it is placed (the theme colour in
// the header); V and the O, which is 말풍이 itself, are a softer tone of the same colour, so the
// name reads as two parts.
const SOFT = "color-mix(in srgb, currentColor 58%, #fff)";
const LETTER_V = `<path d="M5 8 L17 34 L29 8" style="stroke:${SOFT}" transform="translate(4.5 0.5) rotate(-10 17 21)"/>`;
const LETTERS_QUIZ = `<g transform="translate(5 0)"><g transform="translate(0 -4)"><circle cx="96" cy="21" r="13"/><path d="M103 29 l8 8"/></g>
      <path d="M124 9 v13 a11 11 0 0 0 22 0 v-13" transform="rotate(5 135 20) translate(0 3)"/>
      <path d="M163 10 v23" transform="rotate(-5 163 20) translate(0 -1)"/>
      <path d="M178 9 h20 L178 35 h20" transform="rotate(4 188 20) translate(0 2)"/></g>`;
const PUNG = `<g class="li-pung"><g transform="translate(30.5 -8.2) scale(.43)">
    <path d="M20 60 c0 -22 18 -33 44 -33 s44 11 44 33 v10 a30 30 0 0 1 -30 30 h-22 l-17 15 l3 -17 a30 30 0 0 1 -22 -28 z" style="fill:${SOFT}"/>
    <ellipse cx="39" cy="79" rx="8" ry="5" fill="#ff8fab" opacity=".85"/><ellipse cx="89" cy="79" rx="8" ry="5" fill="#ff8fab" opacity=".85"/>
    <g class="li-eye"><circle cx="48" cy="66" r="7" fill="#2e2a47"/><circle cx="50.5" cy="63.5" r="2.4" fill="#fff"/></g>
    <g class="li-eye"><circle cx="80" cy="66" r="7" fill="#2e2a47"/><circle cx="82.5" cy="63.5" r="2.4" fill="#fff"/></g>
    <path d="M57 77 q7 7 14 0" fill="none" stroke="#2e2a47" stroke-width="3.4" stroke-linecap="round"/></g></g>`;
export const WORDMARK_SVG = `
<svg viewBox="-6 -12 223 62" role="img" aria-label="VOQUIZ">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="12">
    ${LETTER_V}
    <g stroke="currentColor">
      ${LETTERS_QUIZ}
    </g>
  </g>
  ${PUNG}
</svg>`;

// The name being made: "VOCABULARY + QUIZ" in the logo's own letters, then CABULARY and the plus
// shrink away, QUIZ comes over to VO, and the O turns into 말풍이. Nothing is swapped: the letters
// of the logo are there from the start and only move (the motion itself is in app.css, .logo-intro).
const EXTRA = [ // the letters that leave: [path, width]
  ["M21 11.5 a13.5 13.5 0 1 0 0 20", 28], ["M0 35 L11 9 L22 35 M6 27 h10", 29],
  ["M0 9 v26 M0 9 h8 a6.5 6.5 0 0 1 0 13 h-8 M1 22 h9 a6.5 6.5 0 0 1 0 13 h-10", 24], ["M0 9 v14 a10.5 10.5 0 0 0 21 0 v-14", 28],
  ["M0 9 v26 h15", 22], ["M0 35 L11 9 L22 35 M6 27 h10", 29], ["M0 35 v-26 h8 a7 7 0 0 1 0 14 h-8 M9 23 l9 12", 25],
  ["M0 9 l10.5 13 l10.5 -13 M10.5 22 v13", 27], ["M0 22 h14 M7 15 v14", 22],
];
const TILT = [3, -4, 2, 4, -3, -2, 4, -4, 0];
let extraX = 82;
const EXTRAS = EXTRA.map(([d, width], i) => {
  const one = `<g transform="translate(${extraX} 0) rotate(${TILT[i]} 11 22)"><g class="li-in" style="--n:${i + 2}"><path class="li-x" style="--i:${i}" d="${d}"/></g></g>`;
  extraX += width;
  return one;
}).join("");
const INTRO_SVG = `
<svg viewBox="-6 -12 223 62" role="img" aria-label="VOQUIZ">
  <g class="li-all"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="12">
    <g class="li-in" style="--n:0">${LETTER_V}</g>
    <g class="li-in" style="--n:1"><circle class="li-ring" cx="58" cy="21" r="12.5" stroke-width="11" style="stroke:${SOFT}"/></g>
    <g stroke-width="8" style="stroke:color-mix(in srgb, currentColor 30%, #fff)">${EXTRAS}</g>
    <g class="li-quiz" stroke="currentColor"><g class="li-in" style="--n:11">
      ${LETTERS_QUIZ}</g></g>
  </g>
  ${PUNG}</g>
</svg>`;
export const INTRO_MS = 2600;

function picture(className, svg, height) {
  const el = document.createElement("span");
  el.className = className;
  el.style.height = `${height}px`;
  el.innerHTML = svg;
  return el;
}
export const logoIcon = (height) => picture("logo-icon", ICON_SVG, height);
export const wordmark = (height) => picture("logo-word", WORDMARK_SVG, height);
// The name with its story, played once. A screen that is redrawn while it plays gets the same
// moment of it again (not a new start); after it has played, the plain name.
const calm = () => Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
let introAt = 0;
export function wordmarkIntro(height, fresh = false) {
  const now = performance.now();
  if (calm() || (!fresh && introAt && now - introAt > INTRO_MS + 300)) return wordmark(height);
  const el = picture("logo-word logo-intro", INTRO_SVG, height);
  if (fresh || !introAt) introAt = now;
  else {
    const at = now - introAt;
    requestAnimationFrame(() => el.getAnimations?.({ subtree: true }).forEach((one) => { one.currentTime = at; }));
  }
  return el;
}
