import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function DashboardProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Student Profile</h1>
          <p className="mt-1 text-sm text-[#AAB4BE]">
            Identity managed via Google OAuth and stored with strict data minimization.
          </p>
        </div>
        <Link
          href="/dashboard/profile/edit"
          className="inline-flex h-9 items-center rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418]"
        >
          Edit Profile
        </Link>
      </header>

      <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <div className="text-xs text-[#7B8794]">Display Name</div>
            <div className="mt-1 font-medium text-[#F3F4F6]">{user.displayName}</div>
          </div>
          <div>
            <div className="text-xs text-[#7B8794]">Email</div>
            <div className="mt-1 font-mono text-[#E5E7EB]">{user.email}</div>
          </div>
          <div>
            <div className="text-xs text-[#7B8794]">Role</div>
            <div className="mt-1 capitalize font-medium text-[#F3F4F6]">
              {user.role}
              {user.isPermanentAdmin ? " (Permanent Env Admin)" : ""}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#7B8794]">Account Status</div>
            <div className="mt-1 capitalize text-[#E5E7EB]">
              {user.accountStatus.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="border-t border-[#262F38] pt-4">
          <div className="text-xs text-[#7B8794]">Biography</div>
          <p className="mt-1 text-sm text-[#AAB4BE]">
            {user.bio || "No biography added yet."}
          </p>
        </div>

        <div className="border-t border-[#262F38] pt-4">
          <div className="text-xs text-[#7B8794]">Learning Interests</div>
          <p className="mt-1 text-sm text-[#AAB4BE]">
            {user.interests.length > 0 ? user.interests.join(" · ") : "None specified"}
          </p>
        </div>
      </div>
    </div>
  );
}
