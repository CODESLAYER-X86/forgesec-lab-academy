import { isSupabaseConfigured } from "@/lib/env";
import { getCurriculumSeed, readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  PublicQuiz,
  QuestionType,
  QuizAttemptRecord,
  QuizStatus,
  ServerQuiz,
} from "@/lib/types/domain";
import { gradeQuizSubmission, toPublicQuiz } from "@/modules/quizzes/grading";

function findCurriculumQuiz(slug: string, includeUnpublished = false): ServerQuiz | null {
  const seed = getCurriculumSeed();
  return (
    seed.quizzes.find(
      (q) => q.slug === slug && (includeUnpublished || q.status === "published")
    ) ?? null
  );
}

async function loadSupabaseQuizBySlug(slug: string, includeUnpublished = false): Promise<ServerQuiz | null> {
  const admin = createSupabaseAdminClient();
  const client = admin ?? (await createSupabaseServerClient());
  if (!client) {
    return findCurriculumQuiz(slug, includeUnpublished);
  }

  let query = client.from("quizzes").select("*").eq("slug", slug);
  if (!includeUnpublished) query = query.eq("status", "published");
  const { data: quizRow } = await query.maybeSingle();
  if (!quizRow) {
    return findCurriculumQuiz(slug, includeUnpublished);
  }

  const { data: qRows } = await client
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizRow.id)
    .order("sort_order");

  if (!qRows || qRows.length === 0) {
    return findCurriculumQuiz(slug, includeUnpublished);
  }

  const questionIds = qRows.map((q) => q.id);
  const { data: optRows } = questionIds.length
    ? await client.from("quiz_options").select("*").in("question_id", questionIds).order("sort_order")
    : { data: [] };

  const { data: keyRows } =
    admin && questionIds.length
      ? await admin.from("quiz_answer_keys").select("*").in("question_id", questionIds)
      : { data: [] };

  // Map built-in curriculum answer keys to Supabase option UUIDs if SUPABASE_SERVICE_ROLE_KEY is omitted
  const seedQuiz = findCurriculumQuiz(slug, true);
  const keyMap = new Map<
    string,
    { correctOptionIds: string[]; acceptedAnswers?: string[] }
  >(
    (keyRows ?? []).map((k) => [
      k.question_id,
      {
        correctOptionIds: Array.isArray(k.correct_option_ids)
          ? (k.correct_option_ids as string[])
          : [],
        acceptedAnswers: Array.isArray(k.accepted_answers)
          ? (k.accepted_answers as string[])
          : undefined,
      },
    ])
  );

  if (keyMap.size === 0 && seedQuiz) {
    for (const qRow of qRows) {
      const seedQ = seedQuiz.questions.find((sq) => sq.sortOrder === qRow.sort_order);
      if (!seedQ) continue;
      const qOptRows = (optRows ?? []).filter((o) => o.question_id === qRow.id);
      const correctLabels = new Set(
        seedQ.options
          .filter((so) => seedQ.correctOptionIds.includes(so.id))
          .map((so) => so.label.toUpperCase())
      );
      const mappedOptionUuids = qOptRows
        .filter((o) => correctLabels.has(String(o.label).toUpperCase()))
        .map((o) => String(o.id));
      keyMap.set(qRow.id, {
        correctOptionIds: mappedOptionUuids,
        acceptedAnswers: seedQ.acceptedAnswers,
      });
    }
  }

  return {
    id: quizRow.id,
    slug: quizRow.slug,
    title: quizRow.title,
    description: quizRow.description,
    category: quizRow.category,
    difficulty: quizRow.difficulty,
    lessonId: quizRow.lesson_id ?? undefined,
    passPercentage: Number(quizRow.pass_percentage ?? 100),
    status: quizRow.status,
    createdAt: quizRow.created_at,
    updatedAt: quizRow.updated_at,
    questions: qRows.map((q) => {
      const answerKey = keyMap.get(q.id);
      return {
        id: q.id,
        prompt: q.prompt,
        questionType: q.question_type,
        sortOrder: q.sort_order,
        placeholder: q.placeholder ?? undefined,
        explanation: q.explanation,
        correctOptionIds: answerKey?.correctOptionIds ?? [],
        acceptedAnswers: answerKey?.acceptedAnswers,
        options: (optRows ?? [])
          .filter((o) => o.question_id === q.id)
          .map((o) => ({
            id: o.id,
            label: o.label,
            optionText: o.option_text,
            sortOrder: o.sort_order,
          })),
      };
    }),
  };
}

