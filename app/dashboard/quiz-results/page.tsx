import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/modules/auth/session";
import { getUserQuizAttempts } from "@/modules/quizzes/service";

export const metadata: Metadata = {
  title: "Quiz Results",
};

export default async function DashboardQuizResultsPage() {
  const user = await requireUser();
  const attempts = await getUserQuizAttempts(user.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Quiz Attempt History</h1>
          <p className="mt-1 text-sm text-[#AAB4BE]">
            Scores calculated and persisted server-side.
          </p>
        </div>
        <Link
          href="/quizzes"
          className="inline-flex h-9 items-center rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418]"
        >
          Take a Quiz
        </Link>
      </header>

      {attempts.length === 0 ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-8 text-sm text-[#AAB4BE]">
          No quiz attempts recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#303A44] text-xs text-[#7B8794]">
              <tr>
                <th className="px-4 py-3 font-medium">Quiz</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262F38]">
              {attempts.map((a) => (
                <tr key={a.id} className="hover:bg-[#202831]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/quizzes/${a.quizSlug}`}
                      className="font-medium text-[#F3F4F6] hover:text-[#A3E635]"
                    >
                      {a.quizTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-[#E5E7EB]">
                    {a.score}/{a.totalQuestions} ({a.percentage}%)
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    <span className={a.passed ? "text-[#22C55E]" : "text-[#F59E0B]"}>
                      {a.passed ? "Passed" : "Review"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#7B8794] tabular-nums">
                    {a.submittedAt.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
