import { getAdminEmails, isPermanentAdminEmail, isSupabaseConfigured } from "@/lib/env";
import { readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole, AuditLogEntry, SessionUser } from "@/lib/types/domain";
import { resolveEffectiveRole } from "@/modules/auth/guards";

export async function recordAuditLog(entry: {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return;
    await admin.from("admin_audit_logs").insert({
      actor_id: entry.actorId,
      actor_email: entry.actorEmail,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      details: entry.details ?? {},
      created_at: now,
    });
    return;
  }

  const db = readPreviewDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorId: entry.actorId,
    actorEmail: entry.actorEmail,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    details: entry.details ?? {},
    createdAt: now,
  });
  writePreviewDb(db);
}

export async function getAdminAuditLogs(): Promise<AuditLogEntry[]> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];
    const { data } = await admin
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((row) => ({
      id: row.id,
      actorId: row.actor_id ?? "",
      actorEmail: row.actor_email,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      details: (row.details as Record<string, unknown>) ?? {},
      createdAt: row.created_at,
    }));
  }

  return [...readPreviewDb().auditLogs].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function getAllUsersForAdmin(): Promise<SessionUser[]> {
  const admins = getAdminEmails();

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];
    const { data: profiles } = await admin
      .from("profiles")
      .select("*, user_roles(*)")
      .order("created_at", { ascending: false });
    return (profiles ?? []).map((p) => {
      const roleObj = Array.isArray(p.user_roles) ? p.user_roles[0] : p.user_roles;
      const resolved = resolveEffectiveRole(p.email, roleObj?.role, admins);
      return {
        id: p.id,
        email: p.email,
        displayName: p.display_name,
        avatarUrl: p.avatar_url ?? undefined,
        bio: p.bio ?? "",
        interests: Array.isArray(p.interests) ? p.interests : [],
        role: resolved.role,
        isPermanentAdmin: resolved.isPermanentAdmin,
        canManageQuizzes: resolved.role === "admin" || Boolean(roleObj?.can_manage_quizzes),
        canManageAssignments:
          resolved.role === "admin" || Boolean(roleObj?.can_manage_assignments),
        accountStatus: p.account_status ?? "active",
        deletionRequestedAt: p.deletion_requested_at ?? undefined,
        createdAt: p.created_at,
        authMode: "supabase",
      };
    });
  }

  return readPreviewDb().users.map((u) => {
    const resolved = resolveEffectiveRole(u.email, u.role, admins);
    return {
      ...u,
      role: resolved.role,
      isPermanentAdmin: resolved.isPermanentAdmin,
      canManageQuizzes: resolved.role === "admin" ? true : u.canManageQuizzes,
      canManageAssignments: resolved.role === "admin" ? true : u.canManageAssignments,
    };
  });
}

export async function adminUpdateUserRole(params: {
  actor: SessionUser;
  targetUserId: string;
  role: AppRole;
  canManageQuizzes: boolean;
  canManageAssignments: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const users = await getAllUsersForAdmin();
  const target = users.find((u) => u.id === params.targetUserId);
  if (!target) {
    return { ok: false, error: "User not found." };
  }

  if (isPermanentAdminEmail(target.email) && params.role !== "admin") {
    return {
      ok: false,
      error: "Permanent administrators defined in ADMIN_EMAILS cannot be demoted in the UI.",
    };
  }

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return { ok: false, error: "Service role client unavailable." };
    await admin.from("user_roles").upsert({
      user_id: params.targetUserId,
      role: params.role,
      can_manage_quizzes: params.role === "admin" ? true : params.canManageQuizzes,
      can_manage_assignments: params.role === "admin" ? true : params.canManageAssignments,
      updated_by: params.actor.id,
    });
  } else {
    const db = readPreviewDb();
    const idx = db.users.findIndex((u) => u.id === params.targetUserId);
    if (idx !== -1) {
      db.users[idx] = {
        ...db.users[idx],
        role: params.role,
        canManageQuizzes: params.role === "admin" ? true : params.canManageQuizzes,
        canManageAssignments: params.role === "admin" ? true : params.canManageAssignments,
      };
      writePreviewDb(db);
    }
  }

  await recordAuditLog({
    actorId: params.actor.id,
    actorEmail: params.actor.email,
    action: "user.role.updated",
    targetType: "user",
    targetId: params.targetUserId,
    details: {
      targetEmail: target.email,
      role: params.role,
      canManageQuizzes: params.canManageQuizzes,
      canManageAssignments: params.canManageAssignments,
    },
  });

  return { ok: true };
}
