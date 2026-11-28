// Choices that belong to this device rather than to the account: how the app behaves in a
// classroom, and how a quiz asks.
const on = (key) => localStorage.getItem(key) === "on";
const put = (key, value) => localStorage.setItem(key, value ? "on" : "off");

// Focus mode: no walking or peeking characters, no celebrations over the screen, no sheets that
// open by themselves. For class time.
export const focusOn = () => on("wb_focus");
export const setFocus = (value) => put("wb_focus", value);

// The word quiz without a clock (the streak challenge and duels keep theirs).
export const untimedOn = () => on("wb_untimed");
export const setUntimed = (value) => put("wb_untimed", value);

// The language definitions are read in: "mix" (both, as a bilingual student reads), "ko" or "en".
export const defLang = () => { const v = localStorage.getItem("wb_deflang"); return v === "ko" || v === "en" ? v : "mix"; };
export const setDefLang = (value) => localStorage.setItem("wb_deflang", value);
// A kind of question side (en, ko, den, dko): a definition is given in the chosen language.
export const defKind = (kind) => { const l = defLang(); return l === "ko" && kind === "den" ? "dko" : l === "en" && kind === "dko" ? "den" : kind; };
