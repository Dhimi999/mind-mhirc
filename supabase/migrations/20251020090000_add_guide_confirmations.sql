-- Add guide confirmation columns to progress tables
-- HN-CBT progress
alter table if exists public.hibrida_user_progress
  add column if not exists has_read_guide boolean default false,
  add column if not exists will_follow_guide boolean default false;

-- Psikoedukasi progress
alter table if exists public.psikoedukasi_user_progress
  add column if not exists has_read_guide boolean default false,
  add column if not exists will_follow_guide boolean default false;
