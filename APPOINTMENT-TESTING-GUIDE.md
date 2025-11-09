# 🧪 Appointment System - Testing Guide

## ✅ Migration Status: DEPLOYED

**Database:** ✅ Table created, RLS enabled, Policies active, Triggers working
**Frontend:** ✅ Components created, TypeScript errors fixed, Integration complete

---

## 🎯 Testing Checklist

### **Prerequisites:**
- [ ] Development server running (`npm run dev`)
- [ ] 2 test accounts ready:
  - Regular user account
  - Professional account (account_type = 'professional')
- [ ] Browser console open (F12) untuk monitoring errors

---

## 👤 **Test 1: User Creates Appointment**

### Steps:
1. Login dengan **regular user account**
2. Navigate ke Dashboard → **Janji Konsultasi**
3. Klik button **"Buat Janji Konsultasi"**
4. Dialog form muncul

### Fill Form:
- **Pilih Konselor:** Select professional dari dropdown
- **Jenis Konsultasi:** Pilih "Kecemasan" (anxiety)
- **Tanggal:** Pilih besok
- **Waktu:** Pilih 10:00
- **Topik:** Tulis "Saya mengalami kecemasan saat akan presentasi"
- Klik **"Kirim Permintaan"**

### Expected Results:
- ✅ Toast notification: "Permintaan janji konsultasi berhasil dikirim!"
- ✅ Dialog closes automatically
- ✅ New appointment card appears dengan status **🟡 Menunggu**
- ✅ Card shows:
  - Konselor name
  - Jenis konsultasi: Kecemasan
  - Waktu yang diinginkan
  - Topik yang ditulis
  - Button "Batalkan"

### Verify in Browser Console:
```javascript
// Should see Supabase INSERT query success
// No errors logged
```

### Verify in Database:
```sql
SELECT * FROM appointments 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected: 1 row with your data
```

---

## 👨‍⚕️ **Test 2: Professional Views Request**

### Steps:
1. **Logout** dari user account
2. Login dengan **professional account** (yang dipilih di Test 1)
3. Navigate ke Dashboard → **Janji Konsultasi**
4. Tab **"Permintaan Baru"** terbuka otomatis

### Expected Results:
- ✅ Appointment request card appears
- ✅ Card shows:
  - User name & avatar
  - Jenis konsultasi
  - Waktu yang diminta
  - Topik masalah
  - 3 buttons: **Setujui**, **Tolak**, **Jadwal Ulang**
- ✅ Real-time: Jika user cancel, card hilang otomatis

### Test Real-time Update:
1. **Keep professional page open**
2. Open **new browser window/incognito**
3. Login as user
4. Cancel appointment
5. **Switch back to professional page**
6. ✅ Card should disappear automatically (no refresh needed)

---

## ✅ **Test 3: Professional Approves Appointment**

### Steps (as Professional):
1. On pending request card, click **"Setujui"**
2. Dialog opens dengan datetime picker
3. Default time = waktu yang diminta user (10:00)
4. (Optional) Ubah waktu jika perlu
5. (Optional) Tulis catatan: "Saya siap membantu Anda"
6. Click **"Konfirmasi"**

### Expected Results:
- ✅ Toast: "Appointment berhasil disetujui"
- ✅ Dialog closes
- ✅ Card pindah ke tab **"Riwayat"**
- ✅ Status badge berubah jadi **🟢 Disetujui**

### **CRITICAL: Auto Chat Room Creation** 🤖

Check di tab **"Pesan"** (Messages):
- ✅ **New chat room automatically created!**
- ✅ Room has badge **"Konsultasi"** dengan pink background
- ✅ Room includes user & professional sebagai participants
- ✅ Can send message immediately

### Verify in Database:
```sql
-- Check appointment updated
SELECT 
  id, 
  status, 
  approved_datetime, 
  chat_room_id 
FROM appointments 
WHERE id = '<appointment_id>';

-- Expected:
-- status = 'approved'
-- approved_datetime = NOT NULL
-- chat_room_id = NOT NULL (UUID)

-- Check chat room created
SELECT * FROM chat_rooms WHERE id = '<chat_room_id>';

-- Expected:
-- type = 'consultation'
-- created_by = professional_id

-- Check participants
SELECT user_id FROM chat_participants WHERE chat_room_id = '<chat_room_id>';

-- Expected: 2 rows (user_id & professional_id)
```

---

## 💬 **Test 4: User Opens Chat Room**

### Steps (as User):
1. Navigate ke Dashboard → **Janji Konsultasi**
2. Appointment status updated otomatis jadi **🟢 Disetujui**
3. Card shows:
   - ✅ Waktu yang diinginkan (original request)
   - ✅ **Waktu Terjadwal** (approved datetime) - highlighted green
   - ✅ Button **"Buka Chat Room"**
4. Click **"Buka Chat Room"**

### Expected Results:
- ✅ Redirect ke Dashboard Messages tab
- ✅ Chat room auto-selected (or click manual)
- ✅ Chat room has **"Konsultasi"** badge
- ✅ Can send messages
- ✅ Professional receives messages real-time

