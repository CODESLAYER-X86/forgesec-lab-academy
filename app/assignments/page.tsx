import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getPublishedAssignments,
  getUserAssignmentProgress,
} from "@/modules/assignments/service";

export const metadata: Metadata = {
  title: "Practical Assignments",
  description:
    "Hands-on cybersecurity and Linux exercises executed safely on your local machine.",
};

export default async function AssignmentsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string }>;
}) {
  const { category = "all", difficulty = "all" } = await searchParams;
  const [user, assignments] = await Promise.all([
    getCurrentUser(),
    getPublishedAssignments(),
  ]);

  const progress = user ? await getUserAssignmentProgress(user.id) : [];
  const statusMap = new Map(progress.map((p) => [p.assignmentId, p.status]));

  const filtered = assignments.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (difficulty !== "all" && a.difficulty !== difficulty) return false;
    return true;
  });

  const categories = ["all", "linux", "networking", "web-security"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Practical Assignments</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Execute real commands on your own Linux environment or authorized lab, verify
          expected outcomes, and track your completion status.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={cat === "all" ? "/assignments" : `/assignments?category=${cat}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              category === cat
                ? "bg-[#173D35] text-[#A3E635] border border-[#2B5E52]"
                : "border border-[#303A44] bg-[#171D23] text-[#AAB4BE] hover:text-[#F3F4F6]"
            }`}
          >
            {cat === "all" ? "All Categories" : cat.replace("-", " ")}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 text-sm text-[#AAB4BE]">
          No practical assignments match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((assignment) => {
            const st = statusMap.get(assignment.id);
            return (
              <Link
                key={assignment.id}
                href={`/assignments/${assignment.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
              >
                <div>
                  <div className="text-xs text-[#7B8794] capitalize">
                    {assignment.category} · {assignment.difficulty}
                    {st ? ` · ${st.replace("_", " ")}` : ""}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#F3F4F6] group-hover:text-[#A3E635]">
                    {assignment.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#AAB4BE]">{assignment.objective}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#262F38] pt-4 text-xs">
                  <span className="text-[#7B8794]">Local execution · Self-verified</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#A3E635]">
                    Open Task <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
