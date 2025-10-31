-- Create table for psikoedukasi submission history
CREATE TABLE IF NOT EXISTS public.sb_psikoedukasi_submission_history (
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_psikoedukasi_submission_user_session 
ON public.sb_psikoedukasi_submission_history(user_id, session_number);

CREATE INDEX IF NOT EXISTS idx_psikoedukasi_submission_submitted_at 
ON public.sb_psikoedukasi_submission_history(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.sb_psikoedukasi_submission_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own psikoedukasi submission history"
ON public.sb_psikoedukasi_submission_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own psikoedukasi submissions"
ON public.sb_psikoedukasi_submission_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Counselors can view and update (add responses)
CREATE POLICY "Counselors can view all psikoedukasi submissions"
ON public.sb_psikoedukasi_submission_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sb_enrollments
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

CREATE POLICY "Counselors can update psikoedukasi submissions with responses"
ON public.sb_psikoedukasi_submission_history
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.sb_enrollments
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
CREATE TRIGGER update_sb_psikoedukasi_submission_history_updated_at
BEFORE UPDATE ON public.sb_psikoedukasi_submission_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.sb_psikoedukasi_submission_history IS 'Stores history of all psikoedukasi assignment submissions with counselor responses';
