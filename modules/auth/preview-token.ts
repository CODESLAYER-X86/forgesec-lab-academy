import crypto from "node:crypto";

export function signPreviewSessionToken(userId: string, secret: string): string {
  const sig = crypto
    .createHmac("sha256", secret)
    .update(userId, "utf8")
    .digest("base64url");
  return `${userId}.${sig}`;
}

export function verifyPreviewSessionToken(
  token: string | undefined | null,
  secret: string
): string | null {
  if (!token) return null;
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx <= 0 || dotIdx >= token.length - 1) return null;

  const userId = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(userId, "utf8")
    .digest("base64url");

  const providedBuf = Buffer.from(providedSig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (providedBuf.length !== expectedBuf.length) {
    return null;
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf) ? userId : null;
}
