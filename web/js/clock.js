// The time by the server's clock.
// A day's limits (the daily present, the runs of the streak challenge, search points, a caught
// visitor) are counted by it, so that moving the clock of the computer does not start a day again.
// Every answer of the server carries its time (the HTTP Date header); between answers the time
// runs on by a counter that the computer's clock does not move (performance.now()).
// Before the first answer, and in the demo (which has no server), it is the computer's own clock.
let serverAt = 0; // the server's time at its last answer, in ms
let tickAt = 0; // performance.now() at that moment

// Called with the Date header of an answer (null when the page may not read it: nothing happens).
export function syncClock(header) {
  const at = Date.parse(header || "");
  if (!Number.isFinite(at)) return;
  serverAt = at; // whole seconds, and the answer took a moment to arrive: near enough for days
  tickAt = performance.now();
}
export const clockNow = () => (serverAt ? serverAt + (performance.now() - tickAt) : Date.now());
export const clockSynced = () => serverAt > 0;
