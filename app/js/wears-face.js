import { stroke, star, twinkle, heart } from "./wear-art.js";
// More things for the eyes and the cheeks. Rule: rare 1 (200 points) and rare 2 (400 points) can be bought; rare 3 comes from capsules only.

// The outline of a chunky five-pointed star (for star-shaped lenses).
const starOutline = (x, y, r) => "M" + Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2, d = i % 2 ? r * 0.56 : r;
  return `${(x + Math.cos(a) * d).toFixed(1)} ${(y + Math.sin(a) * d).toFixed(1)}`;
}).join(" L") + " z";
// Six round petals around a lens.
const petals = (x, y, fill) => [0, 60, 120, 180, 240, 300].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return `<circle cx="${(x + Math.sin(a) * 8.5).toFixed(1)}" cy="${(y - Math.cos(a) * 8.5).toFixed(1)}" r="4.4" fill="${fill}"/>`;
}).join("");
const dots = (list, r, fill) => list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join("");

export const FACE_WEARS = [
  // ----- on the eyes -----
  { id: "squareglasses", name: "네모 안경", tr: ["Square glasses", "方框眼镜"], slot: "eyes", rare: 1, added: 22,
    art: `<g fill="rgba(255,255,255,.25)" stroke="#3a6fd0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="76.5" y="73.5" width="19" height="17" rx="3"/><rect x="104.5" y="73.5" width="19" height="17" rx="3"/><path d="M95.5 81 h9 M76.5 79 l-7 -3 M123.5 79 l7 -3" fill="none"/></g>` },
  { id: "cateyeglasses", name: "고양이 안경", tr: ["Cat-eye glasses", "猫眼眼镜"], slot: "eyes", rare: 1, added: 22,
    art: `<path d="M71 71 q7 0 11 3 h10 q4 0 4 4 v4 q0 9 -9 9 h-2 q-9 0 -9 -9 v-3 q0 -4 -5 -8 z M129 71 q-7 0 -11 3 h-10 q-4 0 -4 4 v4 q0 9 9 9 h2 q9 0 9 -9 v-3 q0 -4 5 -8 z" fill="rgba(255,143,184,.25)" stroke="#d63d73" stroke-width="2.4" stroke-linejoin="round"/>` + stroke("M96 79 h8", "#d63d73", 2.4) },
  { id: "monocle", name: "외알 안경", tr: ["Monocle", "单片眼镜"], slot: "eyes", rare: 1, added: 22,
    art: `<circle cx="114" cy="82" r="10" fill="rgba(255,255,255,.25)" stroke="#c9962e" stroke-width="2.6"/>` + stroke("M121 89.5 q8 9 4 20", "#c9962e", 1.4) + stroke("M108 78 l4 -3", "rgba(255,255,255,.8)", 1.6) },
  { id: "swimgoggles", name: "물안경", tr: ["Swim goggles", "泳镜"], slot: "eyes", rare: 1, added: 22,
    art: stroke("M65 82 h11 M124 82 h11", "#2a8fd0", 4) + `<g fill="rgba(120,210,255,.3)" stroke="#2a8fd0" stroke-width="2.6"><ellipse cx="86" cy="82" rx="10" ry="8.5"/><ellipse cx="114" cy="82" rx="10" ry="8.5"/></g>` + stroke("M96 81 q4 -3 8 0", "#2a8fd0", 2.6) + stroke("M79.5 79.5 l4 -2.5", "rgba(255,255,255,.8)", 1.6) },
  { id: "threedglasses", name: "3D 안경", tr: ["3D glasses", "3D眼镜"], slot: "eyes", rare: 1, added: 22,
    art: `<g stroke="#3b3550" stroke-width="2.6" stroke-linejoin="round"><rect x="76" y="74" width="20" height="16" rx="2" fill="rgba(255,70,70,.3)"/><rect x="104" y="74" width="20" height="16" rx="2" fill="rgba(60,140,255,.3)"/></g>` + stroke("M96 80 h8 M76 79 l-7 -3 M124 79 l7 -3", "#3b3550") },
  { id: "eyepatch", name: "해적 안대", tr: ["Pirate patch", "海盗眼罩"], slot: "eyes", rare: 1, added: 22,
    art: stroke("M66 72 L78 77 M95 77 L134 70", "#2b2840", 2) + `<path d="M77 76 h18 v6 q0 10 -9 10 q-9 0 -9 -10 z" fill="#2b2840" stroke="#2b2840" stroke-width="1.6" stroke-linejoin="round"/>` + stroke("M81 80.5 l4 -1.5", "rgba(255,255,255,.5)", 1.6) },
  { id: "sleepmask", name: "수면 안대", tr: ["Sleep mask", "睡眠眼罩"], slot: "eyes", rare: 1, added: 22,
    art: stroke("M72 67 l-6 2 M128 67 l6 2", "#6a6fd0", 2.4) + `<path d="M72 64 q28 -5 56 0 q3 5 -2 9 q-10 3 -20 -1 q-6 -3 -12 0 q-10 4 -20 1 q-5 -4 -2 -9 z" fill="#9aa5ff" stroke="#6a6fd0" stroke-width="1.8" stroke-linejoin="round"/>` + stroke("M80 67 q4 3 8 0 M112 67 q4 3 8 0", "#4a4fa8", 1.6) },
  { id: "eyelashes", name: "긴 속눈썹", tr: ["Long lashes", "长睫毛"], slot: "eyes", rare: 1, added: 22,
    art: stroke("M84.5 77 l-1.5 -4.5 M82 78 l-3.5 -3.5 M80.5 80.5 l-4.5 -2 M115.5 77 l1.5 -4.5 M118 78 l3.5 -3.5 M119.5 80.5 l4.5 -2", "#3b3550", 1.8) },
  { id: "starglasses", name: "별 안경", tr: ["Star glasses", "星星眼镜"], slot: "eyes", rare: 2, added: 22,
    art: `<path d="${starOutline(86, 82.5, 11.5)} ${starOutline(114, 82.5, 11.5)}" fill="rgba(255,201,60,.25)" stroke="#f0a020" stroke-width="2.4" stroke-linejoin="round"/>` + stroke("M97 79 h6 M75 79 l-6 -2 M125 79 l6 -2", "#f0a020", 2.4) },
  { id: "sparkleeyes", name: "반짝 눈", tr: ["Sparkly eyes", "闪亮眼睛"], slot: "eyes", rare: 2, added: 22,
    art: twinkle(75, 77, 3.6, "#ffd84d") + twinkle(125, 77, 3.6, "#ffd84d") + twinkle(94, 73, 2.2, "#fff3b0") + twinkle(106, 73, 2.2, "#fff3b0") },
  { id: "roundshades", name: "민트 선글라스", tr: ["Mint shades", "薄荷墨镜"], slot: "eyes", rare: 2, added: 22,
    art: `<g fill="#2fb8a6" stroke="#1a8576" stroke-width="2.4"><circle cx="86" cy="82" r="9.5"/><circle cx="114" cy="82" r="9.5"/></g>` + stroke("M95.5 81 h9 M76.5 80 l-7 -3 M123.5 80 l7 -3", "#1a8576", 2.4) + stroke("M80 80 l4 -3 M108 80 l4 -3", "rgba(255,255,255,.75)", 1.8) },
  { id: "pixelshades", name: "픽셀 선글라스", tr: ["Pixel shades", "像素墨镜"], slot: "eyes", rare: 2, added: 22,
    art: `<path d="M68 75 h64 v3 h-6 v6 h-3 v3 h-18 v-3 h-3 v-6 h-4 v6 h-3 v3 h-18 v-3 h-3 v-6 h-6 z" fill="#1c1c28"/><path d="M80 78 h3 v3 h3 v3 h-3 v-3 h-3 z M108 78 h3 v3 h3 v3 h-3 v-3 h-3 z" fill="rgba(255,255,255,.8)"/>` },
  { id: "chainglasses", name: "줄 달린 안경", tr: ["Chain glasses", "链条眼镜"], slot: "eyes", rare: 2, added: 22,
    art: `<path d="M76.5 82 q-9 11 -3 21 M123.5 82 q9 11 3 21" fill="none" stroke="#e0a82e" stroke-width="2" stroke-linecap="round" stroke-dasharray=".1 3.4"/><g fill="rgba(255,255,255,.25)" stroke="#c0507a" stroke-width="2.4"><rect x="76.5" y="76" width="19" height="13" rx="5"/><rect x="104.5" y="76" width="19" height="13" rx="5"/></g>` + stroke("M95.5 81 q4.5 -3 9 0", "#c0507a", 2.4) },
  { id: "flowerglasses", name: "꽃 안경", tr: ["Flower glasses", "花朵眼镜"], slot: "eyes", rare: 2, added: 22,
    art: petals(86, 82, "#ff9ec4") + petals(114, 82, "#ff9ec4") + `<g fill="rgba(255,255,255,.25)" stroke="#e0569a" stroke-width="2"><circle cx="86" cy="82" r="7.5"/><circle cx="114" cy="82" r="7.5"/></g>` + stroke("M97.5 82 h5", "#e0569a", 2) },
  { id: "ballmask", name: "무도회 가면", tr: ["Ball mask", "舞会面具"], slot: "eyes", rare: 3, added: 22,
    art: `<path fill-rule="evenodd" d="M70 74 q8 -4 16 -2 q8 2 14 2 q6 0 14 -2 q8 -2 16 2 q2 10 -6 16 q-8 4 -14 -2 q-5 -5 -10 -5 q-5 0 -10 5 q-6 6 -14 2 q-8 -6 -6 -16 z M80 82 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0 z M108 82 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0 z" fill="#8a4fd0" stroke="#5f2fa8" stroke-width="1.8" stroke-linejoin="round"/><circle cx="100" cy="78" r="1.8" fill="#ffd84d"/>` + twinkle(132, 68, 3.2, "#ffd84d") },
  { id: "rainbowglasses", name: "무지개 안경", tr: ["Rainbow glasses", "彩虹眼镜"], slot: "eyes", rare: 3, added: 22,
    art: stroke("M96.5 81 h7 M75.5 80 l-6 -3 M124.5 80 l6 -3", "#9a7bff", 2.4) + [86, 114].map((x) => `<g fill="none" stroke-width="1.9"><circle cx="${x}" cy="82" r="10.6" stroke="#ff6b6b"/><circle cx="${x}" cy="82" r="8.8" stroke="#ffc93c"/><circle cx="${x}" cy="82" r="7" stroke="#4fb8e8" fill="rgba(255,255,255,.2)"/></g>`).join("") + twinkle(129, 68, 3, "#fff3b0") },
  { id: "diamondglasses", name: "다이아 안경", tr: ["Diamond glasses", "钻石眼镜"], slot: "eyes", rare: 3, added: 22,
    art: `<path d="M79 73 h14 l5 7 l-12 13 l-12 -13 z M107 73 h14 l5 7 l-12 13 l-12 -13 z" fill="rgba(127,214,240,.3)" stroke="#3aa0d8" stroke-width="2.4" stroke-linejoin="round"/>` + stroke("M98 80 h4 M74 80 l-6 -3 M126 80 l6 -3", "#3aa0d8", 2.4) + stroke("M79 73 l3 7 M93 73 l-3 7 M107 73 l3 7 M121 73 l-3 7", "#3aa0d8", 1) + twinkle(129, 68, 3.2, "#fff") },

  // ----- on a cheek -----
  { id: "heartsticker", name: "하트 스티커", tr: ["Heart sticker", "爱心贴纸"], slot: "cheek", rare: 1, added: 22,
    art: heart(125, 95.5, 5.5, "#ff5c8a", ' stroke="#d63d73" stroke-width="1.2" stroke-linejoin="round"') + `<circle cx="122.4" cy="94" r="1" fill="#fff"/>` },
  { id: "flowersticker", name: "꽃 스티커", tr: ["Flower sticker", "花朵贴纸"], slot: "cheek", rare: 1, added: 22,
    art: dots([[76, 94.2], [79.6, 96.8], [78.2, 101.1], [73.8, 101.1], [72.4, 96.8]], 2.8, "#ff9ec4") + `<circle cx="76" cy="98" r="2.4" fill="#ffd84d"/>` },
  { id: "moonsticker", name: "달 스티커", tr: ["Moon sticker", "月亮贴纸"], slot: "cheek", rare: 1, added: 22,
    art: `<path d="M127 91 a6.5 6.5 0 1 0 4 10.5 a7 7 0 0 1 -4 -10.5 z" fill="#ffd84d" stroke="#e0a82e" stroke-width="1.2" stroke-linejoin="round"/>` },
  { id: "musicnote", name: "음표", tr: ["Music note", "音符"], slot: "cheek", rare: 1, added: 22,
    art: `<ellipse cx="122.5" cy="101" rx="3" ry="2.3" fill="#6a5fd0" transform="rotate(-20 122.5 101)"/>` + stroke("M125.2 100.5 v-9.5 q4.5 1 4.5 5.5", "#6a5fd0", 1.8) },
  { id: "cloversticker", name: "네잎클로버", tr: ["Clover", "四叶草"], slot: "cheek", rare: 1, added: 22,
    art: stroke("M125 97 q1 5 4 7.5", "#3d9a4a", 1.6) + `<g fill="#5fc46a" stroke="#3d9a4a" stroke-width="1"><circle cx="122.4" cy="93.9" r="3"/><circle cx="127.6" cy="93.9" r="3"/><circle cx="122.4" cy="99.1" r="3"/><circle cx="127.6" cy="99.1" r="3"/></g>` },
  { id: "freckles", name: "주근깨", tr: ["Freckles", "雀斑"], slot: "cheek", rare: 1, added: 22,
    art: dots([[72, 97], [76, 99.5], [80, 97], [121, 96], [125, 98.5], [129, 96]], 1.1, "#c98a5e") },
  { id: "blushswirls", name: "뱅글 볼터치", tr: ["Blush swirls", "腮红圈圈"], slot: "cheek", rare: 1, added: 22,
    art: stroke("M76 98 a1.5 1.5 0 0 1 3 0 a3 3 0 0 1 -6 0 a4.5 4.5 0 0 1 9 0 M124 97 a1.5 1.5 0 0 0 -3 0 a3 3 0 0 0 6 0 a4.5 4.5 0 0 0 -9 0", "#ff8fb8", 1.8) },
  { id: "smileysticker", name: "스마일 스티커", tr: ["Smiley sticker", "笑脸贴纸"], slot: "cheek", rare: 1, added: 22,
    art: `<circle cx="125" cy="97" r="5.8" fill="#ffd84d" stroke="#e0a82e" stroke-width="1.2"/>` + dots([[123, 95.6], [127, 95.6]], 0.8, "#6a4a1e") + stroke("M122.3 98.3 q2.7 2.6 5.4 0", "#6a4a1e", 1.1) },
  { id: "teardrop", name: "반짝 눈물", tr: ["Sparkly tear", "闪亮泪滴"], slot: "cheek", rare: 1, added: 22,
    art: `<path d="M76 91.5 q4.5 5.5 4.5 8.5 a4.5 4.5 0 0 1 -9 0 q0 -3 4.5 -8.5 z" fill="#7fd0ff" stroke="#3aa0d8" stroke-width="1.2" stroke-linejoin="round"/>` + twinkle(82.5, 93, 2, "#fff") },
  { id: "rainbowsticker", name: "무지개 스티커", tr: ["Rainbow sticker", "彩虹贴纸"], slot: "cheek", rare: 2, added: 22,
    art: stroke("M70 101 a6 6 0 0 1 12 0", "#ff6b6b", 1.8) + stroke("M71.8 101 a4.2 4.2 0 0 1 8.4 0", "#ffc93c", 1.8) + stroke("M73.6 101 a2.4 2.4 0 0 1 4.8 0", "#4fb8e8", 1.8) },
  { id: "lightningbolt", name: "번개", tr: ["Lightning bolt", "闪电"], slot: "cheek", rare: 2, added: 22,
    art: `<path d="M78 90.5 l-6.5 8.5 h4.5 l-2 7 l7.5 -9.5 h-4.5 z" fill="#ffd84d" stroke="#e0a82e" stroke-width="1.2" stroke-linejoin="round"/>` },
  { id: "cherrysticker", name: "체리", tr: ["Cherries", "樱桃"], slot: "cheek", rare: 2, added: 22,
    art: stroke("M72.5 98 q1 -5 6 -7 q0 5 1.5 8", "#4f9a58", 1.4) + `<path d="M78.5 91 q4 -1.5 5.5 1.5 q-3.5 1.5 -5.5 -1.5 z" fill="#7ccf6b"/><g fill="#ff4d6d" stroke="#c9304f" stroke-width="1"><circle cx="72.5" cy="101" r="3.3"/><circle cx="80" cy="102" r="3.3"/></g><circle cx="71.4" cy="100" r=".9" fill="#fff"/>` },
  { id: "strawberrysticker", name: "딸기", tr: ["Strawberry", "草莓"], slot: "cheek", rare: 2, added: 22,
    art: `<path d="M125 104 q-7 -4 -6 -9.5 q1 -3 6 -2.5 q5 -.5 6 2.5 q1 5.5 -6 9.5 z" fill="#ff5c6c" stroke="#d63d50" stroke-width="1.2" stroke-linejoin="round"/><path d="M121 92.5 l4 -2 l4 2 l-4 1.8 z" fill="#5fc46a" stroke="#3d9a4a" stroke-width=".8" stroke-linejoin="round"/>` + dots([[122.5, 96.5], [127.5, 96.5], [125, 99.5]], 0.7, "#ffe9a8") },
  { id: "pawprint", name: "발바닥 도장", tr: ["Paw print", "爪印"], slot: "cheek", rare: 2, added: 22,
    art: `<ellipse cx="76" cy="100.5" rx="4.2" ry="3.4" fill="#b97a56"/>` + dots([[70.8, 96.5], [74.2, 93.6], [77.8, 93.6], [81.2, 96.5]], 1.9, "#b97a56") },
  { id: "facepaint", name: "응원 페인트", tr: ["Face paint", "脸彩"], slot: "cheek", rare: 2, added: 22,
    art: stroke("M71 95 l9 2 M130 94 l-9 2", "#ff6b6b", 2.4) + stroke("M70.5 99.5 l9 2 M130.5 98.5 l-9 2", "#4fb8e8", 2.4) },
  { id: "fishsticker", name: "물고기 스티커", tr: ["Fish sticker", "小鱼贴纸"], slot: "cheek", rare: 2, added: 22,
    art: `<g fill="#5fb8f0" stroke="#2a8fd0" stroke-width="1.1" stroke-linejoin="round"><path d="M79.5 98 l4.5 -3.5 v7 z"/><ellipse cx="75" cy="98" rx="5.2" ry="3.4"/></g><circle cx="72.6" cy="97.2" r=".8" fill="#1f4f80"/>` },
  { id: "gemsticker", name: "보석 스티커", tr: ["Gem sticker", "宝石贴纸"], slot: "cheek", rare: 3, added: 22,
    art: `<path d="M120.5 92 h9 l3.5 4 l-8 8.5 l-8 -8.5 z" fill="#7fe0f0" stroke="#2aa3c2" stroke-width="1.2" stroke-linejoin="round"/>` + stroke("M117 96 h16 M122.5 96 l2.5 8 l2.5 -8", "#2aa3c2", 0.9) + twinkle(131.5, 102, 2, "#fff") },
  { id: "goldstarpair", name: "황금 별 한 쌍", tr: ["Gold star pair", "金星一对"], slot: "cheek", rare: 3, added: 22,
    art: `<g stroke="#e0a82e" stroke-width="1.2" stroke-linejoin="round">` + star(76, 98, 5.5, "#ffc93c") + star(125, 97, 5.5, "#ffc93c") + `</g>` + twinkle(131, 91.5, 2, "#fff3b0") },
  { id: "butterflysticker", name: "나비 스티커", tr: ["Butterfly", "蝴蝶贴纸"], slot: "cheek", rare: 3, added: 22,
    art: `<g transform="rotate(-12 76 98)" stroke="#8a5fd6" stroke-width="1" stroke-linejoin="round"><path d="M76 98 q-7 -1 -7 -5.5 q4 -2.5 7 5.5 z M76 98 q7 -1 7 -5.5 q-4 -2.5 -7 5.5 z" fill="#c79bff"/><path d="M76 98 q-6 1 -5 5 q4 1.5 5 -5 z M76 98 q6 1 5 5 q-4 1.5 -5 -5 z" fill="#ff9ec4"/><path d="M76 95 v6.5 M76 95 l-2 -3 M76 95 l2 -3" fill="none" stroke="#5a3fa0" stroke-linecap="round"/></g>` + twinkle(83.5, 104, 1.8, "#fff3b0") },
];
