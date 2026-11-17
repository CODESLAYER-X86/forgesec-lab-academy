import { requireUser } from "@/modules/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  DashboardSidebarNav,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-sidebar-nav";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/learning", label: "Learning Paths" },
  { href: "/dashboard/bookmarks", label: "Bookmarks" },
  { href: "/dashboard/history", label: "Activity History" },
  { href: "/dashboard/quiz-results", label: "Quiz Results" },
  { href: "/dashboard/assignments", label: "Assignments" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const showAdmin = user.role === "admin" || user.role === "instructor";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 space-y-5">
            <div className="border-b border-[#262F38] pb-4">
              <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                {user.displayName}
              </div>
              <div className="mt-0.5 text-xs text-[#7B8794] truncate">{user.email}</div>
              <div className="mt-1 text-xs text-[#A3E635] capitalize">
                {user.role} · {user.authMode} mode
              </div>
            </div>

            <DashboardSidebarNav items={NAV_ITEMS} showAdmin={showAdmin} />

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
