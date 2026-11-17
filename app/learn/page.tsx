import type { Metadata } from "next";
import Link from "next/link";
import { CatalogExplorer } from "@/components/learning/catalog-explorer";
import {
  getPublishedLearningPaths,
  getPublishedLessons,
} from "@/modules/content/loader";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learning Catalog",
  description:
    "Explore structured cybersecurity learning paths, Linux modules, quizzes, and practical assignments.",
};

export default function LearnCatalogPage() {
  const paths = getPublishedLearningPaths().map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    difficulty: p.difficulty,
    estimatedMinutes: p.estimatedMinutes,
    lessonCount: p.lessons.length,
  }));

  const lessons = getPublishedLessons().map((l) => ({
    id: l.meta.id,
    slug: l.meta.slug,
    title: l.meta.title,
    description: l.meta.description,
    category: l.meta.category,
    difficulty: l.meta.difficulty,
    estimatedMinutes: l.meta.estimatedMinutes,
    moduleNumber: l.meta.moduleNumber,
    pathId: l.meta.pathId,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Explore Learning</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#AAB4BE]">
            Browse structured learning paths and self-paced modules. Public lessons require
            no registration—or sign in to track completions and quiz scores.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/quizzes"
            className="inline-flex h-9 items-center rounded-lg border border-[#303A44] bg-[#171D23] px-3.5 text-xs font-medium text-[#F3F4F6] hover:border-[#4B5866]"
          >
            Quizzes
          </Link>
          <Link
            href="/assignments"
            className="inline-flex h-9 items-center rounded-lg border border-[#303A44] bg-[#171D23] px-3.5 text-xs font-medium text-[#F3F4F6] hover:border-[#4B5866]"
          >
            Practical Assignments
          </Link>
        </div>
      </div>

      <CatalogExplorer paths={paths} lessons={lessons} />
    </div>
  );
}
