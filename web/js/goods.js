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
  { id: "rainbow", name: "무지개 젤리", cost: 1500, special: true, added: 20,
    vars: { bg: "#ffffff", surface: "#f6f3ff", text: "#2a2350", muted: "#6f6a94", line: "#ebe6fb", border: "#d9d1f7", accent: "#7a5cff", "accent-dark": "#5f43e0", "accent-soft": "#efeaff", lime: "#9af0c4", good: "#1f8a5c", "good-soft": "#e1f8ec", bad: "#5f43e0", "bad-soft": "#efeaff" } },
];
export const conceptById = (id) => CONCEPTS.find((x) => x.id === id) || CONCEPTS[0];

// ----- things to wear -----
// slot: only one thing of a slot is worn at a time (head, eyes, cheek, hand, neck, back, aura). layer "back" is drawn behind the body.
// rare: 1 common, 2 rare, 3 very rare (which machine it comes out of, and how often).
const stroke = (d, colour, width = 2.6) => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const star = (x, y, r, fill) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, d = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * d).toFixed(1)} ${(y + Math.sin(a) * d).toFixed(1)}`;
  });
  return `<path d="M${points.join(" L")} z" fill="${fill}"/>`;
};
const twinkle = (x, y, r, fill) => `<path d="M${x} ${y - r} q${r * 0.2} ${r * 0.8} ${r} ${r} q-${r * 0.8} ${r * 0.2} -${r} ${r} q-${r * 0.2} -${r * 0.8} -${r} -${r} q${r * 0.8} -${r * 0.2} ${r} -${r} z" fill="${fill}"/>`;
const heart = (x, y, s, fill, more = "") => `<path d="M${x} ${y + s} l-${s} -${s} a${s * 0.56} ${s * 0.56} 0 0 1 ${s} -${s * 0.56} a${s * 0.56} ${s * 0.56} 0 0 1 ${s} ${s * 0.56} z" fill="${fill}"${more}/>`;

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
export const SLOTS = [["head", "머리"], ["eyes", "눈"], ["cheek", "볼"], ["hand", "손"], ["neck", "목"], ["back", "몸"], ["aura", "주변"]];
export const wearById = (id) => WEARS.find((x) => x.id === id);

// ----- another look for one character -----
// paint: what replaces the character's own colours and drawings (see characters.js for the fields).
const ears = (fill, inner) => `<circle cx="72" cy="56" r="12" fill="${fill}"/><circle cx="128" cy="56" r="12" fill="${fill}"/><circle cx="72" cy="56" r="6" fill="${inner}"/><circle cx="128" cy="56" r="6" fill="${inner}"/>`;
export const SKINS = [
  { id: "candy", of: "bubble", name: "솜사탕 말풍이", rare: 2, paint: { fill: "#ffd6e8", stroke: "#f092bd", limb: "#e0569a" } },
  { id: "gold", of: "bubble", name: "황금 말풍이", rare: 3, paint: { fill: "#ffe08a", stroke: "#e0a82e", limb: "#c98a14" } },
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
  basic: { name: "캡슐 뽑기", ticket: "뽑기권", hearts: 10, again: 40, // not for points: it would often give back fewer than it took
    inside: [[["points", 20, 120], 55], [["wear", 2], 24], [["ticket", "basic"], 8], [["bg", false], 5], [["theme"], 4], [["skin", 2], 3], [["ticket", "gold"], 1]] },
  // The golden machine gives things only, never points (and a golden ticket now and then). When
  // there is nothing left to win it cannot be turned.
  gold: { name: "황금 뽑기", ticket: "황금 뽑기권", points: 600, again: 0, thingsOnly: true,
    inside: [[["wear", 3], 25], [["skin", 3], 20], [["concept"], 20], [["bg", true], 15], [["character"], 10], [["ticket", "gold"], 10]] },
};
export const MACHINE_KINDS = ["basic", "gold"];
// The rule for props (kept as new ones are added): the common and the rare ones (rare 1, 2)
// can be bought with points as well as won; the special ones (rare 3) come out of the capsule
// machines only. A new batch of props has some of each.
export const WEAR_COST = { 1: 200, 2: 400 };
export const wearSpecial = (wear) => wear.rare >= 3;
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
  5: [{ ticket: "gold", n: 1 }, { item: "wear:glasses" }],
  10: [{ item: "concept:candy" }, { ticket: "gold", n: 1 }],
  15: [{ ticket: "gold", n: 2 }],
  20: [{ item: "skin:bubble-candy" }, { ticket: "gold", n: 2 }],
  25: [{ item: "bg:aurora" }, { ticket: "gold", n: 2 }],
  30: [{ ticket: "gold", n: 3 }, { item: "wear:wand" }],
  35: [{ item: "wear:wings" }, { points: 500 }],
  40: [{ item: "concept:space" }, { ticket: "gold", n: 3 }],
  45: [{ ticket: "gold", n: 5 }],
  50: [{ item: "skin:bubble-gold" }, { ticket: "gold", n: 5 }, { points: 1000 }],
};
export function levelGift(level) {
  if (level < 2 || level > LEVEL_MAX) return { big: false, gifts: [] };
  if (BIG[level]) return { big: true, gifts: BIG[level] };
  if (level % 2 === 0) return { big: false, gifts: [{ points: Math.min(300, 30 + level * 5) }] };
  return { big: false, gifts: [{ ticket: "basic", n: level % 5 === 3 && level > 3 ? 2 : 1 }] };
}
