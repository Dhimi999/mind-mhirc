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
import { useHibridaPsikoedukasiSession } from "@/hooks/useHibridaPsikoedukasiSession";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
// Konfigurasi tiap sesi: field assignment, label, deskripsi, dan default value
export const sessionConfigs = [
  {
    title: "Mengenal dan Materi Awal Layanan Ini",
    assignmentFields: [
      { key: "read_overview_ack", label: "Saya sudah membaca dan mengetahui gambaran dari layanan ini", desc: "Pilih Ya bila sudah membaca pengantar layanan.", type: "boolean" },
      { key: "hopes", label: "Harapan saya setelah mengikuti layanan ini adalah", desc: "Tuliskan harapan Anda mengikuti layanan ini.", type: "text" },
      { key: "commit_all", label: "Saya akan berusaha mengikuti seluruh tahapan dan sesi layanan ini dari awal hingga akhir", desc: "Komitmen mengikuti layanan sampai selesai.", type: "boolean" },
      { key: "reason_no_commit", label: "Jika memilih Tidak, jelaskan alasannya", desc: "Alasan tidak berkomitmen mengikuti seluruh sesi.", type: "text", showIf: { key: "commit_all", equals: false } },
    ],
    defaultAssignment: { read_overview_ack: "", hopes: "", commit_all: "", reason_no_commit: "", submitted: false },
    tips: [
      "Baca pengantar program terlebih dahulu.",
      "Tuliskan harapan secara spesifik.",
      "Jika ragu berkomitmen, jelaskan alasan Anda.",
    ],
    guideDesc: "Pra-Sesi berisi pengantar dan materi awal agar memahami gambaran layanan sebelum memulai sesi inti.",
  },
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

const HibridaPsikoedukasiUnified: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const sessionNumber = Number(sesi);
  const config = sessionConfigs[sessionNumber];
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
    fetchSubmissionHistory,
  } = useHibridaPsikoedukasiSession(sessionNumber, user?.id);

  const navigate = (window as any).navigate || ((path: string) => { window.location.href = path; });
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  // Sequential lock & auth guard
  useEffect(() => {
    // 1. Auth guard: if not logged in, redirect to login-required page
    if (!user) {
      navigate('/hibrida-cbt/psikoedukasi/login-required');
      return;
    }
    // 2. Enrollment check: only redirect if not super-admin AND groupAssignment null AND not loading
    if (!isSuperAdmin && groupAssignment === null && loading !== undefined && !loading) {
      navigate('/hibrida-cbt');
      return;
    }
    
    /* ========================================
     * SEQUENTIAL LOCK - TEMPORARILY DISABLED
     * ========================================
     * Uncomment code below to re-enable sequential session access.
     * This will require users to complete previous sessions before accessing the next one.
     * ======================================== */
    
    /*
    // 3. Sequential lock: if session > 0, check previous session assignmentDone
    const checkPrev = async () => {
      if (sessionNumber > 0 && !isSuperAdmin && user?.id) {
        try {
          const { data, error } = await (await import('@/integrations/supabase/client')).supabase
            .from('cbt_psikoedukasi_user_progress' as any)
            .select('assignmentDone')
            .eq('user_id', user.id)
            .eq('session_number', sessionNumber - 1)
            .maybeSingle();
          if (error && (error as any).code !== 'PGRST116') throw error;
          if (!data || !(data as any)?.assignmentDone) {
            navigate('/hibrida-cbt/psikoedukasi');
            toast.error("Akses Ditolak", {
              description: `Selesaikan Sesi ${sessionNumber - 1} terlebih dahulu untuk mengakses sesi ini.`,
            });
            return;
          }
        } catch (e) {
          // fallback: allow access
        }
      }
      setCheckingAccess(false);
    };
    checkPrev();
    */
    
    // Directly set checking complete (sequential lock disabled)
    setCheckingAccess(false);
  }, [user, groupAssignment, isSuperAdmin, sessionNumber, loading]);

  const [assignment, setAssignment] = useState<any>(config?.defaultAssignment || {});
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  // Reset local when session changes
  useEffect(() => {
    setAssignment(config?.defaultAssignment ? { ...config.defaultAssignment } : {});
    setSubmissionHistory([]);
    setIsCreatingNew(false);
    setSelectedHistoryItem(null);
    setHistoryLoading(true);
    setHydrating(true);
  }, [sessionNumber]);
  useEffect(() => {
    if (checkingAccess) return;
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
  }, [loadAssignment, config.defaultAssignment, checkingAccess]);

  // Load submission history
  useEffect(() => {
    if (!fetchSubmissionHistory) return;
    const loadHistory = async () => {
      setHistoryLoading(true);
      const history = await fetchSubmissionHistory();
      const sorted = Array.isArray(history)
        ? [...history].sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        : [];
      console.log('Psikoedukasi submission history:', sorted);
      setSubmissionHistory(sorted);
      // Set initial state: if has submissions, show latest (locked), else create new mode
      if (sorted && sorted.length > 0) {
        setIsCreatingNew(false);
        // Load latest submission into form (will be disabled)
        const latest = sorted[0] as any;
        const answers = latest?.answers;
        if (answers && typeof answers === 'object') {
          setAssignment({ ...answers });
        }
      } else {

        // No submission yet, enable create new mode
        setIsCreatingNew(true);
        if (config?.defaultAssignment) {
          setAssignment({ ...config.defaultAssignment });
        }
      }
      setHistoryLoading(false);
    };
    loadHistory();
  }, [fetchSubmissionHistory, progress?.assignmentDone, config]);
  useEffect(() => {
    if ((progress as any)?.assignmentDone) return;
    const h = setTimeout(() => {
      autoSaveAssignment(assignment);
      setAutoSavedAt(new Date().toLocaleTimeString());
    }, 700);
    return () => clearTimeout(h);
  }, [assignment, progress, autoSaveAssignment]);

  const assignmentValid = useMemo(() => {
    return config?.assignmentFields.every((f: any) => {
      if (f.showIf && f.showIf.key) {
        const condVal = (assignment[f.showIf.key] || '') as string;
        const shouldShow = f.showIf.equals === false ? condVal === 'Tidak' : condVal === 'Ya';
        if (!shouldShow) return true; // hidden => not required
      }
      const v = assignment[f.key];
      return typeof v === 'string' && v.trim() !== '';
    });
  }, [assignment, config]);

  const handleSubmitAssignment = useCallback(async () => {
    if (!assignmentValid) return;
    setIsSubmitting(true);
    const ok = await submitAssignmentRemote(assignment);
    if (ok) {
      // Exit create new mode and reload history
      setIsCreatingNew(false);
      // Reload history will automatically show latest submission (locked)
      const history = await fetchSubmissionHistory();
      const sorted = Array.isArray(history)
        ? [...history].sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        : [];
      setSubmissionHistory(sorted);
      if (sorted && sorted.length > 0) {
        const latest = sorted[0] as any;
        const answers = latest?.answers;
        if (answers && typeof answers === 'object') {
          setAssignment({ ...answers });
        }
      }
    }
    setIsSubmitting(false);
  }, [assignmentValid, assignment, submitAssignmentRemote, fetchSubmissionHistory]);

  const handleCreateNewAnswer = useCallback(() => {
    setIsCreatingNew(true);
    setAssignment(config?.defaultAssignment || {});
    setShowHistory(false);
    setSelectedHistoryItem(null);
  }, [config]);

  const handleViewHistory = useCallback(() => {
    setShowHistory(!showHistory);
    setSelectedHistoryItem(null);
  }, [showHistory]);

  const handleViewHistoryDetail = useCallback((item: any) => {
    setSelectedHistoryItem(item);
    setShowHistory(false);
  }, []);

  // Progress calculation
  const overallPercent = useMemo(() => {
    const p = progress as any;
    const steps = [p?.sessionOpened, p?.meetingDone, p?.guideDone, !!p?.assignmentDone, !!p?.counselorResponse];
    return steps.filter(Boolean).length * 20;
  }, [progress]);
  const isFetching = loading || checkingAccess || historyLoading || hydrating;
  useEffect(() => {
    if (!loading && !checkingAccess && !historyLoading) setHydrating(false);
  }, [loading, checkingAccess, historyLoading]);
  if (!config) return <div>Sesi tidak ditemukan</div>;
  if (checkingAccess) return <div />;
  const p = progress as any;
  const hasPrev = sessionNumber > 0;
  const hasNext = sessionNumber < 8;
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`Sesi ${sessionNumber} - ${config.title} | Psikoedukasi Hibrida Naratif CBT`}</title>
        <meta name="description" content={`Portal psikoedukasi sesi ${sessionNumber}: ${config.title}`} />
      </Helmet>
      <Navbar />
  <main className="flex-1 pt-navbar">
        {/* Hero */}
        <section className="relative overflow-hidden rounded">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-700 to-teal-800" />
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Psikoedukasi" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/hibrida-cbt/psikoedukasi" className="text-white/90 hover:underline text-sm">← Kembali</Link>
                <Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Psikoedukasi</Badge>
              </div>
              {isFetching ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4 bg-white/30" />
                  <Skeleton className="h-4 w-1/2 bg-white/20" />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">Sesi {sessionNumber}: {config.title}</h1>
                  <p className="text-teal-100 max-w-2xl">{config.assignmentFields.map(f=>f.label).join(', ')}.</p>
                </>
              )}
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Column: Tips above Sticky Progress */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-xs leading-relaxed">
                  <p className="font-semibold mb-2 text-teal-800">💡 Tips Pengerjaan</p>
                  {isFetching ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-5/6 bg-teal-200/60" />
                      <Skeleton className="h-3 w-4/6 bg-teal-200/60" />
                      <Skeleton className="h-3 w-3/6 bg-teal-200/60" />
                    </div>
                  ) : (
                    config.tips.map((tip, i) => <p key={i} className="mb-1 text-gray-700">{tip}</p>)
                  )}
                </div>
                <div className="rounded-lg bg-white border border-gray-200 p-5 sticky top-28">
                  <h3 className="font-semibold mb-4 text-sm tracking-wide text-gray-800 uppercase">Progres Sesi</h3>
                  <div className="mb-4">
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${overallPercent}%` }} />
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
                  <div className="p-5 bg-teal-600 text-white border-b border-teal-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📖</span>
                      <div>
                        <h3 className="text-lg font-semibold">Panduan Sesi</h3>
                        <p className="text-xs text-teal-100 mt-0.5">Materi dan panduan untuk sesi ini</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 text-gray-700 text-sm leading-relaxed">
                    {isFetching ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-10/12" />
                      </div>
                    ) : (
                      config.guideDesc
                    )}
                  </div>
                </Card>

                {/* Card Informasi Pertemuan */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-blue-600 text-white border-b border-blue-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h3 className="text-lg font-semibold">Informasi Pertemuan Daring</h3>
                        <p className="text-xs text-blue-100 mt-0.5">Jadwal pertemuan online intervensi Hibrida Naratif CBT</p>
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
                        {isFetching ? (
                          <div className="space-y-3">
                            <Skeleton className="h-5 w-40" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Skeleton className="h-40 w-full" />
                              <Skeleton className="h-40 w-full" />
                              <Skeleton className="h-40 w-full" />
                            </div>
                          </div>
                        ) : allGroupSchedules && Object.keys(allGroupSchedules).length > 0 ? (
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
                                      {(groupData as any).start_time || (groupData as any).end_time || groupData.time ? (
                                        <div className="flex items-start gap-2">
                                          <span className="text-blue-600 font-semibold text-xs mt-0.5">🕐</span>
                                          <div className="flex-1">
                                            <p className="text-xs text-gray-500 font-medium">Waktu</p>
                                            <p className="text-sm font-semibold text-gray-900">{
                                              (groupData as any).start_time || (groupData as any).end_time
                                                ? `${(groupData as any).start_time || ''}${(groupData as any).start_time && (groupData as any).end_time ? ' - ' : ''}${(groupData as any).end_time || ''}`
                                                : (groupData as any).time
                                            }</p>
                                          </div>
                                        </div>
                                      ) : null}
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
                            <span className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-base font-bold rounded-full shadow-md">
                              Grup {groupAssignment}
                            </span>
                          </div>
                        )}
                        {isFetching ? (
                          <div className="space-y-3">
                            <Skeleton className="h-5 w-52" />
                            <Skeleton className="h-28 w-full" />
                          </div>
                        ) : !schedule ? (
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
                              {((schedule as any).start_time || (schedule as any).end_time || (schedule as any).time || (schedule as any).datetime) && (
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 font-semibold text-lg mt-0.5">🕐</span>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Waktu</p>
                                    <p className="text-base font-bold text-gray-900 mt-1">{
                                      (schedule as any).start_time || (schedule as any).end_time
                                        ? `${(schedule as any).start_time || ''}${(schedule as any).start_time && (schedule as any).end_time ? ' - ' : ''}${(schedule as any).end_time || ''}`
                                        : ((schedule as any).time || (schedule as any).datetime || '-')
                                    }</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            {(schedule as any).link && (
                              <div className="pt-4 border-t border-blue-100 space-y-2">
                                <div className="flex items-start gap-3">
                                  <span className="text-blue-600 font-semibold text-lg mt-0.5">🔗</span>
                                  <div className="flex-1 mb-2">
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
                                    className="h-full w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
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
                              <p className="text-sm text-gray-600 bg-teal-50 p-3 rounded border border-teal-200">
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
                    {isFetching ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ) : (
                      <GuidanceMaterialsDisplay guidance_text={schedule?.guidance_text} 
                      guidance_pdf_url={schedule?.guidance_pdf_url} 
                      guidance_audio_url={schedule?.guidance_audio_url} 
                      guidance_video_url={schedule?.guidance_video_url} 
                      guidance_links={schedule?.guidance_links} 
                      />
                    )}
                    {!p?.guideDone && (
                      <div className="mt-6 pt-4 border-t border-purple-100">
                        <Button 
                          onClick={markGuideDone} 
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
                        >
                          ✅ Tandai Selesai Dibaca
                        </Button>
                      </div>
                    )}
                    {p?.guideDone && (
                      <div className="mt-6 pt-4 border-t border-purple-100">
                        <div className="flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-50 rounded-lg py-3 border-2 border-green-600">
                          <span className="text-lg">✓</span>
                          <span>Sudah Selesai Dibaca</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Card Penugasan */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-cyan-600 text-white border-b border-cyan-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✍️</span>
                      <div>
                        <h3 className="text-lg font-semibold">Penugasan Sesi {sessionNumber}</h3>
                        <p className="text-xs text-cyan-100 mt-0.5">
                          {isCreatingNew ? "Buat Jawaban Baru" : selectedHistoryItem ? "Riwayat Jawaban" : "Jawaban Terakhir"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">

                    {/* Action buttons - show when not in creating/viewing modes */}
                    {!isFetching && !isCreatingNew && !selectedHistoryItem && (
                      <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        {submissionHistory.length > 0 && (
                          <Button
                            onClick={handleCreateNewAnswer}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm sm:text-base"
                          >
                            ➕ Buat Jawaban Baru
                          </Button>
                        )}
                        {submissionHistory.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={handleViewHistory}
                            className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors text-sm sm:text-base"
                          >
                            📋 Riwayat Jawaban
                          </Button>
                        )}
                      </div>
                    )}
                    {/* Back button when in create new or viewing history detail */}
                    {(isCreatingNew || selectedHistoryItem) && (
                      <div className="mb-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCreatingNew(false);
                            setSelectedHistoryItem(null);
                            // Reload latest submission
                            if (submissionHistory.length > 0) {
                              const latest = submissionHistory[0];
                              if (latest.answers) {
                                setAssignment({ ...latest.answers });
                              }
                            }
                          }}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          ← Kembali ke Jawaban Terakhir
                        </Button>
                      </div>
                    )}

                    {/* History List View */}
                    {showHistory && !selectedHistoryItem && (
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">📋 Riwayat Jawaban ({submissionHistory.length})</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHistory(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕ Tutup
                          </Button>
                        </div>
                        {submissionHistory.length === 0 ? (
                          <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">Anda belum pernah mengirim jawaban untuk sesi ini.</p>
                            <Button
                              onClick={() => {
                                setShowHistory(false);
                                setIsCreatingNew(true);
                                setAssignment(config?.defaultAssignment || {});
                              }}
                              className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                            >
                              ➕ Mulai Mengisi Penugasan
                            </Button>
                          </div>
                        ) : (
                          <>
                            {submissionHistory.map((item: any) => (
                              <div key={item.id} className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 hover:border-blue-400 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-2">
                                      Jawaban #{item.submission_number}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                      Dikirim: {new Date(item.submitted_at).toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleViewHistoryDetail(item)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                  >
                                    👁️ Lihat Detail
                                  </Button>
                                </div>
                                {item.counselor_response && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs text-green-600 font-semibold">✅ Sudah Ada Respons Konselor</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {/* Display selected history item detail */}
                    {selectedHistoryItem && (
                      <div className="mb-6">
                        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-700 font-bold">📋 Jawaban #{selectedHistoryItem.submission_number}</span>
                            <span className="text-xs text-blue-600">
                              {new Date(selectedHistoryItem.submitted_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        {config.assignmentFields.map((field: any) => {
                          const value = selectedHistoryItem.answers?.[field.key] || '';
                          return (
                            <div key={field.key} className="mb-6">
                              <label className="block text-sm font-semibold mb-1 text-gray-800">{field.label}</label>
                              <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
                              <div className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 p-3 text-sm min-h-[80px]">
                                {value || <span className="text-gray-400 italic">Tidak ada jawaban</span>}
                              </div>
                            </div>
                          );
                        })}

                        {selectedHistoryItem.counselor_response && (
                          <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                            <h5 className="text-sm font-bold text-green-800 mb-2">💬 Respons Konselor:</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedHistoryItem.counselor_response}</p>
                            {selectedHistoryItem.counselor_name && (
                              <p className="text-xs text-green-600 mt-2">
                                — {selectedHistoryItem.counselor_name}
                              </p>
                            )}
                            {selectedHistoryItem.responded_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(selectedHistoryItem.responded_at).toLocaleString('id-ID')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form fields - only show in create new mode or when showing latest (not history) */}
                    {!isFetching && !showHistory && !selectedHistoryItem && (
                      <>
                        {config.assignmentFields.map((field: any) => {
                          const dependsVisible = field.showIf && field.showIf.key
                            ? (field.showIf.equals === false
                                ? (assignment[field.showIf.key] || '') === 'Tidak'
                                : (assignment[field.showIf.key] || '') === 'Ya')
                            : true;
                          return (
                            <div key={field.key} className="mb-6">
                              <label className="block text-sm font-semibold mb-1 text-gray-800">{field.label}</label>
                              <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
                              {field.type === 'boolean' ? (
                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    variant={(assignment[field.key] || '') === 'Ya' ? 'default' : 'outline'}
                                    className={(assignment[field.key] || '') === 'Ya' ? 'bg-teal-600 text-white' : ''}
                                    disabled={!isCreatingNew}
                                    onClick={() => setAssignment((p: any) => {
                                      const next = { ...p, [field.key]: 'Ya' };
                                      if (field.key === 'commit_all') {
                                        // Clear reason when committing to 'Ya'
                                        (next as any).reason_no_commit = '';
                                      }
                                      return next;
                                    })}
                                  >
                                    Ya
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={(assignment[field.key] || '') === 'Tidak' ? 'default' : 'outline'}
                                    className={(assignment[field.key] || '') === 'Tidak' ? 'bg-teal-600 text-white' : ''}
                                    disabled={!isCreatingNew}
                                    onClick={() => setAssignment((p: any) => {
                                      const next = { ...p, [field.key]: 'Tidak' };
                                      if (field.key === 'commit_all') {
                                        // Auto-fill reason if empty when selecting 'Tidak'
                                        if (!(next as any).reason_no_commit || !(next as any).reason_no_commit.trim()) {
                                          (next as any).reason_no_commit = '-';
                                        }
                                      }
                                      return next;
                                    })}
                                  >
                                    Tidak
                                  </Button>
                                </div>
                              ) : field.key === 'reason_no_commit' ? (
                                dependsVisible ? (
                                  <textarea
                                    rows={3}
                                    disabled={!isCreatingNew}
                                    className={`w-full rounded-lg border p-3 text-sm transition-colors ${
                                      isCreatingNew 
                                        ? 'border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white' 
                                        : 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                                    }`}
                                    placeholder="Jelaskan alasan Anda di sini..."
                                    value={assignment['reason_no_commit'] || ''}
                                    onChange={e => setAssignment((p: any) => ({ ...p, reason_no_commit: e.target.value }))}
                                  />
                                ) : null
                              ) : (
                                <textarea
                                  rows={3}
                                  disabled={!isCreatingNew}
                                  className={`w-full rounded-lg border p-3 text-sm transition-colors ${
                                    isCreatingNew 
                                      ? 'border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white' 
                                      : 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                                  }`}
                                  placeholder={isCreatingNew ? `Tulis ${field.label.toLowerCase()} Anda di sini...` : ''}
                                  value={assignment[field.key] || ''}
                                  onChange={e => setAssignment((p: any) => ({ ...p, [field.key]: e.target.value }))}
                                />
                              )}
                            </div>
                          );
                        })}

                        {/* Submit button - only show in create new mode */}
                        {isCreatingNew && (
                          <Button
                            onClick={handleSubmitAssignment}
                            disabled={!assignmentValid || isSubmitting}
                            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Mengirim..." : "📤 Kirim Jawaban"}
                          </Button>
                        )}

                        {/* Status indicator when showing latest locked */}
                        {!isCreatingNew && submissionHistory.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
                            <p className="text-sm text-gray-600">
                              ℹ️ <strong>Jawaban Terakhir</strong> — Gunakan tombol "Buat Jawaban Baru" untuk mengirim jawaban baru
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {isFetching && (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Card Riwayat Penugasan - DISABLED: Now integrated into main Card Penugasan */}
                {false && showHistory && submissionHistory.length > 0 && (
                  <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="p-5 bg-indigo-600 text-white border-b border-indigo-700">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">??</span>
                        <div>
                          <h3 className="text-lg font-semibold">Riwayat Penugasan</h3>
                          <p className="text-xs text-indigo-100 mt-0.5">Semua jawaban yang telah Anda kirim</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {submissionHistory.map((submission: any, index: number) => (
                        <div key={submission.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                Jawaban #{submission.submission_number}
                              </span>
                              <span className="text-xs text-gray-500">
                                ?? {new Date(submission.submitted_at).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Display answers */}
                          <div className="space-y-3 mb-4">
                            {Object.entries(submission.answers || {}).map(([key, value]: [string, any]) => {
                              const field = config?.assignmentFields?.find((f: any) => f.key === key);
                              if (!field) return null;
                              let displayValue = value;
                              if (typeof value === 'object' && value !== null) {
                                displayValue = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
                              }
                              return (
                                <div key={key} className="bg-white p-3 rounded border border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">{field.label}</p>
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{displayValue || '-'}</p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Counselor response */}
                          {submission.counselor_response ? (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-green-700 font-semibold text-sm">?? Respons Konselor</span>
                                  {submission.counselor_name && (
                                    <span className="text-xs text-green-600">oleh {submission.counselor_name}</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{submission.counselor_response}</p>
                                {submission.responded_at && (
                                  <p className="text-xs text-green-600 mt-2">
                                    ?? {new Date(submission.responded_at).toLocaleString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                <p className="text-sm text-yellow-700">? Menunggu respons konselor</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Card Respons Konselor - Show latest only */}
                <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="p-5 bg-green-600 text-white border-b border-green-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <h3 className="text-lg font-semibold">Respons Konselor Terbaru</h3>
                        <p className="text-xs text-green-100 mt-0.5">Umpan balik dari konselor untuk jawaban terakhir Anda</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {isFetching ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : submissionHistory.length > 0 && submissionHistory[0]?.counselor_response ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-green-700 font-semibold">Respons untuk Jawaban #{submissionHistory[0].submission_number}</span>
                        </div>
                        <CounselorResponseDisplay 
                          counselorResponse={submissionHistory[0].counselor_response}
                          counselorName={submissionHistory[0].counselor_name}
                          respondedAt={submissionHistory[0].responded_at}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                        <div className="text-4xl mb-3">⏳</div>
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          {submissionHistory.length > 0 ? "Menunggu Respons untuk Jawaban Terakhir" : "Belum Ada Jawaban Terkirim"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {submissionHistory.length > 0 
                            ? "Konselor akan memberi pendapat terkait jawaban terakhir Anda" 
                            : "Kirim jawaban pertama Anda untuk mendapat respons konselor"}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
                  {hasPrev ? (
                    <Link
                      to={`/hibrida-cbt/psikoedukasi/sesi/${sessionNumber - 1}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      <span>←</span> Sesi Sebelumnya
                    </Link>
                  ) : <div className="hidden sm:block" />}
                  {hasNext ? (
                    (progress as any)?.assignmentDone || isSuperAdmin ? (
                      <Link
                        to={`/hibrida-cbt/psikoedukasi/sesi/${sessionNumber + 1}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm sm:text-base"
                      >
                        Sesi Selanjutnya <span>→</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed font-medium text-sm sm:text-base"
                        title="Selesaikan penugasan sesi ini terlebih dahulu"
                        onClick={() => {
                          toast.error("Selesaikan penugasan sesi ini terlebih dahulu sebelum melanjutkan ke sesi berikutnya.");
                        }}
                      >
                        Sesi Selanjutnya <span>→</span>
                      </button>
                    )
                  ) : <div className="hidden sm:block" />}
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

export default HibridaPsikoedukasiUnified;

