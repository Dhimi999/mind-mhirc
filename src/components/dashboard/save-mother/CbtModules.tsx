interface CbtTask {
  id: string;
  prompt: string;
}
// ASUMSI: masterModules diimpor dari file CBT.tsx
interface CbtModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  tasks: CbtTask[];
  status: "available" | "locked" | "completed";
  progress: number;
  objectives: string[];
  type: "cbt" | "zoom";
  zoomLink?: string;
}
// ... (Interface ReviewModule dan lain-lain sama)
const masterModules: Omit<CbtModule, "status" | "progress">[] = [
  // 1. Sesi CBT 1
  {
    id: 1,
    title: "Sesi 1: Journey to Recovery",
    description:
      "Mengenali irama hidup Anda, membangun langkah-langkah kecil untuk pemulihan, dan menjaga rutinitas serta dukungan sosial.",
    duration: "45 menit",
    tasks: [
      {
        id: "1-1",
        prompt:
          "Tuliskan pengalaman Anda tentang hari baik dan hari buruk yang pernah dilalui."
      },
      {
        id: "1-2",
        prompt:
          "Tuliskan bagaimana kecemasan atau depresi memengaruhi hidup Anda dan bagian mana yang paling terasa."
      },
      {
        id: "1-3",
        prompt:
          "Tuliskan satu masalah besar lalu pecah menjadi langkah kecil yang bisa Anda mulai segera."
      },
      {
        id: "1-4",
        prompt:
          "Tuliskan siapa saja orang yang menjadi pendukung Anda dan bagaimana Anda akan menjaga komunikasi dengan mereka."
      }
    ],
    objectives: [
      "Mengenali pengalaman hari baik dan buruk",
      "Memahami bagaimana kecemasan/depresi memengaruhi hidup",
      "Memecah masalah besar menjadi langkah-langkah kecil",
      "Mengidentifikasi sistem pendukung Anda"
    ],
    type: "cbt"
  },
  // 2. Sesi CBT 2
  {
    id: 2,
    title: "Sesi 2: Kenali Jejak Perasaan",
    description:
      "Mempelajari bagaimana suasana hati memengaruhi tindakan, mengenali pola emosi, dan menetapkan tujuan pemulihan yang jelas.",
    duration: "50 menit",
    tasks: [
      {
        id: "2-1",
        prompt:
          "Tuliskan bagaimana suasana hati buruk, kecemasan, atau depresi memengaruhi kehidupan Anda (Contoh: sulit bekerja, mengurus rumah, dll)."
      },
      {
        id: "2-2",
        prompt:
          "Tuliskan situasi yang paling sering membuat suasana hati Anda memburuk (Kapan, di mana, dengan siapa?)."
      },
      {
        id: "2-3",
        prompt:
          "Jelaskan satu pengalaman sulit menggunakan kerangka: Perasaan & Gejala Fisik, Perilaku, dan Pikiran."
      },
      {
        id: "2-4",
        prompt:
          "Tuliskan 1-3 tujuan sederhana yang ingin Anda capai terkait gejala, perilaku, dan pikiran negatif Anda."
      }
    ],
    objectives: [
      "Memetakan dampak suasana hati pada aktivitas harian",
      "Mengidentifikasi situasi yang memicu emosi negatif",
      "Menganalisis hubungan antara perasaan, perilaku, dan pikiran",
      "Menetapkan tujuan pemulihan yang spesifik dan positif"
    ],
    type: "cbt"
  },
  // 3. Sesi Virtual 1 (Setelah 2 Modul CBT)
  {
    id: 3,
    title: "Sesi Zoom 1: Early-Program Check-in",
    description:
      "Setelah dua sesi pertama, gunakan kesempatan ini untuk mendiskusikan pemahaman dan tantangan awal Anda dengan mentor. Ini adalah sesi konsultasi pribadi pertama Anda.",
    duration: "60 menit",
    tasks: [],
    objectives: [
      "Mendapatkan panduan awal personal",
      "Mengatasi hambatan di Sesi 1 & 2",
      "Mengatur strategi belajar"
    ],
    type: "zoom",
    zoomLink: "https://zoom.us/j/1112223334?pwd=SAFE-MOTHER-EARLY" // Link Placeholder
  },
  // 4. Sesi CBT 3 (ID 3 yang lama)
  {
    id: 4,
    title: "Sesi 3: Reset dan Aktifkan",
    description:
      "Fokus pada strategi dasar untuk menenangkan tubuh (tidur, makan, relaksasi) dan mengaktifkan kembali rutinitas harian.",
    duration: "55 menit",
    tasks: [
      {
        id: "4-1", // ID diubah dari 3-1
        prompt:
          "Isi mood check-in harian Anda dan berikan skala 0-10 untuk suasana hati Anda hari ini."
      },
      {
        id: "4-2", // ID diubah dari 3-2
        prompt:
          "Tuliskan 1 kebiasaan terkait tidur yang ingin Anda ubah minggu ini (Contoh: tidak melihat layar 1 jam sebelum tidur)."
      },
      {
        id: "4-3", // ID diubah dari 3-3
        prompt:
          "Tuliskan 2 opsi makanan cepat-sehat yang realistis untuk Anda siapkan."
      },
      {
        id: "4-4", // ID diubah dari 3-4
        prompt:
          "Jadwalkan 1 aktivitas rutin, 1 menyenangkan, dan 1 penting untuk besok (sertakan kapan & di mana)."
      }
    ],
    objectives: [
      "Melakukan mood check-in harian",
      "Menerapkan praktik kebersihan tidur (sleep hygiene)",
      "Menggunakan teknik relaksasi pernapasan",
      "Menjadwalkan aktivitas rutin, menyenangkan, dan penting"
    ],
    type: "cbt"
  },
  // 5. Sesi CBT 4 (ID 5 yang lama)
  {
    id: 5,
    title: "Sesi 4: Pikiran VS Khawatir dan Dukungan",
    description:
      "Melatih cara mengenali pikiran negatif, mengelola kekhawatiran dengan teknik 'worry time', dan memperkuat dukungan sosial.",
    duration: "60 menit",
    tasks: [
      {
        id: "5-1", // ID diubah dari 5-1
        prompt:
          "Tuliskan 1 pikiran otomatis yang sering muncul dan 2 bukti yang menentangnya."
      },
      {
        id: "5-2", // ID diubah dari 5-2
        prompt:
          "Bedakan antara masalah nyata dan kekhawatiran hipotesis menggunakan Pohon Khawatir."
      },
      {
        id: "5-3", // ID diubah dari 5-3
        prompt:
          "Tentukan jadwal 'Waktu Khawatir' Anda setiap hari (Contoh: Pukul 17:00 selama 20 menit)."
      },
      {
        id: "5-4", // ID diubah dari 5-4
        prompt:
          "Tuliskan nama pendamping utama Anda dan 2 bentuk bantuan nyata yang Anda butuhkan darinya minggu ini."
      }
    ],
    objectives: [
      "Menangkap dan menguji pikiran otomatis yang tidak membantu",
      "Membuat pikiran alternatif yang lebih realistis",
      "Menggunakan teknik 'Pohon Khawatir' dan 'Waktu Khawatir'",
      "Membuat kontrak dukungan dengan pasangan atau keluarga"
    ],
    type: "cbt"
  },
  // 6. Sesi Virtual 2 (Setelah 2 Modul CBT lagi)
  {
    id: 6,
    title: "Sesi Zoom 2: Mid-Program Review",
    description:
      "Anda telah menyelesaikan sebagian besar modul inti. Sesi ini fokus pada evaluasi teknik CBT yang sudah dipraktikkan dan penyelesaian hambatan psikologis sebelum sesi terakhir.",
    duration: "60 menit",
    tasks: [],
    objectives: [
      "Mendapatkan umpan balik personal",
      "Mengevaluasi strategi CBT",
      "Menetapkan tujuan paruh kedua"
    ],
    type: "zoom",
    zoomLink: "https://zoom.us/j/4445556667?pwd=SAFE-MOTHER-MID" // Link Placeholder
  },
  // 7. Sesi CBT 5 (ID 6 yang lama)
  {
    id: 7,
    title: "Sesi 5: Tetap Pulih, Tetap Kuat",
    description:
      "Fokus untuk mempertahankan hasil pemulihan, menjaga kebugaran, dan menyiapkan rencana pencegahan jika gejala muncul kembali.",
    duration: "50 menit",
    tasks: [
      {
        id: "7-1", // ID diubah dari 6-1
        prompt:
          "Tuliskan kegiatan sehat yang sudah berhasil Anda lakukan dan tandai mana yang ingin dipertahankan."
      },
      {
        id: "7-2", // ID diubah dari 6-2
        prompt:
          "Tuliskan tanda-tanda pribadi ketika mood Anda mulai turun (Contoh: sulit tidur, malas beraktivitas)."
      },
      {
        id: "7-3", // ID diubah dari 6-3
        prompt:
          "Buat rencana darurat pribadi 'Jika... maka...' (Contoh: Jika saya merasa cemas, maka saya akan melakukan latihan napas)."
      },
      {
        id: "7-4", // ID diubah dari 6-4
        prompt:
          "Tuliskan 1 orang pendamping utama dan simpan sebagai 'Kontak Darurat' Anda."
      }
    ],
    objectives: [
      "Merefleksikan dan mempertahankan gaya hidup sehat",
      "Mengidentifikasi tanda-tanda awal mood menurun",
      "Membuat rencana darurat pribadi (Jika... maka...)",
      "Memanfaatkan sumber dukungan sebagai kontak darurat"
    ],
    type: "cbt"
  },
  // 8. Sesi Virtual 3 (Setelah Modul CBT terakhir)
  {
    id: 8,
    title: "Sesi Zoom 3: Final Program & Aftercare",
    description:
      "Program CBT selesai! Sesi akhir ini fokus pada refleksi, konsolidasi pembelajaran, pembuatan rencana pencegahan *relapse*, dan diskusi langkah selanjutnya untuk menjaga kesehatan mental Anda.",
    duration: "60 menit",
    tasks: [],
    objectives: [
      "Membuat rencana pencegahan relapse",
      "Mendapatkan sertifikat",
      "Diskusi tindak lanjut"
    ],
    type: "zoom",
    zoomLink: "https://zoom.us/j/9998887776?pwd=SAFE-MOTHER-FINAL" // Link Placeholder
  }
];
export default masterModules;