export async function getPublishedQuizzes(): Promise<PublicQuiz[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const dbQuizzes: PublicQuiz[] = [];
    if (supabase) {
      const { data: rows } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(*, quiz_options(*))")
        .eq("status", "published")
        .order("title");
      for (const row of rows ?? []) {
        const qList = (row.quiz_questions as Array<Record<string, unknown>>) ?? [];
        if (qList.length === 0) continue;
        dbQuizzes.push({
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          category: row.category,
          difficulty: row.difficulty,
          lessonId: row.lesson_id ?? undefined,
          passPercentage: Number(row.pass_percentage ?? 100),
          status: row.status,
          questions: qList.map((q) => ({
            id: String(q.id),
            prompt: String(q.prompt),
            questionType: q.question_type as QuestionType,
            sortOrder: Number(q.sort_order ?? 0),
            placeholder: q.placeholder ? String(q.placeholder) : undefined,
            options: ((q.quiz_options as Array<Record<string, unknown>>) ?? []).map((o) => ({
              id: String(o.id),
              label: String(o.label),
              optionText: String(o.option_text),
              sortOrder: Number(o.sort_order ?? 0),
            })),
          })),
        });
      }
    }

    const bySlug = new Map<string, PublicQuiz>(dbQuizzes.map((q) => [q.slug, q]));
    for (const seedQuiz of getCurriculumSeed().quizzes) {
      if (seedQuiz.status === "published" && !bySlug.has(seedQuiz.slug)) {
        bySlug.set(seedQuiz.slug, toPublicQuiz(seedQuiz));
      }
    }
    return Array.from(bySlug.values());
  }

  const db = readPreviewDb();
  return db.quizzes.filter((q) => q.status === "published").map(toPublicQuiz);
}

export async function getPublicQuizBySlug(slug: string): Promise<PublicQuiz | null> {
  if (isSupabaseConfigured()) {
    const quiz = await loadSupabaseQuizBySlug(slug, false);
    return quiz ? toPublicQuiz(quiz) : null;
  }
  const db = readPreviewDb();
  const found = db.quizzes.find((q) => q.slug === slug && q.status === "published");
  return found ? toPublicQuiz(found) : null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitQuizAttempt(params: {
  slug: string;
  userId: string | null;
  answers: Record<string, string[]>;
}): Promise<QuizAttemptRecord> {
  if (isSupabaseConfigured()) {
    const quiz = await loadSupabaseQuizBySlug(params.slug, false);
    if (!quiz) throw new Error("Quiz not found");
    const result = gradeQuizSubmission(quiz, params.answers);
    const now = new Date().toISOString();

    let attemptId = `guest-${Date.now()}`;
    if (params.userId && UUID_REGEX.test(quiz.id)) {
      const admin = createSupabaseAdminClient();
      const client = admin ?? (await createSupabaseServerClient());
      if (client) {
        const { data: attempt } = await client
          .from("quiz_attempts")
          .insert({
            quiz_id: quiz.id,
            user_id: params.userId,
            score: result.score,
            total_questions: result.totalQuestions,
            percentage: result.percentage,
            passed: result.passed,
            submitted_at: now,
          })
          .select("id")
          .single();
        if (attempt) {
          attemptId = attempt.id;
          const validOptionQuestions = result.reviews.filter((r) => UUID_REGEX.test(r.questionId));
          if (validOptionQuestions.length > 0) {
            await client.from("quiz_attempt_answers").insert(
              validOptionQuestions.map((r) => ({
                attempt_id: attempt.id,
                question_id: r.questionId,
                selected_option_ids: r.selectedOptionIds.filter((id) => UUID_REGEX.test(id)),
                submitted_text: r.submittedText ?? null,
                is_correct: r.isCorrect,
              }))
            );
          }
        }
      }
    }

    return {
      id: attemptId,
      quizId: quiz.id,
      quizSlug: quiz.slug,
      quizTitle: quiz.title,
      userId: params.userId ?? "guest",
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      passed: result.passed,
      submittedAt: now,
      reviews: result.reviews,
    };
  }

  const db = readPreviewDb();
  const quiz = db.quizzes.find((q) => q.slug === params.slug && q.status === "published");
  if (!quiz) throw new Error("Quiz not found");
  const result = gradeQuizSubmission(quiz, params.answers);
  const now = new Date().toISOString();

  const record: QuizAttemptRecord = {
    id: `att-${Date.now()}`,
    quizId: quiz.id,
    quizSlug: quiz.slug,
    quizTitle: quiz.title,
    userId: params.userId ?? "guest",
    score: result.score,
    totalQuestions: result.totalQuestions,
    percentage: result.percentage,
    passed: result.passed,
    submittedAt: now,
    reviews: result.reviews,
  };

  if (params.userId) {
    db.quizAttempts.unshift({
      id: record.id,
      quizId: record.quizId,
      quizSlug: record.quizSlug,
      quizTitle: record.quizTitle,
      userId: params.userId,
      score: record.score,
      totalQuestions: record.totalQuestions,
      percentage: record.percentage,
      passed: record.passed,
      submittedAt: record.submittedAt,
    });
    db.quizAttempts = db.quizAttempts.slice(0, 200);
    writePreviewDb(db);
  }

  return record;
}

export async function getUserQuizAttempts(userId: string): Promise<QuizAttemptRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("quiz_attempts")
      .select("*, quizzes(slug, title)")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      quizId: row.quiz_id,
      quizSlug: (row.quizzes as { slug?: string } | null)?.slug ?? "",
      quizTitle: (row.quizzes as { title?: string } | null)?.title ?? "Quiz",
      userId: row.user_id,
      score: row.score,
      totalQuestions: row.total_questions,
      percentage: Number(row.percentage),
      passed: Boolean(row.passed),
      submittedAt: row.submitted_at,
    }));
  }

  const db = readPreviewDb();
  return db.quizAttempts
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getAllQuizzesForAdmin(): Promise<ServerQuiz[]> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];
    const { data: rows } = await admin.from("quizzes").select("*").order("updated_at", { ascending: false });
    const out: ServerQuiz[] = [];
    for (const r of rows ?? []) {
      const full = await loadSupabaseQuizBySlug(r.slug, true);
      if (full) out.push(full);
    }
    return out;
  }
  return readPreviewDb().quizzes;
}

