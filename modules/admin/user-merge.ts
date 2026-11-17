import type { AccountStatus, AppRole, SessionUser } from "@/lib/types/domain";
import { resolveEffectiveRole } from "@/modules/auth/guards";

export interface RawProfileRow {
  id: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  interests?: unknown;
  account_status?: string | null;
  deletion_requested_at?: string | null;
  created_at?: string | null;
}

export interface RawUserRoleRow {
  user_id: string;
  role?: string | null;
  can_manage_quizzes?: boolean | null;
  can_manage_assignments?: boolean | null;
}

export interface RawAuthUser {
  id: string;
  email?: string | null;
  created_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

function normalizeStatus(raw?: string | null): AccountStatus {
  if (raw === "deactivated" || raw === "deletion_requested") {
    return raw;
  }
  return "active";
}

export function mergeSupabaseUsers(params: {
  profiles: RawProfileRow[];
  roles: RawUserRoleRow[];
  authUsers?: RawAuthUser[];
  adminEmails: string[];
}): SessionUser[] {
  const roleByUserId = new Map<string, RawUserRoleRow>();
  for (const r of params.roles) {
    if (r?.user_id) {
      roleByUserId.set(r.user_id, r);
    }
  }

  const byId = new Map<string, SessionUser>();

  for (const p of params.profiles) {
    const email = (p.email ?? "").trim().toLowerCase();
    if (!p.id || !email) continue;
    const roleRow = roleByUserId.get(p.id);
    const resolved = resolveEffectiveRole(
      email,
      (roleRow?.role as AppRole | undefined) ?? "student",
      params.adminEmails
    );

    byId.set(p.id, {
      id: p.id,
      email,
      displayName: p.display_name?.trim() || email.split("@")[0],
      avatarUrl: p.avatar_url ?? undefined,
      bio: p.bio ?? "",
      interests: Array.isArray(p.interests)
        ? p.interests.filter((x): x is string => typeof x === "string")
        : [],
      role: resolved.role,
      isPermanentAdmin: resolved.isPermanentAdmin,
      canManageQuizzes:
        resolved.role === "admin" || Boolean(roleRow?.can_manage_quizzes),
      canManageAssignments:
        resolved.role === "admin" || Boolean(roleRow?.can_manage_assignments),
      accountStatus: normalizeStatus(p.account_status),
      deletionRequestedAt: p.deletion_requested_at ?? undefined,
      createdAt: p.created_at ?? new Date(0).toISOString(),
      authMode: "supabase",
    });
  }

  for (const au of params.authUsers ?? []) {
    if (!au.id || byId.has(au.id)) continue;
    const email = (au.email ?? "").trim().toLowerCase();
    if (!email) continue;
    const roleRow = roleByUserId.get(au.id);
    const resolved = resolveEffectiveRole(
      email,
      (roleRow?.role as AppRole | undefined) ?? "student",
      params.adminEmails
    );
    const metaName =
      (typeof au.user_metadata?.full_name === "string"
        ? au.user_metadata.full_name
        : undefined) ??
      (typeof au.user_metadata?.name === "string"
        ? au.user_metadata.name
        : undefined);
    const metaAvatar =
      typeof au.user_metadata?.avatar_url === "string"
        ? au.user_metadata.avatar_url
        : undefined;

    byId.set(au.id, {
      id: au.id,
      email,
      displayName: metaName?.trim() || email.split("@")[0],
      avatarUrl: metaAvatar,
      bio: "",
      interests: [],
      role: resolved.role,
      isPermanentAdmin: resolved.isPermanentAdmin,
      canManageQuizzes:
        resolved.role === "admin" || Boolean(roleRow?.can_manage_quizzes),
      canManageAssignments:
        resolved.role === "admin" || Boolean(roleRow?.can_manage_assignments),
      accountStatus: "active",
      createdAt: au.created_at ?? new Date(0).toISOString(),
      authMode: "supabase",
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}
