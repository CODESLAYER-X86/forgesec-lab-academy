import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminEmails,
  getPreviewAuthSecret,
  getVerifiedHeaderSecret,
  isPreviewAuthEnabled,
  isSupabaseConfigured,
} from "@/lib/env";
import { readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, SessionUser } from "@/lib/types/domain";
import {
  canAccessAdminConsole,
  canManageAssignments,
  canManageQuizzes,
  canManageUsers,
  isAccountActive,
  resolveEffectiveRole,
} from "@/modules/auth/guards";
import { verifyPreviewSessionToken } from "@/modules/auth/preview-token";
import { verifyVerifiedUserHeader } from "@/modules/auth/verified-header";

export const PREVIEW_SESSION_COOKIE = "forgesec_preview_uid";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (isSupabaseConfigured()) {
    const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
    const hasAuthCookie = cookieStore.getAll().some((c) => c.name.startsWith("sb-"));
    if (!hasAuthCookie) return null;

    const verifiedFromMiddleware = await verifyVerifiedUserHeader(
      headerStore.get("x-forgesec-verified-user"),
      getVerifiedHeaderSecret()
    );

    const adminClient = createSupabaseAdminClient();
    let userId = verifiedFromMiddleware?.id ?? "";
    let email = verifiedFromMiddleware?.email ?? "";
    let createdAtFallback = verifiedFromMiddleware?.createdAt ?? "";
    let metadataDisplayName = verifiedFromMiddleware?.displayName;
    let metadataAvatarUrl = verifiedFromMiddleware?.avatarUrl;
    let dbClient = adminClient;

    if (!verifiedFromMiddleware) {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return null;
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user || !user.email) return null;
      userId = user.id;
      email = user.email.toLowerCase();
      createdAtFallback = user.created_at;
      metadataDisplayName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined);
      metadataAvatarUrl = user.user_metadata?.avatar_url as string | undefined;
      if (!dbClient) {
        dbClient = supabase;
      }
    } else if (!dbClient) {
      dbClient = await createSupabaseServerClient();
    }

    if (!dbClient || !userId || !email) return null;

    const [{ data: existingProfile }, { data: roleRow }] = await Promise.all([
      dbClient.from("profiles").select("*").eq("id", userId).maybeSingle(),
      dbClient.from("user_roles").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    let profile = existingProfile;
    if (!profile && adminClient) {
      const displayName = metadataDisplayName || email.split("@")[0];
      const { data: created } = await adminClient
        .from("profiles")
        .upsert({
          id: userId,
          email,
          display_name: displayName,
          avatar_url: metadataAvatarUrl ?? null,
        })
        .select("*")
        .single();
      profile = created;
    }

    const { role, isPermanentAdmin } = resolveEffectiveRole(
      email,
      (roleRow?.role as AppRole | undefined) ?? "student",
      getAdminEmails()
    );

    if (!roleRow && adminClient) {
      await adminClient.from("user_roles").upsert({
        user_id: userId,
        role,
        can_manage_quizzes: role === "admin",
        can_manage_assignments: role === "admin",
      });
    }

    return {
      id: userId,
      email,
      displayName: profile?.display_name || metadataDisplayName || email.split("@")[0],
      avatarUrl: profile?.avatar_url || metadataAvatarUrl || undefined,
      bio: profile?.bio || "",
      interests: Array.isArray(profile?.interests) ? profile.interests : [],
      role,
      isPermanentAdmin,
      canManageQuizzes: role === "admin" || Boolean(roleRow?.can_manage_quizzes),
      canManageAssignments: role === "admin" || Boolean(roleRow?.can_manage_assignments),
      accountStatus: profile?.account_status || "active",
      deletionRequestedAt: profile?.deletion_requested_at || undefined,
      createdAt: profile?.created_at || createdAtFallback,
      authMode: "supabase",
    };
  }

  if (!isPreviewAuthEnabled()) {
    return null;
  }

  // Local Preview Mode (only active in non-production or explicit opt-in)
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(PREVIEW_SESSION_COOKIE)?.value;
  const uid = verifyPreviewSessionToken(rawToken, getPreviewAuthSecret());
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
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!isAccountActive(user)) {
    redirect("/login?error=account_inactive");
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
  if (!isPreviewAuthEnabled()) {
    return [];
  }
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

  if (!isPreviewAuthEnabled()) {
    throw new Error("Preview mode is disabled.");
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
    const admin = createSupabaseAdminClient();
    if (admin) {
      await admin
        .from("profiles")
        .update({
          account_status: "deletion_requested",
          deletion_requested_at: now,
        })
        .eq("id", userId)
        .eq("account_status", "active");
      return;
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase unavailable");
    const { error } = await supabase.rpc("request_own_account_deletion");
    if (error) throw new Error(error.message);
    return;
  }

  if (!isPreviewAuthEnabled()) {
    throw new Error("Preview mode is disabled.");
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
