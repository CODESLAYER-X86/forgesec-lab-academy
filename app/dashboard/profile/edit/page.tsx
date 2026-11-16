import type { Metadata } from "next";
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form";
import { requireUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default async function DashboardProfileEditPage() {
  const user = await requireUser();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">Edit Profile</h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Update your display name, short biography, and learning interests.
        </p>
      </header>

      <ProfileEditForm
        initialDisplayName={user.displayName}
        initialBio={user.bio}
        initialInterests={user.interests}
      />
    </div>
  );
}
