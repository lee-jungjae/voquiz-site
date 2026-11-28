// Demo backend: no server, no Claude. Everything stays in this browser's localStorage.
// Used automatically while js/config.js is empty, so the UI can be tried right away.
import { parsePartial } from "./partial.js?v=0.1.28-tp80rp";
import { bandOf } from "./levels.js?v=0.1.28-tp80rp";
import { FULL } from "./demo_levels.js?v=0.1.28-tp80rp";

const USER_KEY = "wb_demo_user";
const WORDS_KEY = "wb_demo_words";
const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const SAMPLES = {
  democracy: {
    valid: true, suggestion: "", headword: "democracy", language: "en", counterpart: "민주주의",
    pronunciation: "/dɪˈmɑːkrəsi/", part_of_speech: "noun · 명사",
    definition_ko: "나라의 주인이 국민이고, 국민이 투표로 대표를 뽑아 나라의 일을 결정하는 제도.",
    definition_en: "A system in which the people hold the power and choose their leaders by voting.",
    hanja_word: "民主主義",
    hanja: [
      { char: "民", hun_eum: "백성 민", meaning_en: "people" },
      { char: "主", hun_eum: "주인 주", meaning_en: "owner, master" },
      { char: "主", hun_eum: "주인 주", meaning_en: "main" },
      { char: "義", hun_eum: "옳을 의", meaning_en: "principle" },
    ],
    word_parts: [
      { part: "demo-", meaning_ko: "사람들, 민중", meaning_en: "the people" },
      { part: "-cracy", meaning_ko: "다스림, 권력", meaning_en: "rule, power" },
    ],
    origin_ko: "고대 그리스어 demos(민중)와 kratos(권력)가 합쳐진 말이에요. 한자어 '민주'도 '백성(민)이 주인(주)'이라는 뜻이라, 두 언어가 같은 생각을 담고 있어요.",
    origin_en: "From Greek demos (the people) and kratos (power). The Korean word 민주 also means \"the people are the owners,\" so both languages tell the same story.",
    memory_tip_ko: "demo = 사람들(데모하는 사람들을 떠올려요) + cracy = 다스림 → 사람들이 다스린다.",
    memory_tip_en: "Think of a \"demo\" full of people, plus -cracy (rule): the people rule.",
    examples: [
      { ko: "우리 반은 민주주의 방식으로 투표해서 반장을 뽑았다.", en: "Our class chose its president by voting, just like in a democracy." },
      { ko: "민주주의에서는 모든 사람의 의견이 중요하다.", en: "In a democracy, everyone's voice matters." },
    ],
    related: [
      { kind: "four_character_idiom", text: "주권재민", hanja: "主權在民", meaning_ko: "나라의 주권은 국민에게 있다.", meaning_en: "Sovereignty rests with the people." },
    ],
  },
  노력: {
    valid: true, suggestion: "", headword: "노력", language: "ko", counterpart: "effort",
    pronunciation: "[노력]", part_of_speech: "명사 · noun",
    definition_ko: "어떤 일을 이루려고 몸과 마음을 다해 힘쓰는 것.",
    definition_en: "Working hard with your body and mind to reach a goal.",
    hanja_word: "努力",
    hanja: [
      { char: "努", hun_eum: "힘쓸 노", meaning_en: "to strive" },
      { char: "力", hun_eum: "힘 력", meaning_en: "strength" },
    ],
    word_parts: [],
    origin_ko: "'힘쓸 노'와 '힘 력'이 만난 한자어예요. 힘을 쓰고 또 힘을 쓴다는 뜻이라, 힘에 힘을 더한다는 느낌이에요.",
    origin_en: "A Sino-Korean word: 노 (to strive) + 력 (strength) — effort is strength on top of strength.",
    memory_tip_ko: "힘쓸 '노' + 힘 '력' → 힘을 두 번 쓰는 것이 노력!",
    memory_tip_en: "노 (strive) + 력 (strength): effort means using your strength again and again.",
    examples: [
      { ko: "매일 노력하면 피아노 실력이 늘 거야.", en: "If you make an effort every day, your piano skills will improve." },
      { ko: "그는 노력 끝에 시험에 합격했다.", en: "After a lot of effort, he passed the exam." },
    ],
    related: [
      { kind: "proverb", text: "티끌 모아 태산", hanja: "", meaning_ko: "작은 것도 꾸준히 모으면 큰 것이 된다.", meaning_en: "Many small efforts add up to something huge.", source_ko: "한국 속담", source_en: "Korean proverb" },
      { kind: "proverb", text: "Practice makes perfect.", hanja: "", meaning_ko: "꾸준히 연습하면 완벽해진다.", meaning_en: "Doing something again and again makes you good at it.", source_ko: "영어 속담 · 영미권", source_en: "English proverb" },
    ],
    synonyms: [{ en: "hard work", ko: "수고" }, { en: "endeavor", ko: "애씀" }],
    antonyms: [{ en: "laziness", ko: "게으름" }],
  },
  photosynthesis: {
    valid: true, suggestion: "", headword: "photosynthesis", language: "en", counterpart: "광합성",
    pronunciation: "/ˌfoʊtoʊˈsɪnθəsɪs/", part_of_speech: "noun · 명사",
    definition_ko: "식물이 햇빛, 물, 이산화탄소로 스스로 양분을 만드는 일.",
    definition_en: "The way plants make their own food from sunlight, water and carbon dioxide.",
    hanja_word: "光合成",
    hanja: [
      { char: "光", hun_eum: "빛 광", meaning_en: "light" },
      { char: "合", hun_eum: "합할 합", meaning_en: "to join" },
      { char: "成", hun_eum: "이룰 성", meaning_en: "to make" },
    ],
    word_parts: [
      { part: "photo-", meaning_ko: "빛", meaning_en: "light" },
      { part: "synthesis", meaning_ko: "합쳐 만들기", meaning_en: "putting together" },
    ],
    origin_ko: "그리스어 photo(빛)와 synthesis(합쳐 만들기)가 만난 말이에요. 한자어 '광합성'도 '빛(광)으로 합쳐(합) 이룬다(성)'는 뜻이라, 두 언어가 똑같은 방식으로 만든 단어예요.",
    origin_en: "From Greek photo (light) + synthesis (putting together). The Korean word 광합성 is built the same way: light, join, make.",
    memory_tip_ko: "photo는 사진(photo)처럼 '빛'! 빛으로 합쳐 만드는 일 → 광합성.",
    memory_tip_en: "photo means light, as in a photo. Made (synthesis) with light!",
    examples: [
      { ko: "식물은 광합성을 하려면 햇빛이 필요하다.", en: "Plants need sunlight for photosynthesis." },
      { ko: "광합성을 하면서 식물은 산소를 내보낸다.", en: "During photosynthesis, plants give off oxygen." },
    ],
    related: [],
  },
  friend: {
    valid: true, suggestion: "", headword: "friend", language: "en", counterpart: "친구",
    pronunciation: "/frend/", part_of_speech: "noun · 명사",
    definition_ko: "서로 가깝게 지내며 믿고 좋아하는 사람.",
    definition_en: "A person you know well, like and trust.",
    hanja_word: "親舊",
    hanja: [
      { char: "親", hun_eum: "친할 친", meaning_en: "close" },
      { char: "舊", hun_eum: "옛 구", meaning_en: "old, long-standing" },
    ],
    word_parts: [],
    origin_ko: "옛 영어 frēond에서 왔고, 원래 '사랑하는 사람'이라는 뜻이었어요. 한자어 '친구'는 '가깝고(친) 오래된(구) 사이'라는 뜻이에요.",
    origin_en: "From Old English frēond, 'one who loves'. The Korean word 친구 means someone close (친) for a long time (구).",
    memory_tip_ko: "friend 끝에는 end가 있어요. 끝(end)까지 함께하는 사이가 friend!",
    memory_tip_en: "friend ends with end: a friend stays with you to the end.",
    examples: [
      { ko: "그 애는 나의 가장 친한 친구다.", en: "She is my best friend." },
      { ko: "새 학교에서 친구를 많이 사귀었다.", en: "I made many friends at my new school." },
    ],
    related: [
      { kind: "proverb", text: "A friend in need is a friend indeed.", hanja: "", meaning_ko: "어려울 때 도와주는 친구가 진짜 친구다.", meaning_en: "A real friend is the one who helps when you are in trouble." },
      { kind: "four_character_idiom", text: "죽마고우", hanja: "竹馬故友", meaning_ko: "어릴 때부터 함께 놀며 자란 오랜 친구.", meaning_en: "A friend you have known since you were little.", source_ko: "사자성어 · 한자 문화권", source_en: "Four-character idiom from classical Chinese" },
    ],
    synonyms: [{ en: "pal", ko: "동무" }, { en: "companion", ko: "벗" }, { en: "buddy", ko: "짝꿍" }],
    antonyms: [{ en: "enemy", ko: "적" }, { en: "stranger", ko: "낯선 사람" }],
  },
  gravity: {
    valid: true, suggestion: "", headword: "gravity", language: "en", counterpart: "중력",
    pronunciation: "/ˈɡrævəti/", part_of_speech: "noun · 명사",
    definition_ko: "지구가 물체를 자기 쪽으로 끌어당기는 힘.",
    definition_en: "The force that pulls things toward the Earth.",
    hanja_word: "重力",
    hanja: [
      { char: "重", hun_eum: "무거울 중", meaning_en: "heavy" },
      { char: "力", hun_eum: "힘 력", meaning_en: "force" },
    ],
    word_parts: [
      { part: "grav-", meaning_ko: "무거운", meaning_en: "heavy" },
      { part: "-ity", meaning_ko: "~한 성질", meaning_en: "the quality of" },
    ],
    origin_ko: "라틴어 gravis(무거운)에서 왔어요. 한자어 '중력'도 '무거울 중 + 힘 력'이라, 두 언어 모두 '무거움'에서 출발한 단어예요.",
    origin_en: "From Latin gravis (heavy). The Korean word 중력 is also 'heavy' + 'force'.",
    memory_tip_ko: "grave(무거운, 심각한)와 같은 뿌리! 무겁게 끌어당기는 힘 = gravity.",
    memory_tip_en: "Same root as grave (heavy, serious): the heavy pull is gravity.",
    examples: [
      { ko: "공을 던지면 중력 때문에 다시 땅으로 떨어진다.", en: "A ball you throw falls back down because of gravity." },
      { ko: "달은 지구보다 중력이 약하다.", en: "Gravity is weaker on the Moon than on Earth." },
    ],
    related: [],
  },
  transport: {
    valid: true, suggestion: "", headword: "transport", language: "en", counterpart: "운송하다",
    pronunciation: "/trænˈspɔːrt/", part_of_speech: "verb · 동사",
    definition_ko: "사람이나 물건을 한 곳에서 다른 곳으로 옮기다.",
    definition_en: "To carry people or things from one place to another.",
    senses: [
      { part_of_speech: "verb · 동사", counterpart: "운송하다", definition_ko: "사람이나 물건을 한 곳에서 다른 곳으로 옮기다.", definition_en: "To carry people or things from one place to another.", example_ko: "이 트럭은 과일을 시장으로 운송해요.", example_en: "This truck transports fruit to the market.", tip_ko: "trans(건너) + port(나르다): 건너편으로 실어 나르는 모습을 떠올려요.", tip_en: "trans (across) + port (carry): picture carrying something across.", synonyms: [{ en: "carry", ko: "나르다" }, { en: "deliver", ko: "배달하다" }], antonyms: [] },
      { part_of_speech: "noun · 명사", counterpart: "교통수단", definition_ko: "버스, 기차처럼 사람이나 물건을 실어 나르는 탈것이나 방법.", definition_en: "A way of travelling or carrying things, such as a bus or a train.", example_ko: "우리 도시는 대중교통이 편리해요.", example_en: "Public transport is easy to use in our city.", tip_ko: "'나르다'가 이름이 되면 '나르는 것', 곧 버스와 기차예요.", tip_en: "Turn the action into a thing: what does the carrying? Buses and trains.", synonyms: [{ en: "transportation", ko: "교통" }, { en: "vehicle", ko: "탈것" }], antonyms: [] },
      { part_of_speech: "verb · 동사", counterpart: "다른 세계로 데려가다", definition_ko: "책이나 음악이 마치 다른 곳에 간 것처럼 느끼게 하다.", definition_en: "To make you feel as if you are in another place or time.", example_ko: "그 책은 나를 옛날 왕국으로 데려갔어요.", example_en: "The book transported me to an ancient kingdom.", tip_ko: "몸이 아니라 마음을 실어 나르는 거예요.", tip_en: "It carries your mind instead of your body.", synonyms: [{ en: "carry away", ko: "빠져들게 하다" }], antonyms: [{ en: "bore", ko: "지루하게 하다" }] },
    ],
    hanja_word: "運送",
    hanja: [
      { char: "運", hun_eum: "옮길 운", meaning_en: "to move, carry" },
      { char: "送", hun_eum: "보낼 송", meaning_en: "to send" },
    ],
    word_parts: [
      { part: "trans-", meaning_ko: "가로질러, 건너", meaning_en: "across" },
      { part: "port", meaning_ko: "나르다", meaning_en: "to carry" },
    ],
    origin_ko: "라틴어 trans(건너)와 portare(나르다)가 합쳐진 말이에요. port가 들어간 portable(들고 다닐 수 있는), import(수입하다)도 모두 '나르다'와 관련 있어요.",
    origin_en: "From Latin trans (across) + portare (to carry). The same \"port\" appears in portable, import, and export.",
    memory_tip_ko: "trans(건너) + port(나르다) → 건너편으로 나르다.",
    memory_tip_en: "trans (across) + port (carry): carry across.",
    examples: [
      { ko: "이 트럭은 채소를 시장으로 운송한다.", en: "This truck transports vegetables to the market." },
      { ko: "서울은 대중교통이 편리하다.", en: "Public transport is convenient in Seoul." },
    ],
    related: [],
  },
};

