-- Migration: add has_read_guide and will_follow_guide to user progress tables
-- Safe to run multiple times due to IF NOT EXISTS

alter table if exists public.hibrida_user_progress
  add column if not exists has_read_guide boolean default false,
  add column if not exists will_follow_guide boolean default false;

alter table if exists public.psikoedukasi_user_progress
  add column if not exists has_read_guide boolean default false,
  add column if not exists will_follow_guide boolean default false;
