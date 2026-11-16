"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import type { SessionUser } from "@/lib/types/domain";
import { SearchModal } from "@/components/search/search-modal";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !searchOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const showAdmin = user && (user.role === "admin" || user.role === "instructor");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#303A44] bg-[#101418]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line brand wordmark */}
          <Link
            href="/"
            className="font-semibold tracking-tight text-[#F3F4F6] text-base sm:text-lg whitespace-nowrap shrink-0"
          >
            FORGESEC ACADEMY
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#AAB4BE]"
          >
            <Link
              href="/learn"
              className="hover:text-[#F3F4F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Learn
            </Link>
            <Link
              href="/writeups"
              className="hover:text-[#F3F4F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Write-ups
            </Link>
            <Link
              href="/resources"
              className="hover:text-[#F3F4F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Resources
            </Link>
            <Link
              href="/about"
              className="hover:text-[#F3F4F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </Link>
          </nav>

          {/* Zone 3: Search trigger + primary account action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search curriculum"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#303A44] bg-[#171D23] px-3 text-xs font-medium text-[#AAB4BE] hover:border-[#4B5866] hover:text-[#F3F4F6] transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline rounded border border-[#303A44] px-1 text-[10px] font-mono text-[#7B8794]">
                /
              </kbd>
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3 shrink-0">
                {showAdmin ? (
                  <Link
                    href="/admin"
                    className="text-xs font-medium text-[#AAB4BE] hover:text-[#F3F4F6] whitespace-nowrap shrink-0"
                  >
                    Admin
                  </Link>
                ) : null}
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418] hover:bg-[#B4F04E] transition-colors whitespace-nowrap shrink-0"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex h-9 items-center rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418] hover:bg-[#B4F04E] transition-colors whitespace-nowrap shrink-0"
              >
                Login
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#303A44] bg-[#171D23] text-[#F3F4F6] md:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-[#303A44] bg-[#171D23] px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3 text-sm font-medium text-[#AAB4BE]">
              <Link href="/learn" onClick={() => setMobileOpen(false)} className="py-1.5 text-[#F3F4F6]">
                Learn
              </Link>
              <Link href="/writeups" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F3F4F6]">
                Write-ups
              </Link>
              <Link href="/resources" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F3F4F6]">
                Resources
              </Link>
              <Link href="/quizzes" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F3F4F6]">
                Quizzes
              </Link>
              <Link href="/assignments" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F3F4F6]">
                Assignments
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F3F4F6]">
                About
              </Link>
              <div className="pt-2 border-t border-[#303A44] flex flex-wrap gap-3">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-10 items-center rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418]"
                    >
                      Dashboard
                    </Link>
                    {showAdmin ? (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex h-10 items-center rounded-lg border border-[#303A44] px-4 text-xs font-medium text-[#F3F4F6]"
                      >
                        Admin
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-10 items-center rounded-lg bg-[#A3E635] px-4 text-xs font-semibold text-[#101418]"
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
