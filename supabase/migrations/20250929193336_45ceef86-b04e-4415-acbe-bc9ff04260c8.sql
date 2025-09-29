-- Update the CHECK constraint on safe_mother_materials to include 'Leaflet/Poster' type
ALTER TABLE public.safe_mother_materials 
DROP CONSTRAINT safe_mother_materials_type_check;

ALTER TABLE public.safe_mother_materials 
ADD CONSTRAINT safe_mother_materials_type_check 
CHECK (type IN ('text', 'video', 'Leaflet/Poster'));