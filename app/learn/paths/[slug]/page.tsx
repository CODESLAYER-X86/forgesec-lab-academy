import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getLearningPathBySlug,
  getLessonById,
  getLessonsForPath,
  getPublishedLearningPaths,
} from "@/modules/content/loader";
import { calculatePathProgress } from "@/modules/learning/progress";
import { getUserLessonProgress } from "@/modules/learning/service";

export async function generateStaticParams() {
  return getPublishedLearningPaths().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPathBySlug(slug);
  if (!path) return { title: "Learning Path Not Found" };
  return {
    title: path.title,
    description: path.description,
    alternates: { canonical: `/learn/paths/${path.slug}` },
  };
}

export default async function LearningPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = getLearningPathBySlug(slug);
  if (!path) notFound();

  const lessons = getLessonsForPath(path);
  const user = await getCurrentUser();
  const progress = user ? await getUserLessonProgress(user.id) : [];
  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const summary = calculatePathProgress(path, completedSet);

  const nextLesson =
    (summary.nextLessonId ? getLessonById(summary.nextLessonId) : null) ?? lessons[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/learn" className="hover:text-[#F3F4F6]">
          Learn
        </Link>
        <span className="mx-2">/</span>
        <Link href="/learn/paths" className="hover:text-[#F3F4F6]">
          Paths
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{path.title}</span>
      </nav>

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
              href={`/learn/lessons/${nextLesson.meta.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#A3E635] px-6 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] transition-colors"
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
            const done = completedSet.has(lesson.meta.id);
            return (
              <Link
                key={lesson.meta.id}
                href={`/learn/lessons/${lesson.meta.slug}`}
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
                      Module {String(lesson.meta.moduleNumber).padStart(2, "0")} ·{" "}
                      {lesson.meta.estimatedMinutes} min
                    </div>
                    <h3 className="mt-0.5 text-base font-semibold text-[#F3F4F6]">
                      {lesson.meta.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#AAB4BE]">
                      {lesson.meta.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#7B8794]" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
