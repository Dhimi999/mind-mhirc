-- =====================================================
-- STEP 1: RENAME HIBRIDA NARATIF CBT TABLES
-- =====================================================

-- Rename hibrida_enrollments to CBT_Hibrida_enrollments
ALTER TABLE hibrida_enrollments RENAME TO CBT_Hibrida_enrollments;

-- Rename hibrida_meetings to CBT_Hibrida_meetings
ALTER TABLE hibrida_meetings RENAME TO CBT_Hibrida_meetings;

-- Rename hibrida_assignments to CBT_Hibrida_assignments
ALTER TABLE hibrida_assignments RENAME TO CBT_Hibrida_assignments;

-- Rename hibrida_user_progress to CBT_Hibrida_user_progress
ALTER TABLE hibrida_user_progress RENAME TO CBT_Hibrida_user_progress;

-- Rename psikoedukasi_meetings to CBT_Psikoedukasi_meetings
ALTER TABLE psikoedukasi_meetings RENAME TO CBT_Psikoedukasi_meetings;

-- Rename psikoedukasi_assignments to CBT_Psikoedukasi_assignments
ALTER TABLE psikoedukasi_assignments RENAME TO CBT_Psikoedukasi_assignments;

-- Rename psikoedukasi_user_progress to CBT_Psikoedukasi_user_progress
ALTER TABLE psikoedukasi_user_progress RENAME TO CBT_Psikoedukasi_user_progress;

-- =====================================================
-- STEP 2: CREATE SPIRITUAL & BUDAYA TABLES
-- =====================================================

-- Create SB_enrollments table (similar to CBT_Hibrida_enrollments)
CREATE TABLE IF NOT EXISTS public.SB_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role hibrida_role NOT NULL DEFAULT 'reguler',
  group_assignment hibrida_group,
  enrollment_status enrollment_status NOT NULL DEFAULT 'pending',
  enrollment_requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create SB_Intervensi_meetings table
CREATE TABLE IF NOT EXISTS public.SB_Intervensi_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_number INTEGER NOT NULL,
  date TEXT,
  time TEXT,
  link TEXT,
  description TEXT,
  guidance_pdf_url TEXT,
  guidance_text TEXT,
  guidance_audio_url TEXT,
  guidance_video_url TEXT,
  guidance_links JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SB_Intervensi_assignments table
CREATE TABLE IF NOT EXISTS public.SB_Intervensi_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SB_Intervensi_user_progress table
CREATE TABLE IF NOT EXISTS public.SB_Intervensi_user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_opened BOOLEAN DEFAULT false,
  meeting_done BOOLEAN DEFAULT false,
  assignment_done BOOLEAN DEFAULT false,
  counselor_response TEXT,
  counselor_name TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, session_number)
);

-- Create SB_Psikoedukasi_meetings table
CREATE TABLE IF NOT EXISTS public.SB_Psikoedukasi_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_number INTEGER NOT NULL,
  date TEXT,
  time TEXT,
  link TEXT,
  description TEXT,
  guidance_pdf_url TEXT,
  guidance_text TEXT,
  guidance_audio_url TEXT,
  guidance_video_url TEXT,
  guidance_links JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SB_Psikoedukasi_assignments table
CREATE TABLE IF NOT EXISTS public.SB_Psikoedukasi_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SB_Psikoedukasi_user_progress table
CREATE TABLE IF NOT EXISTS public.SB_Psikoedukasi_user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_opened BOOLEAN DEFAULT false,
  meeting_done BOOLEAN DEFAULT false,
  assignment_done BOOLEAN DEFAULT false,
  counselor_response TEXT,
  counselor_name TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, session_number)
);

-- =====================================================
-- STEP 3: CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger for SB_enrollments
CREATE TRIGGER update_SB_enrollments_updated_at
BEFORE UPDATE ON public.SB_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger for SB_Intervensi_meetings
CREATE TRIGGER update_SB_Intervensi_meetings_updated_at
BEFORE UPDATE ON public.SB_Intervensi_meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger for SB_Intervensi_assignments
CREATE TRIGGER update_SB_Intervensi_assignments_updated_at
BEFORE UPDATE ON public.SB_Intervensi_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger for SB_Intervensi_user_progress
CREATE TRIGGER update_SB_Intervensi_user_progress_updated_at
BEFORE UPDATE ON public.SB_Intervensi_user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger for SB_Psikoedukasi_meetings
CREATE TRIGGER update_SB_Psikoedukasi_meetings_updated_at
BEFORE UPDATE ON public.SB_Psikoedukasi_meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger for SB_Psikoedukasi_assignments
CREATE TRIGGER update_SB_Psikoedukasi_assignments_updated_at
BEFORE UPDATE ON public.SB_Psikoedukasi_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger for SB_Psikoedukasi_user_progress
CREATE TRIGGER update_SB_Psikoedukasi_user_progress_updated_at
BEFORE UPDATE ON public.SB_Psikoedukasi_user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_hibrida_updated_at();

-- =====================================================
-- STEP 4: CREATE AUTO-ASSIGN TRIGGER FOR SB
-- =====================================================

-- Create function to auto-assign SB reguler role for new users
CREATE OR REPLACE FUNCTION public.auto_assign_SB_reguler()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auto-create enrollment record with reguler role for new authenticated user
  INSERT INTO public.SB_enrollments (user_id, role, enrollment_status)
  VALUES (NEW.id, 'reguler', 'pending')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign reguler role on user creation
CREATE TRIGGER on_auth_user_created_assign_SB_reguler
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_SB_reguler();

-- Create function to auto-assign SB super-admin role for admins/professionals
CREATE OR REPLACE FUNCTION public.auto_assign_SB_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin or professional
  IF NEW.is_admin = true OR NEW.account_type = 'professional' THEN
    -- Update or insert enrollment with super-admin role
    INSERT INTO public.SB_enrollments (user_id, role, group_assignment, enrollment_status, approved_at)
    VALUES (NEW.id, 'super-admin', 'Admin', 'approved', now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'super-admin',
      group_assignment = 'Admin',
      enrollment_status = 'approved',
      approved_at = COALESCE(SB_enrollments.approved_at, now()),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign super-admin for profiles
CREATE TRIGGER on_profile_update_assign_SB_super_admin
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_SB_super_admin();