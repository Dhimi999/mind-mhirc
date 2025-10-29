-- Add subtypes and parent_id columns to profiles table if they don't exist

DO $$ 
BEGIN
    -- Add subtypes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'subtypes'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subtypes TEXT[] DEFAULT NULL;
        
        COMMENT ON COLUMN public.profiles.subtypes IS 'Array of subtypes for general users: parent, child, etc.';
    END IF;

    -- Add parent_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN parent_id UUID DEFAULT NULL;
        
        COMMENT ON COLUMN public.profiles.parent_id IS 'Parent user ID (UUID) for child accounts - references the parent user';
        
        -- Add foreign key constraint to ensure parent_id references a valid user
        ALTER TABLE public.profiles
        ADD CONSTRAINT fk_profiles_parent_id 
        FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for parent_id lookup if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND indexname = 'idx_profiles_parent_id'
    ) THEN
        CREATE INDEX idx_profiles_parent_id ON public.profiles(parent_id);
    END IF;
END $$;
