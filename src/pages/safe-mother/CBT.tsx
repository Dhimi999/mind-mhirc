import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Brain, CheckCircle, Clock, Calendar, Target, Award, Heart, Play, ArrowLeft, Lock, Loader2, Video as VideoIcon } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// --- Definisi Tipe Data ---
interface CbtTask {
  id: string;
  prompt: string;
}
type CbtModuleKind = "task" | "meeting";
interface CbtMeetingInfo {
  url: string;
  label?: string;
  startsAt?: string; // ISO atau teks jam
  notes?: string;
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
  // Tambahan untuk sesi meeting
  kind?: CbtModuleKind; // default: 'task'
  meeting?: CbtMeetingInfo;
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

// --- Data Master Modul (sebagai fallback & template) ---
const masterModules: Omit<CbtModule, "status" | "progress">[] = [{
  id: 1,
  title: "Sesi 1: Journey to Recovery",
  description: "Mengenali irama hidup Anda, membangun langkah-langkah kecil untuk pemulihan, dan menjaga rutinitas serta dukungan sosial.",
  duration: "45 menit",
  tasks: [{
    id: "1-1",
    prompt: "Tuliskan pengalaman Anda tentang hari baik dan hari buruk yang pernah dilalui."
  }, {
    id: "1-2",
    prompt: "Tuliskan bagaimana kecemasan atau depresi memengaruhi hidup Anda dan bagian mana yang paling terasa."
  }, {
    id: "1-3",
    prompt: "Tuliskan satu masalah besar lalu pecah menjadi langkah kecil yang bisa Anda mulai segera."
  }, {
    id: "1-4",
    prompt: "Tuliskan siapa saja orang yang menjadi pendukung Anda dan bagaimana Anda akan menjaga komunikasi dengan mereka."
  }],
  objectives: ["Mengenali pengalaman hari baik dan buruk", "Memahami bagaimana kecemasan/depresi memengaruhi hidup", "Memecah masalah besar menjadi langkah-langkah kecil", "Mengidentifikasi sistem pendukung Anda"]
},
// ... (Tambahkan sisa data master module 2-5 seperti di contoh sebelumnya)
{
  id: 2,
  title: "Sesi 2: Kenali Jejak Perasaan",
  description: "Mempelajari bagaimana suasana hati memengaruhi tindakan, mengenali pola emosi, dan menetapkan tujuan pemulihan yang jelas.",
  duration: "50 menit",
  tasks: [{
    id: "2-1",
    prompt: "Tuliskan bagaimana suasana hati buruk, kecemasan, atau depresi memengaruhi kehidupan Anda (Contoh: sulit bekerja, mengurus rumah, dll)."
  }, {
    id: "2-2",
    prompt: "Tuliskan situasi yang paling sering membuat suasana hati Anda memburuk (Kapan, di mana, dengan siapa?)."
  }, {
    id: "2-3",
    prompt: "Jelaskan satu pengalaman sulit menggunakan kerangka: Perasaan & Gejala Fisik, Perilaku, dan Pikiran."
  }, {
    id: "2-4",
    prompt: "Tuliskan 1-3 tujuan sederhana yang ingin Anda capai terkait gejala, perilaku, dan pikiran negatif Anda."
  }],
  objectives: ["Memetakan dampak suasana hati pada aktivitas harian", "Mengidentifikasi situasi yang memicu emosi negatif", "Menganalisis hubungan antara perasaan, perilaku, dan pikiran", "Menetapkan tujuan pemulihan yang spesifik dan positif"]
}, {
  id: 1001,
  title: "Pertemuan Daring 1",
  description: "Evaluasi perkembangan dan konsultasi setelah Sesi 1 & 2.",
  duration: "30-60 menit",
  tasks: [],
  objectives: ["Evaluasi perkembangan awal", "Diskusi dan konsultasi singkat"],
  kind: "meeting",
  meeting: {
    url: "https://meet.google.com/xxxxx",
    label: "Google Meet",
    // startsAt: "2025-10-05T09:00:00+07:00",
    // notes: "Silakan bergabung 5 menit lebih awal."
  }
}, {
  id: 3,
  title: "Sesi 3: Reset dan Aktifkan",
  description: "Fokus pada strategi dasar untuk menenangkan tubuh (tidur, makan, relaksasi) dan mengaktifkan kembali rutinitas harian.",
  duration: "55 menit",
  tasks: [{
    id: "3-1",
    prompt: "Isi mood check-in harian Anda dan berikan skala 0-10 untuk suasana hati Anda hari ini."
  }, {
    id: "3-2",
    prompt: "Tuliskan 1 kebiasaan terkait tidur yang ingin Anda ubah minggu ini (Contoh: tidak melihat layar 1 jam sebelum tidur)."
  }, {
    id: "3-3",
    prompt: "Tuliskan 2 opsi makanan cepat-sehat yang realistis untuk Anda siapkan."
  }, {
    id: "3-4",
    prompt: "Jadwalkan 1 aktivitas rutin, 1 menyenangkan, dan 1 penting untuk besok (sertakan kapan & di mana)."
  }],
  objectives: ["Melakukan mood check-in harian", "Menerapkan praktik kebersihan tidur (sleep hygiene)", "Menggunakan teknik relaksasi pernapasan", "Menjadwalkan aktivitas rutin, menyenangkan, dan penting"]
}, {
  id: 4,
  title: "Sesi 4: Pikiran VS Khawatir dan Dukungan",
  description: "Melatih cara mengenali pikiran negatif, mengelola kekhawatiran dengan teknik 'worry time', dan memperkuat dukungan sosial.",
  duration: "60 menit",
  tasks: [{
    id: "4-1",
    prompt: "Tuliskan 1 pikiran otomatis yang sering muncul dan 2 bukti yang menentangnya."
  }, {
    id: "4-2",
    prompt: "Bedakan antara masalah nyata dan kekhawatiran hipotesis menggunakan Pohon Khawatir."
  }, {
    id: "4-3",
    prompt: "Tentukan jadwal 'Waktu Khawatir' Anda setiap hari (Contoh: Pukul 17:00 selama 20 menit)."
  }, {
    id: "4-4",
    prompt: "Tuliskan nama pendamping utama Anda dan 2 bentuk bantuan nyata yang Anda butuhkan darinya minggu ini."
  }],
  objectives: ["Menangkap dan menguji pikiran otomatis yang tidak membantu", "Membuat pikiran alternatif yang lebih realistis", "Menggunakan teknik 'Pohon Khawatir' dan 'Waktu Khawatir'", "Membuat kontrak dukungan dengan pasangan atau keluarga"]
}, {
  id: 1002,
  title: "Pertemuan Daring 2",
  description: "Evaluasi perkembangan dan konsultasi setelah Sesi 3 & 4.",
  duration: "30-60 menit",
  tasks: [],
  objectives: ["Evaluasi kemajuan pertengahan", "Diskusi strategi lanjutan"],
  kind: "meeting",
  meeting: {
    url: "https://zoom.us/j/xxxxxxxx",
    label: "Zoom"
  }
}, {
  id: 5,
  title: "Sesi 5: Tetap Pulih, Tetap Kuat",
  description: "Fokus untuk mempertahankan hasil pemulihan, menjaga kebugaran, dan menyiapkan rencana pencegahan jika gejala muncul kembali.",
  duration: "50 menit",
  tasks: [{
    id: "5-1",
    prompt: "Tuliskan kegiatan sehat yang sudah berhasil Anda lakukan dan tandai mana yang ingin dipertahankan."
  }, {
    id: "5-2",
    prompt: "Tuliskan tanda-tanda pribadi ketika mood Anda mulai turun (Contoh: sulit tidur, malas beraktivitas)."
  }, {
    id: "5-3",
    prompt: "Buat rencana darurat pribadi 'Jika... maka...' (Contoh: Jika saya merasa cemas, maka saya akan melakukan latihan napas)."
  }, {
    id: "5-4",
    prompt: "Tuliskan 1 orang pendamping utama dan simpan sebagai 'Kontak Darurat' Anda."
  }],
  objectives: ["Merefleksikan dan mempertahankan gaya hidup sehat", "Mengidentifikasi tanda-tanda awal mood menurun", "Membuat rencana darurat pribadi (Jika... maka...)", "Memanfaatkan sumber dukungan sebagai kontak darurat"]
}, {
  id: 1003,
  title: "Pertemuan Daring 3",
  description: "Evaluasi akhir dan konsultasi penutup setelah Sesi 5.",
  duration: "30-60 menit",
  tasks: [],
  objectives: ["Evaluasi akhir program", "Rekomendasi tindak lanjut"],
  kind: "meeting",
  meeting: {
    url: "https://meet.google.com/yyyyy",
    label: "Google Meet"
  }
}];
const initialAchievements: Achievement[] = [{
  id: "first_module",
  icon: Award,
  title: "Langkah Pertama",
  description: "Menyelesaikan modul pertama dengan sukses!",
  unlocked: false
}, {
  id: "halfway",
  icon: Target,
  title: "Setengah Jalan",
  description: "Menyelesaikan setengah dari total modul program.",
  unlocked: false
}, {
  id: "master",
  icon: Brain,
  title: "CBT Master",
  description: "Menyelesaikan seluruh modul program CBT!",
  unlocked: false
}];
const CBT = () => {
  // Workaround for some TS setups that flag Helmet as invalid JSX component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HelmetAny = Helmet as unknown as React.FC<any>;
  const {
    user
  } = useAuth();
  const [modules, setModules] = useState<CbtModule[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [activeModuleDetail, setActiveModuleDetail] = useState<CbtModule | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // [DB] Fetch user progress and merge with master data
  const loadUserProgress = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const {
        data: progressData,
        error
      } = await supabase.from("cbt_user_progress").select("*").eq("user_id", user.id);
      if (error) throw error;
      const mergedModules = masterModules.map(masterModule => {
        const userProgress = progressData.find(p => p.module_id === masterModule.id);
        return {
          ...masterModule,
          status: userProgress?.status || (masterModule.id === 1 ? "available" : "locked"),
          progress: userProgress?.progress || 0
        };
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

  // [DB] Fetch user answers when a module is opened
  const handleStartModule = async (moduleId: number) => {
    const moduleToStart = modules.find(m => m.id === moduleId);
    if (moduleToStart && moduleToStart.status === "available" && user) {
      try {
        const {
          data: answersData,
          error
        } = await supabase.from("cbt_user_answers").select("task_id, answer").eq("user_id", user.id).eq("module_id", moduleId);
        if (error) throw error;
        const existingAnswers = answersData.reduce((acc, current) => {
          acc[current.task_id] = current.answer || "";
          return acc;
        }, {} as {
          [taskId: string]: string;
        });
        setUserAnswers(prev => ({
          ...prev,
          [moduleId]: existingAnswers
        }));
      } catch (error) {
        toast.error("Gagal memuat jawaban Anda sebelumnya.");
        console.error("Error fetching answers:", error);
      }
      setActiveModuleDetail(moduleToStart);
    }
  };
  const handleGoBack = () => setActiveModuleDetail(null);
  const handleAnswerChange = (moduleId: number, taskId: string, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [taskId]: value
      }
    }));
  };

