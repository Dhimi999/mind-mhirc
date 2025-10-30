-- Migration: Add UNIQUE constraint to sb_psikoedukasi_assignments
-- This enables proper upsert with onConflict: "user_id,session_number"
-- Date: 2025-10-30

-- Drop existing constraint if any (safety check)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sb_psikoedukasi_assignments_user_id_session_number_key'
    ) THEN
        ALTER TABLE sb_psikoedukasi_assignments 
        DROP CONSTRAINT sb_psikoedukasi_assignments_user_id_session_number_key;
    END IF;
END $$;

-- Add UNIQUE constraint on (user_id, session_number)
-- This ensures one assignment per user per session
ALTER TABLE sb_psikoedukasi_assignments
ADD CONSTRAINT sb_psikoedukasi_assignments_user_id_session_number_key 
UNIQUE (user_id, session_number);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sb_psikoedukasi_assignments_user_session 
ON sb_psikoedukasi_assignments (user_id, session_number);

-- Add comment
COMMENT ON CONSTRAINT sb_psikoedukasi_assignments_user_id_session_number_key 
ON sb_psikoedukasi_assignments 
IS 'Ensures one assignment per user per session for upsert operations';
