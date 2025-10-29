-- Create storage bucket for safe mother materials thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'safe-mother-materials',
  'safe-mother-materials',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create storage policies for safe mother materials bucket
CREATE POLICY "Anyone can view safe mother material thumbnails"
ON storage.objects
FOR SELECT
USING (bucket_id = 'safe-mother-materials');

CREATE POLICY "Professionals can upload material thumbnails"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'safe-mother-materials' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Professionals can update their material thumbnails"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'safe-mother-materials' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Professionals can delete their material thumbnails"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'safe-mother-materials' 
  AND auth.uid() IS NOT NULL
);

-- Create table for safe mother educational materials
CREATE TABLE public.safe_mother_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'video')),
  description TEXT NOT NULL,
  content TEXT, -- For text-based materials
  video_url TEXT, -- For video materials (YouTube iframe src)
  author_name TEXT NOT NULL,
  author_id UUID NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_safe_mother_materials_updated_at
BEFORE UPDATE ON public.safe_mother_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_safe_mother_materials_author ON public.safe_mother_materials(author_id);
CREATE INDEX idx_safe_mother_materials_category ON public.safe_mother_materials(category);
CREATE INDEX idx_safe_mother_materials_type ON public.safe_mother_materials(type);
CREATE INDEX idx_safe_mother_materials_created_at ON public.safe_mother_materials(created_at DESC);