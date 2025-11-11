-- Migration: Add DELETE policies for submission history tables
-- Purpose: Allow counselors and admins to delete submissions

-- ============================================
-- CBT Hibrida Submission History - DELETE Policy
-- ============================================

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

-- ============================================
-- CBT Psikoedukasi Submission History - DELETE Policy
-- ============================================

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

-- ============================================
-- Spiritual & Budaya Intervensi - DELETE Policy
-- ============================================

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

-- ============================================
-- Spiritual & Budaya Psikoedukasi - DELETE Policy
-- ============================================

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

-- Add comments
COMMENT ON POLICY "Counselors can delete cbt hibrida submissions" ON public.cbt_hibrida_submission_history IS 'Allows counselors and admins to delete CBT Hibrida submissions';
COMMENT ON POLICY "Counselors can delete cbt psikoedukasi submissions" ON public.cbt_psikoedukasi_submission_history IS 'Allows counselors and admins to delete CBT Psikoedukasi submissions';
COMMENT ON POLICY "Counselors can delete sb intervensi submissions" ON public.sb_intervensi_submission_history IS 'Allows counselors and admins to delete Spiritual & Budaya Intervensi submissions';
COMMENT ON POLICY "Counselors can delete sb psikoedukasi submissions" ON public.sb_psikoedukasi_submission_history IS 'Allows counselors and admins to delete Spiritual & Budaya Psikoedukasi submissions';
