-- Create enum for Hibrida roles
CREATE TYPE public.hibrida_role AS ENUM ('reguler', 'grup-int', 'grup-cont', 'super-admin');

-- Create enum for Hibrida groups
CREATE TYPE public.hibrida_group AS ENUM ('A', 'B', 'C', 'Admin');

-- Create enum for enrollment status
CREATE TYPE public.enrollment_status AS ENUM ('pending', 'approved', 'rejected');

-- Create hibrida_enrollments table
CREATE TABLE public.hibrida_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.hibrida_role NOT NULL DEFAULT 'reguler',
  group_assignment public.hibrida_group,
  enrollment_status public.enrollment_status NOT NULL DEFAULT 'pending',
  enrollment_requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_hibrida_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_hibrida_enrollments_updated_at
  BEFORE UPDATE ON public.hibrida_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_enrollments_updated_at();

-- Create function to auto-assign reguler role for new users
CREATE OR REPLACE FUNCTION public.auto_assign_hibrida_reguler()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create enrollment record with reguler role for new authenticated user
  INSERT INTO public.hibrida_enrollments (user_id, role, enrollment_status)
  VALUES (NEW.id, 'reguler', 'pending')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign reguler role on user creation
CREATE TRIGGER on_auth_user_created_hibrida
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_hibrida_reguler();

-- Create function to auto-assign super-admin role for admins and professionals
CREATE OR REPLACE FUNCTION public.auto_assign_hibrida_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is admin or professional
  IF NEW.is_admin = true OR NEW.account_type = 'professional' THEN
    -- Update or insert enrollment with super-admin role
    INSERT INTO public.hibrida_enrollments (user_id, role, group_assignment, enrollment_status, approved_at)
    VALUES (NEW.id, 'super-admin', 'Admin', 'approved', now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'super-admin',
      group_assignment = 'Admin',
      enrollment_status = 'approved',
      approved_at = COALESCE(hibrida_enrollments.approved_at, now()),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles to auto-assign super-admin
CREATE TRIGGER on_profile_update_hibrida_super_admin
  AFTER INSERT OR UPDATE OF is_admin, account_type ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_hibrida_super_admin();

-- Create index for faster queries
CREATE INDEX idx_hibrida_enrollments_user_id ON public.hibrida_enrollments(user_id);
CREATE INDEX idx_hibrida_enrollments_status ON public.hibrida_enrollments(enrollment_status);
CREATE INDEX idx_hibrida_enrollments_role ON public.hibrida_enrollments(role);