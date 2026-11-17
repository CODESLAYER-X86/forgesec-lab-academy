"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createQuizAction, toggleQuizStatusAction } from "@/app/actions/admin";
import type { QuizStatus, ServerQuiz } from "@/lib/types/domain";

interface QuizManagerProps {
  quizzes: ServerQuiz[];
}

export function QuizManager({ quizzes }: QuizManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, { status: QuizStatus; baseStatus: QuizStatus }>
  >({});
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayQuizzes = quizzes.map((q) => {
    const ov = optimisticStatuses[q.id];
    return ov && ov.baseStatus === q.status ? { ...q, status: ov.status } : q;
  });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("linux");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [passPercentage, setPassPercentage] = useState(100);
  const [status, setStatus] = useState<QuizStatus>("published");
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = async (quizId: string, nextStatus: QuizStatus) => {
    const serverQuiz = quizzes.find((q) => q.id === quizId);
    const baseStatus = serverQuiz?.status ?? nextStatus;

    setBusyId(quizId);
    setError(null);
    setOptimisticStatuses((prev) => ({
      ...prev,
      [quizId]: { status: nextStatus, baseStatus },
    }));

    const res = await toggleQuizStatusAction(quizId, nextStatus);
    setBusyId(null);
    if (!res.ok) {
      setOptimisticStatuses((prev) => {
        const next = { ...prev };
        delete next[quizId];
        return next;
      });
      setError(res.error ?? "Failed to update quiz status.");
      return;
    }
    startTransition(() => {
      router.refresh();
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await createQuizAction({
      title,
      slug,
      description,
      category,
      difficulty,
      passPercentage: Number(passPercentage),
      status,
      questionPrompt,
      optionA,
      optionB,
      optionC,
      correctIndex: Number(correctIndex),
      explanation,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error ?? "Unable to create quiz.");
      return;
    }

    setTitle("");
    setSlug("");
    setDescription("");
    setPassPercentage(100);
    setQuestionPrompt("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setExplanation("");
    setShowCreate(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#AAB4BE] tabular-nums">
          {displayQuizzes.length} assessments configured
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#A3E635] px-4 py-2 text-xs font-semibold text-[#101418] hover:bg-[#bef264] transition-colors whitespace-nowrap"
        >
          {showCreate ? (
            <>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Quiz</span>
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs text-[#FCA5A5]">
          {error}
        </div>
      ) : null}

      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-[#F3F4F6]">Create Assessment Quiz</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-title">
                Quiz Title
              </label>
              <input
                id="quiz-title"
                required
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (!slug) {
                    setSlug(
                      val
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    );
                  }
                }}
                placeholder="Linux Process Signals Check"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-slug">
                URL Slug
              </label>
              <input
                id="quiz-slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="linux-process-signals-check"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm font-mono text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-description">
              Description
            </label>
            <textarea
              id="quiz-description"
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Verify knowledge of SIGTERM, SIGKILL, and daemon inspection."
              className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-category">
                Category
              </label>
              <input
                id="quiz-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-difficulty">
                Difficulty
              </label>
              <select
                id="quiz-difficulty"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")
                }
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-pass">
                Pass %
              </label>
              <input
                id="quiz-pass"
                type="number"
                min={1}
                max={100}
                value={passPercentage}
                onChange={(e) => setPassPercentage(Number(e.target.value))}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm tabular-nums text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#AAB4BE]" htmlFor="quiz-status">
                Initial Status
              </label>
              <select
                id="quiz-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as QuizStatus)}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#262F38] pt-4 space-y-3">
            <div className="text-xs font-semibold text-[#F3F4F6]">Initial Question</div>

            <input
              required
              value={questionPrompt}
              onChange={(e) => setQuestionPrompt(e.target.value)}
              placeholder="Which POSIX signal requests graceful termination and can be caught by a process?"
              className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                required
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="Option A (e.g. SIGTERM)"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
              <input
                required
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="Option B (e.g. SIGKILL)"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
              <input
                required
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                placeholder="Option C (e.g. SIGSTOP)"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              >
                <option value={0}>Correct Answer: Option A</option>
                <option value={1}>Correct Answer: Option B</option>
                <option value={2}>Correct Answer: Option C</option>
              </select>

              <input
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explanation shown after submission"
                className="w-full rounded-lg border border-[#303A44] bg-[#101418] px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#A3E635] px-4 py-2 text-xs font-semibold text-[#101418] hover:bg-[#bef264] disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Quiz"}
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[#303A44] bg-[#171D23]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#262F38] text-xs uppercase tracking-wider text-[#7B8794]">
            <tr>
              <th className="px-4 py-3 font-medium">Quiz</th>
              <th className="px-4 py-3 font-medium">Metadata</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262F38]">
            {displayQuizzes.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-[#202831]/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#F3F4F6]">{quiz.title}</div>
                  <div className="text-xs font-mono text-[#7B8794]">/quizzes/{quiz.slug}</div>
                </td>
                <td className="px-4 py-3 text-xs text-[#AAB4BE] capitalize">
                  {quiz.category} · {quiz.difficulty} · {quiz.passPercentage}% pass
                </td>
                <td className="px-4 py-3 text-xs tabular-nums text-[#F3F4F6]">
                  {quiz.questions.length}
                </td>
                <td className="px-4 py-3 text-xs capitalize">
                  <span
                    className={
                      quiz.status === "published"
                        ? "text-[#A3E635]"
                        : quiz.status === "draft"
                        ? "text-[#F59E0B]"
                        : "text-[#7B8794]"
                    }
                  >
                    {quiz.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3 text-xs">
                    {quiz.status !== "published" ? (
                      <button
                        type="button"
                        disabled={busyId === quiz.id}
                        onClick={() => handleStatusChange(quiz.id, "published")}
                        className="font-medium text-[#A3E635] hover:underline disabled:opacity-50"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === quiz.id}
                        onClick={() => handleStatusChange(quiz.id, "draft")}
                        className="font-medium text-[#AAB4BE] hover:text-[#F3F4F6] disabled:opacity-50"
                      >
                        Unpublish
                      </button>
                    )}
                    {quiz.status !== "archived" ? (
                      <button
                        type="button"
                        disabled={busyId === quiz.id}
                        onClick={() => handleStatusChange(quiz.id, "archived")}
                        className="font-medium text-[#7B8794] hover:text-[#F3F4F6] disabled:opacity-50"
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
