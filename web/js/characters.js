// Mascot characters a student can buy with word points and switch between in Settings.
// All share one drawing style and one skeleton (see mascot.js): a simple body, thin arms and legs,
// the same face and the same animations. A character only supplies its silhouette, colours and
// a few decorations, all in the 200 x 150 drawing space (the face sits around x 100, y 84).
//
//   body    outline of the body            fill / stroke   its colours
//   limb    colour of the arms and legs    back            drawn behind the body (tails, fins)
//   deco    drawn on the body, under the face              topper  drawn on top (hats, antennas)
//   tiles   the three things it juggles    noLegs          it floats
//   group   the grades it was designed for (anyone may buy any)   vibe  its personality
// Names, groups and vibes are Korean keys for i18n.
import { MORE_CHARACTERS } from "./characters-more.js?v=0.1.23-tow19a";

export const DEFAULT_CHARACTER = "bubble";

export const CHARACTERS = [
  // The original: a speech bubble with a sprout. Its colours follow the theme (set in app.css).
  {
    id: "bubble", name: "말풍이", group: "", vibe: "귀여움", cost: 0,
    body: "M88 50 h24 a26 26 0 0 1 26 26 v10 a26 26 0 0 1 -26 26 h-20 l-14 12 l2 -13 a26 26 0 0 1 -18 -25 v-10 a26 26 0 0 1 26 -26 z",
    deco: '<path class="m-shine" d="M80 60 q10 -7 22 -6"/>',
    topper: '<path class="m-sprout" d="M100 50 v-9 M100 43 q-9 -8 -13 0 q7 5 13 0 M100 43 q9 -8 13 0 q-7 5 -13 0"/>',
  },

  // ----- G3–4: soft and sweet -----
  {
    id: "rabbit", name: "토토", group: "G3–4", vibe: "귀여움", cost: 150,
    body: "M100 54 a34 30 0 0 1 34 30 a28 28 0 0 1 -28 28 h-12 a28 28 0 0 1 -28 -28 a34 30 0 0 1 34 -30 z",
    fill: "#fff7f9", stroke: "#f3c4d0", limb: "#e79ab0", tiles: ["♥", "가", "A"],
    back: '<path d="M86 62 q-12 -32 -1 -40 q11 8 8 38 z M114 62 q12 -32 1 -40 q-11 8 -8 38 z" fill="#fff7f9" stroke="#f3c4d0" stroke-width="2.5" stroke-linejoin="round"/><path d="M86 54 q-6 -18 -1 -24 M114 54 q6 -18 1 -24" fill="none" stroke="#ffb3c7" stroke-width="4" stroke-linecap="round"/>',
  },
  {
    id: "mushroom", name: "송이", group: "G3–4", vibe: "귀여움", cost: 250,
    body: "M74 70 h52 v32 a10 10 0 0 1 -10 10 h-32 a10 10 0 0 1 -10 -10 z",
    fill: "#fff3e0", stroke: "#e8d5b5", limb: "#d9b98a",
    topper: '<path d="M58 72 a42 30 0 0 1 84 0 q0 6 -8 6 h-68 q-8 0 -8 -6 z" fill="#ff6b6b"/><circle cx="80" cy="58" r="5" fill="#fff"/><circle cx="104" cy="52" r="6" fill="#fff"/><circle cx="124" cy="63" r="4" fill="#fff"/>',
  },
  {
    id: "pudding", name: "푸딩이", group: "G3–4", vibe: "귀여움", cost: 200,
    body: "M76 56 h48 q6 0 8 6 l10 42 q2 8 -8 8 h-68 q-10 0 -8 -8 l10 -42 q2 -6 8 -6 z",
    fill: "#ffe9a8", limb: "#d9a441",
    deco: '<path d="M74 61 q2 -5 8 -5 h36 q6 0 8 5 l2 9 q-7 6 -13 0 q-7 6 -13 0 q-7 6 -13 0 q-7 6 -13 0 z" fill="#b5651d"/>',
    topper: '<path d="M100 52 q2 -8 9 -9" fill="none" stroke="#3e9c5b" stroke-width="2.4" stroke-linecap="round"/><circle cx="100" cy="51" r="6" fill="#ff5d6c"/>',
  },
  {
    id: "dino", name: "다이노", group: "G3–4", vibe: "멋짐", cost: 400,
    body: "M88 50 h24 a26 26 0 0 1 26 26 v14 a22 22 0 0 1 -22 22 h-32 a22 22 0 0 1 -22 -22 v-14 a26 26 0 0 1 26 -26 z",
    fill: "#7ed492", limb: "#3fa55e", tiles: ["A", "가", "ㄱ"],
    back: '<path d="M134 92 q20 4 24 -12 q0 18 -22 26 z" fill="#7ed492"/><path d="M82 52 l7 -11 l7 10 z M96 50 l7 -12 l7 11 z M110 52 l7 -10 l6 11 z" fill="#3fa55e"/>',
    deco: '<ellipse cx="100" cy="102" rx="17" ry="8" fill="#d9f5df"/>',
  },

  // ----- G5–6: playful and silly -----
  {
    id: "donut", name: "도넛", group: "G5–6", vibe: "귀여움", cost: 250,
    body: "M64 82 a36 32 0 1 0 72 0 a36 32 0 1 0 -72 0 z",
    fill: "#e9b872", limb: "#c48a3f", tiles: ["♥", "가", "A"],
    deco: '<path d="M66.6 70 A36 32 0 0 1 133.4 70 q-5 9 -11 1 q-5 9 -11 1 q-6 9 -11.4 0 q-6 9 -11 0 q-5 9 -11 0 q-6 8 -11.4 -2 z" fill="#ff9ec4"/><path d="M84 58 l5 -3 M100 54 l1 -6 M114 60 l5 3 M92 66 l-5 -2 M108 66 l5 -3" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M76 66 l3 -5 M124 66 l-2 -5 M100 62 l4 3" fill="none" stroke="#7ad3ff" stroke-width="2.6" stroke-linecap="round"/>',
  },
  {
    id: "rocket", name: "슝이", group: "G5–6", vibe: "멋짐", cost: 450,
    body: "M100 40 q30 20 30 52 v8 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 v-8 q0 -32 30 -52 z",
    fill: "#f4f6fb", stroke: "#c9cfdd", limb: "#8b93a7", tiles: ["3", "2", "1"],
    back: '<path d="M72 90 l-16 22 h18 z M128 90 l16 22 h-18 z" fill="#ff5d5d"/><path d="M90 110 q10 24 20 0 z" fill="#ffb02e"/>',
    deco: '<path d="M100 40 q15 10 23 25 h-46 q8 -15 23 -25 z" fill="#ff5d5d"/>',
  },
  {
    id: "octopus", name: "먹물이", group: "G5–6", vibe: "엽기", cost: 350,
    body: "M100 48 a36 34 0 0 1 36 34 v18 a8 8 0 0 1 -16 0 a8 8 0 0 1 -16 0 a4 4 0 0 1 -8 0 a8 8 0 0 1 -16 0 a8 8 0 0 1 -16 0 v-18 a36 34 0 0 1 36 -34 z",
    fill: "#ff8fb1", limb: "#e0567f", tiles: ["~", "가", "A"],
    deco: '<circle cx="78" cy="62" r="3.5" fill="#ffc2d4"/><circle cx="122" cy="60" r="4.5" fill="#ffc2d4"/><circle cx="112" cy="54" r="2.5" fill="#ffc2d4"/>',
  },
  {
    id: "poop", name: "응가", group: "G5–6", vibe: "엽기", cost: 300,
    body: "M100 42 q11 4 8 15 q19 2 16 19 q17 4 13 22 q-2 14 -19 14 h-36 q-17 0 -19 -14 q-4 -18 13 -22 q-3 -17 16 -19 q-3 -11 8 -15 z",
    fill: "#b07a52", limb: "#7a4e33", tiles: ["?", "!", "가"],
    deco: '<path d="M84 60 q16 5 32 0" fill="none" stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"/>',
    topper: '<path d="M136 46 q6 -6 10 0 M146 46 q5 -4 8 2" fill="none" stroke="#8a8a8a" stroke-width="2" stroke-linecap="round"/><circle cx="145" cy="50" r="3" fill="#555"/>',
  },

  // ----- G7–8: quirky -----
  {
    id: "cactus", name: "따끔이", group: "G7–8", vibe: "쿨함", cost: 400,
    body: "M100 44 a30 30 0 0 1 30 30 v26 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 v-26 a30 30 0 0 1 30 -30 z",
    fill: "#62c07d", limb: "#3e9c5b",
    deco: '<path d="M84 56 l-5 -4 M116 56 l5 -4 M76 102 l-5 2 M124 102 l5 2 M92 49 l-2 -5" fill="none" stroke="#2f7d47" stroke-width="2.2" stroke-linecap="round"/>',
    topper: '<circle cx="112" cy="45" r="7" fill="#ff8fab"/><circle cx="112" cy="45" r="2.6" fill="#ffd166"/>',
  },
  {
    id: "ghost", name: "부우", group: "G7–8", vibe: "엽기", cost: 600, noLegs: true,
    body: "M100 46 a34 34 0 0 1 34 34 v36 l-11 -9 l-11 9 l-12 -9 l-12 9 l-11 -9 l-11 9 v-36 a34 34 0 0 1 34 -34 z",
    fill: "#f3f0ff", stroke: "#cfc7f2", limb: "#b9b0e6", tiles: ["!", "가", "A"],
  },
  {
    id: "cat", name: "냥냥이", group: "G7–8", vibe: "귀여움", cost: 500,
    body: "M72 60 l2 -18 l16 10 q10 -3 20 0 l16 -10 l2 18 q10 10 10 26 a26 26 0 0 1 -26 26 h-24 a26 26 0 0 1 -26 -26 q0 -16 10 -26 z",
    fill: "#ffbe73", limb: "#e08a2e", tiles: ["♥", "가", "A"],
    back: '<path d="M134 104 q20 -2 15 -24" fill="none" stroke="#e08a2e" stroke-width="5" stroke-linecap="round"/>',
    deco: '<path d="M78 56 l1 -8 l7 5 z M122 56 l-1 -8 l-7 5 z" fill="#ff8fab"/><path d="M68 91 h-10 M69 96 l-9 3 M132 91 h10 M131 96 l9 3" fill="none" stroke="#b56a1d" stroke-width="1.8" stroke-linecap="round"/>',
  },
  {
    id: "robot", name: "삐빅", group: "G7–8", vibe: "멋짐", cost: 700,
    body: "M72 52 h56 a8 8 0 0 1 8 8 v44 a8 8 0 0 1 -8 8 h-56 a8 8 0 0 1 -8 -8 v-44 a8 8 0 0 1 8 -8 z",
    fill: "#a6d8ea", limb: "#5a8fa3", tiles: ["0", "1", "?"],
    deco: '<circle cx="71" cy="60" r="2.6" fill="#5a8fa3"/><circle cx="129" cy="60" r="2.6" fill="#5a8fa3"/><path d="M90 104 h20" fill="none" stroke="#5a8fa3" stroke-width="2.4" stroke-linecap="round"/>',
    topper: '<path d="M100 52 v-11" fill="none" stroke="#5a8fa3" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="39" r="4.5" fill="#ff5d5d"/>',
  },

  // ----- G9–10: cool -----
  {
    id: "icecream", name: "콘이", group: "G9–10", vibe: "귀여움", cost: 500,
    body: "M100 46 a34 34 0 0 1 34 34 q0 10 -6 16 h-56 q-6 -6 -6 -16 a34 34 0 0 1 34 -34 z M78 96 h44 l-4 12 a5 5 0 0 1 -5 4 h-26 a5 5 0 0 1 -5 -4 z",
    fill: "#b8f0d8", limb: "#6fcfae", tiles: ["♥", "가", "A"],
    deco: '<path d="M78 96 h44 l-4 12 a5 5 0 0 1 -5 4 h-26 a5 5 0 0 1 -5 -4 z" fill="#e0a85a"/><path d="M84 97 l8 14 M96 97 l8 14 M108 97 l6 11 M116 97 l-8 14 M104 97 l-8 14 M92 97 l-6 11" fill="none" stroke="#c48a3f" stroke-width="1.4"/><path d="M76 62 q8 -12 22 -13" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>',
    topper: '<path d="M104 44 q2 -8 9 -9" fill="none" stroke="#3e9c5b" stroke-width="2.4" stroke-linecap="round"/><circle cx="104" cy="44" r="6" fill="#ff5d6c"/>',
  },
  {
    id: "penguin", name: "펭펭", group: "G9–10", vibe: "쿨함", cost: 800,
    body: "M100 46 a32 32 0 0 1 32 32 v12 a22 22 0 0 1 -22 22 h-20 a22 22 0 0 1 -22 -22 v-12 a32 32 0 0 1 32 -32 z",
    fill: "#2f3447", limb: "#2f3447", tiles: ["*", "가", "A"],
    deco: '<path d="M100 64 a24 22 0 0 1 24 22 v6 a16 16 0 0 1 -16 16 h-16 a16 16 0 0 1 -16 -16 v-6 a24 22 0 0 1 24 -22 z" fill="#fff"/><path d="M82 104 q18 8 36 0" fill="none" stroke="#e04848" stroke-width="5" stroke-linecap="round"/><path d="M114 105 l6 10 M118 104 l10 6" fill="none" stroke="#e04848" stroke-width="4" stroke-linecap="round"/>',
  },
  {
    id: "bulb", name: "반짝이", group: "G9–10", vibe: "멋짐", cost: 650,
    body: "M100 44 a30 30 0 0 1 22 50 q-4 4 -4 10 v2 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 v-2 q0 -6 -4 -10 a30 30 0 0 1 22 -50 z",
    fill: "#fff3a6", stroke: "#f0d552", limb: "#c9a300", tiles: ["!", "가", "A"],
    deco: '<path d="M85 104 h30 M87 109 h26" fill="none" stroke="#9a9a9a" stroke-width="2.6" stroke-linecap="round"/>',
    topper: '<path d="M100 37 v-7 M72 46 l-6 -5 M128 46 l6 -5" fill="none" stroke="#ffc12b" stroke-width="3" stroke-linecap="round"/>',
  },
  {
    id: "ninja", name: "쉿", group: "G9–10", vibe: "쿨함", cost: 1000,
    body: "M100 48 a34 32 0 0 1 34 32 v8 a24 24 0 0 1 -24 24 h-20 a24 24 0 0 1 -24 -24 v-8 a34 32 0 0 1 34 -32 z",
    fill: "#3b3f52", limb: "#2a2d3b", tiles: ["✦", "가", "A"],
    back: '<path d="M132 66 l16 -7 M132 69 l14 5" fill="none" stroke="#e04848" stroke-width="4.5" stroke-linecap="round"/>',
    deco: '<path d="M68 74 h64 q2 12 0 24 h-64 q-2 -12 0 -24 z" fill="#f6d7b8"/><path d="M67 68 h66" fill="none" stroke="#e04848" stroke-width="5.5" stroke-linecap="round"/>',
  },

  // ----- G11–12: witty -----
  {
    id: "macaron", name: "마카롱", group: "G11–12", vibe: "멋짐", cost: 800,
    body: "M76 52 h48 a14 14 0 0 1 14 14 v32 a14 14 0 0 1 -14 14 h-48 a14 14 0 0 1 -14 -14 v-32 a14 14 0 0 1 14 -14 z",
    fill: "#d9b8ff", limb: "#a57ee0", tiles: ["♥", "가", "A"],
    deco: '<path d="M62 74 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0 q2 -2 4 -1 v16 q-2 1 -4 -1 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 q-4 4 -8 0 z" fill="#fff5e6"/><path d="M78 60 q10 -4 22 -4" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6"/>',
  },
  {
    id: "coffee", name: "라떼", group: "G11–12", vibe: "쿨함", cost: 600,
    body: "M72 58 h56 l-6 50 a6 6 0 0 1 -6 4 h-32 a6 6 0 0 1 -6 -4 z",
    fill: "#f5ece0", stroke: "#d9c7b0", limb: "#6b4a3a", tiles: ["Z", "가", "A"],
    deco: '<path d="M74 74 h52 l-3 26 h-46 z" fill="#d2a679"/>',
    topper: '<path d="M68 50 h64 a4 4 0 0 1 4 4 v5 h-72 v-5 a4 4 0 0 1 4 -4 z" fill="#6b4a3a"/><path d="M92 44 q-4 -6 0 -11 M108 44 q4 -6 0 -11" fill="none" stroke="#b8b8b8" stroke-width="2.6" stroke-linecap="round"/>',
  },
  {
    id: "book", name: "북스", group: "G11–12", vibe: "멋짐", cost: 900,
    body: "M70 52 h56 a6 6 0 0 1 6 6 v48 a6 6 0 0 1 -6 6 h-56 a6 6 0 0 1 -6 -6 v-48 a6 6 0 0 1 6 -6 z",
    fill: "#9dbcff", limb: "#4a76d4", tiles: ["A", "가", "Z"],
    deco: '<path d="M73 54 v56" fill="none" stroke="#4a76d4" stroke-width="5" stroke-linecap="round"/><path d="M128 60 v44" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
    topper: '<path d="M112 50 v18 l-5.5 -4.5 l-5.5 4.5 v-18 z" fill="#ff5d5d"/>',
  },
  {
    id: "skull", name: "본즈", group: "G11–12", vibe: "엽기", cost: 1500, special: true,
    body: "M100 46 a36 34 0 0 1 36 34 q0 12 -8 18 v8 a6 6 0 0 1 -6 6 h-44 a6 6 0 0 1 -6 -6 v-8 q-8 -6 -8 -18 a36 34 0 0 1 36 -34 z",
    fill: "#f6f3ec", stroke: "#cfc8b8", limb: "#a39d8f", tiles: ["?", "!", "가"],
    deco: '<path d="M88 104 v8 M96 104 v8 M104 104 v8 M112 104 v8" fill="none" stroke="#b9b3a6" stroke-width="2"/>',
    topper: '<path d="M114 50 l-5 8 l7 4 l-3 6" fill="none" stroke="#b9b3a6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
];

// Sixty more, sorted by kind (see characters-more.js).
CHARACTERS.push(...MORE_CHARACTERS);

export const characterById = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
