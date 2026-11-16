import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/learning/quiz-runner";
import { getCurrentUser } from "@/modules/auth/session";
import { getPublicQuizBySlug } from "@/modules/quizzes/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getPublicQuizBySlug(slug);
  if (!quiz) return { title: "Quiz Not Found" };
  return {
    title: quiz.title,
    description: quiz.description,
  };
}

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [quiz, user] = await Promise.all([
    getPublicQuizBySlug(slug),
    getCurrentUser(),
  ]);
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-[#7B8794]">
        <Link href="/quizzes" className="hover:text-[#F3F4F6]">
          Quizzes
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#AAB4BE]">{quiz.title}</span>
      </nav>

      <header className="border-b border-[#303A44] pb-6">
        <div className="text-xs text-[#7B8794] capitalize tabular-nums">
          {quiz.category.replace("-", " ")} · {quiz.difficulty} ·{" "}
          {quiz.questions.length} questions · Pass score {quiz.passPercentage}%
        </div>
        <h1 className="mt-2 text-3xl font-bold text-[#F3F4F6]">{quiz.title}</h1>
        <p className="mt-2 text-sm text-[#AAB4BE]">{quiz.description}</p>
      </header>

      <QuizRunner quiz={quiz} isAuthenticated={Boolean(user)} />
    </div>
  );
}
