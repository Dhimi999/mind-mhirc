// src/pages/CbtAnswerDetail.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Tambahkan toast untuk notifikasi
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import masterModules from "./CbtModules";

// ... (Interface CbtTask dan TaskAnswer tetap sama)
interface CbtTask {
  id: string;
  prompt: string;
}
interface TaskAnswer {
  task_id: string;
  prompt: string;
  answer: string;
}
// ASUMSI: Struktur cbt_user_progress memiliki kolom 'professional_comment' dan 'id' (Progress ID)

const CbtAnswerDetail: React.FC = () => {
  const { userId, moduleId } = useParams<{
    userId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [answers, setAnswers] = useState<TaskAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE BARU UNTUK KOMENTAR ---
  const [currentComment, setCurrentComment] = useState<string>("");
  const [existingComment, setExistingComment] = useState<string | null>(null);
  const [progressId, setProgressId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  // ---------------------------------

  const moduleIdNumber = parseInt(moduleId || "0");

  // Fungsi fetch digabungkan untuk memuat jawaban DAN komentar/progres
  const fetchData = async () => {
    if (!userId || !moduleId) return;

    const moduleData = masterModules.find((m) => m.id === moduleIdNumber);
    if (!moduleData || moduleData.type !== "cbt") {
      navigate(`/dashboard/safe-mother/assignments/cbt/review/${userId}`);
      return;
    }
    setModuleTitle(moduleData.title);
    setIsLoading(true);

    try {
      // 1. Ambil Jawaban Pengguna
      const { data: answersData, error: answersError } = await supabase
        .from("cbt_user_answers")
        .select("task_id, answer")
        .eq("user_id", userId)
        .eq("module_id", moduleIdNumber);

      if (answersError) throw answersError;

      const answersMap = new Map(answersData.map((a) => [a.task_id, a.answer]));

      // Gabungkan Jawaban dengan Prompt Tugas Master (Logika ini sudah benar)
      const mergedAnswers: TaskAnswer[] = moduleData.tasks.map(
        (task: CbtTask) => ({
          task_id: task.id,
          prompt: task.prompt,
          answer: answersMap.get(task.id) || "Tidak Ada Jawaban Tersimpan"
        })
      );
      setAnswers(mergedAnswers);

      // 2. Ambil Progres dan Komentar Mentor (Hanya satu baris per modul/user)
      const { data: progress, error: progressError } = await supabase
        .from("cbt_user_progress")
        .select("id, professional_comment")
        .eq("user_id", userId)
        .eq("module_id", moduleIdNumber)
        .maybeSingle(); // Ambil 0 atau 1 baris

      if (progressError) throw progressError;

      if (progress) {
        setProgressId(progress.id);
        setExistingComment(progress.professional_comment);
        setCurrentComment(progress.professional_comment || "");
      }
    } catch (e) {
      console.error("Error fetching data:", e);
      toast.error("Gagal memuat data modul.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, moduleId]);

  // --- FUNGSI BARU UNTUK KOMENTAR ---

  const handleSendComment = async () => {
    if (!currentComment.trim() || !progressId) return;
    setIsSending(true);

    try {
      const { error } = await supabase
        .from("cbt_user_progress")
        .update({ professional_comment: currentComment.trim() })
        .eq("id", progressId); // Update berdasarkan progress ID spesifik

      if (error) throw error;

      setExistingComment(currentComment.trim());
      toast.success("Komentar berhasil disimpan.");
    } catch (e) {
      console.error("Error sending comment:", e);
      toast.error("Gagal mengirim komentar. Periksa RLS.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!progressId) return;
    setIsSending(true);

    try {
      const { error } = await supabase
        .from("cbt_user_progress")
        .update({ professional_comment: null }) // Set komentar menjadi NULL
        .eq("id", progressId);

      if (error) throw error;

      setExistingComment(null);
      setCurrentComment("");
      toast.info("Komentar berhasil dihapus.");
    } catch (e) {
      console.error("Error deleting comment:", e);
      toast.error("Gagal menghapus komentar. Periksa RLS.");
    } finally {
      setIsSending(false);
    }
  };
  // ---------------------------------

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Memuat Jawaban dan Progres...</p>
      </div>
    );
  }

  // Handle navigasi kembali (diubah sesuai rute baru)
  const handleGoBack = () => {
    navigate(`/dashboard/safe-mother/assignments/cbt/review/${userId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() =>
          navigate(`/dashboard/safe-mother/assignments/cbt/review/${userId}`)
        }
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Rekap Modul
      </Button>

      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
        Detail Jawaban: {moduleTitle}
      </h1>
      <h2 className="text-xl text-gray-600 mb-8 font-medium">
        Peserta ID: {userId}
      </h2>

      {/* --- BAGIAN KOMENTAR MENTOR --- */}
      <Card className="mb-8 border-blue-400">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-xl font-bold text-blue-800">
            {existingComment
              ? "Komentar Mentor (Sudah Terkirim)"
              : "Tambahkan Komentar Mentor"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {existingComment ? (
            <p className="whitespace-pre-wrap text-lg text-gray-700">
              {existingComment}
            </p>
          ) : (
            <Textarea
              placeholder="Berikan umpan balik (feedback) Anda untuk modul ini..."
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              rows={4}
              disabled={isSending || !progressId}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0">
          {existingComment ? (
            <Button
              onClick={handleDeleteComment}
              variant="destructive"
              disabled={isSending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isSending ? "Menghapus..." : "Hapus Komentar"}
            </Button>
          ) : (
            <Button
              onClick={handleSendComment}
              disabled={isSending || !currentComment.trim() || !progressId}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Mengirim..." : "Kirim Komentar"}
            </Button>
          )}
          {!progressId && !isLoading && (
            <p className="text-red-500 text-sm ml-4">
              Progress ID tidak ditemukan. Modul mungkin belum dimulai.
            </p>
          )}
        </CardFooter>
      </Card>
      {/* ------------------------------- */}

      <h3 className="text-2xl font-bold mt-10 mb-4 text-gray-800">
        Jawaban Peserta
      </h3>
      <div className="space-y-6">
        {answers.map((item, index) => (
          <Card key={item.task_id}>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Tugas {index + 1}: {item.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {item.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CbtAnswerDetail;
