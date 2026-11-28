// Numbers that may need tuning after release: points, limits, odds. The ones below are built in.
// The server can replace any of them (app_config(), 0018_tuning_and_point_cap.sql), so that such a
// change does not need a new version of the app. The last answer is kept on this computer and
// used at once the next time the app opens.
const DEFAULTS = {
  // Streak challenge: a stage every `step` right answers. points[i] is what a right answer pays in
  // stage i + 1 (the last number holds for every later stage); bonus[i] is paid on reaching stage i + 2.
  streak: { step: 10, points: [3, 4, 5, 6, 7], bonus: [10, 20, 30, 40, 50], tries: 3 },
  // The week's goal pays perWord points for every word of the goal, never less than min.
  weekly: { perWord: 20, min: 200 },
  // The daily present: [points, how often] (relative). The average is about 67; 1,000 comes up
  // in about one box in 125. picks / plusPicks: how many boxes a day a free / a Plus student opens.
  gift: { prizes: [[10, 23.5], [20, 24], [30, 20], [50, 14], [80, 8], [100, 4], [150, 2.5], [200, 2], [300, 1.2], [500, 0.5], [1000, 0.3]], picks: 1, plusPicks: 2 },
  // The weekly league, when a week is settled: what a promotion pays, and what finishing first,
  // second and third pays (the medals). These are presents: they do not count as points earned in
  // the new week's league.
  league: { promotion: 100, medals: [300, 200, 100] },
  // The most questions in one word quiz; a wider range is cut down at random.
  quiz: { max: 15 },
};
const KEY = "wb_tuning";
let remote = {};
try { remote = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { /* nothing saved */ }

const positive = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
const numbers = (list) => Array.isArray(list) && list.length > 0 && list.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0);
// What a group may contain. Anything else that arrives is ignored, so a typo on the server
// cannot break the app: the built-in number stays.
const CHECKS = {
  streak: { step: positive, points: numbers, bonus: numbers, tries: positive },
  weekly: { perWord: positive, min: (n) => typeof n === "number" && n >= 0 },
  gift: { prizes: (list) => Array.isArray(list) && list.length > 0 && list.every((p) => Array.isArray(p) && positive(p[0]) && positive(p[1])), picks: positive, plusPicks: positive },
  quiz: { max: positive },
  league: { promotion: (n) => typeof n === "number" && n >= 0, medals: numbers },
};

export function tuning(group) {
  const out = { ...DEFAULTS[group] };
  const sent = remote?.[group];
  if (sent && typeof sent === "object") {
    for (const [key, ok] of Object.entries(CHECKS[group])) if (key in sent && ok(sent[key])) out[key] = sent[key];
  }
  return out;
}

// Takes what the server sent. Returns true if anything changed (the screen should be drawn again).
export function setTuning(config) {
  const next = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  const changed = JSON.stringify(next) !== JSON.stringify(remote);
  remote = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full or off */ }
  return changed;
}