const placeholder = (term) => ({
  valid: true, suggestion: "", headword: term, language: /[가-힣]/.test(term) ? "ko" : "en",
  counterpart: "(데모)", pronunciation: "", part_of_speech: "",
  definition_ko: "데모 모드에서는 예시 단어(balance, photosynthesis, 노력, friend, democracy, gravity, transport)만 실제 설명이 나옵니다. Supabase를 연결하면 Claude가 설명을 만들어 줍니다.",
  definition_en: "Demo mode only has real entries for balance, photosynthesis, 노력, friend, democracy, gravity and transport. Connect Supabase to get entries written by Claude.",
  hanja_word: "", hanja: [], word_parts: [], origin_ko: "", origin_en: "",
  memory_tip_ko: "", memory_tip_en: "", examples: [], related: [],
});

export const getUser = () => read(USER_KEY, null);

export async function signIn() {
  const user = { id: "demo", email: "demo@example.com", grade: null };
  write(USER_KEY, user);
  return user;
}

export async function signOut() {
  localStorage.removeItem(USER_KEY);
}

export async function setGrade(grade) {
  const user = { ...getUser(), grade };
  write(USER_KEY, user);
  return user;
}

export async function saveProfile(data) {
  write(USER_KEY, { ...getUser(), ...data });
}

