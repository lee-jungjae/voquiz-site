// Sound effects, made on the spot with Web Audio: no sound files, nothing to download.
// Every character has a sound of its own that brings the thing itself to mind (a cat mews, a
// frog croaks, a pudding wobbles, a ball bounces), kept short, soft and bouncy.
import { CHARACTERS, characterById } from "./characters.js?v=0.1.28-tp83ws";

const KEY = "wb_sound";
export const soundOn = () => localStorage.getItem(KEY) !== "off";
export const setSound = (on) => localStorage.setItem(KEY, on ? "on" : "off");

let ctx = null;
function audio() {
  if (!soundOn()) return null;
  try {
    ctx ||= new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// ----- building blocks -----

// One note, `at` seconds from now and `len` seconds long.
//   to: pitch it slides to · via: [[pitch, part of the length 0..1], ...] for a path of pitches
//   wobble: vibrato in Hz (depth: how wide, 0.06 = a little) · trem: the loudness flutters, in Hz
//   filter: [type, frequency, q] · attack: seconds to full loudness
function note(freq, at, len, { wave = "sine", gain = 0.1, to = 0, via = null, wobble = 0, depth = 0.06, trem = 0, filter = null, attack = 0.012 } = {}) {
  const a = audio();
  if (!a) return;
  const start = a.currentTime + at;
  const osc = a.createOscillator();
  const amp = a.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, start);
  for (const [f, part] of via || (to ? [[to, 1]] : [])) osc.frequency.exponentialRampToValueAtTime(f, start + len * part);
  if (wobble) {
    const lfo = a.createOscillator();
    const width = a.createGain();
    lfo.frequency.value = wobble;
    width.gain.setValueAtTime(freq * depth, start);
    width.gain.exponentialRampToValueAtTime(Math.max(0.01, freq * depth * 0.15), start + len); // the wobble settles
    lfo.connect(width).connect(osc.frequency);
    lfo.start(start);
    lfo.stop(start + len);
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(attack, len * 0.5));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + len);
  let out = osc.connect(amp);
  if (trem) {
    const flutter = a.createGain();
    const lfo = a.createOscillator();
    const width = a.createGain();
    flutter.gain.value = 0.6;
    lfo.frequency.value = trem;
    width.gain.value = 0.4;
    lfo.connect(width).connect(flutter.gain);
    lfo.start(start);
    lfo.stop(start + len);
    out = out.connect(flutter);
  }
  if (filter) {
    const f = a.createBiquadFilter();
    [f.type, f.frequency.value, f.Q.value] = [filter[0], filter[1], filter[2] || 1];
    out = out.connect(f);
  }
  out.connect(a.destination);
  osc.start(start);
  osc.stop(start + len + 0.02);
}

// A hiss, a rustle, a whoosh: noise through a filter that may sweep from one pitch to another.
let hiss = null;
function noise(at, len, { type = "bandpass", from = 2000, to = 0, q = 1, gain = 0.06, attack = 0.01 } = {}) {
  const a = audio();
  if (!a) return;
  if (!hiss || hiss.sampleRate !== a.sampleRate) {
    hiss = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const data = hiss.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const start = a.currentTime + at;
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const amp = a.createGain();
  src.buffer = hiss;
  src.loop = true;
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, start);
  if (to) f.frequency.exponentialRampToValueAtTime(to, start + len);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(attack, len * 0.5));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + len);
  src.connect(f).connect(amp).connect(a.destination);
  src.start(start, Math.random() * 0.5);
  src.stop(start + len + 0.02);
}

// The cartoon spring: the pitch leaps up, overshoots and settles, wobbling as it goes.
const boing = (f, at = 0, len = 0.26, more = {}) =>
  note(f * 0.55, at, len, { via: [[f * 1.55, 0.4], [f, 1]], wobble: 17, depth: 0.09, gain: 0.13, ...more });
