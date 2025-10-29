# Manual Enrollment Implementation - Migration Guide

## Overview
Changed from automatic enrollment to manual enrollment for both Hibrida Naratif CBT and Spiritual & Budaya programs.

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/20251029_disable_auto_enrollment.sql`

- Dropped auto-enrollment triggers:
  - `on_auth_user_created_hibrida` (Hibrida Naratif CBT)
  - `on_auth_user_created_assign_SB_reguler` (Spiritual & Budaya)
- Functions remain available but won't trigger automatically on new user signup

### 2. Edge Function for Manual Enrollment
**File:** `supabase/functions/enroll-program/index.ts`

New serverless function that handles manual enrollment requests:
- Accepts `program` parameter: `"hibrida-cbt"` or `"spiritual-budaya"`
- Validates user authentication
- Checks for existing enrollment
- Creates new enrollment with `"pending"` status
- Returns success/error response

### 3. Frontend Hooks Updates

#### Hibrida Role Hook
**File:** `src/hooks/useHibridaRole.ts`

- Updated `requestEnrollment()` to call the new edge function
- Simplified logic - removed direct database operations
- Maintains backward compatibility with existing enrollment data

#### Spiritual Role Hook  
**File:** `src/hooks/useSpiritualRole.ts`

- Added complete enrollment state management (previously only had role/group)
- Added `requestEnrollment()` function
- Added `canAccessIntervensiSB` and `canAccessPsikoedukasiSB` flags
- Added `isSuperAdmin` flag
- Now returns full `enrollment` object with status

### 4. UI Updates

#### Hibrida Naratif CBT Page
**File:** `src/pages/hibrida-naratif/HibridaNaratifCBT.tsx`

- Already had enrollment UI - no changes needed
- Uses updated hook seamlessly

#### Spiritual & Budaya Page
**File:** `src/pages/spiritual-budaya/SpiritualBudaya.tsx`

- Updated to use new enrollment data from hook
- Replaced direct database calls with `requestEnrollment()` from hook
- Updated Guarded component to show proper messages based on enrollment status
- Aligned enrollment status UI with Hibrida page (3-step process)

## User Flow (After Changes)

### New User Signs Up
1. ✅ User creates account → profile created
2. ❌ **NO automatic enrollment** to any program

### User Wants to Join a Program
1. User navigates to `/hibrida-cbt` or `/spiritual-budaya`
2. Goes to "Pengantar" tab
3. Sees "Langkah 1 — Daftar" section
4. Clicks "Daftar Sekarang" button
5. System creates enrollment record with `status: "pending"`
6. User sees "Menunggu Persetujuan" badge
7. Admin approves enrollment in dashboard
8. User status changes to `status: "approved"`
9. User can now access restricted content

## Admin Impact

### Existing Users
- Users who were auto-enrolled before this migration will keep their enrollment
- No data loss or breaking changes

### New Users After Migration
- Will NOT be auto-enrolled
- Must manually click "Daftar" on program pages
- Enrollment requests appear in admin dashboard for approval
- Admin workflow remains the same (approve/reject in Account Management)

## Testing Checklist

- [ ] Create new test account
- [ ] Verify NO auto-enrollment happens
- [ ] Visit `/hibrida-cbt/pengantar`
- [ ] Click "Daftar Sekarang"
- [ ] Verify pending status shown
- [ ] Admin approves enrollment
- [ ] Verify approved status and access granted
- [ ] Repeat for `/spiritual-budaya`

## Rollback Plan

If needed to rollback to auto-enrollment:

```sql
-- Re-enable Hibrida auto-enrollment
CREATE TRIGGER on_auth_user_created_hibrida
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_hibrida_reguler();

-- Re-enable Spiritual & Budaya auto-enrollment
CREATE TRIGGER on_auth_user_created_assign_SB_reguler
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_SB_reguler();
```

## Notes

- Edge function `enroll-program` must be deployed to Supabase
- Existing enrollment data and admin management features unchanged
- RLS policies remain the same
- No breaking changes to existing user experience
