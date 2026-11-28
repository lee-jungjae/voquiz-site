// What a student can collect besides characters, colours and backgrounds:
//   CONCEPTS  whole themes: one changes every colour of the app, its backdrop and a little of its
//             shape and lettering (bought with points, or found in a capsule)
//   WEARS     small things any character can wear or hold (found in capsules, or given at a level)
//   SKINS     another coat of paint for one particular character
//   MACHINES  the capsule machines: what a turn may give (paid with hearts, a ticket or points)
//   levels    how many learned words each level asks for, and what reaching it gives
// Names are Korean keys for i18n. Everything drawn is in the characters' own space (200 x 150:
// the face sits around x 100, y 84, the eyes at 86 and 114, the hands near 58 and 142, y 52).

// ----- whole themes -----
// `vars` are the app's colour variables (app.css, :root). A theme that is dark says so, for the
// few places that ask. What else a theme changes (backdrop, lettering, corners) is in app.css
// under html[data-concept="…"].
export const CONCEPTS = [
  { id: "basic", name: "기본 테마", cost: 0 },
  { id: "candy", name: "솜사탕 나라", cost: 300, added: 20,
    vars: { bg: "#fff7fb", surface: "#ffe9f3", text: "#4b2a3f", muted: "#a06a88", line: "#fbdcea", border: "#f4bfd8", accent: "#e2559b", "accent-dark": "#c93f84", "accent-soft": "#ffe3f0", lime: "#a6ecd9", good: "#1f8a70", "good-soft": "#e2f8f1", bad: "#c93f84", "bad-soft": "#ffe3f0" } },
  { id: "forest", name: "숲속 캠핑", cost: 400, added: 20,
    vars: { bg: "#f8f6ec", surface: "#ece8d6", text: "#2c3828", muted: "#6e7a62", line: "#e0dbc6", border: "#cbc5aa", accent: "#3f7d4a", "accent-dark": "#2f6339", "accent-soft": "#e3edd6", lime: "#cfe07a", good: "#2f6b2f", "good-soft": "#e6f0d4", bad: "#8a5a2b", "bad-soft": "#f3e7d3" } },
  { id: "ocean", name: "바닷속 탐험", cost: 500, added: 20,
    vars: { bg: "#f1fafe", surface: "#dff1f9", text: "#0f3a52", muted: "#4d7c93", line: "#cfe8f3", border: "#b3d9ea", accent: "#0b82bd", "accent-dark": "#086a9b", "accent-soft": "#d9f0fb", lime: "#7fe3d0", good: "#0b7a63", "good-soft": "#dcf6ef", bad: "#2f6fb0", "bad-soft": "#dfeefb" } },
  { id: "lemon", name: "레몬 소풍", cost: 500, added: 20,
    vars: { bg: "#fffdf0", surface: "#fff4c7", text: "#3d3414", muted: "#8a7a3a", line: "#f6e9ae", border: "#ecd97e", accent: "#b97d00", "accent-dark": "#966400", "accent-soft": "#fff0bf", lime: "#b9e06a", good: "#4f7a12", "good-soft": "#eef7d6", bad: "#b5651d", "bad-soft": "#fbe9d2" } },
  { id: "retro", name: "레트로 게임기", cost: 700, added: 20,
    vars: { bg: "#f4f1de", surface: "#e7e3c9", text: "#2b2d42", muted: "#6c6f85", line: "#d8d3b6", border: "#2b2d42", accent: "#d1495b", "accent-dark": "#a93546", "accent-soft": "#f6dcd9", lime: "#edae49", good: "#2a7f62", "good-soft": "#dcefe4", bad: "#a93546", "bad-soft": "#f6dcd9" } },
  { id: "space", name: "우주 정거장", cost: 800, added: 20, dark: true,
    vars: { bg: "#0f1226", surface: "#1a1f3d", text: "#eef0ff", muted: "#a2aadb", line: "#252b55", border: "#363d72", accent: "#9aa5ff", "accent-dark": "#c0c7ff", "accent-soft": "#20264f", lime: "#7df0c8", good: "#7df0c8", "good-soft": "#123329", bad: "#c0c7ff", "bad-soft": "#20264f",
      shadow: "0 1px 2px rgba(0, 0, 0, .5), 0 4px 12px rgba(0, 0, 0, .4)", "shadow-lg": "0 6px 16px rgba(0, 0, 0, .6)" } },
  { id: "night", name: "한밤의 도서관", cost: 900, added: 20, dark: true,
    vars: { bg: "#1b1713", surface: "#2a231b", text: "#f4ead9", muted: "#b8a78d", line: "#332a20", border: "#46392b", accent: "#e6b85c", "accent-dark": "#f1cf86", "accent-soft": "#33291a", lime: "#c9d98a", good: "#c9d98a", "good-soft": "#252b17", bad: "#f1cf86", "bad-soft": "#33291a",
      shadow: "0 1px 2px rgba(0, 0, 0, .5), 0 4px 12px rgba(0, 0, 0, .4)", "shadow-lg": "0 6px 16px rgba(0, 0, 0, .6)" } },
  // Given at a level only (`level`): not sold, not in the capsule machines.
  { id: "sakura", name: "벚꽃 정원", level: 25, added: 21,
    vars: { bg: "#fff8fa", surface: "#ffeef3", text: "#4a2b3a", muted: "#9a6c80", line: "#fadfe8", border: "#f2c2d2", accent: "#d9608f", "accent-dark": "#bf4a79", "accent-soft": "#ffe6ee", lime: "#bfe6a8", good: "#3d8a52", "good-soft": "#e6f6e6", bad: "#bf4a79", "bad-soft": "#ffe6ee" } },
  { id: "aurora", name: "오로라 밤", level: 40, added: 21, dark: true,
    vars: { bg: "#0e1a24", surface: "#16283a", text: "#e8fbf6", muted: "#9cc5c0", line: "#1f3447", border: "#2c4960", accent: "#5fe0c0", "accent-dark": "#8ef0d6", "accent-soft": "#143a3a", lime: "#b6f08a", good: "#b6f08a", "good-soft": "#17331f", bad: "#8ef0d6", "bad-soft": "#143a3a",
      shadow: "0 1px 2px rgba(0, 0, 0, .5), 0 4px 12px rgba(0, 0, 0, .4)", "shadow-lg": "0 6px 16px rgba(0, 0, 0, .6)" } },
  // Seven more (0.1.28), so that every taste finds at least two: plain and grown-up, sporty, city
  // neon, calm East Asian paper, warm desert, cool winter, bright fruit.
  { id: "mono", name: "미니멀 모노", cost: 400, added: 22,
    vars: { bg: "#ffffff", surface: "#f3f3f3", text: "#111111", muted: "#6b6b6b", line: "#e8e8e8", border: "#cfcfcf", accent: "#111111", "accent-dark": "#000000", "accent-soft": "#ededed", lime: "#ffd400", good: "#1a7f4b", "good-soft": "#e3f3ea", bad: "#c0392b", "bad-soft": "#fbe6e3" } },
  { id: "field", name: "스포츠 필드", cost: 500, added: 22,
    vars: { bg: "#f3faf0", surface: "#e1f1da", text: "#16331c", muted: "#557a5c", line: "#d2e8c9", border: "#b4d6a8", accent: "#1f8f3a", "accent-dark": "#17722d", "accent-soft": "#dcf1d3", lime: "#ffd84d", good: "#17722d", "good-soft": "#dcf1d3", bad: "#c2410c", "bad-soft": "#fde6da" } },
  { id: "nordic", name: "북유럽 겨울", cost: 500, added: 22,
    vars: { bg: "#f5f8fa", surface: "#e6edf2", text: "#24323d", muted: "#64788a", line: "#dbe4ea", border: "#c2d0da", accent: "#4a7a96", "accent-dark": "#3a6179", "accent-soft": "#dde9f0", lime: "#f4c95d", good: "#3c7a6a", "good-soft": "#dcefe9", bad: "#b5566a", "bad-soft": "#f6e1e6" } },
  { id: "hanji", name: "한지와 먹", cost: 600, added: 22,
    vars: { bg: "#f7f1e3", surface: "#ece3cf", text: "#26221c", muted: "#7a6f5e", line: "#e0d5bd", border: "#cbbd9f", accent: "#a8322a", "accent-dark": "#862620", "accent-soft": "#f3ddd3", lime: "#c9b458", good: "#4a6b3a", "good-soft": "#e6ecd6", bad: "#a8322a", "bad-soft": "#f3ddd3" } },
  { id: "desert", name: "사막 노을", cost: 600, added: 22,
    vars: { bg: "#fff6ee", surface: "#fbe6d4", text: "#4a2a1c", muted: "#9a6b55", line: "#f3d6c0", border: "#e6b999", accent: "#c8553d", "accent-dark": "#a5412c", "accent-soft": "#fbe0d2", lime: "#f2b84b", good: "#5f7a3a", "good-soft": "#ecf0d8", bad: "#a5412c", "bad-soft": "#fbe0d2" } },
  { id: "tropical", name: "열대 과일", cost: 700, added: 22,
    vars: { bg: "#fffaf0", surface: "#ffefc9", text: "#3a2a12", muted: "#8a6a3a", line: "#fbe3b0", border: "#f3cd7e", accent: "#e8502a", "accent-dark": "#c63f1c", "accent-soft": "#ffe1d4", lime: "#9be35a", good: "#2f8a3a", "good-soft": "#e0f5d9", bad: "#c63f1c", "bad-soft": "#ffe1d4" } },
  { id: "neon", name: "네온 시티", cost: 900, added: 22, dark: true,
    vars: { bg: "#0d0b1a", surface: "#1a1630", text: "#f1eeff", muted: "#a59fce", line: "#2a2448", border: "#3a3263", accent: "#ff5fdc", "accent-dark": "#ff8fe8", "accent-soft": "#2c1640", lime: "#3df5d0", good: "#3df5a0", "good-soft": "#10302a", bad: "#ff8a8a", "bad-soft": "#3a1a26",
      shadow: "0 1px 2px rgba(0, 0, 0, .5), 0 4px 12px rgba(0, 0, 0, .4)", "shadow-lg": "0 6px 16px rgba(0, 0, 0, .6)" } },
  // Clean and grown-up (0.1.28): made with teachers in mind, with no playful backdrop.
  { id: "slate", name: "슬레이트", cost: 500, added: 22,
    vars: { bg: "#ffffff", surface: "#f1f4f6", text: "#1f2a33", muted: "#5f6f7c", line: "#e3e8ec", border: "#cbd4db", accent: "#0f766e", "accent-dark": "#0b5c56", "accent-soft": "#d9efec", lime: "#f2c94c", good: "#0f766e", "good-soft": "#d9efec", bad: "#b4442f", "bad-soft": "#f8e3de" } },
  { id: "ivory", name: "아이보리 노트", cost: 500, added: 22,
    vars: { bg: "#fbf8f0", surface: "#f1ecdf", text: "#1e2a44", muted: "#6a7088", line: "#e7e0cf", border: "#d3c9b2", accent: "#27407a", "accent-dark": "#1c3060", "accent-soft": "#e2e7f3", lime: "#e9c46a", good: "#2f6f55", "good-soft": "#e0eee6", bad: "#a1453a", "bad-soft": "#f4e1dc" } },
  { id: "magazine", name: "매거진", cost: 600, added: 22,
    vars: { bg: "#ffffff", surface: "#f4f2ee", text: "#111111", muted: "#6a6a6a", line: "#e6e3dd", border: "#d6d2ca", accent: "#d7263d", "accent-dark": "#b01c30", "accent-soft": "#fbe3e6", lime: "#ffd23f", good: "#1a7f4b", "good-soft": "#e3f3ea", bad: "#b01c30", "bad-soft": "#fbe3e6" } },
  { id: "chalk", name: "칠판", cost: 700, added: 22, dark: true,
    vars: { bg: "#1f3a32", surface: "#284a40", text: "#f3f1e6", muted: "#b5c7bb", line: "#2f5549", border: "#3f6a5c", accent: "#f2d16b", "accent-dark": "#f7e29c", "accent-soft": "#3a4d33", lime: "#f2a7a7", good: "#9fe0b0", "good-soft": "#25503f", bad: "#f2a7a7", "bad-soft": "#4a3535",
      shadow: "0 1px 2px rgba(0, 0, 0, .4), 0 4px 12px rgba(0, 0, 0, .3)", "shadow-lg": "0 6px 16px rgba(0, 0, 0, .5)" } },
  { id: "rainbow", name: "무지개 젤리", cost: 1500, special: true, added: 20,
    vars: { bg: "#ffffff", surface: "#f6f3ff", text: "#2a2350", muted: "#6f6a94", line: "#ebe6fb", border: "#d9d1f7", accent: "#7a5cff", "accent-dark": "#5f43e0", "accent-soft": "#efeaff", lime: "#9af0c4", good: "#1f8a5c", "good-soft": "#e1f8ec", bad: "#5f43e0", "bad-soft": "#efeaff" } },
];
export const conceptById = (id) => CONCEPTS.find((x) => x.id === id) || CONCEPTS[0];

