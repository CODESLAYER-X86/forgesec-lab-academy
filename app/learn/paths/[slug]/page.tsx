import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PathDetailClient } from "@/components/learning/path-progress-clients";
import {
  getLearningPathBySlug,
  getLessonsForPath,
  getPublishedLearningPaths,
} from "@/modules/content/loader";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getPublishedLearningPaths().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPathBySlug(slug);
  if (!path) return { title: "Learning Path Not Found" };
  return {
    title: path.title,
    description: path.description,
    alternates: { canonical: `/learn/paths/${path.slug}` },
  };
}

export default async function LearningPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = getLearningPathBySlug(slug);
  if (!path) notFound();

  const lessons = getLessonsForPath(path).map((lesson) => ({
    id: lesson.meta.id,
    slug: lesson.meta.slug,
    title: lesson.meta.title,
    description: lesson.meta.description,
    moduleNumber: lesson.meta.moduleNumber,
    estimatedMinutes: lesson.meta.estimatedMinutes,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/learn" className="hover:text-[#F3F4F6]">
          Learn
        </Link>
        <span className="mx-2">/</span>
        <Link href="/learn/paths" className="hover:text-[#F3F4F6]">
          Paths
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{path.title}</span>
      </nav>

      <PathDetailClient path={path} lessons={lessons} />
    </div>
  );
}
