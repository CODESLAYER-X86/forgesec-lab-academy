"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  ExternalLink,
  TerminalSquare,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { LessonActions } from "@/components/learning/lesson-actions";
import {
  LessonReaderShell,
  type LessonPageStep,
  type PathNavItem,
} from "@/components/learning/lesson-reader-shell";
import { QuizRunner } from "@/components/learning/quiz-runner";
import type { PracticalAssignment, PublicQuiz } from "@/lib/types/domain";
import type { TocHeading } from "@/modules/content/headings";

export interface PrecompiledLessonPage {
  pageNumber: number;
  title: string;
  headings: TocHeading[];
  estimatedMinutes: number;
  wordCount: number;
  isAssessmentPage: boolean;
  mdxNode: React.ReactNode | null;
}

interface LessonInteractiveReaderProps {
  lesson: {
    id: string;
    pathId: string;
    slug: string;
    title: string;
    description: string;
    moduleNumber: number;
    category: string;
    difficulty: string;
    estimatedMinutes: number;
    updatedAt: string;
  };
  learningPath: {
    title: string;
    slug: string;
  } | null;
  pathItems: PathNavItem[];
  previousLesson: { slug: string; title: string } | null;
  nextLesson: { slug: string; title: string } | null;
  pages: PrecompiledLessonPage[];
  quiz: PublicQuiz | null;
  assignment: PracticalAssignment | null;
}

function clampClientPage(raw: string | null, total: number): number {
  const safeTotal = Math.max(1, total);
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 1;
  return Math.min(safeTotal, Math.max(1, parsed));
}

function isPlainLeftClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function SearchParamPageSync({
  totalPages,
  onSyncPage,
}: {
  totalPages: number;
  onSyncPage: (page: number) => void;
}) {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");

  useIsomorphicLayoutEffect(() => {
    const target = clampClientPage(pageParam, totalPages);
    onSyncPage(target);
  }, [pageParam, totalPages, onSyncPage]);

  return null;
}

