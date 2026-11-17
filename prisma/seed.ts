import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { getCurriculumSeed } from "../lib/store/preview-store";

function deterministicUuid(key: string): string {
  const hash = crypto.createHash("sha256").update(`forgesec-academy:${key}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    "a" + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}

function sqlLiteral(val: string | null | undefined): string {
  if (val === null || val === undefined) return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

function sqlTextArray(arr: string[]): string {
  if (!arr.length) return "ARRAY[]::TEXT[]";
  return `ARRAY[${arr.map((s) => sqlLiteral(s)).join(", ")}]::TEXT[]`;
}

function sqlUuidArray(arr: string[]): string {
  if (!arr.length) return "ARRAY[]::UUID[]";
  return `ARRAY[${arr.map((s) => `${sqlLiteral(s)}::UUID`).join(", ")}]::UUID[]`;
}

export function buildFullSeedSql(): string {
  const seed = getCurriculumSeed();
  const lines: string[] = [
    "-- supabase/seed.sql",
    "-- Auto-generated complete curriculum seed: 20 quizzes (Linux, Networking, Web Security) + 18 practical assignments",
    "",
  ];

  for (const quiz of seed.quizzes) {
    const quizUuid = deterministicUuid(`quiz:${quiz.slug}`);
    lines.push(
      `INSERT INTO public.quizzes (id, slug, title, description, category, difficulty, lesson_id, pass_percentage, status) VALUES (${sqlLiteral(quizUuid)}, ${sqlLiteral(quiz.slug)}, ${sqlLiteral(quiz.title)}, ${sqlLiteral(quiz.description)}, ${sqlLiteral(quiz.category)}, ${sqlLiteral(quiz.difficulty)}, ${sqlLiteral(quiz.lessonId ?? null)}, ${quiz.passPercentage}, ${sqlLiteral(quiz.status)}) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category, difficulty = EXCLUDED.difficulty, lesson_id = EXCLUDED.lesson_id, pass_percentage = EXCLUDED.pass_percentage, status = EXCLUDED.status, updated_at = NOW();`
    );

    lines.push(
      `DELETE FROM public.quiz_questions WHERE quiz_id = (SELECT id FROM public.quizzes WHERE slug = ${sqlLiteral(quiz.slug)});`
    );

    for (const q of quiz.questions) {
      const qUuid = deterministicUuid(`question:${quiz.slug}:${q.sortOrder}`);
      lines.push(
        `INSERT INTO public.quiz_questions (id, quiz_id, prompt, question_type, placeholder, explanation, sort_order) VALUES (${sqlLiteral(qUuid)}, (SELECT id FROM public.quizzes WHERE slug = ${sqlLiteral(quiz.slug)}), ${sqlLiteral(q.prompt)}, ${sqlLiteral(q.questionType)}, ${sqlLiteral(q.placeholder ?? null)}, ${sqlLiteral(q.explanation)}, ${q.sortOrder});`
      );

      const optionIdMap = new Map<string, string>();
      for (const opt of q.options) {
        const optUuid = deterministicUuid(
          `option:${quiz.slug}:${q.sortOrder}:${opt.sortOrder}`
        );
        optionIdMap.set(opt.id, optUuid);
        lines.push(
          `INSERT INTO public.quiz_options (id, question_id, label, option_text, sort_order) VALUES (${sqlLiteral(optUuid)}, ${sqlLiteral(qUuid)}, ${sqlLiteral(opt.label)}, ${sqlLiteral(opt.optionText)}, ${opt.sortOrder});`
        );
      }

      const mappedCorrectUuids = q.correctOptionIds
        .map((id) => optionIdMap.get(id))
        .filter((v): v is string => Boolean(v));

      lines.push(
        `INSERT INTO public.quiz_answer_keys (question_id, correct_option_ids, accepted_answers) VALUES (${sqlLiteral(qUuid)}, ${sqlUuidArray(mappedCorrectUuids)}, ${sqlTextArray(q.acceptedAnswers ?? [])});`
      );
    }
    lines.push("");
  }

  for (const assign of seed.assignments) {
    const assignUuid = deterministicUuid(`assignment:${assign.slug}`);
    lines.push(
      `INSERT INTO public.assignments (id, slug, title, objective, category, difficulty, lesson_id, prerequisites, instructions, expected_outcome, safety_warning, status) VALUES (${sqlLiteral(assignUuid)}, ${sqlLiteral(assign.slug)}, ${sqlLiteral(assign.title)}, ${sqlLiteral(assign.objective)}, ${sqlLiteral(assign.category)}, ${sqlLiteral(assign.difficulty)}, ${sqlLiteral(assign.lessonId ?? null)}, ${sqlTextArray(assign.prerequisites)}, ${sqlTextArray(assign.instructions)}, ${sqlLiteral(assign.expectedOutcome)}, ${sqlLiteral(assign.safetyWarning)}, ${sqlLiteral(assign.status)}) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective, category = EXCLUDED.category, difficulty = EXCLUDED.difficulty, lesson_id = EXCLUDED.lesson_id, prerequisites = EXCLUDED.prerequisites, instructions = EXCLUDED.instructions, expected_outcome = EXCLUDED.expected_outcome, safety_warning = EXCLUDED.safety_warning, status = EXCLUDED.status, updated_at = NOW();`
    );
  }

  return lines.join("\n") + "\n";
}

async function main() {
  const seedSql = buildFullSeedSql();
  const seedFilePath = path.join(process.cwd(), "supabase", "seed.sql");
  fs.writeFileSync(seedFilePath, seedSql, "utf8");
  console.log(`Updated supabase/seed.sql (${seedSql.length} bytes).`);

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.log("DATABASE_URL not set; skipped live PostgreSQL execution.");
    return;
  }

  const cleanConn = connectionString.replace(/[?&]sslmode=require/g, "").replace(/[?&]pgbouncer=true/g, "");
  const client = new Client({
    connectionString: cleanConn,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      // Make CREATE POLICY idempotent by dropping existing policies of the same name first
      const policyRegex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(public\.[a-z_]+)/gi;
      let match: RegExpExecArray | null;
      while ((match = policyRegex.exec(sql)) !== null) {
        await client.query(`DROP POLICY IF EXISTS "${match[1]}" ON ${match[2]};`);
      }
      await client.query(sql);
      console.log(`Applied migration: ${file}`);
    }

    // Backfill any existing auth.users into public.profiles and public.user_roles
    const backfillRes = await client.query(`
      INSERT INTO public.profiles (id, email, display_name, avatar_url)
      SELECT
        u.id,
        LOWER(COALESCE(u.email, '')),
        COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', 'Academy Learner'),
        u.raw_user_meta_data ->> 'avatar_url'
      FROM auth.users u
      ON CONFLICT (id) DO NOTHING;
    `);
    await client.query(`
      INSERT INTO public.user_roles (user_id, role)
      SELECT p.id, 'student'::public.app_role
      FROM public.profiles p
      ON CONFLICT (user_id) DO NOTHING;
    `);
    console.log(`Backfilled auth.users -> public.profiles (${backfillRes.rowCount ?? 0} new profiles).`);

    await client.query("BEGIN");
    await client.query(seedSql);
    await client.query("COMMIT");

    const counts = await client.query(`
      SELECT
        (SELECT count(*)::int FROM public.profiles) AS profiles,
        (SELECT count(*)::int FROM public.quizzes) AS quizzes,
        (SELECT count(*)::int FROM public.quiz_questions) AS questions,
        (SELECT count(*)::int FROM public.quiz_options) AS options,
        (SELECT count(*)::int FROM public.quiz_answer_keys) AS answer_keys,
        (SELECT count(*)::int FROM public.assignments) AS assignments
    `);
    console.log("Database seed summary:", counts.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
