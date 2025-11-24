import { segmentText } from "./segment.js";

export function compress(text) {
  const chars = segmentText(text);
  if (chars.length === 0) return "";

  let out = "";
  let current = chars[0];
  let count = 1;

  for (let i = 1; i < chars.length; i++) {
    if (chars[i] === current) {
      count++;
    } else {
      out += encodeRun(current, count);
      current = chars[i];
      count = 1;
    }
  }

  out += encodeRun(current, count);
  return out;
}

function encodeRun(symbol, count) {
  if (count < 10) {
    return symbol + String(count);
  }
  return symbol + "(" + String(count) + ")";
}
