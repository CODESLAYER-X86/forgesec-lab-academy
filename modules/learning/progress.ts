import type { LearningPath } from "@/modules/content/schemas";

export interface PathProgressSummary {
  pathId: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  status: "not_started" | "in_progress" | "completed";
  nextLessonId: string | null;
}

export function calculatePathProgress(
  path: LearningPath,
  completedLessonIds: Set<string>
): PathProgressSummary {
  const totalLessons = path.lessons.length;
  const completedLessons = path.lessons.filter((id) => completedLessonIds.has(id)).length;
  const percentage =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  let status: PathProgressSummary["status"] = "not_started";
  if (completedLessons > 0 && completedLessons < totalLessons) {
    status = "in_progress";
  } else if (totalLessons > 0 && completedLessons >= totalLessons) {
    status = "completed";
  }

  const nextLessonId =
    path.lessons.find((id) => !completedLessonIds.has(id)) ?? null;

  return {
    pathId: path.id,
    title: path.title,
    slug: path.slug,
    category: path.category,
    difficulty: path.difficulty,
    totalLessons,
    completedLessons,
    percentage,
    status,
    nextLessonId,
  };
}

export function pickContinueLearningPath(
  paths: LearningPath[],
  completedLessonIds: Set<string>
): PathProgressSummary | null {
  if (paths.length === 0) return null;
  const summaries = paths.map((p) => calculatePathProgress(p, completedLessonIds));

  // Prefer the first active (in_progress) path with an incomplete next lesson
  const active = summaries.find((s) => s.status === "in_progress" && s.nextLessonId);
  if (active) return active;

  // Otherwise pick the first not_started path
  const upcoming = summaries.find((s) => s.status === "not_started" && s.nextLessonId);
  if (upcoming) return upcoming;

  return summaries[0] ?? null;
}
