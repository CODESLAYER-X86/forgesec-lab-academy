import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGlossaryItems, getPublishedResources } from "@/modules/content/loader";

export const metadata: Metadata = {
  title: "Resources & Guides",
  description:
    "Command-line reference sheets, SSH configuration guides, and security glossary entries.",
};

export default function ResourcesPage() {
  const resources = getPublishedResources();
  const glossary = getGlossaryItems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Resources &amp; Guides</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Concise command references, hardening checklists, and terminology definitions to
          keep beside your terminal.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#F3F4F6]">
          Reference Sheets &amp; Practical Guides
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {resources.map((r) => (
            <Link
              key={r.meta.id}
              href={`/resources/${r.meta.slug}`}
              className="group rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
            >
              <div className="text-xs text-[#7B8794] capitalize tabular-nums">
                {r.meta.resourceType} · {r.meta.category} · {r.meta.estimatedMinutes} min
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[#F3F4F6] group-hover:text-[#A3E635]">
                {r.meta.title}
              </h3>
              <p className="mt-2 text-sm text-[#AAB4BE]">{r.meta.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#A3E635]">
                Open Resource <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-[#F3F4F6]">Glossary Highlights</h2>
          <Link href="/glossary" className="text-xs font-semibold text-[#A3E635] hover:underline">
            View full glossary
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {glossary.map((g) => (
            <Link
              key={g.slug}
              href={`/glossary/${g.slug}`}
              className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#4B5866] transition-colors"
            >
              <div className="text-xs text-[#7B8794] capitalize">{g.category}</div>
              <div className="mt-1 text-base font-semibold text-[#F3F4F6]">{g.term}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#AAB4BE] line-clamp-2">
                {g.shortDefinition}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
