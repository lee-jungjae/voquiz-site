// The weekly league: this week's points of real students, with a few of the app's own characters
// playing along so that there is always someone just ahead to catch. The characters are shown as
// characters (their own name and a "character" tag), never as students.
import { CHARACTERS } from "./characters.js?v=0.1.28-tp7viw";
import { clockNow } from "./clock.js?v=0.1.28-tp7viw";

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
// Seven worlds, one adventure: from the flower land up to the star world. The top MOVE of a week's
// board go up one tier, the bottom MOVE go down one. icon: its picture (art.js); names: Korean, English, Chinese
export const TIERS = [
  { icon: "flower", names: ["꽃 나라", "Flower Land", "花之国"], bg: "#fde6ee", mid: "#f6b9cf", ink: "#7a2346", pace: 1 },
  { icon: "island", names: ["보물섬", "Treasure Island", "宝藏岛"], bg: "#fdf1c9", mid: "#f3d67c", ink: "#5c4300", pace: 1.15 },
  { icon: "whale", names: ["바닷속", "Deep Sea", "海底世界"], bg: "#d9f0f6", mid: "#9dd5e6", ink: "#0d4a5e", pace: 1.3 },
  { icon: "snow", names: ["얼음 왕국", "Ice Kingdom", "冰雪王国"], bg: "#e6e8fb", mid: "#bcc2f3", ink: "#27307a", pace: 1.5 },
  { icon: "rainbow", names: ["무지개", "Rainbow", "彩虹"], bg: "#fde5d2", mid: "#f6b98c", ink: "#6e2f08", pace: 1.7 },
  { icon: "cloud", names: ["구름 성", "Cloud Castle", "云中城堡"], bg: "#e3f1fb", mid: "#b3d7f1", ink: "#16466e", pace: 1.9 },
  { icon: "star", names: ["별나라", "Star World", "星星王国"], bg: "#e9e1fa", mid: "#c5b2f0", ink: "#3a2370", pace: 2.1 },
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
export function leagueCharacters(week, monday, tier = 0, now = clockNow()) {
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
