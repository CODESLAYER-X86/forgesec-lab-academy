-- 005_assignment_tables.sql
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'linux',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  lesson_id TEXT,
  prerequisites TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  instructions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  expected_outcome TEXT NOT NULL,
  safety_warning TEXT NOT NULL,
  status public.assignment_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.assignment_progress_status NOT NULL DEFAULT 'not_started',
  notes TEXT DEFAULT '',
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, user_id)
);
