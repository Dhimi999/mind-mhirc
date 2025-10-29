import React, { useEffect, useState } from "react";
import { ClipboardList, Search, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Assignment {
  id: string;
  user_id: string;
  session_number: number;
  answers: any;
  submitted: boolean;
  submitted_at: string | null;
  created_at: string;
}

interface UserProgress {
  id: string;
  user_id: string;
  session_number: number;
  counselor_response: string | null;
  assignment_done: boolean;
  meeting_done: boolean;
  session_opened: boolean;
}

interface UserProfile {
  id: string;
  full_name: string | null;
}

const SpiritualPsikoedukasiAssignmentManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<UserProgress | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [counselorResponse, setCounselorResponse] = useState("");
  const [filterSession, setFilterSession] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("sb_psikoedukasi_assignments" as any)
        .select("*")
        .order("submitted_at", { ascending: false, nullsFirst: true })
        .order("created_at", { ascending: false });

      if (assignmentsError) throw assignmentsError;

      const { data: progressData, error: progressError } = await supabase
        .from("sb_psikoedukasi_user_progress" as any)
        .select("*");

      if (progressError) throw progressError;

      const userIds = [...new Set(assignmentsData?.map((a: any) => a.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      setAssignments(assignmentsData as any || []);
      
      const progressMap: Record<string, UserProgress> = {};
      progressData?.forEach((p: any) => {
        progressMap[`${p.user_id}-${p.session_number}`] = p;
      });
      setProgress(progressMap);

      const profilesMap: Record<string, UserProfile> = {};
      profilesData?.forEach(p => {
        profilesMap[p.id] = p;
      });
      setProfiles(profilesMap);
    } catch (error: any) {
      toast.error("Gagal memuat data penugasan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const progressKey = `${assignment.user_id}-${assignment.session_number}`;
    const userProgress = progress[progressKey] || null;
    setSelectedProgress(userProgress);
    setCounselorResponse(userProgress?.counselor_response || "");
    setIsDetailOpen(true);
  };

  const handleSaveResponse = async () => {
    if (!selectedAssignment || !selectedProgress) {
      toast.error("Data tidak valid");
      return;
    }

    try {
      const { error } = await supabase
        .from("sb_psikoedukasi_user_progress" as any)
        .update({ counselor_response: counselorResponse })
        .eq("id", selectedProgress.id);

      if (error) throw error;

      toast.success("Respons konselor berhasil disimpan");
      setIsDetailOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Gagal menyimpan respons");
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nama", "Sesi", "Tanggal Kirim", "Status Respons"];
    const rows = filteredAssignments.map(a => [
      profiles[a.user_id]?.full_name || "Tidak diketahui",
      `Sesi ${a.session_number}`,
      a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("id-ID") : "",
      progress[`${a.user_id}-${a.session_number}`]?.counselor_response ? "Sudah direspons" : "Belum direspons"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
  a.download = `spiritual-budaya-psikoedukasi-penugasan-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSession = filterSession === "all" || a.session_number === parseInt(filterSession);
    const userName = profiles[a.user_id]?.full_name || "";
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase());
    const includeByStatus = showDrafts ? true : a.submitted === true;
    return matchesSession && matchesSearch && includeByStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Spiritual & Budaya — Manajemen Penugasan</h1>
        <p className="text-muted-foreground">
          Kelola dan beri respons untuk penugasan peserta program Spiritual & Budaya.
        </p>
      </div>

  <div className="mb-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterSession} onValueChange={setFilterSession}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter Sesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sesi</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <SelectItem key={n} value={n.toString()}>Sesi {n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDrafts}
              onChange={() => setShowDrafts(v => !v)}
              className="h-4 w-4"
            />
            Tampilkan Draft
          </label>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Ekspor CSV
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Nama Peserta</th>
                <th className="text-left p-4 font-medium">Sesi</th>
                <th className="text-left p-4 font-medium">Status Pengiriman</th>
                <th className="text-left p-4 font-medium">Tanggal Kirim</th>
                <th className="text-left p-4 font-medium">Status Respons</th>
                <th className="text-left p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Tidak ada penugasan yang ditemukan. {showDrafts ? 'Belum ada peserta mengisi.' : 'Aktifkan "Tampilkan Draft" untuk melihat yang belum dikirim.'}
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => {
                  const progressKey = `${assignment.user_id}-${assignment.session_number}`;
                  const hasResponse = !!progress[progressKey]?.counselor_response;
                  return (
                    <tr key={assignment.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        {profiles[assignment.user_id]?.full_name || "Tidak diketahui"}
                      </td>
                      <td className="p-4">Sesi {assignment.session_number}</td>
                      <td className="p-4">
                        <Badge variant={assignment.submitted ? 'default' : 'secondary'} className={assignment.submitted ? 'bg-green-600 text-white' : ''}>
                          {assignment.submitted ? 'Terkirim' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {assignment.submitted_at
                          ? new Date(assignment.submitted_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "-"}
                      </td>
                      <td className="p-4">
                        <Badge variant={hasResponse ? "default" : "secondary"}>
                          {hasResponse ? "Sudah direspons" : "Belum direspons"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(assignment)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Lihat Detail
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detail Penugasan - {profiles[selectedAssignment?.user_id || ""]?.full_name} (Sesi {selectedAssignment?.session_number})
            </DialogTitle>
            <DialogDescription>
              Lihat jawaban peserta dan berikan respons konselor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Jawaban Peserta:</h4>
              <pre className="text-xs whitespace-pre-wrap bg-background p-3 rounded border max-h-[300px] overflow-y-auto">
                {JSON.stringify(selectedAssignment?.answers, null, 2)}
              </pre>
            </div>
            <div className="space-y-2">
              <Label htmlFor="counselor-response">Respons Konselor</Label>
              <Textarea
                id="counselor-response"
                rows={6}
                placeholder="Tulis respons atau feedback untuk peserta..."
                value={counselorResponse}
                onChange={(e) => setCounselorResponse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handleSaveResponse} className="bg-indigo-600 hover:bg-indigo-700">
              Simpan Respons
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpiritualPsikoedukasiAssignmentManagement;