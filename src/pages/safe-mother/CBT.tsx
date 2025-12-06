import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  Brain,
  CheckCircle,
  Clock,
  Calendar,
  Target,
  Award,
  Heart,
  Play,
  ArrowLeft,
  Lock,
  Loader2,
  Video,
  MessagesSquare
} from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext"; // Asumsi path context yang benar
import { supabase } from "@/integrations/supabase/client";

// --- Definisi Tipe Data ---
interface CbtTask {
  id: string;
  prompt: string;
}

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
  professionalComment: string | null; // <-- BARU: Field untuk komentar profesional
}

interface Achievement {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  unlocked: boolean;
}

interface UserAnswers {
  [moduleId: number]: {
    [taskId: string]: string;
  };
}

// --- Data Master Modul (M-LIPI Structure) ---
const masterModules: Omit<
  CbtModule,
  "status" | "progress" | "professionalComment"
>[] = [
  // 1. Orientasi (Zoom)
  {
    id: 1,
    title: "Orientasi: Pengenalan Program",
    description:
      "Sesi pertemuan awal untuk mengenal program M-LIPI, mentor, dan sesama peserta. Membahas tujuan dan harapan selama program berlangsung.",
    duration: "60 menit",
    tasks: [],
    objectives: [
      "Memahami struktur dan tujuan program M-LIPI",
      "Mengenal mentor dan peserta lain",
      "Menetapkan komitmen awal"
    ],
    type: "zoom",
    zoomLink: "https://zoom.us/j/orientation" // Placeholder
  },
  // 2. Sesi 1 (Task)
  {
    id: 2,
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
  // 3. Sesi 2 (Task)
  {
    id: 3,
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
  // 4. Sesi 3 (Task)
  {
    id: 4,
    title: "Sesi 3: Reset dan Aktifkan",
    description:
      "Fokus pada strategi dasar untuk menenangkan tubuh (tidur, makan, relaksasi) dan mengaktifkan kembali rutinitas harian.",
    duration: "55 menit",
    tasks: [
      {
        id: "3-1",
        prompt:
          "Isi mood check-in harian Anda dan berikan skala 0-10 untuk suasana hati Anda hari ini."
      },
      {
        id: "3-2",
        prompt:
          "Tuliskan 1 kebiasaan terkait tidur yang ingin Anda ubah minggu ini (Contoh: tidak melihat layar 1 jam sebelum tidur)."
      },
      {
        id: "3-3",
        prompt:
          "Tuliskan 2 opsi makanan cepat-sehat yang realistis untuk Anda siapkan."
      },
      {
        id: "3-4",
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
  // 5. Evaluasi (Zoom)
  {
    id: 5,
    title: "Evaluasi: Review Pertengahan",
    description:
      "Sesi pertemuan untuk mengevaluasi kemajuan setelah 3 sesi penugasan. Diskusi hambatan dan strategi untuk sesi selanjutnya.",
    duration: "60 menit",
    tasks: [],
    objectives: [
      "Mengevaluasi pemahaman materi sesi 1-3",
      "Mendiskusikan hambatan yang ditemui",
      "Menyesuaikan strategi belajar"
    ],
    type: "zoom",
    zoomLink: "https://zoom.us/j/evaluation" // Placeholder
  },
  // 6. Sesi 4 (Task)
  {
    id: 6,
    title: "Sesi 4: Pikiran VS Khawatir dan Dukungan",
    description:
      "Melatih cara mengenali pikiran negatif, mengelola kekhawatiran dengan teknik 'worry time', dan memperkuat dukungan sosial.",
    duration: "60 menit",
    tasks: [
      {
        id: "4-1",
        prompt:
          "Tuliskan 1 pikiran otomatis yang sering muncul dan 2 bukti yang menentangnya."
      },
      {
        id: "4-2",
        prompt:
          "Bedakan antara masalah nyata dan kekhawatiran hipotesis menggunakan Pohon Khawatir."
      },
      {
        id: "4-3",
        prompt:
          "Tentukan jadwal 'Waktu Khawatir' Anda setiap hari (Contoh: Pukul 17:00 selama 20 menit)."
      },
      {
        id: "4-4",
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
  // 7. Sesi 5 (Task)
  {
    id: 7,
    title: "Sesi 5: Rencana Jangka Panjang",
    description:
      "Merangkum semua yang telah dipelajari dan membuat rencana pencegahan kekambuhan serta pemeliharaan kesehatan mental jangka panjang.",
    duration: "60 menit",
    tasks: [
      {
        id: "5-1",
        prompt:
          "Identifikasi tanda-tanda peringatan dini (early warning signs) jika kondisi Anda mulai menurun kembali."
      },
      {
        id: "5-2",
        prompt:
          "Buat daftar strategi coping yang paling efektif bagi Anda selama program ini."
      },
      {
        id: "5-3",
        prompt:
          "Tuliskan surat untuk diri Anda di masa depan sebagai pengingat kekuatan dan pencapaian Anda."
      }
    ],
    objectives: [
      "Mengidentifikasi tanda peringatan dini",
      "Menyusun kotak peralatan (toolbox) strategi coping",
      "Membuat rencana pemeliharaan jangka panjang"
    ],
    type: "cbt"
  },
  // 8. Tindak Lanjut (Zoom)
  {
    id: 8,
    title: "Tindak Lanjut: Penutupan Program",
    description:
      "Sesi pertemuan akhir untuk merayakan pencapaian, membahas rencana jangka panjang, dan menutup program secara resmi.",
    duration: "60 menit",
    tasks: [],
    objectives: [
      "Merayakan kelulusan program",
      "Finalisasi rencana jangka panjang",
      "Penutupan dan umpan balik akhir"
    ],
    type: "zoom",
    zoomLink: "https://zoom.us/j/followup" // Placeholder
  }
];

const initialAchievements: Achievement[] = [
  {
    id: "first_module",
    icon: Award,
    title: "Langkah Pertama",
    description: "Menyelesaikan modul pertama dengan sukses!",
    unlocked: false
  },
  {
    id: "halfway",
    icon: Target,
    title: "Setengah Jalan",
    description: "Menyelesaikan 3 dari 5 modul M-LIPI inti.",
    unlocked: false
  },
  {
    id: "master",
    icon: Brain,
    title: "M-LIPI Master",
    description:
      "Menyelesaikan seluruh 8 langkah program M-LIPI!",
    unlocked: false
  }
];

const CBT = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [modules, setModules] = useState<CbtModule[]>([]);
  const [achievements, setAchievements] =
    useState<Achievement[]>(initialAchievements);
  const [activeModuleDetail, setActiveModuleDetail] =
    useState<CbtModule | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // [DB] Fetch user progress and merge with master data
  const loadUserProgress = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data: progressData, error } = await supabase
        .from("cbt_user_progress")
        .select("status, progress, professional_comment, module_id") // <-- PERUBAHAN: Tambah professional_comment
        .eq("user_id", user.id);

      if (error) throw error;

      const mergedModules = masterModules.map((masterModule) => {
        const userProgress = progressData.find(
          (p) => p.module_id === masterModule.id
        );

        return {
          ...masterModule,
          status:
            userProgress?.status ||
            (masterModule.id === 1 ? "available" : "locked"),
          progress: userProgress?.progress || 0,
          professionalComment: userProgress?.professional_comment || null // <-- PERUBAHAN: Simpan komentar
        } as CbtModule;
      });

      // Pastikan modul pertama 'available' jika belum ada progress sama sekali
      if (progressData.length === 0 && mergedModules.length > 0) {
        mergedModules[0].status = "available";
      }

      setModules(mergedModules);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      toast.error("Gagal memuat progres Anda. Menampilkan modul default.");

      // Fallback: Tampilkan modul master dengan status default
      const defaultModules = masterModules.map((m) => ({
        ...m,
        status: m.id === 1 ? "available" : "locked",
        progress: 0,
        professionalComment: null
      } as CbtModule));

      setModules(defaultModules);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadUserProgress();
    }
  }, [authLoading, loadUserProgress]);

  // [DB] Handle module start: either load tasks or open Zoom link
  const handleStartModule = async (moduleId: number) => {
    const moduleToStart = modules.find((m) => m.id === moduleId);
    if (!moduleToStart || moduleToStart.status === "locked" || !user) return;

    // --- LOGIKA UNTUK MODUL VIRTUAL ---
    if (moduleToStart.type === "zoom" && moduleToStart.zoomLink) {
      setIsSaving(true);
      try {
        // Tandai modul zoom sebagai 'completed' di DB segera
        await supabase.from("cbt_user_progress").upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            status: "completed",
            progress: 100
          },
          { onConflict: "user_id,module_id" }
        );

        // Unlock next module (jika ada)
        const nextModuleId = moduleId + 1;
        if (nextModuleId <= masterModules.length) {
          await supabase.from("cbt_user_progress").upsert(
            {
              user_id: user.id,
              module_id: nextModuleId,
              status: "available",
              progress: 0
            },
            { onConflict: "user_id,module_id" }
          );
        }

        toast.success(
          `Selamat! Sesi ${moduleToStart.title} telah dibuka dan ditandai selesai. Silakan bergabung!`
        );
        // Buka link Zoom di tab baru
        window.open(moduleToStart.zoomLink, "_blank");
        await loadUserProgress(); // Reload untuk update status
      } catch (error) {
        toast.error("Terjadi kesalahan saat memulai sesi Zoom.");
        console.error("Error starting zoom module:", error);
      } finally {
        setIsSaving(false);
      }
      return; // Hentikan alur untuk modul Zoom
    }
    // --- AKHIR LOGIKA UNTUK MODUL VIRTUAL ---

    // Logika untuk modul CBT biasa (dengan tugas)
    try {
      const { data: answersData, error } = await supabase
        .from("cbt_user_answers")
        .select("task_id, answer")
        .eq("user_id", user.id)
        .eq("module_id", moduleId);

      if (error) throw error;

      const existingAnswers = answersData.reduce((acc, current) => {
        acc[current.task_id] = current.answer || "";
        return acc;
      }, {} as { [taskId: string]: string });

      setUserAnswers((prev) => ({ ...prev, [moduleId]: existingAnswers }));
    } catch (error) {
      toast.error("Gagal memuat jawaban Anda sebelumnya.");
      console.error("Error fetching answers:", error);
    }
    setActiveModuleDetail(moduleToStart);
  };

  const handleGoBack = () => setActiveModuleDetail(null);

  const handleAnswerChange = (
    moduleId: number,
    taskId: string,
    value: string
  ) => {
    setUserAnswers((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [taskId]: value }
    }));
  };

  // [DB] Save answers and progress to Supabase
  const handleCompleteModule = async (moduleId: number) => {
    if (!user || !activeModuleDetail || activeModuleDetail.type === "zoom")
      return; // Hanya proses modul CBT

    const currentModuleTasks = activeModuleDetail.tasks;
    const currentAnswers = userAnswers[moduleId];
    if (currentModuleTasks.some((task) => !currentAnswers?.[task.id]?.trim())) {
      toast.error("Harap isi semua tugas sebelum menyelesaikan modul.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save answers
      const answersToUpsert = currentModuleTasks.map((task) => ({
        user_id: user.id,
        module_id: moduleId,
        task_id: task.id,
        answer: currentAnswers[task.id]
      }));

      const { error: answerError } = await supabase
        .from("cbt_user_answers")
        .upsert(answersToUpsert, { onConflict: "user_id,module_id,task_id" });

      if (answerError) throw answerError;

      // 2. Update current module progress
      const { error: progressError } = await supabase
        .from("cbt_user_progress")
        .upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            status: "completed",
            progress: 100
          },
          { onConflict: "user_id,module_id" }
        );
      if (progressError) throw progressError;

      // 3. Unlock next module
      const nextModuleId = moduleId + 1;
      if (nextModuleId <= masterModules.length) {
        const { error: unlockError } = await supabase
          .from("cbt_user_progress")
          .upsert(
            {
              user_id: user.id,
              module_id: nextModuleId,
              status: "available",
              progress: 0
            },
            { onConflict: "user_id,module_id" }
          );
        if (unlockError) throw unlockError;
      }

      toast.success(
        `Selamat! Anda telah menyelesaikan ${activeModuleDetail.title}. Modul berikutnya telah dibuka.`
      );

      setActiveModuleDetail(null);
      await loadUserProgress(); // Reload progress from DB
    } catch (error) {
      console.error("Error completing module:", error);
      toast.error("Terjadi kesalahan saat menyimpan progres Anda.");
    } finally {
      setIsSaving(false);
    }
  };

  const cbtModulesCompleted = modules.filter(
    (m) => m.status === "completed" && m.type === "cbt"
  ).length;

  const totalModulesCompleted = modules.filter(
    (m) => m.status === "completed"
  ).length;
  const totalModules = modules.length;
  const achievementsUnlocked = achievements.filter((a) => a.unlocked).length;

  useEffect(() => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === "first_module" && totalModulesCompleted >= 1)
          return { ...ach, unlocked: true };
        // Setengah jalan (3 dari 5 CBT Modules)
        if (ach.id === "halfway" && cbtModulesCompleted >= 3)
          return { ...ach, unlocked: true };
        // Master (Selesai semua 8 modul)
        if (ach.id === "master" && totalModulesCompleted >= totalModules)
          return { ...ach, unlocked: true };
        return ach;
      })
    );
  }, [totalModulesCompleted, cbtModulesCompleted, totalModules]);

  // --- Helper Functions (No change) ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200";
      case "locked":
        return "bg-gray-100 text-gray-500 border-gray-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Tersedia";
      case "locked":
        return "Terkunci";
      case "completed":
        return "Selesai";
      default:
        return "Tidak Tersedia";
    }
  };

  // --- RENDER LOGIC (Detail Modul CBT) ---

  if (activeModuleDetail && activeModuleDetail.type === "cbt") {
    const hasComment =
      activeModuleDetail.status === "completed" &&
      activeModuleDetail.professionalComment;

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 font-sans selection:bg-pink-100 selection:text-pink-900">
        <Helmet>
          <title>{activeModuleDetail.title} - Safe Mother</title>
        </Helmet>
        <SafeMotherNavbar />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="mb-6 hover:bg-white/50"
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Modul
            </Button>
            {hasComment && (
              <Card className="mb-8 border-l-4 border-purple-500 bg-purple-50/50 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center space-x-3 p-6 pb-2">
                  <MessagesSquare className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <CardTitle className="text-xl font-semibold text-purple-800">
                    Umpan Balik Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {activeModuleDetail.professionalComment}
                  </p>
                </CardContent>
              </Card>
            )}
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-white/50 rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {activeModuleDetail.title}
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {activeModuleDetail.description}
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {activeModuleDetail.tasks.map((task, index) => (
                  <div key={task.id} className="bg-white/50 rounded-2xl p-6 border border-white/50 shadow-sm">
                    <label
                      htmlFor={task.id}
                      className="font-bold text-gray-900 block mb-4 text-lg"
                    >
                      Tugas {index + 1}: {task.prompt}
                    </label>
                    <Textarea
                      id={task.id}
                      placeholder="Tuliskan jawaban Anda di sini..."
                      className="min-h-[150px] bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl text-base leading-relaxed resize-none"
                      value={
                        userAnswers[activeModuleDetail.id]?.[task.id] || ""
                      }
                      onChange={(e) =>
                        handleAnswerChange(
                          activeModuleDetail.id,
                          task.id,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button
                  onClick={() => handleCompleteModule(activeModuleDetail.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {isSaving ? "Menyimpan..." : "Selesaikan & Simpan Modul"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- RENDER LOGIC (Dashboard) ---

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 font-sans selection:bg-pink-100 selection:text-pink-900">
      <Helmet>
        <title>Program M-LIPI - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Program M-LIPI (Modifikasi Langkah Intervensi Psikologis Ibu) khusus untuk ibu dengan berbagai modul terstruktur untuk mendukung kesehatan mental maternal."
        />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md rounded-full px-6 py-2 mb-8 shadow-sm border border-white/50 animate-fade-in">
              <Brain className="w-4 h-4 text-purple-500 fill-purple-500" />
              <span className="text-purple-800 font-medium text-sm">M-LIPI Program</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
              Pikiran Sehat, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Hati Tenang
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Program M-LIPI terstruktur 8 langkah yang dirancang khusus untuk membantu Anda mengelola emosi dan pikiran selama masa keibuan.
            </p>

            {/* Progress Overview - Floating */}
            <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Progress Perjalanan Anda</h2>
                <div className="text-sm font-medium text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100">
                  {((totalModulesCompleted / totalModules) * 100).toFixed(0)}% Selesai
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(totalModulesCompleted / totalModules) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {totalModulesCompleted}/{totalModules}
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Modul</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {cbtModulesCompleted}/5
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tugas Inti</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {achievementsUnlocked}
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pencapaian</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {totalModulesCompleted >= 3 ? "Aktif" : "-"}
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-16">
          {/* Modules Timeline */}
          <div className="relative mb-20">
            {/* Vertical Line for Desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>

            <div className="space-y-12">
              {modules.map((module, index) => {
                const isZoom = module.type === "zoom";
                const hasProfessionalComment = module.status === "completed" && module.professionalComment;
                const isLeft = index % 2 === 0;

                return (
                  <div key={module.id} className={`relative flex items-center ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:gap-16 gap-6`}>
                    
                    {/* Timeline Dot */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-md items-center justify-center z-10 bg-gray-200">
                      <div className={`w-3 h-3 rounded-full ${
                        module.status === "completed" ? "bg-green-500" : 
                        module.status === "available" ? "bg-blue-500" : "bg-gray-400"
                      }`}></div>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 w-full ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
                      <div className={`bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/50 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1 ${
                        module.status === "locked" ? "opacity-70 grayscale" : 
                        isZoom ? "ring-1 ring-purple-200" : "hover:border-purple-200"
                      }`}>
                        <div className={`flex items-center gap-4 mb-4 ${isLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                            module.status === "available"
                              ? isZoom ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                              : module.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {isZoom ? <Video className="w-7 h-7" /> : <Brain className="w-7 h-7" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className={`flex items-center gap-2 mb-1 ${isLeft ? 'lg:justify-end' : 'lg:justify-start'}`}>
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusColor(module.status)}`}>
                                {getStatusText(module.status)}
                              </span>
                              {hasProfessionalComment && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md bg-yellow-100 text-yellow-700">
                                  <MessagesSquare className="w-3 h-3 mr-1" />
                                  Feedback
                                </span>
                              )}
                            </div>
                            <h3 className={`text-xl font-bold ${isZoom ? "text-purple-900" : "text-gray-900"}`}>
                              {module.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {module.description}
                        </p>

                        <div className={`flex items-center gap-4 text-sm text-gray-500 mb-6 ${isLeft ? 'lg:justify-end' : 'lg:justify-start'}`}>
                          <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-lg border border-white/50">
                            <Clock className="w-4 h-4" />
                            <span>{module.duration}</span>
                          </div>
                          {module.tasks.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-lg border border-white/50">
                              <CheckCircle className="w-4 h-4" />
                              <span>{module.tasks.length} tugas</span>
                            </div>
                          )}
                        </div>

                        <div className={`flex ${isLeft ? 'lg:justify-end' : 'lg:justify-start'}`}>
                          <Button
                            onClick={() => handleStartModule(module.id)}
                            disabled={module.status === "locked" || isSaving}
                            className={`rounded-xl px-8 py-6 font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
                              module.status === "available"
                                ? isZoom
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-200"
                                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-200"
                                : module.status === "completed"
                                ? isZoom
                                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-none"
                                  : "bg-green-100 text-green-700 hover:bg-green-200 shadow-none"
                                : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                            }`}
                          >
                            {isSaving && module.status === "available" ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : module.status === "completed" ? (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                {isZoom ? "Sesi Selesai" : "Selesai"}
                              </>
                            ) : module.status === "available" ? (
                              isZoom ? (
                                <>
                                  <Video className="w-5 h-5 mr-2" />
                                  Gabung Sesi Zoom
                                </>
                              ) : (
                                <>
                                  <Play className="w-5 h-5 mr-2" />
                                  Mulai Modul
                                </>
                              )
                            ) : (
                              <>
                                <Lock className="w-5 h-5 mr-2" />
                                Terkunci
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Spacer for the other side */}
                    <div className="flex-1 hidden lg:block"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Pencapaian Anda</h2>
                <p className="text-gray-400">Kumpulkan lencana seiring kemajuan Anda.</p>
              </div>
              <Award className="w-12 h-12 text-yellow-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center space-x-4 p-5 rounded-2xl border transition-all ${
                      achievement.unlocked
                        ? "bg-white/10 border-white/20 backdrop-blur-sm"
                        : "bg-white/5 border-white/5 opacity-50 grayscale"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                        achievement.unlocked ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : "bg-gray-700 text-gray-500"
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${achievement.unlocked ? "text-white" : "text-gray-400"}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 leading-tight">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CBT;
