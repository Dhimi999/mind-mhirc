# 📋 Panduan Lengkap: Sistem Janji Konsultasi

## 🎯 Untuk Apa Fitur Ini?

Sistem ini menggantikan workflow manual via WhatsApp. Sekarang **user bisa langsung request appointment** melalui website, dan **professional tinggal approve** tanpa perlu manual create chat room.

**Before (Manual):**
```
User → WhatsApp ke Professional → Professional create chat room manual → Consultation
```

**After (Automated):**
```
User → Request appointment via web → Professional approve → Chat room auto-created ✨ → Consultation
```

---

## 👤 Panduan untuk USER

### 1. Membuat Permintaan Janji Konsultasi

**Langkah-langkah:**

1. Login ke dashboard
2. Klik menu **"Janji Konsultasi"** di sidebar
3. Klik tombol **"Buat Janji Konsultasi"**
4. Isi form:
   - **Pilih Konselor:** Pilih dari dropdown profesional yang tersedia
   - **Jenis Konsultasi:** Pilih kategori masalah (Stress, Anxiety, dll.)
   - **Tanggal & Waktu:** Pilih waktu yang kamu inginkan
   - **Topik (opsional):** Ceritakan singkat masalah yang ingin dikonsultasikan
5. Klik **"Kirim Permintaan"**

**Hasil:**
- ✅ Permintaan terkirim dengan status **"Menunggu"**
- 📧 Konselor akan menerima notifikasi
- 🔔 Kamu akan dapat update saat konselor approve/reject

### 2. Melihat Status Appointment

Di halaman **"Janji Konsultasi"**, kamu bisa lihat:

- **Status Badge:**
  - 🟡 **Menunggu** - Sedang menunggu persetujuan konselor
  - 🟢 **Disetujui** - Konselor sudah approve! Lihat waktu final di bawah
  - 🔴 **Ditolak** - Konselor reject (lihat alasan penolakan)
  - 🔵 **Dijadwal Ulang** - Waktu di-reschedule (lihat catatan)
  - ⚪ **Selesai** - Consultation sudah selesai
  - ⚫ **Dibatalkan** - Kamu sudah cancel

- **Informasi Detail:**
  - Nama konselor & profesinya
  - Waktu yang kamu request
  - Waktu final (jika sudah approved)
  - Topik yang kamu tulis
  - Catatan dari konselor (jika ada)

### 3. Membatalkan Appointment

**Jika masih status "Menunggu":**
1. Scroll ke appointment yang ingin dibatalkan
2. Klik tombol **"Batalkan"**
3. (Opsional) Tulis alasan pembatalan
4. Klik **"Ya, Batalkan"**

**Note:** Kamu hanya bisa cancel appointment yang masih **pending**. Jika sudah approved, hubungi konselor via chat room.

### 4. Memulai Konsultasi

**Setelah appointment disetujui:**
1. Appointment akan berubah status jadi **"Disetujui"**
2. Muncul tombol **"Buka Chat Room"**
3. Klik tombol tersebut → redirect ke halaman Messages
4. Chat room dengan konselor sudah **otomatis dibuat** ✨
5. Mulai konsultasi!

**Tips:**
- Chat room akan ada badge **"Konsultasi"** dengan background pink
- Kamu bisa chat kapan saja setelah appointment approved
- Chat history tersimpan untuk referensi di masa depan

---

## 👨‍⚕️ Panduan untuk PROFESSIONAL

### 1. Melihat Permintaan Appointment

**Langkah-langkah:**

1. Login ke dashboard professional
2. Klik menu **"Janji Konsultasi"** di sidebar
3. Kamu akan lihat 2 tab:
   - **Permintaan Baru** - Pending appointments yang perlu di-review
   - **Riwayat** - Semua appointments (approved, rejected, dll.)

**Di tab "Permintaan Baru":**
- Lihat semua pending requests
- Info yang ditampilkan:
  - Nama user (dengan avatar)
  - Jenis konsultasi
  - Waktu yang diminta user
  - Topik/masalah yang dihadapi (jika user tulis)
  - Kapan request dibuat

