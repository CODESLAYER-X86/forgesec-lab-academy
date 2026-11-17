"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export type AdminNavIconName =
  | "overview"
  | "users"
  | "permissions"
  | "quizzes"
  | "assignments"
  | "analytics"
  | "audit-logs"
  | "settings";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: AdminNavIconName;
}

function renderIcon(name: AdminNavIconName, active: boolean) {
  const className = `h-3.5 w-3.5 shrink-0 ${
    active ? "text-[#A3E635]" : "text-[#7B8794]"
  }`;
  switch (name) {
    case "overview":
      return <LayoutDashboard className={className} aria-hidden="true" />;
    case "users":
      return <Users className={className} aria-hidden="true" />;
    case "permissions":
      return <KeyRound className={className} aria-hidden="true" />;
    case "quizzes":
      return <CheckSquare className={className} aria-hidden="true" />;
    case "assignments":
      return <ClipboardCheck className={className} aria-hidden="true" />;
    case "analytics":
      return <BarChart3 className={className} aria-hidden="true" />;
    case "audit-logs":
      return <Activity className={className} aria-hidden="true" />;
    case "settings":
      return <Settings className={className} aria-hidden="true" />;
  }
}

export function AdminSidebarNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();
  const [pendingNav, setPendingNav] = useState<{ target: string; fromPath: string } | null>(null);

  const effectivePath =
    pendingNav && pendingNav.fromPath === pathname ? pendingNav.target : pathname;

  return (
    <nav aria-label="Admin console navigation" className="space-y-1">
      {items.map((item) => {
        const isActive =
          item.href === "/admin"
            ? effectivePath === "/admin"
            : effectivePath === item.href || effectivePath.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setPendingNav({ target: item.href, fromPath: pathname })}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium active:scale-[0.98] transition-all ${
              isActive
                ? "bg-[#202831] text-[#F3F4F6] border border-[#303A44]"
                : "text-[#AAB4BE] border border-transparent hover:bg-[#202831]/60 hover:text-[#F3F4F6]"
            }`}
          >
            {renderIcon(item.icon, isActive)}
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link
        href="/dashboard"
        onClick={() => setPendingNav({ target: "/dashboard", fromPath: pathname })}
        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#A3E635] hover:bg-[#202831]/60 active:scale-[0.98] transition-all"
      >
        <span>Student View</span>
      </Link>
    </nav>
  );
}
