// src/pages/CbtModuleReview.tsx (REVISI KECIL)

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Video,
  Lock,
  Loader2,
  Brain,
  BookOpen
} from "lucide-react"; // Tambahkan BookOpen
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import masterModules from "./CbtModules";

// ASUMSI: masterModules diimpor dari file CBT.tsx

// ... (Interface ReviewModule dan lain-lain sama)

const CbtModuleReview: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  // Mengubah userEmail menjadi userName
  const [userName, setUserName] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]); // Menggunakan 'any' untuk kemudahan, ganti dengan interface ReviewModule
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchReviewData = async () => {
      setIsLoading(true);
      try {
        // 1. Ambil nama lengkap pengguna (full_name)
        const { data: userProfile, error: userError } = await supabase
          .from("profiles")
          .select("full_name") // Mengambil full_name
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        setUserName(userProfile?.full_name || "Peserta Tidak Dikenal"); // Menggunakan full_name

        // 2. Ambil progres modul pengguna
        const { data: progressData, error: progressError } = await supabase
          .from("cbt_user_progress")
          .select("module_id, status")
          .eq("user_id", userId);

        if (progressError) throw progressError;

        const progressMap = new Map(
          progressData.map((p) => [p.module_id, p.status])
        );

        // 3. Gabungkan dengan data master
        const mergedModules = masterModules.map((masterModule) => {
          const status =
            progressMap.get(masterModule.id) ||
            (masterModule.id === 1 ? "available" : "locked");
          return {
            ...masterModule,
            status
          };
        });

        setModules(mergedModules);
      } catch (e) {
        console.error("Error fetching review data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewData();
  }, [userId]);

  // Navigasi ke halaman detail jawaban
  const handleViewAnswers = (moduleId: number) => {
    navigate(
      `/dashboard/save-mother/assignments/cbt/review/${userId}/module/${moduleId}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/save-mother/assignments/cbt/users")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Peserta
      </Button>
      <h1 className="text-3xl font-bold mb-2">Rekap Modul</h1>
      <h2 className="text-xl text-gray-600 mb-8 font-medium">
        Peserta: {userName}
      </h2>{" "}
      {/* Menggunakan userName */}
      <div className="space-y-4">
        {modules.map((module) => {
          // ... (Logic tampilan modul sama)
          const isCompleted = module.status === "completed";
          const isCBT = module.type === "cbt";

          return (
            <Card
              key={module.id}
              className={`shadow-sm transition-all ${
                isCompleted
                  ? "border-green-300"
                  : module.status === "locked"
                  ? "opacity-70"
                  : ""
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCBT ? "bg-blue-100" : "bg-purple-100"
                    }`}
                  >
                    {isCBT ? (
                      <Brain className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Video className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{module.title}</p>
                    <p
                      className={`text-sm ${
                        isCompleted ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      Status:{" "}
                      {isCompleted
                        ? "Selesai"
                        : module.status === "locked"
                        ? "Terkunci"
                        : "Tersedia"}
                    </p>
                  </div>
                </div>
                {isCompleted && isCBT && (
                  <Button
                    onClick={() => handleViewAnswers(module.id)}
                    size="sm"
                    variant="default"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lihat Jawaban
                  </Button>
                )}
                {isCompleted && !isCBT && (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Virtual Selesai
                  </div>
                )}
                {!isCompleted && module.status === "locked" && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <Lock className="w-4 h-4 mr-1" /> Terkunci
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CbtModuleReview;
