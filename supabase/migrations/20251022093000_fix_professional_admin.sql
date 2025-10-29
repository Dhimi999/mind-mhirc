-- PERBAIKAN 2: Prevent professionals from being auto-promoted to super-admin
-- Context: Previously, profiles with account_type='professional' were auto-assigned
--          a 'super-admin' role in public.hibrida_enrollments via trigger.
--          This migration restricts auto-assignment to explicit admins only
--          (profiles.is_admin = true) and downgrades existing non-admin professionals.

-- 1) Update the function to only consider explicit admins, not professionals
CREATE OR REPLACE FUNCTION public.auto_assign_hibrida_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only when user is explicitly marked as admin
  IF NEW.is_admin = true THEN
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

-- 2) Downgrade any existing super-admin enrollments for users who are not admins
--    (e.g., professionals that were previously auto-promoted)
UPDATE public.hibrida_enrollments AS e
SET 
  role = 'reguler',
  group_assignment = NULL,
  -- If they were auto-approved solely due to prior logic, revert to pending
  enrollment_status = CASE WHEN e.enrollment_status = 'approved' THEN 'pending' ELSE e.enrollment_status END,
  updated_at = now()
FROM public.profiles p
WHERE e.user_id = p.id
  AND e.role = 'super-admin'
  AND COALESCE(p.is_admin, false) = false;

-- Note: Professionals retain elevated permissions via RLS policies, but are not super-admins.
