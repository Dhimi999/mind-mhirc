# 📋 Analisis Fitur Janji Konsultasi dan Pesan

## 🎯 Overview

Sistem memiliki 2 fitur utama untuk komunikasi:
1. **Pesan (Messages)** - `MessageManagement.tsx`
2. **Konsultasi Profesional** - `Konsultasi.tsx` (khusus Safe Mother)

---

## ⚠️ UPDATE PENTING - Fitur Independen Dashboard

Setelah pemeriksaan lebih teliti, berikut adalah temuan lengkap:

### ✅ Fitur yang ADA dan BERFUNGSI:

**1. MessageManagement (Dashboard - `/dashboard/messages`)**
- **2 Tab:** Chat & Broadcast
- **Fitur Chat:**
  - Deteksi room type (general vs consultation)
  - Badge "SM" (Safe Mother) untuk consultation rooms
  - Background pink untuk consultation rooms
  - Full real-time messaging
- **Fitur Broadcast:**
  - Terima broadcast dari Admin
  - Priority labels
  - Mark as read

**2. Konsultasi Profesional (Safe Mother - `/safe-mother/konsultasi`)**
- Daftar profesional (Dokter/Perawat)
- Mulai konsultasi (create consultation room)
- Riwayat konsultasi
- Real-time chat dengan profesional
- **TERHUBUNG** dengan MessageManagement dashboard (room type = "consultation")

**3. ForumMind (Dashboard - `/dashboard/mindforum`)**
- Forum diskusi komunitas
- Public, Parent, Child forums
- Post & comment system
- Like system
- Anonymous username

**4. Meeting Management (Program-Specific)**
- HibridaMeetingManagement (Hibrida CBT)
- SpiritualMeetingManagement (Spiritual & Budaya)
- SaveMotherMeetingManagement (Safe Mother)
- **INI BUKAN appointment umum** - khusus untuk jadwal sesi program tertentu

### ❌ Fitur yang BELUM ADA:

**1. Janji Konsultasi Umum (`/dashboard/appointments`)**
- **STATUS:** PLACEHOLDER ONLY
- Tidak ada booking system
- Tidak ada calendar view
- Tidak ada approval flow
- Tidak ada tabel `appointments` di database

**2. AI Companion Chat**
- Route ada (`/dashboard/ai-companion`)
- Import lazy loaded
- **Belum dicek detail implementasinya**

**3. Diary/Catatan Harian**
- Route ada (`/dashboard/diary`)  
- Import lazy loaded
- **Belum dicek detail implementasinya**

---

## 🏗️ Struktur Database

### Tabel Utama:

#### 1. `chat_rooms`
```sql
- id: UUID (Primary Key)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_message: TEXT (nullable)
- last_message_at: TIMESTAMP (nullable)
- created_by: UUID (user_id yang membuat)
- type: TEXT (nullable) - nilai: 'consultation', 'general', dll
```

**Fungsi:**
- Menyimpan ruang obrolan antara 2+ pengguna
- `type = 'consultation'` → untuk konsultasi profesional
- `type = NULL` atau 'general' → untuk chat umum

#### 2. `chat_participants`
```sql
- id: UUID (Primary Key)
- chat_room_id: UUID (Foreign Key → chat_rooms)
- user_id: UUID (Foreign Key → auth.users)
- created_at: TIMESTAMP
```

**Fungsi:**
- Relasi many-to-many antara users dan chat rooms
- Satu room bisa punya banyak partisipan
- Satu user bisa ada di banyak room

#### 3. `chat_messages`
```sql
- id: UUID (Primary Key)
- chat_room_id: UUID (Foreign Key → chat_rooms)
- sender_id: UUID (Foreign Key → auth.users)
- content: TEXT
- created_at: TIMESTAMP
- read_by: JSONB - array of user_id yang sudah baca
```

**Fungsi:**
- Menyimpan semua pesan dalam room
- `read_by` untuk tracking status baca

