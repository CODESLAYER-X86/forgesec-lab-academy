"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AssignmentStatus, QuizStatus } from "@/lib/types/domain";
import { adminUpdateUserRole, recordAuditLog } from "@/modules/admin/service";
import {
  adminCreateAssignment,
  adminUpdateAssignmentStatus,
} from "@/modules/assignments/service";
import {
  requireAssignmentManager,
  requireFullAdmin,
  requireQuizManager,
} from "@/modules/auth/session";
import { getPublishedLessons } from "@/modules/content/loader";
import { adminCreateQuiz, adminUpdateQuizStatus } from "@/modules/quizzes/service";

function revalidateLinkedLessonForQuiz(quizSlug: string) {
  for (const lesson of getPublishedLessons()) {
    if (lesson.meta.quizSlug === quizSlug) {
      revalidatePath(`/learn/lessons/${lesson.meta.slug}`);
    }
  }
}

function revalidateLinkedLessonForAssignment(assignmentSlug: string) {
  for (const lesson of getPublishedLessons()) {
    if (lesson.meta.assignmentSlug === assignmentSlug) {
      revalidatePath(`/learn/lessons/${lesson.meta.slug}`);
    }
  }
}

const UpdateRoleSchema = z.object({
  targetUserId: z.string().min(2).max(128),
  role: z.enum(["student", "instructor", "admin"]),
  canManageQuizzes: z.boolean(),
  canManageAssignments: z.boolean(),
});

export async function updateUserRoleAction(
  input: z.infer<typeof UpdateRoleSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = UpdateRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid role payload." };

  const actor = await requireFullAdmin();
  const result = await adminUpdateUserRole({
    actor,
    ...parsed.data,
  });

  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${parsed.data.targetUserId}`);
    revalidatePath("/admin/permissions");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/audit-logs");
  }
  return result;
}

const CreateQuizSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(60),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  passPercentage: z.number().int().min(1).max(100),
  status: z.enum(["draft", "published", "archived"]),
  questionPrompt: z.string().min(5).max(500),
  optionA: z.string().min(1).max(300),
  optionB: z.string().min(1).max(300),
  optionC: z.string().min(1).max(300),
  correctIndex: z.number().int().min(0).max(2),
  explanation: z.string().min(3).max(1000),
});

export async function createQuizAction(
  input: z.infer<typeof CreateQuizSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = CreateQuizSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please complete all quiz fields cleanly." };

  const actor = await requireQuizManager();
  try {
    const created = await adminCreateQuiz({
      title: parsed.data.title.trim(),
      slug: parsed.data.slug.trim(),
      description: parsed.data.description.trim(),
      category: parsed.data.category.trim(),
      difficulty: parsed.data.difficulty,
      passPercentage: parsed.data.passPercentage,
      status: parsed.data.status,
      questionPrompt: parsed.data.questionPrompt.trim(),
      options: [parsed.data.optionA.trim(), parsed.data.optionB.trim(), parsed.data.optionC.trim()],
      correctIndex: parsed.data.correctIndex,
      explanation: parsed.data.explanation.trim(),
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "quiz.created",
      targetType: "quiz",
      targetId: created.id,
      details: { slug: created.slug, status: created.status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/quizzes");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/audit-logs");
    revalidatePath("/quizzes");
    revalidatePath(`/quizzes/${created.slug}`);
    revalidateLinkedLessonForQuiz(created.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create quiz." };
  }
}

const ToggleQuizStatusSchema = z.object({
  quizId: z.string().min(2).max(128),
  status: z.enum(["draft", "published", "archived"]),
});

export async function toggleQuizStatusAction(
  quizId: string,
  status: QuizStatus
): Promise<{ ok: boolean; error?: string }> {
  const parsed = ToggleQuizStatusSchema.safeParse({ quizId, status });
  if (!parsed.success) return { ok: false, error: "Invalid quiz status update." };

  const actor = await requireQuizManager();
  const updated = await adminUpdateQuizStatus(parsed.data.quizId, parsed.data.status);
  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: `quiz.${parsed.data.status}`,
    targetType: "quiz",
    targetId: parsed.data.quizId,
    details: { status: parsed.data.status },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/quizzes");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/quizzes");
  if (updated.slug) {
    revalidatePath(`/quizzes/${updated.slug}`);
    revalidateLinkedLessonForQuiz(updated.slug);
  }
  return { ok: true };
}

const CreateAssignmentSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/),
  objective: z.string().min(10).max(1500),
  category: z.string().min(2).max(60),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.string().min(2).max(2000),
  instructions: z.string().min(5).max(6000),
  expectedOutcome: z.string().min(5).max(1500),
  safetyWarning: z.string().min(5).max(1000),
  status: z.enum(["draft", "published", "archived"]),
});

export async function createAssignmentAction(
  input: z.infer<typeof CreateAssignmentSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = CreateAssignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check all assignment fields." };

  const actor = await requireAssignmentManager();
  try {
    const created = await adminCreateAssignment({
      title: parsed.data.title.trim(),
      slug: parsed.data.slug.trim(),
      objective: parsed.data.objective.trim(),
      category: parsed.data.category.trim(),
      difficulty: parsed.data.difficulty,
      prerequisites: parsed.data.prerequisites
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      instructions: parsed.data.instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      expectedOutcome: parsed.data.expectedOutcome.trim(),
      safetyWarning: parsed.data.safetyWarning.trim(),
      status: parsed.data.status,
    });

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "assignment.created",
      targetType: "assignment",
      targetId: created.id,
      details: { slug: created.slug, status: created.status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/assignments");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/audit-logs");
    revalidatePath("/assignments");
    revalidatePath(`/assignments/${created.slug}`);
    revalidateLinkedLessonForAssignment(created.slug);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create assignment.",
    };
  }
}

const ToggleAssignmentStatusSchema = z.object({
  assignmentId: z.string().min(2).max(128),
  status: z.enum(["draft", "published", "archived"]),
});

export async function toggleAssignmentStatusAction(
  assignmentId: string,
  status: AssignmentStatus
): Promise<{ ok: boolean; error?: string }> {
  const parsed = ToggleAssignmentStatusSchema.safeParse({ assignmentId, status });
  if (!parsed.success) return { ok: false, error: "Invalid assignment status update." };

  const actor = await requireAssignmentManager();
  const updated = await adminUpdateAssignmentStatus(parsed.data.assignmentId, parsed.data.status);
  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: `assignment.${parsed.data.status}`,
    targetType: "assignment",
    targetId: parsed.data.assignmentId,
    details: { status: parsed.data.status },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/assignments");
  if (updated.slug) {
    revalidatePath(`/assignments/${updated.slug}`);
    revalidateLinkedLessonForAssignment(updated.slug);
  }
  return { ok: true };
}