export async function adminCreateQuiz(input: {
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  passPercentage: number;
  status: QuizStatus;
  questionPrompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}): Promise<ServerQuiz> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Service role required");
    const { data: quizRow, error } = await admin
      .from("quizzes")
      .insert({
        title: input.title,
        slug: input.slug,
        description: input.description,
        category: input.category,
        difficulty: input.difficulty,
        pass_percentage: input.passPercentage,
        status: input.status,
      })
      .select("*")
      .single();
    if (error || !quizRow) throw new Error(error?.message ?? "Failed to create quiz");

    const { data: qRow } = await admin
      .from("quiz_questions")
      .insert({
        quiz_id: quizRow.id,
        prompt: input.questionPrompt,
        question_type: "single_choice",
        explanation: input.explanation,
        sort_order: 1,
      })
      .select("*")
      .single();

    if (qRow) {
      const labels = ["A", "B", "C", "D"];
      const { data: optRows } = await admin
        .from("quiz_options")
        .insert(
          input.options.map((text, idx) => ({
            question_id: qRow.id,
            label: labels[idx] ?? String(idx + 1),
            option_text: text,
            sort_order: idx + 1,
          }))
        )
        .select("*");
      const correctOpt = optRows?.[input.correctIndex] ?? optRows?.[0];
      if (correctOpt) {
        await admin.from("quiz_answer_keys").insert({
          question_id: qRow.id,
          correct_option_ids: [correctOpt.id],
        });
      }
    }
    const created = await loadSupabaseQuizBySlug(input.slug, true);
    if (!created) throw new Error("Failed to load created quiz");
    return created;
  }

  const db = readPreviewDb();
  if (db.quizzes.some((q) => q.slug === input.slug)) {
    throw new Error("A quiz with that slug already exists.");
  }
  const qid = `q-${Date.now()}`;
  const labels = ["A", "B", "C", "D"];
  const options = input.options.map((text, idx) => ({
    id: `${qid}-opt-${idx}`,
    label: labels[idx] ?? String(idx + 1),
    optionText: text,
    sortOrder: idx + 1,
  }));
  const newQuiz: ServerQuiz = {
    id: `quiz-${Date.now()}`,
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: input.category,
    difficulty: input.difficulty,
    passPercentage: input.passPercentage,
    status: input.status,
    createdAt: now,
    updatedAt: now,
    questions: [
      {
        id: qid,
        prompt: input.questionPrompt,
        questionType: "single_choice",
        sortOrder: 1,
        explanation: input.explanation,
        options,
        correctOptionIds: [options[input.correctIndex]?.id ?? options[0].id],
      },
    ],
  };
  db.quizzes.unshift(newQuiz);
  writePreviewDb(db);
  return newQuiz;
}

export async function adminUpdateQuizStatus(quizId: string, status: QuizStatus): Promise<void> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Service role required");
    await admin.from("quizzes").update({ status }).eq("id", quizId);
    return;
  }
  const db = readPreviewDb();
  const target = db.quizzes.find((q) => q.id === quizId);
  if (target) {
    target.status = status;
    target.updatedAt = new Date().toISOString();
    writePreviewDb(db);
  }
}
