import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getPublishedAssignments,
  getUserAssignmentProgress,
} from "@/modules/assignments/service";
import { requireUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "My Practical Assignments",
};

export default async function DashboardAssignmentsPage() {
  const user = await requireUser();
  const [assignments, progress] = await Promise.all([
    getPublishedAssignments(),
    getUserAssignmentProgress(user.id),
  ]);

  const progressMap = new Map(progress.map((p) => [p.assignmentId, p]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">Practical Assignments</h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Track hands-on exercises you run on your local Linux machine or authorized lab.
        </p>
      </header>

      <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
        {assignments.map((a) => {
          const rec = progressMap.get(a.id);
          const status = rec?.status ?? "not_started";
          return (
            <Link
              key={a.id}
              href={`/assignments/${a.slug}`}
              className="flex items-center justify-between gap-4 p-5 hover:bg-[#202831] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs text-[#7B8794] capitalize">
                  {a.category} · {a.difficulty} ·{" "}
                  <span
                    className={
                      status === "completed"
                        ? "text-[#22C55E]"
                        : status === "in_progress"
                        ? "text-[#F59E0B]"
                        : "text-[#AAB4BE]"
                    }
                  >
                    {status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-1 text-base font-semibold text-[#F3F4F6]">
                  {a.title}
                </div>
                <p className="mt-0.5 text-xs text-[#AAB4BE] line-clamp-1">{a.objective}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#7B8794]" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
