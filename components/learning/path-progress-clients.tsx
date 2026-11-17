"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { calculatePathProgress } from "@/modules/learning/progress";
import type { LearningPath } from "@/modules/content/schemas";

export interface PathModuleCardItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleNumber: number;
  estimatedMinutes: number;
}

export function PathsIndexClient({ paths }: { paths: LearningPath[] }) {
  const { user, completedIds } = useAuthSession();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {paths.map((p) => {
        const summary = calculatePathProgress(p, completedIds);
        return (
          <Link
            key={p.id}
            href={`/learn/paths/${p.slug}`}
            className="group flex flex-col justify-between rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
          >
            <div>
              <div className="text-xs text-[#AAB4BE] capitalize tabular-nums">
                {p.category.replace("-", " ")} · {p.difficulty} · {p.lessons.length} modules
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[#F3F4F6] group-hover:text-[#A3E635] transition-colors">
                {p.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
                {p.description}
              </p>

              {user ? (
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#AAB4BE] tabular-nums">
                    <span>Progress</span>
                    <span>
                      {summary.completedLessons}/{summary.totalLessons} ({summary.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#101418]">
                    <div
                      className="h-full bg-[#A3E635] transition-all"
                      style={{ width: `${summary.percentage}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#262F38] pt-4 text-xs text-[#7B8794]">
              <span className="tabular-nums">{p.estimatedMinutes} min total</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#A3E635]">
                Open Path <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function PathDetailClient({
  path,
  lessons,
}: {
  path: LearningPath;
  lessons: PathModuleCardItem[];
}) {
  const { user, completedIds } = useAuthSession();
  const summary = calculatePathProgress(path, completedIds);
  const nextLesson =
    (summary.nextLessonId
      ? lessons.find((l) => l.id === summary.nextLessonId)
      : null) ?? lessons[0];

  return (
    <>
      {/* Header */}
      <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 sm:p-8 space-y-6">
        <div>
          <div className="text-xs text-[#AAB4BE] capitalize tabular-nums">
            {path.category.replace("-", " ")} · {path.difficulty} · {lessons.length} modules ·{" "}
            {path.estimatedMinutes} min
          </div>
          <h1 className="mt-2 text-3xl font-bold text-[#F3F4F6]">{path.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#AAB4BE]">
            {path.description}
          </p>
          <div className="mt-3 text-xs text-[#7B8794]">Instructor: {path.instructor}</div>
        </div>

        {user ? (
          <div className="max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#AAB4BE] tabular-nums">
              <span>Your Path Progress</span>
              <span>
                {summary.completedLessons} of {summary.totalLessons} completed ({summary.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#101418]">
              <div
                className="h-full bg-[#A3E635] transition-all"
                style={{ width: `${summary.percentage}%` }}
              />
            </div>
          </div>
        ) : null}

        {nextLesson ? (
          <div>
            <Link
              href={`/learn/lessons/${nextLesson.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#A3E635] px-6 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] active:scale-[0.98] transition-all"
            >
              <span>
                {summary.completedLessons > 0 && summary.nextLessonId
                  ? "Continue Learning"
                  : "Start Learning"}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Objectives & Prerequisites */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
          <h2 className="text-base font-semibold text-[#F3F4F6]">Learning Objectives</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#AAB4BE] list-disc pl-5">
            {path.objectives.map((obj) => (
              <li key={obj}>{obj}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
          <h2 className="text-base font-semibold text-[#F3F4F6]">Prerequisites</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#AAB4BE] list-disc pl-5">
            {path.prerequisites.map((pre) => (
              <li key={pre}>{pre}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ordered Curriculum */}
      <section aria-labelledby="curriculum-heading" className="space-y-4">
        <h2 id="curriculum-heading" className="text-xl font-semibold text-[#F3F4F6]">
          Curriculum Modules
        </h2>
        <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
          {lessons.map((lesson) => {
            const done = completedIds.has(lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/learn/lessons/${lesson.slug}`}
                className="flex items-start justify-between gap-4 p-5 hover:bg-[#202831] transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#52606D]" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-[#7B8794] tabular-nums">
                      Module {String(lesson.moduleNumber).padStart(2, "0")} ·{" "}
                      {lesson.estimatedMinutes} min
                    </div>
                    <h3 className="mt-0.5 text-base font-semibold text-[#F3F4F6]">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#AAB4BE]">
                      {lesson.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#7B8794]" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
