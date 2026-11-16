import Link from "next/link";
import {
  Activity,
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react";
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

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, visible: true },
    { href: "/admin/users", label: "Users", icon: Users, visible: isFullAdmin },
    { href: "/admin/permissions", label: "Permissions", icon: KeyRound, visible: isFullAdmin },
    { href: "/admin/quizzes", label: "Quizzes", icon: CheckSquare, visible: showQuizzes },
    {
      href: "/admin/assignments",
      label: "Assignments",
      icon: ClipboardCheck,
      visible: showAssignments,
    },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, visible: isFullAdmin },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity, visible: isFullAdmin },
    { href: "/admin/settings", label: "Settings", icon: Settings, visible: isFullAdmin },
  ].filter((item) => item.visible);

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

            <nav aria-label="Admin console navigation" className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6] transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#7B8794]" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#A3E635] hover:bg-[#202831] transition-colors"
              >
                <span>Student View</span>
              </Link>
            </nav>

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
