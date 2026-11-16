"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { submitQuizAction } from "@/app/actions/learning";
import type { PublicQuiz, QuizAttemptRecord } from "@/lib/types/domain";

export function QuizRunner({
  quiz,
  isAuthenticated,
}: {
  quiz: PublicQuiz;
  isAuthenticated: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizAttemptRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleOption = (questionId: string, optionId: string, multiple: boolean) => {
    if (result) return;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    });
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {result ? (
        <div
          className={`rounded-xl border p-6 ${
            result.passed
              ? "border-[#22C55E]/40 bg-[#12221B]"
              : "border-[#F59E0B]/40 bg-[#211A11]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {result.passed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                    <span className="text-[#BBF7D0]">Passed Assessment</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-[#F59E0B]" />
                    <span className="text-[#FDE68A]">Review Recommended</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-sm text-[#AAB4BE] tabular-nums">
                Score: {result.score} of {result.totalQuestions} correct ({result.percentage}% · Pass threshold {quiz.passPercentage}%)
              </p>
              {!isAuthenticated ? (
                <p className="mt-1 text-xs text-[#7B8794]">
                  Guest practice attempt — sign in to persist attempt history on your dashboard.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#303A44] bg-[#171D23] px-4 text-sm font-medium text-[#F3F4F6] hover:bg-[#202831] whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, idx) => {
          const multiple = question.questionType === "multiple_select";
          const selected = answers[question.id] ?? [];
          const review = result?.reviews?.find((r) => r.questionId === question.id);

          return (
            <div
              key={question.id}
              className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 sm:p-6"
            >
              <div className="text-xs text-[#7B8794] tabular-nums">
                Question {idx + 1} of {quiz.questions.length} ·{" "}
                {multiple
                  ? "Multiple select"
                  : question.questionType === "true_false"
                  ? "True or False"
                  : "Single choice"}
              </div>
              <h3 className="mt-2 text-base font-semibold text-[#F3F4F6]">
                {question.prompt}
              </h3>

              <div className="mt-4 space-y-2.5">
                {question.options.map((opt) => {
                  const isChecked = selected.includes(opt.id);
                  const isCorrectOpt = review?.correctOptionIds.includes(opt.id);
                  let optionStyle = "border-[#303A44] bg-[#101418] hover:border-[#4B5866]";
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

        {error ? <p className="text-sm text-[#EF4444]">{error}</p> : null}

        {!result ? (
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center rounded-lg bg-[#A3E635] px-6 text-sm font-semibold text-[#101418] hover:bg-[#B4F04E] disabled:opacity-60 transition-colors"
            >
              {isPending ? "Grading..." : "Submit Answers"}
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
