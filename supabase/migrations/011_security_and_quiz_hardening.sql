-- 011_security_and_quiz_hardening.sql
-- 1. Enforce column-level write protection on public.profiles so authenticated users
--    cannot self-reactivate account_status or alter email via direct PostgREST calls.
REVOKE UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name, bio, interests) ON TABLE public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.email IS DISTINCT FROM OLD.email
      OR NEW.account_status IS DISTINCT FROM OLD.account_status
      OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at THEN
      RAISE EXCEPTION 'Insufficient privileges to modify protected profile fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_protect_sensitive_columns ON public.profiles;
CREATE TRIGGER profiles_protect_sensitive_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();

-- Controlled RPC allowing an active authenticated user to request their own deletion
CREATE OR REPLACE FUNCTION public.request_own_account_deletion()
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.profiles
  SET account_status = 'deletion_requested',
      deletion_requested_at = NOW()
  WHERE id = auth.uid()
    AND account_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.request_own_account_deletion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_own_account_deletion() TO authenticated;

-- 2. Quiz schema parity for command_input recall questions
ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'command_input';

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS placeholder TEXT;

ALTER TABLE public.quiz_answer_keys
  ADD COLUMN IF NOT EXISTS accepted_answers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.quiz_attempt_answers
  ADD COLUMN IF NOT EXISTS submitted_text TEXT;
