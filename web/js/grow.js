// Growing with the app: a level that rises with the words learned, the presents each level gives,
// the eggs that are cracked for a prize, the things a character wears, and the hearts friends send
// (ten hearts are an egg too). The lists themselves are in goods.js; this file is what is done
// with them and how it is shown. Everything is kept with the account: `level` { xp, got },
// `bag` { eggs: { sprout, shiny, rainbow } }, `hearts` { n, all }, and in `shop`: what is owned
// ("wear:glasses", "skin:rabbit-moon", "concept:space"), `wear` { slot: id }, `skin` { character: id }.
import { CONCEPTS, WEARS, SLOTS, wearById, SKINS, skinKey, EGGS, EGG_KINDS, HEARTS_FOR_EGG, LEVEL_MAX, needFor, levelFor, levelGift } from "./goods.js?v=0.1.28-tp7o3t";
import { lookOf } from "./characters.js?v=0.1.28-tp7o3t";

const TWICE_POINTS = 100; // a present the student already has turns into points

export function initGrow(c) {
  const { h, t, state } = c;
  const shop = () => c.myShop();
  const owned = (key) => shop().owned.includes(key);
  const keep = () => c.api.saveProfile({ level: state.user.level, bag: state.user.bag, hearts: state.user.hearts }).catch(console.error);
  const coin = () => h("i", { class: "coin-i", "aria-hidden": "true" }, "P");
  const eggArt = (kind) => h("i", { class: `egg ${kind}`, "aria-hidden": "true" }, h("u"));

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
  const giftText = (g) => (g.points ? `+${g.points}` : g.egg ? `${t(EGGS[g.egg].name)}${(g.n || 1) > 1 ? ` ×${g.n}` : ""}` : `${t(KIND_NAMES[itemOf(g.item)?.kind] || "선물")} · ${itemOf(g.item)?.name || ""}`);
  const giftChip = (g) => h("span", { class: `gift-chip${g.points ? " points" : g.egg ? " egg-chip" : " item"}` }, g.points ? coin() : g.egg ? eggArt(g.egg) : null, giftText(g));

  // Gives what a level or an egg holds. Returns what arrived (a thing the student has already
  // comes as points, marked `twice`). It is saved at once.
  function grant(gifts) {
    const got = [];
    const fresh = [];
    for (const g of gifts) {
      if (g.points) { c.award(g.points, t("선물"), false, { league: false }); got.push(g); }
      else if (g.egg) {
        const eggs = state.user.bag?.eggs || {};
        state.user.bag = { ...(state.user.bag || {}), eggs: { ...eggs, [g.egg]: (eggs[g.egg] || 0) + (g.n || 1) } };
        got.push(g);
      } else if (g.item) {
        if (owned(g.item) || fresh.includes(g.item)) { c.award(TWICE_POINTS, t("선물"), false, { league: false }); got.push({ points: TWICE_POINTS, twice: g.item }); }
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
  }
  function claim(n) {
    if (n < 2 || n > level() || taken().has(n)) return;
    state.user.level = { ...kept(), xp: xp(), got: [...taken(), n].sort((a, b) => a - b) };
    const got = grant(levelGift(n).gifts);
    c.toastText(t("Lv.{n} 선물: {what}", { n, what: got.map(giftText).join(", ") }));
    openLevels(true);
  }
  // At the top left of every screen: the level, and under it how far the next one is. A dot says
  // that presents wait. A press opens the road of levels.
  function levelChip() {
    if (!state.user?.grade) return null;
    const lv = level(), base = needFor(lv), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    const gifts = waiting().length;
    const label = next ? `${t("내 레벨")} ${lv} · ${t("다음 레벨까지 {n}개", { n: next - xp() })}` : `${t("내 레벨")} ${lv}`;
    return h("button", { class: `lv-chip${gifts ? " has-gift" : ""}`, title: label, "aria-label": label, onclick: () => openLevels() },
      h("b", null, `Lv.${lv}`),
      h("span", { class: "lv-bar", "aria-hidden": "true" }, h("i", { style: `width:${next ? Math.round(((xp() - base) / (next - base)) * 100) : 100}%` })),
      gifts > 0 && h("em", { class: "lv-dot", "aria-hidden": "true" }));
  }
  // The eggs the student holds; a press cracks one.
  const eggsHeld = () => state.user.bag?.eggs || {};
  const eggBar = (from) => h("div", { class: "egg-bar" }, EGG_KINDS.map((kind) =>
    h("button", { class: "egg-slot", disabled: !(eggsHeld()[kind] > 0), title: t("알 깨기"), onclick: () => openEgg(kind, from) },
      eggArt(kind), h("small", null, t(EGGS[kind].name)), h("b", null, `×${eggsHeld()[kind] || 0}`))));
  // The road of levels: what each one gives, which presents wait, which are still ahead.
  function openLevels(same) {
    const old = document.getElementById("sheet");
    const at = same ? old?.querySelector(".lv-road")?.scrollTop : null;
    old?.remove();
    const close = () => { el.remove(); c.render(); };
    const lv = level(), got = taken(), base = needFor(lv), next = lv < LEVEL_MAX ? needFor(lv + 1) : null;
    const road = h("ol", { class: "lv-road" }, Array.from({ length: LEVEL_MAX }, (_, i) => {
      const n = i + 1;
      const { big, gifts } = levelGift(n);
      const where = n === 1 ? "start" : got.has(n) ? "got" : n <= lv ? "ready" : "locked";
      return h("li", { class: `lv-step ${where}${big ? " big" : ""}${n === lv ? " here" : ""}` },
        h("span", { class: "lv-step-no" }, h("b", null, String(n)), h("small", null, t("단어 {n}개", { n: needFor(n) }))),
        h("span", { class: "lv-gifts" }, n === 1 ? h("span", { class: "small muted" }, t("여기서 시작!")) : [big && h("em", { class: "lv-big" }, t("특별 선물")), gifts.map(giftChip)]),
        where === "ready" ? h("button", { class: "mini buy", onclick: () => claim(n) }, t("받기"))
          : where === "got" ? h("span", { class: "lv-done", title: t("받음"), "aria-label": t("받음") }, "✓")
          : where === "locked" ? h("span", { class: "lv-lock", "aria-hidden": "true" }, "🔒") : null);
    }));
    const el = h("div", { id: "sheet", class: "sheet-wrap", onclick: (e) => { if (e.target === el) close(); } },
      h("div", { class: "sheet lv-sheet", role: "dialog", "aria-modal": "true", "aria-label": t("내 레벨") },
        h("div", { class: "lv-top" },
          h("span", { class: "lv-me", "aria-hidden": "true" }, c.portrait(myLook())),
          h("div", { class: "lv-now" },
            h("h2", null, `Lv.${lv}`),
            h("span", { class: "lv-bar", "aria-hidden": "true" }, h("i", { style: `width:${next ? Math.round(((xp() - base) / (next - base)) * 100) : 100}%` })),
            h("p", { class: "small" }, t("다 익힌 단어 {n}개", { n: xp() }), " · ", next ? t("다음 레벨까지 {n}개", { n: next - xp() }) : t("최고 레벨!")))),
        h("p", { class: "small muted" }, t("퀴즈에서 단어를 다 익힐 때마다 레벨이 올라요. 레벨마다 선물이 있어요.")),
        eggBar("levels"),
        road,
        h("button", { class: "btn wide", onclick: close }, t("닫기"))));
    document.body.append(el);
    if (at != null) road.scrollTop = at;
    else road.querySelector(waiting().length ? ".lv-step.ready" : ".lv-step.here")?.scrollIntoView({ block: "center" });
  }

  // ----- eggs -----
  const one = (list) => list[Math.floor(Math.random() * list.length)];
  function roll(kind) {
    const egg = EGGS[kind];
    let pick = Math.random() * egg.inside.reduce((sum, [, often]) => sum + often, 0);
    const [what] = egg.inside.find(([, often]) => (pick -= often) < 0) || egg.inside[0];
    const left = (keys) => keys.filter((key) => !owned(key));
    const item = (keys) => (left(keys).length ? { item: one(left(keys)) } : { points: egg.again, twice: true });
    if (what[0] === "points") return { points: what[1] + 10 * Math.floor(Math.random() * (Math.floor((what[2] - what[1]) / 10) + 1)) };
    if (what[0] === "egg") return { egg: what[1], n: 1 };
    if (what[0] === "wear") return item(WEARS.filter((w) => w.rare <= what[1]).map((w) => `wear:${w.id}`));
    if (what[0] === "skin") return item(SKINS.filter((s) => s.rare <= what[1]).map(skinKey));
    if (what[0] === "concept") return item(CONCEPTS.filter((x) => x.cost > 0 && !x.special).map((x) => `concept:${x.id}`));
    if (what[0] === "bg") return item(c.BACKGROUNDS.filter((x) => x.cost > 0 && !x.earn && Boolean(x.special) === what[1]).map((x) => `bg:${x.id}`));
    if (what[0] === "theme") return item(c.THEMES.filter((x) => x.cost > 0 && !x.special).map((x) => `theme:${x.id}`));
    if (what[0] === "character") return item(c.CHARACTERS.filter((x) => x.special && !x.earn && x.id !== "santa").map((x) => `character:${x.id}`));
    return { points: egg.again };
  }
  const hearts = () => ({ n: 0, all: 0, ...(state.user?.hearts || {}) });
  const canOpen = (kind) => (kind === "heart" ? hearts().n >= HEARTS_FOR_EGG : eggsHeld()[kind] > 0);
  // Cracks one egg: the prize is decided and kept first, then shown, so nothing is lost if the
  // window is closed half way. from: where to go back to ("levels": the road of levels).
  function openEgg(kind, from) {
    if (!canOpen(kind)) return;
    if (kind === "heart") state.user.hearts = { ...hearts(), n: hearts().n - HEARTS_FOR_EGG };
    else state.user.bag = { ...(state.user.bag || {}), eggs: { ...eggsHeld(), [kind]: eggsHeld()[kind] - 1 } };
    const prize = roll(kind);
    const got = grant([prize.twice ? { points: prize.points } : prize])[0];
    const twice = Boolean(prize.twice || got.twice);
    document.getElementById("sheet")?.remove();
    const back = () => { el.remove(); c.render(); if (from === "levels") openLevels(); };
    const thing = got.item ? itemOf(got.item) : null;
    const title = h("h2", null, t(EGGS[kind].name));
    const text = h("p", null, t("알을 눌러서 깨 보세요!"));
    const prizeBox = h("div", { class: "prize", hidden: true },
      h("div", { class: `prize-art${got.points ? " points" : ""}` }, got.points ? [coin(), h("b", null, `+${got.points}`)] : got.egg ? eggArt(got.egg) : thing?.art()),
      h("b", { class: "prize-name" }, got.points ? t("{n}포인트", { n: got.points }) : got.egg ? t(EGGS[got.egg].name) : thing?.name),
      h("small", null, twice ? t("이미 다 가지고 있어서 포인트로 받았어요.") : got.item ? t(KIND_NAMES[thing?.kind] || "선물") : got.egg ? t("알이 하나 더 생겼어요!") : ""));
    const more = h("button", { class: "btn wide", hidden: true, onclick: () => { el.remove(); openEgg(kind, from); } }, t("하나 더 깨기"));
    const use = h("button", { class: "btn wide ghost", hidden: true, onclick: () => { el.remove(); useNow(got.item); } }, t("지금 써 보기"));
    const done = h("button", { class: "link", hidden: true, onclick: back }, t("닫기"));
    let cracked = false;
    const crack = () => {
      if (cracked) return;
      cracked = true;
      egg.classList.add("crack");
      c.sfx.cheer(shop().character);
      setTimeout(() => {
        egg.hidden = true;
        prizeBox.hidden = false;
        title.textContent = t("짜잔!");
        text.hidden = true;
        more.hidden = !canOpen(kind);
        use.hidden = !(got.item && ["wear", "skin", "concept", "bg", "theme", "character"].includes(thing?.kind));
        done.hidden = false;
      }, 700);
    };
    const egg = h("button", { class: `egg-big egg ${kind}`, "aria-label": t("알 깨기"), onclick: crack }, h("u"));
    const el = h("div", { id: "sheet", class: "sheet-wrap" },
      h("div", { class: "sheet egg-sheet", role: "dialog", "aria-modal": "true", "aria-label": t(EGGS[kind].name) }, title, text, egg, prizeBox, more, use, done));
    document.body.append(el);
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
    const tile = (active, has, art, name, sub, action) => h("div", { class: `swatch wear-tile${active ? " active" : ""}${has ? "" : " locked"}` }, art, h("div", { class: "swatch-name" }, name, sub && h("small", null, sub)), action);
    const lock = () => h("span", { class: "tagline earn" }, "🔒 ", t("알에서 나와요"));
    const worn = Object.values(wearing()).length > 0 || Boolean(shop().skin?.[me]);
    return [
      h("div", { class: "wear-me" },
        h("span", { class: "wear-me-art", "aria-hidden": "true" }, c.portrait(myLook())),
        h("div", null,
          h("b", null, t("내 캐릭터 꾸미기")),
          h("p", { class: "small muted" }, t("소품과 스킨은 알에서 나오거나 레벨 선물로 받아요. 꾸민 모습은 내 화면에서 보여요.")),
          worn && h("button", { class: "link small", onclick: () => { const skin = { ...(shop().skin || {}) }; delete skin[me]; c.saveShop({ ...shop(), wear: {}, skin }); } }, t("모두 벗기")))),
      h("h4", null, t("소품"), h("small", null, ` ${WEARS.filter((w) => owned(`wear:${w.id}`)).length} / ${WEARS.length}`)),
      h("div", { class: "shelf" }, WEARS.map((w) => {
        const has = owned(`wear:${w.id}`), on = has && wearing()[w.slot] === w.id;
        return tile(on, has, c.portrait(lookOf(me, "", [w.id])), t(w.name), t(slotName[w.slot]),
          has ? h("button", { class: "mini", onclick: () => putOn(w) }, on ? t("벗기") : t("착용하기")) : lock());
      })),
      h("h4", null, t("스킨"), h("small", null, ` ${SKINS.filter((s) => owned(skinKey(s))).length} / ${SKINS.length}`)),
      h("div", { class: "shelf" }, SKINS.map((s) => {
        const has = owned(skinKey(s)), mine = hasCharacter(s.of), on = has && shop().skin?.[s.of] === s.id;
        const who = t(c.CHARACTERS.find((x) => x.id === s.of)?.name || "");
        return tile(on && me === s.of, has, c.portrait(lookOf(s.of, s.id)), t(s.name), t("{name} 전용", { name: who }),
          !has ? lock() : !mine ? h("span", { class: "tagline" }, t("{name}가 있어야 해요", { name: who }))
            : h("button", { class: "mini", onclick: () => paint(s) }, on ? t("기본 모습으로") : t("적용하기")));
      })),
    ];
  }

  // ----- hearts from friends -----
  function addHearts(n) {
    if (!n) return;
    state.user.hearts = { n: hearts().n + n, all: hearts().all + n };
    keep();
  }
  // At the top of the screen where hearts are sent and taken: ten places that fill up, and the egg
  // they make. It is meant to be looked at: the hearts held beat, the egg rocks once it is ready.
  function heartBox() {
    const n = hearts().n, ready = n >= HEARTS_FOR_EGG;
    return h("section", { class: `heart-box${ready ? " ready" : ""}` },
      h("span", { class: "heart-egg", "aria-hidden": "true" }, eggArt("heart")),
      h("div", { class: "heart-main" },
        h("b", null, ready ? t("하트 알을 깰 수 있어요!") : t("하트 {n}개를 모으면 하트 알 하나!", { n: HEARTS_FOR_EGG })),
        h("div", { class: "heart-slots", role: "img", "aria-label": `${n} / ${HEARTS_FOR_EGG}` },
          Array.from({ length: HEARTS_FOR_EGG }, (_, i) => h("i", { class: i < n ? "on" : "", style: `--i:${i}` }, "♥"))),
        h("small", null, n > HEARTS_FOR_EGG ? t("하트 {n}개가 모였어요.", { n }) : ready ? t("알 안에 포인트, 알, 소품이 들어 있어요.") : t("친구가 보낸 하트를 받으면 채워져요. {n}개 남았어요.", { n: HEARTS_FOR_EGG - n }))),
      h("button", { class: "btn heart-open", disabled: !ready, onclick: () => openEgg("heart", "friends") }, t("알 깨기")));
  }

  return { myLook, levelChip, openLevels, learnedOne, sync, waiting, level, wardrobe, conceptArt, addHearts, heartBox, hearts, eggArt };
}
