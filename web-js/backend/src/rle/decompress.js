import { segmentText } from "./segment.js";

export function decompress(text) {
  const chars = segmentText(text);
  let out = "";
  let i = 0;

  while (i < chars.length) {
    const symbol = chars[i++];

    if (i >= chars.length) {
      throw new Error("Format invalid: missing count after symbol");
    }

    let count;

    if (chars[i] === "(") {
      // count cu >= 2 cifre
      i++; // sare peste "("
      let numStr = "";

      while (i < chars.length && /^[0-9]$/.test(chars[i])) {
        numStr += chars[i++];
      }

      if (i >= chars.length || chars[i] !== ")") {
        throw new Error("Format invalid: missing ')'");
      }
      i++; // sare peste ")"

      if (numStr === "") {
        throw new Error("Format invalid: empty count in ()");
      }

      count = Number(numStr);
    } else {
      // count cu o singura cifra 1..9
      if (!/^[0-9]$/.test(chars[i])) {
        throw new Error("Format invalid: count not found");
      }

      const digit = chars[i++];
      count = Number(digit);
    }

    if (!Number.isFinite(count) || count <= 0) {
      throw new Error("Format invalid: bad count");
    }

    out += symbol.repeat(count);
  }

  return out;
}