export function LessonInteractiveReader({
  lesson,
  learningPath,
  pathItems,
  previousLesson,
  nextLesson,
  pages,
  quiz,
  assignment,
}: LessonInteractiveReaderProps) {
  const { user, loaded, completedIds } = useAuthSession();
  const [currentPage, setCurrentPage] = useState(1);
  const activityLoggedRef = useRef<string | null>(null);

  const pageSteps: LessonPageStep[] = useMemo(
    () =>
      pages.map((p) => ({
        pageNumber: p.pageNumber,
        title: p.title,
        estimatedMinutes: p.estimatedMinutes,
        isAssessmentPage: p.isAssessmentPage,
      })),
    [pages]
  );

  // Sync URL ?page= on browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      setCurrentPage(clampClientPage(sp.get("page"), pages.length));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pages.length]);

  // Background activity tracking off the critical render path, deduped per browser session
  useEffect(() => {
    if (!loaded || !user) return;
    const key = `${user.id}:${lesson.id}`;
    if (activityLoggedRef.current === key) return;
    const storageKey = `forgesec:activity:${key}`;
    try {
      if (window.sessionStorage.getItem(storageKey) === "1") {
        activityLoggedRef.current = key;
        return;
      }
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage access errors in restricted environments
    }
    activityLoggedRef.current = key;
    void fetch("/api/learning/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId: lesson.id,
        contentType: "tutorial",
        title: lesson.title,
        slug: lesson.slug,
      }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  }, [loaded, user, lesson.id, lesson.title, lesson.slug]);

  const handleSelectPage = useCallback(
    (pageNumber: number, hash?: string) => {
      const clamped = Math.min(pages.length, Math.max(1, pageNumber));
      setCurrentPage(clamped);

      const url = new URL(window.location.href);
      if (clamped <= 1 && !hash) {
        url.searchParams.delete("page");
      } else {
        url.searchParams.set("page", String(clamped));
      }
      url.hash = hash ? `#${hash}` : "";
      window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);

      if (hash) {
        window.requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    },
    [pages.length]
  );

  const activePage = pages[currentPage - 1] ?? pages[0];
  const prevPage = currentPage > 1 ? pages[currentPage - 2] : null;
  const nextPage = currentPage < pages.length ? pages[currentPage] : null;
  const isCompleted = completedIds.has(lesson.id);

  return (
    <LessonReaderShell
      pathTitle={learningPath?.title ?? "Learning Path"}
      pathSlug={learningPath?.slug ?? "linux-fundamentals"}
      currentLessonId={lesson.id}
      pathItems={pathItems}
      headings={activePage.headings}
      estimatedMinutes={activePage.estimatedMinutes}
      totalEstimatedMinutes={lesson.estimatedMinutes}
      lessonSlug={lesson.slug}
      currentPage={currentPage}
      pageSteps={pageSteps}
      onSelectPage={handleSelectPage}
    >
      <Suspense fallback={null}>
        <SearchParamPageSync totalPages={pages.length} onSyncPage={setCurrentPage} />
      </Suspense>

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
            Module {String(lesson.moduleNumber).padStart(2, "0")}
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
          {lesson.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#AAB4BE]">
          {lesson.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#7B8794] capitalize tabular-nums">
          <span>{lesson.category.replace("-", " ")}</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#AAB4BE]">
            Page {currentPage} of {pages.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>~{activePage.estimatedMinutes} min on this page</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.estimatedMinutes} min total</span>
          <span aria-hidden="true">·</span>
          <span>Updated {lesson.updatedAt}</span>
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
                  href={`/learn/lessons/${lesson.slug}?page=${step.pageNumber}`}
                  data-no-progress="true"
                  prefetch={false}
                  onClick={(e) => {
                    if (isPlainLeftClick(e)) {
                      e.preventDefault();
                      handleSelectPage(step.pageNumber);
                    }
                  }}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs active:scale-[0.98] transition-all whitespace-nowrap ${
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
      {activePage.mdxNode ? (
        <div key={activePage.pageNumber} className="academy-prose mt-8 max-w-[75ch]">
          {activePage.mdxNode}
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
                lessonContext={{
                  lessonId: lesson.id,
                  pathId: lesson.pathId,
                  slug: lesson.slug,
                  title: lesson.title,
                  isCompleted,
                  nextLesson,
                }}
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
              lessonId={lesson.id}
              pathId={lesson.pathId}
              slug={lesson.slug}
              title={lesson.title}
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
                  href={`/learn/lessons/${lesson.slug}?page=${prevPage.pageNumber}`}
                  data-no-progress="true"
                  prefetch={false}
                  onClick={(e) => {
                    if (isPlainLeftClick(e)) {
                      e.preventDefault();
                      handleSelectPage(prevPage.pageNumber);
                    }
                  }}
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
              {previousLesson ? (
                <Link
                  href={`/learn/lessons/${previousLesson.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#4B5866] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-[#AAB4BE]" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-xs text-[#7B8794]">Previous Module</div>
                    <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                      {previousLesson.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/learn/lessons/${nextLesson.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#A3E635] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-[#7B8794]">Next Module</div>
                    <div className="text-sm font-semibold text-[#F3F4F6] truncate">
                      {nextLesson.title}
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
                href={`/learn/lessons/${lesson.slug}?page=${prevPage.pageNumber}`}
                data-no-progress="true"
                prefetch={false}
                onClick={(e) => {
                  if (isPlainLeftClick(e)) {
                    e.preventDefault();
                    handleSelectPage(prevPage.pageNumber);
                  }
                }}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-[#303A44] bg-[#171D23] p-4 hover:border-[#4B5866] active:scale-[0.99] transition-all"
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
                href={`/learn/lessons/${lesson.slug}?page=${nextPage.pageNumber}`}
                data-no-progress="true"
                prefetch={false}
                onClick={(e) => {
                  if (isPlainLeftClick(e)) {
                    e.preventDefault();
                    handleSelectPage(nextPage.pageNumber);
                  }
                }}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border p-4 active:scale-[0.99] transition-all ${
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
              href={`/learn/lessons/${lesson.slug}?page=${pages.length}#knowledge-check`}
              data-no-progress="true"
                prefetch={false}
              onClick={(e) => {
                if (isPlainLeftClick(e)) {
                  e.preventDefault();
                  handleSelectPage(pages.length, "knowledge-check");
                }
              }}
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
                  {quiz.questions.length} questions · Pass score 100%
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
