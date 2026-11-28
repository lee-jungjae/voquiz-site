import { stroke, star, twinkle } from "./wear-art.js?v=0.1.28-tp80rp";
// More things for the back (drawn behind the body) and to float around. Rule: rare 1 (200 points) and rare 2 (400 points) can be bought; rare 3 comes from capsules only.

// Small local helpers. `both` draws the left half and its mirror image on the right.
const n = (v) => +v.toFixed(1);
const both = (left) => left + `<g transform="translate(200 0) scale(-1 1)">${left}</g>`;
const CAPE = "M76 68 q24 -8 48 0 l20 48 q-44 14 -88 0 z";
const collar = (fill) => `<path d="M84 70 q16 -5 32 0 l4 8 q-20 -6 -40 0 z" fill="${fill}"/>`;
const note = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.3" fill="${c}"/>` + stroke(`M${x + 3.6} ${y - 1} v-14 q6 1 6 7`, c, 2.2);
const flake = (x, y, r, c) => stroke(`M${x - r} ${y} h${2 * r} M${n(x - r / 2)} ${n(y - r * 0.87)} l${r} ${n(r * 1.74)} M${n(x + r / 2)} ${n(y - r * 0.87)} l${-r} ${n(r * 1.74)}`, c, 1.8);
const leaf = (x, y, s, c, turn) => `<path d="M${x - s} ${y} q${s} ${-s} ${2 * s} 0 q${-s} ${s} ${-2 * s} 0 z" fill="${c}" transform="rotate(${turn} ${x} ${y})"/>`;
const drop = (x, y, c) => `<path d="M${x} ${y} c4 6 4 10 0 10 c-4 0 -4 -4 0 -10 z" fill="${c}"/>`;
const flutter = (x, y, c, dark) => `<path d="M${x} ${y} q-8 -9 -8 -1 q0 7 8 1 q8 -9 8 -1 q0 7 -8 1 z" fill="${c}" stroke="${dark}" stroke-width="1.4" stroke-linejoin="round"/>` + stroke(`M${x} ${y - 3} v6`, dark, 1.8);
const glow = (x, y) => `<circle cx="${x}" cy="${y}" r="5.4" fill="rgba(255,236,110,0.4)"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffe44d"/>`;
const bit = (x, y, c, turn) => `<rect x="${x - 3}" y="${y - 1.7}" width="6" height="3.4" rx="1" fill="${c}" transform="rotate(${turn} ${x} ${y})"/>`;
const bolt = (x, y) => `<path d="M${x} ${y} l-5 8 h4 l-3 8 l9 -10 h-4 l4 -6 z" fill="#ffd84d" stroke="#e0a82e" stroke-width="1.4" stroke-linejoin="round"/>`;
const zed = (x, y, s, w) => stroke(`M${x} ${y} h${s} l${-s} ${s} h${s}`, "#7c8cf0", w);
const bloom = (x, y, c) => `<circle cx="${x}" cy="${y}" r="3.4" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="0 4.27"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffd84d"/>`;
const paw = (x, y, c, turn) => `<g fill="${c}" transform="rotate(${turn} ${x} ${y})"><ellipse cx="${x}" cy="${y + 2}" rx="4.6" ry="3.8"/><circle cx="${x - 4.6}" cy="${y - 3}" r="1.9"/><circle cx="${x}" cy="${y - 5}" r="1.9"/><circle cx="${x + 4.6}" cy="${y - 3}" r="1.9"/></g>`;
const burst = (x, y, r, c) => stroke(Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3 + 0.5, dx = Math.cos(a), dy = Math.sin(a);
  return `M${n(x + dx * r * 0.4)} ${n(y + dy * r * 0.4)} L${n(x + dx * r)} ${n(y + dy * r)}`;
}).join(" "), c, 1.8) + `<circle cx="${x}" cy="${y}" r="1.5" fill="${c}"/>`;

