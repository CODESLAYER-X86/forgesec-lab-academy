"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AssignmentProgressStatus, ContentType, QuizAttemptRecord } from "@/lib/types/domain";
import { isAccountActive } from "@/modules/auth/guards";
import {
  getCurrentUser,
  requestAccountDeletion,
  requireUser,
  updateCurrentUserProfile,
} from "@/modules/auth/session";
import { updateAssignmentStatus } from "@/modules/assignments/service";
import { getLessonById, getPublishedLessons } from "@/modules/content/loader";
import {
  toggleBookmark,
  toggleLessonCompletion,
} from "@/modules/learning/service";
import {
  getPublicQuizBySlug,
  getUserQuizAttempts,
  submitQuizAttempt,
} from "@/modules/quizzes/service";

const LessonCompletionSchema = z.object({
  lessonId: z.string().min(2).max(128),
  pathId: z.string().min(2).max(128),
  slug: z.string().min(2).max(160),
  completed: z.boolean(),
});

export async function toggleLessonCompletionAction(
  input: z.infer<typeof LessonCompletionSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = LessonCompletionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request payload." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to record lesson completion." };
  if (!isAccountActive(user)) return { ok: false, error: "Account is inactive." };

  const lesson = getLessonById(parsed.data.lessonId);
  if (!lesson || lesson.meta.slug !== parsed.data.slug) {
    return { ok: false, error: "Lesson not found." };
  }

  const linkedQuiz = lesson.meta.quizSlug
    ? await getPublicQuizBySlug(lesson.meta.quizSlug)
    : null;

  if (linkedQuiz) {
    if (!parsed.data.completed) {
      return {
        ok: false,
        error: "Modules with a knowledge check cannot be manually unmarked.",
      };
    }
    const attempts = await getUserQuizAttempts(user.id);
    const hasPerfectScore = attempts.some(
      (a) =>
        (a.quizSlug === linkedQuiz.slug || a.quizId === linkedQuiz.id) &&
        a.percentage === 100
    );
    if (!hasPerfectScore) {
      return {
        ok: false,
        error: "Answer 100% of the module quiz correctly to complete this module.",
      };
    }
  }

  await toggleLessonCompletion(
    user.id,
    lesson.meta.id,
    lesson.meta.pathId,
    parsed.data.completed
  );
  revalidatePath(`/learn/lessons/${lesson.meta.slug}`);
  revalidatePath(`/learn/paths/${lesson.meta.pathId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/learning");
  return { ok: true };
}

const BookmarkSchema = z.object({
  contentId: z.string().min(2).max(128),
  contentType: z.enum(["tutorial", "learning_path", "writeup", "guide", "reference", "glossary"]),
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(160),
});

export async function toggleBookmarkAction(input: {
  contentId: string;
  contentType: ContentType;
  title: string;
  slug: string;
}): Promise<{ ok: boolean; bookmarked?: boolean; error?: string }> {
  const parsed = BookmarkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid bookmark request." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save bookmarks." };
  if (!isAccountActive(user)) return { ok: false, error: "Account is inactive." };

  const res = await toggleBookmark(user.id, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookmarks");
  revalidatePath(`/learn/lessons/${parsed.data.slug}`);
  return { ok: true, bookmarked: res.bookmarked };
}

const QuizSubmitSchema = z.object({
  slug: z.string().min(2).max(160),
  answers: z.record(z.string().max(128), z.array(z.string().max(500)).max(20)),
});

export async function submitQuizAction(
  input: z.infer<typeof QuizSubmitSchema>
): Promise<{ ok: boolean; result?: QuizAttemptRecord; error?: string }> {
  const parsed = QuizSubmitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid quiz submission." };

  const user = await getCurrentUser();
  if (user && !isAccountActive(user)) {
    return { ok: false, error: "Your account is currently inactive." };
  }

  try {
    const result = await submitQuizAttempt({
      slug: parsed.data.slug,
      userId: user?.id ?? null,
      answers: parsed.data.answers,
    });
    if (user) {
      if (result.percentage === 100 && result.passed) {
        const matchingLesson = getPublishedLessons().find(
          (l) => l.meta.quizSlug === parsed.data.slug
        );
        if (matchingLesson) {
          await toggleLessonCompletion(
            user.id,
            matchingLesson.meta.id,
            matchingLesson.meta.pathId,
            true
          );
          revalidatePath(`/learn/lessons/${matchingLesson.meta.slug}`);
          revalidatePath(`/learn/paths/${matchingLesson.meta.pathId}`);
        }
      }
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/learning");
      revalidatePath("/dashboard/quiz-results");
    }
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to grade quiz." };
  }
}

const AssignmentStatusSchema = z.object({
  assignmentId: z.string().min(2).max(128),
  slug: z.string().min(2).max(160),
  status: z.enum(["not_started", "in_progress", "completed"]),
  notes: z.string().max(1000).optional(),
});

export async function updateAssignmentStatusAction(input: {
  assignmentId: string;
  slug: string;
  status: AssignmentProgressStatus;
  notes?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = AssignmentStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid assignment update." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to track assignment progress." };
  if (!isAccountActive(user)) return { ok: false, error: "Account is inactive." };

  await updateAssignmentStatus(
    user.id,
    parsed.data.assignmentId,
    parsed.data.status,
    parsed.data.notes ?? ""
  );
  revalidatePath(`/assignments/${parsed.data.slug}`);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/assignments");
  return { ok: true };
}

const ProfileUpdateSchema = z.object({
  displayName: z.string().min(2).max(60),
  bio: z.string().max(400),
  interests: z.string().max(240),
});

export async function updateProfileAction(input: {
  displayName: string;
  bio: string;
  interests: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = ProfileUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check your profile inputs." };

  const user = await requireUser();
  const interestsList = parsed.data.interests
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  await updateCurrentUserProfile(user.id, {
    displayName: parsed.data.displayName.trim(),
    bio: parsed.data.bio.trim(),
    interests: interestsList,
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/profile/edit");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function requestAccountDeletionAction(): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (user.isPermanentAdmin) {
    return {
      ok: false,
      error: "Permanent environment administrators cannot request self-deletion from the UI.",
    };
  }
  await requestAccountDeletion(user.id);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile");
  return { ok: true };
}
