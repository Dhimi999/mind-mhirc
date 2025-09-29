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

// --- Data Master Modul (DIUBAH UNTUK MENYISIPKAN SESI ZOOM SETELAH 2 MODUL) ---
const masterModules: Omit<
  CbtModule,
  "status" | "progress" | "professionalComment"
>[] = [
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
    description: "Menyelesaikan 3 dari 5 modul CBT inti.",
    unlocked: false
  },
  {
    id: "master",
    icon: Brain,
    title: "CBT Master",
    description:
      "Menyelesaikan seluruh 8 langkah program CBT dan Sesi Virtual!",
    unlocked: false
  }
];

const CBT = () => {
  const { user } = useAuth();
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
    if (!user) return;
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
      toast.error("Gagal memuat progres Anda.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

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
      <div className="min-h-screen flex flex-col bg-white">
        <Helmet>
          <title>{activeModuleDetail.title} - Safe Mother</title>
        </Helmet>
        <SafeMotherNavbar />
        <main className="flex-1 pt-8">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="mb-4"
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Modul
            </Button>
            {hasComment && (
              <Card className="mb-6 border-l-4 border-blue-500 bg-blue-50 shadow-md">
                <CardHeader className="flex flex-row items-center space-x-3 p-4 pb-0">
                  <MessagesSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <CardTitle className="text-xl font-semibold text-blue-800">
                    Umpan Balik Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {activeModuleDetail.professionalComment}
                  </p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {activeModuleDetail.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {activeModuleDetail.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeModuleDetail.tasks.map((task, index) => (
                  <div key={task.id}>
                    <label
                      htmlFor={task.id}
                      className="font-medium text-gray-800 block mb-2"
                    >
                      Tugas {index + 1}: {task.prompt}
                    </label>
                    <Textarea
                      id={task.id}
                      placeholder="Tuliskan jawaban Anda di sini..."
                      className="min-h-[120px]"
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
              <CardFooter>
                <Button
                  onClick={() => handleCompleteModule(activeModuleDetail.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>Program CBT - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Program Cognitive Behavioral Therapy (CBT) khusus untuk ibu dengan berbagai modul terstruktur untuk mendukung kesehatan mental maternal."
        />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium text-sm">
                Program CBT
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cognitive Behavioral Therapy untuk Ibu
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Program terstruktur 8 langkah (5 Modul Tugas & 3 Sesi Zoom
              Konsultasi) yang dirancang khusus untuk mendukung kesehatan mental
              maternal.
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Progress Anda
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {totalModulesCompleted}/{totalModules}
                </div>
                <div className="text-sm text-gray-600">Total Modul Selesai</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {((totalModulesCompleted / totalModules) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Penyelesaian</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">
                  {achievementsUnlocked}
                </div>
                <div className="text-sm text-gray-600">Pencapaian</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {cbtModulesCompleted}/5
                </div>
                <div className="text-sm text-gray-600">
                  Tugas CBT Inti Selesai
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {modules.map((module) => {
              const isZoom = module.type === "zoom";
              const hasProfessionalComment =
                module.status === "completed" && module.professionalComment;
              return (
                <div
                  key={module.id}
                  className={`bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    module.status === "locked" ? "opacity-75" : ""
                  } ${isZoom ? "border-2 border-purple-300 shadow-lg" : ""}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            module.status === "available"
                              ? isZoom
                                ? "bg-purple-100"
                                : "bg-blue-100"
                              : module.status === "completed"
                              ? isZoom
                                ? "bg-purple-100"
                                : "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {isZoom ? (
                            <Video
                              className={`w-6 h-6 ${
                                module.status !== "locked"
                                  ? "text-purple-600"
                                  : "text-gray-400"
                              }`}
                            />
                          ) : (
                            <Brain
                              className={`w-6 h-6 ${
                                module.status === "available"
                                  ? "text-blue-600"
                                  : module.status === "completed"
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-semibold ${
                              isZoom ? "text-purple-800" : "text-gray-900"
                            }`}
                          >
                            {module.title}
                          </h3>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              module.status
                            )}`}
                          >
                            {getStatusText(module.status)}
                          </div>
                        </div>
                      </div>
                      {hasProfessionalComment && (
                        <span className="ml-3 inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          <MessagesSquare className="w-3 h-3 mr-1" />
                          Ada Umpan Balik
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {module.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{module.duration}</span>
                      </div>
                      {module.tasks.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{module.tasks.length} tugas</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Tujuan:
                      </h4>
                      <ul className="space-y-1">
                        {module.objectives.map((objective, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-xs text-gray-600"
                          >
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => handleStartModule(module.id)}
                      disabled={module.status === "locked" || isSaving}
                      className={`w-full ${
                        module.status === "available"
                          ? isZoom
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                          : module.status === "completed"
                          ? isZoom
                            ? "bg-purple-500 text-white cursor-default"
                            : "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isSaving && module.status === "available" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : module.status === "completed" ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isZoom ? "Sesi Selesai (Gabung Kembali)" : "Selesai"}
                        </>
                      ) : module.status === "available" ? (
                        isZoom ? (
                          <>
                            <Video className="w-4 h-4 mr-2" />
                            Gabung Zoom
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Mulai Modul
                          </>
                        )
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Terkunci
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Pencapaian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-opacity ${
                      achievement.unlocked
                        ? "bg-green-50 opacity-100"
                        : "bg-gray-50 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        achievement.unlocked ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          achievement.unlocked
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-500">
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
