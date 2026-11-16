import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { requireUser } from "@/modules/auth/session";
import {
  getLessonsForPath,
  getPublishedLearningPaths,
} from "@/modules/content/loader";
import { calculatePathProgress } from "@/modules/learning/progress";
import { getUserLessonProgress } from "@/modules/learning/service";

export const metadata: Metadata = {
  title: "My Learning Progress",
};

export default async function DashboardLearningPage() {
  const user = await requireUser();
  const [progress, paths] = await Promise.all([
    getUserLessonProgress(user.id),
    Promise.resolve(getPublishedLearningPaths()),
  ]);

  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">Learning Progress</h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Detailed module-by-module completion across all published learning paths.
        </p>
      </header>

      <div className="space-y-6">
        {paths.map((path) => {
          const summary = calculatePathProgress(path, completedSet);
          const lessons = getLessonsForPath(path);
          return (
            <section
              key={path.id}
              className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/learn/paths/${path.slug}`}
                    className="text-lg font-semibold text-[#F3F4F6] hover:text-[#A3E635]"
                  >
                    {path.title}
                  </Link>
                  <div className="text-xs text-[#AAB4BE] tabular-nums">
                    {summary.completedLessons} of {summary.totalLessons} completed ({summary.percentage}%)
                  </div>
                </div>
                <Link
                  href={`/learn/paths/${path.slug}`}
                  className="text-xs font-semibold text-[#A3E635] hover:underline"
                >
                  Open Path
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {lessons.map((lesson) => {
                  const done = completedSet.has(lesson.meta.id);
                  return (
                    <Link
                      key={lesson.meta.id}
                      href={`/learn/lessons/${lesson.meta.slug}`}
                      className="flex items-center gap-2.5 rounded-lg border border-[#262F38] bg-[#101418] px-3.5 py-2.5 text-xs hover:border-[#4B5866]"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-[#52606D]" />
                      )}
                      <span className="truncate text-[#E5E7EB]">
                        {String(lesson.meta.moduleNumber).padStart(2, "0")}. {lesson.meta.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
