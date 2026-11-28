// Sixty more mascot characters, sorted by what they are: animals, plants and fruit, desserts,
// everyday objects. They follow the same rules as the ones in characters.js (same skeleton, same
// face, same animations); only the silhouette, colours and decorations differ. To keep sixty
// drawings consistent, they are put together from a few shared body shapes and small helpers.

// ----- body shapes (the face sits around x 100, y 84; legs join at y 108) -----
const B = {
  round: "M66 82 a34 32 0 1 0 68 0 a34 32 0 1 0 -68 0 z",
  blob: "M88 50 h24 a26 26 0 0 1 26 26 v14 a22 22 0 0 1 -22 22 h-32 a22 22 0 0 1 -22 -22 v-14 a26 26 0 0 1 26 -26 z",
  tall: "M100 44 a30 30 0 0 1 30 30 v26 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 v-26 a30 30 0 0 1 30 -30 z",
  box: "M72 52 h56 a8 8 0 0 1 8 8 v44 a8 8 0 0 1 -8 8 h-56 a8 8 0 0 1 -8 -8 v-44 a8 8 0 0 1 8 -8 z",
  soft: "M76 52 h48 a14 14 0 0 1 14 14 v32 a14 14 0 0 1 -14 14 h-48 a14 14 0 0 1 -14 -14 v-32 a14 14 0 0 1 14 -14 z",
  egg: "M100 44 q32 6 34 42 a26 26 0 0 1 -26 26 h-16 a26 26 0 0 1 -26 -26 q2 -36 34 -42 z",
  drop: "M100 40 q34 34 34 50 a22 22 0 0 1 -22 22 h-24 a22 22 0 0 1 -22 -22 q0 -16 34 -50 z",
  cup: "M70 56 h60 l-6 50 a7 7 0 0 1 -7 6 h-34 a7 7 0 0 1 -7 -6 z",
  wide: "M70 62 h60 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10 z",
  tri: "M100 44 q6 0 10 8 l28 50 q4 10 -8 10 h-60 q-12 0 -8 -10 l28 -50 q4 -8 10 -8 z",
  cloud: "M70 112 h60 a18 18 0 0 0 6 -35 a16 16 0 0 0 -22 -14 a20 20 0 0 0 -36 2 a15 15 0 0 0 -16 16 a17 17 0 0 0 8 31 z",
  tulip: "M68 58 l16 12 l16 -16 l16 16 l16 -12 v30 a26 26 0 0 1 -26 26 h-12 a26 26 0 0 1 -26 -26 z",
};

// ----- small parts -----
const dots = (list, fill) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join("");
const line = (d, stroke, width = 2.4) =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const shape = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const ellipse = (cx, cy, rx, ry, fill) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const shine = line("M78 62 q9 -8 22 -8", "#fff", 4).replace("/>", ' opacity=".55"/>');
const muzzle = (fill) => ellipse(100, 93, 13, 9, fill);
const earsRound = (fill, inner) => dots([[72, 56, 12], [128, 56, 12]], fill) + (inner ? dots([[72, 56, 6], [128, 56, 6]], inner) : "");
const earsBig = (fill, inner) => dots([[64, 58, 17], [136, 58, 17]], fill) + (inner ? dots([[64, 58, 10], [136, 58, 10]], inner) : "");
const earsPointy = (fill, inner) =>
  `<path d="M68 66 l2 -26 l22 14 z M132 66 l-2 -26 l-22 14 z" fill="${fill}" stroke="${fill}" stroke-width="3" stroke-linejoin="round"/>` +
  (inner ? shape("M74 58 l1 -11 l9 6 z M126 58 l-1 -11 l-9 6 z", inner) : "");
const leaf = (x, y, fill) => shape(`M${x} ${y} q12 -14 22 -4 q-8 10 -22 4 z`, fill);
const leafyTop = (fill) => shape("M100 52 l-16 -4 l10 8 l-8 8 l14 -6 l14 6 l-8 -8 l10 -8 z", fill);
// n circles of radius r on a ring of radius R around the face (petals, manes)
const ring = (n, R, r, fill) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `<circle cx="${(100 + Math.cos(a) * R).toFixed(1)}" cy="${(82 + Math.sin(a) * R).toFixed(1)}" r="${r}" fill="${fill}"/>`;
  }).join("");

const c = (id, name, group, vibe, cost, body, fill, limb, more = {}) => ({ id, name, group, vibe, cost, body, fill, limb, ...more });

