"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import type { PracticalAssignment } from "@/lib/types/domain";

const CATEGORIES = ["all", "linux", "networking", "web-security"] as const;

export function AssignmentsExplorer({
  assignments,
}: {
  assignments: PracticalAssignment[];
}) {
  const { assignmentProgressById } = useAuthSession();
  const [category, setCategory] = useState<string>("all");

  const filtered =
    category === "all"
      ? assignments
      : assignments.filter((a) => a.category === category);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              category === cat
                ? "bg-[#173D35] text-[#A3E635] border border-[#2B5E52]"
                : "border border-[#303A44] bg-[#171D23] text-[#AAB4BE] hover:text-[#F3F4F6]"
            }`}
          >
            {cat === "all" ? "All Categories" : cat.replace("-", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 text-sm text-[#AAB4BE]">
          No practical assignments match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((assignment) => {
            const st = assignmentProgressById[assignment.id]?.status;
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
    </>
  );
}
