import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search/search-page-client";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search published Linux lessons, learning paths, write-ups, command references, and glossary terms.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Search Academy</h1>
        <p className="mt-2 text-sm text-[#AAB4BE]">
          Instant client-side discovery across all published lessons, paths, write-ups,
          resources, and glossary entries.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-8 text-center text-sm text-[#AAB4BE]">
            Loading search index...
          </div>
        }
      >
        <SearchPageClient />
      </Suspense>
    </div>
  );
}
