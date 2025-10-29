import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Home, Book, FileText, Brain } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useHibridaRole } from "@/hooks/useHibridaRole";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/spiritual-cultural-hero.jpg"; // Placeholder reuse
import jelajahImage from "@/assets/spiritual-jelajah.jpg"; // Placeholder reuse
import tasksImage from "@/assets/spiritual-tasks.jpg"; // Placeholder reuse
import { getSiteBaseUrl } from "@/lib/utils";

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

  // Initialize tab (support route /hibrida-cbt/:tab)
  useEffect(() => {
    const allowed = ["pengantar", "jelajah", "intervensi-hibrida", "psikoedukasi"] as const;
    const desired = (tab || "pengantar").toLowerCase();
    if ((allowed as readonly string[]).includes(desired)) {
      setActiveTab(desired);
    } else {
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
  const [adminModeEnabled, setAdminModeEnabled] = useState(true);
  // Persist admin preview toggle so admin can switch mode easily
  useEffect(() => {
    if (!rawIsAdmin) return;
    try {
      const saved = localStorage.getItem("hibridaAdminModeEnabled");
      if (saved !== null) setAdminModeEnabled(saved === "true");
    } catch {}
  }, [rawIsAdmin]);
  useEffect(() => {
    if (rawIsAdmin) {
      try { localStorage.setItem("hibridaAdminModeEnabled", String(adminModeEnabled)); } catch {}
    }
  }, [adminModeEnabled, rawIsAdmin]);
  // Effective admin gating (if toggle off, behave as participant)
  const isAdmin = rawIsAdmin && adminModeEnabled;

  const jelajahContent = [
    { title: "Dasar Naratif Therapy", description: "Konsep inti terapi naratif dalam membingkai ulang cerita diri.", icon: Book, articles: 6, slug: "dasar-naratif" },
    { title: "Konsep CBT Inti", description: "Hubungan pikiran, emosi, dan perilaku dalam CBT modern.", icon: Brain, articles: 10, slug: "konsep-cbt" },
    { title: "Teknik Restrukturisasi", description: "Langkah-langkah praktis mengubah distorsi kognitif.", icon: FileText, articles: 8, slug: "restrukturisasi" },
    { title: "Eksperimen Perilaku", description: "Menguji asumsi melalui tindakan terukur dan refleksi.", icon: FileText, articles: 7, slug: "eksperimen-perilaku" }
  ];

  // Psikoedukasi modules list (skeleton) – can expand; all available for now
  const psikoModules = [
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
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-indigo-50 to-background dark:from-indigo-900/20 overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Hibrida Naratif CBT" className="w-full h-full object-cover" />
          </div>
            <div className="relative container mx-auto px-6 py-16 rounded-xl">
              <div className="max-w-4xl mx-auto text-center fade-in">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Hibrida Naratif CBT
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Program intervensi digital yang menggabungkan kekuatan terapi naratif dan CBT untuk membantu Anda
                  membingkai ulang pengalaman, mengelola pikiran otomatis, dan membangun ketahanan emosional.
                </p>
                {rawIsAdmin && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-wrap items-center gap-3 rounded-full bg-amber-50 border border-amber-300 px-4 py-1.5 shadow-sm">
                      <span className="text-xs font-semibold text-amber-700 tracking-wide">ADMIN PREVIEW</span>
                      <button
                        type="button"
                        onClick={() => setAdminModeEnabled(v => !v)}
                        className={`text-xs font-medium px-3 py-1 rounded-full transition-colors border ${adminModeEnabled ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-500' : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'}`}
                        aria-pressed={adminModeEnabled}
                      >
                        {adminModeEnabled ? 'Mode Admin Aktif' : 'Mode Peserta' }
                      </button>
                      <span className="text-[11px] text-amber-700 hidden md:inline">
                        {adminModeEnabled ? 'Menampilkan semua sesi' : 'Pratinjau tampilan peserta'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-600">Toggle untuk melihat perbedaan gating sesi tanpa keluar akun.</p>
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
                    <div className="absolute inset-0 bg-gradient-to-t from_black/60 to-transparent flex items-end">
                      <div className="p-8 text_white">
                        <h3 className="text-2xl font-bold mb-2">Portal Intervensi</h3>
                        <p className="text-white/90">Modul naratif + CBT progresif</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {treatmentModules.map((m) => {
                      // Sequential unlocking: session 1 always available; session n requires previous meeting & assignment done
                      const previousCompleted = m.session === 1 ? true : !!(progressMap[m.session - 1]?.meetingDone && progressMap[m.session - 1]?.assignmentDone);
                      const available = isAdmin ? true : previousCompleted;
                      return (
                        <Card
                          key={m.session}
                          className={`group transition-all ${available ? 'hover:shadow-lg border-indigo-200 bg-indigo-50/50' : 'opacity-60 bg-muted/30'}`}
                          title={!available ? 'Sesi akan terbuka setelah sesi sebelumnya selesai' : undefined}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${available ? 'bg-indigo-600' : 'bg-muted'}`}>{m.session}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">Sesi {m.session}: {m.title}</h3>
                                  <Badge variant={available ? 'default' : 'secondary'} className="whitespace-nowrap">{available ? 'Tersedia' : 'Terkunci'}</Badge>
                                </div>
                                <p className="text-muted-foreground mb-3">{m.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Durasi: {m.duration}</span>
                                  <Button
                                    variant={available ? 'default' : 'secondary'}
                                    disabled={!available}
                                    className={available ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                                    onClick={() => available && navigate(`/hibrida-cbt/intervensi/sesi/${m.session}`)}
                                  >
                                    {available ? 'Mulai Sesi' : 'Terkunci'}
                                  </Button>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="rounded-lg border bg-background p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">Pertemuan Daring</p>
                                        <p className="text-xs text-muted-foreground">Diskusi & eksplor naratif</p>
                                      </div>
                                      <Badge className={progressMap[m.session]?.meetingDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-900'}>
                                        {progressMap[m.session]?.meetingDone ? 'Selesai' : 'Belum'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="rounded-lg border bg-background p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">Penugasan</p>
                                        <p className="text-xs text-muted-foreground">Refleksi & eksperimen</p>
                                      </div>
                                      <Badge className={progressMap[m.session]?.assignmentDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-900'}>
                                        {progressMap[m.session]?.assignmentDone ? 'Selesai' : 'Belum'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                        <p className="text-white/90">Pelajari konsep — lakukan refleksi — terapkan.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {psikoModules.map(pm => {
                      const done = !!psikoProgress[pm.session]?.assignmentDone;
                      const futureModule = pm.session > 8; // semua sesi 1–8 tersedia
                      // Untuk saat ini, sesi psikoedukasi 1–8 dapat dibuka tanpa penguncian berantai
                      const available = isAdmin ? !futureModule : !futureModule;
                      const lockedByProgress = !available && !futureModule; // terkunci karena urutan (bukan karena future)
                      const displayTitle = futureModule ? 'Segera' : pm.title;
                      const route = `/hibrida-cbt/psikoedukasi/sesi/${pm.session}`;
                      return (
                        <Card
                          key={pm.session}
                          className={`group transition-all ${available ? 'hover:shadow-lg border-indigo-200 bg-indigo-50/40' : 'opacity-60 bg-muted/30'} `}
                          title={futureModule ? 'Segera hadir' : lockedByProgress ? 'Sesi akan terbuka setelah sesi sebelumnya selesai (Pertemuan & Penugasan)' : undefined}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${done ? 'bg-green-600' : 'bg-indigo-600'}`}>{pm.session}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                  <h3 className="font-semibold text-lg">Sesi {pm.session}: {displayTitle}</h3>
                                  {futureModule ? (
                                    <Badge className="bg-amber-200 text-amber-900">Segera</Badge>
                                  ) : (
                                    <Badge className={done ? 'bg-green-600 text-white' : available ? 'bg-indigo-200 text-indigo-900' : 'bg-gray-300 text-gray-800'}>{done ? 'Selesai' : available ? 'Belum' : 'Terkunci'}</Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-3 text-sm">{futureModule ? 'Modul psikoedukasi ini akan tersedia selanjutnya.' : pm.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Penugasan reflektif</span>
                                  <Button
                                    className={`bg-indigo-600 hover:bg-indigo-700 ${!available ? 'opacity-80' : ''}`}
                                    disabled={!available}
                                    onClick={() => available && navigate(route)}
                                  >
                                    {futureModule ? 'Segera' : available ? 'Buka Sesi' : 'Terkunci'}
                                  </Button>
                                </div>
                                {lockedByProgress && (
                                  <div className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">Selesaikan sesi sebelumnya (Pertemuan & Penugasan) untuk membuka.</div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
