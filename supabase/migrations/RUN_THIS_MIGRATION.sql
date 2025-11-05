-- ========================================
-- MIGRATION SCRIPT: Multiple Submission History for Hibrida CBT
-- Date: 2025-02-05
-- Purpose: Add submission_history tables for both Psikoedukasi and Intervensi
-- ========================================

-- Create trigger function if not exists (shared by both tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- TABLE 1: cbt_psikoedukasi_submission_history
-- ========================================

CREATE TABLE IF NOT EXISTS public.cbt_psikoedukasi_submission_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  submission_number INTEGER NOT NULL DEFAULT 1,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  counselor_response TEXT,
  counselor_name TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cbt_psikoedukasi_submission_user_session 
ON public.cbt_psikoedukasi_submission_history(user_id, session_number);

CREATE INDEX IF NOT EXISTS idx_cbt_psikoedukasi_submission_submitted_at 
ON public.cbt_psikoedukasi_submission_history(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.cbt_psikoedukasi_submission_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own cbt psikoedukasi submission history" ON public.cbt_psikoedukasi_submission_history;
DROP POLICY IF EXISTS "Users can insert their own cbt psikoedukasi submissions" ON public.cbt_psikoedukasi_submission_history;
DROP POLICY IF EXISTS "Counselors can view all cbt psikoedukasi submissions" ON public.cbt_psikoedukasi_submission_history;
DROP POLICY IF EXISTS "Counselors can update cbt psikoedukasi submissions with responses" ON public.cbt_psikoedukasi_submission_history;

-- RLS Policies
CREATE POLICY "Users can view their own cbt psikoedukasi submission history"
ON public.cbt_psikoedukasi_submission_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cbt psikoedukasi submissions"
ON public.cbt_psikoedukasi_submission_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors can view all cbt psikoedukasi submissions"
ON public.cbt_psikoedukasi_submission_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cbt_hibrida_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

CREATE POLICY "Counselors can update cbt psikoedukasi submissions with responses"
ON public.cbt_psikoedukasi_submission_history
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.cbt_hibrida_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_cbt_psikoedukasi_submission_history_updated_at ON public.cbt_psikoedukasi_submission_history;
CREATE TRIGGER update_cbt_psikoedukasi_submission_history_updated_at
BEFORE UPDATE ON public.cbt_psikoedukasi_submission_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE public.cbt_psikoedukasi_submission_history IS 'Stores history of all CBT psikoedukasi assignment submissions with counselor responses';

-- ========================================
-- TABLE 2: cbt_hibrida_submission_history
-- ========================================

CREATE TABLE IF NOT EXISTS public.cbt_hibrida_submission_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  submission_number INTEGER NOT NULL DEFAULT 1,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  counselor_response TEXT,
  counselor_name TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cbt_hibrida_submission_user_session 
ON public.cbt_hibrida_submission_history(user_id, session_number);

CREATE INDEX IF NOT EXISTS idx_cbt_hibrida_submission_submitted_at 
ON public.cbt_hibrida_submission_history(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.cbt_hibrida_submission_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own cbt hibrida submission history" ON public.cbt_hibrida_submission_history;
DROP POLICY IF EXISTS "Users can insert their own cbt hibrida submissions" ON public.cbt_hibrida_submission_history;
DROP POLICY IF EXISTS "Counselors can view all cbt hibrida submissions" ON public.cbt_hibrida_submission_history;
DROP POLICY IF EXISTS "Counselors can update cbt hibrida submissions with responses" ON public.cbt_hibrida_submission_history;

-- RLS Policies
CREATE POLICY "Users can view their own cbt hibrida submission history"
ON public.cbt_hibrida_submission_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cbt hibrida submissions"
ON public.cbt_hibrida_submission_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors can view all cbt hibrida submissions"
ON public.cbt_hibrida_submission_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cbt_hibrida_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

CREATE POLICY "Counselors can update cbt hibrida submissions with responses"
ON public.cbt_hibrida_submission_history
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.cbt_hibrida_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_cbt_hibrida_submission_history_updated_at ON public.cbt_hibrida_submission_history;
CREATE TRIGGER update_cbt_hibrida_submission_history_updated_at
BEFORE UPDATE ON public.cbt_hibrida_submission_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE public.cbt_hibrida_submission_history IS 'Stores history of all CBT hibrida intervensi assignment submissions with counselor responses';

-- ========================================
-- VERIFICATION QUERIES (Run after migration)
-- ========================================

-- Check if tables exist
SELECT 
  tablename, 
  schemaname 
FROM pg_tables 
WHERE tablename IN ('cbt_psikoedukasi_submission_history', 'cbt_hibrida_submission_history')
ORDER BY tablename;

-- Check RLS policies
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename IN ('cbt_psikoedukasi_submission_history', 'cbt_hibrida_submission_history')
ORDER BY tablename, policyname;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
