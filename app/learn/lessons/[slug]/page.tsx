import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  ExternalLink,
  TerminalSquare,
} from "lucide-react";
import { LessonActions } from "@/components/learning/lesson-actions";
import { LessonReaderShell } from "@/components/learning/lesson-reader-shell";
import { mdxComponents } from "@/components/learning/mdx-components";
import { QuizRunner } from "@/components/learning/quiz-runner";
import { getAssignmentBySlug } from "@/modules/assignments/service";
import { isAccountActive } from "@/modules/auth/guards";
import { getCurrentUser } from "@/modules/auth/session";
import {
  clampPageNumber,
  getLessonBySlug,
  getLessonNeighbors,
  getPublishedLessons,
  paginateLesson,
} from "@/modules/content/loader";
import {
  getUserBookmarks,
  getUserLessonProgress,
  recordContentView,
} from "@/modules/learning/service";
import { getPublicQuizBySlug, getUserQuizAttempts } from "@/modules/quizzes/service";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const { path: learningPath, pathLessons, previous, next } = getLessonNeighbors(lesson);
  const user = await getCurrentUser();
  const activeUser = isAccountActive(user) ? user : null;

  if (activeUser) {
    await recordContentView(activeUser.id, {
      contentId: lesson.meta.id,
      contentType: "tutorial",
      title: lesson.meta.title,
      slug: lesson.meta.slug,
    });
  }

  const [progress, bookmarks, quiz, assignment, userAttempts] = await Promise.all([
    activeUser ? getUserLessonProgress(activeUser.id) : Promise.resolve([]),
    activeUser ? getUserBookmarks(activeUser.id) : Promise.resolve([]),
    lesson.meta.quizSlug ? getPublicQuizBySlug(lesson.meta.quizSlug) : Promise.resolve(null),
    lesson.meta.assignmentSlug
      ? getAssignmentBySlug(lesson.meta.assignmentSlug)
      : Promise.resolve(null),
    activeUser && lesson.meta.quizSlug
      ? getUserQuizAttempts(activeUser.id)
      : Promise.resolve([]),
  ]);

  const pages = paginateLesson(lesson.content, lesson.meta.estimatedMinutes, {
    hasQuiz: Boolean(quiz),
  });
  const currentPage = clampPageNumber(resolvedSearchParams?.page, pages.length);
  const activePage = pages[currentPage - 1];
  const prevPage = currentPage > 1 ? pages[currentPage - 2] : null;
  const nextPage = currentPage < pages.length ? pages[currentPage] : null;

  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const isCompleted = completedSet.has(lesson.meta.id);
  const isBookmarked = bookmarks.some((b) => b.contentId === lesson.meta.id);

  const matchingAttempts = quiz
    ? userAttempts.filter((a) => a.quizSlug === quiz.slug || a.quizId === quiz.id)
    : [];
  const previousBest =
    matchingAttempts.length > 0
      ? matchingAttempts.reduce((best, cur) =>
          cur.percentage > best.percentage ? cur : best
        )
      : null;

  const pathItems = pathLessons.map((item) => ({
    id: item.meta.id,
    slug: item.meta.slug,
    title: item.meta.title,
    moduleNumber: item.meta.moduleNumber,
    completed: completedSet.has(item.meta.id),
  }));

  const pageSteps = pages.map((p) => ({
    pageNumber: p.pageNumber,
    title: p.title,
    estimatedMinutes: p.estimatedMinutes,
    isAssessmentPage: p.isAssessmentPage,
  }));

  return (
    <LessonReaderShell
      pathTitle={learningPath?.title ?? "Learning Path"}
      pathSlug={learningPath?.slug ?? "linux-fundamentals"}
      currentLessonId={lesson.meta.id}
      pathItems={pathItems}
      headings={activePage.headings}
      estimatedMinutes={activePage.estimatedMinutes}
      totalEstimatedMinutes={lesson.meta.estimatedMinutes}
      lessonSlug={lesson.meta.slug}
      currentPage={currentPage}
      pageSteps={pageSteps}
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
          {pages.length > 1 ? (
            <>
              <span className="mx-2">/</span>
              <span className="text-[#F3F4F6] tabular-nums">
                Page {currentPage} of {pages.length}
              </span>
            </>
          ) : null}
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
          <span className="text-[#AAB4BE]">
            Page {currentPage} of {pages.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>~{activePage.estimatedMinutes} min on this page</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.meta.estimatedMinutes} min total</span>
          <span aria-hidden="true">·</span>
          <span>Updated {lesson.meta.updatedAt}</span>
        </div>

        {/* Multi-page Module Stepper */}
        {pages.length > 1 ? (
          <nav
            aria-label="Module pages"
            className="mt-5 flex items-center gap-2 overflow-x-auto pb-1"
          >
            {pages.map((step) => {
              const isCurrent = step.pageNumber === currentPage;
              return (
                <Link
                  key={step.pageNumber}
                  href={`/learn/lessons/${lesson.meta.slug}?page=${step.pageNumber}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
                    isCurrent
                      ? "border-[#A3E635] bg-[#173D35]/70 font-semibold text-[#F3F4F6]"
                      : "border-[#303A44] bg-[#171D23] text-[#AAB4BE] hover:border-[#4B5866] hover:text-[#F3F4F6]"
                  }`}
                >
                  {step.isAssessmentPage ? (
                    <ClipboardCheck
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isCurrent ? "text-[#A3E635]" : "text-[#7B8794]"
                      }`}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className={`font-mono tabular-nums ${
                        isCurrent ? "text-[#A3E635]" : "text-[#7B8794]"
                      }`}
                    >
                      {String(step.pageNumber).padStart(2, "0")}
                    </span>
                  )}
                  <span>{step.title}</span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>

      {/* Active Page MDX Body */}
      {activePage.mdxContent ? (
        <div className="academy-prose mt-8 max-w-[75ch]">
          <MDXRemote
            source={activePage.mdxContent}
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
      ) : null}

      {/* Embedded Knowledge Check, Practical Assignment & Completion on Final Page */}
      {activePage.isAssessmentPage ? (
        <div className="mt-10 space-y-10">
          {quiz ? (
            <section
              id="knowledge-check"
              className="scroll-mt-24 border-t border-[#303A44] pt-8 space-y-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#A3E635]">
                    <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>End-of-Module Knowledge Check</span>
                  </div>
                  <h2 className="mt-1.5 text-2xl font-bold text-[#F3F4F6]">
                    {quiz.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#AAB4BE] tabular-nums">
                    {quiz.questions.length} questions · 100% required to complete module · Server-graded
                  </p>
                </div>

                <Link
                  href={`/quizzes/${quiz.slug}`}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#303A44] bg-[#171D23] px-3.5 text-xs font-medium text-[#AAB4BE] hover:border-[#4B5866] hover:text-[#F3F4F6] whitespace-nowrap"
                >
                  <span>Standalone view</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <QuizRunner
                quiz={quiz}
                isAuthenticated={Boolean(activeUser)}
                lessonContext={{
                  lessonId: lesson.meta.id,
                  pathId: lesson.meta.pathId,
                  slug: lesson.meta.slug,
                  title: lesson.meta.title,
                  isCompleted,
                  nextLesson: next
                    ? { slug: next.meta.slug, title: next.meta.title }
                    : null,
                }}
                previousBest={
                  previousBest
                    ? {
                        percentage: previousBest.percentage,
                        passed: previousBest.passed,
                        submittedAt: previousBest.submittedAt,
                      }
                    : null
                }
              />
            </section>
          ) : null}

          {assignment ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#F3F4F6]">
                Linked Practical Assignment
              </h2>
              <Link
                href={`/assignments/${assignment.slug}`}
                className="block rounded-xl border border-[#303A44] bg-[#171D23] p-5 hover:border-[#A3E635] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#A3E635]">
                      <TerminalSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Hands-On Lab Checklist</span>
                    </div>
                    <div className="mt-1.5 text-base font-semibold text-[#F3F4F6]">
                      {assignment.title}
                    </div>
                    <p className="mt-1 text-sm text-[#AAB4BE]">{assignment.objective}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#A3E635]" aria-hidden="true" />
                </div>
              </Link>
            </section>
          ) : null}

          <section
            id="module-completion"
            className="scroll-mt-24 rounded-xl border border-[#303A44] bg-[#171D23] p-6"
          >
            <LessonActions
              key={`${lesson.meta.id}-${String(isCompleted)}-${String(isBookmarked)}-${String(Boolean(quiz))}`}
              lessonId={lesson.meta.id}
              pathId={lesson.meta.pathId}
              slug={lesson.meta.slug}
              title={lesson.meta.title}
              initialCompleted={isCompleted}
              initialBookmarked={isBookmarked}
              isAuthenticated={Boolean(activeUser)}
              hasQuiz={Boolean(quiz)}
            />
          </section>

          {/* Back to reading page + Previous / Next Module navigation */}
          <nav
            aria-label="Lesson sequence"
            className="space-y-4 border-t border-[#303A44] pt-6"
          >
            {prevPage ? (
              <div>
                <Link
                  href={`/learn/lessons/${lesson.meta.slug}?page=${prevPage.pageNumber}`}
                  className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-[#AAB4BE] hover:text-[#A3E635] whitespace-nowrap"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    Back to Page {prevPage.pageNumber}: {prevPage.title}
                  </span>
                </Link>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </nav>
        </div>
      ) : (
        /* Intermediate Reading Page Stepper Footer */
        <div className="mt-10 space-y-4 border-t border-[#303A44] pt-6">
          <nav
            aria-label="Page navigation"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {prevPage ? (
              <Link
                href={`/learn/lessons/${lesson.meta.slug}?page=${prevPage.pageNumber}`}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#4B5866] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-[#AAB4BE]" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs text-[#7B8794] tabular-nums">
                    Previous · Page {prevPage.pageNumber} of {pages.length}
                  </div>
                  <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                    {prevPage.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextPage ? (
              <Link
                href={`/learn/lessons/${lesson.meta.slug}?page=${nextPage.pageNumber}`}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
                  nextPage.isAssessmentPage
                    ? "border-[#A3E635]/60 bg-[#173D35]/40 hover:border-[#A3E635]"
                    : "border-[#303A44] bg-[#171D23] hover:border-[#A3E635]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-[#A3E635] tabular-nums">
                    {nextPage.isAssessmentPage ? (
                      <ClipboardCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                    <span>
                      {nextPage.isAssessmentPage
                        ? `Final Step · Page ${nextPage.pageNumber} of ${pages.length}`
                        : `Next · Page ${nextPage.pageNumber} of ${pages.length} (~${nextPage.estimatedMinutes} min)`}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                    {nextPage.title}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#A3E635]" aria-hidden="true" />
              </Link>
            ) : null}
          </nav>

          {quiz && !nextPage?.isAssessmentPage ? (
            <Link
              href={`/learn/lessons/${lesson.meta.slug}?page=${pages.length}#knowledge-check`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#A3E635] transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A3E635]">
                  <ClipboardCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">
                    End-of-Module Quiz · Page {pages.length} of {pages.length}
                  </span>
                </div>
                <div className="mt-0.5 text-sm font-semibold text-[#F3F4F6] truncate">
                  {quiz.title}
                </div>
                <div className="mt-0.5 text-xs text-[#AAB4BE] tabular-nums">
                  {quiz.questions.length} questions · Pass score {quiz.passPercentage}%
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#A3E635] whitespace-nowrap">
                <span>Go to Quiz</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          ) : null}
        </div>
      )}
    </LessonReaderShell>
  );
}