### 2. Menyetujui Appointment

**Langkah-langkah:**

1. Review detail permintaan
2. Klik tombol **"Setujui"**
3. **Pilih waktu final:**
   - Default: waktu yang diminta user
   - Bisa ubah jika perlu reschedule
4. (Opsional) Tulis catatan untuk user
5. Klik **"Konfirmasi"**

**Apa yang Terjadi:**
- ✅ Appointment status berubah jadi **"Disetujui"**
- 🤖 **Chat room otomatis dibuat** dengan type "consultation"
- 👥 User & kamu auto-added sebagai participants
- 🔗 Chat room ID saved di appointment record
- 📧 User dapat notifikasi approval
- 💬 User bisa langsung buka chat room dan mulai konsultasi

**Auto-Create Chat Room:**
```
Professional approve → Trigger dijalankan → Chat room dibuat → User & Professional added → Ready to chat!
```

### 3. Menolak Appointment

**Jika tidak bisa melayani request:**

1. Klik tombol **"Tolak"**
2. **Wajib isi alasan penolakan** (untuk feedback ke user)
   - Contoh: "Jadwal penuh untuk minggu ini"
   - Contoh: "Request di luar jam praktik saya"
3. Klik **"Konfirmasi"**

**Hasil:**
- ❌ Appointment status jadi **"Ditolak"**
- 📧 User dapat notifikasi dengan alasan penolakan
- 🔄 User bisa buat request baru dengan waktu berbeda

**Best Practice:**
- Berikan alasan yang jelas dan konstruktif
- Jika memungkinkan, suggest waktu alternatif di catatan

### 4. Menjadwal Ulang (Reschedule)

**Jika waktu yang diminta tidak sesuai:**

1. Klik tombol **"Jadwal Ulang"**
2. Pilih waktu baru yang sesuai dengan jadwalmu
3. Tulis catatan kenapa perlu reschedule
   - Contoh: "Waktu yang kamu request sudah terisi. Saya reschedule ke hari berikutnya, apakah cocok?"
4. Klik **"Konfirmasi"**

**Hasil:**
- 🔵 Appointment status jadi **"Dijadwal Ulang"**
- 📅 Waktu di-update sesuai pilihan kamu
- 📧 User dapat notifikasi dengan waktu baru & catatan
- 💬 Chat room **TIDAK auto-created** (menunggu user konfirmasi)

**Note:** User bisa accept reschedule atau cancel dan request ulang.

### 5. Mengelola Riwayat Appointments

**Di tab "Riwayat":**
- Lihat semua appointments (approved, rejected, completed, dll.)
- Filter berdasarkan status
- Review history konsultasi dengan user tertentu
- Track appointment yang sudah selesai

**Update Status:**
- Kamu bisa update appointment jadi **"Selesai"** setelah consultation done
- Ini membantu tracking dan analytics

---

## 🔒 Keamanan & Privacy

### Row Level Security (RLS):

**User bisa:**
- ✅ Lihat appointment milik sendiri saja
- ✅ Buat appointment untuk diri sendiri
- ✅ Cancel appointment milik sendiri

**Professional bisa:**
- ✅ Lihat appointment yang addressed ke mereka
- ✅ Update (approve/reject/reschedule) appointment mereka
- ❌ Tidak bisa lihat appointment professional lain

**Admin bisa:**
- ✅ Full access ke semua appointments
- ✅ Management & oversight

### Validasi:

**Tidak bisa:**
- ❌ User create appointment untuk orang lain
- ❌ Approve appointment tanpa set waktu final
- ❌ Approve appointment tanpa create chat room
- ❌ Pilih waktu di masa lalu

---

## 🎨 Fitur Real-time

### Live Updates:
- Perubahan status langsung terlihat **tanpa refresh page**
- Menggunakan Supabase Real-time subscriptions
- User & professional sama-sama dapat live updates

### Contoh:
```
Professional approve appointment
     ↓
User page auto-update status jadi "Disetujui"
     ↓
Tombol "Buka Chat Room" muncul otomatis
```

