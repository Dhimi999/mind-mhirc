-- Add guidance columns to meeting tables
ALTER TABLE public.hibrida_meetings
  ADD COLUMN IF NOT EXISTS guidance_text text,
  ADD COLUMN IF NOT EXISTS guidance_pdf_url text,
  ADD COLUMN IF NOT EXISTS guidance_audio_url text,
  ADD COLUMN IF NOT EXISTS guidance_video_url text,
  ADD COLUMN IF NOT EXISTS guidance_links jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.psikoedukasi_meetings
  ADD COLUMN IF NOT EXISTS guidance_text text,
  ADD COLUMN IF NOT EXISTS guidance_pdf_url text,
  ADD COLUMN IF NOT EXISTS guidance_audio_url text,
  ADD COLUMN IF NOT EXISTS guidance_video_url text,
  ADD COLUMN IF NOT EXISTS guidance_links jsonb DEFAULT '[]'::jsonb;