import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/learning/mdx-components";
import { getPublishedResources, getResourceBySlug } from "@/modules/content/loader";

export async function generateStaticParams() {
  return getPublishedResources().map((r) => ({ slug: r.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return { title: "Resource Not Found" };
  return {
    title: resource.meta.title,
    description: resource.meta.description,
    alternates: { canonical: `/resources/${resource.meta.slug}` },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/resources" className="hover:text-[#F3F4F6]">
          Resources
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{resource.meta.title}</span>
      </nav>

      <header className="mt-4 border-b border-[#303A44] pb-6">
        <div className="text-xs text-[#7B8794] capitalize tabular-nums">
          {resource.meta.resourceType} · {resource.meta.category} ·{" "}
          {resource.meta.estimatedMinutes} min read
        </div>
        <h1 className="mt-2 text-3xl font-bold text-[#F3F4F6] sm:text-4xl">
          {resource.meta.title}
        </h1>
        <p className="mt-3 text-base text-[#AAB4BE]">{resource.meta.description}</p>
      </header>

      <div className="academy-prose mt-8">
        <MDXRemote
          source={resource.content}
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
