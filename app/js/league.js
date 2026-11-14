// The weekly league: this week's points of real students, with a few of the app's own characters
// playing along so that there is always someone just ahead to catch. The characters are shown as
// characters (their own name and a "character" tag), never as students.
import { CHARACTERS } from "./characters.js";

function hash(text) {
  let n = 2166136261;
  for (const ch of String(text)) n = Math.imul(n ^ ch.charCodeAt(0), 16777619);
  return n >>> 0;
}
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86400000;
const LOW = 30, HIGH = 620; // what the slowest and the fastest character reach by Sunday night

// How far through its week a character is: it plays between 8 and 21 o'clock, more on some days.
function progress(weights, sinceMonday) {
  const day = Math.min(6, Math.floor(sinceMonday / DAY));
  const hour = (sinceMonday - day * DAY) / 3600000;
  const today = Math.min(1, Math.max(0, (hour - 8) / 13));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const done = weights.slice(0, day).reduce((sum, w) => sum + w, 0) + weights[day] * today;
  return sinceMonday >= 7 * DAY ? 1 : done / total;
}

// -> [{ character, score }]  The same characters with the same pace for everyone, all week.
export function leagueCharacters(week, monday, count, now = Date.now()) {
  const next = random(hash(`league:${week}`));
  const pool = [...CHARACTERS];
  const since = Math.max(0, now - monday.getTime());
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => {
    const character = pool.splice(Math.floor(next() * pool.length), 1)[0];
    const step = count > 1 ? i / (count - 1) : 1;
    const target = LOW * (HIGH / LOW) ** step * (0.85 + next() * 0.3);
    const weights = Array.from({ length: 7 }, () => 0.4 + next());
    // `final` is where it will stand on Sunday night, so the week can be planned.
    return { character, score: Math.round(target * progress(weights, since)), final: Math.round(target) };
  });
}

// Puts everyone in order: more points first; on a tie the student is placed above a character.
export function place(rows) {
  const sorted = [...rows].sort((a, b) => b.score - a.score || Number(!!a.bot) - Number(!!b.bot));
  let last = null;
  return sorted.map((row, i) => {
    const rank = last && last.score === row.score ? last.rank : i + 1;
    last = { ...row, rank };
    return last;
  });
}

// ----- a different league every week of the year -----
// "From a sprout to the universe": the league gets a bigger name each week, 52 in all, and starts
// over with the new year. [emoji, Korean, English, Chinese]
export const LEAGUES = [
  ["🌱", "새싹", "Sprout", "嫩芽"], ["🌰", "도토리", "Acorn", "橡果"], ["🐚", "조개", "Seashell", "贝壳"], ["🐝", "꿀벌", "Honeybee", "蜜蜂"],
  ["🐞", "무당벌레", "Ladybug", "瓢虫"], ["🦋", "나비", "Butterfly", "蝴蝶"], ["🍓", "딸기", "Strawberry", "草莓"], ["🍄", "버섯", "Mushroom", "蘑菇"],
  ["🐥", "병아리", "Chick", "小鸡"], ["🍩", "도넛", "Donut", "甜甜圈"], ["🐿️", "다람쥐", "Squirrel", "松鼠"], ["🐰", "토끼", "Rabbit", "兔子"],
  ["🐱", "고양이", "Cat", "猫咪"], ["🐶", "강아지", "Puppy", "小狗"], ["🐧", "펭귄", "Penguin", "企鹅"], ["🦉", "부엉이", "Owl", "猫头鹰"],
  ["🦊", "여우", "Fox", "狐狸"], ["🌻", "해바라기", "Sunflower", "向日葵"], ["🚲", "자전거", "Bicycle", "自行车"], ["🐼", "판다", "Panda", "熊猫"],
  ["🦌", "사슴", "Deer", "小鹿"], ["🦁", "사자", "Lion", "狮子"], ["🐻", "곰", "Bear", "大熊"], ["🦒", "기린", "Giraffe", "长颈鹿"],
  ["🐘", "코끼리", "Elephant", "大象"], ["🌳", "나무", "Tree", "大树"], ["⛵", "돛단배", "Sailboat", "帆船"], ["🐋", "고래", "Whale", "鲸鱼"],
  ["🦖", "공룡", "Dinosaur", "恐龙"], ["🚂", "기차", "Train", "火车"], ["🎈", "풍선", "Balloon", "气球"], ["🎡", "관람차", "Ferris wheel", "摩天轮"],
  ["🏰", "성", "Castle", "城堡"], ["🏞️", "폭포", "Waterfall", "瀑布"], ["🏝️", "섬", "Island", "小岛"], ["🌋", "화산", "Volcano", "火山"],
  ["⛰️", "산", "Mountain", "高山"], ["🌈", "무지개", "Rainbow", "彩虹"], ["☁️", "구름", "Cloud", "云朵"], ["⚡", "번개", "Lightning", "闪电"],
  ["✈️", "비행기", "Airplane", "飞机"], ["🚀", "로켓", "Rocket", "火箭"], ["🌙", "달", "Moon", "月亮"], ["🌍", "지구", "Earth", "地球"],
  ["🪐", "토성", "Saturn", "土星"], ["☄️", "혜성", "Comet", "彗星"], ["☀️", "태양", "Sun", "太阳"], ["⭐", "별", "Star", "星星"],
  ["✨", "별자리", "Constellation", "星座"], ["🌌", "은하", "Galaxy", "银河"], ["🛸", "UFO", "UFO", "UFO"], ["🌠", "우주", "Universe", "宇宙"],
];

// The week of the year a Monday belongs to (ISO: the week that holds the year's first Thursday is week 1).
function weekOfYear(monday) {
  const thursday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);
  const first = new Date(thursday.getFullYear(), 0, 1);
  return Math.floor((thursday - first) / (7 * DAY)) + 1;
}

// -> { index, week, emoji, names: [ko, en, zh], bg, ink }  Each league has its own colour.
export function leagueAt(index) {
  const i = ((index % LEAGUES.length) + LEAGUES.length) % LEAGUES.length;
  const [emoji, ...names] = LEAGUES[i];
  const hue = (95 + i * 23) % 360;
  return { index: i, week: i + 1, emoji, names, bg: `hsl(${hue} 72% 91%)`, mid: `hsl(${hue} 60% 80%)`, ink: `hsl(${hue} 45% 26%)` };
}
export const leagueOf = (monday) => leagueAt(weekOfYear(monday) - 1);
