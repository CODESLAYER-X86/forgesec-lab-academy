import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { AssignmentTracker } from "@/components/learning/assignment-tracker";
import {
  getAssignmentBySlug,
  getPublishedAssignments,
} from "@/modules/assignments/service";
import { getLessonById } from "@/modules/content/loader";

export const revalidate = 3600;

export async function generateStaticParams() {
  const assignments = await getPublishedAssignments();
  return assignments.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assignment = await getAssignmentBySlug(slug);
  if (!assignment) return { title: "Assignment Not Found" };
  return {
    title: assignment.title,
    description: assignment.objective,
  };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assignment = await getAssignmentBySlug(slug);
  if (!assignment) notFound();

  const relatedLesson = assignment.lessonId ? getLessonById(assignment.lessonId) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/assignments" className="hover:text-[#F3F4F6]">
          Assignments
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{assignment.title}</span>
      </nav>

      <header className="border-b border-[#303A44] pb-6 space-y-3">
        <div className="text-xs text-[#7B8794] capitalize">
          Practical Assignment · {assignment.category} · {assignment.difficulty}
        </div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">{assignment.title}</h1>
        <p className="text-base text-[#AAB4BE]">{assignment.objective}</p>
        {relatedLesson ? (
          <div className="text-xs">
            <Link
              href={`/learn/lessons/${relatedLesson.meta.slug}`}
              className="text-[#A3E635] hover:underline"
            >
              Review accompanying lesson: {relatedLesson.meta.title}
            </Link>
          </div>
        ) : null}
      </header>

      <div className="rounded-xl border border-[#784F14] bg-[#1F1A12] p-4">
        <div className="flex items-start gap-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
          <div>
            <div className="font-semibold text-[#FDE68A]">Authorization &amp; Safety Scope</div>
            <p className="mt-1 text-xs leading-relaxed text-[#E5E7EB]">
              {assignment.safetyWarning}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-[#F3F4F6]">Prerequisites</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-[#AAB4BE] space-y-1">
            {assignment.prerequisites.map((pre) => (
              <li key={pre}>{pre}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#F3F4F6]">Step-by-Step Instructions</h2>
          <ol className="mt-2 list-decimal pl-5 text-sm text-[#E5E7EB] space-y-2">
            {assignment.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#F3F4F6]">Expected Outcome</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#AAB4BE]">
            {assignment.expectedOutcome}
          </p>
        </div>
      </section>

      <AssignmentTracker assignmentId={assignment.id} slug={assignment.slug} />
    </div>
  );
}