export async function publishRank() {}
// Pretend levels for the pretend classmates (the same one for the same name every time).
export async function levelsOf(who) {
  return (who || []).map((w) => ({ nickname: w.nickname, tag: w.tag, level: 1 + ([...String(w.nickname)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + (w.tag || 0)) % 24 }));
}

// A few pretend classmates, so the rankings have something to show.
export async function getRankings(grade, friends = false) {
  const me = getUser();
  const mine = read(WORDS_KEY, []);
  const others = [
    { nickname: "하늘", tag: 311, points: 210, found: 9, words: 64, streak: 17, grade: 3, character: "rabbit", motto: "m02" },
    { nickname: "", tag: 482, points: 130, found: 14, words: 51, streak: 31, grade: 7, character: "pudding", motto: "" },
    { nickname: "Mina", tag: 205, points: 85, found: 3, words: 77, streak: 12, grade: 7, character: "mushroom", motto: "m03" },
    { nickname: "준서", tag: 733, points: 40, found: 6, words: 22, streak: 8, grade: 3, character: "bubble", motto: "" },
    { nickname: "", tag: 918, points: 12, found: 0, words: 8, streak: 3, grade: 7, character: "bubble", motto: "" },
  ];
  // "points" is what was earned this week (it starts again on Monday).
  const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const week = monday.toLocaleDateString("sv");
  const self = {
    nickname: me.nickname || "", tag: 851, me: true, points: me.weekly?.week === week ? me.weekly.earned || 0 : 0,
    character: me.shop?.character || "bubble", motto: me.motto || "",
    found: mine.filter((w) => w.discovered).length, words: mine.length,
    streak: me.challenge?.best || 0, grade: me.grade,
  };
  // The friends ranking keeps only the classmates on the friends list.
  const names = friends ? friendList().filter((f) => f.status === "accepted").map((f) => f.other.tag) : null;
  if (names) others.splice(0, others.length, ...others.filter((row) => names.includes(row.tag)));
  const board = (key, rows = [...others, self]) => rows
    .sort((a, b) => b[key] - a[key])
    .map((row, i) => ({ rank: i + 1, nickname: row.nickname, tag: row.tag, score: row[key], me: !!row.me, character: row.character, motto: row.motto }));
  await new Promise((done) => setTimeout(done, 300));
  return {
    week, tier: me.weekly?.tier || 0, points: board("points"), found: board("found"), words: board("words"),
    streak: board("streak", [...others, self].filter((row) => row.grade === grade)),
  };
}

export async function lookup(term, onPartial) {
  const termNorm = term.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  if (!/^[\p{L}\p{M}' -]{1,40}$/u.test(termNorm)) {
    return { valid: false, content: { suggestion: "" }, word: null };
  }
  // A few words have a whole entry for each level (demo_levels.js): the student's own level is shown.
  const full = FULL[termNorm];
  const content = full?.[bandOf(getUser()?.grade).id] ?? SAMPLES[termNorm] ?? placeholder(termNorm);
  const words = read(WORDS_KEY, []);
  // A word not looked up before arrives a little at a time, like a real new word does.
  if (!words.some((w) => w.term_norm === termNorm)) {
    const text = JSON.stringify(content);
    await new Promise((done) => setTimeout(done, 700));
    const step = Math.max(9, Math.ceil(text.length / 260)); // a long entry still arrives in about five seconds
    for (let i = 0; i < text.length; i += step) {
      onPartial?.(parsePartial(text.slice(0, i)));
      await new Promise((done) => setTimeout(done, 18));
    }
  }
  const now = new Date().toISOString();
  let word = words.find((w) => w.term_norm === termNorm);
  let isNew = false;
  if (word) {
    word.search_count += 1;
    word.last_searched_at = now;
    if (full) word.content = content;
  } else {
    word = {
      term_norm: termNorm, headword: content.headword, favorite: false, search_count: 1,
      first_searched_at: now, last_searched_at: now, needs_review: false, streak: 0,
      last_reviewed_at: null, content,
      discovered: !SAMPLES[termNorm] && !full, // in the demo, any word outside the samples counts as a first find
    };
    words.push(word);
    isNew = true;
  }
  write(WORDS_KEY, words);
  return { valid: true, content, word, discovered: isNew && word.discovered };
}

// Another group's explanation of a word (only to look at). The demo has no server to write one, so
// the sample words carry a simpler and a fuller meaning here; any other word stays as it is.
const LEVELS = {
  gravity: {
    g3_5: ["물건을 땅으로 끌어당기는 힘이에요.", "The force that pulls things down to the ground."],
    g6_8: ["질량이 있는 물체가 서로 끌어당기는 힘. 물건이 아래로 떨어지는 것도 이 힘 때문이에요.", "The force by which objects with mass pull on each other. It is why things fall toward the Earth."],
    g9_12: ["질량을 가진 모든 물체 사이에 작용하는 인력으로, 두 질량의 곱에 비례하고 거리의 제곱에 반비례한다.", "The attractive force between all masses, proportional to the product of the masses and inversely proportional to the square of the distance between them."],
  },
  photosynthesis: {
    g3_5: ["식물이 햇빛으로 스스로 밥을 만드는 일이에요.", "How plants make their own food from sunlight."],
    g6_8: ["식물이 빛 에너지를 써서 물과 이산화탄소로 양분(포도당)을 만들고 산소를 내보내는 과정.", "The process in which plants use light energy to turn water and carbon dioxide into food (glucose), giving off oxygen."],
    g9_12: ["엽록체에서 빛 에너지를 화학 에너지로 바꾸어, 이산화탄소와 물로부터 포도당을 합성하고 산소를 방출하는 과정.", "The process in chloroplasts that converts light energy into chemical energy, synthesizing glucose from carbon dioxide and water and releasing oxygen."],
  },
  friend: {
    g3_5: ["같이 놀고 서로 좋아하는 사람이에요.", "Someone you like and enjoy playing with."],
    g6_8: ["서로 믿고 마음이 통해 가깝게 지내는 사람.", "A person you know well, trust and like spending time with."],
    g9_12: ["혈연이나 이해관계가 아니라 신뢰와 애정으로 맺어진 가까운 사람.", "A person bound to another by mutual trust and affection rather than by family ties or interest."],
  },
  democracy: {
    g3_5: ["모두가 함께 의견을 내고 투표로 정하는 방법이에요.", "A way of deciding things together, where everyone gets a vote."],
    g6_8: ["국민이 투표로 대표를 뽑아 나라의 일을 결정하는 정치 제도.", "A system of government in which the people choose their leaders by voting."],
    g9_12: ["주권이 국민에게 있고, 국민이 직접 또는 선출한 대표를 통해 권력을 행사하는 정치 체제.", "A political system in which sovereignty rests with the people, who exercise power directly or through elected representatives."],
  },
  노력: {
    g3_5: ["무엇을 잘하려고 힘을 쓰는 것이에요.", "Trying hard to do something well."],
    g6_8: ["목표를 이루려고 몸과 마음을 다해 애쓰는 것.", "Working hard with your body and mind to reach a goal."],
    g9_12: ["목적을 달성하기 위해 정신적·육체적 힘을 지속적으로 기울이는 일.", "The sustained use of mental and physical energy to achieve a purpose."],
  },
  transport: {
    g3_5: ["사람이나 물건을 다른 곳으로 옮기는 것이에요.", "Moving people or things from one place to another."],
    g6_8: ["사람이나 물건을 탈것으로 한 곳에서 다른 곳으로 실어 나르는 일.", "Carrying people or goods from one place to another in a vehicle."],
    g9_12: ["사람이나 화물을 한 지점에서 다른 지점으로 이동시키는 일, 또는 그 수단과 체계.", "The movement of people or goods from one point to another, or the means and system by which this is done."],
  },
};
const levelSeen = new Set(); // "term|band" already shown once in this visit
export async function lookupLevel(term, band, onPartial) {
  const termNorm = term.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  const word = read(WORDS_KEY, []).find((w) => w.term_norm === termNorm);
  const base = word?.content ?? SAMPLES[termNorm] ?? placeholder(termNorm);
  await new Promise((done) => setTimeout(done, 700));
  if (FULL[termNorm]?.[band]) {
    const key = `${termNorm}|${band}`;
    if (!levelSeen.has(key)) {
      levelSeen.add(key);
      const text = JSON.stringify(FULL[termNorm][band]);
      const step = Math.max(9, Math.ceil(text.length / 260));
      for (let i = 0; i < text.length; i += step) {
        onPartial?.(parsePartial(text.slice(0, i)));
        await new Promise((done) => setTimeout(done, 18));
      }
    }
    return { valid: true, content: FULL[termNorm][band], word: null, view: band };
  }
  const level = LEVELS[termNorm]?.[band];
  if (!level) return { valid: true, content: base, word: null, view: band };
  const [definition_ko, definition_en] = level;
  const senses = Array.isArray(base.senses) && base.senses.length ? [{ ...base.senses[0], definition_ko, definition_en }, ...base.senses.slice(1)] : base.senses;
  return { valid: true, content: { ...base, definition_ko, definition_en, senses }, word: null, view: band };
}

export async function listWords() {
  return read(WORDS_KEY, []).sort((a, b) => b.last_searched_at.localeCompare(a.last_searched_at));
}

export async function updateWord(termNorm, patch) {
  write(WORDS_KEY, read(WORDS_KEY, []).map((w) => (w.term_norm === termNorm ? { ...w, ...patch } : w)));
}

export async function deleteWord(termNorm) {
  write(WORDS_KEY, read(WORDS_KEY, []).filter((w) => w.term_norm !== termNorm));
}

// ---------- duels: pretend classmates who challenge and answer ----------
const DUELS_KEY = "wb_demo_duels";
const RIVALS = [
  { id: "r1", nickname: "하린", tag: 311, grade: 5, wins: 7, character: "rabbit" },
  { id: "r2", nickname: "Mina", tag: 205, grade: 7, wins: 4, character: "fox" },
  { id: "r3", nickname: "", tag: 482, grade: 6, wins: 2, character: "robot" },
  { id: "r4", nickname: "준서", tag: 733, grade: 4, wins: 1, character: "dino" },
];
const rivalOf = (id) => RIVALS.find((r) => r.id === id) || { id, nickname: "친구", tag: 100, grade: 5, wins: 0, character: "bubble" };
// A run of right answers spread over three minutes, as a real player would leave behind.
const fakeMarks = (score) => Array.from({ length: score }, (_, i) => Math.round(((i + 1) / (score + 1)) * 170 + Math.random() * 6));
function duels() {
  let list = read(DUELS_KEY, null);
  if (!list) {
    // The first time, a classmate has already sent a challenge.
    list = [{
      id: "d-first", role: "opponent", other: rivalOf("r1"), grade: Math.min(getUser().grade || 5, 5), seed: 20261114,
      seconds: 180, my_score: null, their_score: 12, my_character: null, their_character: "rabbit", their_marks: fakeMarks(12),
      status: "open", claimed: false, created_at: new Date().toISOString(),
    }];
    write(DUELS_KEY, list);
  }
  return list;
}
export async function listDuels() { return duels(); }
export async function duelPlayers() { return RIVALS; }
export async function findPlayer(email) {
  return /@/.test(email) ? { id: "r-mail", nickname: email.split("@")[0].slice(0, 12), tag: 640, grade: getUser().grade || 5, no_duels: false } : null;
}
export async function createDuel({ opponent, grade, seed, score, marks = [], seconds = 180 }) {
  const list = duels();
  // The pretend classmate answers at once, sometimes better and sometimes worse.
  const theirs = Math.max(0, score + Math.round((Math.random() - 0.55) * 6));
  const rival = opponent === "r-mail" ? { id: opponent, nickname: "friend", tag: 640, grade, character: "cat" } : rivalOf(opponent);
  list.unshift({
    id: `d-${Date.now()}`, role: "challenger", other: rival, grade, seed, seconds, my_score: score, their_score: theirs,
    my_marks: marks, finished_at: new Date().toISOString(),
    my_character: getUser().shop?.character || "bubble", their_character: rival.character,
    their_marks: Array.from({ length: theirs }, (_, i) => Math.round(((i + 1) / (theirs + 1)) * (seconds - 6) + Math.random() * 4)),
    status: "done", claimed: false, created_at: new Date().toISOString(),
  });
  write(DUELS_KEY, list);
  return list[0].id;
}
export async function answerDuel(id, score, character, marks = []) {
  const list = duels();
  const duel = list.find((d) => d.id === id);
  if (!duel || duel.status !== "open") throw Object.assign(new Error("duel_closed"), { code: "duel_closed" });
  Object.assign(duel, { my_score: score, my_character: character, my_marks: marks, status: "done", finished_at: new Date().toISOString() });
  write(DUELS_KEY, list);
}
export async function claimDuel(id) {
  const list = duels();
  const duel = list.find((d) => d.id === id);
  if (!duel || duel.claimed || duel.status === "open") return false;
  duel.claimed = true;
  write(DUELS_KEY, list);
  return true;
}
// Last week's classmates of the tier (pretend ones).
export async function leagueLastWeek() {
  return [
    { nickname: "하늘", tag: 311, character: "rabbit", score: 230 },
    { nickname: "Mina", tag: 205, character: "mushroom", score: 120 },
    { nickname: "준서", tag: 733, character: "bubble", score: 45 },
  ];
}
export async function duelRankings(friends = false) {
  const mine = duels().filter((d) => d.status === "done" && d.my_score > d.their_score).length;
  const tags = friends ? friendList().filter((f) => f.status === "accepted").map((f) => f.other.tag) : null;
  return [...RIVALS.filter((r) => !tags || tags.includes(r.tag)).map((r) => ({ nickname: r.nickname, tag: r.tag, score: r.wins })), { nickname: getUser().nickname || "", tag: 851, score: mine, me: true }]
    .sort((a, b) => b.score - a.score).map((row, i) => ({ rank: i + 1, me: false, ...row }));
}
export async function setNoDuels() {}

// ---------- friends and invite codes ----------
const FRIENDS_KEY = "wb_demo_friends";
const INVITES_KEY = "wb_demo_invites";
const fail = (code) => { throw Object.assign(new Error(code), { code, status: 400 }); };
function friendList() {
  let list = read(FRIENDS_KEY, null);
  if (!list) {
    // Two friends already, and one classmate waiting for an answer.
    list = [
      { id: "f1", status: "accepted", other: rivalOf("r1") },
      { id: "f2", status: "accepted", other: rivalOf("r2") },
      { id: "f4", status: "incoming", other: rivalOf("r4") },
    ];
    write(FRIENDS_KEY, list);
  }
  return list;
}
export async function listFriends() { return friendList(); }
export async function friendsSeen() { return [{ id: "r1", hours: 0 }, { id: "r2", hours: 5 }, { id: "r3", hours: 400 }, { id: "r4", hours: 100 }]; }
// Points given between friends: one gift waits to begin with; giving is remembered for the day.
const GIFTS_KEY = "wb_demo_gifts";
function giftBox() {
  let box = read(GIFTS_KEY, null);
  if (!box) {
    const from = ({ id, nickname, tag }) => ({ id, nickname, tag });
    box = { sent: {}, waiting: [{ id: "g-first", points: 10, at: new Date().toISOString(), from: from(rivalOf("r1")) }], got: [] };
    write(GIFTS_KEY, box);
  }
  return box;
}
export async function pointGifts(day) {
  const box = giftBox();
  return { sent: Object.keys(box.sent).filter((id) => box.sent[id] === day), waiting: box.waiting, got: box.got };
}
export async function sendPointGift(friend, day) {
  const box = giftBox();
  if (box.sent[friend] === day) fail("gift_already");
  box.sent[friend] = day;
  write(GIFTS_KEY, box);
}
export async function claimPointGifts(from) {
  const box = giftBox();
  const gifts = box.waiting.filter((g) => !from || g.from.id === from);
  box.got = [...gifts.map((g) => ({ points: g.points, at: new Date().toISOString(), from: g.from })), ...box.got].slice(0, 20);
  box.waiting = box.waiting.filter((g) => !gifts.includes(g));
  write(GIFTS_KEY, box);
  return { points: gifts.reduce((sum, g) => sum + g.points, 0), gifts };
}
export async function requestFriend(email) {
  if (!/@/.test(email)) fail("friend_nobody");
  const list = friendList();
  const name = email.split("@")[0].slice(0, 12);
  if (list.some((f) => f.other.nickname === name)) fail(list.find((f) => f.other.nickname === name).status === "accepted" ? "friend_already" : "friend_pending");
  list.push({ id: `f-${Date.now()}`, status: "outgoing", other: { id: `r-${name}`, nickname: name, tag: 640, grade: getUser().grade || 5, no_duels: false } });
  write(FRIENDS_KEY, list);
  return "pending";
}
export async function answerFriend(id, accept) {
  let list = friendList();
  const friend = list.find((f) => f.id === id);
  if (!friend) fail("friend_gone");
  if (accept) friend.status = "accepted";
  else list = list.filter((f) => f.id !== id);
  write(FRIENDS_KEY, list);
}
export async function removeFriend(id) {
  write(FRIENDS_KEY, friendList().filter((f) => f.id !== id));
}
export async function myInvites() {
  let codes = read(INVITES_KEY, null);
  if (!codes) {
    codes = ["7K2M9A", "B4X8QD", "N6T3HV", "E9R5WC", "P2J7YF"].map((code, i) => ({ code, used: i === 0, by: i === 0 ? { nickname: "하린", tag: 311 } : null }));
    write(INVITES_KEY, codes);
  }
  return codes;
}
export async function useInvite(code) {
  const clean = code.trim().toUpperCase();
  if (clean.length !== 6) fail("invite_invalid");
  if (read("wb_demo_invited", false)) fail("invite_once");
  if ((await myInvites()).some((c) => c.code === clean)) fail("invite_self");
  write("wb_demo_invited", true);
  write("wb_demo_member", true);
  const list = friendList();
  list.push({ id: `f-${Date.now()}`, status: "accepted", other: rivalOf("r3") });
  write(FRIENDS_KEY, list);
  return { nickname: "", tag: 482 };
}

// Invite only: the demo student is a member unless wb_demo_member says otherwise (to try the gate).
// For trying the update notice: localStorage wb_demo_version = {"latest":"9.0.0","minimum":"0.1.0"}
export async function appVersion() { return read("wb_demo_version", null); }
// For trying server settings: localStorage wb_demo_config = {"streak":{"step":5}}
export async function appConfig() { return read("wb_demo_config", {}); }
// For trying notices: localStorage wb_demo_notices = [{"id":1,"kind":"news","title":{"ko":"..."},"body":{"ko":"..."},"action":"shop"}]
// ("below":"0.1.19" on a notice shows it only to versions under that one; try with ?v=0.1.18 in the address.)
export async function notices() { return read("wb_demo_notices", []); }
export async function isMember() { return read("wb_demo_member", true); }
export async function setDuelFrom() {}

// ---------- VOQUIZ Plus: any coupon that starts with VOQUIZ gives a month ----------
const PLAN_KEY = "wb_demo_plan";
export async function myPlan() {
  const until = read(PLAN_KEY, null);
  return { plus: Boolean(until && new Date(until) > new Date()), until };
}
export async function redeemCoupon(code) {
  const clean = code.trim().toUpperCase();
  if (!clean.startsWith("VOQUIZ")) fail("coupon_invalid");
  const used = read("wb_demo_coupons", []);
  if (used.includes(clean)) fail("coupon_used");
  write("wb_demo_coupons", [...used, clean]);
  const from = Math.max(Date.now(), new Date(read(PLAN_KEY, 0) || 0).getTime());
  const until = new Date(from + 30 * 24 * 60 * 60 * 1000).toISOString();
  write(PLAN_KEY, until);
  return { plus: true, until };
}

// For a page that shows the app as a try-out (the public home page): a student who is already
// signed in, with a few words looked up over two days, so every screen has something on it.
export function seed(grade = 5) {
  if (!getUser()) write(USER_KEY, { id: "demo", email: "demo@example.com", grade, points: 120, nickname: "", welcome: "bubble" });
  if (read(WORDS_KEY, []).length) return;
  const day = 24 * 60 * 60 * 1000;
  const words = ["gravity", "transport", "democracy", "friend", "노력", "photosynthesis"].map((term, i) => {
    const when = new Date(Date.now() - (i < 3 ? day : 0) - (6 - i) * 60 * 1000).toISOString();
    // The same entry a search for the word gives: the whole one of the student's level where there is one.
    const content = FULL[term]?.[bandOf(grade).id] ?? SAMPLES[term];
    return {
      term_norm: term, headword: content.headword, favorite: term === "friend", search_count: 1,
      first_searched_at: when, last_searched_at: when, needs_review: term === "gravity", streak: 0,
      last_reviewed_at: null, content, discovered: term === "photosynthesis",
    };
  });
  write(WORDS_KEY, words);
}

// Leaving: the try-out student and everything saved for them is cleared.
export async function deleteAccount() {
  for (const key of Object.keys(localStorage)) if (key.startsWith("wb_demo_")) localStorage.removeItem(key);
}
