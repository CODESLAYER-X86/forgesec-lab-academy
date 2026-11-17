import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/learning/mdx-components";
import { getPublishedWriteups, getWriteupBySlug } from "@/modules/content/loader";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getPublishedWriteups().map((w) => ({ slug: w.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const writeup = getWriteupBySlug(slug);
  if (!writeup) return { title: "Write-up Not Found" };
  return {
    title: writeup.meta.title,
    description: writeup.meta.description,
    alternates: { canonical: `/writeups/${writeup.meta.slug}` },
  };
}

export default async function WriteupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writeup = getWriteupBySlug(slug);
  if (!writeup) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/writeups" className="hover:text-[#F3F4F6]">
          Write-ups
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{writeup.meta.title}</span>
      </nav>

      <header className="mt-4 border-b border-[#303A44] pb-6">
        <div className="text-xs text-[#7B8794] capitalize tabular-nums">
          {writeup.meta.category.replace("-", " ")} · {writeup.meta.difficulty} ·{" "}
          {writeup.meta.estimatedMinutes} min read · {writeup.meta.author}
        </div>
        <h1 className="mt-2 text-3xl font-bold text-[#F3F4F6] sm:text-4xl">
          {writeup.meta.title}
        </h1>
        <p className="mt-3 text-base text-[#AAB4BE]">{writeup.meta.description}</p>
      </header>

      <div className="academy-prose mt-8">
        <MDXRemote
          source={writeup.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [[rehypePrettyCode, { theme: "github-dark-default", keepBackground: false }]],
            },
          }}
        />
      </div>
    </article>
  );
}