  // [DB] Save answers and progress to Supabase
  // Dapatkan module berikutnya berdasarkan urutan array saat ini
  const getNextModuleId = (currentId: number) => {
    const idx = modules.findIndex((m) => m.id === currentId);
    if (idx >= 0 && idx + 1 < modules.length) return modules[idx + 1].id;
    return null;
  };

  const handleCompleteModule = async (moduleId: number) => {
    if (!user || !activeModuleDetail) return;
    const currentModuleTasks = activeModuleDetail.tasks;
    const currentAnswers = userAnswers[moduleId];
    if (currentModuleTasks.some(task => !currentAnswers?.[task.id]?.trim())) {
      toast.error("Harap isi semua tugas sebelum menyelesaikan modul.");
      return;
    }
    setIsSaving(true);
    try {
      // 1. Save answers
      const answersToUpsert = currentModuleTasks.map(task => ({
        user_id: user.id,
        module_id: moduleId,
        task_id: task.id,
        answer: currentAnswers[task.id]
      }));

      // Upsert answers with conflict resolution
      const {
        error: answerError
      } = await supabase.from("cbt_user_answers").upsert(answersToUpsert, {
        onConflict: "user_id,module_id,task_id"
      });
      if (answerError) throw answerError;

      // 2. Update current module progress
      const {
        error: progressError
      } = await supabase.from("cbt_user_progress").upsert({
        user_id: user.id,
        module_id: moduleId,
        status: "completed",
        progress: 100
      }, {
        onConflict: "user_id,module_id"
      }); // Juga ditambahkan di sini untuk konsistensi
      if (progressError) throw progressError;

      // 3. Unlock next module
      const nextModuleId = getNextModuleId(moduleId);
      if (nextModuleId) {
        const {
          error: unlockError
        } = await supabase.from("cbt_user_progress").upsert({
          user_id: user.id,
          module_id: nextModuleId,
          status: "available",
          progress: 0
        }, {
          onConflict: "user_id,module_id"
        });
        if (unlockError) throw unlockError;
      }
      toast.success(`Selamat! Anda telah menyelesaikan ${activeModuleDetail.title}.`);
      setActiveModuleDetail(null);
      await loadUserProgress(); // Reload progress from DB
    } catch (error) {
      console.error("Error completing module:", error);
      toast.error("Terjadi kesalahan saat menyimpan progres Anda.");
    } finally {
      setIsSaving(false);
    }
  };
  // Statistik terpisah untuk modul tugas vs pertemuan
  const taskModules = modules.filter((m) => (m.kind ?? "task") === "task");
  const meetingModules = modules.filter((m) => (m.kind ?? "task") === "meeting");
  const taskModulesTotal = taskModules.length;
  const meetingModulesTotal = meetingModules.length;
  const taskModulesCompleted = taskModules.filter((m) => m.status === "completed").length;
  const meetingModulesCompleted = meetingModules.filter((m) => m.status === "completed").length;

