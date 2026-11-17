"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Terminal,
  XCircle,
} from "lucide-react";
import { submitQuizAction } from "@/app/actions/learning";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import type { PublicQuiz, QuizAttemptRecord } from "@/lib/types/domain";

export interface QuizLessonContext {
  lessonId: string;
  pathId: string;
  slug: string;
  title: string;
  isCompleted: boolean;
  nextLesson?: {
    slug: string;
    title: string;
  } | null;
}

export interface PreviousQuizBest {
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

export function QuizRunner({
  quiz,
  isAuthenticated,
  lessonContext,
  previousBest,
}: {
  quiz: PublicQuiz;
  isAuthenticated?: boolean;
  lessonContext?: QuizLessonContext;
  previousBest?: PreviousQuizBest | null;
}) {
  const {
    user,
    quizBestBySlug,
    setLessonCompletedOptimistic,
    setQuizBestOptimistic,
  } = useAuthSession();

  const resolvedAuth = isAuthenticated ?? Boolean(user);
  const resolvedPreviousBest =
    previousBest !== undefined ? previousBest : quizBestBySlug[quiz.slug] ?? null;

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizAttemptRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUnansweredHighlight, setShowUnansweredHighlight] = useState(false);
  const [autoCompletedModule, setAutoCompletedModule] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isQuestionAnswered = (questionId: string, type: string) => {
    const vals = answers[questionId] ?? [];
    if (type === "command_input") {
      return (vals[0] ?? "").trim().length > 0;
    }
    return vals.length > 0;
  };

  const answeredCount = quiz.questions.filter((q) =>
    isQuestionAnswered(q.id, q.questionType)
  ).length;
  const totalCount = quiz.questions.length;
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100);

  const toggleOption = (questionId: string, optionId: string, multiple: boolean) => {
    if (result) return;
    setError(null);
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (!multiple) {
        return { ...prev, [questionId]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const updateCommandInput = (questionId: string, value: string) => {
    if (result) return;
    setError(null);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value ? [value] : [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const firstUnanswered = quiz.questions.find(
      (q) => !isQuestionAnswered(q.id, q.questionType)
    );
    if (firstUnanswered) {
      const remaining = totalCount - answeredCount;
      setShowUnansweredHighlight(true);
      setError(
        `Please answer all ${totalCount} questions before submitting (${remaining} remaining).`
      );
      const el = document.getElementById(`quiz-question-${firstUnanswered.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setShowUnansweredHighlight(false);
    startTransition(async () => {
      const res = await submitQuizAction({
        slug: quiz.slug,
        answers,
      });
      if (!res.ok || !res.result) {
        setError(res.error ?? "Could not score quiz.");
        return;
      }
      setResult(res.result);

      if (resolvedAuth) {
        setQuizBestOptimistic(quiz.slug, {
          percentage: res.result.percentage,
          passed: res.result.passed,
          submittedAt: res.result.submittedAt,
        });
        if (res.result.percentage === 100 && res.result.passed && lessonContext) {
          setLessonCompletedOptimistic(lessonContext.lessonId, true);
          setAutoCompletedModule(true);
        }
      }
    });
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError(null);
    setShowUnansweredHighlight(false);
    setAutoCompletedModule(false);
  };

  const requiredPass = lessonContext ? 100 : quiz.passPercentage;
  const didPass = result
    ? lessonContext
      ? result.percentage === 100 && result.passed
      : result.passed
    : false;
  const previousDidPass = resolvedPreviousBest
    ? lessonContext
      ? resolvedPreviousBest.percentage === 100
      : resolvedPreviousBest.passed
    : false;

  return (
    <div className="space-y-6">
      {/* Progress & Previous Best Status Bar */}
      {!result ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[#F3F4F6] tabular-nums">
              Progress: {answeredCount} of {totalCount} answered
            </span>
            {resolvedPreviousBest ? (
              <span
                className={`tabular-nums font-medium ${
                  previousDidPass ? "text-[#22C55E]" : "text-[#F59E0B]"
                }`}
              >
                Previous best: {resolvedPreviousBest.percentage}% ·{" "}
                {previousDidPass
                  ? lessonContext
                    ? "Completed (100%)"
                    : "Passed"
                  : lessonContext
                  ? "100% required to complete"
                  : `${requiredPass}% required to pass`}
              </span>
            ) : (
              <span className="text-[#7B8794] tabular-nums">
                {lessonContext
                  ? "Required score to complete module: 100%"
                  : `Required score to pass: ${requiredPass}%`}
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#101418]">
            <div
              className="h-full bg-[#A3E635] transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      ) : null}

      {result ? (
        <div
          className={`rounded-xl border p-6 ${
            didPass
              ? "border-[#22C55E]/40 bg-[#12221B]"
              : "border-[#F59E0B]/40 bg-[#211A11]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {didPass ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                    <span className="text-[#BBF7D0]">
                      {result.percentage === 100
                        ? "Perfect Score (100%)"
                        : `Passed (${result.percentage}%)`}
                      {autoCompletedModule || lessonContext?.isCompleted
                        ? " · Module Marked Complete"
                        : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-[#F59E0B]" />
                    <span className="text-[#FDE68A]">
                      {lessonContext
                        ? "100% Required to Complete Module — Review & Retake"
                        : `${requiredPass}% Required to Pass — Review & Retake`}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-[#AAB4BE] tabular-nums">
                Score: {result.score} of {result.totalQuestions} correct ({result.percentage}%) ·{" "}
                <span className="whitespace-nowrap">
                  Required score: {requiredPass}%
                </span>
              </p>
              {!resolvedAuth ? (
                <p className="text-xs text-[#7B8794]">
                  Guest practice attempt —{" "}
                  <Link href="/login" className="text-[#A3E635] underline">
                    sign in
                  </Link>{" "}
                  to save attempt history and module completion on your dashboard.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#303A44] bg-[#171D23] px-4 text-sm font-medium text-[#F3F4F6] hover:bg-[#202831] whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Retake Quiz</span>
              </button>

              {result.passed && lessonContext?.nextLesson ? (
                <Link
                  href={`/learn/lessons/${lessonContext.nextLesson.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#A3E635] px-4 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] transition-colors whitespace-nowrap"
                >
                  <span>Next Module</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, idx) => {
          const multiple = question.questionType === "multiple_select";
          const isCommand = question.questionType === "command_input";
          const selected = answers[question.id] ?? [];
          const answered = isQuestionAnswered(question.id, question.questionType);
          const review = result?.reviews?.find((r) => r.questionId === question.id);

          return (
            <div
              key={question.id}
              id={`quiz-question-${question.id}`}
              className={`rounded-xl border bg-[#171D23] p-5 sm:p-6 transition-colors ${
                showUnansweredHighlight && !answered && !result
                  ? "border-[#F59E0B]/60"
                  : "border-[#303A44]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#7B8794] tabular-nums">
                <span>
                  Question {idx + 1} of {quiz.questions.length} ·{" "}
                  {isCommand
                    ? "Command identification"
                    : multiple
                    ? "Multiple select"
                    : question.questionType === "true_false"
                    ? "True or False"
                    : "Single choice"}
                </span>
                {showUnansweredHighlight && !answered && !result ? (
                  <span className="font-medium text-[#F59E0B]">Answer required</span>
                ) : null}
              </div>

              <h3 className="mt-2 text-base font-semibold text-[#F3F4F6]">
                {question.prompt}
              </h3>

              {isCommand ? (
                <div className="mt-4 space-y-2.5">
                  <label
                    htmlFor={`cmd-input-${question.id}`}
                    className="sr-only"
                  >
                    Command answer for question {idx + 1}
                  </label>
                  <div
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 font-mono text-sm transition-colors ${
                      review
                        ? review.isCorrect
                          ? "border-[#22C55E]/50 bg-[#12221B]"
                          : "border-[#EF4444]/50 bg-[#251315]"
                        : "border-[#303A44] bg-[#0C1014] focus-within:border-[#A3E635]"
                    }`}
                  >
                    <Terminal
                      className="h-4 w-4 shrink-0 text-[#A3E635]"
                      aria-hidden="true"
                    />
                    <span className="select-none text-[#7B8794]" aria-hidden="true">
                      $
                    </span>
                    <input
                      id={`cmd-input-${question.id}`}
                      type="text"
                      value={selected[0] ?? ""}
                      disabled={Boolean(result)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={question.placeholder ?? "Type command..."}
                      onChange={(e) =>
                        updateCommandInput(question.id, e.target.value)
                      }
                      className="w-full bg-transparent text-[#F3F4F6] placeholder:text-[#52606D] focus:outline-none disabled:opacity-85"
                    />
                  </div>
                  {review && !review.isCorrect && review.expectedAnswer ? (
                    <div className="rounded-lg border border-[#303A44] bg-[#0C1014] px-3.5 py-2 text-xs text-[#AAB4BE]">
                      Expected command:{" "}
                      <code className="font-mono text-[#A3E635]">
                        {review.expectedAnswer}
                      </code>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {question.options.map((opt) => {
                    const isChecked = selected.includes(opt.id);
                    const isCorrectOpt = review?.correctOptionIds.includes(opt.id);
                    let optionStyle =
                      "border-[#303A44] bg-[#101418] hover:border-[#4B5866]";
                    if (review) {
                      if (isCorrectOpt) {
                        optionStyle = "border-[#22C55E]/50 bg-[#12221B]";
                      } else if (isChecked && !isCorrectOpt) {
                        optionStyle = "border-[#EF4444]/50 bg-[#251315]";
                      }
                    } else if (isChecked) {
                      optionStyle = "border-[#A3E635] bg-[#173D35]/60";
                    }

                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm transition-colors ${optionStyle}`}
                      >
                        <input
                          type={multiple ? "checkbox" : "radio"}
                          name={`q-${question.id}`}
                          checked={isChecked}
                          disabled={Boolean(result)}
                          onChange={() => toggleOption(question.id, opt.id, multiple)}
                          className="mt-1 accent-[#A3E635]"
                        />
                        <span className="text-[#E5E7EB]">
                          <span className="font-mono text-xs text-[#7B8794] mr-2">
                            {opt.label}.
                          </span>
                          {opt.optionText}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {review ? (
                <div
                  className={`mt-4 rounded-lg border p-3.5 text-xs leading-relaxed ${
                    review.isCorrect
                      ? "border-[#22C55E]/30 bg-[#101A15] text-[#BBF7D0]"
                      : "border-[#F59E0B]/30 bg-[#1B160E] text-[#FDE68A]"
                  }`}
                >
                  <span className="font-semibold">
                    {review.isCorrect ? "Correct: " : "Explanation: "}
                  </span>
                  <span className="text-[#E5E7EB]">{review.explanation}</span>
                </div>
              ) : null}
            </div>
          );
        })}

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-[#F59E0B]/40 bg-[#211A11] px-4 py-3 text-sm text-[#FDE68A]"
          >
            {error}
          </div>
        ) : null}

        {!result ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-[#7B8794] tabular-nums">
              {answeredCount} of {totalCount} questions answered
            </span>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center rounded-lg bg-[#A3E635] px-6 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {isPending ? "Grading..." : "Submit Answers"}
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
