import { isSupabaseConfigured } from "@/lib/env";
import { readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AssignmentProgressRecord,
  AssignmentProgressStatus,
  AssignmentStatus,
  PracticalAssignment,
} from "@/lib/types/domain";

export async function getPublishedAssignments(): Promise<PracticalAssignment[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("status", "published")
      .order("title");
    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      objective: row.objective,
      category: row.category,
      difficulty: row.difficulty,
      lessonId: row.lesson_id ?? undefined,
      prerequisites: row.prerequisites ?? [],
      instructions: row.instructions ?? [],
      expectedOutcome: row.expected_outcome,
      safetyWarning: row.safety_warning,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  return readPreviewDb().assignments.filter((a) => a.status === "published");
}

export async function getAssignmentBySlug(slug: string): Promise<PracticalAssignment | null> {
  const all = await getPublishedAssignments();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getUserAssignmentProgress(
  userId: string
): Promise<AssignmentProgressRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("assignment_progress")
      .select("*")
      .eq("user_id", userId);
    return (data ?? []).map((row) => ({
      userId: row.user_id,
      assignmentId: row.assignment_id,
      status: row.status,
      notes: row.notes ?? "",
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    }));
  }

  return readPreviewDb().assignmentProgress.filter((p) => p.userId === userId);
}

export async function updateAssignmentStatus(
  userId: string,
  assignmentId: string,
  status: AssignmentProgressStatus,
  notes = ""
): Promise<void> {
  const now = new Date().toISOString();
  const completedAt = status === "completed" ? now : null;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase unavailable");
    await supabase.from("assignment_progress").upsert(
      {
        user_id: userId,
        assignment_id: assignmentId,
        status,
        notes,
        completed_at: completedAt,
        updated_at: now,
      },
      { onConflict: "assignment_id,user_id" }
    );
    return;
  }

  const db = readPreviewDb();
  const idx = db.assignmentProgress.findIndex(
    (p) => p.userId === userId && p.assignmentId === assignmentId
  );
  if (idx !== -1) {
    db.assignmentProgress[idx] = {
      ...db.assignmentProgress[idx],
      status,
      notes,
      completedAt,
      updatedAt: now,
    };
  } else {
    db.assignmentProgress.push({
      userId,
      assignmentId,
      status,
      notes,
      completedAt,
      updatedAt: now,
    });
  }
  writePreviewDb(db);
}

export async function getAllAssignmentsForAdmin(): Promise<PracticalAssignment[]> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];
    const { data } = await admin.from("assignments").select("*").order("updated_at", { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      objective: row.objective,
      category: row.category,
      difficulty: row.difficulty,
      lessonId: row.lesson_id ?? undefined,
      prerequisites: row.prerequisites ?? [],
      instructions: row.instructions ?? [],
      expectedOutcome: row.expected_outcome,
      safetyWarning: row.safety_warning,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
  return readPreviewDb().assignments;
}

export async function adminCreateAssignment(input: {
  title: string;
  slug: string;
  objective: string;
  category: string;
  difficulty: string;
  prerequisites: string[];
  instructions: string[];
  expectedOutcome: string;
  safetyWarning: string;
  status: AssignmentStatus;
}): Promise<PracticalAssignment> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Service role required");
    const { data, error } = await admin
      .from("assignments")
      .insert({
        title: input.title,
        slug: input.slug,
        objective: input.objective,
        category: input.category,
        difficulty: input.difficulty,
        prerequisites: input.prerequisites,
        instructions: input.instructions,
        expected_outcome: input.expectedOutcome,
        safety_warning: input.safetyWarning,
        status: input.status,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create assignment");
    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      objective: data.objective,
      category: data.category,
      difficulty: data.difficulty,
      prerequisites: data.prerequisites ?? [],
      instructions: data.instructions ?? [],
      expectedOutcome: data.expected_outcome,
      safetyWarning: data.safety_warning,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const db = readPreviewDb();
  const created: PracticalAssignment = {
    id: `assign-${Date.now()}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  db.assignments.unshift(created);
  writePreviewDb(db);
  return created;
}

export async function adminUpdateAssignmentStatus(
  assignmentId: string,
  status: AssignmentStatus
): Promise<void> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Service role required");
    await admin.from("assignments").update({ status }).eq("id", assignmentId);
    return;
  }
  const db = readPreviewDb();
  const found = db.assignments.find((a) => a.id === assignmentId);
  if (found) {
    found.status = status;
    found.updatedAt = new Date().toISOString();
    writePreviewDb(db);
  }
}
