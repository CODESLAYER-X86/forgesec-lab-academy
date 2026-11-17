import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurriculumSeed, readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AssignmentProgressRecord,
  AssignmentProgressStatus,
  AssignmentStatus,
  PracticalAssignment,
} from "@/lib/types/domain";

export const getPublishedAssignments = cache(async (): Promise<PracticalAssignment[]> => {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClient();
    const dbAssignments: PracticalAssignment[] = [];
    if (supabase) {
      const { data } = await supabase
        .from("assignments")
        .select("*")
        .eq("status", "published")
        .order("title");
      for (const row of data ?? []) {
        dbAssignments.push({
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
        });
      }
    }
    const bySlug = new Map<string, PracticalAssignment>(
      dbAssignments.map((a) => [a.slug, a])
    );
    for (const seedAssign of getCurriculumSeed().assignments) {
      if (seedAssign.status === "published" && !bySlug.has(seedAssign.slug)) {
        bySlug.set(seedAssign.slug, seedAssign);
      }
    }
    return Array.from(bySlug.values());
  }

  return readPreviewDb().assignments.filter((a) => a.status === "published");
});

export const getAssignmentBySlug = cache(async (slug: string): Promise<PracticalAssignment | null> => {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClient();
    if (supabase) {
      const { data: row } = await supabase
        .from("assignments")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (row) {
        return {
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
        };
      }
    }
    return (
      getCurriculumSeed().assignments.find(
        (a) => a.slug === slug && a.status === "published"
      ) ?? null
    );
  }

  return (
    readPreviewDb().assignments.find(
      (a) => a.slug === slug && a.status === "published"
    ) ?? null
  );
});

export const getUserAssignmentProgress = cache(
  async (userId: string): Promise<AssignmentProgressRecord[]> => {
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
);

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

export const getAllAssignmentsForAdmin = cache(async (): Promise<PracticalAssignment[]> => {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];
    const { data } = await admin
      .from("assignments")
      .select("id, slug, title, objective, category, difficulty, lesson_id, prerequisites, instructions, expected_outcome, safety_warning, status, created_at, updated_at")
      .order("updated_at", { ascending: false });
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
});

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
  if (db.assignments.some((a) => a.slug === input.slug)) {
    throw new Error("An assignment with that slug already exists.");
  }
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
): Promise<{ slug: string | null }> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Service role required");
    const { data } = await admin
      .from("assignments")
      .update({ status })
      .eq("id", assignmentId)
      .select("slug")
      .maybeSingle();
    return { slug: data?.slug ?? null };
  }
  const db = readPreviewDb();
  const found = db.assignments.find((a) => a.id === assignmentId);
  if (found) {
    found.status = status;
    found.updatedAt = new Date().toISOString();
    writePreviewDb(db);
    return { slug: found.slug };
  }
  return { slug: null };
}
