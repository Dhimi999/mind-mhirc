# 🔧 PETUNJUK PERBAIKAN ERROR 400 & 23502: Submission History

## ⚠️ PENTING: Fix untuk Error 23502 (NULL ID)

Jika Anda mendapat error **"null value in column \"id\" violates not-null constraint"** (Code: 23502), ini berarti tabel sudah ada di database SEBELUM migration dijalankan dengan benar.

### 🚨 Quick Fix (JALANKAN INI DULU!):

**File:** `supabase/migrations/FIX_ID_DEFAULT.sql`

```sql
-- Jalankan di Supabase SQL Editor:
ALTER TABLE public.cbt_psikoedukasi_submission_history 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.cbt_hibrida_submission_history 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### ✅ Verifikasi Fix Berhasil:

```sql
SELECT 
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('cbt_psikoedukasi_submission_history', 'cbt_hibrida_submission_history')
  AND column_name = 'id';
```

Expected output: `column_default` harus menunjukkan `gen_random_uuid()`.

### 💡 Catatan Teknis:

Kode aplikasi sudah diupdate untuk generate UUID secara manual menggunakan `crypto.randomUUID()`, jadi submission akan bekerja bahkan jika DEFAULT belum diset. Namun, tetap disarankan menjalankan ALTER TABLE di atas untuk konsistensi.

---

## 📌 Masalah yang Ditemukan

Error console:
```
Error submitting assignment: Object
POST https://gfeuhclekmdxaatyyiez.supabase.co/rest/v1/cbt_psikoedukasi_submission_history 400 (Bad Request)
```

**Root Cause:** Tabel `cbt_psikoedukasi_submission_history` dan `cbt_hibrida_submission_history` belum ada di database Supabase Anda.

---

## ✅ Solusi: Jalankan Migration SQL

### Langkah 1: Buka Supabase Dashboard
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda: `gfeuhclekmdxaatyyiez`
3. Klik menu **"SQL Editor"** di sidebar kiri

### Langkah 2: Copy-Paste SQL Migration
1. Buka file: `supabase/migrations/RUN_THIS_MIGRATION.sql`
2. Copy **SELURUH ISI** file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik tombol **"Run"** (atau tekan Ctrl+Enter)

### Langkah 3: Verifikasi Migration Berhasil
Setelah run migration, jalankan query ini untuk memastikan tabel sudah ada:

```sql
SELECT 
  tablename, 
  schemaname 
FROM pg_tables 
WHERE tablename IN ('cbt_psikoedukasi_submission_history', 'cbt_hibrida_submission_history')
ORDER BY tablename;
```

**Output yang diharapkan:**
```
tablename                              | schemaname
---------------------------------------+-----------
cbt_hibrida_submission_history         | public
cbt_psikoedukasi_submission_history    | public
```

### Langkah 4: Test di Website
1. Buka portal psikoedukasi: `/hibrida-cbt/psikoedukasi/sesi/0`
2. Isi penugasan dan klik "📤 Kirim Jawaban"
3. Seharusnya muncul toast success: **"Jawaban berhasil dikirim"**
4. Tombol "📋 Riwayat Jawaban" akan muncul setelah submit pertama

---

## 📦 Apa yang Sudah Diimplementasikan

### 1. Multiple Submission untuk Psikoedukasi Hibrida ✅
**File:** `src/hooks/usePsikoedukasiSession.ts`

**Perubahan:**
- ✅ Fungsi `submitAssignment` sekarang menulis ke 3 tabel:
  1. `cbt_psikoedukasi_assignments` (latest/current)
  2. `cbt_psikoedukasi_submission_history` (history with submission_number)
  3. `cbt_psikoedukasi_user_progress` (mark done)
  
- ✅ Fungsi `fetchSubmissionHistory` sudah ada untuk load riwayat
- ✅ Auto-increment `submission_number` (1, 2, 3, dst.)
- ✅ Support counselor response (kolom: `counselor_response`, `counselor_name`, `responded_at`)

### 2. Multiple Submission untuk Intervensi Hibrida ✅
**File:** `src/hooks/useHibridaSession.ts`

**Perubahan:**
- ✅ Sama seperti psikoedukasi, tapi untuk tabel intervensi:
  1. `cbt_hibrida_assignments` (latest/current)
  2. `cbt_hibrida_submission_history` (history)
  3. `cbt_hibrida_user_progress` (mark done)
  
- ✅ Fungsi `fetchSubmissionHistory` ditambahkan
- ✅ Exported di return object hook

### 3. Database Migrations ✅
**Files Created:**
- `supabase/migrations/20250205000001_add_cbt_psikoedukasi_submission_history.sql`
- `supabase/migrations/20250205000002_add_cbt_hibrida_submission_history.sql`
- `supabase/migrations/RUN_THIS_MIGRATION.sql` ⭐ **JALANKAN INI**

**Struktur Tabel:**
```sql
CREATE TABLE cbt_psikoedukasi_submission_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_number INTEGER,
  submission_number INTEGER,  -- Auto-increment per user per session
  answers JSONB,              -- Data jawaban
  submitted_at TIMESTAMP,
  counselor_response TEXT,    -- Response dari konselor
  counselor_name TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**RLS Policies:**
