-- Add slug and hd_image_url columns to safe_mother_materials table
ALTER TABLE public.safe_mother_materials 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS hd_image_url text;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_safe_mother_materials_slug ON public.safe_mother_materials(slug);