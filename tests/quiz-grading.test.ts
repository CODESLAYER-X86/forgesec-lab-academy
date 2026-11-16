import { describe, expect, it } from "vitest";
import type { ServerQuiz } from "@/lib/types/domain";
import { gradeQuizSubmission, toPublicQuiz } from "@/modules/quizzes/grading";

const SAMPLE_QUIZ: ServerQuiz = {
  id: "quiz-linux-test",
  slug: "linux-test",
  title: "Linux Permissions & Signals",
  description: "Verify fundamental POSIX permissions and process signal concepts.",
  category: "linux",
  difficulty: "beginner",
  passPercentage: 70,
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  questions: [
    {
      id: "q1",
      prompt: "Which numeric mode grants rwxr-x---?",
      questionType: "single_choice",
      sortOrder: 1,
      explanation: "7 (rwx), 5 (r-x), 0 (---) yields 0750.",
      correctOptionIds: ["q1-b"],
      options: [
        { id: "q1-a", label: "A", optionText: "0777", sortOrder: 1 },
        { id: "q1-b", label: "B", optionText: "0750", sortOrder: 2 },
        { id: "q1-c", label: "C", optionText: "0644", sortOrder: 3 },
      ],
    },
    {
      id: "q2",
      prompt: "Select all valid commands to inspect processes.",
      questionType: "multiple_select",
      sortOrder: 2,
      explanation: "Both ps aux and top list active processes.",
      correctOptionIds: ["q2-a", "q2-c"],
      options: [
        { id: "q2-a", label: "A", optionText: "ps aux", sortOrder: 1 },
        { id: "q2-b", label: "B", optionText: "chmod", sortOrder: 2 },
        { id: "q2-c", label: "C", optionText: "top", sortOrder: 3 },
      ],
    },
    {
      id: "q3",
      prompt: "SIGKILL can be intercepted by a user-space signal handler.",
      questionType: "true_false",
      sortOrder: 3,
      explanation: "SIGKILL is handled directly by the kernel and cannot be caught.",
      correctOptionIds: ["q3-false"],
      options: [
        { id: "q3-true", label: "A", optionText: "True", sortOrder: 1 },
        { id: "q3-false", label: "B", optionText: "False", sortOrder: 2 },
      ],
    },
  ],
};

describe("Quiz public sanitization & server-side grading", () => {
  it("strips correctOptionIds and explanations when converting to PublicQuiz", () => {
    const publicQuiz = toPublicQuiz(SAMPLE_QUIZ);
    expect(publicQuiz.questions).toHaveLength(3);
    for (const q of publicQuiz.questions) {
      expect("correctOptionIds" in q).toBe(false);
      expect("explanation" in q).toBe(false);
    }
  });

  it("grades passing submissions accurately across single, multi-select, and true/false", () => {
    const result = gradeQuizSubmission(SAMPLE_QUIZ, {
      q1: ["q1-b"],
      q2: ["q2-c", "q2-a"], // order-insensitive
      q3: ["q3-false"],
    });

    expect(result.score).toBe(3);
    expect(result.totalQuestions).toBe(3);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.reviews.every((r) => r.isCorrect)).toBe(true);
  });

  it("marks partial multi-select answers as incorrect and fails below passPercentage", () => {
    const result = gradeQuizSubmission(SAMPLE_QUIZ, {
      q1: ["q1-b"],
      q2: ["q2-a"], // missing q2-c
      q3: ["q3-true"], // wrong
    });

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(33);
    expect(result.passed).toBe(false);
    expect(result.reviews[1].isCorrect).toBe(false);
    expect(result.reviews[1].explanation).toContain("ps aux");
  });
});
