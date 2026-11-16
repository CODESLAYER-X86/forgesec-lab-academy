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
import { adminCreateQuiz, adminUpdateQuizStatus } from "@/modules/quizzes/service";

const UpdateRoleSchema = z.object({
  targetUserId: z.string().min(2),
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
    revalidatePath("/admin/audit-logs");
  }
  return result;
}

const CreateQuizSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  passPercentage: z.number().int().min(1).max(100),
  status: z.enum(["draft", "published", "archived"]),
  questionPrompt: z.string().min(5),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  correctIndex: z.number().int().min(0).max(2),
  explanation: z.string().min(3),
});

export async function createQuizAction(
  input: z.infer<typeof CreateQuizSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = CreateQuizSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please complete all quiz fields cleanly." };

  const actor = await requireQuizManager();
  const created = await adminCreateQuiz({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    passPercentage: parsed.data.passPercentage,
    status: parsed.data.status,
    questionPrompt: parsed.data.questionPrompt,
    options: [parsed.data.optionA, parsed.data.optionB, parsed.data.optionC],
    correctIndex: parsed.data.correctIndex,
    explanation: parsed.data.explanation,
  });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "quiz.created",
    targetType: "quiz",
    targetId: created.id,
    details: { slug: created.slug, status: created.status },
  });

  revalidatePath("/admin/quizzes");
  revalidatePath("/quizzes");
  revalidatePath("/admin/audit-logs");
  return { ok: true };
}

export async function toggleQuizStatusAction(
  quizId: string,
  status: QuizStatus
): Promise<{ ok: boolean; error?: string }> {
  const actor = await requireQuizManager();
  await adminUpdateQuizStatus(quizId, status);
  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: `quiz.${status}`,
    targetType: "quiz",
    targetId: quizId,
    details: { status },
  });
  revalidatePath("/admin/quizzes");
  revalidatePath("/quizzes");
  revalidatePath("/admin/audit-logs");
  return { ok: true };
}

const CreateAssignmentSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  objective: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.string().min(2),
  instructions: z.string().min(5),
  expectedOutcome: z.string().min(5),
  safetyWarning: z.string().min(5),
  status: z.enum(["draft", "published", "archived"]),
});

export async function createAssignmentAction(
  input: z.infer<typeof CreateAssignmentSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = CreateAssignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check all assignment fields." };

  const actor = await requireAssignmentManager();
  const created = await adminCreateAssignment({
    title: parsed.data.title,
    slug: parsed.data.slug,
    objective: parsed.data.objective,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    prerequisites: parsed.data.prerequisites
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    instructions: parsed.data.instructions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    expectedOutcome: parsed.data.expectedOutcome,
    safetyWarning: parsed.data.safetyWarning,
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

  revalidatePath("/admin/assignments");
  revalidatePath("/assignments");
  revalidatePath("/admin/audit-logs");
  return { ok: true };
}

export async function toggleAssignmentStatusAction(
  assignmentId: string,
  status: AssignmentStatus
): Promise<{ ok: boolean; error?: string }> {
  const actor = await requireAssignmentManager();
  await adminUpdateAssignmentStatus(assignmentId, status);
  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: `assignment.${status}`,
    targetType: "assignment",
    targetId: assignmentId,
    details: { status },
  });
  revalidatePath("/admin/assignments");
  revalidatePath("/assignments");
  revalidatePath("/admin/audit-logs");
  return { ok: true };
}
