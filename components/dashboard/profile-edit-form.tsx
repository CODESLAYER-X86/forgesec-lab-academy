"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions/learning";
import { useAuthSession } from "@/components/auth/auth-session-provider";

export function ProfileEditForm({
  initialDisplayName,
  initialBio,
  initialInterests,
}: {
  initialDisplayName: string;
  initialBio: string;
  initialInterests: string[];
}) {
  const router = useRouter();
  const { refreshSession } = useAuthSession();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [interests, setInterests] = useState(initialInterests.join(", "));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfileAction({ displayName, bio, interests });
      if (!res.ok) {
        setMessage(res.error ?? "Failed to update profile.");
        return;
      }
      await refreshSession();
      router.push("/dashboard/profile");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-5"
    >
      <div>
        <label htmlFor="displayName" className="block text-xs font-medium text-[#AAB4BE]">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          required
          minLength={2}
          maxLength={60}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-xs font-medium text-[#AAB4BE]">
          Short Biography
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={400}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#303A44] bg-[#101418] p-3 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="interests" className="block text-xs font-medium text-[#AAB4BE]">
          Learning Interests (comma-separated)
        </label>
        <input
          id="interests"
          type="text"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="Linux, Networking, Web Security"
          className="mt-1.5 h-10 w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
        />
      </div>

      {message ? <p className="text-xs text-[#EF4444]">{message}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg bg-[#A3E635] px-5 text-xs font-semibold text-[#101418] hover:bg-[#B4F04E] disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/profile")}
          className="h-10 rounded-lg border border-[#303A44] px-4 text-xs font-medium text-[#AAB4BE] hover:text-[#F3F4F6]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