### Test Chat Flow:
1. User sends: "Terima kasih sudah menyetujui!"
2. Professional (in other window) sees message immediately
3. Professional replies: "Sama-sama, saya siap membantu"
4. User sees reply real-time
5. ✅ Full consultation dapat dilakukan via chat

---

## ❌ **Test 5: Professional Rejects Appointment**

### Setup:
1. Create **new appointment** (repeat Test 1)
2. Login as professional

### Steps:
1. On pending request, click **"Tolak"**
2. Dialog opens with textarea
3. **Wajib isi alasan:** "Jadwal saya penuh untuk minggu ini. Mohon pilih waktu minggu depan."
4. Click **"Konfirmasi"**

### Expected Results:
- ✅ Toast: "Appointment berhasil ditolak"
- ✅ Card pindah ke **"Riwayat"**
- ✅ Status badge: **🔴 Ditolak**

### User Side:
- ✅ Appointment status updated jadi **Ditolak**
- ✅ Card shows alasan penolakan (red background box)
- ✅ User dapat baca reason
- ✅ User bisa create new request dengan waktu berbeda

### Verify Database:
```sql
SELECT status, rejection_reason 
FROM appointments 
WHERE id = '<appointment_id>';

-- Expected:
-- status = 'rejected'
-- rejection_reason = 'Jadwal saya penuh...'
```

---

## 🔵 **Test 6: Professional Reschedules**

### Setup:
1. Create **new appointment** untuk waktu 10:00
2. Login as professional

### Steps:
1. Click **"Jadwal Ulang"**
2. Dialog opens
3. Change time dari 10:00 → **14:00**
4. Tulis catatan: "Waktu pagi sudah terisi, bagaimana jika sore hari jam 2?"
5. Click **"Konfirmasi"**

### Expected Results:
- ✅ Status badge: **🔵 Dijadwal Ulang**
- ✅ Waktu di-update jadi 14:00
- ✅ Catatan reschedule muncul

### User Side:
- ✅ Status updated real-time
- ✅ Card shows:
  - Waktu original (10:00)
  - **Catatan reschedule** (blue box)
- ✅ User bisa cancel dan create new request
- ✅ Or wait untuk professional approve waktu baru

### Note:
- ❌ Chat room **NOT auto-created** saat reschedule
- ✅ Chat room created **hanya saat approved**

---

## 🚫 **Test 7: User Cancels Appointment**

### Steps (as User):
1. On **pending** appointment card
2. Click **"Batalkan"**
3. Confirmation dialog appears
4. (Optional) Tulis alasan: "Saya sudah dapat solusi dari sumber lain"
5. Click **"Ya, Batalkan"**

### Expected Results:
- ✅ Toast: "Janji konsultasi berhasil dibatalkan"
- ✅ Status badge: **⚫ Dibatalkan**
- ✅ No more actions available (read-only)

### Professional Side:
- ✅ Card disappears dari **"Permintaan Baru"**
- ✅ Visible di **"Riwayat"** dengan status cancelled
- ✅ Professional bisa lihat alasan cancellation (if provided)

### Security Test:
Try to cancel **approved** appointment:
- ✅ "Batalkan" button **NOT shown** (only for pending)
- ✅ User harus hubungi professional via chat untuk cancel approved appointment

---

## 🔒 **Test 8: Security (RLS Policies)**

### Test 8.1: User Cannot See Other's Appointments
```sql
-- Login as User A
-- Try to query User B's appointment
SELECT * FROM appointments WHERE user_id = '<user_b_id>';

-- Expected: 0 rows (RLS blocks query)
```

### Test 8.2: User Cannot Create Appointment for Others
```javascript
// Try to insert appointment dengan user_id berbeda
await supabase.from('appointments').insert({
  user_id: '<other_user_id>',  // NOT auth.uid()
  professional_id: '...',
  // ...
});

// Expected: Error - RLS policy violation
```

### Test 8.3: Professional Cannot Update Other Professional's Appointments
```sql
-- Login as Professional A
-- Try to approve Professional B's appointment
UPDATE appointments 
SET status = 'approved' 
WHERE professional_id = '<professional_b_id>';

-- Expected: 0 rows updated (RLS blocks)
```

### Test 8.4: Admin Full Access
```sql
-- Login as admin (is_admin = true)
SELECT * FROM appointments;

-- Expected: See ALL appointments (admin override)

-- Admin can update any appointment
UPDATE appointments SET status = 'completed' WHERE id = '...';

-- Expected: Success
```

---

## 🎨 **Test 9: UI/UX Features**

### Test Real-time Updates:
1. **Open 2 browser windows:**
   - Window 1: User account
   - Window 2: Professional account
2. User creates appointment
3. **Without refresh**, professional sees new request appear
4. Professional approves
5. **Without refresh**, user sees status change to approved
6. ✅ Real-time subscriptions working!

