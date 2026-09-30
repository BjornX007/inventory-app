// lib/shortId.js
import crypto from "crypto";

export default function toShortId(mongoId, length = 8) {
  if (!mongoId) return "";
  return crypto
    .createHash("sha256")
    .update(mongoId.toString())
    .digest("hex")
    .slice(0, length)
    .toUpperCase();
}
