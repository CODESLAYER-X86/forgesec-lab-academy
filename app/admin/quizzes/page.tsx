import { QuizManager } from "@/components/admin/quiz-manager";
import { requireQuizManager } from "@/modules/auth/session";
import { getAllQuizzesForAdmin } from "@/modules/quizzes/service";

export const metadata = {
  title: "Manage Quizzes | FORGESEC Admin",
};

export default async function AdminQuizzesPage() {
  await requireQuizManager();
  const quizzes = await getAllQuizzesForAdmin();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
          Assessments
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">Quizzes</h1>
        <p className="text-sm text-[#AAB4BE]">
          Publish knowledge checks with server-side answer key grading and immediate explanations.
        </p>
      </header>

      <QuizManager quizzes={quizzes} />
    </div>
  );
}