import { stroke, star, twinkle, heart } from "./wear-art.js?v=0.1.28-tp7zz1";
import { HEAD_WEARS } from "./wears-head.js?v=0.1.28-tp7zz1";
import { FACE_WEARS } from "./wears-face.js?v=0.1.28-tp7zz1";
import { HOLD_WEARS } from "./wears-hold.js?v=0.1.28-tp7zz1";
import { AROUND_WEARS } from "./wears-around.js?v=0.1.28-tp7zz1";

// ----- things to wear -----
// slot: only one thing of a slot is worn at a time (head, eyes, cheek, hand, neck, back, aura). layer "back" is drawn behind the body.
// rare: 1 common, 2 rare, 3 very rare (which machine it comes out of, and how often).
export const WEARS = [
  // on the head: hats and hair (the top of the head is near y 50)
  { id: "cap", name: "야구 모자", slot: "head", rare: 1, added: 21,
    art: `<path d="M74 58 q4 -24 26 -24 q22 0 26 24 z" fill="#4f8fe0" stroke="#3a6fc0" stroke-width="2.2" stroke-linejoin="round"/><path d="M122 56 q18 -1 26 7 q-16 3 -28 -2 z" fill="#3a6fc0" stroke="#3a6fc0" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="34" r="3" fill="#3a6fc0"/>` },
  { id: "beanie", name: "털모자", slot: "head", rare: 1, added: 21,
    art: `<path d="M74 58 q2 -26 26 -26 q24 0 26 26 z" fill="#ff8fb8" stroke="#e0569a" stroke-width="2.2" stroke-linejoin="round"/><rect x="71" y="53" width="58" height="9" rx="4.5" fill="#ffc2d8" stroke="#e0569a" stroke-width="2"/><circle cx="100" cy="29" r="7" fill="#fff" stroke="#e0569a" stroke-width="2"/>` },
  { id: "bow", name: "리본", slot: "head", rare: 1, added: 21,
    art: `<path d="M118 50 l-14 -9 v18 z M118 50 l14 -9 v18 z" fill="#ff5c8a" stroke="#d63d73" stroke-width="2" stroke-linejoin="round"/><circle cx="118" cy="50" r="4" fill="#d63d73"/>` },
  { id: "partyhat", name: "고깔모자", slot: "head", rare: 2, added: 21,
    art: `<path d="M100 18 l19 40 h-38 z" fill="#ffd84d" stroke="#e0a82e" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M90 40 l18 8 M86 50 l26 6", "#ff8fb8", 3) + `<circle cx="100" cy="17" r="5" fill="#ff8fb8" stroke="#e0569a" stroke-width="1.6"/>` },
  { id: "wizardhat", name: "마법사 모자", slot: "head", rare: 2, added: 21,
    art: `<path d="M104 14 q-2 22 14 42 h-38 q10 -18 12 -34 q4 -8 12 -8 z" fill="#6a5fd0" stroke="#4a3fb0" stroke-width="2.2" stroke-linejoin="round"/><path d="M64 58 q36 -10 72 0 q-36 8 -72 0 z" fill="#4a3fb0"/>` + star(101, 40, 5, "#ffd84d") },
  { id: "curls", name: "뽀글머리", slot: "head", rare: 2, added: 21,
    art: [[76, 56], [86, 48], [98, 45], [110, 47], [121, 53], [70, 66], [128, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#8a5a3a" stroke="#6a4028" stroke-width="1.8"/>`).join("") },
  { id: "crown", name: "왕관", slot: "head", rare: 3, added: 21,
    art: `<path d="M78 56 l-4 -22 l13 10 l13 -16 l13 16 l13 -10 l-4 22 z" fill="#ffd84d" stroke="#e0a82e" stroke-width="2.4" stroke-linejoin="round"/><circle cx="100" cy="46" r="3.4" fill="#ff5c8a"/><circle cx="87" cy="49" r="2.4" fill="#7fd6c2"/><circle cx="113" cy="49" r="2.4" fill="#9aa5ff"/>` + twinkle(128, 30, 3, "#fff3b0") },
  // on the eyes
  { id: "glasses", name: "동그란 안경", slot: "eyes", rare: 1,
    art: `<g fill="none" stroke="#3b3550" stroke-width="2.6" stroke-linecap="round"><circle cx="86" cy="82" r="9.5" fill="rgba(255,255,255,.25)"/><circle cx="114" cy="82" r="9.5" fill="rgba(255,255,255,.25)"/><path d="M95.5 82 h9 M76.5 80 l-7 -3 M123.5 80 l7 -3"/></g>` },
  { id: "shades", name: "선글라스", slot: "eyes", rare: 2,
    art: `<path d="M75 76 h20 a2 2 0 0 1 2 2 v4 a9 9 0 0 1 -9 9 h-6 a9 9 0 0 1 -9 -9 v-4 a2 2 0 0 1 2 -2 z M103 76 h20 a2 2 0 0 1 2 2 v4 a9 9 0 0 1 -9 9 h-6 a9 9 0 0 1 -9 -9 v-4 a2 2 0 0 1 2 -2 z" fill="#2b2840"/>${stroke("M97 79 h6 M73 78 l-6 -2 M127 78 l6 -2", "#2b2840")}${stroke("M79 80 l5 -2 M107 80 l5 -2", "rgba(255,255,255,.75)", 1.8)}` },
  { id: "heartglasses", name: "하트 안경", slot: "eyes", rare: 2,
    art: heart(86, 80, 9.5, "rgba(255,92,138,.22)", ' stroke="#ff5c8a" stroke-width="2.6" stroke-linejoin="round"') + heart(114, 80, 9.5, "rgba(255,92,138,.22)", ' stroke="#ff5c8a" stroke-width="2.6" stroke-linejoin="round"') + stroke("M95 80 h10", "#ff5c8a") },
  { id: "goldglasses", name: "황금 안경", slot: "eyes", rare: 3, added: 21,
    art: `<g fill="none" stroke="#e0a82e" stroke-width="3" stroke-linecap="round"><circle cx="86" cy="82" r="9.5" fill="rgba(255,216,77,.3)"/><circle cx="114" cy="82" r="9.5" fill="rgba(255,216,77,.3)"/><path d="M95.5 82 h9 M76.5 80 l-7 -3 M123.5 80 l7 -3"/></g>` + twinkle(128, 68, 3.2, "#fff3b0") },
  // ----- given at a level only (`level`): not sold, not in the capsule machines -----
  { id: "sproutpin", name: "새싹 핀", slot: "head", rare: 3, level: 5, added: 21,
    art: stroke("M116 54 q0 -8 2 -12", "#4f9a58", 2.6) + `<path d="M118 42 q-10 -9 -15 1 q8 7 15 -1 z M118 42 q10 -9 15 1 q-8 7 -15 -1 z" fill="#7ccf6b" stroke="#4f9a58" stroke-width="1.6" stroke-linejoin="round"/>` },
  { id: "medal", name: "별 메달", slot: "neck", rare: 3, level: 15, added: 21,
    art: `<path d="M88 100 l12 14 l12 -14" fill="none" stroke="#4f8fe0" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="117" r="8.5" fill="#ffd84d" stroke="#e0a82e" stroke-width="2"/>` + star(100, 117, 4.4, "#fff") },
  { id: "explorerhat", name: "탐험가 모자", slot: "head", rare: 3, level: 30, added: 21,
    art: `<path d="M78 56 q2 -23 22 -23 q20 0 22 23 z" fill="#d9b382" stroke="#a8804e" stroke-width="2.2" stroke-linejoin="round"/><path d="M62 57 q38 -9 76 0 q-38 9 -76 0 z" fill="#c79a62" stroke="#a8804e" stroke-width="2" stroke-linejoin="round"/>` + stroke("M80 50 q20 -4 40 0", "#7a5a2e", 4) },
  { id: "goldwings", name: "황금 날개", slot: "back", layer: "back", rare: 3, level: 45, added: 21,
    art: `<g fill="#ffe08a" stroke="#e0a82e" stroke-width="2.2" stroke-linejoin="round"><path d="M72 84 q-22 -34 -44 -20 q10 2 12 10 q-10 0 -10 8 q10 -2 14 4 q-8 2 -6 8 q18 0 34 -10 z"/><path d="M128 84 q22 -34 44 -20 q-10 2 -12 10 q10 0 10 8 q-10 -2 -14 4 q8 2 6 8 q-18 0 -34 -10 z"/></g>` + twinkle(30, 58, 3.4, "#fff3b0") + twinkle(170, 58, 3.4, "#fff3b0") },
  // on a cheek
  { id: "starsticker", name: "별 스티커", slot: "cheek", rare: 1, art: star(125, 97, 6.5, "#ffc93c") },
  { id: "bandaid", name: "반창고", slot: "cheek", rare: 1,
    art: `<g transform="rotate(-24 76 98)"><rect x="67" y="94.5" width="18" height="7" rx="3.5" fill="#f6c8a0" stroke="#d99a66" stroke-width="1"/><rect x="73" y="94.5" width="6" height="7" fill="#fbe3cd"/></g>` },
  // in a hand
  { id: "balloon", name: "빨간 풍선", slot: "hand", rare: 1,
    art: stroke("M142 54 q8 -10 6 -22", "#8a8fa3", 1.6) + `<ellipse cx="149" cy="19" rx="11" ry="13.5" fill="#ff5d5d"/><path d="M146 32 l3 4 l3 -4 z" fill="#ff5d5d"/>` + stroke("M143 12 q3 -4 7 -4", "rgba(255,255,255,.8)", 2.2) },
  { id: "lollipop", name: "막대사탕", slot: "hand", rare: 1,
    art: stroke("M58 56 l-6 -22", "#f1ead8", 3) + `<circle cx="50" cy="27" r="10" fill="#ff8fc5"/>` + stroke("M50 27 m-6 0 a6 6 0 1 1 6 6 a3.2 3.2 0 1 1 -3 -3", "#fff", 2.2) },
  { id: "flower", name: "꽃 한 송이", slot: "hand", rare: 1,
    art: stroke("M58 56 q-4 -10 -6 -20", "#58a55c", 2.6) + [[52, 27], [44, 32], [47, 41], [57, 41], [60, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="#ffd1e6"/>`).join("") + `<circle cx="52" cy="35" r="4.4" fill="#ffc93c"/>` },
  { id: "flag", name: "응원 깃발", slot: "hand", rare: 2,
    art: stroke("M142 56 l5 -38", "#8a6a3a", 2.8) + `<path d="M147 18 l22 6 l-20 9 z" fill="#ffc93c" stroke="#e0a82e" stroke-width="1.6" stroke-linejoin="round"/>` + star(155, 25, 3.6, "#fff") },
  { id: "wand", name: "요술봉", slot: "hand", rare: 2,
    art: stroke("M142 56 l8 -24", "#c9b6ff", 3) + star(152, 24, 9.5, "#ffd84d") + twinkle(165, 14, 3.4, "#fff3b0") + twinkle(141, 20, 2.6, "#fff3b0") },
  // at the neck
  { id: "bowtie", name: "나비넥타이", slot: "neck", rare: 1,
    art: `<path d="M100 105 l-13 -6 v12 z M100 105 l13 -6 v12 z" fill="#e23b5a" stroke="#b92a45" stroke-width="1.6" stroke-linejoin="round"/><circle cx="100" cy="105" r="3.4" fill="#b92a45"/>` },
  { id: "scarf", name: "줄무늬 목도리", slot: "neck", rare: 2,
    art: `<path d="M72 100 q28 12 56 0 v8 q-28 12 -56 0 z" fill="#4f8fe0"/><path d="M112 108 l4 16 h10 l-5 -18 z" fill="#4f8fe0"/>` + stroke("M82 105 v8 M96 108 v8 M110 106 v8 M116 116 h9", "#fff", 2.2) },
  // behind
  { id: "cape", name: "빨간 망토", slot: "back", layer: "back", rare: 2,
    art: `<path d="M76 68 q24 -8 48 0 l20 48 q-44 14 -88 0 z" fill="#e23b3b" stroke="#b92a2a" stroke-width="2.2" stroke-linejoin="round"/><path d="M84 70 q16 -5 32 0 l4 8 q-20 -6 -40 0 z" fill="#ffd84d"/>` },
  { id: "wings", name: "천사 날개", slot: "back", layer: "back", rare: 3,
    art: `<g fill="#fff" stroke="#bcd8f5" stroke-width="2.2" stroke-linejoin="round"><path d="M72 84 q-22 -34 -44 -20 q10 2 12 10 q-10 0 -10 8 q10 -2 14 4 q-8 2 -6 8 q18 0 34 -10 z"/><path d="M128 84 q22 -34 44 -20 q-10 2 -12 10 q10 0 10 8 q-10 -2 -14 4 q8 2 6 8 q-18 0 -34 -10 z"/></g>` },
  { id: "rainbowcape", name: "무지개 망토", slot: "back", layer: "back", rare: 3, added: 21,
    art: `<path d="M76 68 q24 -8 48 0 l20 48 q-44 14 -88 0 z" fill="#9aa5ff" stroke="#6a73d6" stroke-width="2.2" stroke-linejoin="round"/><path d="M73 76 l-7 16 q34 10 68 0 l-7 -16 q-27 8 -54 0 z" fill="#ff8fb8"/><path d="M66 92 l-6 14 q40 12 80 0 l-6 -14 q-34 10 -68 0 z" fill="#ffd84d"/><path d="M84 70 q16 -5 32 0 l4 8 q-20 -6 -40 0 z" fill="#fff"/>` },
  // around
  { id: "sparkle", name: "반짝반짝", slot: "aura", rare: 2, art: twinkle(52, 46, 6, "#ffd84d") + twinkle(152, 96, 5, "#ffd84d") + twinkle(44, 104, 4, "#ffe89a") + twinkle(158, 44, 3.6, "#ffe89a") },
  { id: "lovely", name: "하트 뿅뿅", slot: "aura", rare: 3, art: heart(50, 40, 6, "#ff7aa8") + heart(154, 34, 4.6, "#ffa6c4") + heart(160, 92, 5.4, "#ff7aa8") + heart(42, 98, 4, "#ffa6c4") },
];
// More of each place (at least twenty a place), drawn in their own files.
WEARS.push(...HEAD_WEARS, ...FACE_WEARS, ...HOLD_WEARS, ...AROUND_WEARS);
export const SLOTS = [["head", "머리"], ["eyes", "눈"], ["cheek", "볼"], ["hand", "손"], ["neck", "목"], ["back", "몸"], ["aura", "주변"]];
export const wearById = (id) => WEARS.find((x) => x.id === id);

// ----- another look for one character -----
// paint: what replaces the character's own colours and drawings (see characters.js for the fields).
const ears = (fill, inner) => `<circle cx="72" cy="56" r="12" fill="${fill}"/><circle cx="128" cy="56" r="12" fill="${fill}"/><circle cx="72" cy="56" r="6" fill="${inner}"/><circle cx="128" cy="56" r="6" fill="${inner}"/>`;
export const SKINS = [
  { id: "candy", of: "bubble", name: "솜사탕 말풍이", rare: 2, paint: { fill: "#ffd6e8", stroke: "#f092bd", limb: "#e0569a" } },
  { id: "star", of: "bubble", name: "별빛 말풍이", rare: 3, level: 20, added: 21, paint: { fill: "#4a4f96", stroke: "#2f3470", limb: "#2f3470", deco: twinkle(80, 66, 3.2, "#ffe89a") + twinkle(122, 62, 2.6, "#ffe89a") + twinkle(116, 104, 2.4, "#fff3b0") + twinkle(84, 102, 2, "#fff3b0") } },
  { id: "gold", of: "bubble", name: "황금 말풍이", rare: 3, level: 50, paint: { fill: "#ffe08a", stroke: "#e0a82e", limb: "#c98a14" } },
  { id: "moon", of: "rabbit", name: "달빛 토토", rare: 2,
    paint: { fill: "#ece8ff", stroke: "#b9aef0", limb: "#9a8fe0",
      back: '<path d="M86 62 q-12 -32 -1 -40 q11 8 8 38 z M114 62 q12 -32 1 -40 q-11 8 -8 38 z" fill="#ece8ff" stroke="#b9aef0" stroke-width="2.5" stroke-linejoin="round"/><path d="M86 54 q-6 -18 -1 -24 M114 54 q6 -18 1 -24" fill="none" stroke="#cfc5ff" stroke-width="4" stroke-linecap="round"/>' } },
  { id: "polar", of: "bear", name: "북극곰 곰돌이", rare: 2,
    paint: { fill: "#ffffff", stroke: "#cfe3f5", limb: "#9ec3e6", back: ears("#ffffff", "#d9ecfb").replace(/fill="#ffffff"\/>/g, 'fill="#ffffff" stroke="#cfe3f5" stroke-width="2"/>'), deco: '<ellipse cx="100" cy="93" rx="13" ry="9" fill="#eef7ff"/>' } },
  { id: "berry", of: "chick", name: "딸기 삐약이", rare: 2,
    paint: { fill: "#ffc2d9", limb: "#e86a9a", topper: stroke("M100 46 q-6 -10 -12 -8 M100 46 q0 -12 6 -12 M100 46 q8 -8 12 -4", "#58a55c", 3) } },
  { id: "night", of: "cat", name: "밤하늘 냥냥이", rare: 3,
    paint: { fill: "#3b3f5c", stroke: "#262a44", limb: "#262a44",
      back: '<path d="M134 104 q20 -2 15 -24" fill="none" stroke="#262a44" stroke-width="5" stroke-linecap="round"/>',
      deco: '<path d="M78 56 l1 -8 l7 5 z M122 56 l-1 -8 l-7 5 z" fill="#9aa5ff"/><path d="M68 91 h-10 M69 96 l-9 3 M132 91 h10 M131 96 l9 3" fill="none" stroke="#c0c7ff" stroke-width="1.8" stroke-linecap="round"/>' + twinkle(118, 64, 3, "#ffe89a") } },
];
// Every character has three coats of paint. The hand-made ones above come first; the rest are
// made here from three styles, so a new character gets its skins by itself. A style repaints the
// body and whatever part of the character was drawn in its own body colours (ears, tails).
// Rule for new skins: rare 2 comes from the everyday capsule, rare 3 from the golden one.
const STYLES = [
  { id: "night", name: "밤하늘 {name}", rare: 3, paint: { fill: "#3b3f5c", stroke: "#262a44", limb: "#262a44" } },
  { id: "candy", name: "솜사탕 {name}", rare: 2, paint: { fill: "#ffd6e8", stroke: "#f092bd", limb: "#e0569a" } },
  { id: "mint", name: "민트 {name}", rare: 2, paint: { fill: "#c9f2e3", stroke: "#7fd1b4", limb: "#3fae8b" } },
];
const SKINS_EACH = 3;
const NOT_FOR = { rabbit: ["candy"], chick: ["candy"] }; // too close to how they already look
export function addSkins(characters) {
  for (const who of characters) {
    const have = SKINS.filter((x) => x.of === who.id);
    for (const style of STYLES) {
      if (have.length >= SKINS_EACH) break;
      if (have.some((x) => x.id === style.id) || NOT_FOR[who.id]?.includes(style.id)) continue;
      const repaint = (art) => ["fill", "stroke", "limb"].reduce((out, part) => (who[part] ? out.split(who[part]).join(style.paint[part]) : out), art);
      const paint = { ...style.paint };
      for (const part of ["back", "deco", "topper"]) if (who[part]) paint[part] = repaint(who[part]);
      if (style.id === "night") paint.deco = (paint.deco || "") + twinkle(117, 70, 2.6, "#ffe89a") + twinkle(85, 99, 2, "#fff3b0");
      const skin = { id: style.id, of: who.id, style: style.name, who: who.name, name: style.name.replace("{name}", who.name), rare: style.rare, paint };
      SKINS.push(skin); have.push(skin);
    }
  }
}
// A skin's name in the student's language (made skins are named from their style and character).
export const skinName = (skin, t) => (skin.style ? t(skin.style, { name: t(skin.who) }) : t(skin.name));
export const skinById = (of, id) => SKINS.find((x) => x.of === of && x.id === id);
export const skinKey = (skin) => `skin:${skin.of}-${skin.id}`;

// ----- the capsule machines -----
// A machine is turned for a capsule with a prize inside. There are two: the everyday one (paid
// with ten hearts from friends, a ticket, or points) and the golden one (a golden ticket, or
// many points) where the rare things are. What may be inside: [what, how often]. `what` is
//   ["points", least, most]   points, in steps of ten
//   ["wear", most rare]       something to wear the student does not have yet, up to that rarity
//   ["skin", most rare]       a look for a character
//   ["concept"] / ["bg", special?] / ["theme"]   a whole theme, a background, a colour
//   ["character"]             one of the special characters
//   ["ticket", kind]          a ticket for another turn
// When there is nothing left of a kind to give, the capsule pays `again` points instead.
export const MACHINES = {
  basic: { name: "기본 캡슐", ticket: "캡슐 티켓", hearts: 10, again: 40, // not for points: it would often give back fewer than it took
    inside: [[["points", 20, 120], 55], [["wear", 2], 24], [["ticket", "basic"], 8], [["bg", false], 5], [["theme"], 4], [["skin", 2], 3], [["ticket", "gold"], 1]] },
  // The golden machine gives things only, never points (and a golden ticket now and then). When
  // there is nothing left to win it cannot be turned.
  gold: { name: "황금 캡슐", ticket: "황금 티켓", points: 600, again: 0, thingsOnly: true,
    inside: [[["wear", 3], 25], [["skin", 3], 20], [["concept"], 20], [["bg", true], 15], [["character"], 10], [["ticket", "gold"], 10]] },
};
export const MACHINE_KINDS = ["basic", "gold"];
// The rule for props (kept as new ones are added): the common and the rare ones (rare 1, 2)
// can be bought with points as well as won; the special ones (rare 3) come out of the capsule
// machines only. A new batch of props has some of each.
export const WEAR_COST = { 1: 200, 2: 400 };
export const wearSpecial = (wear) => wear.rare >= 3; // not for sale (and those with `level` are not in the machines either: a level gives them)
export const wearCost = (wear) => (wearSpecial(wear) ? null : WEAR_COST[wear.rare] || WEAR_COST[1]);
export const HEARTS_FOR_DRAW = MACHINES.basic.hearts;

// ----- levels -----
// A level is reached by words learned (the most the student has ever had learned at once).
// The first levels come quickly: one word, two, four, six… How many more words each level asks
// for: [up to this level, words]. Level 1 is where everybody starts.
const STEPS = [[3, 1], [5, 2], [7, 3], [9, 4], [14, 5], [19, 7], [29, 10], [39, 15], [50, 20]];
export const LEVEL_MAX = 50;
const NEED = [0, 0]; // NEED[level] = words learned to be at that level
for (let level = 2; level <= LEVEL_MAX; level++) NEED[level] = NEED[level - 1] + STEPS.find(([upTo]) => level <= upTo)[1];
export const needFor = (level) => NEED[Math.max(1, Math.min(LEVEL_MAX, level))];
export function levelFor(words) {
  let level = 1;
  while (level < LEVEL_MAX && words >= NEED[level + 1]) level += 1;
  return level;
}
// What reaching a level gives: a list of { points } | { ticket, n } | { item: "wear:glasses" } …
// Every fifth level has a present of its own (`big`); the others take turns: points, a ticket for the capsule machine.
const BIG = {
  5: [{ item: "wear:sproutpin" }, { ticket: "gold", n: 1 }],
  10: [{ item: "concept:candy" }, { ticket: "gold", n: 1 }],
  15: [{ item: "wear:medal" }, { ticket: "gold", n: 2 }],
  20: [{ item: "skin:bubble-star" }, { ticket: "gold", n: 2 }],
  25: [{ item: "concept:sakura" }, { ticket: "gold", n: 2 }],
  30: [{ item: "wear:explorerhat" }, { ticket: "gold", n: 3 }],
  35: [{ item: "wear:wings" }, { points: 500 }],
  40: [{ item: "concept:aurora" }, { ticket: "gold", n: 3 }],
  45: [{ item: "wear:goldwings" }, { ticket: "gold", n: 5 }],
  50: [{ item: "skin:bubble-gold" }, { ticket: "gold", n: 5 }, { points: 1000 }],
};
export function levelGift(level) {
  if (level < 2 || level > LEVEL_MAX) return { big: false, gifts: [] };
  if (BIG[level]) return { big: true, gifts: BIG[level] };
  if (level % 2 === 0) return { big: false, gifts: [{ points: Math.min(300, 30 + level * 5) }] };
  return { big: false, gifts: [{ ticket: "basic", n: level % 5 === 3 && level > 3 ? 2 : 1 }] };
}
