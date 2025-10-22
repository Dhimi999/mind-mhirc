-- Migration: add has_read_guide and will_follow_guide to user progress tables

ALTER TABLE IF EXISTS public.hibrida_user_progress
ADD COLUMN IF NOT EXISTS has_read_guide boolean DEFAULT false;

ALTER TABLE IF NOT EXISTS public.hibrida_user_progress
ADD COLUMN IF NOT EXISTS will_follow_guide boolean DEFAULT false;

ALTER TABLE IF NOT EXISTS public.psikoedukasi_user_progress
ADD COLUMN IF NOT EXISTS has_read_guide boolean DEFAULT false;

ALTER TABLE IF NOT EXISTS public.psikoedukasi_user_progress
ADD COLUMN IF NOT EXISTS will_follow_guide boolean DEFAULT false;
