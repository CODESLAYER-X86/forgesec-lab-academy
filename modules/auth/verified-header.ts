export interface VerifiedUserPayload {
  id: string;
  email: string;
  createdAt: string;
  displayName?: string;
  avatarUrl?: string;
  exp: number;
}

const VERIFIED_HEADER_TTL_MS = 30_000;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return out;
}

function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(b64u: string): string | null {
  try {
    const padded = b64u.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (padded.length % 4)) % 4;
    const binary = atob(padded + "=".repeat(padLength));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signVerifiedUserHeader(
  user: Omit<VerifiedUserPayload, "exp">,
  secret: string,
  nowMs = Date.now()
): Promise<string> {
  const payload: VerifiedUserPayload = {
    ...user,
    exp: nowMs + VERIFIED_HEADER_TTL_MS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const key = await importHmacKey(secret);
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload)
  );
  const sigHex = toHex(new Uint8Array(sigBuffer));
  return `${encodedPayload}.${sigHex}`;
}

export async function verifyVerifiedUserHeader(
  headerValue: string | null | undefined,
  secret: string,
  nowMs = Date.now()
): Promise<VerifiedUserPayload | null> {
  if (!headerValue || !secret) return null;
  const dotIdx = headerValue.indexOf(".");
  if (dotIdx <= 0) return null;

  const encodedPayload = headerValue.slice(0, dotIdx);
  const sigHex = headerValue.slice(dotIdx + 1);
  const sigBytes = fromHex(sigHex);
  if (!sigBytes) return null;

  try {
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      new TextEncoder().encode(encodedPayload)
    );
    if (!valid) return null;

    const json = decodeBase64Url(encodedPayload);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<VerifiedUserPayload>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    if (nowMs > parsed.exp) return null;
    return parsed as VerifiedUserPayload;
  } catch {
    return null;
  }
}