// A bubble bursting.
const pop = (f, at = 0, gain = 0.12) => note(f * 0.5, at, 0.07, { via: [[f * 2, 0.5], [f * 1.6, 1]], gain, attack: 0.004 });
// Something soft landing: a ball, a foot, a knock on a melon.
const thump = (f, at = 0, gain = 0.16, len = 0.14) => note(f, at, len, { to: f * 0.45, gain, attack: 0.004 });
// A dry little tick.
const click = (at = 0, f = 2400, gain = 0.05) => note(f, at, 0.025, { wave: "square", gain, attack: 0.002 });
// A small bell or music box.
function bell(f, at = 0, len = 0.4, gain = 0.1) {
  note(f, at, len, { gain, attack: 0.004 });
  note(f * 2.76, at, len * 0.5, { gain: gain * 0.3, attack: 0.004 });
}
// A wooden knock.
const knock = (f, at = 0, gain = 0.13) => note(f, at, 0.06, { wave: "triangle", gain, to: f * 0.8, attack: 0.003 });
// Something being bitten.
const crunch = (at = 0, from = 3200, gain = 0.07) => noise(at, 0.07, { type: "highpass", from, gain, attack: 0.004 });
// The same thing a few times over: times(3, 0.1, (at, i) => ...).
const times = (n, gap, play) => { for (let i = 0; i < n; i++) play(i * gap, i); };

