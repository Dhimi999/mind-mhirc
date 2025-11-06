import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, ArrowLeft, FileText, Download, Send, Users, Upload, Trash2, Edit, ExternalLink, BookOpen, CheckCircle, UserCheck, SendHorizontal, Link as LinkIcon, Plus, X, ChevronLeft, ChevronRight, MessageCircle, Globe, Folder, Link2, PlayCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import PdfInlineViewer from "@/components/common/PdfInlineViewer";
import { sessionConfigs as spiritualIntervensiConfigs } from "@/pages/spiritual-budaya/intervensi/SpiritualIntervensiUnified";
import { sessionConfigs as spiritualPsikoedukasiConfigs } from "@/pages/spiritual-budaya/psikoedukasi/SpiritualPsikoedukasiUnified";
import { AssignmentFieldDisplayer } from "@/components/hibrida-naratif/fields/AssignmentFieldDisplayer";

type ProgramType = "intervensi" | "psikoedukasi";

interface SessionInfo {
  number: number;
  program: ProgramType;
  title: string;
}

interface GuidanceMaterials {
  guidance_text: string | null;
  // Support multiple items; will be serialized to newline-separated strings for storage compatibility
  guidance_pdf_url: string[];
  guidance_audio_url: string[];
  guidance_video_url: string[];
  guidance_links: { title: string; url: string; icon?: string }[];
}

// New Submission interface for multiple submissions support
interface Submission {
  id: string;
  user_id: string;
  session_number: number;
  submission_number: number;
  answers: any;
  counselor_response: string | null;
  counselor_name: string | null;
  submitted_at: string;
  responded_at: string | null;
}

interface Assignment {
  id: string;
  user_id: string;
  session_number: number;
  answers: any;
  submitted: boolean;
  submitted_at: string | null;
  submission_count?: number; // Total submissions for this user
}

interface UserProgress {
  id: string;
  user_id: string;
  session_number: number;
  counselor_response: string | null;
  counselor_name: string | null;
  responded_at: string | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
}

const SpiritualUnifiedAssignmentManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [view, setView] = useState<"list" | "guidance" | "answers" | "participants">("list");
  
  // Guidance editing state
  const [guidanceMaterials, setGuidanceMaterials] = useState<GuidanceMaterials>({
    guidance_text: null,
    guidance_pdf_url: [],
    guidance_audio_url: [],
    guidance_video_url: [],
    guidance_links: []
  });
  // Per-type single selection preview indices for admin (avoid embedding all)
  const [selectedPdfIndex, setSelectedPdfIndex] = useState<number | null>(null);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState<"pdf" | "audio" | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState<string>("auto");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Answers viewing state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [groups, setGroups] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<UserProgress | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [counselorResponse, setCounselorResponse] = useState("");
  
  // Multiple submissions support
  const [submissionsByUser, setSubmissionsByUser] = useState<Record<string, Submission[]>>({});
  const [selectedUserSubmissions, setSelectedUserSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedSubmissionTab, setSelectedSubmissionTab] = useState<string>("0"); // Tab index for submission selector
  
  // Filters for Answers view
  const [statusTab, setStatusTab] = useState<"all" | "draft" | "pending" | "done">("all");
  const [programFilter, setProgramFilter] = useState<ProgramType | null>(null);
  const [groupFilter, setGroupFilter] = useState<"all" | "A" | "B" | "C" | "none">("all");
  
  // Bulk response state
  const [isBulkResponseOpen, setIsBulkResponseOpen] = useState(false);
  const [bulkResponse, setBulkResponse] = useState("");

  // Participant list state
  const [allParticipants, setAllParticipants] = useState<UserProfile[]>([]);

  // Keep programFilter in sync with selected session (must be before any early returns)
  useEffect(() => {
    if (selectedSession) {
      setProgramFilter(selectedSession.program);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  const intervensiSessions: SessionInfo[] = Array.from({ length: 9 }, (_, i) => ({
    number: i,
    program: "intervensi" as ProgramType,
    title: i === 0 ? `Intervensi Pra-Sesi` : `Intervensi Sesi ${i}`
  }));

  const psikoedukasiSessions: SessionInfo[] = Array.from({ length: 9 }, (_, i) => ({
    number: i,
    program: "psikoedukasi" as ProgramType,
    title: i === 0 ? `Psikoedukasi Pra-Sesi` : `Psikoedukasi Sesi ${i}`
  }));

  const handleSessionClick = (session: SessionInfo, targetView: "guidance" | "answers" | "participants") => {
    setSelectedSession(session);
    setView(targetView);
    
    if (targetView === "guidance") {
      fetchGuidanceMaterials(session);
    } else if (targetView === "answers") {
      fetchSessionAssignments(session);
    } else if (targetView === "participants") {
      fetchAllParticipants(session);
    }
  };

  const fetchGuidanceMaterials = async (session: SessionInfo) => {
    try {
  const table = session.program === "intervensi" ? "sb_intervensi_meetings" : "sb_psikoedukasi_meetings";
      const { data, error } = await supabase
        .from(table as any)
        .select("guidance_text, guidance_pdf_url, guidance_audio_url, guidance_video_url, guidance_links")
        .eq("session_number", session.number)
        .maybeSingle();

      if (error) throw error;

      const toArray = (val: string | null): string[] => {
        if (!val) return [];
        const s = String(val).trim();
        if (!s) return [];
        if (s.startsWith("[") && s.endsWith("]")) {
          try {
            const arr = JSON.parse(s);
            if (Array.isArray(arr)) return arr.filter(Boolean);
          } catch {
            // noop for invalid JSON
            void 0;
          }
        }
        return s.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
      };

      setGuidanceMaterials({
        guidance_text: (data as any)?.guidance_text || null,
        guidance_pdf_url: toArray((data as any)?.guidance_pdf_url || null),
        guidance_audio_url: toArray((data as any)?.guidance_audio_url || null),
        guidance_video_url: toArray((data as any)?.guidance_video_url || null),
        guidance_links: ((data as any)?.guidance_links as any) || []
      });
    } catch (error: any) {
      console.error("Error fetching guidance:", error);
      toast.error("Gagal memuat panduan");
    }
  };

  const fetchSessionAssignments = async (session: SessionInfo, includeDraftsOverride?: boolean) => {
    setLoading(true);
    try {
      // Use new submission_history tables
      const submissionTable = session.program === "intervensi" 
        ? "sb_intervensi_submission_history" 
        : "sb_psikoedukasi_submission_history";

      // Fetch all submissions for this session, ordered by most recent first
      const { data: submissionsData, error: submissionsError } = await supabase
        .from(submissionTable as any)
        .select("*")
        .eq("session_number", session.number)
        .order("submitted_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Group submissions by user_id
      const submissionsByUserMap: Record<string, Submission[]> = {};
      submissionsData?.forEach((submission: any) => {
        const userId = submission.user_id;
        if (!submissionsByUserMap[userId]) {
          submissionsByUserMap[userId] = [];
        }
        submissionsByUserMap[userId].push(submission as Submission);
      });
      setSubmissionsByUser(submissionsByUserMap);

      // Create assignments array with unique users (using latest submission for display)
      const uniqueAssignments: Assignment[] = [];
      Object.keys(submissionsByUserMap).forEach(userId => {
        const userSubmissions = submissionsByUserMap[userId];
        if (userSubmissions.length > 0) {
          const latestSubmission = userSubmissions[0]; // Already sorted by submitted_at desc
          uniqueAssignments.push({
            id: latestSubmission.id,
            user_id: userId,
            session_number: session.number,
            answers: latestSubmission.answers,
            submitted: true,
            submitted_at: latestSubmission.submitted_at,
            submission_count: userSubmissions.length
          });
        }
      });

      const userIds = [...new Set(uniqueAssignments.map(a => a.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        const profilesMap: Record<string, UserProfile> = {};
        profilesData?.forEach(p => {
          profilesMap[p.id] = p;
        });
        setProfiles(profilesMap);

        // Fetch kelompok from sb_enrollments for all users
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("sb_enrollments" as any)
          .select("user_id, group_assignment")
          .in("user_id", userIds);

        if (enrollmentsError) throw enrollmentsError;

        const groupMap: Record<string, string | null> = {};
        enrollments?.forEach((e: any) => {
          groupMap[e.user_id as string] = (e.group_assignment as any) || null;
        });
        setGroups(groupMap);
      }

      setAssignments(uniqueAssignments);

      // Build progress map using latest submission per user for compatibility with filter logic
      const progressMap: Record<string, UserProgress> = {};
      uniqueAssignments.forEach(assignment => {
        const latestSubmission = submissionsByUserMap[assignment.user_id][0];
        progressMap[assignment.user_id] = {
          id: latestSubmission.id,
          user_id: assignment.user_id,
          session_number: session.number,
          counselor_response: latestSubmission.counselor_response,
          counselor_name: latestSubmission.counselor_name,
          responded_at: latestSubmission.responded_at
        };
      });
      setProgress(progressMap);
    } catch (error: any) {
      toast.error("Gagal memuat data penugasan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllParticipants = async (session: SessionInfo) => {
    setLoading(true);
    try {
  const progressTable = session.program === "intervensi" ? "sb_intervensi_user_progress" : "sb_psikoedukasi_user_progress";

      const { data: progressData, error: progressError } = await supabase
        .from(progressTable as any)
        .select("user_id, session_opened, meeting_done, assignment_done")
        .eq("session_number", session.number);

      if (progressError) throw progressError;

      const userIds = [...new Set(progressData?.map((p: any) => p.user_id) || [])];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        setAllParticipants(profilesData || []);
      }
    } catch (error: any) {
      toast.error("Gagal memuat daftar peserta");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGuidance = async () => {
    if (!selectedSession) return;

    try {
      const serialize = (arr: string[]): string | null => arr.length ? arr.join("\n") : null;
  const table = selectedSession.program === "intervensi" ? "sb_intervensi_meetings" : "sb_psikoedukasi_meetings";
      const { error } = await supabase
        .from(table as any)
        .update({
          guidance_text: guidanceMaterials.guidance_text,
          guidance_pdf_url: serialize(guidanceMaterials.guidance_pdf_url),
          guidance_audio_url: serialize(guidanceMaterials.guidance_audio_url),
          guidance_video_url: serialize(guidanceMaterials.guidance_video_url),
          guidance_links: guidanceMaterials.guidance_links as any
        })
        .eq("session_number", selectedSession.number);

      if (error) throw error;

      toast.success("Panduan berhasil disimpan");
    } catch (error: any) {
      toast.error("Gagal menyimpan panduan");
      console.error(error);
    }
  };

  const handleFileUpload = async (type: "pdf" | "audio", event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedSession) return;
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = type === "pdf" ? ["application/pdf"] : ["audio/mpeg", "audio/mp3", "audio/wav"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File harus berformat ${type === "pdf" ? "PDF" : "audio (MP3/WAV)"}`);
      return;
    }

    setUploadingFile(type);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedSession.program}/session-${selectedSession.number}/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('session-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('session-materials')
        .getPublicUrl(filePath);

      if (type === "pdf") {
        setGuidanceMaterials(prev => ({ ...prev, guidance_pdf_url: [...prev.guidance_pdf_url, publicUrl] }));
      } else {
        setGuidanceMaterials(prev => ({ ...prev, guidance_audio_url: [...prev.guidance_audio_url, publicUrl] }));
      }

      toast.success(`File ${type.toUpperCase()} berhasil diunggah`);
    } catch (error: any) {
      toast.error("Gagal mengunggah file: " + error.message);
    } finally {
      setUploadingFile(null);
    }
  };

  const handleDeleteFile = async (type: "pdf" | "audio", index: number) => {
    if (!selectedSession) return;
    const list = type === "pdf" ? guidanceMaterials.guidance_pdf_url : guidanceMaterials.guidance_audio_url;
    const url = list[index];
    if (!url) return;

    try {
      const pathMatch = url.match(/session-materials\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('session-materials')
          .remove([pathMatch[1]]);
      }

      if (type === "pdf") {
        setGuidanceMaterials(prev => ({ ...prev, guidance_pdf_url: prev.guidance_pdf_url.filter((_, i) => i !== index) }));
        setSelectedPdfIndex(prev => (prev === null ? null : prev === index ? null : prev > index ? prev - 1 : prev));
      } else {
        setGuidanceMaterials(prev => ({ ...prev, guidance_audio_url: prev.guidance_audio_url.filter((_, i) => i !== index) }));
        setSelectedAudioIndex(prev => (prev === null ? null : prev === index ? null : prev > index ? prev - 1 : prev));
      }

      toast.success(`File ${type.toUpperCase()} berhasil dihapus`);
    } catch (error: any) {
      toast.error("Gagal menghapus file");
    }
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast.error("Judul dan URL harus diisi");
      return;
    }

    setGuidanceMaterials(prev => ({
      ...prev,
      guidance_links: [...prev.guidance_links, { title: newLinkTitle, url: newLinkUrl, icon: newLinkIcon !== "auto" ? newLinkIcon : undefined }]
    }));

    setNewLinkTitle("");
    setNewLinkUrl("");
    setNewLinkIcon("auto");
  };

  const handleRemoveLink = (index: number) => {
    setGuidanceMaterials(prev => ({
      ...prev,
      guidance_links: prev.guidance_links.filter((_, i) => i !== index)
    }));
  };

  const getLinkIcon = (icon: string | undefined, url: string) => {
    const normalized = (icon || inferIconFromUrl(url));
    const cls = "h-4 w-4 text-indigo-600";
    switch (normalized) {
      case "youtube":
        return <PlayCircle className={cls} />;
      case "google-drive":
        return <Folder className={cls} />;
      case "facebook":
        return <Globe className={cls} />;
      case "whatsapp":
        return <MessageCircle className={cls} />;
      case "link":
        return <Link2 className={cls} />;
      default:
        return <ExternalLink className={cls} />;
    }
  };

  const inferIconFromUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const h = u.hostname;
      if (/youtu\.be|youtube\.com/.test(h)) return "youtube";
      if (/drive\.google\.com/.test(h)) return "google-drive";
      if (/facebook\.com/.test(h)) return "facebook";
      if (/wa\.me|whatsapp\.com/.test(h)) return "whatsapp";
      return "link";
    } catch {
      return "link";
    }
  };

  // Normalize a variety of YouTube URL formats (watch, youtu.be, shorts, embed) into embeddable URL
  const toYouTubeEmbedUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");

      const parseStartSeconds = (): number | null => {
        const t = u.searchParams.get("t") || u.searchParams.get("start");
        if (!t) return null;
        const match = /^((\d+)h)?((\d+)m)?((\d+)(s)?)?$/.exec(t);
        if (match) {
          const hours = match[2] ? parseInt(match[2], 10) : 0;
          const mins = match[4] ? parseInt(match[4], 10) : 0;
          const secs = match[6] ? parseInt(match[6], 10) : 0;
          return hours * 3600 + mins * 60 + secs;
        }
        const asInt = parseInt(t, 10);
        return isNaN(asInt) ? null : asInt;
      };

      let videoId: string | null = null;

      if (host.endsWith("youtu.be")) {
        videoId = u.pathname.split("/").filter(Boolean)[0] || null;
      } else if (host.endsWith("youtube.com")) {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts[0] === "watch") {
          videoId = u.searchParams.get("v");
        } else if (parts[0] === "embed" && parts[1]) {
          videoId = parts[1];
        } else if (parts[0] === "shorts" && parts[1]) {
          videoId = parts[1];
        }
      }

      if (videoId) {
        const start = parseStartSeconds();
        const startQuery = typeof start === "number" && start > 0 ? `?start=${start}` : "";
        return `https://www.youtube.com/embed/${videoId}${startQuery}`;
      }
      return url;
    } catch (_) {
      return url;
    }
  };

  const handleViewDetail = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    
    // Load all submissions for this user
    const userSubmissions = submissionsByUser[assignment.user_id] || [];
    setSelectedUserSubmissions(userSubmissions);
    
    // Select the latest submission by default
    const latestSubmission = userSubmissions[0] || null;
    setSelectedSubmission(latestSubmission);
    setSelectedSubmissionTab("0"); // Default to first tab (latest)
    
    // Set counselor response for selected submission
    setCounselorResponse(latestSubmission?.counselor_response || "");
    
    // For compatibility with existing code
    const userProgress = progress[assignment.user_id] || null;
    setSelectedProgress(userProgress);
    
    setIsDetailOpen(true);
  };

  const handleSaveResponse = async () => {
    if (!selectedSubmission || !selectedSession) return;

    try {
      const submissionTable = selectedSession.program === "intervensi" 
        ? "sb_intervensi_submission_history" 
        : "sb_psikoedukasi_submission_history";
      
      const { error } = await supabase
        .from(submissionTable as any)
        .update({
          counselor_response: counselorResponse,
          counselor_name: user?.full_name || "Konselor",
          responded_at: new Date().toISOString()
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast.success("Respons konselor berhasil disimpan");
      setIsDetailOpen(false);
      if (selectedSession) fetchSessionAssignments(selectedSession);
    } catch (error: any) {
      toast.error("Gagal menyimpan respons");
      console.error(error);
    }
  };

  const handleBulkResponse = async () => {
    if (!selectedSession || !bulkResponse.trim()) {
      toast.error("Respons tidak boleh kosong");
      return;
    }

    try {
      const submissionTable = selectedSession.program === "intervensi" 
        ? "sb_intervensi_submission_history" 
        : "sb_psikoedukasi_submission_history";
      
      // For bulk response, respond to the latest submission of each user
      const latestSubmissions: Submission[] = [];
      assignments.forEach(assignment => {
        const userSubmissions = submissionsByUser[assignment.user_id];
        if (userSubmissions && userSubmissions.length > 0) {
          latestSubmissions.push(userSubmissions[0]); // Latest submission
        }
      });

      for (const submission of latestSubmissions) {
        await supabase
          .from(submissionTable as any)
          .update({
            counselor_response: bulkResponse,
            counselor_name: user?.full_name || "Konselor",
            responded_at: new Date().toISOString()
          })
          .eq("id", submission.id);
      }

      toast.success(`Respons berhasil dikirim ke ${latestSubmissions.length} peserta`);
      setIsBulkResponseOpen(false);
      setBulkResponse("");
      if (selectedSession) fetchSessionAssignments(selectedSession);
    } catch (error: any) {
      toast.error("Gagal mengirim respons massal");
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    if (!selectedSession) return;
    const headers = ["Nama", "Tanggal Kirim", "Status Respons", "Konselor", "Tanggal Respons"];
    const rows = assignments.map(a => [
      profiles[a.user_id]?.full_name || "Tidak diketahui",
      a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("id-ID") : "",
      progress[a.user_id]?.counselor_response ? "Sudah direspons" : "Belum direspons",
      progress[a.user_id]?.counselor_name || "-",
      progress[a.user_id]?.responded_at ? new Date(progress[a.user_id].responded_at!).toLocaleDateString("id-ID") : "-"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSession.program}-sesi-${selectedSession.number}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Session List View
  const [listFilter, setListFilter] = useState<"all" | ProgramType>("all");

  if (view === "list") {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Spiritual & Budaya — Manajemen Penugasan</h1>
          <p className="text-muted-foreground">Kelola panduan penugasan, lihat jawaban peserta, dan kirim respons konselor.</p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded px-3 py-2 bg-background">
            <span className="text-xs text-muted-foreground">Filter Program:</span>
            <select className="text-sm bg-transparent" value={listFilter} onChange={e=> setListFilter(e.target.value as any)}>
              <option value="all">Semua</option>
              <option value="intervensi">Intervensi</option>
              <option value="psikoedukasi">Psikoedukasi</option>
            </select>
          </div>
        </div>

        <div className="space-y-8">
          {/* Intervensi Spiritual & Budaya Sessions */}
          {(listFilter === "all" || listFilter === "intervensi") && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Intervensi Spiritual & Budaya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {intervensiSessions.map(session => (
                <Card key={`intervensi-${session.number}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                        {session.number}
                      </div>
                      <Badge variant="outline" className="text-xs">Intervensi</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{session.number === 0 ? 'Pra-Sesi' : `Sesi ${session.number}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleSessionClick(session, "guidance")}>
                      <BookOpen className="h-3 w-3 mr-2" />
                      Edit Panduan
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleSessionClick(session, "answers")}>
                      <FileText className="h-3 w-3 mr-2" />
                      Lihat Jawaban
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleSessionClick(session, "participants")}>
                      <UserCheck className="h-3 w-3 mr-2" />
                      Daftar Peserta
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          )}

          {/* Psikoedukasi Sessions */}
          {(listFilter === "all" || listFilter === "psikoedukasi") && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-violet-600" />
              Psikoedukasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {psikoedukasiSessions.map(session => (
                <Card key={`psikoedukasi-${session.number}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-lg font-bold">
                        {session.number}
                      </div>
                      <Badge variant="outline" className="text-xs">Psikoedukasi</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{session.number === 0 ? 'Pra-Sesi' : `Sesi ${session.number}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleSessionClick(session, "guidance")}>
                      <BookOpen className="h-3 w-3 mr-2" />
                      Edit Panduan
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleSessionClick(session, "answers")}>
                      <FileText className="h-3 w-3 mr-2" />
                      Lihat Jawaban
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleSessionClick(session, "participants")}>
                      <UserCheck className="h-3 w-3 mr-2" />
                      Daftar Peserta
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  // Header for detail views
  const detailHeader = (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => { setSelectedSession(null); setView("list"); }} className="mb-2 sm:mb-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Sesi
          </Button>
          <h1 className="text-2xl font-semibold mt-2">{selectedSession?.title}</h1>
          <p className="text-muted-foreground">
            {view === "guidance" && "Kelola panduan penugasan untuk sesi ini"}
            {view === "answers" && "Lihat jawaban peserta dan berikan respons konselor"}
            {view === "participants" && "Daftar peserta yang mengakses sesi ini"}
          </p>
        </div>
        {selectedSession && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/intervensi-cbt")}> 
              <span className="hidden sm:inline">Masuk ke halaman Spiritual & Budaya</span>
              <span className="sm:hidden">Masuk ke layanan</span>
            </Button>
              <Button
              size="icon"
              variant="secondary"
              disabled={selectedSession.number <= 0}
              onClick={() => {
                const sessions = selectedSession.program === "intervensi" ? intervensiSessions : psikoedukasiSessions;
                const idx = sessions.findIndex(s => s.number === selectedSession.number);
                if (idx > 0) {
                  const prev = sessions[idx - 1];
                  handleSessionClick(prev, view as any);
                }
              }}
              aria-label="Sesi sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              disabled={selectedSession.number >= 8}
              onClick={() => {
                const sessions = selectedSession.program === "intervensi" ? intervensiSessions : psikoedukasiSessions;
                const idx = sessions.findIndex(s => s.number === selectedSession.number);
                if (idx >= 0 && idx < sessions.length - 1) {
                  const next = sessions[idx + 1];
                  handleSessionClick(next, view as any);
                }
              }}
              aria-label="Sesi selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Guidance Edit View
  if (view === "guidance") {
    return (
      <div>
        {detailHeader}
        
        <div className="space-y-6">
          {/* Text Guidance */}
          <Card>
            <CardHeader>
              <CardTitle>Teks Panduan</CardTitle>
              <CardDescription>Teks panduan yang akan ditampilkan di portal peserta</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={8}
                placeholder="Tulis panduan penugasan untuk sesi ini..."
                value={guidanceMaterials.guidance_text || ""}
                onChange={(e) => setGuidanceMaterials(prev => ({ ...prev, guidance_text: e.target.value }))}
                className="mb-4"
              />
            </CardContent>
          </Card>

          {/* PDF Upload (Multiple) */}
          <Card>
            <CardHeader>
              <CardTitle>File PDF (Opsional)</CardTitle>
              <CardDescription>Upload dokumen PDF untuk panduan tambahan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guidanceMaterials.guidance_pdf_url.length === 0 && (
                  <p className="text-xs text-muted-foreground">Belum ada PDF. Unggah satu atau lebih dokumen.</p>
                )}
                {guidanceMaterials.guidance_pdf_url.length > 0 && (
                  <div className="space-y-2">
                    {guidanceMaterials.guidance_pdf_url.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">PDF {idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Buka
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPdfIndex(prev => (prev === idx ? null : idx))}
                            aria-pressed={selectedPdfIndex === idx}
                          >
                            {selectedPdfIndex === idx ? (
                              <><EyeOff className="h-3 w-3 mr-1" /> Tutup</>
                            ) : (
                              <><Eye className="h-3 w-3 mr-1" /> Pratinjau</>
                            )}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteFile("pdf", idx)}>
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedPdfIndex !== null && guidanceMaterials.guidance_pdf_url[selectedPdfIndex] && (
                  <div className="border rounded-lg overflow-hidden">
                    <PdfInlineViewer fileUrl={guidanceMaterials.guidance_pdf_url[selectedPdfIndex]} />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload("pdf", e)}
                    disabled={uploadingFile === "pdf"}
                  />
                  {uploadingFile === "pdf" && <p className="text-xs text-muted-foreground mt-2">Mengunggah...</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Upload (Multiple) */}
          <Card>
            <CardHeader>
              <CardTitle>File Audio (Opsional)</CardTitle>
              <CardDescription>Upload file audio MP3/WAV untuk panduan audio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guidanceMaterials.guidance_audio_url.length === 0 && (
                  <p className="text-xs text-muted-foreground">Belum ada audio. Unggah satu atau lebih berkas.</p>
                )}
                {guidanceMaterials.guidance_audio_url.length > 0 && (
                  <div className="space-y-2">
                    {guidanceMaterials.guidance_audio_url.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Audio {idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Buka
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedAudioIndex(prev => (prev === idx ? null : idx))}
                            aria-pressed={selectedAudioIndex === idx}
                          >
                            {selectedAudioIndex === idx ? (
                              <><EyeOff className="h-3 w-3 mr-1" /> Tutup</>
                            ) : (
                              <><PlayCircle className="h-3 w-3 mr-1" /> Putar</>
                            )}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteFile("audio", idx)}>
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedAudioIndex !== null && guidanceMaterials.guidance_audio_url[selectedAudioIndex] && (
                  <audio controls className="w-full">
                    <source src={guidanceMaterials.guidance_audio_url[selectedAudioIndex]} />
                    Browser Anda tidak mendukung pemutar audio.
                  </audio>
                )}
                <div>
                  <Input
                    type="file"
                    accept=".mp3,.wav"
                    onChange={(e) => handleFileUpload("audio", e)}
                    disabled={uploadingFile === "audio"}
                  />
                  {uploadingFile === "audio" && <p className="text-xs text-muted-foreground mt-2">Mengunggah...</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video URL (Multiple YouTube links) */}
          <Card>
            <CardHeader>
              <CardTitle>Link Video YouTube (Opsional)</CardTitle>
              <CardDescription>Tambah satu atau lebih URL video YouTube untuk ditampilkan sebagai iframe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guidanceMaterials.guidance_video_url.length === 0 && (
                  <p className="text-xs text-muted-foreground">Belum ada video. Tambahkan satu atau lebih URL YouTube.</p>
                )}
                {guidanceMaterials.guidance_video_url.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={url} onChange={(e) => setGuidanceMaterials(prev => ({ ...prev, guidance_video_url: prev.guidance_video_url.map((u, i) => i === idx ? e.target.value : u) }))} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedVideoIndex(prev => (prev === idx ? null : idx))}
                      aria-pressed={selectedVideoIndex === idx}
                    >
                      {selectedVideoIndex === idx ? (
                        <><EyeOff className="h-4 w-4 mr-1" /> Tutup</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-1" /> Pratinjau</>
                      )}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                      setGuidanceMaterials(prev => ({ ...prev, guidance_video_url: prev.guidance_video_url.filter((_, i) => i !== idx) }));
                      setSelectedVideoIndex(prev => (prev === null ? null : prev === idx ? null : prev > idx ? prev - 1 : prev));
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                  />
                  <Button size="sm" onClick={() => {
                    const v = newVideoUrl.trim();
                    if (!v) return;
                    setGuidanceMaterials(prev => ({ ...prev, guidance_video_url: [...prev.guidance_video_url, v] }));
                    setNewVideoUrl("");
                  }}>
                    Tambah
                  </Button>
                </div>
                {selectedVideoIndex !== null && guidanceMaterials.guidance_video_url[selectedVideoIndex] && (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      width="1440"
                      height="810"
                      src={toYouTubeEmbedUrl(guidanceMaterials.guidance_video_url[selectedVideoIndex])}
                      title={`Pratinjau Video ${selectedVideoIndex + 1}`}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder={0}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>Tautan Eksternal (Opsional)</CardTitle>
              <CardDescription>Tambahkan link ke sumber eksternal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guidanceMaterials.guidance_links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded">
                  {getLinkIcon(link.icon, link.url)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium whitespace-normal break-words">{link.title}</p>
                    <p className="text-xs text-muted-foreground whitespace-normal break-all">{link.url}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveLink(index)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Judul link"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                />
                <Input
                  placeholder="URL link"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
                <div>
                  <label className="text-xs text-muted-foreground">Pilih ikon</label>
                  <select
                    className="mt-1 w-full border rounded px-2 py-2 text-sm bg-background"
                    value={newLinkIcon}
                    onChange={(e) => setNewLinkIcon(e.target.value)}
                  >
                    <option value="auto">Auto (berdasarkan URL)</option>
                    <option value="youtube">YouTube</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="link">Tautan</option>
                  </select>
                </div>
              </div>
              <Button size="sm" onClick={handleAddLink}>
                <Plus className="h-3 w-3 mr-2" />
                Tambah Link
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveGuidance} className="bg-indigo-600 hover:bg-indigo-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Simpan Panduan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Answers View
  if (view === "answers") {
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
        {detailHeader}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Button onClick={() => setIsBulkResponseOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <SendHorizontal className="h-4 w-4 mr-2" />
            Kirim Respons ke Semua
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Ekspor CSV
          </Button>
          <div className="ml-auto w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {/* Program filter */}
            <div className="flex items-center gap-2 text-sm w-full sm:w-auto">
              <label className="text-sm">Program</label>
              <select
                className="border rounded px-2 py-1 bg-background flex-1 sm:flex-none"
                value={programFilter || "intervensi"}
                onChange={(e) => {
                  const newProg = (e.target.value as ProgramType);
                  setProgramFilter(newProg);
                  if (selectedSession) {
                    const newTitle = `${newProg === "intervensi" ? "Intervensi Spiritual & Budaya" : "Psikoedukasi"} Sesi ${selectedSession.number}`;
                    const newSession = { ...selectedSession, program: newProg, title: newTitle } as SessionInfo;
                    setSelectedSession(newSession);
                    fetchSessionAssignments(newSession);
                  }
                }}
              >
                <option value="intervensi">Intervensi Spiritual & Budaya</option>
                <option value="psikoedukasi">Psikoedukasi</option>
              </select>
            </div>
            {/* Kelompok filter */}
            <div className="flex items-center gap-2 text-sm w-full sm:w-auto">
              <label className="text-sm">Kelompok</label>
              <select
                className="border rounded px-2 py-1 bg-background flex-1 sm:flex-none"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value as any)}
              >
                <option value="all">Semua</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="none">Belum</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{assignments.length} jawaban</span>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-4">
          <Tabs value={statusTab} onValueChange={(v) => {
            setStatusTab(v as any);
            if (selectedSession) fetchSessionAssignments(selectedSession);
          }}>
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Menunggu Balasan</TabsTrigger>
              <TabsTrigger value="done">Selesai</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium w-16">No.</th>
                  <th className="text-left p-4 font-medium">Nama Peserta</th>
                  <th className="text-left p-4 font-medium">Program</th>
                  <th className="text-left p-4 font-medium">Kelompok</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Tidak ada penugasan yang dikumpulkan.
                    </td>
                  </tr>
                ) : (
                  assignments
                    .filter((a) => {
                      // Apply statusTab filters using robust submitted detection
                      const userSubs = submissionsByUser[a.user_id] || [];
                      const isSubmitted = !!a.submitted || !!a.submitted_at;
                      const allResponded = userSubs.length > 0 && userSubs.every(s => !!s.counselor_response);
                      const anyUnresponded = userSubs.some(s => !s.counselor_response);
                      if (statusTab === "draft") return !isSubmitted;
                      if (statusTab === "pending") return isSubmitted && anyUnresponded;
                      if (statusTab === "done") return isSubmitted && allResponded;
                      return true;
                    })
                    .filter((a) => {
                      // Apply group filter
                      const g = groups[a.user_id] || null;
                      if (groupFilter === "all") return true;
                      if (groupFilter === "none") return g === null || g === undefined || g === "";
                      return g === groupFilter;
                    })
                    .map((assignment, idx) => {
                      const userSubs = submissionsByUser[assignment.user_id] || [];
                      const isSubmitted = !!assignment.submitted || !!assignment.submitted_at;
                      const allResponded = userSubs.length > 0 && userSubs.every(s => !!s.counselor_response);
                      const anyUnresponded = userSubs.some(s => !s.counselor_response);
                      const submissionCount = assignment.submission_count || 1;
                      const userProg = progress[assignment.user_id];
                      const hasResponse = !!userProg?.counselor_response;
                      let statusLabel = "Draft";
                      let statusVariant: any = "secondary";
                      if (isSubmitted) {
                        if (allResponded) {
                          statusLabel = "Selesai";
                          statusVariant = "default";
                        } else if (anyUnresponded) {
                          statusLabel = "Menunggu Balasan";
                          statusVariant = "outline";
                        }
                      }
                      const groupLabel = groups[assignment.user_id] || "-";
                      return (
                        <tr key={assignment.id} className="hover:bg-muted/30">
                          <td className="p-4 text-sm text-muted-foreground">{idx + 1}</td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span>{profiles[assignment.user_id]?.full_name || "Tidak diketahui"}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {submissionCount} Jawaban
                                </Badge>
                                {assignment.submitted_at && (
                                  <span className="text-xs text-muted-foreground">
                                    Terakhir: {new Date(assignment.submitted_at).toLocaleDateString("id-ID", { 
                                      day: "2-digit", 
                                      month: "short", 
                                      year: "numeric" 
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {selectedSession?.program === "intervensi" ? "Intervensi Spiritual & Budaya" : "Psikoedukasi"}
                          </td>
                          <td className="p-4">{groupLabel}</td>
                          <td className="p-4">
                            <Badge variant={statusVariant as any}>{statusLabel}</Badge>
                            {hasResponse && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Dijawab oleh {userProg?.counselor_name || "-"} pada {userProg?.responded_at ? new Date(userProg.responded_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetail(assignment)} className="inline-flex items-center">
                              <FileText className="h-3 w-3" />
                              <span className="hidden sm:inline ml-1">Lihat & Respons</span>
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

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Detail Jawaban - {profiles[selectedAssignment?.user_id || ""]?.full_name}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Lihat jawaban peserta dan berikan respons konselor.
              </DialogDescription>
            </DialogHeader>
            
            {/* Submission Selector Tabs */}
            {selectedUserSubmissions.length > 1 && (
              <div className="border-b">
                <Tabs value={selectedSubmissionTab} onValueChange={(value) => {
                  setSelectedSubmissionTab(value);
                  const selectedIndex = parseInt(value);
                  const submission = selectedUserSubmissions[selectedIndex];
                  setSelectedSubmission(submission);
                  setCounselorResponse(submission?.counselor_response || "");
                }}>
                  <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                    {selectedUserSubmissions.map((submission, idx) => {
                      const hasResponse = !!submission.counselor_response;
                      return (
                        <TabsTrigger key={idx} value={idx.toString()} className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm">
                          <span>Jawaban #{submission.submission_number}</span>
                          {hasResponse && (
                            <Badge variant="default" className="text-[10px] px-1 py-0">
                              ✓ Direspons
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
                <div className="py-2 px-1 text-xs text-muted-foreground">
                  {selectedSubmission && (
                    <>
                      Dikirim: {new Date(selectedSubmission.submitted_at).toLocaleDateString("id-ID", { 
                        day: "2-digit", 
                        month: "short", 
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                      {selectedSubmission.counselor_response && selectedSubmission.responded_at && (
                        <> • Direspons oleh {selectedSubmission.counselor_name} pada {new Date(selectedSubmission.responded_at).toLocaleDateString("id-ID", { 
                          day: "2-digit", 
                          month: "short", 
                          year: "numeric" 
                        })}</>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Jawaban Peserta:</h4>
                <div className="bg-background p-3 rounded border max-h-[360px] overflow-y-auto">
                  {selectedSubmission?.answers ? (
                    <div className="space-y-3 text-sm">
                      {selectedSession?.program === 'intervensi' && selectedSession.number === 1 && (
                        (() => {
                          const a: any = selectedSubmission?.answers || {};
                          const hasStructured = typeof a === 'object' && (
                            'situasi_pemicu' in a || 'pikiran_otomatis' in a || 'emosi' in a || 'perilaku' in a || 'coping' in a || 'teknik_metagora' in a
                          );
                          if (hasStructured) {
                            return (
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[12px] text-muted-foreground mb-1">(1) Situasi Pemicu Krisis</div>
                                  <div className="font-medium whitespace-pre-wrap">{a.situasi_pemicu || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-[12px] text-muted-foreground mb-1">(2) Pikiran Otomatis</div>
                                  <div className="font-medium whitespace-pre-wrap">{a.pikiran_otomatis || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-[12px] text-muted-foreground mb-1">(3) Emosi Terkait</div>
                                  <div className="font-medium whitespace-pre-wrap">{a.emosi || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-[12px] text-muted-foreground mb-1">(4) Perilaku/Respons</div>
                                  <div className="font-medium whitespace-pre-wrap">{a.perilaku || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-[12px] text-muted-foreground mb-1">(5) Strategi Koping Pribadi yang Sehat</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <div className="text-[11px] text-muted-foreground">a. Aktivitas</div>
                                      <div className="whitespace-pre-wrap">{a.coping?.aktivitas || '-'}</div>
                                    </div>
                                    <div>
                                      <div className="text-[11px] text-muted-foreground">b. Kontak</div>
                                      <div className="whitespace-pre-wrap">{a.coping?.kontak || '-'}</div>
                                    </div>
                                    <div>
                                      <div className="text-[11px] text-muted-foreground">c. Layanan Profesional/Darurat</div>
                                      <div className="whitespace-pre-wrap">{a.coping?.layanan || '-'}</div>
                                    </div>
                                    <div>
                                      <div className="text-[11px] text-muted-foreground">d. Lingkungan Aman</div>
                                      <div className="whitespace-pre-wrap">{a.coping?.lingkungan || '-'}</div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[12px] text-muted-foreground mb-1">(6) Teknik Metafora "Bingkai dalam Film"</div>
                                  <div className="font-medium whitespace-pre-wrap">{a.teknik_metagora || '-'}</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}
                      {/* Field-aware renderer (for all other sessions) */}
                      {!(selectedSession?.program === 'intervensi' && selectedSession.number === 1) && selectedSubmission?.answers && (
                        (() => {
                          // Get appropriate config based on program type
                          const configArray = selectedSession?.program === "psikoedukasi" 
                            ? spiritualPsikoedukasiConfigs 
                            : spiritualIntervensiConfigs;
                          const sessionConfig = configArray[selectedSession?.number || 0];
                          
                          if (sessionConfig && sessionConfig.assignmentFields) {
                            // Use field-aware renderer
                            return (
                              <div className="space-y-3">
                                {sessionConfig.assignmentFields.map((field: any) => {
                                  const value = selectedSubmission.answers[field.key];
                                  return (
                                    <AssignmentFieldDisplayer
                                      key={field.key}
                                      field={field}
                                      value={value}
                                    />
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          // Fallback to generic renderer if no config found
                          return (
                            <>
                              {Object.entries(selectedSubmission.answers).map(([key, value]) => (
                                <div key={key}>
                                  <div className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                                  <div className="text-muted-foreground break-words">
                                    {typeof value === 'string' || typeof value === 'number' ? (
                                      String(value)
                                    ) : Array.isArray(value) ? (
                                      <ul className="list-disc pl-5">
                                        {value.map((v, i) => (
                                          <li key={i} className="break-words">{typeof v === 'string' ? v : JSON.stringify(v)}</li>
                                        ))}
                                      </ul>
                                    ) : value && typeof value === 'object' ? (
                                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                    ) : (
                                      <span>-</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })()
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Tidak ada jawaban</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="counselor-response">Respons Konselor</Label>
                <Textarea
                  id="counselor-response"
                  rows={6}
                  placeholder="Tulis respons atau feedback untuk peserta..."
                  value={counselorResponse}
                  onChange={(e) => setCounselorResponse(e.target.value)}
                  disabled={!!selectedSubmission?.counselor_response && selectedSubmission?.counselor_name !== (user?.full_name || "")}
                />
                {!!selectedSubmission?.counselor_response && selectedSubmission?.counselor_name !== (user?.full_name || "") && (
                  <p className="text-xs text-muted-foreground">Hanya konselor {selectedSubmission?.counselor_name} yang dapat mengedit respons ini.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </Button>
              <Button onClick={handleSaveResponse} className="bg-indigo-600 hover:bg-indigo-700" disabled={!!selectedSubmission?.counselor_response && selectedSubmission?.counselor_name !== (user?.full_name || "")}>
                Simpan Respons
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Response Dialog */}
        <Dialog open={isBulkResponseOpen} onOpenChange={setIsBulkResponseOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kirim Respons ke Semua Peserta</DialogTitle>
              <DialogDescription>
                Respons ini akan dikirim ke {assignments.length} peserta yang telah mengumpulkan tugas.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                rows={8}
                placeholder="Tulis respons universal untuk semua peserta..."
                value={bulkResponse}
                onChange={(e) => setBulkResponse(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkResponseOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleBulkResponse} className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4 mr-2" />
                Kirim ke Semua
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Participants View
  if (view === "participants") {
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
        {detailHeader}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Peserta</CardTitle>
            <CardDescription>{allParticipants.length} peserta terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allParticipants.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada peserta yang mengakses sesi ini</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allParticipants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{participant.full_name || "Tidak diketahui"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default SpiritualUnifiedAssignmentManagement;