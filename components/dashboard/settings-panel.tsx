"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletionAction } from "@/app/actions/learning";

export function SettingsPanel({
  accountStatus,
  deletionRequestedAt,
  isPermanentAdmin,
}: {
  accountStatus: string;
  deletionRequestedAt?: string;
  isPermanentAdmin: boolean;
}) {
  const [status, setStatus] = useState(accountStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRequestDeletion = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await requestAccountDeletionAction();
      if (!res.ok) {
        setMessage(res.error ?? "Unable to submit request.");
        return;
      }
      setStatus("deletion_requested");
      setMessage("Account deletion request recorded.");
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-2">
        <h2 className="text-base font-semibold text-[#F3F4F6]">Authentication Provider</h2>
        <p className="text-sm text-[#AAB4BE]">
          FORGESEC ACADEMY uses Google OAuth exclusively—there is no local password or
          password-reset workflow to maintain.
        </p>
      </section>

      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#F3F4F6]">Account Deletion Request</h2>
          <p className="mt-1 text-sm text-[#AAB4BE]">
            Request removal of your student profile, progress records, bookmarks, and quiz
            attempt history under our privacy policy.
          </p>
        </div>

        {status === "deletion_requested" ? (
          <div className="rounded-lg border border-[#F59E0B]/40 bg-[#211A11] p-4 text-xs text-[#FDE68A]">
            Deletion request submitted{deletionRequestedAt ? ` on ${deletionRequestedAt.slice(0, 10)}` : ""}. An administrator will process final removal.
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending || isPermanentAdmin}
            onClick={handleRequestDeletion}
            className="h-10 rounded-lg border border-[#EF4444]/50 bg-[#251315] px-4 text-xs font-semibold text-[#FCA5A5] hover:bg-[#33191C] disabled:opacity-50"
          >
            {isPermanentAdmin
              ? "Disabled for Permanent Admin"
              : isPending
              ? "Submitting..."
              : "Request Account Deletion"}
          </button>
        )}

        {message ? <p className="text-xs text-[#AAB4BE]">{message}</p> : null}
      </section>
    </div>
  );
}
