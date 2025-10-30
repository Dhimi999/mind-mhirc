
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useSpiritualPsikoedukasiSession } from "@/hooks/useSpiritualPsikoedukasiSession";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";

// Konfigurasi tiap sesi: field assignment, label, deskripsi, dan default value
const sessionConfigs = [
  {
    title: "Pengenalan Tentang Bunuh Diri dan Risiko Terkait Bagi Mahasiswa",
    assignmentFields: [
      { key: "pengertian", label: "Pengertian", desc: "Jelaskan pengertian bunuh diri menurut Anda." },
      { key: "risiko", label: "Risiko", desc: "Sebutkan faktor risiko yang Anda ketahui." },
      { key: "protektif", label: "Faktor Protektif", desc: "Apa saja faktor protektif yang dapat mencegah bunuh diri?" },
      { key: "bantuan", label: "Bantuan", desc: "Kemana Anda akan mencari bantuan jika mengalami krisis?" },
      { key: "hasil", label: "Hasil", desc: "Apa hasil refleksi Anda setelah mempelajari materi ini?" },
      { key: "refleksi", label: "Refleksi", desc: "Tuliskan refleksi pribadi Anda." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian terkait topik ini." },
    ],
    defaultAssignment: { pengertian: "", risiko: "", protektif: "", bantuan: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Gunakan jurnal harian untuk merefleksikan perasaan dan pemikiran Anda setiap hari."],
    guideDesc: "Buku Kerja (Workbook) ini dirancang untuk membantu Anda yang sedang menjalani Psikoedukasi Pencegahan Bunuh Diri Bagi Mahasiswa. Pengenalan tentang risiko bunuh diri dan risiko terkait adalah melibatkan penyediaan informasi kepada mahasiswa tentang konsep bunuh diri, faktor risiko, dan tanda-tanda peringatan. Dengan melakukan analisis ini, Anda dapat lebih memahami apa itu bunuh diri dan risiko terjadinya bunuh diri.",
  },
  {
    title: "Mengenali Tanda-Tanda Dini Risiko Bunuh Diri Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Ceritakan situasi pemicu yang Anda alami atau amati." },
      { key: "tanda", label: "Tanda", desc: "Tuliskan tanda-tanda dini yang Anda kenali." },
      { key: "tindakan", label: "Tindakan", desc: "Apa tindakan preventif/support yang dilakukan?" },
      { key: "hasil", label: "Hasil", desc: "Bagaimana hasil dari tindakan tersebut?" },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi pribadi Anda setelah sesi ini." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian terkait perkembangan emosi & pikiran." },
    ],
    defaultAssignment: { situasi: "", tanda: "", tindakan: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Perhatikan perubahan perilaku pada diri sendiri dan orang sekitar.", "Catat setiap tanda-tanda dini yang muncul untuk refleksi."],
    guideDesc: "Mengenali tanda-tanda dan risiko bunuh diri adalah sesi yang mengajarkan mahasiswa untuk mengenali tanda-tanda awal dari ideasi bunuh diri, baik pada diri mereka sendiri maupun orang lain. Ini termasuk perubahan perilaku drastis seperti menarik diri dari pergaulan, peningkatan penggunaan zat terlarang, serta ekspresi verbal tentang keputusasaan. Dengan melakukan analisis ini, Anda dapat mengubah cara pandang menjadi lebih positif lagi.",
  },
  {
    title: "Pengembangan Keterampilan Koping Adaptif Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Identifikasi situasi pemicu stres yang Anda alami." },
      { key: "kopingMaladaptif", label: "Koping Maladaptif", desc: "Tuliskan koping maladaptif (menghindar, menarik diri, dll) yang selama ini Anda lakukan." },
      { key: "perencanaanAktivitas", label: "Perencanaan Aktivitas", desc: "Rencanakan aktivitas adaptif terstruktur yang bisa Anda lakukan." },
      { key: "tindakan", label: "Tindakan", desc: "Tindakan konkret yang sudah/akan Anda lakukan." },
      { key: "hasil", label: "Hasil", desc: "Evaluasi hasil dari tindakan tersebut." },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi pribadi Anda." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian untuk konsistensi." },
    ],
    defaultAssignment: { situasi: "", kopingMaladaptif: "", perencanaanAktivitas: "", tindakan: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Koping adaptif membutuhkan latihan konsisten.", "Identifikasi dan ganti koping maladaptif secara bertahap."],
    guideDesc: "Pengembangan keterampilan koping adaptif adalah proses dimana individu dilatih menggunakan strategi sehat menghadapi stres & situasi sulit. Tujuannya mengganti koping maladaptif (menghindar, menarik diri, penggunaan zat) menjadi pola adaptif (problem solving, regulasi emosi, aktivitas bermakna).",
  },
  {
    title: "Perilaku Mencari Bantuan Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Identifikasi situasi pemicu kebutuhan bantuan." },
      { key: "perilakuMencariBantuan", label: "Perilaku Mencari Bantuan", desc: "Definisikan perilaku mencari bantuan adaptif yang bisa Anda lakukan." },
      { key: "tindakan", label: "Tindakan", desc: "Jabarkan langkah tindakan konkret." },
      { key: "hasil", label: "Hasil", desc: "Evaluasi hasil & hambatan yang dialami." },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi motivasi & rencana tindak lanjut." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian terkait proses mencari bantuan." },
    ],
    defaultAssignment: { situasi: "", perilakuMencariBantuan: "", tindakan: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Normal untuk merasa ragu mencari bantuan.", "Latihan ini membantu membangun keberanian & struktur langkah."],
    guideDesc: "Perilaku mencari bantuan mendorong mahasiswa aktif mengakses dukungan ketika kewalahan: konseling kampus, teman sebaya suportif, hotline krisis, atau layanan profesional. Kesadaran dan kesiapan mencari bantuan menurunkan risiko eskalasi masalah.",
  },
  {
    title: "Pengurangan Stigma Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Identifikasi situasi dimana stigma muncul." },
      { key: "dampakStigma", label: "Dampak Stigma", desc: "Tuliskan dampak stigma pada pikiran, emosi, dan perilaku Anda." },
      { key: "upayaMengurangiStigma", label: "Upaya Mengurangi Stigma", desc: "Tuliskan 2-3 langkah konkret untuk mengurangi stigma di lingkungan Anda." },
      { key: "hasil", label: "Hasil", desc: "Evaluasi hasil upaya yang dilakukan." },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi pribadi Anda." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian terkait perubahan persepsi." },
    ],
    defaultAssignment: { situasi: "", dampakStigma: "", upayaMengurangiStigma: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Gunakan bahasa inklusif dan empatik.", "Ini langkah sederhana namun efektif untuk menurunkan stigma."],
    guideDesc: "Pengurangan stigma berfokus pada menurunkan stigma terkait kesehatan mental dan bunuh diri melalui diskusi dan edukasi. Tujuannya mendorong keterbukaan, empati, dan keberanian untuk mencari bantuan.",
  },
  {
    title: "Penguatan Jaringan Dukungan Sosial Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Identifikasi situasi Anda yang membutuhkan dukungan." },
      { key: "macamDukunganSosial", label: "Macam Dukungan Sosial", desc: "Pilah macam dukungan: emosional, informasional, instrumental, dan penilaian." },
      { key: "sumberDukunganSosial", label: "Sumber Dukungan Sosial", desc: "Daftar sumber dukungan nyata yang bisa segera dihubungi." },
      { key: "hasil", label: "Hasil", desc: "Evaluasi hasil dari dukungan yang diterima." },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi pribadi Anda." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian terkait jaringan dukungan." },
    ],
    defaultAssignment: { situasi: "", macamDukunganSosial: "", sumberDukunganSosial: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Dukungan efektif seringkali spesifik.", "Sesuaikan jenis dukungan dengan kebutuhan."],
    guideDesc: "Sesi ini berfokus pada cara membangun dan memelihara jaringan dukungan sosial yang sehat untuk meningkatkan ketahanan dan mengurangi risiko isolasi.",
  },
  {
    title: "Penyediaan Informasi tentang Sumber Daya Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Identifikasi kebutuhan dan situasi yang memerlukan informasi sumber daya." },
      { key: "penyediaanInformasiSumberDaya", label: "Penyediaan Informasi Sumber Daya", desc: "Susun daftar kontak penting: nomor darurat, layanan kampus, organisasi komunitas, dan tautan tepercaya." },
      { key: "hasil", label: "Hasil", desc: "Evaluasi hasil penggunaan informasi: apakah akses terbantu dan apa tindak lanjutnya." },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi pribadi Anda." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian terkait akses sumber daya." },
    ],
    defaultAssignment: { situasi: "", penyediaanInformasiSumberDaya: "", hasil: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Simpan informasi penting di tempat yang mudah ditemukan saat darurat."],
    guideDesc: "Sesi ini membantu menyiapkan informasi yang jelas tentang sumber daya yang tersedia (kontak darurat, layanan kesehatan mental kampus, organisasi komunitas), sehingga keputusan ketika membutuhkan bantuan menjadi lebih cepat dan tepat.",
  },
  {
    title: "Evaluasi dan Tindak Lanjut Bagi Mahasiswa",
    assignmentFields: [
      { key: "situasi", label: "Situasi", desc: "Identifikasi situasi atau konteks keseluruhan program." },
      { key: "faktorRisikoBunuhDiri", label: "Faktor Risiko Bunuh Diri", desc: "Tuliskan pemahaman Anda tentang faktor risiko bunuh diri." },
      { key: "faktorProtektifRisikoBunuhDiri", label: "Faktor Protektif Risiko Bunuh Diri", desc: "Tuliskan pemahaman Anda tentang faktor protektif." },
      { key: "tandaRisikoBunuhDiri", label: "Tanda Risiko Bunuh Diri", desc: "Tuliskan tanda-tanda risiko yang Anda kenali." },
      { key: "sumberDukunganSosial", label: "Sumber Dukungan Sosial", desc: "Daftar sumber dukungan yang telah Anda bangun." },
      { key: "caraMengurangiStigmaNegatif", label: "Cara Mengurangi Stigma Negatif", desc: "Tuliskan cara mengurangi stigma yang telah Anda pelajari." },
      { key: "refleksiPerubahan", label: "Refleksi Perubahan", desc: "Refleksikan perubahan yang Anda rasakan setelah mengikuti program." },
      { key: "tantangan", label: "Tantangan", desc: "Tuliskan tantangan yang Anda hadapi selama program." },
      { key: "rencanaTindakLanjut", label: "Rencana Tindak Lanjut", desc: "Susun rencana tindak lanjut untuk menjaga keberlanjutan pembelajaran." },
      { key: "refleksi", label: "Refleksi", desc: "Refleksi akhir Anda." },
      { key: "jurnal", label: "Jurnal", desc: "Catatan harian akhir program." },
    ],
    defaultAssignment: { situasi: "", faktorRisikoBunuhDiri: "", faktorProtektifRisikoBunuhDiri: "", tandaRisikoBunuhDiri: "", sumberDukunganSosial: "", caraMengurangiStigmaNegatif: "", refleksiPerubahan: "", tantangan: "", rencanaTindakLanjut: "", refleksi: "", jurnal: "", submitted: false },
    tips: ["Evaluasi menyeluruh membantu konsolidasi pembelajaran.", "Rencana tindak lanjut penting untuk keberlanjutan."],
    guideDesc: "Sesi evaluasi dan tindak lanjut adalah kesempatan untuk meninjau seluruh pembelajaran, mengidentifikasi perubahan, tantangan, dan menyusun rencana konkret untuk menjaga keberlanjutan perubahan positif setelah program berakhir.",
  },
];


