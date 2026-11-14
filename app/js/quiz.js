// Quiz rules (no UI, no network).
// - A quiz covers the words in the chosen range PLUS every word still marked "needs review".
// - A wrong answer marks the word "needs review" and resets its streak.
// - A word leaves the review pile only after MASTER_STREAK correct answers in a row.
export const MASTER_STREAK = 3;
const DAY = 24 * 60 * 60 * 1000;

// scope: {type:'days', days} | {type:'range', from:'YYYY-MM-DD', to:'YYYY-MM-DD'} | {type:'favorites'} | {type:'all'}
//        | {type:'review'} = only the words answered wrong and not yet cleared
export function inScope(word, scope, now = Date.now()) {
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

export function buildQuizSet(words, scope, now = Date.now()) {
  const picked = words.filter((w) => w.needs_review || inScope(w, scope, now));
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}

// Returns the fields to save after one answer.
export function applyAnswer(word, correct, now = new Date()) {
  const last_reviewed_at = now.toISOString();
  if (!correct) return { streak: 0, needs_review: true, last_reviewed_at };
  const streak = word.streak + 1;
  return {
    streak,
    needs_review: word.needs_review && streak < MASTER_STREAK,
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
export function makeQuestions(cards, pool) {
  return cards.map((word, i) => {
    const others = pool.filter((w) => w.term_norm !== word.term_norm);
    if (others.length < 3 || i % 2 === 0) return { word, kind: "type" };
    return { word, kind: "choice", options: shuffled([word, ...shuffled(others).slice(0, 3)]) };
  });
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
