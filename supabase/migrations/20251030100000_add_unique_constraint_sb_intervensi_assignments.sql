-- Add unique constraint to sb_intervensi_assignments for upsert operations
-- This allows ON CONFLICT (user_id, session_number) to work properly

-- First, check if there are any duplicate entries and keep only the latest one
WITH ranked_assignments AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, session_number 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM public.SB_Intervensi_assignments
)
DELETE FROM public.SB_Intervensi_assignments
WHERE id IN (
  SELECT id FROM ranked_assignments WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.SB_Intervensi_assignments
ADD CONSTRAINT sb_intervensi_assignments_user_session_unique 
UNIQUE (user_id, session_number);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sb_intervensi_assignments_user_session 
ON public.SB_Intervensi_assignments(user_id, session_number);
