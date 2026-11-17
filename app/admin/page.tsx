import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAdminAuditLogs } from "@/modules/admin/service";
import { getPlatformAnalytics } from "@/modules/analytics/service";
import {
  canManageAssignments,
  canManageQuizzes,
  canManageUsers,
} from "@/modules/auth/guards";
import { requireAdminConsoleAccess } from "@/modules/auth/session";
import { getPublishedLessons } from "@/modules/content/loader";

export const metadata = {
  title: "Admin Overview | FORGESEC ACADEMY",
};

export default async function AdminOverviewPage() {
  const user = await requireAdminConsoleAccess();
  const isFullAdmin = canManageUsers(user);

  const [analytics, auditLogs] = await Promise.all([
    getPlatformAnalytics(),
    isFullAdmin ? getAdminAuditLogs(6) : Promise.resolve([]),
  ]);

  const lessons = getPublishedLessons();
  const publishedQuizzes = analytics.publishedQuizCount;
  const publishedAssignments = analytics.publishedAssignmentCount;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Operations Overview
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          FORGESEC Operations Console
        </h1>
        <p className="text-sm text-[#AAB4BE]">
          Manage roles, instructor permissions, quizzes, practical assignments, and academy telemetry.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Total Accounts</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {analytics.totalUsers}
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            {analytics.activeLearners} active learners
          </div>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Published Lessons</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {lessons.length}
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            {analytics.totalLessonCompletions} total completions
          </div>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Assessments</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {publishedQuizzes}
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            {analytics.averageQuizPassRate}% average pass rate
          </div>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5">
          <div className="text-xs text-[#7B8794]">Practical Labs</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#F3F4F6]">
            {publishedAssignments}
          </div>
          <div className="mt-1 text-xs text-[#AAB4BE] tabular-nums">
            {analytics.assignmentCompletionRate}% completion rate
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {canManageQuizzes(user) ? (
          <Link
            href="/admin/quizzes"
            className="group rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635]/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F3F4F6]">Manage Quizzes</h2>
              <ArrowRight className="h-4 w-4 text-[#7B8794] group-hover:text-[#A3E635]" aria-hidden="true" />
            </div>
            <p className="mt-1.5 text-sm text-[#AAB4BE]">
              Author new quizzes, publish or archive drafts, and keep answer keys server-side.
            </p>
          </Link>
        ) : null}

        {canManageAssignments(user) ? (
          <Link
            href="/admin/assignments"
            className="group rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635]/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F3F4F6]">Manage Assignments</h2>
              <ArrowRight className="h-4 w-4 text-[#7B8794] group-hover:text-[#A3E635]" aria-hidden="true" />
            </div>
            <p className="mt-1.5 text-sm text-[#AAB4BE]">
              Create safe local lab instructions, prerequisites, and expected terminal outcomes.
            </p>
          </Link>
        ) : null}

        {isFullAdmin ? (
          <>
            <Link
              href="/admin/users"
              className="group rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#F3F4F6]">Users & Role Control</h2>
                <ArrowRight className="h-4 w-4 text-[#7B8794] group-hover:text-[#A3E635]" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-sm text-[#AAB4BE]">
                Assign instructor privileges or review protected permanent administrator accounts.
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="group rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#F3F4F6]">Platform Analytics</h2>
                <ArrowRight className="h-4 w-4 text-[#7B8794] group-hover:text-[#A3E635]" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-sm text-[#AAB4BE]">
                Inspect lesson completion rates, quiz performance, and path engagement metrics.
              </p>
            </Link>
          </>
        ) : null}
      </section>

      {isFullAdmin ? (
        <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F3F4F6]">Recent Audit Events</h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-medium text-[#A3E635] hover:underline"
            >
              View all logs
            </Link>
          </div>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-[#7B8794]">No administrative audit events recorded yet.</p>
          ) : (
            <div className="divide-y divide-[#262F38]">
              {auditLogs.slice(0, 6).map((entry) => (
                <div key={entry.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono text-[#A3E635]">{entry.action}</span>
                    <span className="mx-2 text-[#7B8794]">·</span>
                    <span className="text-[#F3F4F6]">{entry.actorEmail}</span>
                    <span className="mx-2 text-[#7B8794]">·</span>
                    <span className="text-[#AAB4BE]">
                      {entry.targetType}:{entry.targetId}
                    </span>
                  </div>
                  <span className="font-mono text-[#7B8794] tabular-nums">
                    {new Date(entry.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
