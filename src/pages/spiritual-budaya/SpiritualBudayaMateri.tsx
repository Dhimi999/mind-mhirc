import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";

const materiMap: Record<string, { title: string; description: string; sections: { heading: string; content: string }[] } > = {
  "prinsip-dasar": {
    title: "Prinsip Dasar Intervensi Spiritual & Budaya",
    description:
      "Fondasi teoretis dan praktis dalam mengintegrasikan spiritualitas dan budaya untuk kesehatan mental yang berkelanjutan.",
    sections: [
      {
        heading: "1. Kerangka Teoretis Integrasi",
        content:
          "Integrasi spiritualitas dan budaya memandang individu sebagai makhluk bio-psiko-sosio-spiritual. Pendekatan ini memanfaatkan makna, nilai, dan praktik lokal sebagai pengungkit perubahan, sehingga meningkatkan relevansi, keterlibatan, dan efektivitas intervensi lintas kondisi (transdiagnostik).",
      },
      {
        heading: "2. Nilai Inti & Etika Praktik",
        content:
          "Praktik harus non-judgmental, menghormati keragaman keyakinan, serta menjunjung otonomi dan informed consent. Terapis menjaga sensitivitas antarkultural, menghindari penyederhanaan berlebihan, serta memastikan intervensi tidak bertentangan dengan nilai klien maupun komunitasnya.",
      },
      {
        heading: "3. Asesmen Budaya-Spiritual",
        content:
          "Gunakan pertanyaan ala Cultural Formulation Interview (CFI) yang ringkas: nilai, praktik ibadah/ritual, dukungan komunitas, dan makna penderitaan bagi klien. Peta konteks dengan ecomap/sosiogram sederhana untuk melihat jejaring dukungan, peran keluarga, dan tokoh panutan setempat.",
      },
      {
        heading: "4. Formulasi Kasus Berbasis Makna",
        content:
          "Kembangkan formulasi 4P (predisposisi, pencetus, pemicu, pelestari) yang menyertakan dimensi makna dan spiritualitas. Identifikasi hambatan dan penguat budaya (misalnya stigma, gotong royong, doa bersama) agar strategi intervensi lebih tepat sasaran.",
      },
      {
        heading: "5. Tujuan Terapi & Indikator Hasil",
        content:
          "Rumuskan tujuan yang spesifik, terukur, dan bermakna budaya (misal: meningkatkan partisipasi pada kegiatan komunal/ibadah). Ukur kemajuan dengan indikator subjektif (rasa makna/harapan) dan objektif (kehadiran, kepatuhan latihan), dilengkapi skala singkat yang ramah budaya.",
      },
      {
        heading: "6. Teknik Inti Intervensi",
        content:
          "Gabungkan mindfulness kontekstual, doa reflektif, jurnal syukur, dan ritual aman (non-dogmatis) untuk regulasi emosi dan penguatan belas kasih diri. Manfaatkan narasi budaya (cerita rakyat/teladan leluhur) untuk restrukturisasi kognitif yang lebih natural bagi klien.",
      },
      {
        heading: "7. Kolaborasi Komunitas & Rujukan",
        content:
          "Libatkan jejaring dukungan: keluarga, kelompok ibadah, tokoh masyarakat, dan layanan kesehatan. Kolaborasi lintas peran memperkuat keberlanjutan intervensi, mengurangi rasa terisolasi, serta memfasilitasi akses rujukan profesional saat gejala memburuk.",
      },
      {
        heading: "8. Keamanan, Batasan, dan Evaluasi",
        content:
          "Tetapkan batasan profesional, hindari praktik yang berisiko atau memicu konflik keyakinan. Lakukan evaluasi berkala terhadap manfaat, beban, dan harm minimization; sesuaikan intervensi bila terjadi resistensi, distress meningkat, atau kebutuhan klien berubah.",
      },
    ],
  },
  "kearifan-lokal": {
    title: "Kearifan Lokal dalam Kesehatan Mental",
    description:
      "Eksplorasi tradisi dan praktik lokal Indonesia yang mendukung kesejahteraan psikologis dan sosial.",
    sections: [
      {
        heading: "1. Spektrum Kearifan Nusantara",
        content:
          "Kearifan lokal mencakup ritual syukuran, musyawarah, gotong royong, doa bersama, dan seni tradisi. Ragam praktik ini menjadi sumber pemaknaan, keterhubungan, dan regulasi emosi yang natural dalam keseharian.",
      },
      {
        heading: "2. Ritual sebagai Regulasi Emosi",
        content:
          "Ritual sederhana (mis. tasyakuran, selamatan, pengajian, kebaktian) memberi struktur, simbol, dan rasa aman. Elemen repetitif dan kebersamaan membantu menurunkan kecemasan serta memulihkan rasa kendali diri.",
      },
      {
        heading: "3. Gotong Royong & Prososial",
        content:
          "Aktivitas saling bantu (membersihkan lingkungan, bantu panen, kerja bakti) menumbuhkan rasa kompeten dan bermakna. Perilaku prososial terbukti menurunkan stres dan memperkuat dukungan sosial.",
      },
      {
        heading: "4. Seni Tradisi untuk Ekspresi Emosi",
        content:
          "Musik, tari, teater rakyat, dan kerajinan dapat menjadi kanal ekspresi emosi yang aman. Proses kreatif memfasilitasi katarsis, memperkuat identitas kultural, dan meningkatkan kebanggaan kolektif.",
      },
      {
        heading: "5. Coping Komunal Berbasis Spiritualitas",
        content:
          "Doa bersama, zikir/mantra, atau pertemuan rohani memperkuat harapan dan makna. Dukungan spiritual komunal mengurangi rasa kesepian dan memvalidasi pengalaman penderitaan tanpa menghakimi.",
      },
      {
        heading: "6. Ruang Komunal yang Menyembuhkan",
        content:
          "Balai desa, posyandu, arisan, dan majelis taklim menyediakan wadah aman untuk berbagi dan belajar. Fasilitasi percakapan empatik, aktivitas relaksasi, dan edukasi psiko-sosial ringkas di ruang-ruang ini.",
      },
      {
        heading: "7. Peran Tokoh Adat & Agama",
        content:
          "Tokoh panutan berpengaruh dalam mengurangi stigma dan mendorong perilaku sehat. Ajak kolaborasi dalam penyampaian pesan kesehatan mental yang selaras nilai dan bahasa setempat.",
      },
      {
        heading: "8. Kalender Budaya & Ritme Pemulihan",
        content:
          "Sinkronkan intervensi dengan kalender budaya (musim panen, hari besar keagamaan) agar keterlibatan optimal. Ritme komunitas membantu membentuk kebiasaan baru yang berkelanjutan.",
      },
      {
        heading: "9. Adaptasi Modern Tanpa Hilang Esensi",
        content:
          "Manfaatkan media digital untuk mengarsipkan cerita rakyat, musik tradisi, atau doa harian. Adaptasi harus menjaga makna inti dan menghindari komodifikasi atau apropriasi budaya.",
      },
      {
        heading: "10. Keamanan & Inklusivitas",
        content:
          "Pastikan praktik aman (hindari unsur yang berisiko fisik/psikologis) dan inklusif lintas keyakinan. Sediakan alternatif setara bagi individu dengan keterbatasan atau preferensi berbeda.",
      },
      {
        heading: "11. Evaluasi Dampak Berbasis Komunitas",
        content:
          "Gunakan indikator yang bermakna lokal: kehadiran, partisipasi, frekuensi interaksi prososial, dan rasa kebersyukuran. Padukan umpan balik kualitatif (cerita perubahan) dengan skala singkat yang mudah dipahami.",
      },
      {
        heading: "12. Panduan Implementasi Praktis",
        content:
          "Langkah ringkas: (a) pemetaan aset budaya-komunitas, (b) co-design aktivitas dengan warga, (c) uji coba kecil, (d) perbaikan berbasis masukan, (e) perluas jangkau sambil menjaga kualitas dan etika.",
      },
    ],
  },
  "regulasi-emosi-budaya": {
    title: "Teknik Regulasi Emosi Berbasis Budaya",
    description:
      "Cara-cara praktis menumbuhkan regulasi emosi yang selaras dengan nilai dan ekspresi budaya Indonesia.",
    sections: [
      {
        heading: "1. Konsep Inti Self-Compassion",
        content:
          "Self-compassion adalah kemampuan merespons diri dengan kebaikan saat menghadapi kesulitan. Fokusnya pada dukungan, bukan kritik; pada penerimaan realitas, bukan pasrah tanpa usaha. Ini memperkuat resiliensi, regulasi emosi, dan motivasi sehat.",
      },
      {
        heading: "2. Tiga Pilar: Kindness, Humanity, Mindfulness",
        content:
          "(a) Self-kindness: berbicara lembut pada diri, (b) Common humanity: mengingat bahwa penderitaan bersifat universal, (c) Mindfulness: menyadari emosi tanpa tenggelam di dalamnya. Ketiganya bekerja bersama untuk menurunkan reaktivitas.",
      },
      {
        heading: "3. Hambatan & Miskonsepsi Umum",
        content:
          "Self-compassion bukan memanjakan diri atau alasan untuk malas. Ini bukan menolak tanggung jawab. Justru, welas asih diri mengurangi rasa malu, memperbaiki fokus solusi, dan mendorong perubahan berkelanjutan.",
      },
      {
        heading: "4. Napas Welas Asih Berbasis Budaya",
        content:
          "Latihan 3–5 menit: tarik napas perlahan, ucapkan afirmasi lembut bernuansa budaya (mis. syukur, ketenangan), hembuskan sambil membayangkan menyalurkan kebaikan pada diri. Gunakan hitungan 4–4 atau 4–6 sesuai nyaman.",
      },
      {
        heading: "5. Doa/Mantra Reflektif Nusantara",
        content:
          "Pilih doa/mantra yang selaras keyakinan: kalimat syukur, permohonan ketabahan, atau zikir pendek. Ulangi pelan sambil menaruh tangan di dada untuk menstimulasi rasa aman dan koneksi.",
      },
      {
        heading: "6. Jurnal Syukur & Memaafkan Diri",
        content:
          "Catat 3 hal yang Anda syukuri dan satu pelajaran dari kekeliruan tanpa menghakimi. Akhiri dengan kalimat maafkan-diri yang realistis: ‘Saya belajar, saya bertumbuh.’ Lakukan 3–4 kali per minggu.",
      },
      {
        heading: "7. Dialog Batin Penuh Welas Asih",
        content:
          "Tuliskan dialog dua arah antara ‘Diri Pengkritik’ dan ‘Diri Penolong’. Validasi rasa sakit, lalu tawarkan alternatif kalimat yang lebih suportif dan akurat. Ini membantu restrukturisasi kognitif yang hangat.",
      },
      {
        heading: "8. Imajeri Tokoh Teladan Budaya",
        content:
          "Bayangkan sosok teladan (leluhur/tokoh budaya) yang menyampaikan kata-kata penguatan. Serap nilai kebijaksanaan dan kelembutan mereka sebagai referensi batin untuk menghadapi tantangan.",
      },
      {
        heading: "9. Micro‑moments 3 Menit",
        content:
          "Format singkat saat sibuk: (1) sadari emosi, (2) letakkan tangan di dada, (3) ucapkan tiga kalimat: ‘Ini momen sulit’, ‘Saya tidak sendiri’, ‘Semoga saya kuat dan lembut pada diri’. Ulangi 1–2 kali/hari.",
      },
      {
        heading: "10. Mindfulness dalam Aktivitas Harian",
        content:
          "Sisipkan kesadaran penuh saat memasak, menyeduh teh/kopi, atau berkebun. Rasakan tekstur, aroma, dan gerakan. Bila pikiran mengembara, kembali ke indra dengan lembut—tanpa menghakimi.",
      },
      {
        heading: "11. Menavigasi Emosi Sulit",
        content:
          "Untuk marah, malu, atau cemas: beri nama emosi, validasi, lalu tanyakan ‘Apa yang saya butuhkan sekarang?’. Pilih respons kecil yang menolong (istirahat, minum air, menghubungi teman aman).",
      },
      {
        heading: "12. Batasan Sehat & Welas Asih",
        content:
          "Welas asih bukan permisif. Tetapkan batasan pada perilaku yang merugikan diri/orang lain. Komunikasikan dengan tegas dan hangat. Batasan melindungi energi dan membangun rasa hormat.",
      },
      {
        heading: "13. Rencana Kebiasaan 4M",
        content:
          "Mudah (durasi singkat), Menarik (selaras nilai), Manfaat (terasa dampaknya), Menular (dukungan komunitas/teman latihan). Jadwalkan anchor time: pagi/sore agar konsisten.",
      },
      {
        heading: "14. Monitoring & Penyesuaian",
        content:
          "Nilai 0–10 untuk stres, kehangatan pada diri, dan vitalitas tiap minggu. Jika stagnan, kecilkan target; jika meningkat, tambah variasi latihan. Catat hambatan dan cara mengatasinya.",
      },
      {
        heading: "15. Integrasi ke Komunitas & Intervensi Lain",
        content:
          "Bagikan praktik aman dalam kelompok pendukung/rohani. Padukan dengan intervensi lain (CBT, mindfulness, aktivitas bermakna). Rujuk profesional bila gejala berat/persisten.",
      },
    ],
  },
  "komunitas-dukungan": {
    title: "Komunitas dan Dukungan Sosial",
    description:
      "Memanfaatkan kekuatan kolektif komunitas sebagai sistem dukungan emosional dan spiritual yang bermakna.",
    sections: [
      {
        heading: "1. Mengapa Komunitas Penting",
        content:
          "Interaksi prososial menurunkan stres, meningkatkan rasa aman, dan mempercepat pemulihan. Dukungan spiritual memperkaya makna, menumbuhkan harapan, serta memperkuat ketahanan menghadapi krisis.",
      },
      {
        heading: "2. Pemetaan Jaringan Dukungan",
        content:
          "Buat peta ‘inner circle’ (keluarga/teman dekat) dan ‘outer circle’ (tetangga, komunitas, kelompok ibadah). Tandai siapa yang aman diajak bicara, kapan dihubungi, serta medium komunikasi yang nyaman.",
      },
      {
        heading: "3. Keamanan Psikologis (Psychological Safety)",
        content:
          "Bangun norma: saling menghargai, kerahasiaan, tanpa menghakimi, dan hak untuk berkata ‘tidak nyaman’. Lingkungan aman mendorong keterbukaan dan mengurangi rasa malu.",
      },
      {
        heading: "4. Komunikasi Empatik & NVC Ringkas",
        content:
          "Gunakan langkah sederhana: amati tanpa menyalahkan, sebut perasaan, jelaskan kebutuhan, dan ajukan permintaan spesifik. Hindari nasihat prematur; dahulukan mendengar aktif dan validasi.",
      },
      {
        heading: "5. Peer Support & Check‑in Berkelompok",
        content:
          "Struktur 30–45 menit: pembukaan tenang, check‑in singkat (1–2 menit/orang), satu topik refleksi, ringkas insight, dan penutup syukur/doa sesuai keyakinan. Jaga giliran bicara dan waktu.",
      },
      {
        heading: "6. Protokol Eskalasi & Rujukan",
        content:
          "Kenali tanda bahaya (niat bunuh diri, kekerasan, gejala berat). Siapkan daftar kontak darurat, layanan profesional, dan rumah sakit. Sampaikan rujukan dengan hangat dan jelas.",
      },
      {
        heading: "7. Strategi Anti‑Stigma Komunitas",
        content:
          "Pakai narasi harapan, testimoni pemulihan, dan edukasi ringan. Fokus pada bahasa yang manusiawi, hindari label negatif. Libatkan tokoh setempat untuk meningkatkan penerimaan.",
      },
      {
        heading: "8. Komunitas Digital & Moderasi Aman",
        content:
          "Jika memakai grup daring, tetapkan aturan: kerahasiaan, ramah, tanpa promosi berbahaya. Moderator memfasilitasi diskusi, menyaring konten pemicu, dan mengarahkan ke sumber tepercaya.",
      },
      {
        heading: "9. Keberlanjutan: Peran, Ritme, Dokumentasi",
        content:
          "Tentukan peran (fasilitator, pencatat, penjaga waktu), tetapkan ritme pertemuan, dan dokumentasikan insight serta kebutuhan tindak lanjut. Rotasi peran untuk mencegah kelelahan.",
      },
      {
        heading: "10. Mengukur Dampak Sosial‑Emosional",
        content:
          "Pantau metrik sederhana: kehadiran, keterlibatan, rasa terhubung, dan tingkat harapan (skala 0–10). Gabungkan dengan cerita perubahan (most significant change) dari anggota.",
      },
    ],
  },
};

