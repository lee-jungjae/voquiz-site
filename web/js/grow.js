// Growing with the app: a level that rises with the words learned, the presents each level gives,
// the capsule machines that are turned for a prize, the things a character wears, and the hearts
// friends send (ten hearts are a turn of the machine). The lists themselves are in goods.js; this
// file is what is done with them and how it is shown. Everything is kept with the account:
// `level` { xp, got }, `bag` { tickets: { basic, gold } }, `hearts` { n, all }, and in `shop`: what
// is owned ("wear:glasses", "skin:rabbit-moon", "concept:space"), `wear` { slot: id }, `skin` { character: id }.
import { CONCEPTS, WEARS, SLOTS, wearById, SKINS, skinKey, skinName, MACHINES, MACHINE_KINDS, HEARTS_FOR_DRAW, wearCost, wearSpecial, LEVEL_MAX, needFor, levelFor, levelGift } from "./goods.js?v=0.1.28-tp832y";
import { lookOf } from "./characters.js?v=0.1.28-tp832y";
import { art } from "./art.js?v=0.1.28-tp832y"; // eslint-disable-line no-unused-vars

const TWICE_POINTS = 100; // a present the student already has turns into points

export function initGrow(c) {
  const { h, t, state } = c;
  const shop = () => c.myShop();
  const owned = (key) => shop().owned.includes(key);
  const keep = () => c.api.saveProfile({ points: state.user.points, level: state.user.level, bag: state.user.bag, hearts: state.user.hearts }).catch(console.error);
  const coin = () => h("i", { class: "coin-i", "aria-hidden": "true" }, "P");
  const NS = "http://www.w3.org/2000/svg";
  const svg = (box, cls, inner) => {
    const el = document.createElementNS(NS, "svg");
    el.setAttribute("viewBox", box);
    el.setAttribute("class", cls);
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = inner;
    return el;
  };
  const ticketArt = (kind) => h("i", { class: `tix ${kind}`, "aria-hidden": "true" });
  const heartArt = () => h("i", { class: "heart-i", "aria-hidden": "true" });

  // ----- the character as it is dressed -----
  const wearing = () => shop().wear || {};
  function myLook() {
    const id = shop().character;
    const skin = shop().skin?.[id];
    return lookOf(id, skin && owned(`skin:${id}-${skin}`) ? skin : "", Object.values(wearing()).filter((w) => owned(`wear:${w}`)));
  }

  // ----- what a present is called, and what it looks like -----
  const KIND_NAMES = { wear: "소품", skin: "스킨", concept: "테마", bg: "배경", theme: "색상", character: "캐릭터" };
  function conceptArt(concept) {
    const v = concept.vars || { bg: "#fff", surface: "#f7f7f7", accent: "#655f9f", text: "#222", line: "#ebebeb" };
    return h("i", { class: `concept-art c-${concept.id}`, "aria-hidden": "true", style: `--c-bg:${v.bg};--c-surface:${v.surface};--c-accent:${v.accent};--c-text:${v.text};--c-line:${v.line}` },
      h("b", null, "Aa"), h("u"), h("s"));
  }
  function itemOf(key) {
    const [kind, id] = String(key).split(":");
    if (kind === "wear") { const w = wearById(id); return w && { kind, name: t(w.name), art: () => c.portrait(lookOf(shop().character, "", [id])) }; }
    if (kind === "skin") { const s = SKINS.find((x) => skinKey(x) === key); return s && { kind, name: skinName(s, t), art: () => c.portrait(lookOf(s.of, s.id)) }; }
    if (kind === "concept") { const x = CONCEPTS.find((y) => y.id === id); return x && { kind, name: t(x.name), art: () => conceptArt(x) }; }
    if (kind === "bg") { const x = c.BACKGROUNDS.find((y) => y.id === id); return x && { kind, name: t(x.name), art: () => h("i", { class: "prize-swatch", "data-bg": id, "aria-hidden": "true" }) }; }
    if (kind === "theme") { const x = c.THEMES.find((y) => y.id === id); return x && { kind, name: t(x.name), art: () => h("i", { class: "prize-swatch", style: `background:${c.themeColor(id)}`, "aria-hidden": "true" }) }; }
    if (kind === "character") { const x = c.CHARACTERS.find((y) => y.id === id); return x && { kind, name: t(x.name), art: () => c.portrait(id) }; }
    return null;
  }
  const giftText = (g) => (g.points ? `+${g.points}` : g.ticket ? `${t(MACHINES[g.ticket].ticket)}${(g.n || 1) > 1 ? ` ×${g.n}` : ""}` : `${t(KIND_NAMES[itemOf(g.item)?.kind] || "선물")} · ${itemOf(g.item)?.name || ""}`);
  // A present as a picture: the coin with its number, the ticket, or the thing itself.
  const giftArt = (g) => h("span", { class: `gift-b${g.points ? " points" : g.ticket ? ` ticket ${g.ticket}` : " item"}`, title: giftText(g), role: "img", "aria-label": giftText(g) },
    g.points ? [coin(), h("b", null, `+${g.points}`)] : g.ticket ? [ticketArt(g.ticket), (g.n || 1) > 1 && h("b", null, `×${g.n}`)] : itemOf(g.item)?.art());

  // Tickets for the machines. (An account from the first days of levels may still hold eggs:
  // a sprout egg counts as a ticket, the others as golden tickets.)
  function tickets() {
    const bag = state.user?.bag || {};
    if (bag.tickets) return { basic: bag.tickets.basic || 0, gold: bag.tickets.gold || 0 };
    const eggs = bag.eggs || {};
    return { basic: eggs.sprout || 0, gold: (eggs.shiny || 0) + (eggs.rainbow || 0) };
  }
  const setTickets = (next) => { state.user.bag = { tickets: next }; };

  // Gives what a level or a capsule holds. Returns what arrived (a thing the student has already
  // comes as points, marked `twice`). It is saved at once.
  // quiet: the points are added without a word (a capsule says it itself when it opens).
  function grant(gifts, quiet) {
    const got = [];
    const fresh = [];
    const pay = (n) => { if (quiet) state.user.points = (state.user.points || 0) + n; else c.award(n, t("선물"), false, { league: false }); };
    for (const g of gifts) {
      if (g.points) { pay(g.points); got.push(g); }
      else if (g.ticket) { setTickets({ ...tickets(), [g.ticket]: tickets()[g.ticket] + (g.n || 1) }); got.push(g); }
      else if (g.item) {
        if (owned(g.item) || fresh.includes(g.item)) { pay(TWICE_POINTS); got.push({ points: TWICE_POINTS, twice: g.item }); }
        else { fresh.push(g.item); got.push(g); }
      }
    }
    if (fresh.length) c.saveShop({ ...shop(), owned: [...shop().owned, ...fresh] });
    keep();
    return got;
  }

  // ----- the level -----
  const learned = () => state.words.filter(c.isLearned).length;
  const kept = () => state.user?.level || {};
  const xp = () => Math.max(kept().xp || 0, learned()); // the most words ever learned at once: a level never goes down
  const level = () => levelFor(xp());
  const taken = () => new Set(Array.isArray(kept().got) ? kept().got : []);
  function waiting() { // levels reached whose present has not been taken
    const got = taken(), out = [];
    for (let n = 2; n <= level(); n++) if (!got.has(n)) out.push(n);
    return out;
  }
  // Called when the words are loaded and after a word is learned. Returns the levels reached just now.
  function sync() {
    if (!state.user) return [];
    const before = kept().xp || 0, now = learned();
    if (now <= before) return [];
    state.user.level = { ...kept(), xp: now };
    keep();
    const from = levelFor(before), to = levelFor(now);
    if (to > from) c.publish?.(); // others see the new level
    return Array.from({ length: to - from }, (_, i) => from + i + 1);
  }
  // A word has just been learned: after its own celebration, the level's (when one was reached).
  function learnedOne() {
    const up = sync();
    if (!up.length) return;
    const top = up[up.length - 1];
    setTimeout(() => { c.levelUp(top); c.render(); }, 2100);
    setTimeout(() => giftPill(top), 4300);
  }
  // After the celebration of a new level: a button at the top that stays a while and leads
  // straight to the present. It covers nothing and stops nothing (a quiz may be going on).
  function giftPill(n) {
    document.querySelector(".lv-pill")?.remove();
    if (!waiting().length) return;
    const el = h("button", { class: "lv-pill", onclick: () => { el.remove(); openLevels(); } }, badge(n, 1), t("Lv.{n} 선물 받기", { n }));
    document.body.append(el);
    setTimeout(() => el.remove(), 9000);
  }
  // How near the next present is, as the character says it (it is not shown on the first screen:
  // the badge's ring shows it, and the character tells it now and then).
  function nextGiftLine() {
    if (!state.user?.grade) return null;
    const lv = level(), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    if (waiting().length || !next) return null;
    return t("단어 {n}개만 더 익히면 다음 선물이야!", { n: next - xp() });
  }
  function claim(n) {
    if (n < 2 || n > level() || taken().has(n)) return;
    state.user.level = { ...kept(), xp: xp(), got: [...taken(), n].sort((a, b) => a - b) };
    const got = grant(levelGift(n).gifts);
    c.sfx.cheer(shop().character);
    // points announce themselves (the points pill): one message at a time
    if (got.some((g) => g.ticket)) c.toastText(t("캡슐 티켓을 받았어요! 상점에서 캡슐을 열어 보세요."));
    else if (!got.every((g) => g.points)) c.toastText(t("Lv.{n} 선물: {what}", { n, what: got.filter((g) => !g.points).map(giftText).join(", ") }));
    openLevels(true, n);
  }
  // The level as a badge: a plain disc with the number on it, and round it a ring that fills as
  // the next level comes nearer.
  const RING = 2 * Math.PI * 19.5;
  const progress = () => { const lv = level(), base = needFor(lv), next = lv < LEVEL_MAX ? needFor(lv + 1) : null; return next ? (xp() - base) / (next - base) : 1; };
  // The ring is cut into as many pieces as the level asks words for (when that is few enough to
  // count at a glance), so the pieces still empty are the words still to learn.
  const SEG_MAX = 12, GAP = 3;
  const need = () => { const lv = level(); return lv < LEVEL_MAX ? needFor(lv + 1) - needFor(lv) : 0; };
  function ringDash(part, pieces) {
    if (!pieces || pieces > SEG_MAX) return { bg: "", dash: RING.toFixed(1), off: (RING * (1 - part)).toFixed(1) };
    const piece = RING / pieces - GAP, done = Math.round(part * pieces);
    return { bg: `${piece.toFixed(2)} ${GAP}`, dash: `${Array.from({ length: done }, () => `${piece.toFixed(2)} ${GAP}`).join(" ")} 0 ${RING.toFixed(1)}`.trim(), off: "0" };
  }
  const badge = (lv, part, cls = "", pieces = 0) => { const r = ringDash(part, pieces); return svg("0 0 44 44", `lv-badge ${cls}${r.bg ? " pieces" : ""} z${Math.min(4, Math.floor((lv - 1) / 10))}`, // coloured by its range of levels, like the small ones before names
    `<circle class="lv-ring-bg" cx="22" cy="22" r="19.5"${r.bg ? ` stroke-dasharray="${r.bg}"` : ""} transform="rotate(-90 22 22)"/><circle class="lv-ring" cx="22" cy="22" r="19.5" stroke-dasharray="${r.dash}" stroke-dashoffset="${r.off}" transform="rotate(-90 22 22)"/>` +
    `<circle class="lv-seal" cx="22" cy="22" r="14"/><text x="22" y="22" text-anchor="middle" dominant-baseline="central">${lv}</text>`); };
  // At the top left of every screen. A dot says that presents wait. A press opens the road of levels.
  function levelChip() {
    if (!state.user?.grade) return null;
    const lv = level(), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    const gifts = waiting().length;
    const label = next ? `${t("내 레벨")} ${lv} · ${t("단어 {n}개만 더 익히면 다음 레벨", { n: next - xp() })}` : `${t("내 레벨")} ${lv}`;
    return h("button", { class: `lv-chip${gifts ? " has-gift" : ""}`, title: label, "aria-label": label, onclick: () => openLevels() },
      badge(lv, progress(), "", need()), gifts > 0 && h("em", { class: "lv-dot", "aria-hidden": "true" }));
  }
  // What the character says at the top of the road, a different thing each time it is opened: a
  // cheer in its own manner (by its vibe: cute, cool, calm, wild), or one any character may say.
  // {n}: the words still to learn for the next level (such lines are left out at the last level).
  const CHEERS = {
    "귀여움": ["히히, {n}개만 더 하면 다음 레벨이야! 같이 가자!", "네가 오니까 길이 반짝반짝해!", "한 걸음씩! 내가 옆에서 통통 뛸게!"],
    "멋짐": ["좋은 흐름이야. {n}개만 더 가면 다음 레벨이지.", "여기까지 온 것, 꽤 멋진걸.", "정상은 저 위야. 천천히, 확실하게 가자."],
    "엽기": ["우와아! {n}개 남았다! 으라차차!", "이 길 끝에 뭐가 있을까? 궁금해서 못 참겠어!", "넘어져도 데굴데굴 굴러서 가면 돼!"],
    "쿨함": ["{n}개 남았네. 너라면 금방이지.", "서두를 것 없어. 네 속도로 가.", "오늘도 왔구나. 그거면 충분해."],
    all: ["오늘도 한 칸 올라가 보자!", "여기까지 온 네가 자랑스러워!", "{n}개만 더! 넌 할 수 있어!"],
  };
  function cheer(left) {
    if (left == null) return t("꼭대기까지 왔어! 정말 대단해!");
    const vibe = c.CHARACTERS.find((x) => x.id === shop().character)?.vibe;
    const mine = CHEERS[vibe] || [];
    const pool = [...mine, ...mine, ...CHEERS.all]; // its own manner twice as often
    let line = pool[Math.floor(Math.random() * pool.length)];
    if (line === state.cheerSaid) line = pool[(pool.indexOf(line) + 1) % pool.length];
    state.cheerSaid = line;
    return t(line, { n: left });
  }
  // The road of levels, as a world to climb: five lands one above the other (a meadow, an island,
  // the sea, the snow, the sky), a stone for every level (level 1 at the bottom), the student's
  // character on the stone it has reached, each stone's present drawn beside it.
  // Nothing may lie on anything else, so everything has a place of its own:
  //   stones      zigzag: odd levels on the left (30%), even on the right (70%)
  //   presents    on the other half of the stone's own row
  //   scenery     in the outer margin of the stone's own side
  //   gates       between two lands there is a stretch without stones: the land's big picture
  //               and its clouds are there, on the two sides the road does not use
  // just: the level whose present was taken a moment ago.
  function openLevels(same, just) {
    const old = document.getElementById("sheet");
    const at = same ? old?.querySelector(".lv-road")?.scrollTop : null;
    old?.remove();
    const close = () => { el.remove(); c.render(); };
    const lv = level(), got = taken(), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    const ZONE = 10, LANDS_N = LEVEL_MAX / ZONE;
    const STEP = 104, GATE = 124, PAD = 100;
    const xOf = (n) => (n % 2 ? 30 : 70);
    const yOf = (n) => PAD + (LEVEL_MAX - n) * STEP + Math.floor((LEVEL_MAX - n) / ZONE) * GATE;
    const tall = yOf(1) + PAD;
    const landTop = (z) => (z === LANDS_N - 1 ? 0 : yOf(z * ZONE + ZONE) - STEP / 2); // a land begins under its last stone's row… and takes the gate below it
    // The scenery of each land (five kinds, in turn) and what stands at the way into it: a big
    // picture, one beside it on the other side, something that drifts, and a small one.
    const LANDS = [["flower", "tree", "sprout", "butterfly", "leaf"], ["island", "shell", "sun", "fish", "star"], ["whale", "fish", "gem", "shell", "wind"], ["pine", "snowman", "snow", "mountain", "spark"], ["rainbow", "planet", "moon", "balloon", "rocket"]];
    const GATES = [null, ["island", "sun", "cloud", "shell"], ["whale", "fish", "wind", "gem"], ["snowman", "pine", "cloud", "snow"], ["rainbow", "rocket", "moon", "star"]];
    const line = Array.from({ length: LEVEL_MAX }, (_, i) => {
      const n = i + 1;
      if (n === 1) return `M${xOf(1)} ${yOf(1)}`;
      const mid = (yOf(n) + yOf(n - 1)) / 2;
      return `C${xOf(n - 1)} ${mid} ${xOf(n)} ${mid} ${xOf(n)} ${yOf(n)}`;
    }).join(" ");
    const path = (cls, upTo) => { // drawn in a box 100 wide that is stretched to the map: the line keeps its own width
      const p = svg(`0 0 100 ${tall}`, `lv-path ${cls}`, `<path d="${upTo ? line.split(" C").slice(0, upTo).join(" C") : line}" fill="none" vector-effect="non-scaling-stroke"/>`);
      p.setAttribute("preserveAspectRatio", "none");
      return p;
    };
    if (at == null || !state.lvSay) state.lvSay = cheer(next ? next - xp() : null); // a new cheer each time the road is opened (not when a present is taken)
    const walk = at == null && !just && lv > 1; // the character walks in from the stone before
    const here = h("span", { class: `lv-here${walk ? " walking" : ""}`, style: `left:${xOf(walk ? lv - 1 : lv)}%;top:${yOf(walk ? lv - 1 : lv)}px`, "aria-hidden": "true" }, c.portrait(myLook()));
    const road = h("div", { class: "lv-road lv-map" }, h("div", { class: "lv-map-in", style: `height:${tall}px` },
      Array.from({ length: LANDS_N }, (_, z) => h("i", { class: `lv-zone z${z}`, "aria-hidden": "true", style: `top:${landTop(z)}px;height:${(z === 0 ? tall : landTop(z - 1)) - landTop(z)}px` })),
      // the gates: on the lower left and the upper right of the stretch, where the road does not go
      GATES.map((gate, z) => {
        if (!gate) return null;
        const y = (yOf(z * ZONE) + yOf(z * ZONE + 1)) / 2;
        return [
          h("i", { class: `lv-mark big m-${gate[0]}`, "aria-hidden": "true", style: `top:${y + 26}px;left:20%` }, art(gate[0])),
          h("i", { class: `lv-mark mid m-${gate[1]}`, "aria-hidden": "true", style: `top:${y - 30}px;left:80%` }, art(gate[1])),
          h("i", { class: `lv-cloud m-${gate[2]}`, "aria-hidden": "true", style: `top:${y - 54}px;left:60%;animation-delay:-${z * 1.7}s` }, art(gate[2])),
          h("i", { class: `lv-mark small m-${gate[3]}`, "aria-hidden": "true", style: `top:${y - 56}px;left:10%;animation-delay:-${z * 0.9}s` }, art(gate[3])),
        ];
      }),
      h("i", { class: "lv-goal", "aria-hidden": "true", style: `top:${yOf(LEVEL_MAX) - 60}px;left:${xOf(LEVEL_MAX)}%` }, art("crown")),
      h("i", { class: "lv-mark m-flag", "aria-hidden": "true", style: `top:${yOf(1)}px;left:72%` }, art("flag")),
      // under the first stone, and in the sky over the last
      h("i", { class: "lv-mark mid m-tree", "aria-hidden": "true", style: `top:${yOf(1) + 62}px;left:80%` }, art("tree")),
      h("i", { class: "lv-mark small m-butterfly", "aria-hidden": "true", style: `top:${yOf(1) + 60}px;left:14%` }, art("butterfly")),
      h("i", { class: "lv-twinkle", "aria-hidden": "true", style: `top:${yOf(LEVEL_MAX) - 82}px;left:14%` }, art("spark")),
      h("i", { class: "lv-twinkle", "aria-hidden": "true", style: `top:${yOf(LEVEL_MAX) - 78}px;left:38%;animation-delay:-.8s` }, art("star")),
      path("all"), path("done", lv), path("mid", lv),
      Array.from({ length: LEVEL_MAX }, (_, i) => {
        const n = i + 1;
        const { big, gifts } = levelGift(n);
        const where = n === 1 ? "start" : got.has(n) ? "got" : n <= lv ? "ready" : "locked";
        const left = xOf(n) < 50; // the stone's side; its present is on the other
        const near = Math.abs(n - lv);
        const land = LANDS[Math.min(LANDS_N - 1, Math.floor((n - 1) / ZONE))];
        return [
          h("i", { class: `lv-scene s${n % 3} a${n % 5}`, "aria-hidden": "true", style: `top:${yOf(n)}px;${left ? "left:3%" : "right:3%"};animation-delay:-${(n % 7) * 0.6}s` }, art(land[n % 5])),
          h("button", { class: `lv-step lv-stone ${where}${big ? " big" : ""}${n === lv ? " here" : ""}${n === just ? " just" : ""}`, style: `left:${xOf(n)}%;top:${yOf(n)}px;${at == null && near < 7 ? `animation-delay:${near * 60}ms` : ""}`, disabled: where !== "ready",
            title: where === "ready" ? t("받기") : t("단어 {n}개", { n: needFor(n) }), "aria-label": `Lv.${n}`, onclick: () => claim(n) },
            where === "got" ? h("i", { class: "check-i", "aria-hidden": "true" }) : String(n),
            n === just && h("span", { class: "lv-confetti", "aria-hidden": "true" }, Array.from({ length: 12 }, (_, k) => h("i", { style: `--a:${k * 30}deg;--c:${["#ff8fb8", "#ffd84d", "#7fd6c2", "#9aa5ff", "#ffa45c"][k % 5]};--d:${46 + (k % 3) * 14}px` })))),
          where === "ready" && h("button", { class: "lv-claim", style: `left:${xOf(n)}%;top:${yOf(n) + (big ? 44 : 38)}px`, onclick: () => claim(n) }, t("받기")),
          n > 1 && h("div", { class: `lv-tag ${left ? "right" : "left"} ${where}${big ? " big" : ""}`, style: `top:${yOf(n)}px;${left ? "left:52%" : "right:52%"}` },
            h("span", { class: "lv-gifts" }, gifts.map(giftArt))),
        ];
      }),
      here));
    const big = badge(lv, at == null ? 0 : progress(), "big", need());
    const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
      h("div", { class: "sheet lv-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("내 레벨") },
        h("div", { class: "lv-top" },
          h("p", { class: "lv-say" }, state.lvSay),
          // the badge and the character stand together, whatever the width; the rays are behind the badge
          h("div", { class: "lv-duo" }, big, h("span", { class: "lv-me", "aria-hidden": "true" }, c.portrait(myLook()))),
          h("p", { class: "small lv-next" }, next ? t("단어 {n}개만 더 익히면 다음 레벨", { n: next - xp() }) : t("최고 레벨!"))),
        road,
        h("button", { class: "btn wide", onclick: close }, t("닫기"))));
    document.body.append(el);
    if (at != null) road.scrollTop = at;
    else {   // my stone a little below the middle: the next presents show above, the waiting ones just below
      const goal = () => Math.max(0, yOf(lv) - road.clientHeight * 0.55);
      road.scrollTop = goal(); // already where the character stands when the sheet comes up: the sheet and its picture arrive as one
      requestAnimationFrame(() => {
        road.scrollTop = goal();
        const r = ringDash(progress(), need()), ring = big.querySelector(".lv-ring");
        ring.setAttribute("stroke-dasharray", r.dash);
        ring.setAttribute("stroke-dashoffset", r.off);
        if (walk) setTimeout(() => { here.style.left = `${xOf(lv)}%`; here.style.top = `${yOf(lv)}px`; setTimeout(() => here.classList.remove("walking"), 950); }, 450);
      });
    }
  }

  // ----- the capsule machines -----
  const CAPS = [[38, 62, "#ff8fb8", -20], [56, 70, "#ffd84d", 30], [76, 66, "#7fd6c2", -40], [88, 52, "#9aa5ff", 15], [30, 46, "#ffd84d", 50], [48, 48, "#9aa5ff", -10], [66, 48, "#ff8fb8", 70], [58, 30, "#7fd6c2", 20], [78, 34, "#ffd84d", -60], [40, 30, "#ff8fb8", 40]];
  const capsule = (x, y, colour, turn, cls = "") => `<g class="${cls}" transform="translate(${x} ${y}) rotate(${turn})"><circle r="9" fill="#fff" stroke="#3b3550" stroke-width="1.6"/><path d="M-9 0 a9 9 0 0 1 18 0 z" fill="${colour}" stroke="#3b3550" stroke-width="1.6" stroke-linejoin="round"/></g>`;
  const machineArt = (kind, cls = "") => svg("0 0 120 150", `gm ${kind} ${cls}`,
    `<ellipse class="gm-shadow" cx="60" cy="145" rx="42" ry="4"/>` +
    `<circle class="gm-dome" cx="60" cy="50" r="44"/><g class="gm-caps">${CAPS.map(([x, y, colour, turn], i) => capsule(x, y, kind === "gold" && i % 2 ? "#ffc93c" : colour, turn, `gm-cap c${i % 3}`)).join("")}</g>` +
    `<path class="gm-shine" d="M27 34 q9 -15 25 -19"/>` +
    `<rect class="gm-body" x="16" y="86" width="88" height="54" rx="14"/><rect class="gm-rim" x="12" y="82" width="96" height="12" rx="6"/>` +
    `<g class="gm-knob"><circle class="gm-knob-c" cx="44" cy="117" r="14"/><rect class="gm-knob-h" x="40" y="105" width="8" height="24" rx="4"/></g>` +
    `<rect class="gm-chute" x="68" y="106" width="26" height="24" rx="7"/><g class="gm-drop">${capsule(81, 118, kind === "gold" ? "#ffc93c" : "#ff8fb8", 25)}</g>`);

  // The same machine, small and still (the button that leads to it).
  const machineMini = () => `<circle class="gm-dome" cx="60" cy="50" r="44"/>${CAPS.slice(0, 6).map(([x, y, colour, turn]) => capsule(x, y, colour, turn)).join("")}` +
    `<rect class="gm-body" x="16" y="86" width="88" height="54" rx="14"/><rect class="gm-rim" x="12" y="82" width="96" height="12" rx="6"/><circle class="gm-knob-c" cx="44" cy="117" r="14"/><rect class="gm-chute" x="68" y="106" width="26" height="24" rx="7"/>`;
  const one = (list) => list[Math.floor(Math.random() * list.length)];
  // The things of a kind that a capsule may hold: null for points and tickets (there are always
  // more of those), otherwise the keys of that kind.
  function keysOf(what) {
    if (what[0] === "wear") return WEARS.filter((w) => w.rare <= what[1] && !w.level).map((w) => `wear:${w.id}`); // what a level gives is not in the machines
    if (what[0] === "skin") { // skins of the characters the student has come first
      const all = SKINS.filter((x) => x.rare <= what[1] && !x.level);
      const mine = all.filter((x) => hasCharacter(x.of) && !owned(skinKey(x)));
      return (mine.length ? mine : all).map(skinKey);
    }
    if (what[0] === "concept") return CONCEPTS.filter((x) => x.cost > 0 && !x.special && !x.level).map((x) => `concept:${x.id}`);
    if (what[0] === "bg") return c.BACKGROUNDS.filter((x) => x.cost > 0 && !x.earn && Boolean(x.special) === what[1]).map((x) => `bg:${x.id}`);
    if (what[0] === "theme") return c.THEMES.filter((x) => x.cost > 0 && !x.special).map((x) => `theme:${x.id}`);
    if (what[0] === "character") return c.CHARACTERS.filter((x) => x.special && !x.earn && x.id !== "santa").map((x) => `character:${x.id}`);
    return null;
  }
  const leftOf = (what) => (keysOf(what) || []).filter((key) => !owned(key));
  const thingsLeft = (kind) => MACHINES[kind].inside.some(([what]) => leftOf(what).length > 0); // is there still a thing to win?
  // A kind of thing the student has all of is not drawn: the chance goes to what is still to be had.
  function roll(kind) {
    const machine = MACHINES[kind];
    const open = machine.inside.filter(([what]) => !keysOf(what) || leftOf(what).length > 0);
    let pick = Math.random() * open.reduce((sum, [, often]) => sum + often, 0);
    const [what] = open.find(([, often]) => (pick -= often) < 0) || open[0];
    if (what[0] === "points") return { points: what[1] + 10 * Math.floor(Math.random() * (Math.floor((what[2] - what[1]) / 10) + 1)) };
    if (what[0] === "ticket") return { ticket: what[1], n: 1 };
    const left = leftOf(what);
    return left.length ? { item: one(left) } : { points: machine.again, twice: true };
  }
  const hearts = () => ({ n: 0, all: 0, ...(state.user?.hearts || {}) });
  // A turn is paid with ten hearts (the everyday machine only), a ticket, or points.
  const canPay = (kind, pay) => (pay === "hearts" ? kind === "basic" && hearts().n >= HEARTS_FOR_DRAW : pay === "ticket" ? tickets()[kind] > 0 && (!MACHINES[kind].thingsOnly || thingsLeft(kind)) : Boolean(MACHINES[kind].points) && thingsLeft(kind) && (state.user.points || 0) >= MACHINES[kind].points); // points: only where a turn has a price, and while there is a thing left to win (points won are more than the price)
  // One turn: it is paid, the prize is decided and kept first, and only then shown (the handle
  // turns, a capsule rolls out and opens), so nothing is lost if the window is closed half way.
  function draw(kind, pay) {
    if (!canPay(kind, pay)) return;
    if (pay === "hearts") state.user.hearts = { ...hearts(), n: hearts().n - HEARTS_FOR_DRAW };
    else if (pay === "ticket") setTickets({ ...tickets(), [kind]: tickets()[kind] - 1 });
    else c.spend(MACHINES[kind].points);
    const prize = roll(kind);
    const got = grant([prize.twice ? { points: prize.points } : prize], true)[0];
    const twice = Boolean(prize.twice || got.twice);
    document.getElementById("sheet")?.remove();
    c.render(); // the hearts, tickets or points just paid show as paid behind the machine
    const back = () => { el.remove(); c.render(); };
    const thing = got.item ? itemOf(got.item) : null;
    const colour = kind === "gold" ? "gold" : got.item ? "pink" : got.ticket ? "blue" : "yellow";
    // The show, on a dark stage under turning lights: the machine rattles as its handle goes
    // round, a capsule rolls out and lands in the middle, it rocks harder and harder (longer, and
    // in gold light, when what is inside is rare), then a flash, and the prize in a burst of
    // confetti. A press on the stage skips to the prize.
    const rare = kind === "gold" || Boolean(got.item);
    const machine = machineArt(kind, "big");
    const ball = h("div", { class: `capsule-big ${colour}`, hidden: true, "aria-hidden": "true" }, h("i"), h("u"));
    const flash = h("i", { class: "g-flash", "aria-hidden": "true" });
    const burst = h("span", { class: "g-burst", hidden: true, "aria-hidden": "true" }, Array.from({ length: 18 }, (_, k) => h("i", { style: `--a:${k * 20}deg;--c:${["#ff8fb8", "#ffd84d", "#7fd6c2", "#9aa5ff", "#ffa45c", "#fff"][k % 6]};--d:${70 + (k % 4) * 22}px` })));
    const prizeArt = h("div", { class: `prize-art on-stage${got.points ? " points" : ""}`, hidden: true }, got.points ? [coin(), h("b", null, `+${got.points}`)] : got.ticket ? ticketArt(got.ticket) : thing?.art());
    const stage = h("div", { class: `g-stage${rare ? " rare" : ""}${kind === "gold" ? " gold" : ""}` }, h("i", { class: "g-rays", "aria-hidden": "true" }), machine, ball, prizeArt, burst, flash);
    const prizeBox = h("div", { class: "prize", hidden: true },
      h("b", { class: "prize-name" }, got.points ? t("{n}포인트", { n: got.points }) : got.ticket ? t(MACHINES[got.ticket].ticket) : thing?.name),
      h("small", null, twice ? t("이미 다 가지고 있어서 포인트로 받았어요.") : got.item ? t(KIND_NAMES[thing?.kind] || "선물") : got.ticket ? t("한 번 더 열 수 있어요!") : ""));
    const more = h("button", { class: "btn wide", hidden: true, onclick: () => { el.remove(); draw(kind, pay); } }, t("한 번 더 열기"));
    const use = h("button", { class: "btn wide ghost", hidden: true, onclick: () => { el.remove(); useNow(got.item); } }, t("지금 써 보기"));
    const done = h("button", { class: "link", hidden: true, onclick: back }, t("닫기"));
    const el = h("div", { id: "sheet", class: "sheet-wrap" },
      h("div", { class: "sheet gacha-sheet", role: "dialog", "aria-modal": "true", "aria-label": t(MACHINES[kind].name) }, stage, prizeBox, more, use, done));
    document.body.append(el);
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timers = [];
    let shown = false;
    const reveal = () => {
      if (shown || !el.isConnected) return;
      shown = true;
      timers.forEach(clearTimeout);
      machine.remove();
      ball.hidden = true;
      stage.classList.add("won");
      flash.classList.add("go");
      prizeArt.hidden = false;
      burst.hidden = false;
      prizeBox.hidden = false;
      c.sfx.cheer(shop().character);
      if (got.points) c.countUp(got.points);
      more.hidden = !canPay(kind, pay);
      use.hidden = !(got.item && ["wear", "skin", "concept", "bg", "theme", "character"].includes(thing?.kind));
      done.hidden = false;
    };
    stage.onclick = reveal; // skip
    if (still) return void setTimeout(reveal, 200);
    const step = (ms, fn) => timers.push(setTimeout(() => { if (el.isConnected && !shown) fn(); }, ms));
    const rock = rare ? 1700 : 1000; // how long the capsule rocks before it opens
    requestAnimationFrame(() => machine.classList.add("turning"));
    step(350, () => c.sfx.chirp(shop().character));
    step(1650, () => { machine.classList.add("gone"); ball.hidden = false; });
    step(2150, () => ball.classList.add(rare ? "rock-long" : "rock"));
    step(2150 + rock, () => ball.classList.add("open"));
    step(2150 + rock + 300, reveal);
  }
  // Puts a prize to use at once: wears it, or applies the theme, background, colour or character.
  function useNow(key) {
    const [kind, id] = String(key).split(":");
    if (kind === "wear") { const w = wearById(id); if (w) c.saveShop({ ...shop(), wear: { ...wearing(), [w.slot]: w.id } }); }
    else if (kind === "skin") { const s = SKINS.find((x) => skinKey(x) === key); if (s) c.saveShop({ ...shop(), skin: { ...(shop().skin || {}), [s.of]: s.id } }); }
    else if (kind === "concept") c.saveShop({ ...shop(), concept: id });
    else if (kind === "bg" || kind === "theme") c.saveShop({ ...shop(), [kind]: id, concept: "basic" });
    else if (kind === "character") c.saveShop({ ...shop(), character: id });
    c.openShopTab(kind === "wear" || kind === "skin" ? "wear" : kind);
  }

  // ----- what the character wears (a tab of the shop) -----
  // Bought with points instead of won: it is put on at once.
  function buyWear(w) {
    const cost = wearCost(w);
    if (cost == null || owned(`wear:${w.id}`) || (state.user.points || 0) < cost) return; // the special ones are not for sale
    c.spend(cost);
    c.celebrate(0, t(w.name), "✓");
    c.saveShop({ ...shop(), owned: [...shop().owned, `wear:${w.id}`], wear: { ...wearing(), [w.slot]: w.id } });
  }
  function putOn(w) {
    const next = { ...wearing() };
    if (next[w.slot] === w.id) delete next[w.slot]; else next[w.slot] = w.id;
    c.saveShop({ ...shop(), wear: next });
  }
  function paint(skin) {
    const next = { ...(shop().skin || {}) };
    if (next[skin.of] === skin.id) delete next[skin.of]; else next[skin.of] = skin.id;
    c.saveShop({ ...shop(), skin: next });
  }
  // Under "all" only the skins that matter now are shown (my character's, and the ones I have);
  // the Skins chip shows the skins of every character I have (a character's skins are shown where it is bought).
  function skinsShown(place) {
    const me = shop().character, rank = (x) => (x.of === me ? 0 : hasCharacter(x.of) ? 1 : 2);
    const list = SKINS.filter((x) => owned(skinKey(x)) || (place === "skin" ? hasCharacter(x.of) : x.of === me));
    return [...list].sort((x, y) => rank(x) - rank(y));
  }
  const hasCharacter = (id) => { const x = c.CHARACTERS.find((y) => y.id === id); return Boolean(x) && ((x.cost === 0 && !x.earn) || owned(`character:${id}`)); };
  function wardrobe() {
    const me = shop().character;
    const slotName = Object.fromEntries(SLOTS);
    const tile = (active, has, art, name, sub, action, kind, id) => h("div", { class: `swatch wear-tile${kind === "wear" && wearSpecial(wearById(id)) ? " special" : ""}${active ? " active" : ""}${has ? "" : " locked"}${state.tryOn?.kind === kind && state.tryOn.id === id ? " trying" : ""}`,
      title: active ? null : t("눌러서 미리 보기"), onclick: (e) => { if (!e.target.closest("button") && !active) c.tryOn(kind, id); } }, kind === "wear" && wearSpecial(wearById(id)) && h("span", { class: "ribbon" }, wearById(id).level ? t("레벨 선물") : t("스페셜")),
      kind === "skin" && SKINS.find((x) => skinKey(x) === id)?.level && h("span", { class: "ribbon" }, t("레벨 선물")), art, h("div", { class: "swatch-name" }, name, sub && h("small", null, sub)), action);
    const lock = (item) => h("span", { class: "tagline earn" }, h("i", { class: "lock-i", "aria-hidden": "true" }), item?.level ? t("Lv.{n} 선물", { n: item.level }) : t("캡슐 전용"));
    const worn = Object.values(wearing()).length > 0 || Boolean(shop().skin?.[me]);
    // Six places on the character, one thing in each: the places are drawn under the character,
    // filled or empty, and a press on one shows the things that go there.
    const place = SLOTS.some(([id]) => id === state.wearSlot) || state.wearSlot === "skin" ? state.wearSlot : null;
    const count = SLOTS.filter(([id]) => wearing()[id] && owned(`wear:${wearing()[id]}`)).length;
    const shown = WEARS.filter((w) => !place || w.slot === place);
    void shown.length;
    return [
      h("div", { class: "wear-stage" },
        h("span", { class: "wear-me-art", "aria-hidden": "true" }, c.portrait(myLook())),
        h("div", { class: "wear-slots", role: "tablist", "aria-label": t("소품 자리") }, SLOTS.map(([id, name]) => {
          const worn = wearing()[id] && owned(`wear:${wearing()[id]}`) ? wearById(wearing()[id]) : null;
          return h("button", { class: `wear-slot${worn ? " full" : ""}`, role: "tab", "aria-selected": String(place === id), title: worn ? `${t(name)}: ${t(worn.name)}` : t(name),
            onclick: () => { state.wearSlot = place === id ? null : id; c.render(); } },
            h("span", { class: "wear-slot-art", "aria-hidden": "true" }, worn ? c.portrait(lookOf(me, "", [worn.id])) : null),
            h("small", null, t(name)));
        })),
        h("p", { class: "small wear-count" }, h("b", null, `${count} / ${SLOTS.length}`), " ", t("자리마다 하나씩, {n}곳을 함께 꾸밀 수 있어요.", { n: SLOTS.length }),
          worn && [" ", h("button", { class: "link small", onclick: () => { const skin = { ...(shop().skin || {}) }; delete skin[me]; c.saveShop({ ...shop(), wear: {}, skin }); } }, t("모두 벗기"))])),
      // One chip for each place (and one for the skins), with how many there are and how many are owned.
      h("div", { class: "chips one-line shop-kinds wear-kinds", role: "group", "aria-label": t("소품 자리") },
        [[null, t("전체"), WEARS.filter((w) => owned(`wear:${w.id}`)).length + SKINS.filter((x) => owned(skinKey(x))).length, WEARS.length + skinsShown("skin").length],
          ...SLOTS.map(([id, name]) => [id, t(name), WEARS.filter((w) => w.slot === id && owned(`wear:${w.id}`)).length, WEARS.filter((w) => w.slot === id).length]),
          ["skin", t("스킨"), SKINS.filter((x) => owned(skinKey(x))).length, skinsShown("skin").length]].map(([id, label, have, all]) =>
          h("button", { class: "chip", "aria-pressed": String(place === id), onclick: () => { state.wearSlot = id; c.render(); } }, label, h("small", null, `${have}/${all}`)))),
      place !== "skin" && h("h4", null, place ? t("{name} 소품", { name: t(slotName[place]) }) : t("소품")),
      place !== "skin" && h("div", { class: "shelf" }, shown.map((w) => {
        const has = owned(`wear:${w.id}`), on = has && wearing()[w.slot] === w.id;
        const other = has && !on && wearing()[w.slot] && owned(`wear:${wearing()[w.slot]}`); // the place is taken: this would take its place
        return tile(on, has, c.portrait(lookOf(me, "", [w.id])), t(w.name), t(slotName[w.slot]),
          has ? h("button", { class: "mini", onclick: () => putOn(w) }, on ? t("벗기") : other ? t("바꿔 착용") : t("착용하기"))
            : wearSpecial(w) ? lock(w)
            : state.confirmBuy === `wear:${w.id}` ? h("button", { class: "mini buy", onclick: () => buyWear(w) }, t("살까요?"))
              : h("button", { class: "mini price", disabled: (state.user.points || 0) < wearCost(w), title: (state.user.points || 0) < wearCost(w) ? t("포인트 부족") : null, onclick: () => { state.confirmBuy = `wear:${w.id}`; c.render(); } }, h("i", { "aria-hidden": "true" }, "P"), String(wearCost(w))), "wear", w.id);
      })),
      (!place || place === "skin") && h("h4", null, t("스킨")),
      (!place || place === "skin") && h("div", { class: "shelf" }, skinsShown(place).map((s) => {
        const has = owned(skinKey(s)), mine = hasCharacter(s.of), on = has && shop().skin?.[s.of] === s.id;
        const who = t(c.CHARACTERS.find((x) => x.id === s.of)?.name || "");
        return tile(on && me === s.of, has, c.portrait(lookOf(s.of, s.id)), skinName(s, t), t("{name} 전용", { name: who }),
          !has ? lock(s) : !mine ? h("span", { class: "tagline" }, t("{name}가 있어야 해요", { name: who }))
            : h("button", { class: "mini", onclick: () => paint(s) }, on ? t("기본 모습으로") : t("적용하기")), "skin", skinKey(s));
      })),
    ];
  }

  // ----- hearts from friends -----
  function addHearts(n) {
    if (!n) return;
    state.user.hearts = { n: hearts().n + n, all: hearts().all + n };
    keep();
  }
  // The first tab of the shop: the machine, and what a turn is paid with. Ten places fill up with
  // the hearts friends send; tickets come from levels; points always work. The golden machine
  // stands beside it.
  const gachaBox = () => h("div", { class: "gachas" }, MACHINE_KINDS.map(machineBox)); // both machines, side by side or one under the other
  function machineBox(kind) {
    const machine = MACHINES[kind], held = tickets(), n = hearts().n;
    const way = (pay, art, label, sub) => h("button", { class: `gacha-pay ${pay}${canPay(kind, pay) ? " can" : ""}`, disabled: !canPay(kind, pay), title: label, "aria-label": label, onclick: () => draw(kind, pay) }, art, h("b", null, sub));
    return h("section", { class: `gacha ${kind}${["hearts", "ticket"].some((pay) => canPay(kind, pay)) ? " ready" : ""}` },
      h("b", { class: "gacha-name" }, t(machine.name)),
      h("div", { class: "gacha-stage" }, machineArt(kind)),
      h("div", { class: "gacha-main" },
        kind === "basic" && h("div", { class: "heart-slots", role: "img", "aria-label": `${t("하트")} ${n} / ${HEARTS_FOR_DRAW}` },
          Array.from({ length: HEARTS_FOR_DRAW }, (_, i) => h("i", { class: i < n ? "on" : "", style: `--i:${i}` }))),
        kind === "basic" && n < HEARTS_FOR_DRAW && h("p", { class: "small muted" }, t("친구가 보내 준 하트 {n}개를 모으면 캡슐을 열 수 있어요.", { n: HEARTS_FOR_DRAW })),
        kind === "gold" && h("p", { class: "small muted" }, t("스킨, 테마, 스페셜 캐릭터가 들어 있어요.")),
        h("div", { class: "gacha-pays" },
          kind === "basic" && way("hearts", heartArt(), t("하트 {n}개로 열기", { n: HEARTS_FOR_DRAW }), `${Math.min(n, 99)} / ${HEARTS_FOR_DRAW}`),
          way("ticket", ticketArt(kind), t("{name}으로 열기", { name: t(machine.ticket) }), `×${held[kind]}`),
          machine.points && way("points", coin(), thingsLeft(kind) ? t("포인트로 열기") : t("모두 모았어요!"), String(machine.points)))));
  }

  // At the top of the friends screen: the ten places that fill up with the hearts friends send,
  // and the way to the machine once they are full.
  function heartStrip() {
    const n = hearts().n, ready = n >= HEARTS_FOR_DRAW;
    // One button: the whole strip leads to the capsules (the picture inside is not a button of its own).
    return h("button", { class: `heart-strip${ready ? " ready" : ""}`, title: t("하트 {n}개로 열기", { n: HEARTS_FOR_DRAW }), onclick: () => c.openGacha() },
      h("span", { class: "heart-count" },
        h("span", { class: "heart-slots", role: "img", "aria-label": `${t("하트")} ${n} / ${HEARTS_FOR_DRAW}` },
          Array.from({ length: HEARTS_FOR_DRAW }, (_, i) => h("i", { class: i < n ? "on" : "", style: `--i:${i}` }))),
        h("small", null, ready ? t("캡슐을 열 수 있어요!") : t("캡슐까지 하트 {n}개", { n: HEARTS_FOR_DRAW - n }))),
      h("span", { class: "heart-go" },
        svg("0 0 120 150", "gm basic mini", machineMini()), h("b", null, ready ? t("캡슐") : `${n} / ${HEARTS_FOR_DRAW}`)));
  }
  const canDraw = () => MACHINE_KINDS.some((kind) => ["hearts", "ticket"].some((pay) => canPay(kind, pay)));

  return { myLook, levelChip, openLevels, learnedOne, sync, waiting, level, wardrobe, conceptArt, addHearts, heartBox: heartStrip, gachaBox, canDraw, hearts, tickets,
    ticketArt, nextGiftLine, buyWear, give: grant, openGacha: () => c.openGacha(), openWardrobe: () => c.openShopTab("wear") };
}