#### 4. `broadcasts`
```sql
- id: UUID (Primary Key)
- title: TEXT
- content: TEXT
- created_at: TIMESTAMP
- created_by: UUID
- priority: TEXT - 'urgent', 'high', 'regular', 'info', 'recommendation'
- recipients: JSONB - array: ['all', 'general', 'professional']
- recepient_read: JSONB - array of user_id yang sudah baca
```

**Fungsi:**
- Pesan siaran/broadcast dari admin ke user
- Bisa filter berdasarkan account_type

#### 5. `profiles`
```sql
- id: UUID (Primary Key, sama dengan auth.users.id)
- full_name: TEXT
- avatar_url: TEXT
- account_type: TEXT - 'general', 'professional'
- is_admin: BOOLEAN
- profession: TEXT - 'Dokter', 'Perawat', dll
```

---

## 🔄 Alur Fitur - Flow Diagram

### 1. **Alur Pesan Obrolan (Chat)**

```
┌─────────────────────────────────────────────────────────────┐
│                    AKUN REGULER (User)                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Buka /dashboard/messages (tab Chat) │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Fetch chat_rooms via                 │
        │ chat_participants (user_id = self)   │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Tampilkan daftar chat rooms          │
        │ (hanya yang user adalah partisipan)  │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ User pilih satu room                 │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Fetch chat_messages (room_id)        │
        │ Subscribe real-time (INSERT event)   │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ User ketik & kirim pesan             │
        │ INSERT to chat_messages              │
        │ read_by = [sender_id]                │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Real-time: Pesan muncul di UI        │
        │ Partisipan lain dapat notif          │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AKUN ADMIN                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Semua fitur user +                   │
        │ Tombol "Buat Obrolan Baru"           │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Admin pilih user dari daftar         │
        │ (search available users)             │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ INSERT chat_room (created_by=admin)  │
        │ INSERT chat_participants:            │
        │   - admin                            │
        │   - selected user                    │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Room baru muncul di daftar           │
        │ Admin & user bisa mulai chat         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Admin bisa DELETE room               │
        │ (hanya jika created_by = admin.id)   │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              AKUN PROFESSIONAL (Dokter/Perawat)              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Sama seperti User Reguler            │
        │ (tidak ada privilege khusus di chat) │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ TAPI: Bisa menerima konsultasi       │
        │ dari user via halaman Konsultasi     │
        │ (Safe Mother feature)                │
        └──────────────────────────────────────┘
```

---

### 2. **Alur Pesan Siaran (Broadcast)**

```
┌─────────────────────────────────────────────────────────────┐
│                    AKUN ADMIN                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Buka /dashboard/broadcast            │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Buat broadcast baru dengan:          │
        │ - Title                              │
        │ - Content                            │
        │ - Priority (urgent/high/regular/info)│
        │ - Recipients (all/general/prof)      │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ INSERT to broadcasts table           │
        │ recepient_read = []                  │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            AKUN REGULER / PROFESSIONAL                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Buka /dashboard/messages             │
        │ (tab Pesan Siaran)                   │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Fetch broadcasts WHERE:              │
        │ recipients CONTAINS account_type     │
        │ OR recipients CONTAINS 'all'         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Filter: is_read = user.id NOT IN     │
        │         broadcast.recepient_read     │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Show unread broadcasts dengan badge  │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ User klik broadcast untuk baca       │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ UPDATE broadcasts                    │
        │ SET recepient_read =                 │
        │   recepient_read + [user.id]         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Badge unread count berkurang         │
        └──────────────────────────────────────┘
```

---

