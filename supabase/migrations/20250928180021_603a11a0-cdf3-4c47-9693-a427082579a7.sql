-- Add Safe Mother related columns to profiles table
ALTER TABLE public.profiles ADD COLUMN safe_mother_role TEXT;
ALTER TABLE public.profiles ADD COLUMN safe_mother_stage TEXT;
ALTER TABLE public.profiles ADD COLUMN safe_mother_uuid TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN safe_mother_family_uuid TEXT;
ALTER TABLE public.profiles ADD COLUMN safe_mother_additional_info JSONB DEFAULT '{}'::JSONB;

-- Create index for better performance on Safe Mother queries
CREATE INDEX idx_profiles_safe_mother_uuid ON public.profiles(safe_mother_uuid);
CREATE INDEX idx_profiles_safe_mother_family_uuid ON public.profiles(safe_mother_family_uuid);