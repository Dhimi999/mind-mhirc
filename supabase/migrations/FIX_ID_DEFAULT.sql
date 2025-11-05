-- ========================================
-- QUICK FIX: Alter existing tables to add default UUID
-- Run this if tables already exist without proper defaults
-- ========================================

-- Fix cbt_psikoedukasi_submission_history
ALTER TABLE public.cbt_psikoedukasi_submission_history 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Fix cbt_hibrida_submission_history
ALTER TABLE public.cbt_hibrida_submission_history 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the fix
SELECT 
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('cbt_psikoedukasi_submission_history', 'cbt_hibrida_submission_history')
  AND column_name = 'id';

-- Expected output:
-- table_name                              | column_name | column_default      | is_nullable
-- ----------------------------------------|-------------|---------------------|------------
-- cbt_psikoedukasi_submission_history     | id          | gen_random_uuid()   | NO
-- cbt_hibrida_submission_history          | id          | gen_random_uuid()   | NO
