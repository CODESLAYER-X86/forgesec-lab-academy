import Link from "next/link";
import { getAdminEmails } from "@/lib/env";
import { getAllUsersForAdmin } from "@/modules/admin/service";
import { requireFullAdmin } from "@/modules/auth/session";

export const metadata = {
  title: "Permissions | FORGESEC Admin",
};

export default async function AdminPermissionsPage() {
  await requireFullAdmin();
  const users = await getAllUsersForAdmin();
  const adminEmails = getAdminEmails();
  const elevated = users.filter((u) => u.role === "admin" || u.role === "instructor");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Governance
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          Roles & Permissions Matrix
        </h1>
        <p className="text-sm text-[#AAB4BE]">
          Permanent admins from environment allowlists and delegated instructors.
        </p>
      </header>

      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[#F3F4F6]">Permanent Admin Allowlist</h2>
        <p className="text-xs text-[#AAB4BE]">
          Accounts matching <code className="font-mono text-[#F3F4F6]">ADMIN_EMAILS</code> always
          retain full administrative authority and cannot be demoted in the UI.
        </p>
        <ul className="space-y-1 text-xs font-mono text-[#A3E635]">
          {adminEmails.map((email) => (
            <li key={email}>{email}</li>
          ))}
        </ul>
      </section>

      <section className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#262F38] text-xs uppercase tracking-wider text-[#7B8794]">
            <tr>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Quiz Management</th>
              <th className="px-4 py-3 font-medium">Assignment Management</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262F38]">
            {elevated.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-[#F3F4F6]">{u.displayName}</div>
                  <div className="text-xs text-[#7B8794]">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-xs capitalize text-[#F3F4F6]">
                  {u.role}
                  {u.isPermanentAdmin ? " (permanent)" : ""}
                </td>
                <td className="px-4 py-3 text-xs text-[#AAB4BE]">
                  {u.canManageQuizzes ? "Enabled" : "Disabled"}
                </td>
                <td className="px-4 py-3 text-xs text-[#AAB4BE]">
                  {u.canManageAssignments ? "Enabled" : "Disabled"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs font-medium text-[#A3E635] hover:underline"
                  >
                    Configure
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
