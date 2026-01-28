import { createHash } from "crypto";

export function encodeUrlToId(url: string): string {
  // URL-safe base64
  return Buffer.from(url, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeIdToUrl(id: string): string {
  const b64 = id.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((id.length + 3) % 4);
  return Buffer.from(b64, "base64").toString("utf8");
}

export function stableHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