export const MORE_CHARACTERS = [
  // ===================== animals =====================
  c("bear", "곰돌이", "동물", "귀여움", 150, B.round, "#c99466", "#9a6a40", { back: earsRound("#c99466", "#f1d3b3"), deco: muzzle("#f6e2c8") }),
  c("panda", "판다", "동물", "귀여움", 300, B.round, "#ffffff", "#3a3a4a", { stroke: "#d7d7e0", back: earsRound("#3a3a4a"), deco: dots([[86, 82, 10], [114, 82, 10]], "#d5d5e2") }),
  c("fox", "여우", "동물", "쿨함", 400, B.round, "#ff9a4a", "#d96f1f", {
    back: earsPointy("#ff9a4a", "#fff") + shape("M132 104 q24 0 20 -26 q-10 4 -22 18 z", "#ff9a4a"),
    deco: shape("M70 92 q30 -14 60 0 q-6 22 -30 22 q-24 0 -30 -22 z", "#fff"),
  }),
  c("dog", "멍멍이", "동물", "귀여움", 200, B.round, "#f3d9b1", "#b98a55", {
    deco: dots([[114, 82, 11]], "#e3bd8a") + shape("M70 58 q-18 2 -14 32 q12 4 16 -14 z M130 58 q18 2 14 32 q-12 4 -16 -14 z", "#b07a45"),
  }),
  c("pig", "꿀꿀이", "동물", "엽기", 250, B.round, "#ffb6c8", "#e88aa3", {
    back: shape("M72 58 l4 -14 l12 8 z M128 58 l-4 -14 l-12 8 z", "#ff9db5"),
    deco: ellipse(100, 99, 11, 6.5, "#ff93ad") + dots([[96, 99, 1.7], [104, 99, 1.7]], "#d9607f"),
  }),
  c("frog", "개굴이", "동물", "엽기", 250, B.wide, "#86d672", "#4fa63f", { back: dots([[82, 62, 13], [118, 62, 13]], "#86d672"), deco: ellipse(100, 105, 20, 6, "#d8f5c9") }),
  c("chick", "삐약이", "동물", "귀여움", 150, B.egg, "#ffe066", "#f29f3d", { topper: line("M100 46 q-6 -10 -12 -8 M100 46 q0 -12 6 -12 M100 46 q8 -8 12 -4", "#f2b01e", 3) }),
  c("duck", "꽥꽥이", "동물", "엽기", 200, B.round, "#fff1a8", "#f29f3d", { deco: ellipse(100, 94, 13, 6.5, "#ffa53d"), topper: line("M100 50 q-2 -10 6 -12", "#f2c84b", 4) }),
  c("koala", "코코", "동물", "귀여움", 350, B.round, "#b9bfcc", "#8a90a0", { back: earsBig("#b9bfcc", "#e8eaf2"), deco: ellipse(100, 84, 4.5, 5.5, "#4a4f63") }),
  c("mouse", "찍찍이", "동물", "귀여움", 200, B.round, "#dfe3ea", "#a9afbd", { back: earsBig("#dfe3ea", "#ffc2d4") + line("M132 106 q22 4 22 -16", "#e9a3b8", 3.5) }),
  c("lion", "사자왕", "동물", "멋짐", 1500, B.round, "#ffc857", "#c97b22", { special: true, back: ring(12, 36, 13, "#e08a2c"), deco: muzzle("#fff1cf") }),
  c("tiger", "호랑이", "동물", "멋짐", 900, B.round, "#ffab4a", "#c96f1c", {
    back: earsRound("#ffab4a", "#fff"),
    deco: muzzle("#fff3e0") + line("M100 52 v8 M90 54 l2 7 M110 54 l-2 7 M68 76 h8 M68 86 h7 M132 76 h-8 M132 86 h-7", "#5c3a1a", 3),
  }),
  c("cow", "얼룩이", "동물", "엽기", 350, B.soft, "#ffffff", "#6b6b7a", {
    stroke: "#d9d9de",
    deco: shape("M62 66 a14 14 0 0 1 14 -14 h14 q2 14 -12 18 q-8 2 -16 -4 z M138 98 a14 14 0 0 1 -14 14 h-12 q-2 -12 10 -16 q8 -2 16 2 z", "#6b6b7a") + ellipse(100, 99, 12, 6.5, "#ffc2d4"),
    topper: line("M78 52 q-6 -10 -2 -14 M122 52 q6 -10 2 -14", "#c9b58f", 5),
  }),
  c("sheep", "양양이", "동물", "귀여움", 300, B.cloud, "#fffaf0", "#6b6b7a", { stroke: "#e6dcc8", back: ellipse(60, 86, 8, 5, "#6b6b7a") + ellipse(140, 86, 8, 5, "#6b6b7a") }),
  c("hedgehog", "고슴이", "동물", "쿨함", 500, B.blob, "#f0d6b3", "#b08a5a", {
    back: shape("M60 86 l-9 -8 l11 -2 l-7 -12 l13 2 l-3 -13 l12 7 l2 -13 l10 9 l6 -13 l8 11 l8 -11 l4 13 l10 -9 l1 13 l12 -7 l-4 13 l12 -2 l-6 12 l10 2 l-8 8 z", "#8a6240"),
  }),
  c("whale", "고래", "동물", "멋짐", 600, B.wide, "#7fbfff", "#4a90d9", {
    back: shape("M138 88 q14 -2 18 -14 q4 14 -6 24 z", "#7fbfff"),
    deco: shape("M60 100 q40 12 80 0 v2 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10 z", "#e6f3ff"),
    topper: line("M100 60 v-8 M100 52 q-8 -8 -12 -2 M100 52 q8 -8 12 -2", "#7fd0ff", 3.5),
  }),
  c("bee", "붕붕이", "동물", "귀여움", 400, B.egg, "#ffd84d", "#3a3a4a", {
    back: '<ellipse cx="66" cy="60" rx="16" ry="10" fill="#dff3ff" stroke="#a9d0f5" stroke-width="2" transform="rotate(-25 66 60)"/><ellipse cx="134" cy="60" rx="16" ry="10" fill="#dff3ff" stroke="#a9d0f5" stroke-width="2" transform="rotate(25 134 60)"/>',
    deco: line("M82 55 q18 -6 36 0 M72 103 q28 9 56 0", "#3a3a4a", 5),
    topper: line("M94 46 q-4 -10 -10 -10 M106 46 q4 -10 10 -10", "#3a3a4a", 2.4) + dots([[83, 36, 2.6], [117, 36, 2.6]], "#3a3a4a"),
  }),
  c("ladybug", "무당이", "동물", "귀여움", 350, B.round, "#f25c54", "#3a3a4a", {
    deco: dots([[74, 66, 5], [126, 66, 5], [70, 98, 5], [130, 98, 5], [100, 56, 4]], "#3a3a4a"),
    topper: line("M92 52 q-4 -10 -10 -10 M108 52 q4 -10 10 -10", "#3a3a4a", 2.6),
  }),
  c("turtle", "꼬북이", "동물", "쿨함", 450, B.wide, "#8fd694", "#4fa65a", {
    topper: shape("M62 72 a38 30 0 0 1 76 0 z", "#5fae6a") + line("M82 50 l7 22 M118 50 l-7 22 M100 43 v29", "#3f8a4c", 2.2),
  }),
  c("owl", "부엉이", "동물", "멋짐", 700, B.egg, "#b98a5e", "#8a6240", {
    back: shape("M74 58 l-4 -18 l18 8 z M126 58 l4 -18 l-18 8 z", "#8a6240"),
    deco: dots([[86, 82, 11], [114, 82, 11]], "#f3e3c8") + ellipse(100, 104, 18, 7, "#e9d2b0"),
  }),

  // ===================== plants and fruit =====================
  c("tulip", "튤립", "식물·과일", "귀여움", 200, B.tulip, "#ff86a8", "#4fa65a"),
  c("sunflower", "해바라기", "식물·과일", "멋짐", 500, B.round, "#f2b01e", "#4fa65a", { back: ring(12, 36, 13, "#ffd84d"), deco: shine }),
  c("sproutpot", "새싹이", "식물·과일", "귀여움", 150, B.cup, "#d98a5f", "#a85f3a", {
    deco: shape("M66 54 h68 a3 3 0 0 1 3 3 v6 h-74 v-6 a3 3 0 0 1 3 -3 z", "#c2714a"),
    topper: line("M100 54 v-13", "#4fa65a", 3.5) + shape("M100 42 q-16 -12 -24 0 q12 10 24 0 z M100 42 q16 -12 24 0 q-12 10 -24 0 z", "#7ccf6b"),
  }),
  c("leaf", "잎새", "식물·과일", "쿨함", 250, B.drop, "#7ccf6b", "#4fa65a", { deco: line("M100 46 v16 M100 54 l-7 -5 M100 58 l7 -5", "#4fa65a", 2.2) }),
  c("pine", "솔이", "식물·과일", "멋짐", 600, B.tri, "#46b07a", "#7a5a3a", {
    deco: dots([[84, 74, 2.6], [118, 70, 2.6], [72, 102, 2.6], [128, 102, 2.6], [100, 62, 2.6]], "#fff"),
    topper: shape("M100 30 l3 7 l8 1 l-6 5 l2 8 l-7 -4 l-7 4 l2 -8 l-6 -5 l8 -1 z", "#ffd84d"),
  }),
  c("carrot", "당근이", "식물·과일", "엽기", 250, B.tall, "#ff9440", "#d96f1f", {
    deco: line("M76 62 h8 M116 70 h8 M76 100 h8 M118 104 h7", "#e07a26", 2.4),
    topper: shape("M100 48 q-14 -20 -22 -8 q8 10 22 8 z M100 48 q14 -20 22 -8 q-8 10 -22 8 z M100 48 q-5 -20 0 -26 q5 6 0 26 z", "#5fbf6a"),
  }),
  c("tomato", "토마토", "식물·과일", "귀여움", 200, B.round, "#f25c54", "#c43c36", { deco: shine, topper: leafyTop("#4fa65a") }),
  c("strawberry", "딸기", "식물·과일", "귀여움", 350, B.egg, "#ff5d73", "#d93a52", {
    deco: dots([[76, 70, 1.8], [124, 70, 1.8], [72, 98, 1.8], [128, 98, 1.8], [88, 106, 1.8], [112, 106, 1.8], [100, 60, 1.8]], "#ffe9a8"),
    topper: shape("M100 48 l-16 -4 l10 8 l-8 8 l14 -6 l14 6 l-8 -8 l10 -8 z", "#4fa65a"),
  }),
  c("avocado", "아보카도", "식물·과일", "쿨함", 450, B.egg, "#cfe88a", "#6f9f3f", { stroke: "#6f9f3f", strokeWidth: 5, deco: dots([[100, 105, 6]], "#a8703f") }),
  c("corn", "옥수수", "식물·과일", "엽기", 300, B.tall, "#ffd95a", "#6aa84f", {
    back: shape("M68 112 q-14 -34 8 -58 q4 30 8 58 z M132 112 q14 -34 -8 -58 q-4 30 -8 58 z", "#7cc46a"),
    deco: dots([[90, 54, 2.4], [100, 50, 2.4], [110, 54, 2.4], [84, 62, 2.4], [116, 62, 2.4], [100, 60, 2.4]], "#f2b01e"),
  }),
  c("peach", "복숭아", "식물·과일", "귀여움", 300, B.round, "#ffb9a3", "#e8876b", { deco: line("M100 50 q-6 8 0 16", "#f08f7a", 2.6), topper: leaf(100, 50, "#6fbf6a") }),
  c("watermelon", "수박", "식물·과일", "멋짐", 400, B.tri, "#ff6b7a", "#3f9a55", {
    deco: shape("M68 100 h64 l2 4 q4 8 -8 8 h-52 q-12 0 -8 -8 z", "#5fbf6a") + dots([[92, 62, 2.2], [108, 62, 2.2], [100, 54, 2.2]], "#3a2a2a"),
  }),
  c("lemon", "레몬", "식물·과일", "쿨함", 350, B.round, "#ffe45c", "#d9b800", { back: ellipse(62, 82, 8, 6, "#ffe45c") + ellipse(138, 82, 8, 6, "#ffe45c"), deco: shine, topper: leaf(100, 50, "#6fbf6a") }),
  c("acorn", "도토리", "식물·과일", "귀여움", 250, B.egg, "#dba56a", "#9a6a3a", {
    topper: shape("M66 68 q0 -24 34 -24 q34 0 34 24 q-34 8 -68 0 z", "#8a5a34") + line("M100 44 v-8", "#6b4426", 3.5) +
      line("M80 56 l6 8 M96 50 l6 14 M112 50 l6 13 M88 52 l-5 11 M106 50 l-7 14 M122 56 l-5 8", "#6b4426", 1.6),
  }),
  c("blossom", "벚꽃이", "식물·과일", "멋짐", 800, B.round, "#ffe3ec", "#e88aa3", { back: ring(5, 30, 21, "#ffc9da"), deco: dots([[100, 60, 2.2], [94, 63, 1.8], [106, 63, 1.8]], "#ffd166") }),

  // ===================== desserts =====================
  c("cupcake", "컵케이크", "디저트", "귀여움", 300, B.cup, "#ffe0b8", "#c9925a", {
    topper: shape("M62 62 q-4 -12 10 -14 q0 -12 16 -12 q12 -10 24 0 q16 0 16 12 q14 2 10 14 q-38 8 -76 0 z", "#ff9ec4") +
      dots([[100, 30, 6]], "#ff5d6c") + line("M80 48 l4 4 M118 46 l-4 4 M98 44 l4 3", "#fff", 2.6),
  }),
  c("cookie", "쿠키", "디저트", "귀여움", 150, B.round, "#dba565", "#a8743c", { deco: dots([[76, 62, 4], [122, 60, 4.5], [70, 98, 4], [130, 96, 3.5], [100, 56, 3], [100, 109, 3.2]], "#6b4426") }),
  c("candy", "사탕이", "디저트", "귀여움", 200, B.round, "#ff9ad5", "#d966a8", {
    back: shape("M68 82 l-22 -14 v28 z M132 82 l22 -14 v28 z", "#ffc2e6"),
    deco: line("M74 64 q10 -12 26 -12 M126 100 q-10 12 -26 12", "#fff", 3.5),
  }),
  c("lollipop", "롤리", "디저트", "엽기", 250, B.round, "#8fe0ff", "#c9a36a", { deco: line("M72 70 q8 -18 28 -20 M128 94 q-8 18 -28 20 M70 94 q-2 -6 0 -12", "#fff", 4) }),
  c("cake", "케이크", "디저트", "멋짐", 500, B.box, "#fff3dc", "#c9925a", {
    stroke: "#ead9b8",
    deco: shape("M64 60 a8 8 0 0 1 8 -8 h56 a8 8 0 0 1 8 8 v6 q-6 8 -12 0 q-6 8 -12 0 q-6 8 -12 0 q-6 8 -12 0 q-6 8 -12 0 q-6 6 -12 0 z", "#ff9ec4") + shape("M64 101 h72 v4 h-72 z", "#ffc2d4"),
    topper: dots([[100, 46, 7]], "#ff5d73") + leaf(100, 41, "#6fbf6a"),
  }),
  c("popsicle", "쭈쭈바", "디저트", "쿨함", 350, B.tall, "#9be7ff", "#d9b98a", { deco: shape("M70 98 h60 v2 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 z", "#ff9ec4") + shine }),
  c("chocolate", "초코", "디저트", "쿨함", 400, B.box, "#b98263", "#8a5a44", {
    deco: line("M88 52 v14 M112 52 v14 M64 66 h72", "#9a6a4e", 2.4) + shape("M64 100 h72 v4 a8 8 0 0 1 -8 8 h-56 a8 8 0 0 1 -8 -8 z", "#d9dde6"),
  }),
  c("pancake", "팬케이크", "디저트", "귀여움", 350, B.wide, "#f2c27b", "#b5651d", {
    deco: shape("M60 72 a10 10 0 0 1 10 -10 h60 a10 10 0 0 1 10 10 q-4 6 -10 0 q-6 7 -14 0 q-10 6 -18 0 q-8 7 -16 0 q-8 6 -12 0 z", "#b5651d") + line("M62 101 h76", "#d9a05b", 2.4),
    topper: shape("M90 56 h20 v8 h-20 z", "#ffe36e"),
  }),
  c("boba", "버블티", "디저트", "쿨함", 600, B.cup, "#f3e2c7", "#8a6a4a", {
    stroke: "#d9c7a8",
    deco: dots([[84, 105, 3.4], [93, 109, 3.2], [104, 106, 3.4], [114, 109, 3.2], [98, 101, 2.8]], "#5a3a2a"),
    topper: '<path d="M66 57 a34 15 0 0 1 68 0 z" fill="#fff" stroke="#d9c7a8" stroke-width="2.5" stroke-linejoin="round"/>' + line("M112 48 l6 -24", "#ff6b8b", 5),
  }),
  c("mochi", "모찌", "디저트", "귀여움", 250, B.wide, "#fff0f4", "#e8a3b5", { stroke: "#f3c9d4", deco: shine, topper: shape("M86 63 q14 -12 28 0 q-14 7 -28 0 z", "#8fcf7a") }),
  c("croissant", "크루아상", "디저트", "멋짐", 450, B.wide, "#e9b566", "#b5813c", {
    back: shape("M64 84 q-16 -4 -14 14 q8 4 16 -2 z M136 84 q16 -4 14 14 q-8 4 -16 -2 z", "#e9b566"),
    deco: line("M76 64 q-4 24 2 46 M124 64 q4 24 -2 46 M90 62 v9 M110 62 v9", "#c98f42", 2.6),
  }),
  c("jelly", "젤리", "디저트", "엽기", 300, B.tri, "#ff9db0", "#e86a85", { deco: line("M88 62 q4 -8 12 -10", "#fff", 4) }),
  c("riceball", "주먹밥", "디저트", "엽기", 400, B.tri, "#ffffff", "#6b6b7a", { stroke: "#dcdce4", deco: shape("M76 100 h48 v12 h-48 z", "#3a4a3a") }),

  // ===================== everyday objects =====================
  c("pencil", "연필이", "물건", "귀여움", 200, B.tall, "#ffd54d", "#8a8a8a", {
    deco: shape("M70 97 h60 v6 h-60 z", "#c9cfdd") + shape("M70 103 h60 a12 12 0 0 1 -12 9 h-36 a12 12 0 0 1 -12 -9 z", "#ff9db0"),
    topper: shape("M74 60 q8 -16 26 -32 q18 16 26 32 z", "#f3d9b1") + shape("M92 36 q4 -4 8 -8 q4 4 8 8 z", "#3a3a4a"),
  }),
  c("eraser", "지우개", "물건", "귀여움", 150, B.wide, "#ffffff", "#6b8fd9", { stroke: "#dcdce4", deco: shape("M60 98 h80 v4 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10 z", "#6b9cff") }),
  c("backpack", "책가방", "물건", "멋짐", 400, B.soft, "#ff8a5c", "#c95a30", {
    deco: shape("M80 100 h40 a4 4 0 0 1 4 4 v8 h-48 v-8 a4 4 0 0 1 4 -4 z", "#ffab85"),
    topper: line("M88 52 q12 -16 24 0", "#c95a30", 5),
  }),
  c("clock", "째깍이", "물건", "멋짐", 500, B.round, "#ffffff", "#655f9f", {
    stroke: "#655f9f", strokeWidth: 6,
    back: dots([[76, 50, 10], [124, 50, 10]], "#ffd166"),
    deco: line("M100 55 v5 M71 82 h4 M129 82 h-4 M100 109 v-4", "#655f9f", 2.6),
  }),
  c("balloon", "풍선이", "물건", "귀여움", 300, B.round, "#ff6b8b", "#c9a36a", {
    noLegs: true,
    back: line("M100 116 q-6 8 0 16 q6 6 0 14", "#b8b8c4", 2.2) + shape("M95 112 h10 l-5 8 z", "#ff6b8b"),
    deco: shine,
  }),
  c("soccer", "축구공", "물건", "멋짐", 600, B.round, "#ffffff", "#3a3a4a", {
    stroke: "#cfd3dd",
    deco: shape("M100 50 l9 6 l-3 10 h-12 l-3 -10 z M66 88 l8 -6 l5 8 l-4 9 l-8 -2 z M134 88 l-8 -6 l-5 8 l4 9 l8 -2 z", "#3a3a4a"),
  }),
  c("basketball", "농구공", "물건", "쿨함", 600, B.round, "#f59a4a", "#b5651d", { deco: line("M100 50 v10 M70 66 q10 16 0 34 M130 66 q-10 16 0 34", "#8a4a1a", 2.6) }),
  c("headphones", "디제이", "물건", "쿨함", 900, B.blob, "#c9b8ff", "#8a6fd9", {
    topper: line("M64 78 q0 -42 36 -42 q36 0 36 42", "#3a3a4a", 5) +
      '<rect x="55" y="72" width="14" height="24" rx="6" fill="#ff6b8b"/><rect x="131" y="72" width="14" height="24" rx="6" fill="#ff6b8b"/>',
  }),
  c("tv", "테레비", "물건", "엽기", 700, B.box, "#5a607a", "#3a3f52", {
    deco: shape("M74 60 h52 a6 6 0 0 1 6 6 v32 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 v-32 a6 6 0 0 1 6 -6 z", "#dff3ff"),
    topper: line("M92 52 l-10 -16 M108 52 l10 -16", "#3a3f52", 3),
  }),
  c("sock", "양말이", "물건", "엽기", 250, B.tall, "#7ad3c8", "#4a9f95", {
    deco: line("M74 58 q26 -12 52 0 M71 66 q29 -12 58 0", "#fff", 3.5) + shape("M70 100 h60 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 z", "#ff9db0"),
  }),
  c("dice", "주사위", "물건", "쿨함", 350, B.box, "#ffffff", "#6b6b7a", { stroke: "#dcdce4", deco: dots([[76, 62, 4], [124, 62, 4], [76, 104, 4], [124, 104, 4]], "#f0486b") }),
  c("milk", "우유", "물건", "귀여움", 300, B.box, "#ffffff", "#6b9cff", {
    stroke: "#cfe0f5",
    deco: shape("M64 98 h72 v6 a8 8 0 0 1 -8 8 h-56 a8 8 0 0 1 -8 -8 z", "#8fbaff"),
    topper: '<path d="M68 52 l14 -16 h36 l14 16 z" fill="#fff" stroke="#cfe0f5" stroke-width="2.5" stroke-linejoin="round"/>' + line("M82 36 h36", "#8fbaff", 5),
  }),
  // ===================== added on request =====================
  c("butterfly", "나풀이", "동물", "멋짐", 450, B.egg, "#b9a7f5", "#7a63d6", {
    back:
      '<ellipse cx="56" cy="64" rx="26" ry="21" fill="#ffb3d1" stroke="#f47fb0" stroke-width="2.5" transform="rotate(-22 56 64)"/>' +
      '<ellipse cx="144" cy="64" rx="26" ry="21" fill="#ffb3d1" stroke="#f47fb0" stroke-width="2.5" transform="rotate(22 144 64)"/>' +
      '<ellipse cx="62" cy="100" rx="18" ry="14" fill="#ffd98a" stroke="#f0b040" stroke-width="2.5" transform="rotate(18 62 100)"/>' +
      '<ellipse cx="138" cy="100" rx="18" ry="14" fill="#ffd98a" stroke="#f0b040" stroke-width="2.5" transform="rotate(-18 138 100)"/>' +
      dots([[48, 60, 5], [152, 60, 5], [60, 102, 3.5], [140, 102, 3.5]], "#fff"),
    deco: shine,
    topper: line("M94 46 q-6 -12 -14 -10 M106 46 q6 -12 14 -10", "#7a63d6", 2.4) + dots([[80, 36, 3], [120, 36, 3]], "#f47fb0"),
  }),
  c("burger", "버거", "디저트", "엽기", 350, B.soft, "#f2b266", "#b9722f", {
    deco:
      shape("M63 99 h74 v8 h-74 z", "#8a4b2a") +
      shape("M104 99 l11 9 l11 -9 z", "#ffd23f") +
      shape("M61 95 q6.5 7 13 0 q6.5 7 13 0 q6.5 7 13 0 q6.5 7 13 0 q6.5 7 13 0 q6.5 7 13 0 v3 h-78 z", "#7ccf6b") +
      '<g fill="#fff6dc"><ellipse cx="82" cy="60" rx="3" ry="1.8" transform="rotate(-20 82 60)"/><ellipse cx="100" cy="57" rx="3" ry="1.8"/><ellipse cx="118" cy="60" rx="3" ry="1.8" transform="rotate(20 118 60)"/><ellipse cx="72" cy="68" rx="3" ry="1.8" transform="rotate(-30 72 68)"/><ellipse cx="128" cy="68" rx="3" ry="1.8" transform="rotate(30 128 68)"/></g>',
  }),
  c("gummy", "곰젤리", "디저트", "귀여움", 350, B.blob, "#ff8fa3", "#f06480", {
    stroke: "#f47890",
    back: earsRound("#ff8fa3", "#ffc2cd"),
    deco: ellipse(100, 100, 15, 8, "#ffc2cd") + shine,
  }),
  // Drawn like a bonobo: dark fur, a pale face, round ears at the sides, hair parted in the middle.
  c("orangutan", "오랑우탄", "동물", "엽기", 450, B.round, "#4a3b40", "#2f2529", {
    stroke: "#2f2529",
    back: dots([[62, 80, 12], [138, 80, 12]], "#4a3b40") + dots([[62, 80, 6.5], [138, 80, 6.5]], "#e0a591"),
    deco: ellipse(87, 79, 14, 13, "#edc6ab") + ellipse(113, 79, 14, 13, "#edc6ab") + ellipse(100, 95, 21, 14, "#f3d3bb"),
    topper: shape("M100 53 q-12 -9 -27 3 q13 -3 27 3 z M100 53 q12 -9 27 3 q-13 -3 -27 3 z", "#2f2529"),
  }),
  // A banana: half peeled, the peel hanging down at both sides.
  c("banana", "바나나", "식물·과일", "엽기", 200, B.tall, "#fff2a8", "#e0b800", {
    stroke: "#ecd27a",
    back: shape("M72 74 q-22 4 -26 34 q16 -4 28 -18 z M128 74 q22 4 26 34 q-16 -4 -28 -18 z", "#ffd92e"),
    deco: shape("M70 86 q30 12 60 0 v14 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 z", "#ffd92e") + shine,
    topper: shape("M96 46 q4 -6 8 0 l-1 4 h-6 z", "#8a5a2b"),
  }),
  // Santa: a red hat with a pompom and a big white beard. Owning him brings presents in December (see app.js).
  c("santa", "산타", "특별", "귀여움", 2000, B.round, "#ffd9b8", "#d62f2f", {
    special: true, stroke: "#f0bf98",
    deco:
      '<path d="M65 84 q-4 34 35 34 q39 0 35 -34 q-8 9 -17.5 5 q-8 7 -17.5 1 q-9.5 6 -17.5 -1 q-9.5 4 -17.5 -5 z" fill="#fff" stroke="#d9deea" stroke-width="2.5" stroke-linejoin="round"/>' +
      dots([[80, 90, 5], [120, 90, 5]], "#ffb3a6"),
    topper:
      shape("M70 58 q8 -30 36 -30 q24 0 38 22 q-8 2 -12 -4 q0 8 -2 12 z", "#e23b3b") +
      '<rect x="64" y="52" width="72" height="13" rx="6.5" fill="#fff" stroke="#e6e9f2" stroke-width="2"/>' +
      '<circle cx="146" cy="50" r="8" fill="#fff" stroke="#e6e9f2" stroke-width="2"/>',
  }),
  // The rose: pink petals all round, a swirl of them on its brow, two leaves. While it is the
  // character in use, the streak challenge has one more run a day (see app.js, triesAll).
  c("rose", "로즈", "식물·과일", "귀여움", 1500, B.round, "#ff9fc0", "#4f9a58", {
    special: true, added: 20, stroke: "#f06a9b", tiles: ["♥", "가", "A"],
    back: ring(8, 35, 15, "#ff7fab") + shape("M70 104 q-22 2 -26 -14 q16 -4 28 8 z M130 104 q22 2 26 -14 q-16 -4 -28 8 z", "#5fb56a"),
    deco: line("M100 62 q9 -3 11 5 q-1 8 -11 6 q-8 -2 -6 -9 q3 -8 14 -8 q10 2 12 10", "#e8508a", 2.6),
  }),
  // ===================== earned, not bought =====================
  // Each is given for a fair amount of one part of the app (earn: what is counted, and how much;
  // see QUESTS in app.js), so that every part gets used. They cost nothing and cannot be bought.
  // A shark for duels: a fin on top, a pale belly, a row of little teeth.
  c("shark", "샤샤", "동물", "쿨함", 0, B.egg, "#7fb2d9", "#4f86b3", {
    added: 19, earn: { by: "duelWins", goal: 10 },
    back: shape("M128 96 q26 -8 30 -26 q-2 22 4 34 q-18 -10 -34 -2 z", "#6aa3cf"),
    deco: ellipse(100, 100, 24, 11, "#f1f9ff") + shape("M84 99 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 z", "#ffffff"),
    topper: shape("M90 50 q12 -30 26 -24 q-6 12 -2 24 z", "#5f95c2"),
  }),
  // A baby dragon for the streak challenge: small wings, two horns, a puff of flame.
  c("dragon", "화르", "동물", "멋짐", 0, B.blob, "#ff8a5c", "#d95f36", {
    added: 19, earn: { by: "streak", goal: 30 },
    back:
      shape("M64 80 q-30 -24 -34 8 q10 -8 14 2 q8 -8 20 4 z", "#ffb38f") +
      shape("M136 80 q30 -24 34 8 q-10 -8 -14 2 q-8 -8 -20 4 z", "#ffb38f"),
    deco: ellipse(100, 100, 17, 9, "#ffe2c2"),
    topper:
      shape("M82 52 l-4 -14 l12 8 z M118 52 l4 -14 l-12 8 z", "#ffd166") +
      shape("M142 64 q10 -10 6 -20 q10 8 8 20 q-4 8 -14 0 z", "#ffb020") + shape("M146 62 q4 -5 3 -10 q5 5 4 11 q-3 3 -7 -1 z", "#fff1a8"),
  }),
  // A bookworm for learned words: round glasses, a segmented tail, two feelers.
  c("bookworm", "꼬물이", "동물", "귀여움", 0, B.round, "#a6d96a", "#6fa83a", {
    added: 19, earn: { by: "learned", goal: 50 },
    back: dots([[138, 100, 15]], "#98cf5c") + dots([[156, 108, 11]], "#8bc54f") + dots([[170, 114, 8]], "#7fba45"),
    deco:
      '<g fill="rgba(255,255,255,.35)" stroke="#5b4a3a" stroke-width="2.6"><circle cx="86" cy="82" r="11"/><circle cx="114" cy="82" r="11"/></g>' +
      line("M97 82 h6", "#5b4a3a", 2.6),
    topper: line("M92 50 q-6 -12 -12 -12 M108 50 q6 -12 12 -12", "#6fa83a", 2.6) + dots([[80, 38, 3.2], [120, 38, 3.2]], "#ffd166"),
  }),
  // A compass for first discoveries: a golden rim with marks, a ring on top, a red needle.
  c("compass", "나침이", "물건", "쿨함", 0, B.round, "#fdf3d7", "#c9a14a", {
    added: 19, earn: { by: "found", goal: 10 },
    stroke: "#c9a14a",
    deco: ring(8, 27, 1.7, "#c9a14a") + shape("M100 97 l5 7 l-5 12 l-5 -12 z", "#e5484d"),
    topper: '<circle cx="100" cy="43" r="6.5" fill="none" stroke="#c9a14a" stroke-width="3.5"/>',
  }),
  // Popcorn for words looked up: a striped tub with popped corn spilling over.
  c("popcorn", "팡팡", "디저트", "엽기", 0, B.cup, "#ffffff", "#e23b3b", {
    added: 19, earn: { by: "words", goal: 200 },
    stroke: "#f0b4b4",
    deco: shape("M78 57 h9 l-2 54 h-5 z M97 57 h9 l-1 54 h-7 z M115 57 h9 l-4 54 h-5 z", "#ff8d8d"),
    topper: dots([[76, 54, 11], [96, 46, 13], [116, 50, 12], [130, 58, 9], [86, 60, 9], [108, 60, 10]], "#fff1b8") + dots([[92, 44, 4], [118, 48, 3.5], [78, 52, 3]], "#ffd98a"),
  }),
  // A unicorn for the league: a golden horn, a mane in rainbow colours.
  c("unicorn", "유니", "동물", "멋짐", 0, B.round, "#ffffff", "#c9b8ee", {
    added: 19, earn: { by: "league", goal: 5 },
    stroke: "#e3def5",
    back: earsPointy("#ffffff", "#ffd3e6") + dots([[64, 64, 10]], "#ff9ecb") + dots([[60, 80, 10]], "#ffd166") + dots([[64, 96, 9]], "#8fd3ff"),
    deco: dots([[80, 92, 5], [120, 92, 5]], "#ffd3e6"),
    topper: shape("M100 20 l8 32 h-16 z", "#ffd166") + line("M95 40 l10 -4 M94 48 l12 -5", "#f0b040", 2),
  }),
  // Twin cherries for friends: two on one stem.
  c("cherries", "체리 짝꿍", "식물·과일", "귀여움", 0, B.round, "#e5484d", "#b0282d", {
    added: 19, earn: { by: "friends", goal: 5 },
    back: '<circle cx="142" cy="94" r="21" fill="#f0656a"/>' + dots([[148, 88, 3], [156, 88, 3]], "#7a1c20") + line("M146 97 q5 4 10 0", "#7a1c20", 2),
    deco: shine,
    topper: line("M100 52 q6 -24 22 -24 M142 74 q-2 -30 -18 -46", "#5b8a3c", 3) + leaf(118, 30, "#7ccf6b"),
  }),
  // A present for taking the daily present a week running: a lid, a ribbon and a bow.
  c("giftbox", "깜짝이", "물건", "귀여움", 0, B.box, "#ff8fab", "#d9577a", {
    added: 19, earn: { by: "giftDays", goal: 7 },
    deco: shape("M93 60 h14 v52 h-14 z", "#ffd166"),
    topper:
      '<rect x="58" y="46" width="84" height="15" rx="6" fill="#ffb3c7"/>' + shape("M93 46 h14 v15 h-14 z", "#ffd166") +
      ellipse(86, 38, 12, 8, "#ffd166") + ellipse(114, 38, 12, 8, "#ffd166") + dots([[100, 40, 5]], "#f0b040"),
  }),
];
