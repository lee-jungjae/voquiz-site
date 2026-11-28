// Growing with the app: a level that rises with the words learned, the presents each level gives,
// the capsule machines that are turned for a prize, the things a character wears, and the hearts
// friends send (ten hearts are a turn of the machine). The lists themselves are in goods.js; this
// file is what is done with them and how it is shown. Everything is kept with the account:
// `level` { xp, got }, `bag` { tickets: { basic, gold } }, `hearts` { n, all }, and in `shop`: what
// is owned ("wear:glasses", "skin:rabbit-moon", "concept:space"), `wear` { slot: id }, `skin` { character: id }.
import { CONCEPTS, WEARS, SLOTS, wearById, SKINS, skinKey, MACHINES, MACHINE_KINDS, HEARTS_FOR_DRAW, LEVEL_MAX, needFor, levelFor, levelGift } from "./goods.js?v=0.1.28-tp7s7h";
import { lookOf } from "./characters.js?v=0.1.28-tp7s7h";
import { art } from "./art.js?v=0.1.28-tp7s7h"; // eslint-disable-line no-unused-vars

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
    if (kind === "skin") { const s = SKINS.find((x) => skinKey(x) === key); return s && { kind, name: t(s.name), art: () => c.portrait(lookOf(s.of, s.id)) }; }
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
    return Array.from({ length: to - from }, (_, i) => from + i + 1);
  }
  // A word has just been learned: after its own celebration, the level's (when one was reached).
  function learnedOne() {
    const up = sync();
    if (!up.length) return;
    const top = up[up.length - 1];
    setTimeout(() => { c.celebrate(0, t("레벨 업!"), `Lv.${top}`); c.render(); }, 2100);
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
    if (got.some((g) => g.ticket)) c.toastText(t("뽑기권을 받았어요! 뽑기 기계에서 써 보세요."));
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
  const badge = (lv, part, cls = "", pieces = 0) => { const r = ringDash(part, pieces); return svg("0 0 44 44", `lv-badge ${cls}${r.bg ? " pieces" : ""}`,
    `<circle class="lv-ring-bg" cx="22" cy="22" r="19.5"${r.bg ? ` stroke-dasharray="${r.bg}"` : ""} transform="rotate(-90 22 22)"/><circle class="lv-ring" cx="22" cy="22" r="19.5" stroke-dasharray="${r.dash}" stroke-dashoffset="${r.off}" transform="rotate(-90 22 22)"/>` +
    `<circle class="lv-seal" cx="22" cy="22" r="14"/><text x="22" y="22" text-anchor="middle" dominant-baseline="central">${lv}</text>`); };
  // At the top left of every screen. A dot says that presents wait. A press opens the road of levels.
  function levelChip() {
    if (!state.user?.grade) return null;
    const lv = level(), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    const gifts = waiting().length;
    const label = next ? `${t("내 레벨")} ${lv} · ${t("다음 레벨까지 {n}개", { n: next - xp() })}` : `${t("내 레벨")} ${lv}`;
    return h("button", { class: `lv-chip${gifts ? " has-gift" : ""}`, title: label, "aria-label": label, onclick: () => openLevels() },
      badge(lv, progress(), "", need()), gifts > 0 && h("em", { class: "lv-dot", "aria-hidden": "true" }));
  }
  // The road of levels, as a map: a path that winds upward through five lands, a stone for every
  // level (level 1 at the bottom), the student's character on the stone it has reached, and each
  // stone's present drawn beside it. just: the level whose present was taken a moment ago.
  function openLevels(same, just) {
    const old = document.getElementById("sheet");
    const at = same ? old?.querySelector(".lv-road")?.scrollTop : null;
    old?.remove();
    const close = () => { el.remove(); c.render(); };
    const lv = level(), got = taken(), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    const STEP = 92, PAD = 60, tall = (LEVEL_MAX - 1) * STEP + PAD * 2;
    const xOf = (n) => 50 + 26 * Math.sin((n - 1) * 0.95), yOf = (n) => PAD + (LEVEL_MAX - n) * STEP;
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
    const ZONE = 10; // a land every ten levels
    const road = h("div", { class: "lv-road lv-map" }, h("div", { class: "lv-map-in", style: `height:${tall}px` },
      Array.from({ length: LEVEL_MAX / ZONE }, (_, z) => h("i", { class: `lv-zone z${z}`, "aria-hidden": "true", style: `top:${z === LEVEL_MAX / ZONE - 1 ? 0 : yOf((z + 1) * ZONE) - STEP / 2}px;height:${z === LEVEL_MAX / ZONE - 1 ? yOf(z * ZONE) + STEP / 2 : ZONE * STEP}px` })),
      path("all"), path("done", lv),
      Array.from({ length: LEVEL_MAX }, (_, i) => {
        const n = i + 1;
        const { big, gifts } = levelGift(n);
        const where = n === 1 ? "start" : got.has(n) ? "got" : n <= lv ? "ready" : "locked";
        const side = xOf(n) > 50 ? "left" : "right";
        const near = Math.abs(n - lv);
        return [
          // a little thing of the land, on the stone's own side of the map
          n % 2 === 0 && h("i", { class: `lv-deco d${(n / 2) % 4}`, "aria-hidden": "true", style: `top:${yOf(n) + STEP / 2}px;${side === "left" ? "right:6%" : "left:6%"}` }),
          h("button", { class: `lv-step lv-stone ${where}${big ? " big" : ""}${n === lv ? " here" : ""}${n === just ? " just" : ""}`, style: `left:${xOf(n)}%;top:${yOf(n)}px;${at == null && near < 7 ? `animation-delay:${near * 60}ms` : ""}`, disabled: where !== "ready",
            title: where === "ready" ? t("받기") : t("단어 {n}개", { n: needFor(n) }), "aria-label": `Lv.${n}`, onclick: () => claim(n) },
            where === "got" ? h("i", { class: "check-i", "aria-hidden": "true" }) : String(n)),
          n === lv && h("span", { class: "lv-here", style: `left:${xOf(n)}%;top:${yOf(n)}px`, "aria-hidden": "true" }, c.portrait(myLook())),
          n > 1 && h("div", { class: `lv-tag ${side} ${where}${big ? " big" : ""}`, style: `top:${yOf(n)}px;${side === "left" ? `right:${100 - xOf(n) + 11}%` : `left:${xOf(n) + 11}%`}` },
            h("span", { class: "lv-gifts" }, gifts.map(giftArt)),
            where === "ready" && h("button", { class: "mini buy", onclick: () => claim(n) }, t("받기"))),
        ];
      })));
    const held = tickets().basic + tickets().gold;
    const big = badge(lv, at == null ? 0 : progress(), "big", need());
    const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
      h("div", { class: "sheet lv-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("내 레벨") },
        h("div", { class: "lv-top" },
          big,
          h("span", { class: "lv-me", "aria-hidden": "true" }, c.portrait(myLook())),
          h("p", { class: "small lv-next" }, next ? t("다음 레벨까지 {n}개", { n: next - xp() }) : t("최고 레벨!"))),
        road,
        held > 0 && h("button", { class: "btn wide ghost lv-go", onclick: () => { el.remove(); c.openGacha(); } }, ticketArt(tickets().gold ? "gold" : "basic"), t("뽑기 기계로 가기"), h("b", null, `×${held}`)),
        h("button", { class: "btn wide", onclick: close }, t("닫기"))));
    document.body.append(el);
    if (at != null) road.scrollTop = at;
    else {   // my stone a little below the middle: the next gifts show above, the waiting ones just below
      const me = road.querySelector(".lv-step.here") || road.querySelector(".lv-step.ready");
      const put = () => { if (me) road.scrollTop = me.offsetTop - road.clientHeight * 0.55; };
      put();
      requestAnimationFrame(() => { put(); const r = ringDash(progress(), need()), ring = big.querySelector(".lv-ring"); ring.setAttribute("stroke-dasharray", r.dash); ring.setAttribute("stroke-dashoffset", r.off); });
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
  function roll(kind) {
    const machine = MACHINES[kind];
    let pick = Math.random() * machine.inside.reduce((sum, [, often]) => sum + often, 0);
    const [what] = machine.inside.find(([, often]) => (pick -= often) < 0) || machine.inside[0];
    const left = (keys) => keys.filter((key) => !owned(key));
    const item = (keys) => (left(keys).length ? { item: one(left(keys)) } : { points: machine.again, twice: true });
    if (what[0] === "points") return { points: what[1] + 10 * Math.floor(Math.random() * (Math.floor((what[2] - what[1]) / 10) + 1)) };
    if (what[0] === "ticket") return { ticket: what[1], n: 1 };
    if (what[0] === "wear") return item(WEARS.filter((w) => w.rare <= what[1]).map((w) => `wear:${w.id}`));
    if (what[0] === "skin") return item(SKINS.filter((s) => s.rare <= what[1]).map(skinKey));
    if (what[0] === "concept") return item(CONCEPTS.filter((x) => x.cost > 0 && !x.special).map((x) => `concept:${x.id}`));
    if (what[0] === "bg") return item(c.BACKGROUNDS.filter((x) => x.cost > 0 && !x.earn && Boolean(x.special) === what[1]).map((x) => `bg:${x.id}`));
    if (what[0] === "theme") return item(c.THEMES.filter((x) => x.cost > 0 && !x.special).map((x) => `theme:${x.id}`));
    if (what[0] === "character") return item(c.CHARACTERS.filter((x) => x.special && !x.earn && x.id !== "santa").map((x) => `character:${x.id}`));
    return { points: machine.again };
  }
  const hearts = () => ({ n: 0, all: 0, ...(state.user?.hearts || {}) });
  // A turn is paid with ten hearts (the everyday machine only), a ticket, or points.
  const canPay = (kind, pay) => (pay === "hearts" ? kind === "basic" && hearts().n >= HEARTS_FOR_DRAW : pay === "ticket" ? tickets()[kind] > 0 : (state.user.points || 0) >= MACHINES[kind].points);
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
    const machine = machineArt(kind, "big");
    const ball = h("div", { class: `capsule-big ${colour}`, hidden: true, "aria-hidden": "true" }, h("i"), h("u"));
    const prizeBox = h("div", { class: "prize", hidden: true },
      h("div", { class: `prize-art${got.points ? " points" : ""}` }, got.points ? [coin(), h("b", null, `+${got.points}`)] : got.ticket ? ticketArt(got.ticket) : thing?.art()),
      h("b", { class: "prize-name" }, got.points ? t("{n}포인트", { n: got.points }) : got.ticket ? t(MACHINES[got.ticket].ticket) : thing?.name),
      h("small", null, twice ? t("이미 다 가지고 있어서 포인트로 받았어요.") : got.item ? t(KIND_NAMES[thing?.kind] || "선물") : got.ticket ? t("한 번 더 뽑을 수 있어요!") : ""));
    const more = h("button", { class: "btn wide", hidden: true, onclick: () => { el.remove(); draw(kind, pay); } }, t("한 번 더 뽑기"));
    const use = h("button", { class: "btn wide ghost", hidden: true, onclick: () => { el.remove(); useNow(got.item); } }, t("지금 써 보기"));
    const done = h("button", { class: "link", hidden: true, onclick: back }, t("닫기"));
    const el = h("div", { id: "sheet", class: "sheet-wrap" },
      h("div", { class: "sheet gacha-sheet", role: "dialog", "aria-modal": "true", "aria-label": t(MACHINES[kind].name) }, machine, ball, prizeBox, more, use, done));
    document.body.append(el);
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const step = (ms, fn) => setTimeout(() => { if (el.isConnected) fn(); }, still ? Math.min(ms, 200) : ms);
    requestAnimationFrame(() => machine.classList.add("turning"));
    step(1500, () => { machine.remove(); ball.hidden = false; });
    step(2000, () => { ball.classList.add("open"); c.sfx.cheer(shop().character); });
    step(2450, () => {
      ball.hidden = true;
      prizeBox.hidden = false;
      if (got.points) c.countUp(got.points);
      more.hidden = !canPay(kind, pay);
      use.hidden = !(got.item && ["wear", "skin", "concept", "bg", "theme", "character"].includes(thing?.kind));
      done.hidden = false;
    });
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
  const hasCharacter = (id) => { const x = c.CHARACTERS.find((y) => y.id === id); return Boolean(x) && ((x.cost === 0 && !x.earn) || owned(`character:${id}`)); };
  function wardrobe() {
    const me = shop().character;
    const slotName = Object.fromEntries(SLOTS);
    const tile = (active, has, art, name, sub, action, kind, id) => h("div", { class: `swatch wear-tile${active ? " active" : ""}${has ? "" : " locked"}${state.tryOn?.kind === kind && state.tryOn.id === id ? " trying" : ""}`,
      title: active ? null : t("눌러서 미리 보기"), onclick: (e) => { if (!e.target.closest("button") && !active) c.tryOn(kind, id); } }, art, h("div", { class: "swatch-name" }, name, sub && h("small", null, sub)), action);
    const lock = () => h("span", { class: "tagline earn" }, h("i", { class: "lock-i", "aria-hidden": "true" }), t("뽑기에서 나와요"));
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
        h("p", { class: "small wear-count" }, h("b", null, `${count} / ${SLOTS.length}`), " ", t("자리마다 하나씩, 여섯 자리를 함께 꾸밀 수 있어요."),
          worn && [" ", h("button", { class: "link small", onclick: () => { const skin = { ...(shop().skin || {}) }; delete skin[me]; c.saveShop({ ...shop(), wear: {}, skin }); } }, t("모두 벗기"))])),
      // One chip for each place (and one for the skins), with how many there are and how many are owned.
      h("div", { class: "chips one-line shop-kinds wear-kinds", role: "group", "aria-label": t("소품 자리") },
        [[null, t("전체"), WEARS.filter((w) => owned(`wear:${w.id}`)).length + SKINS.filter((x) => owned(skinKey(x))).length, WEARS.length + SKINS.length],
          ...SLOTS.map(([id, name]) => [id, t(name), WEARS.filter((w) => w.slot === id && owned(`wear:${w.id}`)).length, WEARS.filter((w) => w.slot === id).length]),
          ["skin", t("스킨"), SKINS.filter((x) => owned(skinKey(x))).length, SKINS.length]].map(([id, label, have, all]) =>
          h("button", { class: "chip", "aria-pressed": String(place === id), onclick: () => { state.wearSlot = id; c.render(); } }, label, h("small", null, `${have}/${all}`)))),
      place !== "skin" && h("h4", null, place ? t("{name}에 하는 소품", { name: t(slotName[place]) }) : t("소품")),
      place !== "skin" && h("div", { class: "shelf" }, shown.map((w) => {
        const has = owned(`wear:${w.id}`), on = has && wearing()[w.slot] === w.id;
        const other = has && !on && wearing()[w.slot] && owned(`wear:${wearing()[w.slot]}`); // the place is taken: this would take its place
        return tile(on, has, c.portrait(lookOf(me, "", [w.id])), t(w.name), t(slotName[w.slot]),
          has ? h("button", { class: "mini", onclick: () => putOn(w) }, on ? t("벗기") : other ? t("바꿔 착용") : t("착용하기")) : lock(), "wear", w.id);
      })),
      (!place || place === "skin") && h("h4", null, t("스킨")),
      (!place || place === "skin") && h("div", { class: "shelf" }, SKINS.map((s) => {
        const has = owned(skinKey(s)), mine = hasCharacter(s.of), on = has && shop().skin?.[s.of] === s.id;
        const who = t(c.CHARACTERS.find((x) => x.id === s.of)?.name || "");
        return tile(on && me === s.of, has, c.portrait(lookOf(s.of, s.id)), t(s.name), t("{name} 전용", { name: who }),
          !has ? lock() : !mine ? h("span", { class: "tagline" }, t("{name}가 있어야 해요", { name: who }))
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
        kind === "gold" && h("p", { class: "small muted" }, t("스킨, 테마, 스페셜 캐릭터가 들어 있어요.")),
        h("div", { class: "gacha-pays" },
          kind === "basic" && way("hearts", heartArt(), t("하트 {n}개로 뽑기", { n: HEARTS_FOR_DRAW }), `${Math.min(n, 99)} / ${HEARTS_FOR_DRAW}`),
          way("ticket", ticketArt(kind), t("{name}으로 뽑기", { name: t(machine.ticket) }), `×${held[kind]}`),
          way("points", coin(), t("포인트로 뽑기"), String(machine.points)))));
  }

  // At the top of the friends screen: the ten places that fill up with the hearts friends send,
  // and the way to the machine once they are full.
  function heartStrip() {
    const n = hearts().n, ready = n >= HEARTS_FOR_DRAW;
    return h("section", { class: `heart-strip${ready ? " ready" : ""}` },
      h("div", { class: "heart-count" },
        h("div", { class: "heart-slots", role: "img", "aria-label": `${t("하트")} ${n} / ${HEARTS_FOR_DRAW}` },
          Array.from({ length: HEARTS_FOR_DRAW }, (_, i) => h("i", { class: i < n ? "on" : "", style: `--i:${i}` }))),
        h("small", null, ready ? t("뽑기를 돌릴 수 있어요!") : t("뽑기까지 하트 {n}개", { n: HEARTS_FOR_DRAW - n }))),
      h("button", { class: "heart-go", title: t("하트 {n}개로 뽑기", { n: HEARTS_FOR_DRAW }), onclick: () => c.openGacha() },
        svg("0 0 120 150", "gm basic mini", machineMini()), h("b", null, ready ? t("뽑기") : `${n} / ${HEARTS_FOR_DRAW}`)));
  }
  const canDraw = () => MACHINE_KINDS.some((kind) => ["hearts", "ticket"].some((pay) => canPay(kind, pay)));

  return { myLook, levelChip, openLevels, learnedOne, sync, waiting, level, wardrobe, conceptArt, addHearts, heartBox: heartStrip, gachaBox, canDraw, hearts, tickets,
    ticketArt, nextGiftLine, give: grant, openGacha: () => c.openGacha(), openWardrobe: () => c.openShopTab("wear") };
}
