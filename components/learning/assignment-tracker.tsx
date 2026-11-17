"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { updateAssignmentStatusAction } from "@/app/actions/learning";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import type { AssignmentProgressStatus } from "@/lib/types/domain";

const STATUS_OPTIONS: Array<{
  value: AssignmentProgressStatus;
  label: string;
}> = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function AssignmentTracker({
  assignmentId,
  slug,
  initialStatus,
  initialNotes,
  isAuthenticated,
}: {
  assignmentId: string;
  slug: string;
  initialStatus?: AssignmentProgressStatus;
  initialNotes?: string;
  isAuthenticated?: boolean;
}) {
  const { user, assignmentProgressById, setAssignmentProgressOptimistic } =
    useAuthSession();

  const resolvedAuth = isAuthenticated ?? Boolean(user);
  const hydrated = assignmentProgressById[assignmentId];

  const [draftStatus, setDraftStatus] = useState<AssignmentProgressStatus | null>(null);
  const [draftNotes, setDraftNotes] = useState<string | null>(null);
  const status = draftStatus ?? initialStatus ?? hydrated?.status ?? "not_started";
  const notes = draftNotes ?? initialNotes ?? hydrated?.notes ?? "";

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const saveUpdate = (nextStatus: AssignmentProgressStatus) => {
    if (!resolvedAuth) {
      setFeedback("Sign in to save practical assignment progress.");
      return;
    }
    const prevStatus = status;
    setDraftStatus(nextStatus);
    setAssignmentProgressOptimistic(assignmentId, { status: nextStatus, notes });
    setFeedback(null);
    startTransition(async () => {
      const res = await updateAssignmentStatusAction({
        assignmentId,
        slug,
        status: nextStatus,
        notes,
      });
      if (!res.ok) {
        setDraftStatus(prevStatus);
        setAssignmentProgressOptimistic(assignmentId, { status: prevStatus, notes });
        setFeedback(res.error ?? "Failed to save status.");
      } else {
        setDraftStatus(null);
        setFeedback("Progress saved.");
      }
    });
  };

  return (
    <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#F3F4F6]">
            Self-Verified Completion Status
          </h3>
          <p className="mt-0.5 text-xs text-[#AAB4BE]">
            Run the instructions on your own machine or authorized lab, then record your status.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-medium">
          {status === "completed" ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <span className="text-[#BBF7D0]">Completed</span>
            </>
          ) : status === "in_progress" ? (
            <>
              <Clock className="h-4 w-4 text-[#F59E0B]" />
              <span className="text-[#FDE68A]">In Progress</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 text-[#7B8794]" />
              <span className="text-[#AAB4BE]">Not Started</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isPending}
            onClick={() => saveUpdate(opt.value)}
            className={`h-9 rounded-lg px-3.5 text-xs font-semibold active:scale-[0.98] transition-all whitespace-nowrap ${
              status === opt.value
                ? "bg-[#A3E635] text-[#101418]"
                : "border border-[#303A44] bg-[#101418] text-[#AAB4BE] hover:text-[#F3F4F6]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="assignment-notes" className="block text-xs font-medium text-[#AAB4BE]">
          Personal Verification Notes (optional)
        </label>
        <textarea
          id="assignment-notes"
          rows={3}
          value={notes}
          onChange={(e) => setDraftNotes(e.target.value)}
          placeholder="Record observed output, flags tested, or environment notes..."
          className="mt-1.5 w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] placeholder-[#64748B] focus:border-[#A3E635] focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          {feedback ? (
            <span className="text-xs text-[#AAB4BE]">
              {feedback}{" "}
              {!resolvedAuth ? (
                <Link href="/login" className="text-[#A3E635] underline">
                  Login
                </Link>
              ) : null}
            </span>
          ) : (
            <span className="text-xs text-[#7B8794]">
              Notes are private to your account.
            </span>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => saveUpdate(status)}
            className="h-8 rounded-md border border-[#303A44] bg-[#202831] px-3 text-xs font-medium text-[#F3F4F6] hover:border-[#4B5866] active:scale-[0.98] transition-all"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