// ----- what each character sounds like -----
const SOUNDS = {
  // the first friends
  bubble: () => { pop(700); boing(620, 0.07, 0.3); }, // a speech bubble popping up
  rabbit: () => times(2, 0.17, (at, i) => boing(700 + i * 180, at, 0.2)), // hop, hop
  mushroom: () => { boing(430, 0, 0.32, { depth: 0.14 }); pop(1100, 0.3, 0.07); },
  pudding: () => note(330, 0, 0.5, { wobble: 11, depth: 0.2, gain: 0.14 }), // a wobble on the plate
  dino: () => { thump(110, 0, 0.2, 0.2); thump(100, 0.2, 0.2, 0.2); note(260, 0.4, 0.3, { wave: "sawtooth", gain: 0.05, via: [[420, 0.4], [300, 1]], trem: 22 }); },
  donut: () => { crunch(0); boing(520, 0.09, 0.24); },
  rocket: () => { noise(0, 0.55, { from: 300, to: 5200, q: 2, gain: 0.09, attack: 0.1 }); note(240, 0.05, 0.5, { to: 1900, gain: 0.07, attack: 0.1 }); },
  octopus: () => times(5, 0.075, (at, i) => pop(380 + ((i * 190) % 520), at, 0.09)), // blub blub
  poop: () => { note(170, 0, 0.3, { wave: "sawtooth", gain: 0.06, to: 85, trem: 34, filter: ["lowpass", 700] }); pop(900, 0.34, 0.07); },
  cactus: () => times(3, 0.09, (at, i) => note(1150 + i * 260, at, 0.07, { wave: "triangle", gain: 0.1, attack: 0.003 })), // prickle prickle
  ghost: () => note(520, 0, 0.7, { via: [[830, 0.45], [470, 1]], wobble: 6, depth: 0.05, gain: 0.11, attack: 0.12 }), // woo~
  cat: () => note(620, 0, 0.5, { wave: "triangle", via: [[1020, 0.35], [560, 1]], wobble: 7, depth: 0.03, gain: 0.13, attack: 0.05, filter: ["bandpass", 1300, 1.2] }), // meow
  robot: () => [660, 990, 440, 880].forEach((f, i) => note(f, i * 0.085, 0.07, { wave: "square", gain: 0.04, attack: 0.003 })),
  icecream: () => { [2093, 2637, 3136].forEach((f, i) => bell(f, i * 0.07, 0.25, 0.05)); boing(560, 0.2, 0.22); },
  penguin: () => times(2, 0.17, (at, i) => note(430 + i * 70, at, 0.13, { wave: "square", gain: 0.035, to: 600 + i * 70, filter: ["bandpass", 1100, 3] })),
  bulb: () => { click(0); [1568, 2093, 2637, 3136].forEach((f, i) => note(f, 0.06 + i * 0.04, 0.3, { gain: 0.045 })); },
  ninja: () => { noise(0, 0.16, { from: 900, to: 6500, q: 3, gain: 0.08 }); note(2900, 0.14, 0.3, { gain: 0.04, to: 3500 }); },
  macaron: () => [1175, 1480, 1760].forEach((f, i) => bell(f, i * 0.11, 0.35, 0.08)),
  coffee: () => { noise(0, 0.42, { type: "highpass", from: 3500, gain: 0.035, attack: 0.08 }); pop(420, 0.3, 0.1); pop(520, 0.42, 0.1); },
  book: () => { noise(0, 0.12, { from: 2600, to: 900, gain: 0.07 }); noise(0.15, 0.12, { from: 2900, to: 1000, gain: 0.07 }); bell(1568, 0.3, 0.3, 0.07); },
  skull: () => [880, 660, 990, 740].forEach((f, i) => knock(f, i * 0.085)), // rattling bones

  // animals
  bear: () => { boing(210, 0, 0.36, { wave: "triangle", depth: 0.05 }); },
  panda: () => { boing(300, 0, 0.26, { wave: "triangle" }); crunch(0.3, 2400, 0.05); },
  fox: () => times(2, 0.14, (at) => note(720, at, 0.1, { wave: "triangle", to: 1350, gain: 0.11, filter: ["bandpass", 1500, 1.5] })), // yip yip
  dog: () => times(2, 0.2, (at) => { note(330, at, 0.11, { wave: "sawtooth", gain: 0.06, to: 190, filter: ["lowpass", 1100] }); noise(at, 0.06, { from: 900, gain: 0.04 }); }), // woof woof
  pig: () => times(2, 0.2, (at, i) => note(250 - i * 30, at, 0.15, { wave: "sawtooth", gain: 0.055, to: 170, trem: 42, filter: ["bandpass", 800, 2] })), // oink
  frog: () => times(2, 0.26, (at) => note(150, at, 0.2, { wave: "square", gain: 0.05, to: 260, trem: 30, filter: ["bandpass", 700, 2] })), // ribbit
  chick: () => times(3, 0.12, (at) => note(2400, at, 0.07, { to: 3400, gain: 0.07, attack: 0.004 })), // peep peep peep
  duck: () => times(2, 0.2, (at) => note(430, at, 0.14, { wave: "sawtooth", gain: 0.05, to: 330, filter: ["bandpass", 1200, 4] })), // quack
  koala: () => note(260, 0, 0.4, { wave: "triangle", via: [[330, 0.5], [240, 1]], trem: 14, gain: 0.11 }),
  mouse: () => times(2, 0.11, (at) => note(3000, at, 0.06, { to: 3900, gain: 0.05, attack: 0.004 })), // squeak
  lion: () => { note(150, 0, 0.5, { wave: "sawtooth", gain: 0.06, via: [[210, 0.3], [110, 1]], trem: 24, filter: ["lowpass", 900] }); noise(0, 0.45, { type: "lowpass", from: 600, gain: 0.04, attack: 0.08 }); },
  tiger: () => note(210, 0, 0.4, { wave: "sawtooth", gain: 0.06, via: [[300, 0.3], [170, 1]], trem: 30, filter: ["lowpass", 1200] }),
  cow: () => note(170, 0, 0.6, { wave: "triangle", via: [[150, 0.3], [215, 1]], gain: 0.15, attack: 0.08, filter: ["lowpass", 900] }), // moo
  sheep: () => note(430, 0, 0.45, { wave: "triangle", gain: 0.12, to: 390, trem: 9, wobble: 9, depth: 0.04 }), // baa
  hedgehog: () => { noise(0, 0.05, { from: 3200, gain: 0.05 }); noise(0.09, 0.05, { from: 3600, gain: 0.05 }); pop(1300, 0.2, 0.08); }, // sniff sniff
  whale: () => { note(150, 0, 0.8, { via: [[420, 0.6], [330, 1]], gain: 0.13, attack: 0.15 }); note(840, 0.5, 0.4, { to: 660, gain: 0.03, attack: 0.1 }); },
  bee: () => note(230, 0, 0.42, { wave: "sawtooth", gain: 0.05, via: [[270, 0.5], [215, 1]], wobble: 28, depth: 0.05, filter: ["bandpass", 1000, 1.5] }), // bzzz
  ladybug: () => { click(0, 3000); click(0.07, 3400); bell(2637, 0.15, 0.25, 0.05); },
  turtle: () => { thump(190, 0, 0.14); thump(170, 0.3, 0.14); },
  owl: () => times(2, 0.26, (at, i) => note(430 - i * 40, at, 0.2, { gain: 0.12, attack: 0.05 })), // hoo hoo

  // plants and fruit
  tulip: () => { bell(1319, 0, 0.35, 0.08); bell(1760, 0.14, 0.4, 0.08); },
  sunflower: () => [784, 988, 1175, 1568].forEach((f, i) => note(f, i * 0.06, 0.22, { wave: "triangle", gain: 0.09 })),
  sproutpot: () => { note(420, 0, 0.26, { to: 1300, gain: 0.11 }); pop(1500, 0.26, 0.09); }, // a sprout shooting up
  leaf: () => { noise(0, 0.26, { from: 4200, to: 2200, gain: 0.05, attack: 0.06 }); bell(1976, 0.2, 0.25, 0.05); }, // a rustle
  pine: () => { noise(0, 0.5, { from: 700, to: 1500, q: 2, gain: 0.06, attack: 0.15 }); bell(1047, 0.35, 0.4, 0.06); }, // wind in the needles
  carrot: () => { crunch(0, 3000, 0.09); crunch(0.12, 3400, 0.08); boing(640, 0.2, 0.2); },
  tomato: () => { noise(0, 0.1, { type: "lowpass", from: 900, gain: 0.08 }); boing(380, 0.06, 0.28, { depth: 0.14 }); }, // squish
  strawberry: () => { boing(780, 0, 0.22); bell(2349, 0.2, 0.3, 0.05); },
  avocado: () => { knock(520); pop(640, 0.12, 0.1); },
  corn: () => [0, 0.09, 0.15, 0.26, 0.31].forEach((at, i) => pop(650 + ((i * 310) % 700), at, 0.1)), // popcorn
  peach: () => boing(330, 0, 0.34, { depth: 0.12 }),
  watermelon: () => { thump(160, 0, 0.18, 0.13); thump(160, 0.16, 0.18, 0.13); }, // knock knock: is it ripe?
  lemon: () => { note(1500, 0, 0.13, { to: 3300, gain: 0.07 }); noise(0.1, 0.25, { type: "highpass", from: 6000, gain: 0.03 }); }, // zing
  acorn: () => { knock(900); knock(760, 0.12); knock(1100, 0.2, 0.08); }, // plok, rolling away
  blossom: () => [2093, 2794, 2349, 3136, 2637].forEach((f, i) => bell(f, i * 0.085, 0.35, 0.04)), // wind chimes

  // desserts
  cupcake: () => { [1568, 1976].forEach((f, i) => bell(f, i * 0.1, 0.3, 0.07)); boing(600, 0.22, 0.2); },
  cookie: () => { crunch(0, 2600, 0.09); crunch(0.13, 3000, 0.07); },
  candy: () => [2637, 3520, 3136].forEach((f, i) => note(f, i * 0.06, 0.16, { gain: 0.05 })),
  lollipop: () => note(500, 0, 0.5, { via: [[1000, 0.25], [500, 0.5], [1000, 0.75], [600, 1]], gain: 0.1 }), // round and round
  cake: () => [1047, 1319, 1568, 2093].forEach((f, i) => bell(f, i * 0.09, 0.4, 0.07)),
  popsicle: () => { [3136, 3951].forEach((f, i) => bell(f, i * 0.06, 0.2, 0.04)); note(900, 0.14, 0.2, { to: 500, gain: 0.08 }); },
  chocolate: () => { click(0, 1500, 0.08); note(260, 0.05, 0.3, { wave: "triangle", gain: 0.12, to: 230 }); }, // snap
  pancake: () => { noise(0, 0.1, { type: "lowpass", from: 700, gain: 0.09 }); boing(420, 0.1, 0.24); }, // flip, flop
  boba: () => { times(3, 0.07, (at, i) => pop(520 + i * 140, at, 0.09)); noise(0.24, 0.25, { from: 700, to: 2600, q: 4, gain: 0.07 }); }, // bubbles up the straw
  mochi: () => note(260, 0, 0.42, { via: [[520, 0.5], [300, 1]], wobble: 9, depth: 0.12, gain: 0.14 }), // stretch
  croissant: () => { crunch(0, 4200, 0.06); crunch(0.07, 4600, 0.05); crunch(0.14, 4000, 0.05); bell(1319, 0.24, 0.25, 0.05); },
  jelly: () => note(440, 0, 0.55, { wobble: 14, depth: 0.25, gain: 0.13 }),
  riceball: () => { thump(260, 0, 0.13, 0.09); thump(300, 0.12, 0.13, 0.09); pop(900, 0.26, 0.08); }, // pat pat

  // everyday objects
  pencil: () => times(3, 0.1, (at, i) => noise(at, 0.08, { from: 2400 + i * 500, q: 3, gain: 0.07 })), // scribble
  eraser: () => { noise(0, 0.11, { type: "lowpass", from: 1100, gain: 0.08 }); noise(0.15, 0.11, { type: "lowpass", from: 1300, gain: 0.08 }); boing(560, 0.3, 0.18); },
  backpack: () => { noise(0, 0.28, { from: 900, to: 4800, q: 6, gain: 0.09 }); pop(700, 0.3, 0.08); }, // zip
  clock: () => { click(0, 2200, 0.07); click(0.2, 1500, 0.07); bell(1760, 0.4, 0.4, 0.07); }, // tick, tock
  balloon: () => { note(700, 0, 0.3, { to: 2100, wobble: 30, depth: 0.03, gain: 0.07 }); pop(1000, 0.32, 0.13); },
  soccer: () => { thump(170, 0, 0.2); boing(330, 0.12, 0.26); },
  basketball: () => [0, 0.2, 0.34, 0.43].forEach((at, i) => thump(150, at, 0.18 - i * 0.035, 0.1)), // bounce, bounce
  headphones: () => { thump(110, 0, 0.2); noise(0.14, 0.04, { type: "highpass", from: 7000, gain: 0.05 }); thump(110, 0.28, 0.2); note(660, 0.42, 0.12, { wave: "square", gain: 0.035 }); },
  tv: () => { noise(0, 0.2, { type: "highpass", from: 2500, gain: 0.04 }); note(990, 0.22, 0.08, { wave: "square", gain: 0.04 }); note(1320, 0.31, 0.14, { wave: "square", gain: 0.04 }); },
  sock: () => boing(240, 0, 0.36, { wave: "triangle", depth: 0.16 }),
  dice: () => { [0, 0.05, 0.11, 0.19].forEach((at, i) => click(at, 1700 + ((i * 450) % 900), 0.06)); bell(1568, 0.3, 0.3, 0.06); },
  milk: () => times(3, 0.13, (at, i) => note(330 - i * 30, at, 0.1, { to: 520 - i * 30, gain: 0.12 })), // glug glug glug

  // added on request
  butterfly: () => note(1760, 0, 0.45, { trem: 16, via: [[2093, 0.5], [1865, 1]], gain: 0.06, attack: 0.08 }), // a flutter
  burger: () => { noise(0, 0.28, { type: "highpass", from: 5000, gain: 0.035 }); boing(360, 0.22, 0.26); }, // sizzle
  orangutan: () => { times(2, 0.15, (at) => note(380, at, 0.11, { wave: "triangle", gain: 0.12, to: 300, filter: ["bandpass", 800, 2] })); note(520, 0.34, 0.24, { wave: "triangle", gain: 0.12, to: 760, filter: ["bandpass", 1400, 2] }); }, // ooh ooh, aah
  banana: () => { note(1100, 0, 0.26, { to: 380, gain: 0.1 }); boing(520, 0.26, 0.26, { depth: 0.16 }); }, // a slip, then a bounce
  santa: () => { times(3, 0.2, (at, i) => note(200 - i * 14, at, 0.15, { wave: "triangle", gain: 0.15, to: 160 - i * 14, filter: ["lowpass", 700] })); times(4, 0.11, (at) => bell(3136, 0.62 + at, 0.12, 0.035)); }, // ho ho ho, and sleigh bells
  // earned characters
  shark: () => { note(98, 0, 0.22, { wave: "triangle", gain: 0.16, filter: ["lowpass", 500] }); note(104, 0.26, 0.22, { wave: "triangle", gain: 0.16, filter: ["lowpass", 500] }); noise(0.5, 0.3, { from: 500, to: 3200, q: 2, gain: 0.07, attack: 0.05 }); }, // dun... dun... splash
  dragon: () => { note(200, 0, 0.28, { wave: "sawtooth", gain: 0.055, via: [[330, 0.4], [240, 1]], trem: 26, filter: ["lowpass", 1400] }); noise(0.24, 0.4, { from: 1200, to: 4200, q: 1.5, gain: 0.07, attack: 0.06 }); }, // a small roar and a puff of flame
  bookworm: () => { noise(0, 0.11, { from: 2800, to: 1000, gain: 0.06 }); crunch(0.16, 3400, 0.06); crunch(0.26, 3800, 0.05); pop(1400, 0.38, 0.08); }, // a page, a nibble
  compass: () => { [0, 0.07, 0.13, 0.18].forEach((at, i) => click(at, 2000 + i * 260, 0.05)); bell(1976, 0.26, 0.4, 0.07); }, // the needle spins and settles
  popcorn: () => { [0, 0.07, 0.12, 0.2, 0.24, 0.33].forEach((at, i) => pop(700 + ((i * 370) % 900), at, 0.09)); pop(520, 0.44, 0.15); }, // pop pop pop... POP
  unicorn: () => { [1047, 1319, 1568, 2093, 2637, 3136].forEach((f, i) => bell(f, i * 0.06, 0.34, 0.05)); note(2093, 0.4, 0.3, { to: 3136, gain: 0.04 }); }, // a sparkling run upward
  cherries: () => times(2, 0.2, (at, i) => { pop(880 + i * 110, at, 0.1); pop(1108 + i * 139, at + 0.02, 0.07); }), // two together, twice
  giftbox: () => { noise(0, 0.14, { from: 3000, to: 1200, gain: 0.06 }); boing(520, 0.14, 0.24); [1568, 2093, 2637].forEach((f, i) => bell(f, 0.36 + i * 0.05, 0.3, 0.05)); }, // rustle, boing, ta-da
  gummy: () => { boing(520, 0, 0.2, { depth: 0.16 }); boing(650, 0.18, 0.22, { depth: 0.16 }); },
};
// A character added later sounds like a little spring until it gets a sound of its own.
const soundOf = (id) => SOUNDS[characterById(id || "bubble").id] || (() => boing(500 + (CHARACTERS.findIndex((c) => c.id === id) % 8) * 60));
// How high this character's answers ring.
const pitchOf = (id) => 560 * 2 ** (((Math.max(0, CHARACTERS.findIndex((c) => c.id === characterById(id || "bubble").id)) * 5) % 12) / 12);

