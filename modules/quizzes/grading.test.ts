import test from "node:test";
import assert from "node:assert/strict";
import type { ServerQuiz } from "../../lib/types/domain";
import {
  gradeQuizSubmission,
  normalizeCommandAnswer,
  toPublicQuiz,
} from "./grading";

const SAMPLE_QUIZ: ServerQuiz = {
  id: "quiz-test",
  slug: "linux-module-test",
  title: "Module Knowledge Check",
  description: "Test single choice, multi-select, true/false, and command input.",
  category: "linux",
  difficulty: "beginner",
  lessonId: "linux-001",
  passPercentage: 70,
  status: "published",
  createdAt: "2026-11-16T00:00:00.000Z",
  updatedAt: "2026-11-16T00:00:00.000Z",
  questions: [
    {
      id: "q1",
      prompt: "Which numeric mode grants rwxr-x---?",
      questionType: "single_choice",
      sortOrder: 1,
      explanation: "750 gives owner rwx, group r-x, others none.",
      correctOptionIds: ["q1-b"],
      options: [
        { id: "q1-a", label: "A", optionText: "0777", sortOrder: 1 },
        { id: "q1-b", label: "B", optionText: "0750", sortOrder: 2 },
      ],
    },
    {
      id: "q2",
      prompt: "Select commands that inspect running processes.",
      questionType: "multiple_select",
      sortOrder: 2,
      explanation: "Both ps aux and top inspect running processes.",
      correctOptionIds: ["q2-a", "q2-c"],
      options: [
        { id: "q2-a", label: "A", optionText: "ps aux", sortOrder: 1 },
        { id: "q2-b", label: "B", optionText: "chmod", sortOrder: 2 },
        { id: "q2-c", label: "C", optionText: "top", sortOrder: 3 },
      ],
    },
    {
      id: "q3",
      prompt: "Identify the command to print your Linux kernel release.",
      questionType: "command_input",
      sortOrder: 3,
      placeholder: "e.g. uname -r",
      explanation: "uname -r displays the kernel release version.",
      correctOptionIds: [],
      acceptedAnswers: ["uname -r", "uname --kernel-release"],
      options: [],
    },
  ],
};

test("normalizeCommandAnswer trims, collapses spaces, and strips leading $ prompt", () => {
  assert.equal(normalizeCommandAnswer("  $   uname   -r  "), "uname -r");
  assert.equal(normalizeCommandAnswer("ls -la"), "ls -la");
  assert.equal(normalizeCommandAnswer(""), "");
});

test("toPublicQuiz strips answer keys, acceptedAnswers, and explanations", () => {
  const pub = toPublicQuiz(SAMPLE_QUIZ);
  assert.equal(pub.questions.length, 3);
  for (const q of pub.questions) {
    assert.equal("correctOptionIds" in q, false);
    assert.equal("acceptedAnswers" in q, false);
    assert.equal("explanation" in q, false);
  }
  assert.equal(pub.questions[2]?.placeholder, "e.g. uname -r");
});

test("gradeQuizSubmission grades command_input aliases and calculates pass threshold", () => {
  const res = gradeQuizSubmission(SAMPLE_QUIZ, {
    q1: ["q1-b"],
    q2: ["q2-c", "q2-a"],
    q3: ["$   uname   -r"],
  });

  assert.equal(res.score, 3);
  assert.equal(res.totalQuestions, 3);
  assert.equal(res.percentage, 100);
  assert.equal(res.passed, true);
  assert.equal(res.reviews[2]?.expectedAnswer, "uname -r");
  assert.equal(res.reviews[2]?.submittedText, "$   uname   -r");
});

test("gradeQuizSubmission fails wrong command_input and marks partial multi-select wrong", () => {
  const res = gradeQuizSubmission(SAMPLE_QUIZ, {
    q1: ["q1-b"],
    q2: ["q2-a"],
    q3: ["whoami"],
  });

  assert.equal(res.score, 1);
  assert.equal(res.percentage, 33);
  assert.equal(res.passed, false);
  assert.equal(res.reviews[1]?.isCorrect, false);
  assert.equal(res.reviews[2]?.isCorrect, false);
  assert.equal(res.reviews[2]?.expectedAnswer, "uname -r");
});
