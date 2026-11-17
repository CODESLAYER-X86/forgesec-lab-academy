"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface DashboardNavItem {
  href: string;
  label: string;
}

export function DashboardSidebarNav({
  items,
  showAdmin,
}: {
  items: DashboardNavItem[];
  showAdmin: boolean;
}) {
  const pathname = usePathname();
  const [pendingNav, setPendingNav] = useState<{ target: string; fromPath: string } | null>(null);

  const effectivePath =
    pendingNav && pendingNav.fromPath === pathname ? pendingNav.target : pathname;

  return (
    <nav aria-label="Student dashboard navigation" className="space-y-1">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? effectivePath === "/dashboard"
            : effectivePath === item.href || effectivePath.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setPendingNav({ target: item.href, fromPath: pathname })}
            aria-current={isActive ? "page" : undefined}
            className={`block rounded-md px-3 py-2 text-xs font-medium active:scale-[0.98] transition-all ${
              isActive
                ? "bg-[#202831] text-[#F3F4F6] border border-[#303A44]"
                : "text-[#AAB4BE] border border-transparent hover:bg-[#202831]/60 hover:text-[#F3F4F6]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      {showAdmin ? (
        <Link
          href="/admin"
          onClick={() => setPendingNav({ target: "/admin", fromPath: pathname })}
          className="block rounded-md px-3 py-2 text-xs font-semibold text-[#A3E635] hover:bg-[#202831]/60 active:scale-[0.98] transition-all"
        >
          Admin Console
        </Link>
      ) : null}
    </nav>
  );
}
