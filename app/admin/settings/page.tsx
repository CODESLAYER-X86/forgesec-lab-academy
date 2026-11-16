import {
  getAdminEmails,
  getSiteUrl,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { requireFullAdmin } from "@/modules/auth/session";
import {
  getGlossaryItems,
  getPublishedLearningPaths,
  getPublishedLessons,
  getPublishedResources,
  getPublishedWriteups,
} from "@/modules/content/loader";

export const metadata = {
  title: "Platform Settings | FORGESEC Admin",
};

export default async function AdminSettingsPage() {
  await requireFullAdmin();

  const supabaseConfigured = isSupabaseConfigured();
  const serviceRoleConfigured = isSupabaseAdminConfigured();
  const adminEmails = getAdminEmails();
  const siteUrl = getSiteUrl();

  const lessons = getPublishedLessons();
  const paths = getPublishedLearningPaths();
  const writeups = getPublishedWriteups();
  const resources = getPublishedResources();
  const glossary = getGlossaryItems();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Environment & Pipeline
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          Platform Settings
        </h1>
        <p className="text-sm text-[#AAB4BE]">
          Read-only runtime diagnostics for authentication, database connectivity, and content indexing.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#F3F4F6]">Backend & Auth Mode</h2>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Active Runtime</dt>
              <dd className="font-mono text-[#A3E635]">
                {supabaseConfigured ? "Supabase PostgreSQL + Google OAuth" : "Local Preview Fallback"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Service Role Key</dt>
              <dd className="font-mono text-[#F3F4F6]">
                {serviceRoleConfigured ? "Configured" : "Not set"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Canonical Site URL</dt>
              <dd className="font-mono text-[#AAB4BE]">{siteUrl}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#F3F4F6]">Static MDX Content Inventory</h2>
          <dl className="space-y-2 text-xs tabular-nums">
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Published Lessons</dt>
              <dd className="font-mono text-[#F3F4F6]">{lessons.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Learning Paths</dt>
              <dd className="font-mono text-[#F3F4F6]">{paths.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Write-Ups & Guides</dt>
              <dd className="font-mono text-[#F3F4F6]">
                {writeups.length} write-ups · {resources.length} resources
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#7B8794]">Glossary Terms</dt>
              <dd className="font-mono text-[#F3F4F6]">{glossary.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[#F3F4F6]">Permanent Admin Allowlist</h2>
        <p className="text-xs text-[#AAB4BE]">
          Configured via the server environment variable{" "}
          <code className="font-mono text-[#F3F4F6]">ADMIN_EMAILS</code>.
        </p>
        <div className="flex flex-wrap gap-4 font-mono text-xs text-[#A3E635]">
          {adminEmails.map((email) => (
            <span key={email}>{email}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
