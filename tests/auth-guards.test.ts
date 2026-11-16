import { describe, expect, it } from "vitest";
import type { SessionUser } from "@/lib/types/domain";
import {
  canAccessAdminConsole,
  canManageAssignments,
  canManageQuizzes,
  canManageUsers,
  resolveEffectiveRole,
} from "@/modules/auth/guards";

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

  it("enforces scoped instructor vs full admin capabilities", () => {
    const student = makeUser({ role: "student" });
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
    expect(canAccessAdminConsole(deactivatedAdmin)).toBe(false);
    expect(canManageUsers(deactivatedAdmin)).toBe(false);
  });
});