const SpiritualPsikoedukasiUnified: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const sessionNumber = Number(sesi);
  const config = sessionConfigs[sessionNumber - 1];
  const { user } = useAuth();
  const {
    progress,
    meetingSchedule: schedule,
    markMeetingDone,
    markGuideDone,
    submitAssignment: submitAssignmentRemote,
    loadAssignment,
    autoSaveAssignment,
    groupAssignment,
    isSuperAdmin,
    allGroupSchedules,
    loading,
  } = useSpiritualPsikoedukasiSession(sessionNumber, user?.id);
  const [assignment, setAssignment] = useState<any>(config?.defaultAssignment || {});
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const remote = await loadAssignment();
      if (remote && typeof remote === "object") {
        setAssignment((prev: any) => {
          // Merge with default config to ensure all fields exist
          const merged = { ...config.defaultAssignment };
          // Parse remote data if it's stringified
          Object.keys(remote).forEach(key => {
            let value = remote[key];
            // If value is a stringified object/array, parse it
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
              try {
                value = JSON.parse(value);
              } catch {
                // Keep as string if parse fails
              }
            }
            merged[key] = value;
          });
          return merged;
        });
      }
    })();
  }, [loadAssignment, config.defaultAssignment]);

  useEffect(() => {
    if ((progress as any)?.assignmentDone) return;
    const h = setTimeout(() => {
      autoSaveAssignment(assignment);
      setAutoSavedAt(new Date().toLocaleTimeString());
    }, 700);
    return () => clearTimeout(h);
  }, [assignment, progress, autoSaveAssignment]);

  const assignmentValid = useMemo(() => {
    return config?.assignmentFields.every((f: any) => assignment[f.key]?.trim());
  }, [assignment, config]);

  const handleSubmitAssignment = useCallback(async () => {
    if (!assignmentValid || (progress as any)?.assignmentDone) return;
    setIsSubmitting(true);
    const ok = await submitAssignmentRemote(assignment);
    if (ok) setAssignment((p: any) => ({ ...p, submitted: true }));
    setIsSubmitting(false);
  }, [assignmentValid, progress, assignment, submitAssignmentRemote]);

  // Progress calculation
  const overallPercent = useMemo(() => {
    const p = progress as any;
    const steps = [p?.sessionOpened, p?.meetingDone, p?.guideDone, !!p?.assignmentDone, !!p?.counselorResponse];
    return steps.filter(Boolean).length * 20;
  }, [progress]);

  if (!config) return <div>Sesi tidak ditemukan</div>;

  const p = progress as any;
  const hasPrev = sessionNumber > 1;
  const hasNext = sessionNumber < 8;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`Sesi ${sessionNumber} - ${config.title} | Psikoedukasi Spiritual & Budaya`}</title>
        <meta name="description" content={`Portal psikoedukasi sesi ${sessionNumber}: ${config.title}`} />
      </Helmet>
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800" />
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Psikoedukasi" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya/psikoedukasi" className="text-white/90 hover:underline text-sm">← Kembali</Link>
                <Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Sesi</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">Sesi {sessionNumber}: {config.title}</h1>
              <p className="text-amber-100 max-w-2xl">{config.assignmentFields.map(f=>f.label).join(', ')}.</p>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column: Tips above Sticky Progress */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed">
                  <p className="font-semibold mb-2 text-amber-800">💡 Tips Pengerjaan</p>
                  {config.tips.map((tip, i) => <p key={i} className="mb-1 text-gray-700">{tip}</p>)}
                </div>
                <div className="rounded-lg bg-white border border-gray-200 p-5 sticky top-28">
                  <h3 className="font-semibold mb-4 text-sm tracking-wide text-gray-800 uppercase">Progres Sesi</h3>
                  <div className="mb-4">
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${overallPercent}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-gray-700 font-medium">{overallPercent}% selesai</div>
                  </div>
                  <ol className="space-y-3 text-xs">
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.sessionOpened ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
                      <span className={p?.sessionOpened ? 'font-medium text-gray-900' : 'text-gray-600'}>Sesi Dibuka</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.meetingDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
                      <span className={p?.meetingDone ? 'font-medium text-gray-900' : 'text-gray-600'}>Pertemuan Selesai</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.guideDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
                      <span className={p?.guideDone ? 'font-medium text-gray-900' : 'text-gray-600'}>Materi/Panduan Selesai</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.assignmentDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>4</span>
                      <span className={p?.assignmentDone ? 'font-medium text-gray-900' : 'text-gray-600'}>Penugasan Selesai</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.counselorResponse ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>5</span>
                      <span className={p?.counselorResponse ? 'font-medium text-gray-900' : 'text-gray-600'}>Respons Konselor</span>
                    </li>
                  </ol>
                </div>
              </div>
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Card Panduan Sesi */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-amber-600 text-white border-b border-amber-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📖</span>
                      <div>
                        <h3 className="text-lg font-semibold">Panduan Sesi</h3>
                        <p className="text-xs text-amber-100 mt-0.5">Materi dan panduan untuk sesi ini</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 text-gray-700 text-sm leading-relaxed">
                    {config.guideDesc}
                  </div>
                </Card>

                {/* Card Informasi Pertemuan */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-blue-600 text-white border-b border-blue-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h3 className="text-lg font-semibold">Informasi Pertemuan Daring</h3>
                        <p className="text-xs text-blue-100 mt-0.5">Jadwal pertemuan online intervensi Spiritual & Budaya</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {isSuperAdmin ? (
                      <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-semibold text-blue-800">👤 Super Admin</p>
                          <p className="text-xs text-blue-700 mt-1">Menampilkan jadwal semua grup</p>
                        </div>
                        {allGroupSchedules && Object.keys(allGroupSchedules).length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(['A', 'B', 'C'] as const).map((groupKey) => {
                                const groupData = allGroupSchedules[groupKey];
                                if (!groupData) return null;
                                return (
                                  <div key={groupKey} className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-center mb-3">
                                      <span className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow">
                                        Grup {groupKey}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {groupData.date && (
                                        <div className="flex items-start gap-2">
                                          <span className="text-blue-600 font-semibold text-xs mt-0.5">📅</span>
                                          <div className="flex-1">
                                            <p className="text-xs text-gray-500 font-medium">Tanggal</p>
                                            <p className="text-sm font-semibold text-gray-900">{groupData.date}</p>
                                          </div>
                                        </div>
                                      )}
                                      {groupData.time && (
                                        <div className="flex items-start gap-2">
                                          <span className="text-blue-600 font-semibold text-xs mt-0.5">🕐</span>
                                          <div className="flex-1">
                                            <p className="text-xs text-gray-500 font-medium">Waktu</p>
                                            <p className="text-sm font-semibold text-gray-900">{groupData.time}</p>
                                          </div>
                                        </div>
                                      )}
                                      {groupData.link && (
                                        <div className="mt-3 pt-3 border-t border-blue-100">
                                          <a 
                                            href={groupData.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="block w-full text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                          >
                                            🔗 Buka Link Pertemuan
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {!p?.meetingDone && (
                              <div className="mt-4 pt-4 border-t border-blue-200">
                                <Button 
                                  onClick={markMeetingDone} 
                                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
                                >
                                  ✅ Tandai Pertemuan Selesai
                                </Button>
                              </div>
                            )}
                            {p?.meetingDone && (
                              <div className="mt-4 pt-4 border-t border-blue-200">
                                <div className="flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-50 rounded-lg py-3 border-2 border-green-600">
                                  <span className="text-lg">✓</span>
                                  <span>Pertemuan Sudah Selesai</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                            📌 Belum ada jadwal tersedia untuk semua grup.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {groupAssignment && (
                          <div className="flex items-center justify-center mb-4">
                            <span className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-bold rounded-full shadow-md">
                              Grup {groupAssignment}
                            </span>
                          </div>
                        )}
                        {!schedule ? (
                          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                            📌 Jadwal belum tersedia. Harap hubungi konselor atau admin.
                          </p>
                        ) : (
                          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {((schedule as any).date || (schedule as any).datetime?.split(' ')[0]) && (
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 font-semibold text-lg mt-0.5">📅</span>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tanggal</p>
                                    <p className="text-base font-bold text-gray-900 mt-1">
                                      {(schedule as any).date || (schedule as any).datetime?.split(' ')[0] || '-'}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {((schedule as any).time || (schedule as any).datetime) && (
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 font-semibold text-lg mt-0.5">🕐</span>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Waktu</p>
                                    <p className="text-base font-bold text-gray-900 mt-1">
                                      {(schedule as any).time || (schedule as any).datetime || '-'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            {(schedule as any).link && (
                              <div className="pt-4 border-t border-blue-100 space-y-2">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 font-semibold text-lg mt-0.5">🔗</span>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Tautan Pertemuan</p>
                                    <a 
                                      href={(schedule as any).link} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all font-medium"
                                    >
                                      {(schedule as any).link}
                                    </a>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                  <Button 
                                    onClick={() => window.open((schedule as any).link, '_blank')} 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
                                  >
                                    🚀 Mulai Pertemuan
                                  </Button>
                                  {!p?.meetingDone && (
                                    <Button 
                                      onClick={markMeetingDone} 
                                      variant="outline"
                                      className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-lg transition-colors"
                                    >
                                      ✅ Tandai Sudah Mengikuti
                                    </Button>
                                  )}
                                  {p?.meetingDone && (
                                    <div className="flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-50 rounded-lg py-3 border-2 border-green-600">
                                      <span className="text-lg">✓</span>
                                      <span>Sudah Mengikuti</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {(schedule as any).notes && (
                              <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded border border-amber-200">
                                📝 <strong>Catatan:</strong> {(schedule as any).notes}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>

                {/* Card Panduan Penugasan */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-purple-600 text-white border-b border-purple-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <h3 className="text-lg font-semibold">Panduan Penugasan</h3>
                        <p className="text-xs text-purple-100 mt-0.5">Materi dan panduan untuk mengerjakan penugasan sesi ini</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <GuidanceMaterialsDisplay guidance_text={schedule?.guidance_text} guidance_pdf_url={schedule?.guidance_pdf_url} guidance_audio_url={schedule?.guidance_audio_url} guidance_video_url={schedule?.guidance_video_url} guidance_links={schedule?.guidance_links} />
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                      <input
                        type="checkbox"
                        id="guideDone"
                        checked={p?.guideDone || false}
                        onChange={markGuideDone}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="guideDone" className="text-sm text-gray-700 cursor-pointer">
                        Sudah membaca panduan
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Card Penugasan */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-orange-600 text-white border-b border-orange-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✍️</span>
                      <div>
                        <h3 className="text-lg font-semibold">Penugasan Sesi {sessionNumber}</h3>
                        <p className="text-xs text-orange-100 mt-0.5">Refleksi dan latihan sesuai fokus sesi</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {config.assignmentFields.map((field: any) => (
                      <div key={field.key} className="mb-6">
                        <label className="block text-sm font-semibold mb-1 text-gray-800">{field.label}</label>
                        <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
                        <textarea
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 p-3 text-sm transition-colors"
                          placeholder={`Tulis ${field.label.toLowerCase()} Anda di sini...`}
                          value={assignment[field.key]}
                          onChange={e => setAssignment((p: any) => ({ ...p, [field.key]: e.target.value }))}
                          disabled={p?.assignmentDone}
                        />
                      </div>
                    ))}
                    <Button
                      onClick={handleSubmitAssignment}
                      disabled={!assignmentValid || p?.assignmentDone || isSubmitting}
                      className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      {isSubmitting ? "Mengirim..." : p?.assignmentDone ? "✓ Terkirim" : "Kirim Penugasan"}
                    </Button>
                    {autoSavedAt && <div className="text-xs text-gray-500 mt-2">💾 Auto-saved: {autoSavedAt}</div>}
                  </div>
                </Card>

                {/* Card Respons Konselor */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-green-600 text-white border-b border-green-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <h3 className="text-lg font-semibold">Respons Konselor</h3>
                        <p className="text-xs text-green-100 mt-0.5">Umpan balik dari konselor</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {p?.counselorResponse ? (
                      <CounselorResponseDisplay counselorResponse={p.counselorResponse} />
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                        <div className="text-4xl mb-3">⏳</div>
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          Belum ada respons dari Konselor
                        </p>
                        <p className="text-xs text-gray-600">
                          Konselor akan memberi pendapat terkait penugasan Anda
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  {hasPrev ? (
                    <Link
                      to={`/spiritual-budaya/psikoedukasi/sesi/${sessionNumber - 1}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium"
                    >
                      <span>←</span> Sesi Sebelumnya
                    </Link>
                  ) : <div />}
                  {hasNext ? (
                    <Link
                      to={`/spiritual-budaya/psikoedukasi/sesi/${sessionNumber + 1}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium"
                    >
                      Sesi Selanjutnya <span>→</span>
                    </Link>
                  ) : <div />}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpiritualPsikoedukasiUnified;
