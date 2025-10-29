// src/pages/CbtUserList.tsx (REVISI)

import React, { useState, useEffect } from "react";
import { Users, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Pastikan path ini benar
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// Asumsi Anda juga mengimpor komponen UI dari shadcn/ui

// Tipe data yang disederhanakan untuk daftar peserta
interface UserProgressSummary {
  id: string;
  fullName: string; // Menggunakan full_name dari tabel profiles
  completedModules: number;
  totalModules: number;
}

// Total modul sesuai data master dari CBT.tsx
const CBT_TOTAL_MODULES = 8;

const CbtUserList: React.FC = () => {
  const [userList, setUserList] = useState<UserProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserList = async () => {
      setIsLoading(true);
      try {
        // --- PERUBAHAN UTAMA DI SINI ---
        // 1. Ambil data Progres yang sudah "available" atau "completed"
        //    DAN pastikan user_id TIDAK NULL.
        const { data: progressData, error: progressError } = await supabase
          .from("cbt_user_progress")
          .select("user_id, status")
          // Filter RLS: Pastikan hanya status yang relevan, dan user_id tidak null
          .not("status", "eq", "locked")
          .not("user_id", "is", null);

        if (progressError) throw progressError;

        // 2. Agregasi status progress per user_id
        const userProgressMap = progressData.reduce((acc, item) => {
          // Karena kita sudah memfilter user_id di kueri, kita bisa lebih yakin
          const userId = item.user_id!;

          if (!acc[userId]) {
            acc[userId] = { completed: 0, total: CBT_TOTAL_MODULES };
          }
          if (item.status === "completed") {
            acc[userId].completed += 1;
          }
          return acc;
        }, {} as { [userId: string]: { completed: number; total: number } });

        const userIds = Object.keys(userProgressMap);

        if (userIds.length === 0) {
          setUserList([]);
          setIsLoading(false);
          return;
        }

        // 3. Ambil data profil (id dan full_name)
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds); // Menggunakan filter .in() untuk efisiensi

        if (profileError) throw profileError;

        // 4. Gabungkan data (Logika penggabungan ini sudah benar)
        const list: UserProgressSummary[] = profiles.map((profile) => ({
          id: profile.id,
          fullName:
            profile.full_name || `Peserta ID: ${profile.id.substring(0, 8)}`,
          completedModules: userProgressMap[profile.id]?.completed || 0,
          totalModules: CBT_TOTAL_MODULES
        }));

        setUserList(list);
      } catch (e) {
        console.error("Error fetching user list:", e);
        // Tampilkan notifikasi error ke user jika diperlukan
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserList();
  }, []);

  // Navigasi ke halaman rekap modul untuk user tertentu
  const handleViewModules = (userId: string) => {
    // Rute kanonik baru menggunakan safe-mother (rute lama tetap didukung di router)
    navigate(`/dashboard/safe-mother/assignments/cbt/review/${userId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/safe-mother/assignments/cbt")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Menu
      </Button>
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Users className="w-6 h-6 mr-3 text-blue-600" />
        Daftar Peserta Safe Mother CBT
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2">Memuat data peserta...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userList.length === 0 ? (
            <p className="text-center p-8 bg-gray-50 rounded-lg text-gray-500">
              Belum ada peserta yang memulai program CBT.
            </p>
          ) : (
            userList.map((user) => (
              <Card
                key={user.id}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-lg font-semibold truncate"
                      title={user.fullName}
                    >
                      {user.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Progres: {user.completedModules} dari {user.totalModules}{" "}
                      Modul Selesai
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (user.completedModules / user.totalModules) * 100
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewModules(user.id)}
                    className="ml-4 flex-shrink-0"
                    size="sm"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Rekap Jawaban
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CbtUserList;
