import { describe, expect, it } from "vitest";
import { mergeSupabaseUsers } from "@/modules/admin/user-merge";

describe("mergeSupabaseUsers", () => {
  it("merges profiles, user_roles, and auth.users without requiring PostgREST joins", () => {
    const users = mergeSupabaseUsers({
      profiles: [
        {
          id: "u-admin",
          email: "omar@example.com",
          display_name: "Omar",
          account_status: "active",
          created_at: "2026-01-02T00:00:00Z",
        },
        {
          id: "u-inst",
          email: "instructor@example.com",
          display_name: "Instructor",
          account_status: "active",
          created_at: "2026-01-03T00:00:00Z",
        },
      ],
      roles: [
        {
          user_id: "u-admin",
          role: "student",
          can_manage_quizzes: false,
          can_manage_assignments: false,
        },
        {
          user_id: "u-inst",
          role: "instructor",
          can_manage_quizzes: true,
          can_manage_assignments: false,
        },
      ],
      authUsers: [
        {
          id: "u-admin",
          email: "omar@example.com",
          created_at: "2026-01-02T00:00:00Z",
        },
        {
          id: "u-missing-profile",
          email: "newlearner@example.com",
          created_at: "2026-01-04T00:00:00Z",
          user_metadata: { full_name: "New Learner" },
        },
      ],
      adminEmails: ["omar@example.com"],
    });

    expect(users.map((u) => u.id)).toEqual([
      "u-missing-profile",
      "u-inst",
      "u-admin",
    ]);

    const adminUser = users.find((u) => u.id === "u-admin");
    expect(adminUser?.role).toBe("admin");
    expect(adminUser?.isPermanentAdmin).toBe(true);
    expect(adminUser?.canManageQuizzes).toBe(true);
    expect(adminUser?.canManageAssignments).toBe(true);

    const instUser = users.find((u) => u.id === "u-inst");
    expect(instUser?.role).toBe("instructor");
    expect(instUser?.canManageQuizzes).toBe(true);
    expect(instUser?.canManageAssignments).toBe(false);

    const fallbackUser = users.find((u) => u.id === "u-missing-profile");
    expect(fallbackUser?.displayName).toBe("New Learner");
    expect(fallbackUser?.role).toBe("student");
  });
});
