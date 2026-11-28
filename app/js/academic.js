// The academic word of the day: which words it is chosen from, by grade.
//
//   grades 10-12  the New Academic Word List 1.2 (Browne, Culligan and Phillips, CC BY-SA 4.0),
//                 as it is already divided by grade in wordlists.js.
//   grades 3-9    words of the classroom: the words tasks are given in (compare, describe,
//                 analyze, justify…) and the core words of the school subjects (science, maths,
//                 social studies, language arts). These two lists were put together for this app
//                 (they are not a published list) and are kept short on purpose; they are meant
//                 to be replaced by a sourced list once one is chosen. Each is a plain list:
//                 correct it here.
const say = (text) => [...new Set(text.split(/\s+/).filter(Boolean))];

const PRIMARY = say(`
  compare describe explain predict observe measure estimate classify identify summarize
  sequence pattern example detail fact opinion evidence cause effect problem solution result
  record label diagram chart graph table data experiment material property habitat energy
  force matter cycle system structure function environment resource community culture region
  climate weather planet shadow magnet liquid solid temperature fraction equal amount total
  length width height area angle shape symbol value order similar different topic title
  author character setting event define discuss decide create design improve test review
  report research source scale direction distance location history future tradition rule law
  vote leader citizen trade goods service healthy balance`);

const MIDDLE = say(`
  analyze evaluate interpret summarize infer conclude justify support argue claim evidence
  reason perspective context concept theory hypothesis variable factor method process
  procedure structure function significant relevant accurate precise approximate consistent
  valid reliable bias source cite reference quote paraphrase theme tone symbol metaphor
  contrast distinct category classify define identify illustrate demonstrate indicate suggest
  imply assume predict estimate calculate data ratio proportion percent average range
  probability equation formula element compound mixture reaction cell organism ecosystem
  adapt evolve inherit climate erosion resource economy government democracy constitution
  revolution civilization empire colony migration population society conflict cooperate
  impact consequence benefit issue policy establish maintain require obtain achieve
  contribute participate communicate respond focus feature aspect role purpose strategy
  approach technique construct develop modify transform expand reduce decline sequence
  cycle phase period era global environment sustainable generate transfer convert absorb reflect`);

// The words for a grade (English only; the dictionary has the rest). upper: the grade's own list
// from wordlists.js, for grades 10 to 12.
export function academicWords(grade, upper = []) {
  if (grade >= 10 && upper.length) return upper.map(([english]) => english);
  return grade <= 5 ? PRIMARY : MIDDLE;
}