// ----- the effects -----
export const sfx = {
  // The character makes its own sound (a tap on it, choosing it, buying it).
  chirp(id) {
    soundOf(id)();
  },
  // A right answer: a quick, springy "bo-ing" at the character's own pitch.
  right(id) {
    const f = pitchOf(id);
    pop(f * 0.8, 0, 0.09);
    boing(f, 0.05, 0.2, { gain: 0.11 });
  },
  // The streak challenge: every right answer of a stage rings one step higher than the last,
  // so the last one of the stage lands on the octave. k = which answer of the stage (1..step).
  climb(k, step) {
    const f = 392 * 2 ** (Math.min(k, step) / step);
    pop(f * 0.8, 0, 0.09);
    boing(f, 0.05, 0.2, { gain: 0.11 });
  },
  // A wrong answer: two soft notes going down. Gentle on purpose.
  wrong() {
    note(294, 0, 0.16, { wave: "triangle", gain: 0.09, to: 262 });
    note(220, 0.14, 0.24, { wave: "triangle", gain: 0.09, to: 196 });
  },
  // A few points dropping into the purse.
  coin() {
    note(1319, 0.12, 0.07, { wave: "square", gain: 0.03 });
    note(1760, 0.18, 0.16, { wave: "square", gain: 0.03 });
  },
  // Points being spent.
  spend() {
    note(660, 0, 0.09, { wave: "triangle", gain: 0.07, to: 440 });
  },
  // A celebration: a rising chord, sparkles on top, then the character joins in with its own sound.
  cheer(id) {
    [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.07, 0.32, { wave: "triangle", gain: 0.09 }));
    [2093, 2637, 3136, 2637, 3520].forEach((f, i) => note(f, 0.3 + i * 0.055, 0.09, { gain: 0.035 }));
    setTimeout(() => sfx.chirp(id), 650);
  },
  // A new level: steps climbing to a held chord with bells on top, then the character's own sound.
  levelUp(id) {
    [523, 587, 659, 784, 880, 1047].forEach((f, i) => note(f, i * 0.075, 0.16, { wave: "triangle", gain: 0.085 }));
    [523, 659, 784, 1047].forEach((f) => note(f, 0.5, 0.75, { wave: "triangle", gain: 0.06 }));
    [2093, 2637, 3136, 4186].forEach((f, i) => bell(f, 0.55 + i * 0.09, 0.4, 0.035));
    setTimeout(() => sfx.chirp(id), 1150);
  },
  // The big one (a promotion, a duel won): a fanfare, then the cheer.
  grand(id) {
    [[392, 0], [392, 0.12], [392, 0.24], [523, 0.36], [659, 0.52], [784, 0.66]].forEach(([f, at]) =>
      note(f, at, at > 0.3 ? 0.34 : 0.1, { wave: "sawtooth", gain: 0.05 }));
    [262, 330, 392].forEach((f) => note(f, 0.66, 0.6, { wave: "triangle", gain: 0.07 }));
    setTimeout(() => sfx.cheer(id), 900);
  },
  // Something did not go my way (a duel lost, a league dropped): short, and not too sad.
  aww() {
    [392, 349, 294].forEach((f, i) => note(f, i * 0.16, 0.26, { wave: "triangle", gain: 0.09 }));
  },
  // Ready, set, go: the start of a duel.
  go() {
    note(523, 0, 0.1, { wave: "square", gain: 0.04 });
    note(523, 0.22, 0.1, { wave: "square", gain: 0.04 });
    note(1047, 0.44, 0.34, { wave: "square", gain: 0.05 });
  },
  // Time is up.
  time() {
    note(880, 0, 0.12, { wave: "square", gain: 0.04 });
    note(880, 0.16, 0.12, { wave: "square", gain: 0.04 });
    note(587, 0.32, 0.3, { wave: "square", gain: 0.04 });
  },
};

// Characters that have no sound of their own yet (for a check while developing).
export const soundless = () => CHARACTERS.filter((c) => !SOUNDS[c.id]).map((c) => c.id);
