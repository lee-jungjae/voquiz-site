// Students read Hangul and English, not hanja. Entries are asked to avoid hanja, but older saved
// entries (and the occasional slip) still contain some, so every entry is cleaned before it is shown.
const HAN = /\p{Script=Han}/u;
const BRACKETED = /\s*[(（[]\s*[\p{Script=Han}\s·,、]+\s*[)）\]]/gu; // "민주(民主)" -> "민주"
const LOOSE = /[\p{Script=Han}]+/gu;

export function withoutHanja(text) {
  if (typeof text !== "string" || !HAN.test(text)) return text;
  return text.replace(BRACKETED, "").replace(LOOSE, "").replace(/\s{2,}/g, " ").replace(/\s+([.,!?])/g, "$1").trim();
}

// Returns a copy of an entry with hanja removed from everything that is displayed.
// The `hanja` list keeps its characters: only each syllable's sound and meaning are shown from it.
export function cleanEntry(content) {
  if (!content || typeof content !== "object") return content;
  const clean = (value, key) => {
    if (key === "hanja" || key === "hanja_word") return value;
    if (typeof value === "string") return withoutHanja(value);
    if (Array.isArray(value)) return value.map((item) => clean(item));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
    }
    return value;
  };
  const out = clean(content);
  // A word or saying written only in hanja has nothing left to show.
  out.headword = out.headword || content.headword;
  out.counterpart = out.counterpart || content.counterpart;
  if (Array.isArray(out.related)) out.related = out.related.filter((saying) => saying?.text);
  return out;
}
