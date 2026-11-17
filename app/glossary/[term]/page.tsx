import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getGlossaryItemBySlug, getGlossaryItems } from "@/modules/content/loader";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getGlossaryItems().map((item) => ({ term: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term } = await params;
  const item = getGlossaryItemBySlug(term);
  if (!item) return { title: "Term Not Found" };
  return {
    title: `${item.term} — Glossary`,
    description: item.shortDefinition,
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  const item = getGlossaryItemBySlug(term);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/glossary" className="hover:text-[#F3F4F6]">
          Glossary
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{item.term}</span>
      </nav>

      <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 sm:p-8 space-y-4">
        <div className="text-xs text-[#7B8794] capitalize">{item.category}</div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">{item.term}</h1>
        <p className="text-base font-medium text-[#E5E7EB]">{item.shortDefinition}</p>
        <p className="text-sm leading-relaxed text-[#AAB4BE]">{item.details}</p>

        {item.relatedLessonSlug ? (
          <div className="pt-4 border-t border-[#262F38]">
            <Link
              href={`/learn/lessons/${item.relatedLessonSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A3E635] hover:underline"
            >
              <span>Study related lesson</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
