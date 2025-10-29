-- Add materials column to meeting tables
ALTER TABLE public.hibrida_meetings
  ADD COLUMN IF NOT EXISTS materials jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.psikoedukasi_meetings
  ADD COLUMN IF NOT EXISTS materials jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for session materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-materials', 'session-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for session materials
CREATE POLICY "Anyone can view session materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'session-materials');

CREATE POLICY "Admins can upload session materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-materials' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update session materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'session-materials' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete session materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'session-materials' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);