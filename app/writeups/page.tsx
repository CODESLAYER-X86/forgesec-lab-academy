import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedWriteups } from "@/modules/content/loader";

export const metadata: Metadata = {
  title: "Technical Write-ups",
  description:
    "Defensive security analyses, system hardening walkthroughs, and architecture case studies.",
};

export default function WriteupsPage() {
  const writeups = getPublishedWriteups();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Technical Write-ups</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Focused defensive engineering notes and vulnerability analyses written for clarity
          and safe system understanding.
        </p>
      </div>

      <div className="space-y-4">
        {writeups.map((w) => (
          <Link
            key={w.meta.id}
            href={`/writeups/${w.meta.slug}`}
            className="block rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
          >
            <div className="text-xs text-[#7B8794] capitalize tabular-nums">
              {w.meta.category.replace("-", " ")} · {w.meta.difficulty} ·{" "}
              {w.meta.estimatedMinutes} min read · Updated {w.meta.updatedAt}
            </div>
            <h2 className="mt-2 text-xl font-semibold text-[#F3F4F6]">
              {w.meta.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
              {w.meta.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3E635]">
              Read Write-up <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
