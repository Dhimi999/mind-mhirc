# Hibrida Naratif CBT - Session Configuration Design

## Field Type System untuk Unified Portal

### 1. Basic Field Types

#### `textarea`
```typescript
{
  key: "field_name",
  label: "Label",
  desc: "Description",
  type: "textarea",
  required?: boolean,
  validation?: {
    minLength?: number,
    maxLength?: number
  }
}
```

#### `boolean`
```typescript
{
  key: "field_name",
  label: "Label",
  desc: "Description",
  type: "boolean",
  required?: boolean
}
```

### 2. Complex Field Types

#### `nested-textarea`
Multiple textarea fields grouped together (a, b, c, etc.)
```typescript
{
  key: "pengalaman_tersulit",
  label: "Pengalaman Hidup Tersulit",
  desc: "Main description",
  type: "nested-textarea",
  subFields: [
    {
      key: "keluarga",
      label: "a. Permasalahan keluarga",
      desc: "Sub description"
    },
    {
      key: "harapan",
      label: "b. Harapan dan masa depan",
      desc: "Sub description"
    }
  ],
  required?: boolean
}
```

Storage format:
```json
{
  "pengalaman_tersulit": {
    "keluarga": "user input...",
    "harapan": "user input..."
  }
}
```

#### `checkbox-multiple`
Multiple checkboxes with optional "Other" field
```typescript
{
  key: "pemicu_emosi",
  label: "Pemicu Emosi",
  desc: "Description",
  type: "checkbox-multiple",
  options: [
    "Konflik dengan teman/dosen",
    "Tekanan akademik",
    "Masalah keluarga"
  ],
  allowOther: true,
  otherLabel: "Lainnya",
  validation?: {
    minSelected?: number,
    maxSelected?: number
  }
}
```

Storage format:
```json
{
  "pemicu_emosi": {
    "selected": ["Tekanan akademik", "Masalah keluarga"],
    "other": "Custom text if filled"
  }
}
```

#### `contact-list`
Multiple text inputs for contact information
```typescript
{
  key: "kontak_darurat",
  label: "Kontak Darurat",
  type: "contact-list",
  fields: [
    { key: "teman_dekat", label: "Teman dekat" },
    { key: "keluarga", label: "Keluarga" },
    { key: "dosen_konselor", label: "Dosen wali/konselor" },
    { key: "layanan_darurat", label: "Layanan darurat kampus/RS" }
  ]
}
```

Storage format:
```json
{
  "kontak_darurat": {
    "teman_dekat": "Rani 0812...",
    "keluarga": "Ibu 0813...",
    "dosen_konselor": "Bu Dewi ext.123",
    "layanan_darurat": "RS 021..."
  }
}
```

#### `numbered-list`
User can add/remove numbered items with min/max constraints
```typescript
{
  key: "alasan_hidup",
  label: "Daftar Alasan untuk Tetap Hidup",
  desc: "Tuliskan minimal 5 alasan",
  type: "numbered-list",
  validation: {
    minItems: 5,
    maxItems: 10
  }
}
```

Storage format:
```json
{
  "alasan_hidup": [
    "Alasan 1",
    "Alasan 2",
    "Alasan 3",
    "Alasan 4",
    "Alasan 5"
  ]
}
```

#### `table-builder`
Dynamic table with add/remove rows
```typescript
{
  key: "restrukturisasi",
  label: "Restrukturisasi Pikiran",
  type: "table-builder",
  columns: [
    { key: "pikiran_negatif", label: "Pikiran Negatif" },
    { key: "bukti_mendukung", label: "Bukti Mendukung" },
    { key: "bukti_menentang", label: "Bukti Menentang" },
    { key: "pikiran_alternatif", label: "Pikiran Alternatif" }
  ],
  validation?: {
    minRows?: number,
    maxRows?: number
  }
}
```

Storage format:
```json
{
  "restrukturisasi": [
    {
      "pikiran_negatif": "Saya gagal",
      "bukti_mendukung": "Nilai rendah",
      "bukti_menentang": "Pernah berhasil sebelumnya",
      "pikiran_alternatif": "Ini sementara"
    }
  ]
}
```

