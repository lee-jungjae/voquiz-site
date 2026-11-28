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

// The letters take the text colour of where they are placed (the theme colour in the header).
export const WORDMARK_SVG = `
<svg viewBox="-6 -12 218 62" role="img" aria-label="VOQUIZ">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="12">
    <path d="M4 17 L14 33 L32 5" stroke="#23552b" transform="translate(0 3)"/>
    <path d="M4 17 L14 33 L32 5" stroke="#bbd86b"/>
    <g stroke="currentColor">
      <g transform="translate(0 -4)"><circle cx="96" cy="21" r="13"/><path d="M103 29 l8 8"/></g>
      <path d="M124 9 v13 a11 11 0 0 0 22 0 v-13" transform="rotate(5 135 20) translate(0 3)"/>
      <path d="M163 10 v23" transform="rotate(-5 163 20) translate(0 -1)"/>
      <path d="M178 9 h20 L178 35 h20" transform="rotate(4 188 20) translate(0 2)"/>
    </g>
  </g>
  <circle cx="58" cy="23" r="17" fill="#d6d2f0" stroke="currentColor" stroke-width="5"/>
  <circle cx="52" cy="21.5" r="2.8" fill="#2e2a47"/><circle cx="64" cy="21.5" r="2.8" fill="#2e2a47"/>
  <circle cx="53" cy="20.5" r="1" fill="#fff"/><circle cx="65" cy="20.5" r="1" fill="#fff"/>
  <path d="M55 27.5 q3 3.2 6 0" fill="none" stroke="#2e2a47" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="47.5" cy="27" rx="3" ry="2" fill="#ff8fab" opacity=".8"/><ellipse cx="68.500" cy="27" rx="3" ry="2" fill="#ff8fab" opacity=".8"/>
  <path d="M160 -7 l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6 z" fill="#ffd166"/>
</svg>`;

function picture(className, svg, height) {
  const el = document.createElement("span");
  el.className = className;
  el.style.height = `${height}px`;
  el.innerHTML = svg;
  return el;
}
export const logoIcon = (height) => picture("logo-icon", ICON_SVG, height);
export const wordmark = (height) => picture("logo-word", WORDMARK_SVG, height);
