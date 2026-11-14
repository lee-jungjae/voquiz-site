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
    return { character, score: Math.round(target * progress(weights, since)) };
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
