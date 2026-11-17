import { cache } from "react";
import {
  getAdminEmails,
  isPermanentAdminEmail,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole, AuditLogEntry, SessionUser } from "@/lib/types/domain";
import { mergeSupabaseUsers, type RawAuthUser } from "@/modules/admin/user-merge";
import { resolveEffectiveRole } from "@/modules/auth/guards";
import { getCurrentUser } from "@/modules/auth/session";

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
  db.auditLogs = db.auditLogs.slice(0, 500);
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

export const getAllUsersForAdmin = cache(async (): Promise<SessionUser[]> => {
  const admins = getAdminEmails();

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) {
      const current = await getCurrentUser();
      return current ? [current] : [];
    }

    const [
      { data: profiles, error: profilesError },
      { data: roleRows, error: rolesError },
      authUsersRes,
    ] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }),
      admin.from("user_roles").select("*"),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }).catch(() => ({
        data: { users: [] as RawAuthUser[] },
        error: null,
      })),
    ]);

    if (profilesError) {
      console.error("[admin] Failed to query profiles:", profilesError.message);
    }
    if (rolesError) {
      console.error("[admin] Failed to query user_roles:", rolesError.message);
    }

    const authUsers = (authUsersRes?.data?.users ?? []) as RawAuthUser[];
    const merged = mergeSupabaseUsers({
      profiles: profiles ?? [],
      roles: roleRows ?? [],
      authUsers,
      adminEmails: admins,
    });

    // Backfill missing profile rows lazily for any auth.users not yet in public.profiles
    const existingProfileIds = new Set((profiles ?? []).map((p) => p.id));
    const missingProfiles = merged.filter((u) => !existingProfileIds.has(u.id));
    if (missingProfiles.length > 0) {
      void admin
        .from("profiles")
        .upsert(
          missingProfiles.map((u) => ({
            id: u.id,
            email: u.email,
            display_name: u.displayName,
            avatar_url: u.avatarUrl ?? null,
          })),
          { onConflict: "id" }
        )
        .then(() => {});
    }

    return merged;
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
});

export function getAdminDirectoryStatus(): {
  supabaseMode: boolean;
  serviceRoleConfigured: boolean;
} {
  return {
    supabaseMode: isSupabaseConfigured(),
    serviceRoleConfigured: isSupabaseAdminConfigured(),
  };
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

    await admin.from("profiles").upsert(
      {
        id: target.id,
        email: target.email,
        display_name: target.displayName,
        avatar_url: target.avatarUrl ?? null,
      },
      { onConflict: "id" }
    );

    const { error: upsertError } = await admin.from("user_roles").upsert(
      {
        user_id: params.targetUserId,
        role: params.role,
        can_manage_quizzes: params.role === "admin" ? true : params.canManageQuizzes,
        can_manage_assignments: params.role === "admin" ? true : params.canManageAssignments,
        updated_by: params.actor.id,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      return { ok: false, error: upsertError.message };
    }
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
