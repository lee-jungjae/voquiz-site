// Theme shop: things a student can buy with word points and switch between in Settings.
import { conceptById } from "./goods.js?v=0.1.28-tp7tpx";
// `accent` is used on light screens, `onDark` on dark ones. Names are Korean keys for i18n.
// Prices climb from "a day or two" to `special` items that take about a week of steady use
// (a busy day of searching, uncovering and quizzing earns roughly 200 points).
export const THEMES = [
  { id: "purple", name: "브랭섬 보라", cost: 0, accent: "#655f9f", onDark: "#a9a4d4" },
  { id: "forest", name: "숲 초록", cost: 60, accent: "#23552b", onDark: "#8fc27a" },
  { id: "ocean", name: "바다 파랑", cost: 150, accent: "#1f6fb2", onDark: "#7db8ea" },
  { id: "sunset", name: "노을 주황", cost: 250, accent: "#d9622b", onDark: "#f0996b" },
  { id: "blossom", name: "벚꽃 분홍", cost: 400, accent: "#d4508a", onDark: "#f092bd" },
  { id: "night", name: "밤하늘 남색", cost: 600, accent: "#2b3a67", onDark: "#9aa8d8" },
  { id: "ruby", name: "루비", cost: 1200, special: true, accent: "#b3123b", onDark: "#f07a98" },
  { id: "gold", name: "황금", cost: 1500, special: true, accent: "#a8780a", onDark: "#e6c35c" },
];

// Backgrounds are drawn in CSS (see `[data-bg=...]` in app.css) from the current theme colour.
export const BACKGROUNDS = [
  { id: "plain", name: "기본", cost: 0 },
  { id: "tint", name: "은은한 색", cost: 40 },
  { id: "dots", name: "물방울", cost: 100 },
  { id: "stripes", name: "줄무늬", cost: 180 },
  { id: "grid", name: "모눈종이", cost: 250 },
  { id: "aurora", name: "오로라", cost: 700 },
  { id: "stars", name: "별이 빛나는 밤", cost: 1500, special: true }, // moving
  { id: "rainbow", name: "무지개 물결", cost: 2000, special: true }, // moving
  // Not for sale: given for reaching the week's goal three weeks in a row (app.js, earnSunrise).
  // While it is the background in use, every word looked up pays a little more.
  { id: "sunrise", name: "황금 햇살", cost: 0, special: true, earn: "weekly3", added: 19 }, // moving
];

// Items carry `added`: the catalogue revision they arrived in. The shop marks an item NEW until
// the student has opened its tab once since then. Raise this when adding items, and give them
// the new number.
export const CATALOG_REV = 21;

// Lettering for the whole app. Free to choose. Every one is an open font (SIL Open Font License)
// served by Google Fonts; it is fetched only once it is chosen or tried on. `family` is its name
// there. Chinese falls back to the device's own lettering.
export const FONTS = [
  { id: "system", name: "기본 글꼴", cost: 0 },
  { id: "gowun", name: "고운돋움", cost: 0, family: "Gowun Dodum", added: 21 },
  { id: "jua", name: "주아", cost: 0, family: "Jua", added: 21 },
  { id: "gaegu", name: "개구", cost: 0, family: "Gaegu", added: 21 },
  { id: "myeongjo", name: "나눔명조", cost: 0, family: "Nanum Myeongjo", added: 21 },
];
export function loadFont(id) {
  const font = FONTS.find((x) => x.id === id);
  if (!font?.family || document.getElementById(`wb-font-${id}`)) return font;
  const link = document.createElement("link");
  link.id = `wb-font-${id}`;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.family.replaceAll(" ", "+")}:wght@400;700&display=swap`;
  document.head.append(link);
  return font;
}

export const DEFAULT_SHOP = { owned: [], theme: "purple", bg: "plain", character: "bubble", concept: "basic", font: "system" };

const darkScreen = () => globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches;

export function themeColor(id) {
  const theme = THEMES.find((x) => x.id === id) || THEMES[0];
  return darkScreen() ? theme.onDark : theme.accent;
}

// Paints the page with the chosen theme colour and background, or, when a whole theme is on
// (goods.js, CONCEPTS), with every colour of that theme; its backdrop takes the background's place.
const PAINTED = ["on-accent", "bg", "surface", "text", "muted", "line", "border", "accent", "accent-dark", "accent-soft", "lime", "good", "good-soft", "bad", "bad-soft", "shadow", "shadow-lg"];
export function applyShop(shop) {
  const { theme, bg, concept, font } = { ...DEFAULT_SHOP, ...(shop || {}) };
  const root = document.documentElement;
  const lettering = loadFont(font);
  if (lettering?.family) { root.dataset.font = lettering.id; root.style.setProperty("--font", `"${lettering.family}"`); }
  else { delete root.dataset.font; root.style.removeProperty("--font"); }
  const whole = conceptById(concept);
  for (const name of PAINTED) root.style.removeProperty(`--${name}`);
  if (whole.vars) {
    for (const [name, value] of Object.entries(whole.vars)) root.style.setProperty(`--${name}`, value);
    root.style.setProperty("--on-accent", whole.dark ? "#14121f" : "#fff"); // what is written on the accent colour
    root.dataset.concept = whole.id;
    root.style.colorScheme = whole.dark ? "dark" : "light";
    document.body.dataset.bg = "plain";
    return;
  }
  delete root.dataset.concept;
  root.style.colorScheme = "";
  const accent = themeColor(theme);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-dark", `color-mix(in srgb, ${accent} 82%, ${darkScreen() ? "white" : "black"})`);
  root.style.setProperty("--accent-soft", `color-mix(in srgb, ${accent} 12%, var(--bg))`);
  document.body.dataset.bg = BACKGROUNDS.some((x) => x.id === bg) ? bg : "plain";
}