---

## 📊 Status Appointment

### Status Flow:

```
Pending → (Professional Action)
   ↓
   ├─ Approved → Completed (after consultation)
   ├─ Rejected (dengan alasan)
   ├─ Rescheduled → (waiting user confirmation)
   └─ Cancelled (user action)
```

### Detail Status:

1. **Pending** (🟡)
   - Default status setelah user submit
   - Menunggu professional action
   - User bisa cancel

2. **Approved** (🟢)
   - Professional sudah setujui
   - Waktu final sudah ditentukan
   - Chat room auto-created
   - User bisa langsung mulai chat

3. **Rejected** (🔴)
   - Professional reject request
   - Alasan penolakan ditampilkan
   - User bisa buat request baru

4. **Rescheduled** (🔵)
   - Waktu di-adjust oleh professional
   - Catatan reschedule ditampilkan
   - Menunggu user konfirmasi

5. **Completed** (⚪)
   - Consultation sudah selesai
   - Status archive
   - Bisa jadi referensi history

6. **Cancelled** (⚫)
   - User cancel request
   - Bisa tulis alasan pembatalan
   - Status final

---

## 🐛 Troubleshooting

### User: "Saya tidak bisa buat appointment"

**Check:**
- ✅ Sudah login?
- ✅ Account type = "user" (bukan professional/admin)?
- ✅ Sudah pilih semua field yang required?
- ✅ Waktu yang dipilih tidak di masa lalu?

### Professional: "Appointment sudah approve tapi chat room tidak muncul"

**Check:**
- ✅ Refresh halaman Messages
- ✅ Check `chat_rooms` table di database (should have type = 'consultation')
- ✅ Check `appointments` table → `chat_room_id` should not be null
- ✅ Check console log untuk errors

**Manual Fix (if needed):**
```sql
-- Jalankan di SQL Editor untuk create chat room manual
SELECT create_chat_room_for_appointment('<appointment_id>');
```

### "Error saat load appointments"

**Possible Causes:**
- Database connection issue
- RLS policy blocking query
- Missing Supabase client setup

**Debug:**
```javascript
// Check browser console untuk error details
// Verify Supabase client initialized correctly
console.log(supabase.auth.getUser());
```

---

## 💡 Tips & Best Practices

### Untuk User:

1. **Pilih waktu yang realistis**
   - Hindari request di jam-jam sibuk
   - Berikan cushion time 24-48 jam untuk professional review

2. **Tulis topik dengan jelas**
   - Bantu professional understand masalah kamu
   - Tidak perlu detail banget, cukup overview

3. **Check status secara berkala**
   - Real-time updates enabled tapi bisa juga manual refresh

4. **Jika urgent:**
   - Contact professional via emergency channel
   - Jangan rely pada appointment system untuk crisis

### Untuk Professional:

1. **Review requests secara berkala**
   - Set notifikasi untuk new requests
   - Respond within 24 jam jika memungkinkan

2. **Berikan feedback yang konstruktif**
   - Jika reject, kasih alasan jelas
   - Suggest alternatif jika ada

3. **Manage schedule dengan baik**
   - Jangan over-approve appointments
   - Leave buffer time antar sessions

4. **Maintain chat room after approval**
   - Chat room adalah continuation dari appointment
   - Keep conversation professional & supportive

---

## 📞 Support

Jika ada masalah atau pertanyaan:

1. **Technical Issue:**
   - Check console log untuk errors
   - Screenshot error message
   - Contact technical support

2. **Feature Request:**
   - Submit feedback via dashboard
   - Describe use case dengan detail

3. **Emergency:**
   - Use emergency contact channel
   - Don't rely on appointment system for urgent cases

---

## 🎉 Kesimpulan

Sistem Janji Konsultasi ini dirancang untuk:
- ✅ **Simplify** workflow appointment booking
- ✅ **Automate** chat room creation
- ✅ **Improve** user experience
- ✅ **Reduce** manual work untuk professionals
- ✅ **Maintain** privacy & security dengan RLS

**Selamat menggunakan! 🚀**
