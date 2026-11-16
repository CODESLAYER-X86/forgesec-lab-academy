import type { AppRole, SessionUser } from "@/lib/types/domain";

export function resolveEffectiveRole(
  email: string,
  dbRole: AppRole | null | undefined,
  adminEmails: string[]
): { role: AppRole; isPermanentAdmin: boolean } {
  const normalized = email.trim().toLowerCase();
  const normalizedAdmins = adminEmails.map((item) => item.trim().toLowerCase());
  if (normalizedAdmins.includes(normalized)) {
    return { role: "admin", isPermanentAdmin: true };
  }
  if (dbRole === "admin" || dbRole === "instructor" || dbRole === "student") {
    return { role: dbRole, isPermanentAdmin: false };
  }
  return { role: "student", isPermanentAdmin: false };
}

export function isAccountActive(user: SessionUser | null): boolean {
  return Boolean(user && user.accountStatus === "active");
}

export function canAccessAdminConsole(user: SessionUser | null): boolean {
  if (!isAccountActive(user)) return false;
  return user!.role === "admin" || user!.role === "instructor";
}

export function canManageUsers(user: SessionUser | null): boolean {
  if (!isAccountActive(user)) return false;
  return user!.role === "admin";
}

export function canManageQuizzes(user: SessionUser | null): boolean {
  if (!isAccountActive(user)) return false;
  return user!.role === "admin" || (user!.role === "instructor" && user!.canManageQuizzes);
}

export function canManageAssignments(user: SessionUser | null): boolean {
  if (!isAccountActive(user)) return false;
  return user!.role === "admin" || (user!.role === "instructor" && user!.canManageAssignments);
}
