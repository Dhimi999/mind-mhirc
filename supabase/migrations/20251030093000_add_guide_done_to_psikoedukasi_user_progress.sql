-- Add guide_done column to sb_psikoedukasi_user_progress if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'sb_psikoedukasi_user_progress'
      AND column_name = 'guide_done'
  ) THEN
    ALTER TABLE public.sb_psikoedukasi_user_progress
      ADD COLUMN guide_done boolean DEFAULT false;
  END IF;
END $$;

-- Optional index to speed up queries by user/session
CREATE INDEX IF NOT EXISTS idx_sb_psiko_user_progress_user_session
  ON public.sb_psikoedukasi_user_progress (user_id, session_number);
