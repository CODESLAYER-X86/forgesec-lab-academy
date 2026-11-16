import Link from "next/link";
import { getAllUsersForAdmin } from "@/modules/admin/service";
import { requireFullAdmin } from "@/modules/auth/session";

export const metadata = {
  title: "Users | FORGESEC Admin",
};

export default async function AdminUsersPage() {
  await requireFullAdmin();
  const users = await getAllUsersForAdmin();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Access Control
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">Users</h1>
        <p className="text-sm text-[#AAB4BE]">
          Review student, instructor, and permanent administrator accounts.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#262F38] text-xs uppercase tracking-wider text-[#7B8794]">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Capabilities</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262F38]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#202831]/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#F3F4F6]">{u.displayName}</div>
                  <div className="text-xs text-[#7B8794]">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-xs capitalize text-[#F3F4F6]">
                  {u.role}
                  {u.isPermanentAdmin ? (
                    <span className="text-[#A3E635]"> · allowlist</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-[#AAB4BE]">
                  {[
                    u.canManageQuizzes ? "Quizzes" : null,
                    u.canManageAssignments ? "Assignments" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Standard access"}
                </td>
                <td className="px-4 py-3 text-xs capitalize text-[#AAB4BE]">
                  {u.accountStatus.replace("_", " ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs font-medium text-[#A3E635] hover:underline"
                  >
                    Edit permissions
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
