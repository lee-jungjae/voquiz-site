// The academic word of the day: a term of a school subject, a step harder than the student's own
// grade, so that the day's word is a chance to meet the real vocabulary of a field
// ("photosynthesis", not "plant"). Five fields take turns, a day each.
//
// The words are in academic-data.js (1,000 a grade: 200 a field), built by tools/academic_build.rb
// from the levelled lists in prefill/academic/. They were written and levelled with Claude and
// checked for form only; they are not a published list. See academic-words.md.
import { ACADEMIC } from "./academic-data.js?v=0.1.28-tp81o5";

export const FIELDS = [["science", "과학"], ["math", "수학"], ["social", "사회"], ["language", "언어"], ["arts", "예술·기술"]];

// The field of a day (the same for everyone): they take turns, day after day.
export function academicField(dayNumber) {
  return FIELDS[((dayNumber % FIELDS.length) + FIELDS.length) % FIELDS.length];
}
// The words of a grade in a field.
export function academicWords(grade, field) {
  return String(ACADEMIC[Math.min(12, Math.max(3, grade))]?.[field] || "").split(" ").filter(Boolean);
}
