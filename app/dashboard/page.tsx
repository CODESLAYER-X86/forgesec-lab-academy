import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getUserAssignmentProgress } from "@/modules/assignments/service";
import { requireUser } from "@/modules/auth/session";
import {
  getDashboardLearningSummary,
  getUserActivity,
  getUserBookmarks,
} from "@/modules/learning/service";
import { getUserQuizAttempts } from "@/modules/quizzes/service";

export const metadata: Metadata = {
  title: "Student Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [summary, bookmarks, activity, attempts, assignmentProgress] = await Promise.all([
    getDashboardLearningSummary(user.id),
    getUserBookmarks(user.id),
    getUserActivity(user.id),
    getUserQuizAttempts(user.id),
    getUserAssignmentProgress(user.id),
  ]);

  const completedAssignments = assignmentProgress.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <header className="border-b border-[#303A44] pb-5">
        <h1 className="text-2xl font-bold text-[#F3F4F6] sm:text-3xl">
          Welcome back, {user.displayName}
        </h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Track your active learning paths, saved bookmarks, quiz attempts, and practical tasks.
        </p>
      </header>

      {/* Continue Learning */}
      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6">
        <div className="text-xs font-medium text-[#A3E635]">Continue Learning</div>
        {summary.continueLearning ? (
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[#F3F4F6]">
                {summary.continueLearning.nextLessonTitle}
              </h2>
              <p className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
                {summary.continueLearning.path.title} ·{" "}
                {summary.continueLearning.path.completedLessons} of{" "}
                {summary.continueLearning.path.totalLessons} lessons completed (
                {summary.continueLearning.path.percentage}%)
              </p>
            </div>
            <Link
              href={`/learn/lessons/${summary.continueLearning.nextLessonSlug}`}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#A3E635] px-5 text-xs font-semibold text-[#101418] hover:bg-[#B4F04E] transition-colors whitespace-nowrap"
            >
              <span>Resume Next Module</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#F3F4F6]">
                All current paths completed
              </h2>
              <p className="mt-1 text-xs text-[#AAB4BE]">
                Explore write-ups, command references, and quizzes to sharpen retention.
              </p>
            </div>
            <Link
              href="/learn"
              className="inline-flex h-10 items-center rounded-lg border border-[#303A44] px-4 text-xs font-semibold text-[#F3F4F6]"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#AAB4BE]">Completed Lessons</div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#F3F4F6] tabular-nums">
            {summary.completedCount}/{summary.totalPublishedLessons}
          </div>
        </div>
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#AAB4BE]">Overall Progress</div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#A3E635] tabular-nums">
            {summary.overallPercentage}%
          </div>
        </div>
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#AAB4BE]">Quiz Attempts</div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#F3F4F6] tabular-nums">
            {attempts.length}
          </div>
        </div>
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#AAB4BE]">Tasks Completed</div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#F3F4F6] tabular-nums">
            {completedAssignments}
          </div>
        </div>
      </section>

      {/* Active Learning Paths */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-[#F3F4F6]">Learning Paths</h2>
          <Link href="/dashboard/learning" className="text-xs text-[#A3E635] hover:underline">
            View details
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summary.pathSummaries.map((path) => (
            <Link
              key={path.pathId}
              href={`/learn/paths/${path.slug}`}
              className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#4B5866] transition-colors space-y-3"
            >
              <div className="text-xs text-[#7B8794] capitalize">
                {path.status.replace("_", " ")} · {path.difficulty}
              </div>
              <div className="text-base font-semibold text-[#F3F4F6]">{path.title}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#AAB4BE] tabular-nums">
                  <span>
                    {path.completedLessons}/{path.totalLessons} modules
                  </span>
                  <span>{path.percentage}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#101418]">
                  <div
                    className="h-full bg-[#A3E635]"
                    style={{ width: `${path.percentage}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bookmarks & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-[#F3F4F6]">Saved Bookmarks</h2>
            <Link href="/dashboard/bookmarks" className="text-xs text-[#A3E635] hover:underline">
              All bookmarks
            </Link>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-[#AAB4BE]">
              No saved bookmarks yet. Bookmark any lesson while studying to revisit it quickly.
            </p>
          ) : (
            <ul className="divide-y divide-[#262F38]">
              {bookmarks.slice(0, 4).map((b) => (
                <li key={b.id} className="py-2.5">
                  <Link
                    href={
                      b.contentType === "reference" || b.contentType === "guide"
                        ? `/resources/${b.slug}`
                        : `/learn/lessons/${b.slug}`
                    }
                    className="text-sm font-medium text-[#F3F4F6] hover:text-[#A3E635]"
                  >
                    {b.title}
                  </Link>
                  <div className="text-xs text-[#7B8794] capitalize">{b.contentType}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-[#F3F4F6]">Recent Quiz Results</h2>
            <Link href="/dashboard/quiz-results" className="text-xs text-[#A3E635] hover:underline">
              All results
            </Link>
          </div>
          {attempts.length === 0 ? (
            <p className="text-xs text-[#AAB4BE]">
              You haven&apos;t submitted a quiz yet.{" "}
              <Link href="/quizzes" className="text-[#A3E635] underline">
                Browse quizzes
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-[#262F38]">
              {attempts.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`/quizzes/${a.quizSlug}`}
                      className="text-sm font-medium text-[#F3F4F6] hover:text-[#A3E635] truncate block"
                    >
                      {a.quizTitle}
                    </Link>
                    <div className="text-xs text-[#7B8794]">
                      {a.passed ? "Passed" : "Needs review"}
                    </div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-[#F3F4F6] tabular-nums">
                    {a.percentage}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent Activity */}
      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-[#F3F4F6]">Recent Activity</h2>
          <Link href="/dashboard/history" className="text-xs text-[#A3E635] hover:underline">
            Full history
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="text-xs text-[#AAB4BE]">
            Open any lesson in the{" "}
            <Link href="/learn" className="text-[#A3E635] underline">
              learning catalog
            </Link>{" "}
            to begin recording history.
          </p>
        ) : (
          <ul className="divide-y divide-[#262F38]">
            {activity.slice(0, 5).map((act) => (
              <li key={act.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                <Link
                  href={`/learn/lessons/${act.slug}`}
                  className="font-medium text-[#E5E7EB] hover:text-[#A3E635]"
                >
                  {act.title}
                </Link>
                <span className="font-mono text-[#7B8794] tabular-nums">
                  {act.viewedAt.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
