-- ============================================
-- URGENT FIX: Add DELETE Policies
-- ============================================
-- Problem: Submissions cannot be deleted because RLS policies
-- only allow SELECT, INSERT, UPDATE but NOT DELETE
-- 
-- Solution: Run this SQL in Supabase SQL Editor
-- 
-- Steps:
-- 1. Go to Supabase Dashboard
-- 2. Click "SQL Editor" in left sidebar
-- 3. Click "New Query"
-- 4. Copy-paste this ENTIRE file
-- 5. Click "Run" or press Ctrl+Enter
-- ============================================

-- CBT Hibrida Submission History - DELETE Policy
CREATE POLICY "Counselors can delete cbt hibrida submissions"
ON public.cbt_hibrida_submission_history
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.cbt_hibrida_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- CBT Psikoedukasi Submission History - DELETE Policy
CREATE POLICY "Counselors can delete cbt psikoedukasi submissions"
ON public.cbt_psikoedukasi_submission_history
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.cbt_hibrida_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Spiritual & Budaya Intervensi - DELETE Policy
CREATE POLICY "Counselors can delete sb intervensi submissions"
ON public.sb_intervensi_submission_history
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.sb_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Spiritual & Budaya Psikoedukasi - DELETE Policy
CREATE POLICY "Counselors can delete sb psikoedukasi submissions"
ON public.sb_psikoedukasi_submission_history
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.sb_enrollments
    WHERE user_id = auth.uid()
    AND role IN ('grup-int', 'grup-cont', 'super-admin')
    AND enrollment_status = 'approved'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as "command"
FROM pg_policies 
WHERE tablename IN (
  'cbt_hibrida_submission_history',
  'cbt_psikoedukasi_submission_history',
  'sb_intervensi_submission_history',
  'sb_psikoedukasi_submission_history'
)
AND cmd = 'DELETE'
ORDER BY tablename, policyname;
