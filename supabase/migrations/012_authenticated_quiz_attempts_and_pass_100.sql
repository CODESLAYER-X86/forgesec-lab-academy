-- 012_authenticated_quiz_attempts_and_pass_100.sql
-- Allow server-side authenticated Supabase client to record quiz attempts for the signed-in user
-- even when SUPABASE_SERVICE_ROLE_KEY is not configured in the hosting environment.

ALTER TABLE public.quizzes ALTER COLUMN pass_percentage SET DEFAULT 100;

GRANT INSERT ON TABLE public.quiz_attempts TO authenticated;
GRANT INSERT ON TABLE public.quiz_attempt_answers TO authenticated;

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempt_answers_insert_own" ON public.quiz_attempt_answers;
CREATE POLICY "quiz_attempt_answers_insert_own" ON public.quiz_attempt_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = attempt_id AND qa.user_id = auth.uid()
    )
  );
