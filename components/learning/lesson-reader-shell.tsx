"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, ListTree } from "lucide-react";
import type { TocHeading } from "@/modules/content/loader";

export interface PathNavItem {
  id: string;
  slug: string;
  title: string;
  moduleNumber: number;
  completed: boolean;
}

export function LessonReaderShell({
  pathTitle,
  pathSlug,
  currentLessonId,
  pathItems,
  headings,
  estimatedMinutes,
  children,
}: {
  pathTitle: string;
  pathSlug: string;
  currentLessonId: string;
  pathItems: PathNavItem[];
  headings: TocHeading[];
  estimatedMinutes: number;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Mobile curriculum toggle */}
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen((p) => !p)}
          className="flex w-full items-center justify-between rounded-lg border border-[#303A44] bg-[#171D23] px-4 py-3 text-sm font-medium text-[#F3F4F6]"
        >
          <span>{pathTitle} Curriculum</span>
          {mobileNavOpen ? (
            <ChevronDown className="h-4 w-4 text-[#AAB4BE]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#AAB4BE]" />
          )}
        </button>
        {mobileNavOpen ? (
          <nav
            aria-label="Course modules"
            className="mt-2 rounded-lg border border-[#303A44] bg-[#171D23] p-3 space-y-1"
          >
            {pathItems.map((item) => {
              const active = item.id === currentLessonId;
              return (
                <Link
                  key={item.id}
                  href={`/learn/lessons/${item.slug}`}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-[#173D35] text-[#A3E635] font-semibold"
                      : "text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-[#52606D]" />
                  )}
                  <span className="truncate">
                    {String(item.moduleNumber).padStart(2, "0")}. {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)_220px]">
        {/* Left Sidebar: Path Curriculum */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-[#303A44] bg-[#171D23] p-4">
            <Link
              href={`/learn/paths/${pathSlug}`}
              className="text-xs font-semibold text-[#A3E635] hover:underline"
            >
              {pathTitle}
            </Link>
            <div className="mt-1 text-xs text-[#7B8794] tabular-nums">
              {pathItems.filter((i) => i.completed).length} of {pathItems.length} completed
            </div>

            <nav aria-label="Module curriculum" className="mt-4 space-y-1">
              {pathItems.map((item) => {
                const active = item.id === currentLessonId;
                return (
                  <Link
                    key={item.id}
                    href={`/learn/lessons/${item.slug}`}
                    className={`flex items-start gap-2 rounded-md px-2.5 py-2 text-xs leading-snug transition-colors ${
                      active
                        ? "bg-[#173D35] text-[#A3E635] font-semibold"
                        : "text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                    ) : (
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#52606D]" />
                    )}
                    <span>
                      <span className="font-mono tabular-nums text-[#7B8794] mr-1">
                        {String(item.moduleNumber).padStart(2, "0")}
                      </span>
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <article className="min-w-0">{children}</article>

        {/* Right Sidebar: Contextual TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F3F4F6]">
                <ListTree className="h-3.5 w-3.5 text-[#A3E635]" aria-hidden="true" />
                <span>On This Page</span>
              </div>
              <div className="mt-1 text-xs text-[#7B8794] tabular-nums">
                Estimated reading time · {estimatedMinutes} min
              </div>
              <nav aria-label="Table of contents" className="mt-3 space-y-1.5 max-h-[60vh] overflow-y-auto">
                {headings.slice(0, 18).map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-xs leading-snug text-[#AAB4BE] hover:text-[#A3E635] transition-colors ${
                      h.level === 3 ? "pl-3 text-[#7B8794]" : ""
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
