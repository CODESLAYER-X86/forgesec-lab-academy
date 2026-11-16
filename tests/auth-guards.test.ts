import { afterEach, describe, expect, it } from "vitest";
import { isPreviewAuthEnabled } from "@/lib/env";
import type { SessionUser } from "@/lib/types/domain";
import {
  canAccessAdminConsole,
  canManageAssignments,
  canManageQuizzes,
  canManageUsers,
  isAccountActive,
  resolveEffectiveRole,
} from "@/modules/auth/guards";
import {
  signPreviewSessionToken,
  verifyPreviewSessionToken,
} from "@/modules/auth/preview-token";

function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "u-1",
    email: "learner@forgesec.academy",
    displayName: "Learner",
    bio: "",
    interests: [],
    role: "student",
    isPermanentAdmin: false,
    canManageQuizzes: false,
    canManageAssignments: false,
    accountStatus: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    authMode: "preview",
    ...overrides,
  };
}

describe("Authorization & RBAC guards", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPreviewFlag = process.env.ENABLE_LOCAL_PREVIEW_AUTH;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalSupabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    (process.env as Record<string, string | undefined>).ENABLE_LOCAL_PREVIEW_AUTH = originalPreviewFlag;
    (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnon;
  });

  it("enforces permanent ADMIN_EMAILS case-insensitively regardless of DB role", () => {
    const resolved = resolveEffectiveRole(
      "  Admin@ForgeSec.Academy ",
      "student",
      ["admin@forgesec.academy"]
    );
    expect(resolved.role).toBe("admin");
    expect(resolved.isPermanentAdmin).toBe(true);
  });

  it("respects database roles when email is not on ADMIN_EMAILS", () => {
    expect(resolveEffectiveRole("inst@forgesec.academy", "instructor", ["admin@forgesec.academy"])).toEqual({
      role: "instructor",
      isPermanentAdmin: false,
    });
    expect(resolveEffectiveRole("user@forgesec.academy", undefined, ["admin@forgesec.academy"])).toEqual({
      role: "student",
      isPermanentAdmin: false,
    });
  });

  it("enforces scoped instructor vs full admin capabilities and blocks inactive accounts", () => {
    const student = makeUser({ role: "student" });
    expect(isAccountActive(student)).toBe(true);
    expect(canAccessAdminConsole(student)).toBe(false);
    expect(canManageUsers(student)).toBe(false);

    const quizInstructor = makeUser({
      role: "instructor",
      canManageQuizzes: true,
      canManageAssignments: false,
    });
    expect(canAccessAdminConsole(quizInstructor)).toBe(true);
    expect(canManageUsers(quizInstructor)).toBe(false);
    expect(canManageQuizzes(quizInstructor)).toBe(true);
    expect(canManageAssignments(quizInstructor)).toBe(false);

    const deactivatedAdmin = makeUser({
      role: "admin",
      accountStatus: "deactivated",
    });
    expect(isAccountActive(deactivatedAdmin)).toBe(false);
    expect(canAccessAdminConsole(deactivatedAdmin)).toBe(false);
    expect(canManageUsers(deactivatedAdmin)).toBe(false);
    expect(canManageQuizzes(deactivatedAdmin)).toBe(false);
    expect(canManageAssignments(deactivatedAdmin)).toBe(false);

    const deletionRequestedAdmin = makeUser({
      role: "admin",
      accountStatus: "deletion_requested",
    });
    expect(isAccountActive(deletionRequestedAdmin)).toBe(false);
    expect(canAccessAdminConsole(deletionRequestedAdmin)).toBe(false);
  });

  it("signs and verifies preview session tokens while rejecting tampered payloads and signatures", () => {
    const secret = "test-preview-auth-secret-32-chars!!";
    const token = signPreviewSessionToken("preview-student-01", secret);

    expect(verifyPreviewSessionToken(token, secret)).toBe("preview-student-01");
    expect(verifyPreviewSessionToken("preview-admin-01." + token.split(".")[1], secret)).toBeNull();
    expect(verifyPreviewSessionToken(token.slice(0, -2) + "xx", secret)).toBeNull();
    expect(verifyPreviewSessionToken("preview-student-01", secret)).toBeNull();
    expect(verifyPreviewSessionToken(undefined, secret)).toBeNull();
    expect(verifyPreviewSessionToken(token, "wrong-secret-value-for-testing")).toBeNull();
  });

  it("fails closed for preview auth in production unless explicitly opted in", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.ENABLE_LOCAL_PREVIEW_AUTH;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    expect(isPreviewAuthEnabled()).toBe(false);

    process.env.ENABLE_LOCAL_PREVIEW_AUTH = "true";
    expect(isPreviewAuthEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(isPreviewAuthEnabled()).toBe(false);
  });
});