- ✅ User bisa select/insert data mereka sendiri
- ✅ Counselor (role: 'grup-int', 'grup-cont', 'super-admin') bisa select semua dan update response
- ✅ Admin (profiles.is_admin = true) juga bisa access semua

---

## 🎯 Fitur yang Sudah Bekerja (Setelah Migration)

### Di Portal User:
1. **Submit Multiple Times** ✅
   - User bisa submit jawaban berkali-kali
   - Setiap submit mendapat `submission_number` unik (1, 2, 3, dst.)
   
2. **Riwayat Jawaban** ✅
   - Tombol "📋 Riwayat Jawaban" muncul setelah ada submission
   - Klik untuk lihat list semua jawaban yang pernah dikirim
   - Klik "👁️ Lihat Detail" untuk lihat jawaban spesifik
   
3. **Create New Answer** ✅
   - Tombol "➕ Buat Jawaban Baru" untuk submit lagi
   - Form editable hanya di mode create new
   - Latest submission ditampilkan read-only
   
4. **Counselor Response** ✅
   - Card "💬 Respons Konselor Terbaru" menampilkan response dari konselor
   - Muncul di history detail juga

### Di Dashboard Admin/Counselor:
- Tabel submission_history sudah ready untuk management
- Counselor bisa add response via SQL atau nanti via UI dashboard

---

## 🔍 Debugging Tips

### Jika masih error 400 setelah migration:

1. **Check RLS Policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'cbt_psikoedukasi_submission_history';
```

2. **Check user_id di session:**
```javascript
// Di browser console
console.log(supabase.auth.user()) // Pastikan user_id ada
```

3. **Test manual insert:**
```sql
INSERT INTO cbt_psikoedukasi_submission_history 
  (user_id, session_number, submission_number, answers)
VALUES 
  ('your-user-id-uuid', 0, 1, '{"test": "data"}'::jsonb);
```

4. **Check browser console untuk error detail:**
```javascript
// Error akan log di:
// usePsikoedukasiSession.ts:278 History insert error detail: {...}
```

---

## 📝 Next Steps

### Prioritas Tinggi:
1. ✅ **Jalankan migration SQL** (WAJIB sebelum test)
2. ⏳ Test submit assignment di portal
3. ⏳ Verifikasi history muncul

### Enhancement (Opsional):
1. Buat UI dashboard untuk counselor add response
2. Add notification saat counselor kasih response
3. Export/download history sebagai PDF

---

## 🚀 Quick Test Checklist

Setelah migration, test ini:

- [ ] Login sebagai user biasa
- [ ] Buka `/hibrida-cbt/psikoedukasi/sesi/0`
- [ ] Isi form penugasan
- [ ] Klik "📤 Kirim Jawaban"
- [ ] Cek toast success muncul
- [ ] Klik "📋 Riwayat Jawaban"
- [ ] Lihat list submission
- [ ] Klik "➕ Buat Jawaban Baru"
- [ ] Submit lagi
- [ ] Cek submission_number = 2 di history

---

## 📞 Need Help?

Jika masih error:
1. Screenshot error console lengkap
2. Jalankan query verifikasi di atas
3. Check apakah migration sudah running dengan benar

**File penting:**
- Hook: `src/hooks/usePsikoedukasiSession.ts` (line 241-307)
- Migration: `supabase/migrations/RUN_THIS_MIGRATION.sql`
- Portal: `src/pages/hibrida-naratif/psikoedukasi/HibridaPsikoedukasiUnified.tsx`
