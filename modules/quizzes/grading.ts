import type {
  PublicQuiz,
  QuizQuestionReview,
  ServerQuiz,
} from "@/lib/types/domain";

export function toPublicQuiz(quiz: ServerQuiz): PublicQuiz {
  return {
    id: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    lessonId: quiz.lessonId,
    passPercentage: quiz.passPercentage,
    status: quiz.status,
    questions: [...quiz.questions]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((q) => ({
        id: q.id,
        prompt: q.prompt,
        questionType: q.questionType,
        sortOrder: q.sortOrder,
        options: [...q.options].sort((a, b) => a.sortOrder - b.sortOrder),
      })),
  };
}

export function gradeQuizSubmission(
  quiz: ServerQuiz,
  submittedAnswers: Record<string, string[]>
): {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  reviews: QuizQuestionReview[];
} {
  const orderedQuestions = [...quiz.questions].sort((a, b) => a.sortOrder - b.sortOrder);
  let score = 0;

  const reviews: QuizQuestionReview[] = orderedQuestions.map((question) => {
    const selected = Array.from(new Set(submittedAnswers[question.id] ?? [])).sort();
    const expected = Array.from(new Set(question.correctOptionIds)).sort();

    const isCorrect =
      selected.length === expected.length &&
      selected.every((val, index) => val === expected[index]);

    if (isCorrect) {
      score += 1;
    }

    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedOptionIds: selected,
      correctOptionIds: expected,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const totalQuestions = orderedQuestions.length;
  const percentage =
    totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);
  const passed = percentage >= quiz.passPercentage;

  return {
    score,
    totalQuestions,
    percentage,
    passed,
    reviews,
  };
}
