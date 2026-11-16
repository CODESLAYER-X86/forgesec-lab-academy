-- 009_indexes.sql
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_path ON public.lesson_progress(user_id, path_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_activity_user_viewed ON public.content_activity(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options(question_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_submitted ON public.quiz_attempts(user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignment_progress_user ON public.assignment_progress(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);
