import { describe, expect, it } from "vitest";
import {
  signVerifiedUserHeader,
  verifyVerifiedUserHeader,
} from "@/modules/auth/verified-header";

describe("verified-header HMAC handoff", () => {
  const secret = "test-forgesec-secret-key";

  it("signs and verifies a valid user payload within TTL", async () => {
    const now = 1_700_000_000_000;
    const token = await signVerifiedUserHeader(
      {
        id: "user-123",
        email: "admin@forgesec.academy",
        createdAt: "2026-01-01T00:00:00.000Z",
        displayName: "Admin User",
      },
      secret,
      now
    );

    const verified = await verifyVerifiedUserHeader(token, secret, now + 5_000);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe("user-123");
    expect(verified?.email).toBe("admin@forgesec.academy");
    expect(verified?.displayName).toBe("Admin User");
  });

  it("rejects expired or tampered tokens", async () => {
    const now = 1_700_000_000_000;
    const token = await signVerifiedUserHeader(
      {
        id: "user-123",
        email: "student@forgesec.academy",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      secret,
      now
    );

    expect(await verifyVerifiedUserHeader(token, secret, now + 31_000)).toBeNull();
    expect(await verifyVerifiedUserHeader(token, "wrong-secret", now + 1_000)).toBeNull();
    const tampered = `x${token.slice(1)}`;
    expect(await verifyVerifiedUserHeader(tampered, secret, now + 1_000)).toBeNull();
  });
});
