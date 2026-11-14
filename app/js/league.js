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

// ----- tiers -----
// Seven worlds, one adventure: from the mushroom forest up to the star world. The top MOVE of a week's
// board go up one tier, the bottom MOVE go down one. [emoji, Korean, English, Chinese]
export const TIERS = [
  { emoji: "🍄", names: ["버섯 숲", "Mushroom Forest", "蘑菇森林"], bg: "#e4f3d8", mid: "#b9dea0", ink: "#23552b", pace: 1 },
  { emoji: "🏝️", names: ["보물섬", "Treasure Island", "宝藏岛"], bg: "#fdf1c9", mid: "#f3d67c", ink: "#5c4300", pace: 1.15 },
  { emoji: "🐙", names: ["바닷속", "Deep Sea", "海底世界"], bg: "#d9f0f6", mid: "#9dd5e6", ink: "#0d4a5e", pace: 1.3 },
  { emoji: "❄️", names: ["얼음 왕국", "Ice Kingdom", "冰雪王国"], bg: "#e6eefb", mid: "#bcd0f3", ink: "#1f3d75", pace: 1.5 },
  { emoji: "🌋", names: ["용암 화산", "Lava Volcano", "熔岩火山"], bg: "#fde2d6", mid: "#f5a98b", ink: "#7a2408", pace: 1.7 },
  { emoji: "🏰", names: ["구름 성", "Cloud Castle", "云中城堡"], bg: "#fbe4f1", mid: "#f1b3d6", ink: "#6e1f4c", pace: 1.9 },
  { emoji: "🪐", names: ["별나라", "Star World", "星星王国"], bg: "#e9e1fa", mid: "#c5b2f0", ink: "#3a2370", pace: 2.1 },
];
export const MOVE = 3;
export const CHARACTERS_PER_LEAGUE = 8;

// What a place on the final board means: "up", "down" or "stay".
export function outcome(rows, tier) {
  const index = rows.findIndex((row) => row.me);
  if (index < 0) return "stay";
  if (tier < TIERS.length - 1 && rows[index].rank <= MOVE) return "up";
  if (tier > 0 && index >= rows.length - MOVE) return "down";
  return "stay";
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

// -> [{ character, score, final }]  The same characters with the same pace for everyone in a tier,
// all week. In a higher tier they are faster.
export function leagueCharacters(week, monday, tier = 0, now = Date.now()) {
  const count = CHARACTERS_PER_LEAGUE, pace = TIERS[tier]?.pace || 1;
  const next = random(hash(`league:${week}:${tier}`));
  const pool = [...CHARACTERS];
  const since = Math.max(0, now - monday.getTime());
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => {
    const character = pool.splice(Math.floor(next() * pool.length), 1)[0];
    const step = count > 1 ? i / (count - 1) : 1;
    const target = LOW * (HIGH / LOW) ** step * (0.85 + next() * 0.3) * pace;
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