#### `repeatable-card`
Repeatable form structure (like Coping Cards)
```typescript
{
  key: "coping_cards",
  label: "Template Coping Cards",
  desc: "Buatkan minimal 3 coping cards",
  type: "repeatable-card",
  cardLabel: "Kartu",
  validation: {
    minCards: 3,
    maxCards: 5
  },
  cardFields: [
    {
      key: "pesan_positif",
      label: "Pesan Positif",
      type: "textarea"
    },
    {
      key: "strategi_koping",
      label: "Strategi Koping",
      type: "textarea"
    },
    {
      key: "kontak_darurat",
      label: "Kontak Darurat",
      type: "textarea"
    },
    {
      key: "alasan_bertahan",
      label: "Alasan untuk Bertahan Hidup",
      type: "textarea"
    },
    {
      key: "motivasi",
      label: "Motivasi Bertahan Hidup",
      type: "textarea"
    }
  ]
}
```

Storage format:
```json
{
  "coping_cards": [
    {
      "pesan_positif": "Saya mampu...",
      "strategi_koping": "Tarik napas...",
      "kontak_darurat": "Rani 0812...",
      "alasan_bertahan": "Keluarga...",
      "motivasi": "Menyelesaikan kuliah..."
    },
    {
      "pesan_positif": "Card 2...",
      // ...
    }
  ]
}
```

## Complete Session Configs Example

### Sesi 1: Crisis Response Plan
```typescript
{
  title: "Pengalaman Crisis Response Plan",
  assignmentFields: [
    {
      key: "pengalaman_tersulit",
      label: "1. Pengalaman Hidup Tersulit Selama menjadi Mahasiswa",
      type: "nested-textarea",
      subFields: [
        {
          key: "keluarga",
          label: "a. Pengalaman hidup tersulit terkait permasalahan keluarga",
          desc: "Meliputi konflik, tekanan ekonomi, masalah kesehatan anggota keluarga"
        },
        {
          key: "harapan_masa_depan",
          label: "b. Pengalaman tersulit mengenai harapan dan masa depan",
          desc: "Kebingungan karier, tekanan lingkungan, kurang percaya diri"
        },
        {
          key: "masalah_pribadi",
          label: "c. Pengalaman tersulit terhadap masalah pribadi",
          desc: "Gangguan mental, masalah hubungan, kesulitan akademik"
        }
      ]
    },
    {
      key: "pemicu_emosi",
      label: "2. Pemicu Emosi",
      desc: "Apa hal-hal yang biasanya memicu stres/krisis bagi Anda?",
      type: "checkbox-multiple",
      options: [
        "Konflik dengan teman/dosen",
        "Tekanan akademik",
        "Masalah keluarga"
      ],
      allowOther: true
    },
    {
      key: "pikiran_otomatis",
      label: "3. Pikiran Otomatis",
      desc: "Ceritakan pikiran pertama yang biasanya muncul saat terjadi pengalaman tersulit",
      type: "textarea"
    },
    {
      key: "emosi_muncul",
      label: "4. Emosi yang Muncul",
      type: "checkbox-multiple",
      options: [
        "Takut/cemas",
        "Sedih/putus asa",
        "Marah/frustasi",
        "Malu/rendah diri",
        "Bersalah",
        "Kebingungan/hilang arah",
        "Kesepian/terisolasi",
        "Menghindar dari orang lain",
        "Menangis",
        "Tersinggung"
      ],
      allowOther: true
    },
    {
      key: "reaksi_perilaku",
      label: "5. Reaksi Perilaku",
      type: "checkbox-multiple",
      options: [
        "Tidur berlebihan",
        "Tidak ingin keluar/mengurung diri",
        "Perubahan nafsu makan",
        "Tidak bisa tidur",
        "Sulit konsentrasi dalam belajar atau kuliah",
        "Mencari pelarian (media sosial, game, belanja, makan cepat saji)",
        "Mencari dukungan (curhat ke teman dekat, dosen, konselor)"
      ],
      allowOther: true
    },
    {
      key: "tanda_peringatan",
      label: "6. Tanda Peringatan Pribadi",
      desc: "Ciri-ciri yang menandakan Anda mulai masuk dalam pengalaman tersulit",
      type: "textarea"
    },
    {
      key: "strategi_koping",
      label: "7. Strategi Koping Sehat",
      type: "nested-textarea",
      subFields: [
        {
          key: "memecahkan_masalah",
          label: "a. Memecahkan masalah"
        },
        {
          key: "dukungan_teman",
          label: "b. Mencari dukungan teman sebaya"
        },
        {
          key: "fasilitas_kesehatan",
          label: "c. Memanfaatkan fasilitas kesehatan"
        },
        {
          key: "hobi",
          label: "d. Melakukan hobi atau kegiatan yang disukai"
        }
      ]
    },
    {
      key: "aktivitas_penenang",
      label: "8. Aktivitas Penenang Diri/Mengalihkan Diri",
      desc: "Centang minimal 3",
      type: "checkbox-multiple",
      validation: { minSelected: 3 },
      options: [
        "Mendengarkan musik",
        "Berdoa/meditasi",
        "Jalan santai",
        "Menulis jurnal",
        "Menghubungi teman"
      ],
      allowOther: true
    },
    {
      key: "kontak_darurat",
      label: "9. Kontak Darurat",
      type: "contact-list",
      fields: [
        { key: "teman_dekat", label: "Teman dekat" },
        { key: "keluarga", label: "Keluarga" },
        { key: "dosen_konselor", label: "Dosen wali/konselor" },
        { key: "layanan_darurat", label: "Layanan darurat kampus/RS" }
      ]
    },
    {
      key: "lingkungan_aman",
      label: "10. Lingkungan Aman atau Tempat untuk Menenangkan Diri",
      type: "checkbox-multiple",
      options: [
        "Kamar pribadi",
        "Perpustakaan kampus",
        "Taman kampus",
        "Tempat ibadah",
        "Cafe",
        "Ruang musik/seni",
        "Lapangan olahraga",
        "Pantai, gunung, atau area wisata alam",
        "Ruang konseling kampus",
        "Rumah keluarga",
        "Kost"
      ],
      allowOther: true
    },
    {
      key: "tindakan_saat_krisis",
      label: "Tindakan Anda ketika pengalaman tersulit datang",
      type: "textarea"
    }
  ]
}
```