### Test Status Badges:
- 🟡 **Pending** - Yellow badge with Clock icon
- 🟢 **Approved** - Green badge with CheckCircle icon
- 🔴 **Rejected** - Red/destructive badge with XCircle icon
- 🔵 **Rescheduled** - Blue outline badge with RotateCcw icon
- ⚪ **Completed** - Gray outline with CheckCircle
- ⚫ **Cancelled** - Dark outline with XCircle

### Test Empty States:
1. Login with account yang **belum ada appointments**
2. Navigate ke Janji Konsultasi
3. ✅ See nice empty state dengan Calendar icon
4. ✅ Message: "Anda belum memiliki janji konsultasi"

### Test Loading States:
1. Create appointment
2. While submitting: ✅ Button shows spinner + "Mengirim..."
3. After success: ✅ Button back to normal
4. ✅ No double-submit allowed

---

## 🐛 **Test 10: Error Handling**

### Test 10.1: Form Validation
Try to submit dengan:
- ❌ No professional selected → Toast error
- ❌ No consultation type → Toast error
- ❌ No date/time → HTML5 validation
- ❌ Past date → Should prevent (min date = today)

### Test 10.2: Network Errors
1. Open DevTools → Network tab
2. Set **Offline mode**
3. Try to create appointment
4. ✅ Should show error toast: "Gagal membuat janji konsultasi"

### Test 10.3: Approve Without Datetime
```javascript
// Should not happen via UI, but test via direct update
await supabase.from('appointments').update({
  status: 'approved',
  approved_datetime: null  // Violates constraint
}).eq('id', '...');

// Expected: Error - constraint violation
```

---

## 📊 **Test 11: Database Triggers**

### Test Auto-create Chat Room Trigger:
```sql
-- Manual trigger test via SQL
UPDATE appointments 
SET status = 'approved', approved_datetime = NOW()
WHERE id = '<pending_appointment_id>';

-- Check results:
SELECT chat_room_id FROM appointments WHERE id = '<appointment_id>';
-- Expected: chat_room_id NOT NULL

SELECT * FROM chat_rooms WHERE id = '<chat_room_id>';
-- Expected: type = 'consultation', created_by = professional_id

SELECT COUNT(*) FROM chat_participants WHERE chat_room_id = '<chat_room_id>';
-- Expected: 2 (user & professional)
```

### Test Updated_at Trigger:
```sql
UPDATE appointments SET status = 'completed' WHERE id = '...';

SELECT updated_at, created_at FROM appointments WHERE id = '...';

-- Expected: updated_at > created_at
```

---

## 🔍 **Test 12: Edge Cases**

### Test 12.1: Approve Same User-Professional Twice
1. User creates appointment with Professional A
2. Professional A approves → Chat room created
3. User creates **second appointment** with same Professional A
4. Professional A approves again
5. ✅ Should **reuse existing chat room** (not create duplicate)

Verify:
```sql
-- Should have 2 appointments but only 1 chat room
SELECT COUNT(*) FROM appointments 
WHERE user_id = '...' AND professional_id = '...' AND status = 'approved';
-- Expected: 2

SELECT COUNT(DISTINCT chat_room_id) FROM appointments
WHERE user_id = '...' AND professional_id = '...' AND status = 'approved';
-- Expected: 1 (same room for both)
```

### Test 12.2: Concurrent Approvals
1. Professional has multiple pending requests
2. Approve them one by one quickly
3. ✅ Each creates chat room successfully
4. ✅ No race conditions

---

## ✅ **Success Criteria**

All tests pass if:
- ✅ User dapat create appointments
- ✅ Professional dapat view pending requests
- ✅ Professional dapat approve/reject/reschedule
- ✅ **Chat room auto-created saat approve**
- ✅ User dapat view status real-time
- ✅ User dapat cancel pending appointments
- ✅ RLS policies prevent unauthorized access
- ✅ Real-time updates working (no manual refresh needed)
- ✅ No TypeScript/console errors
- ✅ UI responsive dan user-friendly

---

## 🐛 **Troubleshooting**

### Issue: "Appointment tidak muncul di list"
**Solution:** Check RLS policies - pastikan login dengan account yang sesuai

### Issue: "Chat room tidak auto-created"
**Solution:** 
1. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'create_chat_room_on_approval'`
2. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'create_chat_room_for_appointment'`
3. Check Supabase logs untuk trigger errors

### Issue: "Real-time update tidak berfungsi"
**Solution:**
1. Check browser console untuk subscription errors
2. Verify Supabase Realtime enabled di dashboard
3. Check network tab - should see websocket connection

### Issue: "TypeScript errors in components"
**Solution:** 
1. Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Regenerate types: `npx supabase gen types typescript --project-id gfeuhclekmdxaatyyiez`

---

## 📞 **Need Help?**

If any test fails:
1. Screenshot error message
2. Check browser console logs
3. Check Supabase Dashboard → Logs
4. Share error details untuk debugging

---

**Happy Testing! 🚀**