const SpiritualBudayaMateri: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // Legacy alias mapping to keep old links working
  const aliasMap: Record<string, string> = {
    "self-compassion-budaya": "regulasi-emosi-budaya",
  };
  const resolvedSlug = slug ? aliasMap[slug] || slug : undefined;
  const materi = resolvedSlug ? materiMap[resolvedSlug] : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{materi ? `${materi.title} | Materi Spiritual & Budaya` : "Materi Tidak Ditemukan"} | Mind MHIRC</title>
        <meta
          name="description"
          content={
            materi?.description ||
            "Materi psikoedukasi dan intervensi berbasis spiritual dan budaya untuk kesehatan mental."
          }
        />
        <link rel="canonical" href={`https://mind-mhirc.my.id/spiritual-budaya/materi/${resolvedSlug || ""}`} />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-navbar">
        <section className="relative bg-gradient-to-b from-muted/50 to-background overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Spiritual & Budaya Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya" className="text-amber-700 hover:underline text-sm">← Kembali ke Jelajah</Link>
                <Badge className="bg-amber-100 text-amber-800" variant="secondary">Materi</Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                {materi?.title || "Materi tidak ditemukan"}
              </h1>
              {materi && (
                <p className="text-muted-foreground text-lg mb-8">{materi.description}</p>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            {!materi ? (
              <Card>
                <CardHeader>
                  <CardTitle>Materi tidak ditemukan</CardTitle>
                  <CardDescription>
                    Slug yang Anda akses tidak tersedia. Silakan kembali ke halaman Spiritual & Budaya.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/spiritual-budaya">
                    <Button variant="default" className="bg-amber-600 hover:bg-amber-700">Kembali</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              materi.sections.map((sec, i) => (
                <Card key={i} className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">{sec.heading}</CardTitle>
                    <CardDescription>{sec.content}</CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SpiritualBudayaMateri;
