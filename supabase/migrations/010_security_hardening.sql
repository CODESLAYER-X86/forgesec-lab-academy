-- 010_security_hardening.sql
REVOKE ALL ON TABLE public.quiz_answer_keys FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_audit_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_roles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.quiz_attempts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.quiz_attempt_answers FROM anon, authenticated;
