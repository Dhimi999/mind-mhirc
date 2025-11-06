import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useSpiritualIntervensiSession } from "@/hooks/useSpiritualIntervensiSession";
import { useSpiritualRole } from "@/hooks/useSpiritualRole";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Session configurations (untuk 8 sesi, tapi saat ini baru 2 yang ada datanya)
export const sessionConfigs = [
  {
    // Pra-Sesi (Sesi 0)
    title: "Mengenal dan Materi Awal Layanan Ini",
    assignmentFields: [
      { key: "read_overview_ack", label: "Saya sudah membaca dan mengetahui gambaran dari layanan ini", desc: "Mohon pilih Ya bila sudah membaca pengantar layanan.", type: "boolean" },
      { key: "hopes", label: "Harapan saya setelah mengikuti layanan ini adalah", desc: "Tuliskan harapan Anda mengikuti layanan ini.", type: "text" },
      { key: "commit_all", label: "Saya akan berusaha mengikuti seluruh tahapan dan sesi layanan ini dari awal hingga akhir", desc: "Komitmen mengikuti layanan hingga selesai.", type: "boolean" },
      { key: "reason_no_commit", label: "Jika memilih Tidak, jelaskan alasannya", desc: "Alasan tidak berkomitmen mengikuti seluruh sesi.", type: "text", showIf: { key: "commit_all", equals: false } },
    ],
    defaultAssignment: { read_overview_ack: "", hopes: "", commit_all: "", reason_no_commit: "" },
    tips: [
      "Baca pengantar program terlebih dahulu.",
      "Tuliskan harapan secara spesifik.",
      "Jujur pada komitmen Anda; tak apa bila ragu—tuliskan alasannya.",
    ],
    guideDesc: "Pra-Sesi berisi pengantar layanan dan orientasi awal agar Anda memahami alur program sebelum memulai sesi inti.",
  },
  {
    // Sesi 1
    title: "Identitas Budaya Dan Makna Diri",
    assignmentFields: [
      { key: "situasi_pemicu", label: "Situasi Pemicu", desc: "Deskripsikan situasi yang memicu stres atau masalah kesehatan mental Anda." },
      { key: "pikiran_otomatis", label: "Pikiran Otomatis", desc: "Apa pikiran otomatis yang muncul saat menghadapi situasi tersebut?" },
      { key: "emosi", label: "Emosi yang Dirasakan", desc: "Emosi apa yang Anda rasakan? (cemas, sedih, marah, dll.)" },
      { key: "perilaku", label: "Perilaku yang Muncul", desc: "Apa perilaku atau tindakan yang Anda lakukan sebagai respons?" },
      { key: "coping.aktivitas", label: "Coping: Aktivitas Positif", desc: "Aktivitas positif apa yang bisa Anda lakukan untuk mengelola emosi?" },
      { key: "coping.kontak", label: "Coping: Kontak Sosial", desc: "Siapa yang bisa Anda hubungi untuk mendapat dukungan?" },
      { key: "coping.layanan", label: "Coping: Layanan Profesional", desc: "Layanan profesional apa yang tersedia untuk Anda?" },
      { key: "coping.lingkungan", label: "Coping: Lingkungan Aman", desc: "Bagaimana menciptakan lingkungan yang aman dan mendukung?" },
      { key: "teknik_metagora", label: "Teknik Metafora Spiritual", desc: "Gunakan metafora spiritual/budaya untuk menggambarkan perjalanan Anda." },
    ],
    defaultAssignment: {
      situasi_pemicu: "",
      pikiran_otomatis: "",
      emosi: "",
      perilaku: "",
      coping: { aktivitas: "", kontak: "", layanan: "", lingkungan: "" },
      teknik_metagora: "",
    },
    tips: [
      "Jawab dengan jujur dan reflektif.",
      "Gunakan contoh konkret dari pengalaman Anda.",
      "Hubungkan dengan nilai spiritual/budaya Anda.",
    ],
    guideDesc: "Sesi ini memperkenalkan konsep nilai spiritual dan budaya dalam konteks kesehatan mental. Anda akan mempelajari bagaimana mengidentifikasi pemicu stres dan mengembangkan strategi coping yang sesuai dengan nilai spiritual dan budaya Anda.",
  },
  {
    // Sesi 2
    title: "Spiritualitas Sebagai Pilar Harapan",
    assignmentFields: [
      { key: "doa_reflektif", label: "Doa Reflektif", desc: "Tuliskan doa atau refleksi spiritual Anda terkait perjalanan kesehatan mental." },
      { key: "meditasi_nilai", label: "Meditasi Nilai", desc: "Catat pengalaman Anda dalam meditasi nilai-nilai spiritual yang penting bagi Anda." },
      { key: "jurnal_spiritual", label: "Jurnal Spiritual", desc: "Tuliskan jurnal refleksi spiritual mingguan Anda." },
    ],
    defaultAssignment: {
      doa_reflektif: "",
      meditasi_nilai: "",
      jurnal_spiritual: "",
    },
    tips: [
      "Luangkan waktu untuk introspeksi mendalam.",
      "Hubungkan dengan tradisi spiritual Anda.",
      "Catat perubahan yang Anda rasakan.",
    ],
    guideDesc: "Sesi ini mengajak Anda mengeksplorasi identitas kultural dan spiritual Anda lebih dalam. Melalui doa, meditasi, dan jurnal, Anda akan mengenali kekuatan spiritual sebagai sumber resiliensi.",
  },
  {
    // Sesi 3 - Placeholder (belum ada data lengkap)
    title: "Ekspresi Emosi Melalui Budaya",
    assignmentFields: [
      { key: "praktik_harian", label: "Praktik Spiritual Harian", desc: "Deskripsikan praktik spiritual yang Anda lakukan setiap hari." },
      { key: "refleksi_dampak", label: "Refleksi Dampak", desc: "Bagaimana praktik ini memengaruhi kesehatan mental Anda?" },
      { key: "tantangan", label: "Tantangan", desc: "Tantangan apa yang Anda hadapi dalam menjalankan praktik ini?" },
      { key: "jurnal", label: "Jurnal Mingguan", desc: "Tuliskan refleksi mingguan Anda." },
    ],
    defaultAssignment: { praktik_harian: "", refleksi_dampak: "", tantangan: "", jurnal: "" },
    tips: ["Konsisten dalam praktik.", "Catat perubahan kecil.", "Minta dukungan jika perlu."],
    guideDesc: "Sesi ini fokus pada integrasi praktik spiritual dalam kehidupan sehari-hari.",
  },
  {
    // Sesi 4 - Placeholder
    title: "Mengurai Stigma Melalui Nilai Komunitas",
    assignmentFields: [
      { key: "komunitas", label: "Komunitas Spiritual", desc: "Deskripsikan komunitas spiritual/budaya yang Anda ikuti." },
      { key: "dukungan", label: "Dukungan yang Diterima", desc: "Dukungan apa yang Anda terima dari komunitas?" },
      { key: "kontribusi", label: "Kontribusi Anda", desc: "Apa yang bisa Anda kontribusikan untuk komunitas?" },
      { key: "jurnal", label: "Jurnal Mingguan", desc: "Tuliskan refleksi mingguan Anda." },
    ],
    defaultAssignment: { komunitas: "", dukungan: "", kontribusi: "", jurnal: "" },
    tips: ["Aktif dalam komunitas.", "Berbagi pengalaman.", "Belajar dari orang lain."],
    guideDesc: "Sesi ini menekankan pentingnya komunitas dan dukungan sosial dalam perjalanan spiritual dan kesehatan mental.",
  },
  {
    // Sesi 5 - Placeholder
    title: "Peran Komunitas dalam Dukungan Emosional",
    assignmentFields: [
      { key: "pengalaman_stigma", label: "Pengalaman Stigma", desc: "Deskripsikan pengalaman Anda dengan stigma kesehatan mental." },
      { key: "strategi_mengatasi", label: "Strategi Mengatasi", desc: "Bagaimana Anda mengatasi stigma tersebut?" },
      { key: "peran_spiritual", label: "Peran Spiritual", desc: "Bagaimana nilai spiritual membantu mengatasi stigma?" },
      { key: "jurnal", label: "Jurnal Mingguan", desc: "Tuliskan refleksi mingguan Anda." },
    ],
    defaultAssignment: { pengalaman_stigma: "", strategi_mengatasi: "", peran_spiritual: "", jurnal: "" },
    tips: ["Jujur tentang pengalaman.", "Cari dukungan.", "Gunakan kekuatan spiritual."],
    guideDesc: "Sesi ini membahas stigma kesehatan mental dan bagaimana nilai spiritual dapat menjadi kekuatan untuk mengatasinya.",
  },
  {
    // Sesi 6 - Placeholder
    title: "Ritual dan Tradisi Sebagai Media Kesembuhan",
    assignmentFields: [
      { key: "momen_sulit", label: "Momen Sulit", desc: "Deskripsikan momen sulit yang telah Anda lalui." },
      { key: "pembelajaran", label: "Pembelajaran", desc: "Apa yang Anda pelajari dari pengalaman tersebut?" },
      { key: "pertumbuhan", label: "Pertumbuhan Personal", desc: "Bagaimana Anda tumbuh dari pengalaman tersebut?" },
      { key: "jurnal", label: "Jurnal Mingguan", desc: "Tuliskan refleksi mingguan Anda." },
    ],
    defaultAssignment: { momen_sulit: "", pembelajaran: "", pertumbuhan: "", jurnal: "" },
    tips: ["Fokus pada pertumbuhan.", "Hargai perjalanan Anda.", "Rayakan kemajuan kecil."],
    guideDesc: "Sesi ini fokus pada resiliensi dan pertumbuhan pasca-trauma dengan perspektif spiritual.",
  },
  {
    // Sesi 7 - Placeholder
    title: "Literasi Spiritual dan Budaya Kesehatan Jiwa",
    assignmentFields: [
      { key: "tujuan_jangka_pendek", label: "Tujuan Jangka Pendek", desc: "Apa tujuan Anda dalam 1-3 bulan ke depan?" },
      { key: "tujuan_jangka_panjang", label: "Tujuan Jangka Panjang", desc: "Apa tujuan Anda dalam 6-12 bulan ke depan?" },
      { key: "strategi_pencapaian", label: "Strategi Pencapaian", desc: "Bagaimana Anda akan mencapai tujuan tersebut?" },
      { key: "jurnal", label: "Jurnal Mingguan", desc: "Tuliskan refleksi mingguan Anda." },
    ],
    defaultAssignment: { tujuan_jangka_pendek: "", tujuan_jangka_panjang: "", strategi_pencapaian: "", jurnal: "" },
    tips: ["Buat tujuan SMART.", "Mulai dari langkah kecil.", "Evaluasi secara berkala."],
    guideDesc: "Sesi ini membantu Anda menyusun rencana tindak lanjut yang realistis dan berkelanjutan.",
  },
  {
    // Sesi 8 - Placeholder
    title: "Komitmen Hidup dan Prospek Masa Depan",
    assignmentFields: [
      { key: "refleksi_perjalanan", label: "Refleksi Perjalanan", desc: "Refleksikan seluruh perjalanan intervensi yang telah Anda lalui." },
      { key: "perubahan_signifikan", label: "Perubahan Signifikan", desc: "Perubahan apa yang paling signifikan bagi Anda?" },
      { key: "komitmen_kedepan", label: "Komitmen ke Depan", desc: "Apa komitmen Anda untuk terus merawat kesehatan mental?" },
      { key: "pesan_untuk_diri", label: "Pesan untuk Diri Sendiri", desc: "Tuliskan pesan positif untuk diri Anda di masa depan." },
      { key: "jurnal", label: "Jurnal Mingguan", desc: "Tuliskan refleksi mingguan Anda." },
    ],
    defaultAssignment: { refleksi_perjalanan: "", perubahan_signifikan: "", komitmen_kedepan: "", pesan_untuk_diri: "", jurnal: "" },
    tips: ["Rayakan pencapaian Anda.", "Hargai proses yang telah dilalui.", "Tetap terhubung dengan nilai spiritual."],
    guideDesc: "Sesi penutup ini adalah evaluasi komprehensif dari seluruh program intervensi spiritual dan budaya yang telah Anda ikuti.",
  },
];