export const AROUND_WEARS = [
  // on the back
  { id: "butterflywings", name: "나비 날개", tr: ["Butterfly wings", "蝴蝶翅膀"], slot: "back", layer: "back", rare: 2, added: 22,
    art: both(`<g fill="#ff9ad0" stroke="#d65aa0" stroke-width="2.2" stroke-linejoin="round"><path d="M74 82 q-10 -34 -36 -30 q-14 4 -8 20 q6 12 44 14 z"/><path d="M74 86 q-30 0 -36 12 q-2 12 12 12 q14 -2 24 -20 z"/></g><circle cx="44" cy="64" r="5" fill="#ffd84d"/><circle cx="51" cy="100" r="3.4" fill="#ffd84d"/><circle cx="36" cy="58" r="1.8" fill="#fff"/>`) },
  { id: "batwings", name: "박쥐 날개", tr: ["Bat wings", "蝙蝠翅膀"], slot: "back", layer: "back", rare: 2, added: 22,
    art: both(`<path d="M72 78 q-16 -30 -46 -26 q10 8 6 24 q8 -6 14 4 q6 -8 12 4 q8 -6 14 6 z" fill="#5b4a8a" stroke="#3a2d63" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M70 79 q-18 -18 -40 -24 M68 80 q-12 -8 -22 0", "#3a2d63", 1.6)) },
  { id: "fairywings", name: "요정 날개", tr: ["Fairy wings", "精灵翅膀"], slot: "back", layer: "back", rare: 2, added: 22,
    art: both(`<g fill="rgba(190,235,255,0.6)" stroke="#8fd0ee" stroke-width="2" stroke-linejoin="round"><path d="M74 82 q-34 -40 -46 -22 q-4 14 46 26 z"/><path d="M74 88 q-32 -2 -34 12 q6 12 34 -8 z"/></g>` + stroke("M36 60 q6 -6 14 0", "#fff", 1.6)) },
  { id: "dragonwings", name: "용 날개", tr: ["Dragon wings", "龙翅膀"], slot: "back", layer: "back", rare: 2, added: 22,
    art: both(`<path d="M72 80 l-30 -30 q-4 -2 -6 2 l-8 -4 q6 10 4 24 q10 -4 14 6 q8 -6 14 4 q6 -4 12 4 z" fill="#6cc070" stroke="#3d8a45" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M42 52 q4 12 4 24 M52 62 q6 8 8 18", "#3d8a45", 1.6)) },
  { id: "beewings", name: "꿀벌 날개", tr: ["Bee wings", "蜜蜂翅膀"], slot: "back", layer: "back", rare: 1, added: 22,
    art: both(`<g fill="rgba(255,255,255,0.8)" stroke="#a9d4ee" stroke-width="2"><ellipse cx="48" cy="66" rx="22" ry="11" transform="rotate(26 48 66)"/><ellipse cx="50" cy="92" rx="18" ry="8" transform="rotate(-12 50 92)"/></g>` + stroke("M64 73 q-14 -8 -26 -12", "#a9d4ee", 1.4)) },
  { id: "backpack", name: "책가방", tr: ["Backpack", "书包"], slot: "back", layer: "back", rare: 1, added: 22,
    art: stroke("M90 43 q10 -15 20 0", "#2f6fb8", 2.6) + `<g stroke="#2f6fb8" stroke-width="2.2" stroke-linejoin="round"><rect x="44" y="72" width="16" height="26" rx="6" fill="#ffd84d" stroke="#e0a82e"/><rect x="140" y="72" width="16" height="26" rx="6" fill="#ffd84d" stroke="#e0a82e"/><rect x="54" y="42" width="92" height="64" rx="18" fill="#4f9be8"/></g>` },
  { id: "jetpack", name: "제트팩", tr: ["Jetpack", "喷气背包"], slot: "back", layer: "back", rare: 2, added: 22,
    art: both(`<path d="M48 109 q-2 14 8 28 q10 -14 8 -28 z" fill="#ff9a3d"/><path d="M52 109 q0 9 4 15 q4 -6 4 -15 z" fill="#ffe066"/><path d="M50 102 h12 l3 7 h-18 z" fill="#8693a6"/><rect x="46" y="56" width="20" height="46" rx="9" fill="#c9d2de" stroke="#8693a6" stroke-width="2.2"/><rect x="47" y="70" width="18" height="6" fill="#e8504f"/>`) },
  { id: "turtleshell", name: "거북 등딱지", tr: ["Turtle shell", "乌龟壳"], slot: "back", layer: "back", rare: 1, added: 22,
    art: `<ellipse cx="100" cy="82" rx="48" ry="40" fill="#6fbf73" stroke="#3f8f4a" stroke-width="2.4"/>` + stroke("M53 82 h8 M147 82 h-8 M66 54 l5 6 M134 54 l-5 6 M100 43 v7 M66 110 l5 -6 M134 110 l-5 -6", "#3f8f4a", 1.8) },
  { id: "herocape", name: "영웅 망토", tr: ["Hero cape", "英雄披风"], slot: "back", layer: "back", rare: 1, added: 22,
    art: `<path d="M76 68 q24 -8 48 0 l22 46 q-8 6 -16 0 q-7 6 -15 0 q-8 6 -15 0 q-7 6 -15 0 q-8 6 -15 0 q-8 6 -16 0 z" fill="#3b7de2" stroke="#2a5cb9" stroke-width="2.2" stroke-linejoin="round"/>` + collar("#e23b3b") },
  { id: "royalcape", name: "임금님 망토", tr: ["Royal cape", "国王披风"], slot: "back", layer: "back", rare: 3, added: 22,
    art: `<path d="${CAPE}" fill="#b0304f" stroke="#7d1f38" stroke-width="2.2" stroke-linejoin="round"/><path d="M61 104 l-5 12 q44 14 88 0 l-5 -12 q-39 12 -78 0 z" fill="#fff" stroke="#d9cfc0" stroke-width="1.6" stroke-linejoin="round"/><g fill="#4a3b3b"><circle cx="61" cy="111" r="1.4"/><circle cx="139" cy="111" r="1.4"/><circle cx="74" cy="115" r="1.4"/><circle cx="126" cy="115" r="1.4"/><circle cx="87" cy="117" r="1.4"/><circle cx="113" cy="117" r="1.4"/><circle cx="100" cy="118" r="1.4"/></g>` + collar("#ffd84d") },
  { id: "starcape", name: "별빛 망토", tr: ["Star cape", "星星披风"], slot: "back", layer: "back", rare: 2, added: 22,
    art: `<path d="${CAPE}" fill="#2c3a7a" stroke="#1b2552" stroke-width="2.2" stroke-linejoin="round"/>` + collar("#ffd84d") + star(67, 107, 3.6, "#ffd84d") + star(133, 107, 3.6, "#ffd84d") + star(82, 116, 3, "#ffe89a") + star(118, 116, 3, "#ffe89a") + star(100, 118, 3, "#ffd84d") },
  { id: "leafcape", name: "나뭇잎 망토", tr: ["Leaf cape", "树叶披风"], slot: "back", layer: "back", rare: 1, added: 22,
    art: `<path d="M76 68 q24 -8 48 0 l20 44 l-11 -1 l-5 9 l-9 -6 l-7 10 l-12 -8 l-12 8 l-7 -10 l-9 6 l-5 -9 l-11 1 z" fill="#5fb85a" stroke="#3b8a3f" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M128 118 l-6 -14 M112 122 l-4 -12 M88 122 l4 -12 M72 118 l6 -14", "#3b8a3f", 1.6) + collar("#a5dc7a") },
  { id: "sharkfin", name: "상어 지느러미", tr: ["Shark fin", "鲨鱼鳍"], slot: "back", layer: "back", rare: 1, added: 22,
    art: `<path d="M84 56 q4 -34 30 -44 q-6 22 6 44 z" fill="#6f9fc4" stroke="#47749a" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M94 44 q3 -12 10 -19", "#fff", 1.6) },
  { id: "foxtail", name: "여우 꼬리", tr: ["Fox tail", "狐狸尾巴"], slot: "back", layer: "back", rare: 1, added: 22,
    art: `<g stroke="#c2621f" stroke-width="2.2" stroke-linejoin="round"><path d="M132 104 q30 6 40 -18 q4 -18 -8 -28 q2 14 -8 22 q-10 8 -26 12 z" fill="#f08a3c"/><path d="M172 84 q3 -16 -8 -26 q2 12 -3 20 z" fill="#fff"/></g>` },
  { id: "cattail", name: "고양이 꼬리", tr: ["Cat tail", "猫尾巴"], slot: "back", layer: "back", rare: 1, added: 22,
    art: stroke("M134 104 q30 4 30 -18 q0 -14 -10 -16", "#5a5560", 9.4) + stroke("M134 104 q30 4 30 -18 q0 -14 -10 -16", "#8a8594", 5.4) },
  { id: "peacockfan", name: "공작 깃털", tr: ["Peacock fan", "孔雀开屏"], slot: "back", layer: "back", rare: 3, added: 22,
    art: `<path d="M100 96 L36 96 A64 64 0 0 1 164 96 z" fill="#2fae9a" stroke="#1b7d70" stroke-width="2.2" stroke-linejoin="round"/>` + stroke("M100 96 L150.8 57 M100 96 L119.3 35 M100 96 L80.7 35 M100 96 L49.2 57", "#1b7d70", 1.4) + `<g fill="#ffd84d"><circle cx="49.3" cy="77.5" r="6"/><circle cx="69" cy="51.8" r="6"/><circle cx="100" cy="42" r="6"/><circle cx="131" cy="51.8" r="6"/><circle cx="150.7" cy="77.5" r="6"/></g><g fill="#2f6fd6"><circle cx="49.3" cy="77.5" r="3.2"/><circle cx="69" cy="51.8" r="3.2"/><circle cx="100" cy="42" r="3.2"/><circle cx="131" cy="51.8" r="3.2"/><circle cx="150.7" cy="77.5" r="3.2"/></g>` },
  { id: "crystalwings", name: "수정 날개", tr: ["Crystal wings", "水晶翅膀"], slot: "back", layer: "back", rare: 3, added: 22,
    art: both(`<g stroke="#5fb3e0" stroke-width="2" stroke-linejoin="round"><path d="M72 84 l-20 -34 l-10 6 z" fill="#a8e4ff"/><path d="M70 86 l-40 -22 l-4 12 z" fill="#d4c2ff"/><path d="M70 88 l-36 8 l6 10 z" fill="#a8e4ff"/></g>` + twinkle(32, 52, 3.6, "#fff")) },

  // floating around
  { id: "notes", name: "음표 둥둥", tr: ["Music notes", "音符飘飘"], slot: "aura", rare: 1, added: 22,
    art: note(36, 50, "#7c6cf0") + note(156, 42, "#ff7aa8") + note(152, 100, "#36b6a0") + note(38, 100, "#ffb347") + note(110, 24, "#6db8f0") },
  { id: "bubbles", name: "비눗방울", tr: ["Bubbles", "肥皂泡泡"], slot: "aura", rare: 1, added: 22,
    art: `<g fill="rgba(160,220,255,0.35)" stroke="#7cc4ee" stroke-width="1.6"><circle cx="40" cy="40" r="8"/><circle cx="160" cy="60" r="6"/><circle cx="46" cy="96" r="5"/><circle cx="156" cy="100" r="7"/><circle cx="112" cy="16" r="5"/><circle cx="30" cy="70" r="3.5"/></g>` + stroke("M35 38 q1 -4 5 -5", "#fff", 1.6) },
  { id: "snowflakes", name: "눈송이", tr: ["Snowflakes", "雪花飘飘"], slot: "aura", rare: 1, added: 22,
    art: flake(40, 36, 7, "#8fd0f5") + flake(162, 48, 6, "#bfe6fb") + flake(36, 84, 5, "#bfe6fb") + flake(160, 98, 7, "#8fd0f5") + flake(90, 14, 5, "#8fd0f5") },
  { id: "autumnleaves", name: "가을 낙엽", tr: ["Autumn leaves", "秋天落叶"], slot: "aura", rare: 1, added: 22,
    art: leaf(40, 34, 7, "#e8743b", -30) + leaf(162, 52, 6, "#f2b03a", 40) + leaf(36, 76, 6, "#f2b03a", 20) + leaf(158, 100, 7, "#c9502e", -20) + leaf(46, 104, 5, "#c9502e", 60) + leaf(114, 16, 6, "#e8743b", 15) },
  { id: "petals", name: "벚꽃잎", tr: ["Cherry petals", "樱花花瓣"], slot: "aura", rare: 1, added: 22,
    art: leaf(42, 30, 5, "#ffb7d0", 35) + leaf(160, 40, 4.5, "#ff9cc0", -40) + leaf(32, 66, 4, "#ff9cc0", -20) + leaf(166, 78, 5, "#ffb7d0", 25) + leaf(44, 100, 4.5, "#ffb7d0", 70) + leaf(88, 14, 4, "#ff9cc0", -15) },
  { id: "littlestars", name: "작은 별", tr: ["Little stars", "小星星"], slot: "aura", rare: 2, added: 22,
    art: star(40, 38, 6, "#ffd84d") + star(162, 36, 5, "#ffe89a") + star(34, 80, 4, "#ffe89a") + star(164, 84, 6, "#ffd84d") + star(48, 104, 4, "#ffd84d") + star(100, 14, 5, "#ffd84d") },
  { id: "raincloud", name: "비구름", tr: ["Rain cloud", "小雨云"], slot: "aura", rare: 1, added: 22,
    art: `<path d="M88 28 a7 7 0 0 1 0 -14 a11 11 0 0 1 21 -2 a8.5 8.5 0 0 1 3 16 z" fill="#dfe9f5" stroke="#9fb4cc" stroke-width="2" stroke-linejoin="round"/>` + drop(92, 32, "#6db8f0") + drop(108, 32, "#6db8f0") + drop(40, 48, "#6db8f0") + drop(160, 42, "#8fd0f5") + drop(36, 84, "#8fd0f5") + drop(162, 90, "#6db8f0") },
  { id: "butterflies", name: "나비 팔랑", tr: ["Butterflies", "蝴蝶飞飞"], slot: "aura", rare: 2, added: 22,
    art: flutter(40, 40, "#ff9ad0", "#d65aa0") + flutter(162, 50, "#ffd84d", "#e0a82e") + flutter(38, 92, "#8fd0f5", "#4f9bd0") + flutter(158, 100, "#ff9ad0", "#d65aa0") + flutter(110, 18, "#b79cf5", "#8466d6") },
  { id: "fireflies", name: "반딧불이", tr: ["Fireflies", "萤火虫"], slot: "aura", rare: 2, added: 22,
    art: glow(38, 36) + glow(46, 70) + glow(160, 44) + glow(152, 78) + glow(40, 100) + glow(164, 102) + glow(88, 14) },
  { id: "confetti", name: "색종이", tr: ["Confetti", "彩色纸屑"], slot: "aura", rare: 1, added: 22,
    art: bit(36, 30, "#ff6b9a", 30) + bit(48, 52, "#ffd84d", -40) + bit(30, 74, "#6db8f0", 70) + bit(44, 98, "#7ddc8a", 15) + bit(160, 28, "#6db8f0", -25) + bit(150, 58, "#ff6b9a", 60) + bit(168, 80, "#7ddc8a", -60) + bit(154, 104, "#ffd84d", 35) + bit(84, 12, "#b79cf5", -15) + bit(118, 18, "#ffb347", 50) + `<circle cx="40" cy="62" r="2" fill="#b79cf5"/><circle cx="164" cy="46" r="2" fill="#ffb347"/>` },
  { id: "sparks", name: "번개 찌릿", tr: ["Lightning sparks", "闪电火花"], slot: "aura", rare: 2, added: 22,
    art: bolt(40, 28) + bolt(160, 38) + bolt(36, 80) + bolt(158, 88) + bolt(104, 6) },
  { id: "zzz", name: "쿨쿨", tr: ["Sleepy Zzz", "呼呼大睡"], slot: "aura", rare: 1, added: 22,
    art: zed(141, 50, 4, 1.8) + zed(148, 37, 6, 2) + zed(157, 22, 8, 2.3) + zed(166, 6, 10, 2.6) },
  { id: "planets", name: "행성 둥둥", tr: ["Planets", "小行星"], slot: "aura", rare: 2, added: 22,
    art: `<circle cx="38" cy="40" r="6" fill="#f2a65a" stroke="#c97a2e" stroke-width="1.6"/><ellipse cx="38" cy="40" rx="11" ry="3" fill="none" stroke="#c97a2e" stroke-width="1.6" transform="rotate(-20 38 40)"/><circle cx="162" cy="92" r="6.5" fill="#6db8f0" stroke="#3f86c4" stroke-width="1.6"/><path d="M158 90 q3 -3 6 0 q-1 4 -6 0 z" fill="#7ddc8a"/><circle cx="160" cy="36" r="4" fill="#f07a6a"/><circle cx="38" cy="94" r="5" fill="#b79cf5" stroke="#8466d6" stroke-width="1.6"/>` + twinkle(104, 14, 4, "#ffe89a") },
  { id: "blossoms", name: "꽃송이", tr: ["Flowers", "小花朵"], slot: "aura", rare: 2, added: 22,
    art: bloom(40, 38, "#ff8fb8") + bloom(162, 44, "#b79cf5") + bloom(34, 84, "#ffb347") + bloom(160, 96, "#ff8fb8") + bloom(96, 14, "#8fd0f5") },
  { id: "pawprints", name: "발자국", tr: ["Paw prints", "小脚印"], slot: "aura", rare: 1, added: 22,
    art: paw(40, 38, "#b98a6a", -20) + paw(160, 50, "#d9a987", 15) + paw(36, 88, "#d9a987", 10) + paw(162, 98, "#b98a6a", -15) },
  { id: "rainbowarc", name: "무지개", tr: ["Rainbow arc", "彩虹"], slot: "aura", rare: 3, added: 22,
    art: `<g fill="none" stroke-width="4.6"><path d="M62.5 32 A40 40 0 0 1 137.5 32" stroke="#ff6b6b"/><path d="M67.4 32 A35.5 35.5 0 0 1 132.6 32" stroke="#ffd84d"/><path d="M72.3 32 A31 31 0 0 1 127.7 32" stroke="#6fcf7a"/><path d="M77.5 32 A26.5 26.5 0 0 1 122.5 32" stroke="#6db8f0"/></g>` + both(`<path d="M56 39 a5 5 0 0 1 2 -9.4 a6 6 0 0 1 11 0.6 a4.6 4.6 0 0 1 1 8.8 z" fill="#fff" stroke="#c9d9ea" stroke-width="1.6" stroke-linejoin="round"/>`) },
  { id: "fireworks", name: "불꽃놀이", tr: ["Fireworks", "烟花"], slot: "aura", rare: 3, added: 22,
    art: burst(40, 34, 10, "#ff6b9a") + burst(162, 30, 11, "#ffd84d") + burst(160, 92, 8, "#6db8f0") + burst(36, 88, 8, "#7ddc8a") + burst(104, 14, 8, "#b79cf5") },
  { id: "glowring", name: "황금 빛고리", tr: ["Golden glow", "金色光环"], slot: "aura", rare: 3, added: 22,
    art: `<ellipse cx="100" cy="83" rx="74" ry="61" fill="none" stroke="rgba(255,216,77,0.35)" stroke-width="6"/><ellipse cx="100" cy="83" rx="74" ry="61" fill="none" stroke="#ffd84d" stroke-width="2.2"/>` + twinkle(47.7, 39.9, 5, "#fff3b0") + twinkle(152.3, 39.9, 5, "#fff3b0") + twinkle(30.5, 103.9, 4, "#fff3b0") + twinkle(169.5, 103.9, 4, "#fff3b0") },
];
