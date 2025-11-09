# 🐛 Bug Fix: Safe Mother Missing RPC Function

## Problem

**File:** `src/pages/safe-mother/Konsultasi.tsx`
**Line:** Sekitar fungsi yang call `get_shared_chat_room`

**Error:**
```
Function get_shared_chat_room does not exist in database
```

**Impact:**
- Safe Mother Konsultasi page error saat user try to start consultation
- Professional tidak bisa check if shared chat room sudah exist
- Potential duplicate chat rooms created

---

## Root Cause

Safe Mother Konsultasi component mencoba call RPC function `get_shared_chat_room` untuk:
1. Check apakah user & professional sudah punya shared chat room
2. Jika ada, langsung redirect ke room tersebut
3. Jika tidak ada, buat room baru

**Tapi function ini tidak exist di database!** 😱

Kemungkinan:
- Migration yang create function ini tidak dijalankan
- Function deleted secara tidak sengaja
- Atau memang never created from the beginning

---

## Solution

Created `get_shared_chat_room` RPC function di appointment system migration:

**File:** `supabase/migrations/20250109000001_create_appointments_system.sql`

**Function:**
```sql
CREATE OR REPLACE FUNCTION get_shared_chat_room(
  p_user_id UUID,
  p_professional_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- Cari chat room yang shared antara user & professional
  SELECT cr.id INTO v_room_id
  FROM chat_rooms cr
  INNER JOIN chat_participants cp1 ON cr.id = cp1.chat_room_id
  INNER JOIN chat_participants cp2 ON cr.id = cp2.chat_room_id
  WHERE cp1.user_id = p_user_id
    AND cp2.user_id = p_professional_id
    AND cr.type = 'consultation'
  LIMIT 1;

  RETURN v_room_id;
END;
$$;
```

**How It Works:**
1. Accept 2 parameters: `user_id` dan `professional_id`
2. Query `chat_rooms` table via `chat_participants` join
3. Find room where both user & professional are participants
4. Filter by `type = 'consultation'`
5. Return room ID (atau NULL jika tidak ada)

**Security:**
- `SECURITY DEFINER` - Run dengan permissions dari function owner (bypass RLS)
- Safe karena hanya return room ID yang memang involve kedua parties

---

## Testing

### Test Case 1: Room Exists
```sql
-- Scenario: User & professional sudah punya consultation room

SELECT get_shared_chat_room(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,  -- user_id
  '987fcdeb-51a2-43d1-9876-543210fedcba'::UUID   -- professional_id
);

-- Expected: Returns UUID of existing room
-- Example: 'abcd1234-5678-90ab-cdef-1234567890ab'
```

### Test Case 2: Room Not Exists
```sql
-- Scenario: User & professional belum pernah punya room

SELECT get_shared_chat_room(
  'new-user-id'::UUID,
  'new-professional-id'::UUID
);

-- Expected: Returns NULL
```

### Test Case 3: Multiple Rooms (Edge Case)
```sql
-- Scenario: User & professional punya multiple chat rooms (seharusnya tidak terjadi)

-- Function will return FIRST consultation room (via LIMIT 1)
-- This is acceptable behavior karena semua consultation rooms equivalent
```

---

## Verification Steps

### 1. Check Function Exists
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_shared_chat_room';

-- Expected: 1 row with routine_type = 'FUNCTION'
```

### 2. Check Function Parameters
```sql
SELECT parameter_name, data_type
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name LIKE '%get_shared_chat_room%'
ORDER BY ordinal_position;

-- Expected:
-- p_user_id    | uuid
-- p_professional_id | uuid
-- (return)     | uuid
```

### 3. Test with Real Data
```sql
-- Get a real user & professional ID from profiles
SELECT id, full_name, account_type
FROM profiles
WHERE account_type IN ('user', 'professional')
LIMIT 2;

-- Use those IDs to test function
SELECT get_shared_chat_room(
  '<user_id_from_above>',
  '<professional_id_from_above>'
);
```

---

## Related Files

### Safe Mother Konsultasi Component
**File:** `src/pages/safe-mother/Konsultasi.tsx`

**Code that calls this function:**
```typescript
// Check if shared room already exists
const { data: existingRoomId } = await supabase
  .rpc('get_shared_chat_room', {
    p_user_id: user.id,
    p_professional_id: selectedProfessional
  });

if (existingRoomId) {
  // Redirect to existing room
  navigate(`/dashboard?tab=messages&room=${existingRoomId}`);
} else {
  // Create new consultation room
  // ...
}
```

**Fix Status:** ✅ Will work after migration runs

---

## Impact Analysis

### Before Fix:
- ❌ Safe Mother Konsultasi throws error
- ❌ User tidak bisa check existing rooms
- ❌ Potential duplicate rooms created
- ❌ Bad UX: user might create multiple rooms with same professional

### After Fix:
- ✅ Function exists dan berfungsi
- ✅ User bisa check existing rooms
- ✅ Prevent duplicate room creation
- ✅ Better UX: seamless navigation ke existing room

---

## Additional Benefits

Function ini juga useful untuk:

1. **Appointment System:**
   - Check if user & professional already have consultation room
   - Link existing room ke new appointment (if applicable)

2. **Admin Dashboard:**
   - View existing consultation relationships
   - Audit consultation rooms

3. **Analytics:**
   - Count unique user-professional pairs
   - Track consultation engagement

---

## Migration Deployment

**When:** Execute saat menjalankan appointment system migration
**File:** `supabase/migrations/20250109000001_create_appointments_system.sql`

**Command:**
```bash
# Via Supabase Dashboard SQL Editor
# Copy-paste migration file dan Run

# Atau via CLI
supabase db push
```

**Verification after deployment:**
```sql
-- Should return UUID or NULL (no error)
SELECT get_shared_chat_room(
  (SELECT id FROM profiles WHERE account_type = 'user' LIMIT 1),
  (SELECT id FROM profiles WHERE account_type = 'professional' LIMIT 1)
);
```

---

## Rollback Plan

Jika ada masalah dengan function ini:

```sql
-- Drop function
DROP FUNCTION IF EXISTS get_shared_chat_room(UUID, UUID);

-- Safe Mother Konsultasi akan error lagi, tapi at least tidak crash database
```

**Better solution:**
Fix function definition dan re-deploy:

```sql
-- Replace function dengan fixed version
CREATE OR REPLACE FUNCTION get_shared_chat_room(...)
...
```

---

## Lessons Learned

1. **Always check RPC function exists** sebelum call dari frontend
2. **Version control migrations** untuk prevent missing functions
3. **Test Safe Mother integration** setelah database changes
4. **Document all RPC functions** untuk prevent accidental deletion

---

## Status

- ✅ Function created di migration file
- ⏳ Waiting for migration execution
- ⏳ Pending verification testing
- ⏳ Pending Safe Mother re-testing

**Next Steps:**
1. Execute migration di Supabase
2. Test Safe Mother Konsultasi page
3. Verify no errors in console
4. Test room creation flow end-to-end

---

## Related Issues

- **Appointment System:** Menggunakan function serupa (`create_chat_room_for_appointment`)
- **Message Management:** Relies on chat_rooms structure
- **RLS Policies:** Function uses SECURITY DEFINER untuk bypass RLS safely

---

## Conclusion

This bug fix adalah **bonus** dari appointment system implementation! 🎉

Kita tidak hanya build new feature, tapi juga **fix existing bug** di Safe Mother yang mungkin sudah lama exist.

**Two birds, one stone!** 🐦🐦🪨
