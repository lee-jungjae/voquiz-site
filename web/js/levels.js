// The three levels of explanation, by grade. The server keeps a separate entry of a word for each
// (supabase/functions/lookup: BANDS), so the same word reads differently in each.
// `name` is a Korean key for i18n.
export const BANDS = [
  { id: "g3_5", label: "G3–5", grades: [3, 4, 5], name: "쉬운 설명" },
  { id: "g6_8", label: "G6–8", grades: [6, 7, 8], name: "조금 더 자세한 설명" },
  { id: "g9_12", label: "G9–12", grades: [9, 10, 11, 12], name: "깊이 있는 설명" },
];
export const bandOf = (grade) => BANDS.find((band) => band.grades.includes(Number(grade))) || BANDS[0];
