import { stroke, twinkle } from "./wear-art.js?v=0.1.28-tp832y";
// More things for the head (hats and hair). Rule: rare 1 (200 points) and rare 2 (400 points) can be bought; rare 3 comes from capsules only.

// A thin band of hair lying along the top of the head (used by the hairstyles below).
const hairCap = (fill, line) => `<path d="M72 62 q4 -14 28 -14 q24 0 28 14 q-28 -10 -56 0 z" fill="${fill}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/>`;
// One tapered lock of tall hair: base centred on x = base at y 58, tip at (tipX, tipY).
const lock = ([base, tipX, tipY, fill, line]) => `<path d="M${base - 7} 58 Q${base - 14} ${tipY + 18} ${tipX} ${tipY} Q${base + 14} ${tipY + 18} ${base + 7} 58 z" fill="${fill}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;

export const HEAD_WEARS = [
  // tall, fluffy, upswept hair
  { id: "tallpink", name: "솟은 분홍 머리", tr: ["Tall pink hair", "冲天粉色头发"], slot: "head", rare: 2, added: 22,
    art: `<path d="M76 58 q-4 -20 6 -32 q2 8 6 10 q0 -22 12 -32 q2 12 8 18 q4 -8 3 -14 q14 16 11 30 q4 8 2 20 q-24 -9 -48 0 z" fill="#ff5fa8" stroke="#d63d86" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M92 49 q-2 -14 4 -26 M107 49 q4 -12 0 -22", "#d63d86", 2) + stroke("M82 44 q0 -6 2 -9", "rgba(255,255,255,.7)", 2.2) },
  { id: "tallsky", name: "솟은 하늘 머리", tr: ["Tall sky hair", "冲天天蓝头发"], slot: "head", rare: 2, added: 22,
    art: `<path d="M76 58 q-2 -22 8 -34 q6 -14 18 -18 q6 0 4 6 q8 6 12 18 q6 12 6 28 q-24 -9 -48 0 z" fill="#6cc4f5" stroke="#3a94d0" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M88 50 q0 -16 10 -30 M100 49 q3 -13 1 -25 M112 50 q1 -13 -5 -23", "#3a94d0", 2) + stroke("M82 42 q1 -8 5 -13", "rgba(255,255,255,.7)", 2.2) },
  { id: "tallrainbow", name: "무지개 솟은 머리", tr: ["Rainbow hair", "冲天彩虹头发"], slot: "head", rare: 3, added: 22,
    art: [[82, 80, 24, "#ff6b6b", "#d94a4a"], [118, 120, 24, "#6cb8f5", "#3a8ad0"], [91, 90, 13, "#ffb347", "#e08a1e"], [109, 110, 13, "#7ccf6b", "#4f9a58"], [100, 100, 5, "#ffe066", "#e0b020"]].map(lock).join("") + twinkle(132, 22, 3.4, "#fff") },
  // hair
  { id: "twinbuns", name: "만두머리", tr: ["Twin buns", "丸子头"], slot: "head", rare: 1, added: 22,
    art: `<g fill="#7a4a2e" stroke="#55301a" stroke-width="2.2"><circle cx="74" cy="49" r="11"/><circle cx="126" cy="49" r="11"/></g>` + hairCap("#7a4a2e", "#55301a") + `<circle cx="81" cy="57" r="2.6" fill="#ff8fb8"/><circle cx="119" cy="57" r="2.6" fill="#ff8fb8"/>` },
  { id: "ponytail", name: "묶은 머리", tr: ["Ponytail", "马尾辫"], slot: "head", rare: 1, added: 22,
    art: `<path d="M126 52 q16 -8 22 6 q4 12 -4 26 q-2 -12 -8 -16 q-6 -6 -10 -16 z" fill="#f2a03d" stroke="#c9781e" stroke-width="2.2" stroke-linejoin="round"/>` + hairCap("#f2a03d", "#c9781e") + `<circle cx="128" cy="55" r="3.6" fill="#ff5c8a" stroke="#d63d73" stroke-width="1.4"/>` },
  { id: "bobhair", name: "단발머리", tr: ["Bob hair", "波波头"], slot: "head", rare: 1, added: 22,
    art: `<path d="M64 72 q-4 -27 36 -27 q40 0 36 27 q-5 2 -9 -2 q-1 -13 -27 -15 q-26 2 -27 15 q-4 4 -9 2 z" fill="#4a4460" stroke="#2f2a45" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M84 51 q8 -2.5 16 -2.5", "rgba(255,255,255,.55)", 2) },
  // hats
  { id: "chefhat", name: "요리사 모자", tr: ["Chef hat", "厨师帽"], slot: "head", rare: 1, added: 22,
    art: `<path d="M80 46 q-12 -4 -8 -16 q4 -10 14 -8 q4 -10 14 -10 q10 0 14 10 q10 -2 14 8 q4 12 -8 16 z" fill="#fff" stroke="#aab3c8" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M91 43 v-8 M109 43 v-8", "#cfd5e2", 2) + `<rect x="78" y="44" width="44" height="13" rx="3" fill="#fff" stroke="#aab3c8" stroke-width="2.2"/>` },
  { id: "strawhat", name: "밀짚모자", tr: ["Straw hat", "草帽"], slot: "head", rare: 1, added: 22,
    art: `<path d="M80 56 q2 -22 20 -22 q18 0 20 22 z" fill="#f6d98a" stroke="#d0a440" stroke-width="2.2" stroke-linejoin="round"/><path d="M58 57 q42 -11 84 0 q-42 11 -84 0 z" fill="#f2cc6e" stroke="#d0a440" stroke-width="2" stroke-linejoin="round"/>` + stroke("M82 49 q18 -4 36 0", "#ff8fb8", 4) },
  { id: "piratehat", name: "해적 모자", tr: ["Pirate hat", "海盗帽"], slot: "head", rare: 3, added: 22,
    art: `<path d="M66 56 q4 -14 16 -14 q4 -16 18 -16 q14 0 18 16 q12 0 16 14 q-34 -8 -68 0 z" fill="#3b3550" stroke="#26213a" stroke-width="2.4" stroke-linejoin="round"/>` + stroke("M73 51 q27 -6 54 0", "#ffd84d", 2.2) + `<circle cx="100" cy="38" r="5.5" fill="#fff"/><circle cx="98" cy="38" r="1.2" fill="#26213a"/><circle cx="102" cy="38" r="1.2" fill="#26213a"/>` },
  // headbands and other things
  { id: "catears", name: "고양이 귀", tr: ["Cat ears", "猫耳发箍"], slot: "head", rare: 1, added: 22,
    art: stroke("M72 62 q28 -22 56 0", "#d98a3a", 3.5) + `<path d="M78 54 l2 -18 l16 10 z M122 54 l-2 -18 l-16 10 z" fill="#ffb36b" stroke="#d98a3a" stroke-width="2.2" stroke-linejoin="round"/><path d="M82 49 l1 -8 l7 5 z M118 49 l-1 -8 l-7 5 z" fill="#ffd9e6"/>` },
  { id: "bunnyears", name: "토끼 귀", tr: ["Bunny ears", "兔耳发箍"], slot: "head", rare: 2, added: 22,
    art: stroke("M72 62 q28 -22 56 0", "#e58fb0", 3.5) + `<path d="M84 52 q-10 -30 -2 -40 q10 6 12 38 z M116 52 q10 -30 2 -40 q-10 6 -12 38 z" fill="#fff7fa" stroke="#e58fb0" stroke-width="2.2" stroke-linejoin="round"/><path d="M86 46 q-5 -20 -2 -27 q5 6 6 26 z M114 46 q5 -20 2 -27 q-5 6 -6 26 z" fill="#ffc2d8"/>` },
  { id: "headphones", name: "헤드폰", tr: ["Headphones", "耳机"], slot: "head", rare: 2, added: 22,
    art: stroke("M66 76 q-2 -30 34 -30 q36 0 34 30", "#5a6078", 4) + `<g fill="#ff7a59" stroke="#d9552f" stroke-width="2.2"><rect x="57" y="68" width="12" height="24" rx="6"/><rect x="131" y="68" width="12" height="24" rx="6"/></g>` },
  { id: "flowercrown", name: "화관", tr: ["Flower crown", "花环"], slot: "head", rare: 2, added: 22,
    art: stroke("M74 59 q26 -13 52 0", "#4f9a58", 3) + [[78, 56, "#ff8fb8", "#e0569a"], [89, 52, "#fff", "#c9b8e8"], [100, 50.5, "#b99cf0", "#8a6fd0"], [111, 52, "#fff", "#c9b8e8"], [122, 56, "#ff8fb8", "#e0569a"]].map(([x, y, fill, line]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${fill}" stroke="${line}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="2" fill="#ffd84d"/>`).join("") },
  { id: "halo", name: "천사 고리", tr: ["Halo", "天使光环"], slot: "head", rare: 3, added: 22,
    art: `<ellipse cx="100" cy="36" rx="20" ry="6" fill="none" stroke="#e0a82e" stroke-width="6.5"/><ellipse cx="100" cy="36" rx="20" ry="6" fill="none" stroke="#ffe37a" stroke-width="3.2"/>` + twinkle(128, 26, 3.2, "#fff3b0") + twinkle(74, 28, 2.4, "#fff3b0") },
];
