import Link from "next/link";
import { getPlatformAnalytics } from "@/modules/analytics/service";
import { requireFullAdmin } from "@/modules/auth/session";

export const metadata = {
  title: "Analytics | FORGESEC Admin",
};

export default async function AdminAnalyticsPage() {
  await requireFullAdmin();
  const analytics = await getPlatformAnalytics();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Telemetry & Outcomes
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          Platform Analytics
        </h1>
        <p className="text-sm text-[#AAB4BE]">
          Monitor learner growth, path completion momentum, quiz pass rates, and practical labs.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Active Learner Engagement</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {analytics.activeLearners} / {analytics.totalUsers}
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            {analytics.totalUsers
              ? Math.round((analytics.activeLearners / analytics.totalUsers) * 100)
              : 0}
            % of registered learners active
          </div>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Quiz Attempts & Pass Rate</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {analytics.averageQuizPassRate}%
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            Across {analytics.totalQuizAttempts} submitted attempts
          </div>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Assignment Completion Rate</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {analytics.assignmentCompletionRate}%
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            {analytics.totalLessonCompletions} lesson completions recorded
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#F3F4F6]">Learning Path Completion</h2>
        <div className="space-y-4">
          {analytics.pathStats.map((path) => (
            <div key={path.pathId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F3F4F6]">{path.title}</span>
                <span className="font-mono text-[#AAB4BE] tabular-nums">
                  {path.completions} completions · {path.completionRate}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#101418]">
                <div
                  className="h-full rounded-full bg-[#A3E635]"
                  style={{ width: `${path.completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
          <div className="border-b border-[#262F38] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Popular Lessons</h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#262F38] text-[#7B8794]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Lesson</th>
                <th className="px-4 py-2.5 font-medium text-right">Views</th>
                <th className="px-4 py-2.5 font-medium text-right">Completions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262F38]">
              {analytics.popularLessons.map((lesson) => (
                <tr key={lesson.lessonId}>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/learn/lessons/${lesson.slug}`}
                      className="text-[#F3F4F6] hover:text-[#A3E635]"
                    >
                      {lesson.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#AAB4BE]">
                    {lesson.views}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#A3E635]">
                    {lesson.completions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
          <div className="border-b border-[#262F38] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Quiz Performance</h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#262F38] text-[#7B8794]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Assessment</th>
                <th className="px-4 py-2.5 font-medium text-right">Attempts</th>
                <th className="px-4 py-2.5 font-medium text-right">Avg Score</th>
                <th className="px-4 py-2.5 font-medium text-right">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262F38]">
              {analytics.quizPerformance.map((q) => (
                <tr key={q.quizId}>
                  <td className="px-4 py-2.5 text-[#F3F4F6]">{q.title}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#AAB4BE]">
                    {q.attempts}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#F3F4F6]">
                    {q.avgScore}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#A3E635]">
                    {q.passRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
