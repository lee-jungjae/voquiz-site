// Reads JSON that is still being written. A new word arrives from the server piece by piece, so the
// text is cut off mid-way most of the time. parsePartial returns whatever can already be shown:
// finished values, plus the string that is being typed right now. Returns null if nothing is usable yet.
export function parsePartial(text) {
  const stack = []; // open containers: { close: "}" | "]", expect: "key" | "colon" | "value" | "comma" }
  let safe = null; // the last point where the text, plus closers, is valid JSON
  let inString = false, escaped = false, stringIsValue = false, literalStart = -1;

  const closers = () => stack.map((frame) => frame.close).reverse().join("");
  const top = () => stack[stack.length - 1];
  const valueDone = (end) => {
    if (top()) top().expect = "comma";
    safe = { end, closers: closers() };
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') {
        inString = false;
        if (stringIsValue) valueDone(i + 1);
        else top().expect = "colon";
      }
      continue;
    }
    if (literalStart >= 0) { // inside a number, true, false or null
      if (!/[\s,}\]]/.test(ch)) continue;
      literalStart = -1;
      valueDone(i);
    }
    if (ch === '"') {
      inString = true;
      stringIsValue = !top() || top().expect === "value";
    } else if (ch === "{" || ch === "[") {
      stack.push({ close: ch === "{" ? "}" : "]", expect: ch === "{" ? "key" : "value" });
      safe = { end: i + 1, closers: closers() };
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      valueDone(i + 1);
    } else if (ch === ":") {
      top().expect = "value";
    } else if (ch === ",") {
      top().expect = top().close === "}" ? "key" : "value";
    } else if (!/\s/.test(ch)) {
      literalStart = i;
    }
  }

  const attempts = [];
  // A value string still being typed: close it where it stands, so the reader sees it grow.
  if (inString && stringIsValue) attempts.push((escaped ? text.slice(0, -1) : text) + '"' + closers());
  if (safe) attempts.push(text.slice(0, safe.end) + safe.closers);
  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next, more conservative cut
    }
  }
  return null;
}
