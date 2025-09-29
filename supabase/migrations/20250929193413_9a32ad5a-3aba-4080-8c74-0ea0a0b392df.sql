-- Enable RLS on safe_mother_materials table
ALTER TABLE public.safe_mother_materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for safe_mother_materials
-- Anyone can view published materials
CREATE POLICY "Anyone can view materials"
ON public.safe_mother_materials
FOR SELECT
USING (true);

-- Professionals and admins can create materials
CREATE POLICY "Professionals can create materials"
ON public.safe_mother_materials
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (account_type = 'professional' OR is_admin = true)
  )
);

-- Professionals and admins can update their own materials
CREATE POLICY "Professionals can update their materials"
ON public.safe_mother_materials
FOR UPDATE
USING (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (account_type = 'professional' OR is_admin = true)
  )
);

-- Professionals and admins can delete their own materials
CREATE POLICY "Professionals can delete their materials"
ON public.safe_mother_materials
FOR DELETE
USING (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (account_type = 'professional' OR is_admin = true)
  )
);