### 3. **Alur Konsultasi Profesional (Safe Mother)**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Ibu Hamil)                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Buka /safe-mother/konsultasi         │
        │ (Tab: Daftar Profesional)            │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Fetch profiles WHERE:                │
        │ profession IN ('Dokter', 'Perawat')  │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ User pilih profesional               │
        │ Klik "Mulai Chat"                    │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Check: Apakah sudah ada room antara  │
        │ user & profesional ini?              │
        │ (via RPC: get_shared_chat_room)      │
        └──────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        [ROOM ADA]            [ROOM BELUM ADA]
                │                     │
                │                     ▼
                │          ┌──────────────────────┐
                │          │ INSERT chat_room     │
                │          │ type='consultation'  │
                │          │ created_by=user.id   │
                │          └──────────────────────┘
                │                     │
                │                     ▼
                │          ┌──────────────────────┐
                │          │ INSERT participants: │
                │          │  - user              │
                │          │  - profesional       │
                │          └──────────────────────┘
                │                     │
                └──────────┬──────────┘
                           ▼
        ┌──────────────────────────────────────┐
        │ Pindah ke tab "Riwayat Konsultasi"   │
        │ selectedRoomId = room.id             │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Fetch chat_messages (room_id)        │
        │ Subscribe real-time updates          │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ User & Profesional bisa chat         │
        │ (sama seperti chat biasa)            │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            PROFESIONAL (Dokter/Perawat)                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Buka /safe-mother/konsultasi         │
        │ (Tab: Riwayat Konsultasi)            │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Fetch semua consultation rooms       │
        │ dimana profesional adalah partisipan │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Lihat daftar user yang konsultasi    │
        │ Pilih room untuk chat                │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Chat dengan user (real-time)         │
        └──────────────────────────────────────┘
```

---

## � Integrasi Safe Mother ↔ Dashboard

### Bagaimana Sistem Terhubung:

**1. Consultation Rooms Created in Safe Mother:**
```tsx
// di Konsultasi.tsx (Safe Mother)
const { data: newRoomData } = await supabase
  .from("chat_rooms")
  .insert({ 
    created_by: user.id, 
    type: "consultation"  // <-- KUNCI: type = consultation
  })
```

**2. Detected in Dashboard MessageManagement:**
```tsx
// di MessageManagement.tsx
const isConsultation = room.type === "consultation";

