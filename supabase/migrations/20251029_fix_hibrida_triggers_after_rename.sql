-- Fix triggers and functions after table rename from hibrida_enrollments to CBT_Hibrida_enrollments

-- Update auto_assign_hibrida_reguler function to use new table name
CREATE OR REPLACE FUNCTION public.auto_assign_hibrida_reguler()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create enrollment record with reguler role for new authenticated user
  INSERT INTO public.CBT_Hibrida_enrollments (user_id, role, enrollment_status)
  VALUES (NEW.id, 'reguler', 'pending')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update auto_assign_hibrida_super_admin function to use new table name
CREATE OR REPLACE FUNCTION public.auto_assign_hibrida_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only when user is explicitly marked as admin
  IF NEW.is_admin = true THEN
    INSERT INTO public.CBT_Hibrida_enrollments (user_id, role, group_assignment, enrollment_status, approved_at)
    VALUES (NEW.id, 'super-admin', 'Admin', 'approved', now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'super-admin',
      group_assignment = 'Admin',
      enrollment_status = 'approved',
      approved_at = COALESCE(CBT_Hibrida_enrollments.approved_at, now()),
      updated_at = now();
  -- For professionals with account_type = 'professional', auto-approve with grup-cont role
  ELSIF NEW.account_type = 'professional' THEN
    INSERT INTO public.CBT_Hibrida_enrollments (user_id, role, group_assignment, enrollment_status, approved_at)
    VALUES (NEW.id, 'grup-cont', 'Admin', 'approved', now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'grup-cont',
      group_assignment = 'Admin',
      enrollment_status = 'approved',
      approved_at = COALESCE(CBT_Hibrida_enrollments.approved_at, now()),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
