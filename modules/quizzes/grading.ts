import type {
  PublicQuiz,
  QuizQuestionReview,
  ServerQuiz,
} from "@/lib/types/domain";

export function normalizeCommandAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/^\$\s+/, "")
    .replace(/\s+/g, " ");
}

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
        placeholder: q.placeholder,
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
    if (question.questionType === "command_input") {
      const rawSubmitted = submittedAnswers[question.id]?.[0] ?? "";
      const normalizedSubmitted = normalizeCommandAnswer(rawSubmitted);
      const acceptedPool =
        question.acceptedAnswers && question.acceptedAnswers.length > 0
          ? question.acceptedAnswers
          : question.correctOptionIds;
      const normalizedAccepted = acceptedPool.map(normalizeCommandAnswer).filter(Boolean);
      const isCorrect =
        normalizedSubmitted.length > 0 &&
        normalizedAccepted.includes(normalizedSubmitted);

      if (isCorrect) {
        score += 1;
      }

      return {
        questionId: question.id,
        prompt: question.prompt,
        questionType: question.questionType,
        selectedOptionIds: [],
        correctOptionIds: [],
        submittedText: rawSubmitted.trim(),
        expectedAnswer: acceptedPool[0] ?? "",
        isCorrect,
        explanation: question.explanation,
      };
    }

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
      questionType: question.questionType,
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
