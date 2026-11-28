// The app's own small pictures, in place of emoji (which look different on every device): drawn
// like the characters, a flat colour inside one dark line. art("fire") gives the picture as an
// element sized by the font size around it (1.15em); artUrl("fire") as an address for CSS.
// Every picture is drawn in a box of 24 x 24.
const INK = "#3b3550";
const O = `stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"`;
const L = `fill="none" ${O}`;
const STAR = "m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z";
const petals = (fill) => Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(12 + Math.cos(a) * 5.4).toFixed(1)}" cy="${(12 + Math.sin(a) * 5.4).toFixed(1)}" r="4" fill="${fill}" ${O}/>`; }).join("");

const ART = {
  // ----- doing well -----
  fire: `<path d="M12 2.5c1 3.5 5.5 5.5 5.5 11a5.5 5.5 0 0 1-11 0c0-2.2 1-3.800 2.200-5 .3 1.500 1 2.300 1.800 2.500C10 8 10.500 5 12 2.500z" fill="#ff8a3c" ${O}/><path d="M12 13c1.200 1.300 2 2.300 2 3.600a2 2 0 0 1-4 0c0-1.300.8-2.300 2-3.600z" fill="#ffd84d"/>`,
  star: `<path d="${STAR}" fill="#ffd84d" ${O}/>`,
  spark: `<path d="M12 2.5c.8 5 2.500 7 9.500 9.500-7 2.500-8.700 4.500-9.500 9.500-.8-5-2.500-7-9.500-9.500 7-2.500 8.700-4.500 9.500-9.500z" fill="#ffd84d" ${O}/>`,
  party: `<path d="M4 20 8.500 9l6.500 6.500z" fill="#ff8fb8" ${O}/><circle cx="15" cy="5" r="1.400" fill="#ffd84d" ${O}/><circle cx="19.500" cy="9.500" r="1.400" fill="#7fd6c2" ${O}/><path d="M12.500 8c.5-2 2-3 3.500-3M16 12.500c1.500-.8 3-.5 4.500.5" ${L}/>`,
  crown: `<path d="M3.500 8l4 4L12 5l4.500 7 4-4L19 18.500H5z" fill="#ffd84d" ${O}/><path d="M6 15.500h12" ${L}/>`,
  gift: `<rect x="4" y="10" width="16" height="10.500" rx="1.500" fill="#ff8fb8" ${O}/><rect x="3" y="6.500" width="18" height="4" rx="1.200" fill="#ffc2d8" ${O}/><path d="M12 6.500v14" ${L}/><path d="M12 6.500C10 3 6.500 3.500 7.500 5.500c.5 1 2.500 1 4.500 1zm0 0c2-3.500 5.500-3 4.500-1-.5 1-2.500 1-4.500 1z" fill="#ffd84d" ${O}/>`,
  cap: `<path d="M6.500 12v4.500c1.500 1.500 3.500 2 5.500 2s4-.5 5.500-2V12" fill="#8f88d8" ${O}/><path d="M2 9.500 12 5l10 4.500L12 14z" fill="#655f9f" ${O}/><path d="M22 9.500V15" ${L}/>`,
  // ----- aims and news -----
  target: `<circle cx="11" cy="13" r="8.500" fill="#fff" ${O}/><circle cx="11" cy="13" r="5.300" fill="#ff8fb8" ${O}/><circle cx="11" cy="13" r="2" fill="#fff" ${O}/><path d="M11 13l8.500-8.500M17 4.500h2.500V7" ${L}/>`,
  flag: `<path d="M6 21.500V3" ${L}/><path d="M6 4h12l-2.700 3.800L18 11.500H6z" fill="#ff8fb8" ${O}/>`,
  finish: `<path d="M6 21.500V3" ${L}/><path d="M6 4h12v7.500H6z" fill="#fff" ${O}/><path d="M6 4h4v3.700H6zM10 7.700h4v3.800h-4zM14 4h4v3.700h-4z" fill="${INK}"/>`,
  letter: `<rect x="3" y="6" width="18" height="13" rx="2.500" fill="#fff" ${O}/><path d="M3.500 7.500 12 14l8.500-6.500" ${L}/><path d="M12 12c-1.300-.9-2.200-1.800-2.200-2.800a1.200 1.200 0 0 1 2.200-.5 1.200 1.200 0 0 1 2.200.5c0 1-.9 1.900-2.200 2.800z" fill="#e5386f"/>`,
  megaphone: `<path d="M4 10v4h3l8 4.500v-13L7 10z" fill="#ff8fb8" ${O}/><path d="M18 9.500c1 .7 1.500 1.500 1.500 2.500s-.5 1.800-1.500 2.500M8 14l1 5h2.500l-1-4.500" ${L}/>`,
  up: `<circle cx="12" cy="12" r="9" fill="#7fd6c2" ${O}/><path d="M12 17V7.500M7.800 11.500 12 7.200l4.200 4.300" ${L}/>`,
  door: `<rect x="6" y="3" width="12" height="18" rx="1.500" fill="#9aa5ff" ${O}/><circle cx="14.800" cy="12.500" r="1.100" fill="${INK}"/><path d="M3.500 21h17" ${L}/>`,
  sleep: `<path d="M19.500 14.500A8 8 0 1 1 9.500 4.500a6.500 6.500 0 0 0 10 10z" fill="#ffd84d" ${O}/><path d="M14.500 3.500h4l-4 4.500h4" ${L}/>`,
  mascot: `<path d="M12 4c4.700 0 8.500 3.300 8.500 7.500S16.700 19 12 19c-.8 0-1.600-.1-2.300-.3L6 20.500l.8-3.500C4.700 15.600 3.500 13.700 3.500 11.500 3.500 7.300 7.300 4 12 4z" fill="#b3aee6" ${O}/><circle cx="9.200" cy="11" r="1.100" fill="${INK}"/><circle cx="14.800" cy="11" r="1.100" fill="${INK}"/><path d="M10.500 13.800c1 .8 2 .8 3 0" ${L}/>`,
  search: `<circle cx="10.500" cy="10.500" r="6" fill="#eaf4ff" ${O}/><path d="M15 15l5.500 5.500" fill="none" stroke="${INK}" stroke-width="2.600" stroke-linecap="round"/>`,
  pencil: `<path d="M4 20l1-4.500L15.500 5 19 8.500 8.500 19z" fill="#ffd84d" ${O}/><path d="M4 20l4.500-1L5 15.500z" fill="#fff" ${O}/><path d="M13.500 7l3.500 3.500" ${L}/>`,
  swords: `<path d="M5 4l10 10M19 4 9 14" fill="none" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/><path d="M5 4l10 10M19 4 9 14" fill="none" stroke="#dfe5f2" stroke-width="1.500" stroke-linecap="round"/><path d="M12.500 16.500l4-4M11.500 16.500l-4-4M17 17l2.500 2.500M7 17l-2.500 2.500" ${L}/>`,
  sun: `<circle cx="12" cy="12" r="4.500" fill="#ffd84d" ${O}/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300 7 7M17 17l1.700 1.700M18.700 5.300 17 7M7 17l-1.700 1.700" ${L}/>`,
  sunrise: `<path d="M5 16a7 7 0 0 1 14 0z" fill="#ffd84d" ${O}/><path d="M2.500 16h19M6 19.500h12M12 4v2.500M4.500 8l1.800 1.800M19.500 8l-1.800 1.800" ${L}/>`,
  // ----- the stages of the streak challenge, and what drifts across them -----
  sprout: `<path d="M12 21v-9" ${L}/><path d="M12 13C12 9 9 6.500 4.500 6.500c0 4 3 6.500 7.500 6.500zm0-2c0-3.500 2.500-6 7.500-6 0 4-3 6-7.500 6z" fill="#8fcf6b" ${O}/>`,
  leaf: `<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z" fill="#8fcf6b" ${O}/><path d="M5 19l9-9" ${L}/>`,
  bolt: `<path d="M13.500 2.500 5 13.500h5.500l-1 8L19 10h-6z" fill="#ffd84d" ${O}/>`,
  storm: `<ellipse cx="12" cy="6" rx="8.500" ry="2.800" fill="#9aa5ff" ${O}/><ellipse cx="12.500" cy="11.500" rx="5.500" ry="2.200" fill="#b9c1ff" ${O}/><ellipse cx="13.500" cy="16.300" rx="3" ry="1.700" fill="#9aa5ff" ${O}/><path d="M14.500 20l-.8 1.500" ${L}/>`,
  wind: `<path d="M3 9h10a2.500 2.500 0 1 0-2.500-2.500M3 13h15a2.500 2.500 0 1 1-2.500 2.500M3 17h7" ${L}/>`,
  rocket: `<path d="M12 2.500c3.500 2.500 5 6 5 9.500v4.500H7V12c0-3.500 1.500-7 5-9.500z" fill="#fff" ${O}/><circle cx="12" cy="9.500" r="2" fill="#9aa5ff" ${O}/><path d="M7 13l-3 3.500V19l3-1.500zm10 0 3 3.500V19l-3-1.500z" fill="#ff8fb8" ${O}/><path d="M10 16.500c0 2.500 1 4 2 5 1-1 2-2.500 2-5z" fill="#ffd84d" ${O}/>`,
  planet: `<circle cx="12" cy="12" r="6" fill="#ffa45c" ${O}/><ellipse cx="12" cy="12" rx="10" ry="3" ${L} transform="rotate(-18 12 12)"/>`,
  gem: `<path d="M7 4h10l4 5-9 11L3 9z" fill="#7cc6fe" ${O}/><path d="M3 9h18M9 9l3 11 3-11M7 4l2 5M17 4l-2 5" ${L}/>`,
  // ----- the lands of the league -----
  flower: `${petals("#ff8fb8")}<circle cx="12" cy="12" r="3" fill="#ffd84d" ${O}/>`,
  island: `<path d="M3 18.500c2-4 5-6 9-6s7 2 9 6z" fill="#ffd84d" ${O}/><path d="M12 12.500c0-3 .5-5 1.500-7" ${L}/><path d="M13.500 5.500c-2.500-1.500-5-1-6.500 1 2 .5 4.500.2 6.500-1zm0 0c2.500-1.500 5-.5 6 1.500-2 .3-4.500-.2-6-1.500z" fill="#8fcf6b" ${O}/><path d="M2.500 21h19" ${L}/>`,
  whale: `<path d="M3 13c0-4 3.500-6.500 8-6.500 5 0 8 3 8 6.500 1.500-.5 2.500-1.500 2.500-3 .8 3-.5 6-3.500 7.500-2 1-4.500 1.500-7 1.500-4.500 0-8-2-8-6z" fill="#7cc6fe" ${O}/><circle cx="7.500" cy="12.500" r="1" fill="${INK}"/><path d="M11 6.500C11 5 10 4 8.500 4M11 6.500C11 5 12 4 13.500 4" ${L}/>`,
  snow: `<circle cx="12" cy="12" r="9.500" fill="#e3f1fb" ${O}/><path d="M12 5.500v13M6.400 8.800l11.200 6.400M17.600 8.800 6.400 15.200" fill="none" stroke="#5aa9e6" stroke-width="1.800" stroke-linecap="round"/>`,
  rainbow: `<path d="M3.500 18a8.500 8.500 0 0 1 17 0" fill="none" stroke="#ff8fb8" stroke-width="3"/><path d="M6.500 18a5.500 5.500 0 0 1 11 0" fill="none" stroke="#ffd84d" stroke-width="3"/><path d="M9.500 18a2.500 2.500 0 0 1 5 0" fill="none" stroke="#7fd6c2" stroke-width="3"/><path d="M2 18a10 10 0 0 1 20 0M2 18h3M19 18h3" ${L}/>`,
  cloud: `<path d="M7 18.500a4 4 0 0 1-.5-8 5.500 5.500 0 0 1 10.600-1A4.500 4.500 0 0 1 17 18.500z" fill="#fff" ${O}/>`,
};

const NS = "http://www.w3.org/2000/svg";
export function art(name, cls = "") {
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", "0 0 24 24");
  el.setAttribute("class", `art-i ${cls}`.trim());
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = ART[name] || ART.star;
  return el;
}
export const artUrl = (name) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="${NS}" viewBox="0 0 24 24">${ART[name] || ART.star}</svg>`)}")`;
// The pictures CSS draws by itself (before a streak count, on the urgent band).
export function artToCss() {
  for (const name of ["fire", "megaphone"]) document.documentElement.style.setProperty(`--art-${name}`, artUrl(name));
}
