import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLayout } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FORGESEC ACADEMY collects, minimizes, and protects student account data.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      updatedAt="2026-11-15"
      summary="FORGESEC ACADEMY practices strict data minimization: public content requires no account, and authenticated accounts store only essential learning and identity fields."
    >
      <h2>1. Data Collected</h2>
      <ul>
        <li>Identity information provided via Google OAuth (email address, display name, optional profile image).</li>
        <li>Learning records you actively create: lesson completions, bookmarks, quiz attempts, and practical assignment statuses.</li>
        <li>Administrative audit logs recording role and assessment changes for security accountability.</li>
      </ul>

      <h2>2. Third-Party Processors</h2>
      <p>
        Authentication and database persistence operate via Google OAuth and Supabase PostgreSQL.
        No third-party advertising trackers or behavioral analytics scripts are loaded.
      </p>

      <h2>3. Retention &amp; Account Deletion</h2>
      <p>
        Signed-in students can review their profile and submit an account deletion request at
        any time inside{" "}
        <Link href="/dashboard/settings" className="text-[#A3E635] underline">
          Dashboard Settings
        </Link>
        .
      </p>
    </PolicyLayout>
  );
}
