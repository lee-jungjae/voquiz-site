// Small drawing helpers shared by everything a character wears (goods.js, wears-*.js).
export const stroke = (d, colour, width = 2.6) => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const star = (x, y, r, fill) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, d = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * d).toFixed(1)} ${(y + Math.sin(a) * d).toFixed(1)}`;
  });
  return `<path d="M${points.join(" L")} z" fill="${fill}"/>`;
};
export const twinkle = (x, y, r, fill) => `<path d="M${x} ${y - r} q${r * 0.2} ${r * 0.8} ${r} ${r} q-${r * 0.8} ${r * 0.2} -${r} ${r} q-${r * 0.2} -${r * 0.8} -${r} -${r} q${r * 0.8} -${r * 0.2} ${r} -${r} z" fill="${fill}"/>`;
export const heart = (x, y, s, fill, more = "") => `<path d="M${x} ${y + s} l-${s} -${s} a${s * 0.56} ${s * 0.56} 0 0 1 ${s} -${s * 0.56} a${s * 0.56} ${s * 0.56} 0 0 1 ${s} ${s * 0.56} z" fill="${fill}"${more}/>`;