### Sesi 3: Restrukturisasi Kognitif
```typescript
{
  title: "Restrukturisasi Kognitif dan Coping Card",
  assignmentFields: [
    {
      key: "restrukturisasi_pikiran",
      label: "1. Restrukturisasi Pikiran",
      desc: "Tuliskan pikiran negatif → Evaluasi kebenarannya → Bukti alternatif pikiran sehat",
      type: "table-builder",
      columns: [
        { key: "pikiran_negatif", label: "Pikiran Negatif" },
        { key: "bukti_mendukung", label: "Bukti Mendukung" },
        { key: "bukti_menentang", label: "Bukti Menentang" },
        { key: "pikiran_alternatif", label: "Pikiran Alternatif yang Lebih Sehat" }
      ],
      validation: {
        minRows: 1
      }
    },
    {
      key: "coping_cards",
      label: "2. Template Coping Cards",
      desc: "Buatkan minimal 3 coping cards",
      type: "repeatable-card",
      cardLabel: "Kartu",
      validation: {
        minCards: 3,
        maxCards: 5
      },
      cardFields: [
        {
          key: "pesan_positif",
          label: "Pesan Positif",
          type: "textarea"
        },
        {
          key: "strategi_koping",
          label: "Strategi Koping",
          type: "textarea"
        },
        {
          key: "kontak_darurat",
          label: "Kontak Darurat",
          type: "textarea"
        },
        {
          key: "alasan_bertahan",
          label: "Alasan untuk Bertahan Hidup",
          type: "textarea"
        },
        {
          key: "motivasi",
          label: "Motivasi Bertahan Hidup",
          type: "textarea"
        }
      ]
    }
  ]
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure
1. Update `AssignmentField` interface with all types
2. Create `AssignmentFieldRenderer` component with type switching
3. Implement basic field renderers (textarea, boolean)

### Phase 2: Complex Fields
4. Implement `NestedTextareaField` component
5. Implement `CheckboxMultipleField` component
6. Implement `ContactListField` component
7. Implement `NumberedListField` component

### Phase 3: Advanced Fields
8. Implement `TableBuilderField` component
9. Implement `RepeatableCardField` component

### Phase 4: Integration
10. Update session configs with new field types
11. Update submission/history viewing to handle complex structures
12. Add validation logic
13. Testing & refinement

## Validation Rules

- Required field checking
- Min/max selection for checkboxes
- Min/max items for lists/tables
- Min/max cards for repeatable cards
- Character limits for textareas
- Format validation (future: email, phone)
