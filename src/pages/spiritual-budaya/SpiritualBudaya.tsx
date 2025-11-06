import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Book, FileText, Users, Heart, Home, Brain, Lock } from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSpiritualRole } from "@/hooks/useSpiritualRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import jelajahImage from "@/assets/spiritual-jelajah.jpg";
import tasksImage from "@/assets/spiritual-tasks.jpg";
import { getSiteBaseUrl } from "@/lib/utils";
import { Description } from "@radix-ui/react-toast";
import { sessionConfigs as intervensiSessionConfigs } from "./intervensi/SpiritualIntervensiUnified";
import { sessionConfigs as psikoedukasiSessionConfigs } from "./psikoedukasi/SpiritualPsikoedukasiUnified";
import { SessionCard } from "@/components/spiritual-budaya/SessionCard";

const SpiritualBudaya = () => {
  const { tab } = useParams<{ tab?: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("pengantar");
  const { isAuthenticated, user } = useAuth();
  const { role, group, loading: roleLoading } = useSpiritualRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize tab from URL; allow viewing restricted tabs but overlay when not authenticated
  useEffect(() => {
    const allowedTabs = ["pengantar", "jelajah", "intervensi", "psikoedukasi"] as const;
    const desired = (tab || "pengantar").toLowerCase();
    const isValid = (allowedTabs as readonly string[]).includes(desired);
    if (!isValid) {
      setActiveTab("pengantar");
      return;
    }
    setActiveTab(desired);
  }, [tab]);

  // When tab changes via UI, reflect in URL
  const setTabAndUrl = (val: string) => {
    setActiveTab(val);
    // Only push when the pathname differs to avoid redundant entries
    const targetPath = `/spiritual-budaya/${val}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: false });
    }
  };

  // Guarded wrapper with role-based access control
  const Guarded: React.FC<{ children: React.ReactNode; label?: string; requireRole?: boolean }> = ({ 
    children, 
    label, 
    requireRole = false 
  }) => {
    const hasAccess = requireRole 
      ? (activeTab === 'intervensi' ? canAccessIntervensi : canAccessPsikoedukasi)
      : isAuthenticated;

    if (hasAccess) return <>{children}</>;

    const message = requireRole && isAuthenticated && !hasAccess
      ? "Anda tidak memiliki akses ke konten ini. Silakan hubungi administrator."
      : "Halaman ini hanya bisa diakses untuk user terdaftar.";

    return (
      <div className="relative">
        <div className="relative max-h-[50vh] overflow-hidden pointer-events-none select-none">
          <div className="blur-sm">{children}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/95 dark:from-black/70 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 z-20" aria-live="polite">
          <div className="mx-auto rounded-xl border bg-white/90 dark:bg-black/60 backdrop-blur-md p-4 md:p-5 max-w-xl text-center shadow-lg">
            <p className="mb-2 font-medium">{label || message}</p>
            {!isAuthenticated && (
              <>
                <p className="text-sm text-muted-foreground mb-3">Silakan login untuk membuka konten ini.</p>
                <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => navigate(`/login?redirect=/spiritual-budaya/${activeTab}`)}>
                  Login untuk Mengakses
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Role-based access
  const canAccessIntervensi = isAuthenticated && (role === 'grup-int' || role === 'super-admin');
  const canAccessPsikoedukasi = isAuthenticated && (role === 'grup-cont' || role === 'super-admin');
  const canShowITContact = isAuthenticated && (role === 'grup-int' || role === 'grup-cont' || role === 'super-admin');
  const waUrl = `https://wa.me/62881036592711?text=${encodeURIComponent(
    'Halo! Saya peserta Layanan Spiritual & Budaya. Saya ingin melaporkan error yang muncul saat membuka layanan ini, adapun kronologinya ialah sebagai berikut ............... / berikut saya lampirkan foto screenshootnya [lampirkan screenshoot]'
  )}`;

  // Enrollment state (sb_enrollments)
  const [enrollmentStatus, setEnrollmentStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Intervensi progress state
  const [intervensiProgress, setIntervensiProgress] = useState<Record<number, boolean>>({});
  const [intervensiMeetingDone, setIntervensiMeetingDone] = useState<Record<number, boolean>>({});
  const [intervensiSubmissionCounts, setIntervensiSubmissionCounts] = useState<Record<number, number>>({});
  const [psikoProgress, setPsikoProgress] = useState<Record<number, boolean>>({});
  const [psikoGuideDone, setPsikoGuideDone] = useState<Record<number, boolean>>({});
  const [psikoSubmissionCounts, setPsikoSubmissionCounts] = useState<Record<number, number>>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [adminView, setAdminView] = useState(false);

  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!user?.id) { setEnrollmentStatus(null); return; }
      setEnrollmentLoading(true);
      try {
        const { data, error } = await supabase
          .from('sb_enrollments' as any)
          .select('enrollment_status')
          .eq('user_id', user.id)
          .maybeSingle() as any;
        if (error) throw error;
        setEnrollmentStatus((data?.enrollment_status as any) || null);
      } catch (e) {
        console.error('Load SB enrollment failed', e);
        setEnrollmentStatus(null);
      } finally {
        setEnrollmentLoading(false);
      }
    };
    fetchEnrollment();
  }, [user?.id]);

  // Fetch intervensi progress untuk menentukan status locked/available + meeting status
  useEffect(() => {
    const fetchIntervensiProgress = async () => {
      if (!user?.id || !canAccessIntervensi) {
        setIntervensiProgress({});
        setIntervensiMeetingDone({});
        return;
      }
      setProgressLoading(true);
      try {
        const { data, error } = await supabase
          .from('sb_intervensi_user_progress' as any)
          .select('session_number, assignment_done, meeting_done')
          .eq('user_id', user.id) as any;
        if (error) throw error;
        
        const progressMap: Record<number, boolean> = {};
        const meetingMap: Record<number, boolean> = {};
        if (data) {
          data.forEach((item: any) => {
            progressMap[item.session_number] = item.assignment_done === true;
            meetingMap[item.session_number] = item.meeting_done === true;
          });
        }
        setIntervensiProgress(progressMap);
        setIntervensiMeetingDone(meetingMap);
      } catch (e) {
        console.error('Load intervensi progress failed', e);
        setIntervensiProgress({});
        setIntervensiMeetingDone({});
      } finally {
        setProgressLoading(false);
      }
    };
    fetchIntervensiProgress();
  }, [user?.id, canAccessIntervensi]);

  // Fetch jumlah submission intervensi per sesi
  useEffect(() => {
    const fetchIntervensiSubmissions = async () => {
      if (!user?.id || !canAccessIntervensi) { setIntervensiSubmissionCounts({}); return; }
      try {
        const { data, error } = await supabase
          .from('sb_intervensi_submission_history' as any)
          .select('session_number')
          .eq('user_id', user.id) as any;
        if (error) throw error;
        const counts: Record<number, number> = {};
        (data || []).forEach((row: any) => {
          counts[row.session_number] = (counts[row.session_number] || 0) + 1;
        });
        setIntervensiSubmissionCounts(counts);
      } catch (e) {
        console.error('Load intervensi submissions count failed', e);
        setIntervensiSubmissionCounts({});
      }
    };
    fetchIntervensiSubmissions();
  }, [user?.id, canAccessIntervensi]);

  // Fetch psikoedukasi progress untuk sequential lock + materi status
  useEffect(() => {
    const fetchPsikoProgress = async () => {
      if (!user?.id || !canAccessPsikoedukasi) { setPsikoProgress({}); setPsikoGuideDone({}); return; }
      try {
        const { data, error } = await supabase
          .from('sb_psikoedukasi_user_progress' as any)
          .select('session_number, assignment_done, guide_done')
          .eq('user_id', user.id) as any;
        if (error) throw error;
        const pMap: Record<number, boolean> = {};
        const gMap: Record<number, boolean> = {};
        (data || []).forEach((row: any) => {
          pMap[row.session_number] = row.assignment_done === true;
          gMap[row.session_number] = row.guide_done === true;
        });
        setPsikoProgress(pMap);
        setPsikoGuideDone(gMap);
      } catch (e) {
        console.error('Load psiko progress failed', e);
        setPsikoProgress({});
        setPsikoGuideDone({});
      }
    };
    fetchPsikoProgress();
  }, [user?.id, canAccessPsikoedukasi]);

  // Fetch jumlah submission psiko per sesi
  useEffect(() => {
    const fetchPsikoSubmissions = async () => {
      if (!user?.id || !canAccessPsikoedukasi) { setPsikoSubmissionCounts({}); return; }
      try {
        const { data, error } = await supabase
          .from('sb_psikoedukasi_submission_history' as any)
          .select('session_number')
          .eq('user_id', user.id) as any;
        if (error) throw error;
        const counts: Record<number, number> = {};
        (data || []).forEach((row: any) => {
          counts[row.session_number] = (counts[row.session_number] || 0) + 1;
        });
        setPsikoSubmissionCounts(counts);
      } catch (e) {
        console.error('Load psiko submissions count failed', e);
        setPsikoSubmissionCounts({});
      }
    };
    fetchPsikoSubmissions();
  }, [user?.id, canAccessPsikoedukasi]);

  const handleRequestEnrollment = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/spiritual-budaya/pengantar');
      return;
    }
    setRequesting(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        user_id: user!.id,
        role: 'reguler',
        enrollment_status: 'pending',
        enrollment_requested_at: now,
        updated_at: now,
      } as any;
      const { error } = await supabase
        .from('sb_enrollments' as any)
        .upsert(payload, { onConflict: 'user_id' }) as any;
      if (error) throw error;
      setEnrollmentStatus('pending');
      toast({ title: 'Pendaftaran Dikirim', description: 'Permintaan Anda telah diterima. Mohon tunggu persetujuan admin.' });
    } catch (e) {
      console.error('Request enrollment error', e);
      toast({ title: 'Gagal Mendaftar', description: 'Terjadi kesalahan saat mengirim permintaan.', variant: 'destructive' });
    } finally {
      setRequesting(false);
    }
  };

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
  // meetingSchedule dipindahkan ke halaman portal sesi
  // Determine session status based on progress (Intervensi)
  const getSessionStatus = (sessionNumber: number): "available" | "locked" => {
    if (adminView && role === 'super-admin') return "available";
    // Sesi 0 selalu tersedia (Pra-Sesi)
    if (sessionNumber === 0) return "available";
    // Sesi lainnya tersedia jika sesi sebelumnya sudah selesai (termasuk sesi 1 menunggu sesi 0)
    const prevSessionDone = intervensiProgress[sessionNumber - 1] === true;
    return prevSessionDone ? "available" : "locked";
  };
  */

  // Sequential lock disabled: all sessions available
  const getSessionStatus = (sessionNumber: number): "available" | "locked" => {
    return "available";
  };

  // Generate treatment modules dari sessionConfigs dengan status dinamis (0..8)
  const treatmentModules = intervensiSessionConfigs.map((config, index) => ({
    session: index,
    title: config.title,
    status: getSessionStatus(index)
  }));

  /*
  // Status psiko sequential lock
  const getPsikoStatus = (sessionNumber: number): "available" | "locked" => {
    if (adminView && role === 'super-admin') return "available";
    if (sessionNumber === 0) return "available";
    const prevDone = psikoProgress[sessionNumber - 1] === true;
    return prevDone ? "available" : "locked";
  };
  */

  // Sequential lock disabled: all sessions available
  const getPsikoStatus = (sessionNumber: number): "available" | "locked" => {
    return "available";
  };
  const jelajahContent = [{
    title: "Prinsip Dasar Intervensi Spiritual & Budaya",
    description: "Memahami fondasi teoretis dan praktis dalam mengintegrasikan spiritualitas dan budaya untuk kesehatan mental.",
    icon: Brain,
    articles: 8,
    slug: "prinsip-dasar"
  }, {
    title: "Kearifan Lokal dalam Kesehatan Mental",
    description: "Eksplorasi berbagai tradisi dan kearifan lokal Indonesia yang dapat mendukung kesejahteraan psikologis.",
    icon: Home,
    articles: 12,
    slug: "kearifan-lokal"
  }, {
    title: "Teknik Regulasi Emosi Berbasis Budaya",
    description: "Metode praktis untuk menyeimbangkan emosi dengan pendekatan yang sesuai budaya Indonesia.",
    icon: Heart,
    articles: 15,
    slug: "regulasi-emosi-budaya"
  }, {
    title: "Komunitas dan Dukungan Sosial",
    description: "Peran penting komunitas dalam memberikan dukungan emosional dan spiritual untuk kesehatan mental.",
    icon: Users,
    articles: 10,
    slug: "komunitas-dukungan"
  }];
  const base = getSiteBaseUrl();
  return <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Spiritual & Budaya - Intervensi Digital Berbasis Spiritual & Budaya | Mind MHIRC</title>
        <meta name="description" content="Program intervensi digital berbasis spiritual dan budaya yang selaras dengan nilai kearifan lokal Indonesia untuk mendukung kesehatan jiwa." />
        <link rel="canonical" href={`${base}${activeTab ? `/spiritual-budaya/${activeTab}` : '/spiritual-budaya'}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Spiritual & Budaya | Mind MHIRC" />
        <meta property="og:description" content="Intervensi digital berbasis spiritual dan budaya untuk kesehatan jiwa." />
        <meta property="og:url" content={`${base}${activeTab ? `/spiritual-budaya/${activeTab}` : '/spiritual-budaya'}`} />
        <meta property="og:image" content={`${base}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Spiritual & Budaya | Mind MHIRC" />
        <meta name="twitter:description" content="Intervensi digital berbasis spiritual dan budaya untuk kesehatan jiwa." />
        <meta name="twitter:image" content={`${base}/og-image.png`} />
      </Helmet>

      <Navbar />

  <main className="flex-1 pt-navbar">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-muted/50 to-background overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Spiritual & Budaya Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-16 rounded-xl">
            <div className="max-w-4xl mx-auto text-center fade-in">
              
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Spiritual & Budaya
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Program intervensi digital berbasis spiritual dan budaya yang mengintegrasikan
                nilai-nilai kearifan lokal Indonesia untuk mendukung kesehatan jiwa dan kesejahteraan holistik.
              </p>
              {role === 'super-admin' && (
                <div className="mt-6 md:mt-0 flex items-center justify-center">
                  <div className="inline-flex items-center gap-4 rounded-xl bg-white/95 dark:bg-black/70 border border-amber-200 dark:border-amber-800 px-4 py-2 shadow-md backdrop-blur-sm">
                    <div className="flex flex-col">
                      <Label htmlFor="admin-view-global" className="text-sm font-medium">Pratinjau Peserta</Label>
                      <span className="text-xs text-muted-foreground">Lihat halaman seperti peserta biasa</span>
                    </div>

                    <Switch
                      id="admin-view-global"
                      checked={adminView}
                      onCheckedChange={setAdminView}
                      aria-label="Toggle preview as participant"
                      className={`relative inline-flex h-8 w-16 rounded-full p-1 transition-colors focus:outline-none ${adminView ? 'bg-amber-600 border-orange-700' : 'bg-gray-200 dark:bg-gray-600 border-transparent'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-block h-7 w-7 rounded-full bg-white shadow transition-transform duration-200 ease-in-out transform ${adminView ? 'translate-x-[calc(100%-28px)]' : 'translate-x-0'}`}
                      />
                    </Switch>

                    <span className={`text-sm font-semibold ${adminView ? 'text-amber-700' : 'text-muted-foreground'}`}>
                      {adminView ? 'Pratinjau aktif' : 'Mode admin'}
                    </span>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </section>

        {/* Main Content with Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setTabAndUrl(val)}
              className="max-w-6xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12 gap-2">
                <TabsTrigger value="pengantar" className="py-3 text-sm md:text-base">
                  <span className="flex flex-col sm:flex-col items-center justify-center gap-1 text-center">
                    <Home className="h-5 w-5" />
                    <span>Pengantar</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="jelajah" className="py-3 text-sm md:text-base">
                  <span className="flex flex-col sm:flex-col items-center justify-center gap-1 text-center">
                    <Book className="h-5 w-5" />
                    <span>Eksplor</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="intervensi"
                  className={`py-3 text-sm md:text-base ${!isAuthenticated ? "opacity-60" : ""}`}
                  title={!isAuthenticated ? "Login diperlukan" : undefined}
                >
                  <span className="flex flex-col sm:flex-col items-center justify-center gap-1 text-center">
                    <FileText className="h-5 w-5" />
                    <span>Intervensi</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="psikoedukasi"
                  className={`py-3 text-sm md:text-base ${!isAuthenticated ? "opacity-60" : ""}`}
                  title={!isAuthenticated ? "Login diperlukan" : undefined}
                >
                  <span className="flex flex-col sm:flex-col items-center justify-center gap-1 text-center">
                    <Brain className="h-5 w-5" />
                    <span>Psikoedukasi</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Pengantar Tab */}
              <TabsContent value="pengantar" className="space-y-8">
                <div className="text-center mb-6 md:mb-10">
                  <h2 className="text-3xl font-bold mb-3">Selamat Datang di Spiritual & Budaya</h2>
                  <p className="text-muted-foreground max-w-3xl mx-auto">
                    Program intervensi digital berbasis spiritual dan budaya Indonesia. Di sini Anda dapat mengeksplorasi materi,
                    mengikuti intervensi terstruktur 8 sesi, dan membaca psikoedukasi terkait.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-5 bg-amber-50/50 border-amber-200">
                    <h3 className="font-semibold mb-1">Apa Intervensi Ini?</h3>
                    <p className="text-sm text-muted-foreground">
                      Intervensi memadukan nilai spiritual dan budaya untuk membantu regulasi emosi, membangun harapan, dan
                      memperkuat dukungan sosial.
                    </p>
                  </div>
                  <div className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-1">Bagaimana Alurnya?</h3>
                    <p className="text-sm text-muted-foreground">
                      Terdiri dari 8 sesi. Setiap sesi memiliki Pertemuan Daring dan Penugasan. Selesaikan berurutan untuk hasil optimal.
                    </p>
                  </div>
                  <div className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-1">Siapa yang Cocok?</h3>
                    <p className="text-sm text-muted-foreground">
                      Cocok bagi siapa pun yang mencari pendekatan ringan, humanis, dan relevan dengan konteks lokal Indonesia.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-5 bg-gradient-to-br from-amber-50 to-orange-50">
                    <h4 className="font-semibold mb-2">Langkah 1 — Daftar</h4>
                    {!isAuthenticated ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">Login dan daftar untuk mengikuti program.</p>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => navigate('/login?redirect=/spiritual-budaya/pengantar')}>
                          Login & Daftar
                        </Button>
                      </>
                    ) : enrollmentLoading ? (
                      <p className="text-sm text-muted-foreground">Memuat status...</p>
                    ) : enrollmentStatus === 'pending' ? (
                      <>
                        <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-300">Menunggu Persetujuan</Badge>
                        <p className="text-xs text-muted-foreground">Permintaan Anda sedang diproses admin.</p>
                      </>
                    ) : enrollmentStatus === 'approved' ? (
                      <>
                        <Badge className="mb-2 bg-green-100 text-green-800 border-green-300">Terdaftar</Badge>
                        <p className="text-xs text-muted-foreground">Akses aktif. Silakan lanjut ke tab Intervensi.</p>
                      </>
                    ) : enrollmentStatus === 'rejected' ? (
                      <>
                        <Badge className="mb-2 bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                        <p className="text-xs text-muted-foreground">Hubungi admin untuk informasi lebih lanjut.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">Ajukan pendaftaran untuk mengaktifkan akses.</p>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleRequestEnrollment} disabled={requesting}>
                          {requesting ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border p-5">
                    <h4 className="font-semibold mb-2">Status Akses</h4>
                    {(!isAuthenticated || enrollmentLoading) ? (
                      <p className="text-sm text-muted-foreground">-</p>
                    ) : enrollmentStatus === 'approved' ? (
                      <>
                        <Badge className="mb-2 bg-green-100 text-green-800 border-green-300">Aktif</Badge>
                        <p className="text-xs text-muted-foreground">Akses aktif untuk program Spiritual & Budaya.</p>
                      </>
                    ) : enrollmentStatus === 'pending' ? (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Aktif</Badge>
                        <p className="text-xs text-muted-foreground">Menunggu persetujuan admin.</p>
                      </>
                    ) : enrollmentStatus === 'rejected' ? (
                      <>
                        <Badge className="mb-2 bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                        <p className="text-xs text-muted-foreground">Hubungi admin untuk informasi lebih lanjut.</p>
                      </>
                    ) : (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Aktif</Badge>
                        <p className="text-xs text-muted-foreground">Ajukan pendaftaran untuk mengaktifkan.</p>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border p-5">
                    <h4 className="font-semibold mb-2">Grouping</h4>
                    {(!isAuthenticated || roleLoading) ? (
                      <p className="text-sm text-muted-foreground">-</p>
                    ) : role === 'super-admin' ? (
                      <>
                        <Badge className="mb-2 bg-purple-100 text-purple-800 border-purple-300">Super-Admin</Badge>
                        <p className="text-xs text-muted-foreground">Akses penuh.</p>
                      </>
                    ) : group ? (
                      <>
                        <Badge className="mb-2 bg-purple-100 text-purple-800 border-purple-300">Grup {group}</Badge>
                        <p className="text-xs text-muted-foreground">Anda tergabung dalam Grup {group}.</p>
                      </>
                    ) : (
                      <>
                        <Badge className="mb-2 bg-gray-100 text-gray-800 border-gray-300">Belum Dikelompokkan</Badge>
                        <p className="text-xs text-muted-foreground">Grup akan ditentukan admin.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Trial notice + WhatsApp IT contact (roles: grup-cont, grup-int, super-admin) */}
                {canShowITContact && (
                  <div className="rounded-xl border p-5 bg-green-50/70 border-green-200">
                  <p className="text-sm text-gray-800 mb-3">
                    Layanan ini sedang dalam masa uji coba, jika kamu menemukan error harap hubungi kami.
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(waUrl, '_blank')}
                    >
                    Hubungi Tim IT via WhatsApp
                    </Button>
                    <div className="text-xs text-muted-foreground">
                    Saat menghubungi, jelaskan kronologi masalah dan lampirkan screenshot untuk mempermudah pemeriksaan.
                    </div>
                  </div>
                  </div>
                )}
              </TabsContent>

              {/* Jelajah Tab */}
              <TabsContent value="jelajah" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Jelajahi Materi Spiritual & Budaya</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Temukan berbagai materi dan pengetahuan seputar intervensi kesehatan mental 
                    yang berbasis spiritual dan budaya Indonesia.
                  </p>
                </div>

                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <img src={jelajahImage} alt="Spiritual Jelajah" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Kearifan Lokal untuk Kesehatan Mental</h3>
                      <p className="text-white/90">Menggali tradisi dan nilai-nilai budaya Indonesia untuk kesejahteraan psikologis</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jelajahContent.map((item, index) => (
                    <Card key={index} className="group transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="bg-amber-100 p-3 rounded-lg">
                            <item.icon className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="group-hover:text-amber-600 transition-colors">
                                {item.title}
                              </CardTitle>
                              <Badge variant="secondary" className="bg-amber-200 text-amber-900 whitespace-nowrap">Segera Hadir</Badge>
                            </div>
                            <CardDescription className="mt-2">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-gray-200 text-gray-800">Materi dalam pengembangan</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="text-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Baca Selengkapnya →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Intervensi Tab */}
              <TabsContent value="intervensi" className="space-y-8">
                <Guarded label="Konten Intervensi hanya tersedia bagi peserta grup intervensi." requireRole={true}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-2">Intervensi & Treatment Modules</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Serangkaian intervensi dan latihan terstruktur untuk membantu Anda menerapkan 
                    prinsip-prinsip spiritual dan budaya dalam kehidupan sehari-hari.
                  </p>
                  {false && role === 'super-admin' && (
                    <div />
                  )}
                </div>

                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <img src={tasksImage} alt="Spiritual Intervensi" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Portal Intervensi Terstruktur</h3>
                      <p className="text-white/90">Pra-Sesi + 8 sesi treatment module untuk perjalanan penyembuhan holistik</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {treatmentModules.map((module, index) => (
                    <SessionCard
                      key={index}
                      session={module.session}
                      title={module.title}
                      status={module.status}
                      submissionCount={intervensiSubmissionCounts[module.session] || 0}
                      guideDone={intervensiMeetingDone[module.session]}
                      assignmentDone={intervensiProgress[module.session]}
                      onNavigate={() => navigate(`/spiritual-budaya/intervensi/sesi/${module.session}`)}
                      showProgressIndicators={true}
                    />
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold mb-4">Panduan Penggunaan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="text-center">
                          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                          <p><strong>Mulai Berurutan</strong><br />Ikuti sesi sesuai urutan untuk hasil optimal</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                          <p><strong>Konsisten</strong><br />Lakukan latihan secara rutin sesuai jadwal</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                          <p><strong>Refleksi</strong><br />Luangkan waktu untuk merefleksikan setiap sesi</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </Guarded>
              </TabsContent>

              {/* Psikoedukasi Tab */}
              <TabsContent value="psikoedukasi" className="space-y-8">
                <Guarded label="Konten Psikoedukasi hanya tersedia bagi peserta grup psikoedukasi." requireRole={true}>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-2">Psikoedukasi</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      8 Sesi psikoedukasi terstruktur dengan penugasan reflektif untuk memperkuat pemahaman spiritual-budaya.
                    </p>
                    {false && role === 'super-admin' && (
                      <div />
                    )}
                  </div>
                  <div className="relative mb-8 rounded-2xl overflow-hidden">
                    <img src={heroImage} alt="Psikoedukasi" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Portal Psikoedukasi</h3>
                        <p className="text-white/90">Pra-Sesi + 8 sesi: pelajari konsep — refleksi — terapkan.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {psikoedukasiSessionConfigs.map((cfg, session) => {
                      const title = cfg.title;
                      const status = getPsikoStatus(session);
                      return (
                        <SessionCard
                          key={session}
                          session={session}
                          title={title}
                          status={status}
                          submissionCount={psikoSubmissionCounts[session] || 0}
                          guideDone={psikoGuideDone[session]}
                          assignmentDone={psikoProgress[session]}
                          onNavigate={() => navigate(`/spiritual-budaya/psikoedukasi/sesi/${session}`)}
                          showProgressIndicators={true}
                        />
                      );
                    })}
                  </div>
                </Guarded>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};

export default SpiritualBudaya;
