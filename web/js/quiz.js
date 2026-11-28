import { clockNow } from "./clock.js?v=0.1.28-tp7v52";
// Quiz rules (no UI, no network).
// - A quiz covers the words in the chosen range PLUS every word still marked "needs review".
// - A wrong answer marks the word "needs review" and resets its streak.
// - MASTER_STREAK correct answers in a row, at least one of them typed, make a word "learned"
//   (mastered_at): it leaves the review pile and is not asked again.
// - A learned word can be put back into the quizzes once RETEST_DAYS have passed.
export const MASTER_STREAK = 3;
export const RETEST_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;
export const isLearned = (word) => Boolean(word.mastered_at);
export const canRetest = (word, now = clockNow()) => isLearned(word) && now - new Date(word.mastered_at).getTime() >= RETEST_DAYS * DAY;
// Learned, and neither learned nor asked again in the last RETEST_DAYS: ready for a check-up quiz.
export const isRested = (word, now = clockNow()) => isLearned(word) &&
  now - Math.max(new Date(word.mastered_at).getTime(), new Date(word.last_reviewed_at || 0).getTime()) >= RETEST_DAYS * DAY;
// What to save to put a learned word back into the quizzes.
export const retestPatch = () => ({ mastered_at: null, streak: 0, typed_ok: false });

// scope: {type:'days', days} | {type:'range', from:'YYYY-MM-DD', to:'YYYY-MM-DD'} | {type:'favorites'} | {type:'all'}
//        | {type:'review'} = only the words answered wrong and not yet cleared
//        | {type:'learned'} = a check-up: only learned words that have rested (see isRested)
export function inScope(word, scope, now = clockNow()) {
  const t = new Date(word.last_searched_at).getTime();
  switch (scope.type) {
    case "days":
      return t >= now - scope.days * DAY;
    case "range": {
      const from = scope.from ? new Date(scope.from + "T00:00:00").getTime() : -Infinity;
      const to = scope.to ? new Date(scope.to + "T23:59:59.999").getTime() : Infinity;
      return t >= from && t <= to;
    }
    case "favorites":
      return word.favorite;
    case "review":
      return word.needs_review;
    default:
      return true;
  }
}

// Every word the range covers. Learned words are left out, except in the check-up of learned words.
export function quizPool(words, scope, now = clockNow()) {
  if (scope.type === "learned") return words.filter((w) => isRested(w, now));
  return words.filter((w) => !isLearned(w) && (w.needs_review || inScope(w, scope, now)));
}

// The words of one quiz: the range in random order, cut down to `max` when it holds more.
export function buildQuizSet(words, scope, now = clockNow(), max = Infinity) {
  const picked = quizPool(words, scope, now);
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked.slice(0, Math.max(1, max));
}

// Returns the fields to save after one answer.
export function applyAnswer(word, correct, typed = false, now = new Date(clockNow())) {
  const last_reviewed_at = now.toISOString();
  if (!correct) return { streak: 0, needs_review: true, typed_ok: false, mastered_at: null, last_reviewed_at };
  const streak = word.streak + 1;
  const typed_ok = Boolean(word.typed_ok || typed);
  const learned = streak >= MASTER_STREAK && typed_ok;
  return {
    streak,
    typed_ok,
    needs_review: word.needs_review && !learned,
    mastered_at: learned ? word.mastered_at || last_reviewed_at : null, // a learned word asked again keeps the day it was learned
    last_reviewed_at,
  };
}

// Typed-answer check: either word of the pair (Korean or English) counts.
const clean = (s) => (s || "").normalize("NFC").replace(/\([^)]*\)/g, "").trim().toLowerCase().replace(/\s+/g, " ");

export function isCorrect(typed, content) {
  const answer = clean(typed);
  if (!answer) return false;
  const accepted = [content.headword, ...(content.counterpart || "").split(/[,;/]/)].map(clean).filter(Boolean);
  return accepted.includes(answer);
}

function shuffled(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Turns each quiz word into a question: "type" (write the word) or "choice" (pick it from four).
// Choices need three other words from the student's list; with fewer, every question is typed.
// Kinds alternate, starting with a typed question, so a quiz of two or more is always a mix.
// A word with several meanings is asked about one of them, picked at random each time, so that
// over a few quizzes every meaning comes up (`sense` is null for a word with one meaning).
export function makeQuestions(cards, pool) {
  return cards.map((word, i) => {
    const senses = (word.content?.senses || []).filter((one) => one?.definition_ko || one?.definition_en);
    const sense = senses.length > 1 ? senses[Math.floor(Math.random() * senses.length)] : null;
    const others = pool.filter((w) => w.term_norm !== word.term_norm);
    // One answer away from being learned but never typed yet: this one has to be typed.
    const mustType = !word.typed_ok && word.streak >= MASTER_STREAK - 1;
    if (others.length < 3 || i % 2 === 0 || mustType) return { word, kind: "type", sense };
    return { word, kind: "choice", sense, options: shuffled([word, ...shuffled(others).slice(0, 3)]) };
  });
}

// The entry as this question sees it: the meaning being asked stands in for the first one.
export function askedContent(word, question) {
  const sense = question?.sense;
  if (!sense) return word.content;
  return { ...word.content, part_of_speech: sense.part_of_speech, counterpart: sense.counterpart || word.content.counterpart,
    definition_ko: sense.definition_ko, definition_en: sense.definition_en };
}

// Letter-by-letter comparison of a wrong typed answer with the correct word, so the student sees
// exactly which letters were wrong. Returns null when the answer is too different to be a
// spelling slip (a different word altogether).
//   -> { typed: [{ ch, ok }], answer: [{ ch, ok }] }   ok = the letter is right and in place
export function spellingDiff(typed, content) {
  const mine = [...(typed || "").normalize("NFC").trim()];
  if (!mine.length) return null;
  const targets = [content.headword, ...(content.counterpart || "").split(/[,;/]/)]
    .map((s) => [...(s || "").normalize("NFC").replace(/\([^)]*\)/g, "").trim()])
    .filter((chars) => chars.length);

  let best = null;
  for (const answer of targets) {
    const marks = commonLetters(mine.map(lower), answer.map(lower));
    const score = marks.count / Math.max(mine.length, answer.length);
    if (!best || score > best.score) best = { answer, marks, score };
  }
  if (!best || best.score < 0.5) return null;
  return {
    typed: mine.map((ch, i) => ({ ch, ok: best.marks.a[i] })),
    answer: best.answer.map((ch, i) => ({ ch, ok: best.marks.b[i] })),
  };
}

const lower = (ch) => ch.toLowerCase();

// Longest common subsequence: marks the letters two spellings share, in order.
function commonLetters(a, b) {
  const rows = a.length + 1, cols = b.length + 1;
  const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const marks = { a: a.map(() => false), b: b.map(() => false), count: table[0][0] };
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) { marks.a[i++] = true; marks.b[j++] = true; }
    else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  return marks;
}
