"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthSession } from "@/components/auth/auth-session-provider";

export function StudentInvitationCard() {
  const { user } = useAuthSession();

  return (
    <div className="flex flex-col justify-between gap-6 rounded-xl border border-[#303A44] bg-[#171D23] p-6 sm:flex-row sm:items-center sm:p-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#A3E635]">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>Track Progress Across Sessions</span>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-[#F3F4F6]">
          {user
            ? `Welcome back, ${user.displayName}`
            : "Create your student learning workspace"}
        </h2>
        <p className="mt-1.5 text-sm text-[#AAB4BE]">
          {user
            ? "Resume your next incomplete module, review quiz results, and track practical assignments."
            : "Sign in with Google to keep your completed modules, bookmarks, and quiz attempt history synced."}
        </p>
      </div>
      <Link
        href={user ? "/dashboard" : "/login"}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#A3E635] px-6 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] active:scale-[0.98] transition-all whitespace-nowrap"
      >
        <span>{user ? "Open Dashboard" : "Continue with Google"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
