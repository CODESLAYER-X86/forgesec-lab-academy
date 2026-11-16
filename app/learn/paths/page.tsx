import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { getPublishedLearningPaths } from "@/modules/content/loader";
import { calculatePathProgress } from "@/modules/learning/progress";
import { getUserLessonProgress } from "@/modules/learning/service";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Structured cybersecurity roadmaps covering Linux Fundamentals, Networking, and Web Security.",
};

export default async function LearningPathsIndexPage() {
  const [user, paths] = await Promise.all([
    getCurrentUser(),
    Promise.resolve(getPublishedLearningPaths()),
  ]);

  const progress = user ? await getUserLessonProgress(user.id) : [];
  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Learning Paths</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Guided, recommended sequences for mastering core systems and security foundations.
          Modules remain unlocked so you can study at your own pace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {paths.map((p) => {
          const summary = calculatePathProgress(p, completedSet);
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
    </div>
  );
}
