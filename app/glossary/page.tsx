import type { Metadata } from "next";
import Link from "next/link";
import { getGlossaryItems } from "@/modules/content/loader";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Security & Linux Glossary",
  description:
    "Clear definitions of core Linux, networking, and cybersecurity terms used across FORGESEC ACADEMY.",
};

export default function GlossaryPage() {
  const items = getGlossaryItems();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Glossary</h1>
        <p className="mt-2 text-sm text-[#AAB4BE]">
          Concise definitions for foundational Linux, networking, and security concepts.
        </p>
      </div>

      <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/glossary/${item.slug}`}
            className="block p-5 hover:bg-[#202831] transition-colors"
          >
            <div className="text-xs text-[#7B8794] capitalize">{item.category}</div>
            <h2 className="mt-1 text-lg font-semibold text-[#F3F4F6]">{item.term}</h2>
            <p className="mt-1 text-sm text-[#AAB4BE]">{item.shortDefinition}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
