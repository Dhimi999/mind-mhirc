-- =====================================================
-- DISABLE AUTO-ENROLLMENT FOR NEW USERS
-- =====================================================
-- Users must manually enroll by clicking "Daftar" button on program pages

-- Drop trigger for Hibrida Naratif CBT auto-enrollment
DROP TRIGGER IF EXISTS on_auth_user_created_hibrida ON auth.users;

-- Drop trigger for Spiritual & Budaya auto-enrollment
DROP TRIGGER IF EXISTS on_auth_user_created_assign_SB_reguler ON auth.users;

-- Keep the functions for potential future use, but they won't be triggered automatically
-- The functions can still be called manually if needed

-- Note: Existing enrollments are not affected by this migration
-- Only new user signups will not be auto-enrolled
