"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SessionUser } from "@/lib/types/domain";

export function LoginPanel({
  supabaseEnabled,
  previewEnabled,
  demoUsers,
  currentUser,
  nextPath,
  initialError,
}: {
  supabaseEnabled: boolean;
  previewEnabled: boolean;
  demoUsers: SessionUser[];
  currentUser: SessionUser | null;
  nextPath: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    initialError === "account_inactive"
      ? "This account is deactivated or pending deletion and cannot access member tools."
      : initialError === "auth_callback_failed"
      ? "Authentication callback failed. Please try signing in again."
      : null
  );

  const handleGoogleLogin = async () => {
    setError(null);
    setLoadingId("google");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setLoadingId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth sign-in failed.");
      setLoadingId(null);
    }
  };

  const handlePreviewSignIn = async (userId: string) => {
    setError(null);
    setLoadingId(userId);
    const res = await fetch("/api/auth/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", userId }),
    });
    if (!res.ok) {
      setError("Failed to start preview session.");
      setLoadingId(null);
      return;
    }
    window.location.assign(nextPath);
  };

  const handleLogout = async () => {
    setLoadingId("logout");
    await fetch("/api/auth/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.assign("/");
  };

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[#303A44] bg-[#171D23] p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">
          Sign in to FORGESEC ACADEMY
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
          Authentication uses Google OAuth exclusively—no custom passwords to manage.
          Your public reading experience remains open without an account.
        </p>
      </div>

      {currentUser ? (
        <div className="rounded-lg border border-[#303A44] bg-[#101418] p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#F3F4F6]">
            <UserCheck className="h-4 w-4 text-[#22C55E]" />
            <span>Signed in as {currentUser.displayName}</span>
          </div>
          <div className="text-xs text-[#AAB4BE]">
            {currentUser.email} · Role: <span className="capitalize">{currentUser.role}</span>
            {currentUser.accountStatus !== "active" ? (
              <span className="text-[#F59E0B]">
                {" "}
                · Status: {currentUser.accountStatus.replace("_", " ")}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            {currentUser.accountStatus === "active" ? (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="h-9 rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418]"
              >
                Open Dashboard
              </button>
            ) : null}
            <button
              type="button"
              disabled={loadingId === "logout"}
              onClick={handleLogout}
              className="h-9 rounded-lg border border-[#303A44] px-4 text-xs font-medium text-[#AAB4BE] hover:text-[#F3F4F6]"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : null}

      {supabaseEnabled ? (
        <button
          type="button"
          disabled={loadingId === "google"}
          onClick={handleGoogleLogin}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#A3E635] px-5 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] disabled:opacity-60 transition-colors"
        >
          <span>{loadingId === "google" ? "Redirecting to Google..." : "Continue with Google"}</span>
        </button>
      ) : previewEnabled ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#2B4358] bg-[#131C26] p-4 text-xs leading-relaxed text-[#BAE6FD]">
            <div className="flex items-center gap-2 font-semibold">
              <Shield className="h-4 w-4 shrink-0" />
              <span>Local Preview Authentication Mode</span>
            </div>
            <p className="mt-1.5 text-[#D1D5DB]">
              Supabase environment credentials are not configured yet, so local preview accounts
              are active. Add Supabase keys in environment configuration to switch to live Google OAuth.
            </p>
          </div>

          <div className="space-y-2.5">
            {demoUsers.map((demo) => (
              <button
                key={demo.id}
                type="button"
                disabled={loadingId === demo.id}
                onClick={() => handlePreviewSignIn(demo.id)}
                className="flex w-full items-center justify-between rounded-lg border border-[#303A44] bg-[#101418] px-4 py-3 text-left hover:border-[#A3E635] transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-[#F3F4F6]">
                    {demo.displayName}
                  </div>
                  <div className="text-xs text-[#AAB4BE]">
                    {demo.email} · <span className="capitalize">{demo.role}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#A3E635]">
                  {loadingId === demo.id ? "Signing in..." : "Sign In"}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#F59E0B]/40 bg-[#211A11] p-4 text-xs leading-relaxed text-[#FDE68A]">
          Authentication is unavailable because Supabase credentials are not configured for this
          production deployment. Public learning paths and lessons remain accessible without login.
        </div>
      )}

      {error ? <p className="text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  );
}
