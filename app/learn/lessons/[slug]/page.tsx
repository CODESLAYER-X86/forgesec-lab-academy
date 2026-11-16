import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, ClipboardCheck, TerminalSquare } from "lucide-react";
import { LessonActions } from "@/components/learning/lesson-actions";
import { LessonReaderShell } from "@/components/learning/lesson-reader-shell";
import { mdxComponents } from "@/components/learning/mdx-components";
import { getAssignmentBySlug } from "@/modules/assignments/service";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getLessonBySlug,
  getLessonNeighbors,
  getPublishedLessons,
} from "@/modules/content/loader";
import {
  getUserBookmarks,
  getUserLessonProgress,
  recordContentView,
} from "@/modules/learning/service";
import { getPublicQuizBySlug } from "@/modules/quizzes/service";

export async function generateStaticParams() {
  return getPublishedLessons().map((l) => ({ slug: l.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: lesson.meta.title,
    description: lesson.meta.description,
    alternates: { canonical: `/learn/lessons/${lesson.meta.slug}` },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const { path: learningPath, pathLessons, previous, next } = getLessonNeighbors(lesson);
  const user = await getCurrentUser();

  if (user) {
    await recordContentView(user.id, {
      contentId: lesson.meta.id,
      contentType: "tutorial",
      title: lesson.meta.title,
      slug: lesson.meta.slug,
    });
  }

  const [progress, bookmarks, quiz, assignment] = await Promise.all([
    user ? getUserLessonProgress(user.id) : Promise.resolve([]),
    user ? getUserBookmarks(user.id) : Promise.resolve([]),
    lesson.meta.quizSlug ? getPublicQuizBySlug(lesson.meta.quizSlug) : Promise.resolve(null),
    lesson.meta.assignmentSlug
      ? getAssignmentBySlug(lesson.meta.assignmentSlug)
      : Promise.resolve(null),
  ]);

  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const isCompleted = completedSet.has(lesson.meta.id);
  const isBookmarked = bookmarks.some((b) => b.contentId === lesson.meta.id);

  const pathItems = pathLessons.map((item) => ({
    id: item.meta.id,
    slug: item.meta.slug,
    title: item.meta.title,
    moduleNumber: item.meta.moduleNumber,
    completed: completedSet.has(item.meta.id),
  }));

  return (
    <LessonReaderShell
      pathTitle={learningPath?.title ?? "Learning Path"}
      pathSlug={learningPath?.slug ?? "linux-fundamentals"}
      currentLessonId={lesson.meta.id}
      pathItems={pathItems}
      headings={lesson.headings}
      estimatedMinutes={lesson.meta.estimatedMinutes}
    >
      {/* Lesson Header */}
      <header className="border-b border-[#303A44] pb-6">
        <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
          <Link href="/learn" className="hover:text-[#F3F4F6]">
            Learn
          </Link>
          <span className="mx-2">/</span>
          {learningPath ? (
            <>
              <Link href={`/learn/paths/${learningPath.slug}`} className="hover:text-[#F3F4F6]">
                {learningPath.title}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : null}
          <span className="text-[#AAB4BE]">
            Module {String(lesson.meta.moduleNumber).padStart(2, "0")}
          </span>
        </nav>

        <h1 className="mt-3 text-3xl font-bold text-[#F3F4F6] sm:text-4xl">
          {lesson.meta.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#AAB4BE]">
          {lesson.meta.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#7B8794] capitalize tabular-nums">
          <span>{lesson.meta.category.replace("-", " ")}</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.meta.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.meta.estimatedMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>Updated {lesson.meta.updatedAt}</span>
        </div>
      </header>

      {/* MDX Body */}
      <div className="academy-prose mt-8 max-w-[75ch]">
        <MDXRemote
          source={lesson.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: "github-dark-default",
                    keepBackground: false,
                  },
                ],
              ],
            },
          }}
        />
      </div>

      {/* Linked Practical Assignment & Knowledge Check */}
      {(assignment || quiz) ? (
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignment ? (
            <Link
              href={`/assignments/${assignment.slug}`}
              className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635] transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A3E635]">
                <TerminalSquare className="h-4 w-4" aria-hidden="true" />
                <span>Practical Assignment</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[#F3F4F6]">
                {assignment.title}
              </div>
              <p className="mt-1 text-xs text-[#AAB4BE] line-clamp-2">
                {assignment.objective}
              </p>
            </Link>
          ) : null}

          {quiz ? (
            <Link
              href={`/quizzes/${quiz.slug}`}
              className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635] transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A3E635]">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                <span>Knowledge Check</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[#F3F4F6]">
                {quiz.title}
              </div>
              <p className="mt-1 text-xs text-[#AAB4BE] line-clamp-2">
                {quiz.questions.length} questions · Pass score {quiz.passPercentage}%
              </p>
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Completion & Bookmark Actions */}
      <section className="mt-10 rounded-xl border border-[#303A44] bg-[#171D23] p-6">
        <LessonActions
          lessonId={lesson.meta.id}
          pathId={lesson.meta.pathId}
          slug={lesson.meta.slug}
          title={lesson.meta.title}
          initialCompleted={isCompleted}
          initialBookmarked={isBookmarked}
          isAuthenticated={Boolean(user)}
        />
      </section>

      {/* Previous / Next Navigation */}
      <nav
        aria-label="Lesson sequence"
        className="mt-8 grid grid-cols-1 gap-4 border-t border-[#303A44] pt-6 sm:grid-cols-2"
      >
        {previous ? (
          <Link
            href={`/learn/lessons/${previous.meta.slug}`}
            className="flex items-center gap-3 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#4B5866] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-[#AAB4BE]" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-xs text-[#7B8794]">Previous Module</div>
              <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                {previous.meta.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/learn/lessons/${next.meta.slug}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#A3E635] transition-colors"
          >
            <div className="min-w-0">
              <div className="text-xs text-[#7B8794]">Next Module</div>
              <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                {next.meta.title}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#A3E635]" aria-hidden="true" />
          </Link>
        ) : null}
      </nav>
    </LessonReaderShell>
  );
}