{isConsultation && (
  <Badge className="...bg-pink-100...">
    <Heart className="w-3 h-3 mr-1" />
    SM  {/* Safe Mother badge */}
  </Badge>
)}
```

**Alur Integrasi:**
1. User buka `/safe-mother/konsultasi`
2. User pilih Dokter/Perawat
3. Sistem create `chat_room` dengan `type='consultation'`
4. User & Profesional bisa chat di Safe Mother page
5. **SAME ROOM** muncul di `/dashboard/messages` dengan badge "SM"
6. User bisa lanjut chat dari dashboard atau Safe Mother (data sync)

**Benefit:**
- User tidak perlu switch halaman
- Profesional bisa jawab dari manapun
- History tersimpan di satu tempat
- Konsisten dengan general chat system

---

## �📊 Perbedaan Fitur Berdasarkan Role

### **User Reguler (account_type = 'general')**

#### Pesan Obrolan (Chat):
- ✅ Lihat daftar chat rooms (hanya yang user adalah partisipan)
- ✅ Buka & baca pesan di room
- ✅ Kirim pesan di room yang sudah ada
- ❌ **TIDAK BISA** buat room baru sendiri
- ❌ **TIDAK BISA** delete room
- ❌ **TIDAK BISA** pilih siapa yang diajak chat

**Catatan:** User hanya bisa chat jika Admin yang membuat room untuk mereka.

#### Pesan Siaran:
- ✅ Lihat broadcast dengan recipients = 'all' atau 'general'
- ✅ Tandai broadcast sebagai sudah dibaca
- ❌ **TIDAK BISA** buat broadcast

#### Konsultasi (jika akses Safe Mother):
- ✅ Lihat daftar profesional (Dokter/Perawat)
- ✅ Mulai konsultasi dengan profesional
- ✅ Chat dengan profesional di consultation room
- ✅ Lihat riwayat konsultasi sebelumnya

---

### **User Professional (account_type = 'professional')**

#### Pesan Obrolan (Chat):
- ✅ Sama seperti User Reguler
- ❌ **TIDAK BISA** buat room baru
- ❌ **TIDAK BISA** delete room

**Catatan:** Professional mengandalkan fitur Konsultasi, bukan chat umum.

#### Pesan Siaran:
- ✅ Lihat broadcast dengan recipients = 'all' atau 'professional'
- ✅ Tandai broadcast sebagai sudah dibaca
- ❌ **TIDAK BISA** buat broadcast

#### Konsultasi (jika profession = 'Dokter' atau 'Perawat'):
- ✅ Muncul di daftar profesional yang bisa dipilih user
- ✅ Menerima consultation request dari user
- ✅ Chat dengan user di consultation room
- ✅ Lihat semua riwayat konsultasi mereka

---

### **Admin (is_admin = true)**

#### Pesan Obrolan (Chat):
- ✅ Semua fitur User Reguler +
- ✅ **BISA** buat room baru
- ✅ **BISA** pilih siapa yang diajak chat (search users)
- ✅ **BISA** delete room (hanya yang created_by = admin.id)

**Use case:** Admin ingin menghubungi user tertentu untuk follow-up.

#### Pesan Siaran:
- ✅ Lihat semua broadcast
- ✅ **BISA** buat broadcast baru
- ✅ **BISA** pilih recipients (all/general/professional)
- ✅ **BISA** set priority (urgent/high/regular/info/recommendation)

**Use case:** Admin ingin broadcast pengumuman/info penting ke semua user.

#### Konsultasi:
- ✅ Akses penuh ke semua fitur konsultasi
- ✅ Bisa lihat semua consultation rooms (jika diperlukan untuk monitoring)

---

## 🔒 Row Level Security (RLS) - Asumsi

Berdasarkan code, RLS kemungkinan:

### `chat_rooms`:
- User hanya bisa SELECT room dimana mereka adalah partisipan (via `chat_participants`)
- Admin bisa SELECT semua room
- Hanya creator (`created_by`) yang bisa DELETE

### `chat_messages`:
- User hanya bisa SELECT message di room dimana mereka partisipan
- User hanya bisa INSERT message di room dimana mereka partisipan
- Tidak ada UPDATE/DELETE untuk user (message permanent)

### `broadcasts`:
- Semua user bisa SELECT (filtered di aplikasi by recipients)
- Hanya admin bisa INSERT
- Hanya admin bisa UPDATE

---

## 🚨 Potensi Masalah & Gap

### 1. **Appointment/Janji Konsultasi BELUM DIIMPLEMENTASI**

**Status saat ini:**
```tsx
// di Dashboard.tsx line 1048
const DashboardAppointments = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Janji Konsultasi</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>
        Halaman ini akan memungkinkan Anda menjadwalkan, melihat, atau
        membatalkan janji konsultasi dengan psikolog atau konselor.
      </p>
    </div>
  </div>
);
```

**Artinya:**
- Menu "Janji Konsultasi" di sidebar ada
- Route `/dashboard/appointments` ada
- **TAPI FITURNYA HANYA PLACEHOLDER!**

**Yang perlu dibuat:**
- Tabel `appointments` di database
- UI untuk booking appointment (pilih tanggal, waktu, profesional)
- Sistem approval/reject dari profesional
- Notifikasi appointment
- Calendar view untuk lihat jadwal

---

### 2. **User Reguler Tidak Bisa Mulai Chat Sendiri**

**Masalah:**
- User reguler hanya bisa chat jika Admin yang membuat room
- Tidak ada cara untuk user memulai chat dengan admin/profesional

**Solusi potensial:**
1. Tambahkan tombol "Hubungi Admin" untuk user reguler
2. Atau, gunakan sistem konsultasi untuk semua komunikasi user-profesional

---

### 3. **Konsultasi Hanya di Safe Mother**

**Masalah:**
- Fitur konsultasi (`Konsultasi.tsx`) hanya ada di `/safe-mother/konsultasi`
- User non-Safe Mother tidak punya akses

**Pertanyaan:**
- Apakah konsultasi harus tersedia di dashboard umum?
- Atau hanya khusus untuk program Safe Mother?

---

### 4. **Tidak Ada Pembedaan Room Type di Chat Umum**

**Masalah:**
- Di `MessageManagement.tsx`, tidak ada filter berdasarkan `type`
- Consultation rooms muncul campur dengan general chat

**Solusi potensial:**
- Tambahkan filter tab: "Konsultasi" vs "Chat Umum"
- Atau, pisahkan konsultasi ke menu terpisah di dashboard

---

### 5. **Tidak Ada Fungsi RPC `get_shared_chat_room`**

**Masalah:**
- `Konsultasi.tsx` line 124 memanggil:
```tsx
const { data: existingRoom, error: checkError } = await supabase.rpc(
  "get_shared_chat_room",
  {
    user_id_1: user.id,
    user_id_2: professionalId,
    room_type: "consultation"
  }
);
```

**Status:** Function ini belum dibuat di database!

**Solusi:**
```sql
CREATE OR REPLACE FUNCTION get_shared_chat_room(
  user_id_1 UUID,
  user_id_2 UUID,
  room_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  room_id UUID;
BEGIN
  SELECT cr.id INTO room_id
  FROM chat_rooms cr
  WHERE (room_type IS NULL OR cr.type = room_type)
  AND EXISTS (
    SELECT 1 FROM chat_participants cp1
    WHERE cp1.chat_room_id = cr.id AND cp1.user_id = user_id_1
  )
  AND EXISTS (
    SELECT 1 FROM chat_participants cp2
    WHERE cp2.chat_room_id = cr.id AND cp2.user_id = user_id_2
  )
  LIMIT 1;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📝 Kesimpulan

### Fitur Yang Sudah Ada & Berfungsi:
✅ **Pesan Obrolan (Chat)** - Real-time messaging antar user
✅ **Pesan Siaran (Broadcast)** - Admin broadcast ke user
✅ **Konsultasi Profesional (Safe Mother)** - Integrated dengan dashboard
✅ **Deteksi Room Type** - Badge & styling untuk consultation rooms
✅ **Real-time sync** - Supabase subscriptions
✅ **Read receipts** - Tracking pesan dibaca
✅ **ForumMind** - Forum komunitas dengan anonymous posting
✅ **Meeting Management** - Jadwal sesi program (bukan appointment umum)

### Fitur Yang Belum Ada:
❌ **Janji Konsultasi Umum (Appointments)** - PLACEHOLDER ONLY (prioritas HIGH)
❌ **User reguler inisiasi chat** - Harus admin yang buat room
❌ **RPC `get_shared_chat_room`** - Belum dibuat (Safe Mother error risk)
❌ **Notification system** - Untuk new messages
❌ **Calendar view** - Untuk lihat semua jadwal konsultasi

### Fitur Yang Perlu Dicek Lebih Lanjut:
🔍 **AI Companion** - Implementasi detail belum dicek
🔍 **Diary/Catatan Harian** - Implementasi detail belum dicek
🔍 **Tests** - System tes psikologi (ada tapi belum di-review)

### Rekomendasi Prioritas:
1. **CRITICAL:** Buat RPC `get_shared_chat_room` agar Safe Mother konsultasi tidak error
2. **HIGH:** Implementasi appointment booking system untuk janji konsultasi umum
3. **HIGH:** Tambahkan cara untuk user reguler inisiasi chat (atau integrate dengan appointment)
4. **MEDIUM:** Notification system untuk new messages & appointments
5. **MEDIUM:** Calendar view untuk semua jadwal (meeting + appointments)
6. **LOW:** Improve UI/UX untuk filter room type (tab terpisah: General vs Consultation)

---

**Dokumentasi ini dibuat pada:** 9 Januari 2025  
**Last updated:** 9 Januari 2025 - Added integration details & updated findings
