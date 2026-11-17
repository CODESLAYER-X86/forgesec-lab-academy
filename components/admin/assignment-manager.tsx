"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import {
  createAssignmentAction,
  toggleAssignmentStatusAction,
} from "@/app/actions/admin";
import type { AssignmentStatus, PracticalAssignment } from "@/lib/types/domain";

interface AssignmentManagerProps {
  assignments: PracticalAssignment[];
}

export function AssignmentManager({ assignments }: AssignmentManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, { status: AssignmentStatus; baseStatus: AssignmentStatus }>
  >({});
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayAssignments = assignments.map((a) => {
    const ov = optimisticStatuses[a.id];
    return ov && ov.baseStatus === a.status ? { ...a, status: ov.status } : a;
  });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [objective, setObjective] = useState("");
  const [category, setCategory] = useState("linux");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [prerequisites, setPrerequisites] = useState("");
  const [instructions, setInstructions] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [safetyWarning, setSafetyWarning] = useState(
    "Execute only inside an isolated personal VM or non-production lab workspace."
  );
  const [status, setStatus] = useState<AssignmentStatus>("published");
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = async (assignmentId: string, nextStatus: AssignmentStatus) => {
    const serverAssignment = assignments.find((a) => a.id === assignmentId);
    const baseStatus = serverAssignment?.status ?? nextStatus;
    setBusyId(assignmentId);
    setError(null);
    setOptimisticStatuses((prev) => ({
      ...prev,
      [assignmentId]: { status: nextStatus, baseStatus },
    }));

    const res = await toggleAssignmentStatusAction(assignmentId, nextStatus);
    setBusyId(null);
    if (!res.ok) {
      setOptimisticStatuses((prev) => {
        const next = { ...prev };
        delete next[assignmentId];
        return next;
      });
      setError(res.error ?? "Unable to update assignment status.");
      return;
    }
    startTransition(() => {
      router.refresh();
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await createAssignmentAction({
      title,
      slug,
      objective,
      category,
      difficulty,
      prerequisites,
      instructions,
      expectedOutcome,
      safetyWarning,
      status,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error ?? "Failed to create assignment.");
      return;
    }

    setTitle("");
    setSlug("");
    setObjective("");
    setPrerequisites("");
    setInstructions("");
    setExpectedOutcome("");
    setShowCreate(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#AAB4BE] tabular-nums">
          {displayAssignments.length} practical assignments configured
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#A3E635] px-4 py-2 text-xs font-semibold text-[#101418] hover:bg-[#bef264] transition-colors whitespace-nowrap"
        >
          {showCreate ? (
            <>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Assignment</span>
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs text-[#FCA5A5]">
          {error}
        </div>
      ) : null}

      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-[#F3F4F6]">
            Create Practical Assignment
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-title">
                Assignment Title
              </label>
              <input
                id="assign-title"
                required
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (!slug) {
                    setSlug(
                      val
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    );
                  }
                }}
                placeholder="Inspect Listening Sockets with ss"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-slug">
                URL Slug
              </label>
              <input
                id="assign-slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="inspect-listening-sockets-ss"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm font-mono text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-objective">
              Objective
            </label>
            <textarea
              id="assign-objective"
              required
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Audit open TCP/UDP sockets on a local Linux host and identify owning PIDs."
              className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-category">
                Category
              </label>
              <input
                id="assign-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-difficulty">
                Difficulty
              </label>
              <select
                id="assign-difficulty"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")
                }
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-status">
                Initial Status
              </label>
              <select
                id="assign-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-prereq">
                Prerequisites (one per line)
              </label>
              <textarea
                id="assign-prereq"
                required
                rows={3}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder={"Local Ubuntu VM\niproute2 package installed"}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-steps">
                Step-by-step Instructions (one per line)
              </label>
              <textarea
                id="assign-steps"
                required
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={"Run ss -tulnp in your terminal\nIdentify each loopback listener"}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-outcome">
                Expected Outcome
              </label>
              <input
                id="assign-outcome"
                required
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="You can map every open port to its owning service."
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="assign-safety">
                Safety Warning
              </label>
              <input
                id="assign-safety"
                required
                value={safetyWarning}
                onChange={(e) => setSafetyWarning(e.target.value)}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#A3E635] px-4 py-2 text-xs font-semibold text-[#101418] hover:bg-[#bef264] disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#262F38] text-xs uppercase tracking-wider text-[#7B8794]">
            <tr>
              <th className="px-4 py-3 font-medium">Assignment</th>
              <th className="px-4 py-3 font-medium">Metadata</th>
              <th className="px-4 py-3 font-medium">Steps</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262F38]">
            {displayAssignments.map((item) => (
              <tr key={item.id} className="hover:bg-[#202831]/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#F3F4F6]">{item.title}</div>
                  <div className="text-xs font-mono text-[#7B8794]">/assignments/{item.slug}</div>
                </td>
                <td className="px-4 py-3 text-xs text-[#AAB4BE] capitalize">
                  {item.category} · {item.difficulty}
                </td>
                <td className="px-4 py-3 text-xs tabular-nums text-[#F3F4F6]">
                  {item.instructions.length}
                </td>
                <td className="px-4 py-3 text-xs capitalize">
                  <span
                    className={
                      item.status === "published"
                        ? "text-[#A3E635]"
                        : item.status === "draft"
                        ? "text-[#F59E0B]"
                        : "text-[#7B8794]"
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3 text-xs">
                    {item.status !== "published" ? (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleStatusChange(item.id, "published")}
                        className="font-medium text-[#A3E635] hover:underline disabled:opacity-50"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleStatusChange(item.id, "draft")}
                        className="font-medium text-[#AAB4BE] hover:text-[#F3F4F6] disabled:opacity-50"
                      >
                        Unpublish
                      </button>
                    )}
                    {item.status !== "archived" ? (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleStatusChange(item.id, "archived")}
                        className="font-medium text-[#7B8794] hover:text-[#F3F4F6] disabled:opacity-50"
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