const SpiritualIntervensiUnified: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const sessionNumber = parseInt(sesi || "1", 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, loading: roleLoading } = useSpiritualRole();
  const { toast } = useToast();

  // Validate session number first
  const isValidSession = !isNaN(sessionNumber) && sessionNumber >= 0 && sessionNumber <= 8;
  const config = isValidSession ? sessionConfigs[sessionNumber] : null;

  const {
    progress,
    meeting,
    loading: dataLoading,
    updateProgress,
    groupAssignment,
    isSuperAdmin: isSuperAdminFromHook,
    loadAssignment: loadAssignmentIntervensi,
    autoSaveAssignment: autoSaveIntervensi,
    lastAutoSaveAt,
    fetchSubmissionHistory,
  } = useSpiritualIntervensiSession(isValidSession ? sessionNumber : 1);

  const [previousSessionProgress, setPreviousSessionProgress] = useState<any>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<any>({});
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const isSuperAdmin = role === 'super-admin' || isSuperAdminFromHook;
  const schedule = meeting;
  const allGroupSchedules = meeting?.all_group_schedules;
  const p = progress;

  // Debug log for progress
  useEffect(() => {
    console.log('Progress updated:', progress);
  }, [progress]);

  // Reset local state on session change to avoid stale content flash
  useEffect(() => {
    setAssignment(config?.defaultAssignment ? { ...config.defaultAssignment } : {});
    setSubmissionHistory([]);
    setIsCreatingNew(false);
    setSelectedHistoryItem(null);
    setHistoryLoading(true);
    setHydrating(true);
  }, [sessionNumber]);

  // Load submission history
  useEffect(() => {
    if (!fetchSubmissionHistory) return;
    
    const loadHistory = async () => {
      setHistoryLoading(true);
      const history = await fetchSubmissionHistory();
      const sorted = Array.isArray(history)
        ? [...history].sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        : [];
      console.log(`[Sesi ${sessionNumber}] Submission history:`, sorted);
      setSubmissionHistory(sorted);
      
      // Set initial state: if has submissions, show latest (locked), else create new mode
      if (sorted && sorted.length > 0) {
        console.log(`[Sesi ${sessionNumber}] Has ${history.length} submissions - showing latest (locked)`);
        setIsCreatingNew(false);
        // Load latest submission into form (will be disabled)
        const latest = sorted[0] as any;
        const answers = latest?.answers;
        if (answers && typeof answers === 'object') {
          setAssignment({ ...answers });
        }
      } else {
        console.log(`[Sesi ${sessionNumber}] No submissions yet - create new mode`);
        // No submission yet, enable create new mode
        setIsCreatingNew(true);
        if (config?.defaultAssignment) {
          setAssignment({ ...config.defaultAssignment });
        }
      }
      setHistoryLoading(false);
    };
    
    loadHistory();
  }, [fetchSubmissionHistory, progress?.assignment_done, config, sessionNumber]);

  // Redirect if invalid session number - AFTER all hooks
  useEffect(() => {
    if (!isValidSession) {
      navigate("/spiritual-budaya/intervensi");
    }
  }, [isValidSession, navigate]);

  // Mark session as opened when first loaded
  useEffect(() => {
    if (!config || !progress || progress.session_opened) return;
    
    const markOpened = async () => {
      await updateProgress({ session_opened: true });
    };
    
    markOpened();
  }, [config, progress, updateProgress]);

  // Note: Load existing answers removed - now handled by submission history

  // Autosave
  useEffect(() => {
    if (!config || progress?.assignment_done) return;
    const h = setTimeout(() => {
      autoSaveIntervensi(assignment);
      setAutoSavedAt(lastAutoSaveAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
    return () => clearTimeout(h);
  }, [assignment, autoSaveIntervensi, lastAutoSaveAt, progress?.assignment_done]);

  // Access control - auth guard + sequential
  useEffect(() => {
    const checkSessionAccess = async () => {
      // 1. Auth guard: if not logged in, redirect to login-required page
      if (!user) {
        navigate('/spiritual-budaya/intervensi/login-required');
        return;
      }
      // 2. Enrollment check: only redirect if not super-admin AND groupAssignment null AND not loading
      if (!isSuperAdmin && groupAssignment === null && dataLoading !== undefined && !dataLoading) {
        navigate('/spiritual-budaya/pengantar');
        return;
      }

      /* ========================================
       * SEQUENTIAL LOCK - TEMPORARILY DISABLED
       * ========================================
       * Uncomment the code below to re-enable sequential session access.
       * This will require users to complete the previous session before accessing the next one.
       * To re-enable:
       * 1. Uncomment the entire block below
       * 2. Remove or comment out the "setCheckingAccess(false)" line at the bottom
       * ======================================== */
      
      /*
      // 3. Sequential lock
      if (!config || sessionNumber === 0 || isSuperAdmin) {
        setCheckingAccess(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('sb_intervensi_user_progress' as any)
          .select('assignment_done')
          .eq('user_id', user.id)
          .eq('session_number', sessionNumber - 1)
          .maybeSingle();
        if (error && (error as any).code !== 'PGRST116') throw error;
        const row: any = data as any;
        if (!row || !row.assignment_done) {
          navigate('/spiritual-budaya/intervensi');
          toast({
            title: "Akses Ditolak",
            description: `Selesaikan Sesi ${sessionNumber - 1} terlebih dahulu untuk mengakses sesi ini.`,
            variant: "destructive",
          });
          return;
        }
        setPreviousSessionProgress(row);
      } catch (error) {
        console.error('Error checking session access:', error);
      } finally {
        setCheckingAccess(false);
      }
      */

      // Directly set checking complete (sequential lock disabled)
      setCheckingAccess(false);
    };
    checkSessionAccess();
  }, [user, groupAssignment, isSuperAdmin, sessionNumber, config, navigate, toast, dataLoading]);

  const progressPercentage = useMemo(() => {
    if (!progress) return 0;
    let total = 0;
    if (progress.meeting_done) total += 50;
    if (progress.assignment_done) total += 30;
    if (progress.counselor_feedback) total += 20;
    return total;
  }, [progress]);

  // Helper to get nested value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Helper to set nested value
  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, obj);
    target[lastKey] = value;
    return { ...obj };
  };

  const assignmentValid = useMemo(() => {
    if (!config?.assignmentFields) return false;
    return config.assignmentFields.every((field: any) => {
      // Respect conditional visibility (showIf)
      if (field.showIf && field.showIf.key) {
        const condVal = (getNestedValue(assignment, field.showIf.key) || '') as string;
        const shouldShow = field.showIf.equals === false ? condVal === 'Tidak' : condVal === 'Ya';
        if (!shouldShow) return true; // hidden => not required
      }
      const val = getNestedValue(assignment, field.key);
      return typeof val === 'string' && val.trim() !== '';
    });
  }, [assignment, config]);

  const handleSubmitAssignment = useCallback(async () => {
    if (!assignmentValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await updateProgress({ assignment_data: assignment, assignment_done: true });

      if (result?.success) {
        toast({
          title: "Jawaban Berhasil Dikirim",
          description: `Jawaban #${submissionHistory.length + 1} telah tersimpan.`,
          variant: "default",
        });
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
      } else {
        throw new Error(result?.error?.message || "Gagal mengirim jawaban");
      }
    } catch (error) {
      console.error("Submit assignment error:", error);
      toast({
        title: "Gagal Mengirim Jawaban",
        description: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [assignmentValid, isSubmitting, assignment, updateProgress, toast, submissionHistory, fetchSubmissionHistory]);

  const handleCreateNewAnswer = useCallback(() => {
    setIsCreatingNew(true);
    setAssignment(config?.defaultAssignment || {});
    setShowHistory(false);
    setSelectedHistoryItem(null);
    toast({
      title: "Mode Buat Jawaban Baru",
      description: "Form telah dikosongkan. Silakan isi jawaban baru Anda.",
      variant: "default",
    });
  }, [config, toast]);

  const handleViewHistory = useCallback(() => {
    setShowHistory(!showHistory);
    setSelectedHistoryItem(null);
  }, [showHistory]);

  const handleViewHistoryDetail = useCallback((item: any) => {
    setSelectedHistoryItem(item);
    setShowHistory(false);
  }, []);

  const handleMarkMeetingDone = useCallback(async () => {
    await updateProgress({ meeting_done: !progress?.meeting_done });
  }, [progress, updateProgress]);

  const handleMarkGuidanceRead = useCallback(async () => {
    await updateProgress({ guidance_read: true });
    toast({
      title: "Panduan Ditandai Selesai",
      description: "Anda telah menyelesaikan membaca panduan penugasan.",
      variant: "default",
    });
  }, [updateProgress, toast]);

  const overallPercent = useMemo(() => {
    if (!p) return 0;
    let cnt = 0;
    if (p.session_opened) cnt++;
    if (p.guidance_read) cnt++;
    if (p.meeting_done) cnt++;
    if (p.assignment_done) cnt++;
    if (p.counselor_feedback) cnt++;
    return Math.round((cnt / 5) * 100);
  }, [p]);

  const hasPrev = sessionNumber > 0;
  const hasNext = sessionNumber < 8;

  const isFetching = dataLoading || roleLoading || checkingAccess || historyLoading || hydrating;

  useEffect(() => {
    if (!dataLoading && !roleLoading && !checkingAccess && !historyLoading) {
      setHydrating(false);
    }
  }, [dataLoading, roleLoading, checkingAccess, historyLoading]);

  // Show error if config is invalid
  if (!config) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-semibold text-lg mb-2">Error: Konfigurasi Sesi Tidak Valid</p>
            <p className="text-gray-600 text-sm mb-4">Sesi {sessionNumber} tidak tersedia</p>
            <Link 
              to="/spiritual-budaya/intervensi" 
              className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              ← Kembali ke Portal
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (dataLoading || roleLoading || checkingAccess) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat data sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`Sesi ${sessionNumber}: ${config?.title ?? 'Loading'} - Intervensi Spiritual & Budaya | MindMHIRC`}</title>
        <meta
          name="description"
          content={`Portal sesi ${sessionNumber} intervensi spiritual dan budaya - ${config?.title ?? 'Loading'}`}
        />
      </Helmet>
      <Navbar />
  <main className="flex-1 pt-navbar">
        {/* Hero */}
        <section className="relative overflow-hidden rounded">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800" />
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya/intervensi" className="text-white/90 hover:underline text-sm">← Kembali</Link>
                <Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Intervensi</Badge>
              </div>
              {isFetching ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4 bg-white/30" />
                  <Skeleton className="h-4 w-1/2 bg-white/20" />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">Sesi {sessionNumber}: {config?.title || 'Loading...'}</h1>
                  <p className="text-amber-100 max-w-2xl">{(config?.assignmentFields || []).map(f => f.label).join(', ') || ''}.</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar: Tips & Progress */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed">
                  <p className="font-semibold mb-2 text-amber-800">💡 Tips Pengerjaan</p>
                  {isFetching ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-5/6 bg-amber-200/60" />
                      <Skeleton className="h-3 w-4/6 bg-amber-200/60" />
                      <Skeleton className="h-3 w-3/6 bg-amber-200/60" />
                    </div>
                  ) : (
                    (config?.tips || []).map((tip, i) => <p key={i} className="mb-1 text-gray-700">{tip}</p>)
                  )}
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
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.session_opened ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
                      <span className={p?.session_opened ? 'font-medium text-gray-900' : 'text-gray-600'}>Sesi Dibuka</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.meeting_done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
                      <span className={p?.meeting_done ? 'font-medium text-gray-900' : 'text-gray-600'}>Pertemuan Selesai</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.guidance_read ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
                      <span className={p?.guidance_read ? 'font-medium text-gray-900' : 'text-gray-600'}>Materi/Panduan Selesai</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.assignment_done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>4</span>
                      <span className={p?.assignment_done ? 'font-medium text-gray-900' : 'text-gray-600'}>Penugasan Selesai</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${p?.counselor_feedback ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>5</span>
                      <span className={p?.counselor_feedback ? 'font-medium text-gray-900' : 'text-gray-600'}>Respons Konselor</span>
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
                    {isFetching ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-10/12" />
                      </div>
                    ) : (
                      config?.guideDesc || 'Panduan sesi belum tersedia.'
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
                            {!p?.meeting_done && (
                              <div className="mt-4 pt-4 border-t border-blue-200">
                                <Button 
                                  onClick={handleMarkMeetingDone} 
                                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
                                >
                                  ✅ Tandai Pertemuan Selesai
                                </Button>
                              </div>
                            )}
                            {p?.meeting_done && (
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
                                <div className="flex items-start gap-3 mb-2">
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
                                    className="h-full w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
                                  >
                                    🚀 Mulai Pertemuan
                                  </Button>
                                  {!p?.meeting_done && (
                                    <Button 
                                      onClick={handleMarkMeetingDone} 
                                      variant="outline"
                                      className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-lg transition-colors"
                                    >
                                      ✅ Tandai Sudah Mengikuti
                                    </Button>
                                  )}
                                  {p?.meeting_done && (
                                    <div className="flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-50 rounded-lg py-3 border-2 border-green-600">
                                      <span className="text-lg">✓</span>
                                      <span>Sudah Mengikuti</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {(schedule as any).description && (
                              <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded border border-amber-200">
                                📝 <strong>Catatan:</strong> {(schedule as any).description}
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
                      <GuidanceMaterialsDisplay 
                        guidance_text={schedule?.guidance_text} 
                        guidance_pdf_url={schedule?.guidance_pdf_url} 
                        guidance_audio_url={schedule?.guidance_audio_url} 
                        guidance_video_url={schedule?.guidance_video_url} 
                        guidance_links={schedule?.guidance_links}
                        showTitle={false}
                      />
                    )}
                    {!p?.guidance_read && (
                      <div className="mt-6 pt-4 border-t border-purple-100">
                        <Button 
                          onClick={handleMarkGuidanceRead} 
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
                        >
                          ✅ Tandai Selesai Dibaca
                        </Button>
                      </div>
                    )}
                    {p?.guidance_read && (
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
                  <div className="p-5 bg-orange-600 text-white border-b border-orange-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✍️</span>
                      <div>
                        <h3 className="text-lg font-semibold">Penugasan Sesi {sessionNumber}</h3>
                        <p className="text-xs text-orange-100 mt-0.5">
                          {isCreatingNew ? "Buat Jawaban Baru" : selectedHistoryItem ? "Riwayat Jawaban" : "Jawaban Terakhir"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Action buttons - always visible if has submissions */}
                    {!isFetching && submissionHistory.length > 0 && !isCreatingNew && !selectedHistoryItem && (
                      <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleCreateNewAnswer}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          ➕ Buat Jawaban Baru
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleViewHistory}
                          className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          📋 Riwayat Jawaban
                        </Button>
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
                        {submissionHistory.map((item, idx) => (
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
                        {(config?.assignmentFields || []).map((field: any) => {
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
                        {(config?.assignmentFields || []).map((field: any) => {
                          const dependsVisible = field.showIf && field.showIf.key
                            ? (field.showIf.equals === false
                                ? (getNestedValue(assignment, field.showIf.key) || '') === 'Tidak'
                                : (getNestedValue(assignment, field.showIf.key) || '') === 'Ya')
                            : true;

                          return (
                            <div key={field.key} className="mb-6">
                              <label className="block text-sm font-semibold mb-1 text-gray-800">{field.label}</label>
                              <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
                              {field.type === 'boolean' ? (
                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    variant={(getNestedValue(assignment, field.key) || '') === 'Ya' ? 'default' : 'outline'}
                                    className={(getNestedValue(assignment, field.key) || '') === 'Ya' ? 'bg-amber-600 text-white' : ''}
                                    disabled={!isCreatingNew}
                                    onClick={() => setAssignment((prev: any) => {
                                      const next = setNestedValue({ ...prev }, field.key, 'Ya');
                                      // If toggling commit_all to 'Ya', clear reason_no_commit
                                      if (field.key === 'commit_all') {
                                        setNestedValue(next, 'reason_no_commit', '');
                                      }
                                      return next;
                                    })}
                                  >
                                    Ya
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={(getNestedValue(assignment, field.key) || '') === 'Tidak' ? 'default' : 'outline'}
                                    className={(getNestedValue(assignment, field.key) || '') === 'Tidak' ? 'bg-amber-600 text-white' : ''}
                                    disabled={!isCreatingNew}
                                    onClick={() => setAssignment((prev: any) => {
                                      const next = setNestedValue({ ...prev }, field.key, 'Tidak');
                                      // If toggling commit_all to 'Tidak', auto-fill reason when empty
                                      if (field.key === 'commit_all') {
                                        const reason = (getNestedValue(next, 'reason_no_commit') || '') as string;
                                        if (!reason.trim()) setNestedValue(next, 'reason_no_commit', '-');
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
                                        ? 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white' 
                                        : 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                                    }`}
                                    placeholder="Jelaskan alasan Anda di sini..."
                                    value={getNestedValue(assignment, 'reason_no_commit') || ''}
                                    onChange={e => setAssignment((prev: any) => setNestedValue(prev, 'reason_no_commit', e.target.value))}
                                  />
                                ) : null
                              ) : (
                                <textarea
                                  rows={3}
                                  disabled={!isCreatingNew}
                                  className={`w-full rounded-lg border p-3 text-sm transition-colors ${
                                    isCreatingNew 
                                      ? 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white' 
                                      : 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                                  }`}
                                  placeholder={isCreatingNew ? `Tulis ${field.label.toLowerCase()} Anda di sini...` : ''}
                                  value={getNestedValue(assignment, field.key) || ''}
                                  onChange={e => setAssignment((prev: any) => setNestedValue(prev, field.key, e.target.value))}
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
                            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Mengirim..." : "📥 Kirim Jawaban"}
                          </Button>
                        )}

                        {/* Status indicator when showing latest locked */}
                        {!isCreatingNew && submissionHistory.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
                            <p className="text-sm text-gray-600">
                              � <strong>Jawaban Terakhir</strong> —” Gunakan tombol "Buat Jawaban Baru" untuk mengirim jawaban baru
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
                      to={`/spiritual-budaya/intervensi/sesi/${sessionNumber - 1}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      <span>←</span> Sesi Sebelumnya
                    </Link>
                  ) : <div className="hidden sm:block" />}
                  {hasNext ? (
                    progress?.assignment_done || isSuperAdmin ? (
                      <Link
                        to={`/spiritual-budaya/intervensi/sesi/${sessionNumber + 1}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium text-sm sm:text-base"
                      >
                        Sesi Selanjutnya <span>→</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed font-medium text-sm sm:text-base"
                        title="Selesaikan penugasan sesi ini terlebih dahulu"
                        onClick={() => {
                          toast({
                            title: "Selesaikan Sesi Ini Terlebih Dahulu",
                            description: "Kirim jawaban penugasan sebelum melanjutkan ke sesi berikutnya.",
                            variant: "destructive",
                          });
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

export default SpiritualIntervensiUnified;