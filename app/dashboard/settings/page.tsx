import type { Metadata } from "next";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { requireUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function DashboardSettingsPage() {
  const user = await requireUser();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">Account Settings</h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Review authentication method and privacy/data deletion options.
        </p>
      </header>

      <SettingsPanel
        accountStatus={user.accountStatus}
        deletionRequestedAt={user.deletionRequestedAt}
        isPermanentAdmin={user.isPermanentAdmin}
      />
    </div>
  );
}
