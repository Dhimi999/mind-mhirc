-- Add guidance_read column to SB_Intervensi_user_progress table
ALTER TABLE public.SB_Intervensi_user_progress
ADD COLUMN IF NOT EXISTS guidance_read BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.SB_Intervensi_user_progress.guidance_read IS 'Tracks whether user has marked guidance materials as read';
