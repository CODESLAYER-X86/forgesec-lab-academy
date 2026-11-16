import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminEmails, isSupabaseConfigured } from "@/lib/env";
import { readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, SessionUser } from "@/lib/types/domain";
import {
  canAccessAdminConsole,
  canManageAssignments,
  canManageQuizzes,
  canManageUsers,
  resolveEffectiveRole,
} from "@/modules/auth/guards";

export const PREVIEW_SESSION_COOKIE = "forgesec_preview_uid";

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user || !user.email) return null;

    const email = user.email.toLowerCase();
    const adminClient = createSupabaseAdminClient();
    const dbClient = adminClient ?? supabase;

    // Ensure profile exists for first-login provisioning
    const { data: existingProfile } = await dbClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let profile = existingProfile;
    if (!profile) {
      const displayName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        email.split("@")[0];
      const { data: created } = await dbClient
        .from("profiles")
        .upsert({
          id: user.id,
          email,
          display_name: displayName,
          avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        })
        .select("*")
        .single();
      profile = created;
    }

    const { data: roleRow } = await dbClient
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { role, isPermanentAdmin } = resolveEffectiveRole(
      email,
      (roleRow?.role as AppRole | undefined) ?? "student",
      getAdminEmails()
    );

    if (!roleRow && adminClient) {
      await adminClient.from("user_roles").upsert({
        user_id: user.id,
        role,
        can_manage_quizzes: role === "admin",
        can_manage_assignments: role === "admin",
      });
    }

    return {
      id: user.id,
      email,
      displayName: profile?.display_name || email.split("@")[0],
      avatarUrl: profile?.avatar_url || undefined,
      bio: profile?.bio || "",
      interests: Array.isArray(profile?.interests) ? profile.interests : [],
      role,
      isPermanentAdmin,
      canManageQuizzes: role === "admin" || Boolean(roleRow?.can_manage_quizzes),
      canManageAssignments: role === "admin" || Boolean(roleRow?.can_manage_assignments),
      accountStatus: profile?.account_status || "active",
      deletionRequestedAt: profile?.deletion_requested_at || undefined,
      createdAt: profile?.created_at || user.created_at,
      authMode: "supabase",
    };
  }

  // Local Preview Mode
  const cookieStore = await cookies();
  const uid = cookieStore.get(PREVIEW_SESSION_COOKIE)?.value;
  if (!uid) return null;

  const db = readPreviewDb();
  const user = db.users.find((u) => u.id === uid);
  if (!user) return null;

  const { role, isPermanentAdmin } = resolveEffectiveRole(
    user.email,
    user.role,
    getAdminEmails()
  );

  return {
    ...user,
    role,
    isPermanentAdmin,
    canManageQuizzes: role === "admin" ? true : user.canManageQuizzes,
    canManageAssignments: role === "admin" ? true : user.canManageAssignments,
    authMode: "preview",
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdminConsoleAccess(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccessAdminConsole(user)) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireFullAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canManageUsers(user)) {
    redirect("/admin");
  }
  return user;
}

export async function requireQuizManager(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canManageQuizzes(user)) {
    redirect("/admin");
  }
  return user;
}

export async function requireAssignmentManager(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canManageAssignments(user)) {
    redirect("/admin");
  }
  return user;
}

export async function getPreviewDemoUsers(): Promise<SessionUser[]> {
  const db = readPreviewDb();
  return db.users;
}

export async function updateCurrentUserProfile(
  userId: string,
  updates: { displayName: string; bio: string; interests: string[] }
): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase unavailable");
    await supabase
      .from("profiles")
      .update({
        display_name: updates.displayName,
        bio: updates.bio,
        interests: updates.interests,
      })
      .eq("id", userId);
    return;
  }

  const db = readPreviewDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    db.users[idx] = {
      ...db.users[idx],
      displayName: updates.displayName,
      bio: updates.bio,
      interests: updates.interests,
    };
    writePreviewDb(db);
  }
}

export async function requestAccountDeletion(userId: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase unavailable");
    await supabase
      .from("profiles")
      .update({
        account_status: "deletion_requested",
        deletion_requested_at: now,
      })
      .eq("id", userId);
    return;
  }

  const db = readPreviewDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    db.users[idx] = {
      ...db.users[idx],
      accountStatus: "deletion_requested",
      deletionRequestedAt: now,
    };
    writePreviewDb(db);
  }
}
