import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedQuizzes } from "@/modules/quizzes/service";

export const metadata: Metadata = {
  title: "Quizzes & Assessments",
  description:
    "Verify your understanding of Linux, networking, and web security through server-scored quizzes.",
};

export default async function QuizzesIndexPage() {
  const quizzes = await getPublishedQuizzes();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Quizzes &amp; Assessments</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#AAB4BE]">
          Practice freely as a guest or sign in to save your attempt history and pass results
          to your student dashboard. All grading is performed securely on the server.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quizzes/${quiz.slug}`}
            className="group flex flex-col justify-between rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
          >
            <div>
              <div className="text-xs text-[#7B8794] capitalize tabular-nums">
                {quiz.category.replace("-", " ")} · {quiz.difficulty} ·{" "}
                {quiz.questions.length} questions
              </div>
              <h2 className="mt-2 text-lg font-semibold text-[#F3F4F6] group-hover:text-[#A3E635]">
                {quiz.title}
              </h2>
              <p className="mt-2 text-sm text-[#AAB4BE]">{quiz.description}</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#262F38] pt-4 text-xs text-[#AAB4BE]">
              <span className="tabular-nums">Pass mark: {quiz.passPercentage}%</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#A3E635]">
                Start Quiz <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
