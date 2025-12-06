import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Home, Book, FileText, Brain } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useHibridaRole } from "@/hooks/useHibridaRole";
import { useToast } from "@/hooks/use-toast";
import { HibridaSessionCard } from "@/components/hibrida-naratif/HibridaSessionCard";
import heroImage from "@/assets/hibrida-naratif-hero.jpg"; // Placeholder reuse
import jelajahImage from "@/assets/hibrida-jelajah.jpg"; // Placeholder reuse
import tasksImage from "@/assets/hibrida-tasks.jpg"; // Placeholder reuse
import { getSiteBaseUrl } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Halaman layanan: Hibrida Naratif CBT
// Struktur mirip Spiritual & Budaya namun konten lebih umum (naratif + CBT)

const HibridaNaratifCBT: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { enrollment, loading: enrollmentLoading, requestEnrollment, canAccessIntervensiHNCBT, canAccessIntervensiPsikoedukasi, isSuperAdmin } = useHibridaRole();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pengantar");
  const [isRequestingEnrollment, setIsRequestingEnrollment] = useState(false);

  // Future: session progress map (placeholder for parity)
  type SessionProgress = { meetingDone: boolean; assignmentDone: boolean };
  const [progressMap, setProgressMap] = useState<Record<number, SessionProgress>>({});

  // Load persisted progress from portal sessions (shared via localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hibridaInterventionProgress");
      if (raw) setProgressMap(JSON.parse(raw));
    } catch {}
  }, []);

  // Sync progress from DB on load for HN-CBT
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('cbt_hibrida_user_progress' as any)
          .select('session_number, meeting_done, assignment_done')
          .eq('user_id', user.id);
        if (error) throw error;
        const map: Record<number, { meetingDone: boolean; assignmentDone: boolean }> = {};
        (data || []).forEach((row: { session_number: number; meeting_done?: boolean; assignment_done?: boolean }) => {
          map[row.session_number] = {
            meetingDone: !!row.meeting_done,
            assignmentDone: !!row.assignment_done,
          };
        });
        setProgressMap(map);
        try { localStorage.setItem('hibridaInterventionProgress', JSON.stringify(map)); } catch {}
      } catch (e) {
        // TODO: log to monitoring service when available
      }
    };
    loadProgress();
  }, [user?.id]);

  // Initialize tab (support route /hibrida-cbt/:tab)
  useEffect(() => {
    const allowed = ["pengantar", "jelajah", "intervensi-hibrida", "psikoedukasi"] as const;
    const desired = (tab || "pengantar").toLowerCase();
    if ((allowed as readonly string[]).includes(desired)) {
      setActiveTab(desired);
    } else {
      // Fallback tab when invalid param provided
      setActiveTab("pengantar");
    }
  }, [tab]);

  const setTabAndUrl = (val: string) => {
    setActiveTab(val);
    const target = `/hibrida-cbt/${val}`;
    if (location.pathname !== target) navigate(target);
  };

  const handleRequestEnrollment = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/hibrida-cbt/pengantar');
      return;
    }

    setIsRequestingEnrollment(true);
    const result = await requestEnrollment();
    setIsRequestingEnrollment(false);

    if (result.success) {
      toast({
        title: "Pendaftaran Berhasil",
        description: "Permintaan pendaftaran Anda telah dikirim. Silakan tunggu persetujuan dari admin.",
        variant: "default"
      });
    } else {
      toast({
        title: "Pendaftaran Gagal",
        description: result.error || "Terjadi kesalahan saat mendaftar.",
        variant: "destructive"
      });
    }
  };

  const GuardedIntervensi: React.FC<{ 
    children: React.ReactNode; 
    requireRole: 'grup-int' | 'grup-cont'; 
    label?: string 
  }> = ({ children, requireRole, label }) => {
    if (!isAuthenticated) {
      return (
        <div className="relative">
          <div className="relative max-h-[50vh] overflow-hidden pointer-events-none select-none">
            <div className="blur-sm">{children}</div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/95 dark:from-black/70 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-4 z-20" aria-live="polite">
            <div className="mx-auto rounded-xl border bg-white/90 dark:bg-black/60 backdrop-blur-md p-4 md:p-5 max-w-xl text-center shadow-lg">
              <p className="mb-2 font-medium">Konten ini membutuhkan autentikasi.</p>
              <p className="text-sm text-muted-foreground mb-3">Silakan login untuk membuka seluruh materi.</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate(`/login?redirect=/hibrida-cbt/${activeTab}`)}>
                Login untuk Mengakses
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const hasAccess = isSuperAdmin || 
      (requireRole === 'grup-int' && canAccessIntervensiHNCBT) ||
      (requireRole === 'grup-cont' && canAccessIntervensiPsikoedukasi);

    if (hasAccess) return <>{children}</>;

    return (
      <div className="relative">
        <div className="relative max-h-[50vh] overflow-hidden pointer-events-none select-none">
          <div className="blur-sm">{children}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/95 dark:from-black/70 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 z-20" aria-live="polite">
          <div className="mx-auto rounded-xl border bg-white/90 dark:bg-black/60 backdrop-blur-md p-4 md:p-5 max-w-xl text-center shadow-lg">
            <p className="mb-2 font-medium">{label || "Akses Terbatas"}</p>
            <p className="text-sm text-muted-foreground mb-3">
              {enrollment?.status === 'pending' 
                ? "Permintaan pendaftaran Anda sedang diproses. Silakan tunggu persetujuan dari admin."
                : "Anda belum terdaftar untuk mengakses konten ini. Silakan daftar terlebih dahulu di tab Pengantar."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Module definitions (naratif + CBT focus)
  const treatmentModules = [
    { session: 0, title: "Pengenalan Layanan dan Persiapan", description: "Memahami gambaran program, menuliskan harapan, dan berkomitmen mengikuti intervensi.", duration: "30 menit" },
    { session: 1, title: "Membangun Aliansi & Cerita Dasar", description: "Menggali narasi pribadi awal dan membangun rasa aman dalam proses.", duration: "60 menit" },
    { session: 2, title: "Mengidentifikasi Pikiran Otomatis", description: "Pengenalan pola pikir otomatis yang mempengaruhi emosi dan perilaku.", duration: "60 menit" },
    { session: 3, title: "Restrukturisasi Kognitif Awal", description: "Menantang distorsi kognitif sederhana dan membangun alternatif realistis.", duration: "60 menit" },
    { session: 4, title: "Naratif Alternatif & Nilai Hidup", description: "Menyusun ulang cerita diri dengan fokus pada kekuatan dan nilai pribadi.", duration: "60 menit" },
    { session: 5, title: "Eksposur Naratif Aman", description: "Pendekatan bertahap meninjau pengalaman sulit dalam konteks aman & terarah.", duration: "60 menit" },
    { session: 6, title: "Eksperimen Perilaku & Mindfulness", description: "Menggabungkan aktivitas terstruktur untuk menguji keyakinan dan regulasi emosi.", duration: "60 menit" },
    { session: 7, title: "Integrasi Cerita & Ketahanan", description: "Menghubungkan perubahan kognitif dengan narasi identitas baru yang lentur.", duration: "60 menit" },
    { session: 8, title: "Rencana Lanjut & Relapse Prevention", description: "Merumuskan strategi menjaga kemajuan dan mencegah kemunduran.", duration: "60 menit" }
  ] as const;

  const rawIsAdmin = user?.is_admin === true;
  const [adminView, setAdminView] = useState(true); // Default TRUE - admin by default
  // Persist admin preview toggle so admin can switch mode easily
  useEffect(() => {
    if (!rawIsAdmin) return;
    try {
      const saved = localStorage.getItem("hibridaAdminView");
      if (saved !== null) setAdminView(saved === "true");
    } catch {}
  }, [rawIsAdmin]);
  useEffect(() => {
    if (rawIsAdmin) {
      try { localStorage.setItem("hibridaAdminView", String(adminView)); } catch {}
    }
  }, [adminView, rawIsAdmin]);
  // Effective admin gating (if toggle ON, behave as admin; if OFF, behave as participant)
  const isAdmin = isSuperAdmin || (rawIsAdmin && adminView);

  const jelajahContent = [
    { title: "Dasar Naratif Therapy", description: "Konsep inti terapi naratif dalam membingkai ulang cerita diri.", icon: Book, articles: 6, slug: "dasar-naratif" },
    { title: "Konsep CBT Inti", description: "Hubungan pikiran, emosi, dan perilaku dalam CBT modern.", icon: Brain, articles: 10, slug: "konsep-cbt" },
    { title: "Teknik Restrukturisasi", description: "Langkah-langkah praktis mengubah distorsi kognitif.", icon: FileText, articles: 8, slug: "restrukturisasi" },
    { title: "Eksperimen Perilaku", description: "Menguji asumsi melalui tindakan terukur dan refleksi.", icon: FileText, articles: 7, slug: "eksperimen-perilaku" }
  ];

  // Psikoedukasi modules list (0-8: Pra-Sesi + 8 sesi inti)
  const psikoModules = [
    { session: 0, title: 'Mengenal dan Materi Awal Layanan Ini', description: 'Memahami gambaran layanan, menuliskan harapan, dan berkomitmen mengikuti program.' },
    { session: 1, title: 'Pengenalan Tentang Bunuh Diri dan Risiko Terkait Bagi Mahasiswa', description: 'Memahami pengertian, faktor risiko & protektif, serta cara mencari bantuan.' },
    { session: 2, title: 'Mengenali Tanda-Tanda Dini Risiko Bunuh Diri Bagi Mahasiswa', description: 'Identifikasi tanda dini, tindakan preventif, dan refleksi adaptif.' },
    { session: 3, title: 'Pengembangan Keterampilan Koping Adaptif Bagi Mahasiswa', description: 'Transformasi koping maladaptif menjadi strategi adaptif.' },
    { session: 4, title: 'Perilaku Mencari Bantuan Bagi Mahasiswa', description: 'Membangun kesiapan mencari dan mengakses dukungan.' },
    { session: 5, title: 'Pengurangan Stigma Bagi Mahasiswa', description: 'Mengidentifikasi dampak stigma dan merancang langkah pengurangannya.' },
    { session: 6, title: 'Penguatan Jaringan Dukungan Sosial Bagi Mahasiswa', description: 'Memetakan macam dukungan dan sumber-sumbernya yang relevan.' },
    { session: 7, title: 'Penyediaan Informasi tentang Sumber Daya Bagi Mahasiswa', description: 'Menyusun informasi sumber daya yang akurat dan mudah diakses.' },
    { session: 8, title: 'Evaluasi dan Tindak Lanjut Bagi Mahasiswa', description: 'Merangkum perubahan, tantangan, dan rencana tindak lanjut.' }
  ] as const;

  // Load psiko progress (optional future usage) – kept separate for clarity
  const [psikoProgress, setPsikoProgress] = useState<Record<number, { meetingDone?: boolean; assignmentDone?: boolean }>>({});
  useEffect(() => {
    try { const raw = localStorage.getItem('hibridaPsikoEduProgress'); if (raw) setPsikoProgress(JSON.parse(raw)); } catch {}
  }, []);

  // Sync progress from DB on load for Psikoedukasi
  useEffect(() => {
    const loadProg = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('cbt_psikoedukasi_user_progress' as any)
          .select('session_number, meeting_done, assignment_done')
          .eq('user_id', user.id);
        if (error) throw error;
        const map: Record<number, { meetingDone?: boolean; assignmentDone?: boolean }> = {};
        (data || []).forEach((row: { session_number: number; meeting_done?: boolean; assignment_done?: boolean }) => {
          map[row.session_number] = {
            meetingDone: !!row.meeting_done,
            assignmentDone: !!row.assignment_done,
          };
        });
        setPsikoProgress(map);
        try { localStorage.setItem('hibridaPsikoEduProgress', JSON.stringify(map)); } catch {}
      } catch (e) {
        // ignore
      }
    };
    loadProg();
  }, [user?.id]);

  /* ========================================
   * SEQUENTIAL LOCK - TEMPORARILY DISABLED
   * ========================================
   * Uncomment the code below to re-enable sequential session unlocking on the portal page.
   * This will require users to complete the previous session before accessing the next one.
   * To re-enable:
   * 1. Uncomment the entire block below
   * 2. Comment out or remove the "return 'available'" lines in the active functions
   * ======================================== */

  /*
  // Sequential unlocking logic for HN-CBT Intervensi (mirror Spiritual Budaya pattern)
  const getSessionStatus = (sessionNumber: number): "available" | "locked" => {
    // Admin always see all sessions available
    if (isAdmin) return "available";
    // Session 0 (Pra-Sesi) always available for enrolled users
    if (sessionNumber === 0) return "available";
    // Other sessions require previous session to be completed (both meeting & assignment)
    const prevSessionDone = !!(progressMap[sessionNumber - 1]?.meetingDone && progressMap[sessionNumber - 1]?.assignmentDone);
    return prevSessionDone ? "available" : "locked";
  };
  */

  // Sequential lock disabled: all sessions available
  const getSessionStatus = (sessionNumber: number): "available" | "locked" => {
    return "available";
  };

  /*
  // Sequential unlocking logic for Psikoedukasi (mirror Spiritual Budaya pattern)
  const getPsikoStatus = (sessionNumber: number): "available" | "locked" => {
    // Admin always see all sessions available
    if (isAdmin) return "available";
    // Session 0 (Pra-Sesi) always available for enrolled users
    if (sessionNumber === 0) return "available";
    // Other sessions require previous session to be completed (both meeting & assignment)
    const prevDone = !!(psikoProgress[sessionNumber - 1]?.meetingDone && psikoProgress[sessionNumber - 1]?.assignmentDone);
    return prevDone ? "available" : "locked";
  };
  */

  // Sequential lock disabled: all sessions available
  const getPsikoStatus = (sessionNumber: number): "available" | "locked" => {
    return "available";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Hibrida Naratif CBT | Mind MHIRC</title>
        <meta name="description" content="Program intervensi digital Hibrida Naratif CBT: menggabungkan kekuatan terapi naratif dan CBT untuk membangun regulasi emosi, fleksibilitas kognitif, dan ketahanan psikologis." />
        <link rel="canonical" href={`${getSiteBaseUrl()}${activeTab ? `/hibrida-cbt/${activeTab}` : '/hibrida-cbt'}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Hibrida Naratif CBT | Mind MHIRC" />
        <meta property="og:description" content="Intervensi naratif + CBT untuk membangun ketahanan psikologis." />
        <meta property="og:url" content={`${getSiteBaseUrl()}${activeTab ? `/hibrida-cbt/${activeTab}` : '/hibrida-cbt'}`} />
        <meta property="og:image" content={`${getSiteBaseUrl()}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hibrida Naratif CBT | Mind MHIRC" />
        <meta name="twitter:description" content="Intervensi naratif + CBT untuk membangun ketahanan psikologis." />
        <meta name="twitter:image" content={`${getSiteBaseUrl()}/og-image.png`} />
      </Helmet>
      <Navbar />
  <main className="flex-1 pt-navbar">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-indigo-50 to-background dark:from-indigo-900/20 overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Hibrida Naratif CBT" className="w-full h-full object-cover" />
          </div>
            <div className="relative container mx-auto px-6 py-16 rounded-xl">
              <div className="max-w-4xl mx-auto text-center fade-in">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-teal-600 to-cyan-800 bg-clip-text text-transparent">
                  Hibrida Naratif CBT
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Program intervensi digital yang menggabungkan kekuatan terapi naratif dan CBT untuk membantu Anda
                  membingkai ulang pengalaman, mengelola pikiran otomatis, dan membangun ketahanan emosional.
                </p>
                {(isSuperAdmin || rawIsAdmin) && (
                  <div className="mt-6 flex items-center justify-center">
                    <div className="inline-flex items-center gap-4 rounded-xl bg-white/95 dark:bg-black/70 border border-indigo-200 dark:border-indigo-800 px-4 py-2 shadow-md backdrop-blur-sm">
                      <div className="flex flex-col">
                        <Label htmlFor="admin-view-hibrida" className="text-sm font-medium">Pratinjau Peserta</Label>
                        <span className="text-xs text-muted-foreground">Lihat halaman seperti peserta biasa</span>
                      </div>

                      <Switch
                        id="admin-view-hibrida"
                        checked={adminView}
                        onCheckedChange={setAdminView}
                        aria-label="Toggle preview as participant"
                        className={`relative inline-flex h-8 w-16 rounded-full p-1 transition-colors focus:outline-none ${adminView ? 'bg-indigo-600 border-cyan-700' : 'bg-gray-200 dark:bg-gray-600 border-transparent'}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block h-7 w-7 rounded-full bg-white shadow transition-transform duration-200 ease-in-out transform ${adminView ? 'translate-x-[calc(100%-28px)]' : 'translate-x-0'}`}
                        />
                      </Switch>

                      <span className={`text-sm font-semibold ${adminView ? 'text-teal-700' : 'text-muted-foreground'}`}>
                        {adminView ? 'Pratinjau aktif' : 'Mode admin'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <Tabs value={activeTab} onValueChange={(v) => setTabAndUrl(v)} className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12 gap-2">
                <TabsTrigger value="pengantar" className="py-3 text-sm md:text-base">
                  <span className="flex flex-col items-center gap-1">
                    <Home className="h-5 w-5" />
                    <span>Pengantar</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="jelajah" className="py-3 text-sm md:text-base">
                  <span className="flex flex-col items-center gap-1">
                    <Book className="h-5 w-5" />
                    <span>Jelajah</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="intervensi-hibrida" className={`py-3 text-sm md:text-base ${!isAuthenticated ? "opacity-60" : ""}`} title={!isAuthenticated ? "Login diperlukan" : undefined}>
                  <span className="flex flex-col items-center gap-1">
                    <FileText className="h-5 w-5" />
                    <span>Intervensi HN-CBT</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="psikoedukasi" className={`py-3 text-sm md:text-base ${!isAuthenticated ? "opacity-60" : ""}`} title={!isAuthenticated ? "Login diperlukan" : undefined}>
                  <span className="flex flex-col items-center gap-1">
                    <Brain className="h-5 w-5" />
                    <span>Intervensi Psikoedukasi</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Pengantar */}
              <TabsContent value="pengantar" className="space-y-8">
                <div className="text-center mb-6 md:mb-10">
                  <h2 className="text-3xl font-bold mb-3">Selamat Datang di Hibrida Naratif CBT</h2>
                  <p className="text-muted-foreground max-w-3xl mx-auto">
                    Program ini memadukan restrukturisasi kognitif CBT dengan rekonstruksi naratif untuk membantu Anda 
                    mengembangkan perspektif baru yang lebih adaptif dan bermakna.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-5 bg-yellow-50/50 border-red-200">
                    <h3 className="font-semibold mb-1">Apa Program Ini?</h3>
                    <p className="text-sm text-muted-foreground">Intervensi terstruktur 8 sesi menggabungkan naratif & CBT untuk meningkatkan fleksibilitas kognitif.</p>
                  </div>
                  <div className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-1">Bagaimana Alurnya?</h3>
                    <p className="text-sm text-muted-foreground">Setiap sesi memiliki pertemuan daring dan penugasan reflektif & perilaku.</p>
                  </div>
                  <div className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-1">Tujuan Utama</h3>
                    <p className="text-sm text-muted-foreground">Membangun narasi diri yang sehat, mengurangi distorsi, dan meningkatkan regulasi emosi.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <h4 className="font-semibold mb-2">Langkah 1 — Daftar</h4>
                    {!isAuthenticated ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">Login dan daftar untuk mengikuti program.</p>
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700" 
                          onClick={() => navigate('/login?redirect=/hibrida-cbt/pengantar')}
                        >
                          Login & Daftar
                        </Button>
                      </>
                    ) : enrollmentLoading ? (
                      <p className="text-sm text-muted-foreground">Memuat status...</p>
                    ) : (!enrollment || (enrollment.status === 'pending' && !enrollment.enrollmentRequestedAt)) ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">Daftar untuk mengikuti program intervensi.</p>
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700" 
                          onClick={handleRequestEnrollment}
                          disabled={isRequestingEnrollment}
                        >
                          {isRequestingEnrollment ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </Button>
                      </>
                    ) : enrollment?.status === 'pending' ? (
                      <>
                        <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-300">Menunggu Persetujuan</Badge>
                        <p className="text-xs text-muted-foreground">Permintaan Anda sedang diproses admin.</p>
                      </>
                    ) : enrollment?.status === 'approved' ? (
                      <>
                        <Badge className="mb-2 bg-green-100 text-green-800 border-green-300">Terdaftar</Badge>
                        <p className="text-xs text-muted-foreground">Anda telah terdaftar dalam program.</p>
                      </>
                    ) : enrollment?.status === 'rejected' ? (
                      <>
                        <Badge className="mb-2 bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                        <p className="text-xs text-muted-foreground">Hubungi admin untuk informasi lebih lanjut.</p>
                      </>
                    ) : (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Terdaftar</Badge>
                        <p className="text-xs text-muted-foreground">Klik "Daftar Sekarang" untuk mulai mendaftar.</p>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border p-5">
                    <h4 className="font-semibold mb-2">Langkah 2 — Status</h4>
                    {!isAuthenticated || enrollmentLoading ? (
                      <p className="text-sm text-muted-foreground">-</p>
                    ) : enrollment?.status === 'approved' ? (
                      <>
                        <Badge className="mb-2 bg-green-100 text-green-800 border-green-300">Aktif</Badge>
                        <p className="text-xs text-muted-foreground">
                          Aktif untuk: {
                            isSuperAdmin ? 'Super-Admin (Semua Akses)' :
                            enrollment.role === 'grup-int' ? 'Intervensi HN-CBT' :
                            enrollment.role === 'grup-cont' ? 'Intervensi Psikoedukasi' :
                            'Reguler'
                          }
                        </p>
                      </>
                    ) : enrollment?.status === 'pending' ? (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Aktif</Badge>
                        <p className="text-xs text-muted-foreground">Daftar untuk mengaktifkan akses.</p>
                      </>
                    ) : enrollment?.status === 'rejected' ? (
                      <>
                        <Badge className="mb-2 bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                        <p className="text-xs text-muted-foreground">Hubungi admin untuk informasi lebih lanjut.</p>
                      </>
                    ) : (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Aktif</Badge>
                        <p className="text-xs text-muted-foreground">Daftar untuk mengaktifkan akses.</p>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border p-5">
                    <h4 className="font-semibold mb-2">Langkah 3 — Grouping</h4>
                    {!isAuthenticated || enrollmentLoading ? (
                      <p className="text-sm text-muted-foreground">-</p>
                    ) : enrollment?.status === 'approved' && enrollment?.group ? (
                      <>
                        <Badge className="mb-2 bg-purple-100 text-purple-800 border-purple-300">
                          Grup {enrollment.group}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Anda tergabung dalam Grup {enrollment.group}
                        </p>
                      </>
                    ) : enrollment?.status === 'approved' ? (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Dikelompokkan</Badge>
                        <p className="text-xs text-muted-foreground">Grup akan ditentukan oleh admin.</p>
                      </>
                    ) : enrollment?.status === 'rejected' ? (
                      <>
                        <Badge className="mb-2 bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                        <p className="text-xs text-muted-foreground">Hubungi admin untuk informasi lebih lanjut.</p>
                      </>
                    ) : (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Dikelompokkan</Badge>
                        <p className="text-xs text-muted-foreground">Grup akan ditentukan oleh admin.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* IT Contact Section - hanya untuk enrolled users */}
                {canAccessIntervensiHNCBT || canAccessIntervensiPsikoedukasi ? (
                  <div className="mt-8 p-6 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Hubungi IT Support
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Jika Anda mengalami kendala teknis, error, atau masalah akses saat menggunakan layanan ini, 
                      silakan hubungi tim IT kami melalui WhatsApp.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => {
                        const message = encodeURIComponent(
                          'Halo! Saya peserta Layanan Hibrida Naratif CBT. Saya ingin melaporkan error yang muncul saat membuka layanan ini, adapun kronologinya ialah sebagai berikut ............... / berikut saya lampirkan foto screenshootnya [lampirkan screenshoot]'
                        );
                        window.open(`https://wa.me/62881036592711?text=${message}`, '_blank');
                      }}
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Chat via WhatsApp
                    </Button>
                  </div>
                ) : null}
              </TabsContent>

              {/* Jelajah */}
              <TabsContent value="jelajah" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Jelajahi Konsep Inti</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">Dasar teori dan praktik naratif & CBT — materi akan diperluas secara bertahap.</p>
                </div>
                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <img src={jelajahImage} alt="Jelajah Hibrida" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Fondasi Teori & Praktik</h3>
                      <p className="text-white/90">Memahami mengapa naratif & CBT efektif secara sinergis</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jelajahContent.map((item, i) => (
                    <Card key={i} className="group transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="bg-indigo-100 p-3 rounded-lg">
                            <item.icon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="group-hover:text-indigo-600 transition-colors">{item.title}</CardTitle>
                              <Badge variant="secondary" className="bg-indigo-200 text-indigo-900 whitespace-nowrap">Segera Hadir</Badge>
                            </div>
                            <CardDescription className="mt-2">{item.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-gray-200 text-gray-800">Dalam pengembangan</Badge>
                          <Button variant="ghost" size="sm" disabled className="text-indigo-600 disabled:opacity-60">Baca Selengkapnya →</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Intervensi HN-CBT */}
              <TabsContent value="intervensi-hibrida" className="space-y-8">
                <GuardedIntervensi requireRole="grup-int" label="Konten Intervensi HN-CBT hanya untuk peserta terdaftar.">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Intervensi Terstruktur</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">Ikuti 8 sesi bertahap untuk mengubah pola pikir dan membangun narasi diri yang sehat.</p>
                  </div>
                  <div className="relative mb-8 rounded-2xl overflow-hidden">
                    <img src={tasksImage} alt="Intervensi Hibrida" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Portal Intervensi</h3>
                        <p className="text-white/90">Modul naratif + CBT progresif</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {treatmentModules.map((m) => {
                      // Use standardized sequential unlocking function
                      const status = getSessionStatus(m.session);
                      return (
                        <HibridaSessionCard
                          key={m.session}
                          session={m.session}
                          title={m.title}
                          status={status}
                          submissionCount={0}
                          guideDone={progressMap[m.session]?.meetingDone ?? false}
                          assignmentDone={progressMap[m.session]?.assignmentDone ?? false}
                          onNavigate={() => navigate(`/hibrida-cbt/intervensi/sesi/${m.session}`)}
                          showProgressIndicators={true}
                        />
                      );
                    })}
                  </div>
                </GuardedIntervensi>
              </TabsContent>

              {/* Psikoedukasi */}
              <TabsContent value="psikoedukasi" className="space-y-8">
                <GuardedIntervensi requireRole="grup-cont" label="Konten Psikoedukasi hanya untuk peserta terdaftar.">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Psikoedukasi</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">Modul psikoedukasi terstruktur dengan penugasan reflektif untuk memperkuat pemahaman.</p>
                  </div>
                  <div className="relative mb-8 rounded-2xl overflow-hidden">
                    <img src={heroImage} alt="Psikoedukasi" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Portal Psikoedukasi</h3>
                        <p className="text-white/90">Pra-Sesi + 8 sesi: pelajari konsep — lakukan refleksi — terapkan.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {psikoModules.map(pm => {
                      // Use standardized sequential unlocking function
                      const status = getPsikoStatus(pm.session);
                      return (
                        <HibridaSessionCard
                          key={pm.session}
                          session={pm.session}
                          title={pm.title}
                          status={status}
                          submissionCount={0}
                          guideDone={psikoProgress[pm.session]?.meetingDone ?? false}
                          assignmentDone={psikoProgress[pm.session]?.assignmentDone ?? false}
                          onNavigate={() => navigate(`/hibrida-cbt/psikoedukasi/sesi/${pm.session}`)}
                          showProgressIndicators={true}
                        />
                      );
                    })}
                  </div>
                </GuardedIntervensi>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HibridaNaratifCBT;
