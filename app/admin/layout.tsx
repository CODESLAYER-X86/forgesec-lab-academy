import { Shield } from "lucide-react";
import {
  AdminSidebarNav,
  type AdminNavItem,
} from "@/components/admin/admin-sidebar-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  canManageAssignments,
  canManageQuizzes,
  canManageUsers,
} from "@/modules/auth/guards";
import { requireAdminConsoleAccess } from "@/modules/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminConsoleAccess();
  const isFullAdmin = canManageUsers(user);
  const showQuizzes = canManageQuizzes(user);
  const showAssignments = canManageAssignments(user);

  const navItems: AdminNavItem[] = [
    { href: "/admin", label: "Overview", icon: "overview" as const, visible: true },
    { href: "/admin/users", label: "Users", icon: "users" as const, visible: isFullAdmin },
    { href: "/admin/permissions", label: "Permissions", icon: "permissions" as const, visible: isFullAdmin },
    { href: "/admin/quizzes", label: "Quizzes", icon: "quizzes" as const, visible: showQuizzes },
    {
      href: "/admin/assignments",
      label: "Assignments",
      icon: "assignments" as const,
      visible: showAssignments,
    },
    { href: "/admin/analytics", label: "Analytics", icon: "analytics" as const, visible: isFullAdmin },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: "audit-logs" as const, visible: isFullAdmin },
    { href: "/admin/settings", label: "Settings", icon: "settings" as const, visible: isFullAdmin },
  ]
    .filter((item) => item.visible)
    .map(({ href, label, icon }) => ({ href, label, icon }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside>
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 space-y-5">
            <div className="border-b border-[#262F38] pb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A3E635]">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Admin Console</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[#F3F4F6] truncate">
                {user.displayName}
              </div>
              <div className="mt-0.5 text-xs text-[#7B8794] truncate">{user.email}</div>
              <div className="mt-1 text-xs text-[#AAB4BE] capitalize">
                {user.role}
                {user.isPermanentAdmin ? " · permanent allowlist" : ""} · {user.authMode}
              </div>
            </div>

            <AdminSidebarNav items={navItems} />

            <div className="border-t border-[#262F38] pt-3">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