  const modulesCompleted = modules.filter(m => m.status === "completed").length;
  const achievementsUnlocked = achievements.filter(a => a.unlocked).length;
  useEffect(() => {
    // Hindari mengaktifkan pencapaian saat data modul belum dimuat
    if (isLoading || modules.length === 0) return;

    const total = modules.length;
    const completed = modulesCompleted;

    setAchievements(() =>
      initialAchievements.map((ach) => {
        let unlocked = false;
        if (ach.id === "first_module") unlocked = completed >= 1;
        else if (ach.id === "halfway") unlocked = total > 0 && completed >= Math.ceil(total / 2);
        else if (ach.id === "master") unlocked = total > 0 && completed >= total;
        return { ...ach, unlocked };
      })
    );
  }, [isLoading, modules.length, modulesCompleted]);

  // Menandai selesai untuk modul meeting (tanpa tugas)
  const handleCompleteMeeting = async (moduleId: number) => {
    if (!user) return;
    setIsSaving(true);
    try {
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

      const nextModuleId = getNextModuleId(moduleId);
      if (nextModuleId) {
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

      toast.success("Pertemuan ditandai selesai. Modul berikutnya dibuka.");
      await loadUserProgress();
    } catch (error) {
      console.error("Error completing meeting:", error);
      toast.error("Terjadi kesalahan saat menandai pertemuan.");
    } finally {
      setIsSaving(false);
    }
  };

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

  // --- RENDER LOGIC ---

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  if (activeModuleDetail) {
    return <div className="min-h-screen flex flex-col bg-white">
        <HelmetAny>
          <title>{activeModuleDetail.title} - Safe Mother</title>
        </HelmetAny>
        <SafeMotherNavbar />
        <main className="flex-1 pt-8">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <Button variant="ghost" onClick={handleGoBack} className="mb-4" disabled={isSaving}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Modul
            </Button>
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
                {activeModuleDetail.tasks.map((task, index) => <div key={task.id}>
                    <label htmlFor={task.id} className="font-medium text-gray-800 block mb-2">
                      Tugas {index + 1}: {task.prompt}
                    </label>
                    <Textarea id={task.id} placeholder="Tuliskan jawaban Anda di sini..." className="min-h-[120px]" value={userAnswers[activeModuleDetail.id]?.[task.id] || ""} onChange={e => handleAnswerChange(activeModuleDetail.id, task.id, e.target.value)} />
                  </div>)}
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleCompleteModule(activeModuleDetail.id)} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {isSaving ? "Menyimpan..." : "Selesaikan & Simpan Modul"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return (
    // ... (Return JSX for the main dashboard remains the same as previous response, just ensure it uses the dynamic progress variables like modulesCompleted) ...
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <HelmetAny>
        <title>Program CBT - Safe Mother | Mind MHIRC</title>
        <meta name="description" content="Program Cognitive Behavioral Therapy (CBT) khusus untuk ibu dengan berbagai modul terstruktur untuk mendukung kesehatan mental maternal." />
      </HelmetAny>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl my-[12px] py-[12px]">
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
              Program CBT terstruktur yang dirancang khusus untuk mendukung
              kesehatan mental maternal melalui berbagai modul pembelajaran dan
              penugasan harian.
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
                  {taskModulesCompleted}/{taskModulesTotal}
                </div>
                <div className="text-sm text-gray-600">Modul Selesai</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {(
                    (taskModulesCompleted / Math.max(taskModulesTotal || 0, 1)) * 100
                  ).toFixed(0)}%
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
                  {meetingModulesCompleted}/{meetingModulesTotal}
                </div>
                <div className="text-sm text-gray-600">Pertemuan Selesai</div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {modules.map(module => <div key={module.id} className={`bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden ${module.status === "locked" ? "opacity-75" : ""}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${module.status === "available" ? "bg-blue-100" : module.status === "completed" ? "bg-green-100" : "bg-gray-100"}`}>
                        { (module.kind ?? "task") === "meeting" ? (
                          <VideoIcon className={`w-6 h-6 ${module.status === "available" ? "text-blue-600" : module.status === "completed" ? "text-green-600" : "text-gray-400"}`} />
                        ) : (
                          <Brain className={`w-6 h-6 ${module.status === "available" ? "text-blue-600" : module.status === "completed" ? "text-green-600" : "text-gray-400"}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(module.status)}`}>
                          {getStatusText(module.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {module.description}
                  </p>

                  {(module.kind ?? "task") === "meeting" ? (
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Pertemuan daring • {module.meeting?.label || "Online"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{module.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{module.tasks.length} tugas</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Tujuan Pembelajaran:
                    </h4>
                    <ul className="space-y-1">
                      {module.objectives.map((objective, index) => <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{objective}</span>
                        </li>)}
                    </ul>
                  </div>

                  {(module.kind ?? "task") === "meeting" ? (
                    module.status === "completed" ? (
                      <Button disabled className="w-full bg-green-600 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Selesai
                      </Button>
                    ) : module.status === "locked" ? (
                      <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                        <Lock className="w-4 h-4 mr-2" />
                        Terkunci
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={module.meeting?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          <VideoIcon className="w-4 h-4 mr-2" />
                          Gabung Pertemuan
                        </a>
                        <Button
                          variant="outline"
                          onClick={() => handleCompleteMeeting(module.id)}
                          disabled={isSaving}
                          className="w-full sm:w-auto"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Tandai Selesai
                        </Button>
                      </div>
                    )
                  ) : (
                    <Button onClick={() => handleStartModule(module.id)} disabled={module.status === "locked"} className={`w-full ${module.status === "available" ? "bg-blue-600 hover:bg-blue-700 text-white" : module.status === "completed" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                      {module.status === "completed" ? <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Selesai
                        </> : module.status === "available" ? <>
                          <Play className="w-4 h-4 mr-2" />
                          Mulai Modul
                        </> : <>
                          <Lock className="w-4 h-4 mr-2" />
                          Terkunci
                        </>}
                    </Button>
                  )}
                </div>
              </div>)}
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Pencapaian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map(achievement => {
                const Icon = achievement.icon;
                return <div key={achievement.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-opacity ${achievement.unlocked ? "bg-green-50 opacity-100" : "bg-gray-50 opacity-50"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.unlocked ? "bg-green-100" : "bg-gray-200"}`}>
                      <Icon className={`w-6 h-6 ${achievement.unlocked ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {achievement.description}
                      </p>
                    </div>
                  </div>;
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