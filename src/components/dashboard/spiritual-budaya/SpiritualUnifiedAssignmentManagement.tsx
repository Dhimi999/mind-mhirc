import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, ArrowLeft, FileText, Download, Send, Users, Upload, Trash2, Edit, ExternalLink, BookOpen, CheckCircle, UserCheck, SendHorizontal, Link as LinkIcon, Plus, X, ChevronLeft, ChevronRight, MessageCircle, Globe, Folder, Link2, PlayCircle, Eye, EyeOff, ZoomIn, EyeIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [showBulkConfirmation, setShowBulkConfirmation] = useState(false);
  const [bulkResponseStats, setBulkResponseStats] = useState<{
    total: number;
    withExistingResponse: number;
    withoutResponse: number;
  }>({ total: 0, withExistingResponse: 0, withoutResponse: 0 });
  const [skipExistingResponses, setSkipExistingResponses] = useState(false);
  const [bulkResponseProgress, setBulkResponseProgress] = useState<{
    current: number;
    total: number;
    isProcessing: boolean;
  }>({ current: 0, total: 0, isProcessing: false });
  
  // Custom selection state
  const [submissionNumberFilter, setSubmissionNumberFilter] = useState<"all" | "latest" | "1" | "2" | "3" | "4" | "5" | "6" | "7">("latest");
  const [bulkGroupFilter, setBulkGroupFilter] = useState<"all" | "A" | "B" | "C" | "none">("all");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [selectAllRecipients, setSelectAllRecipients] = useState(true);

  // Participant list state
  const [allParticipants, setAllParticipants] = useState<UserProfile[]>([]);

  // Delete submission state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    userId: string;
    userName: string;
    submissions: Submission[];
  } | null>(null);
  const [selectedDeleteSubmissions, setSelectedDeleteSubmissions] = useState<Set<string>>(new Set());
  const [deleteAllMode, setDeleteAllMode] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Helper function to get target submissions based on filters
  const getFilteredSubmissions = () => {
    const filtered: Submission[] = [];

    assignments.forEach(assignment => {
      const userSubmissions = submissionsByUser[assignment.user_id];
      if (!userSubmissions || userSubmissions.length === 0) return;

      // Apply group filter
      const userGroup = groups[assignment.user_id];
      if (bulkGroupFilter !== "all") {
        if (bulkGroupFilter === "none" && userGroup !== null) return;
        if (bulkGroupFilter !== "none" && userGroup !== bulkGroupFilter) return;
      }

      // Apply submission number filter
      let targetSubmission: Submission | null = null;
      
      if (submissionNumberFilter === "latest") {
        targetSubmission = userSubmissions[0]; // Already sorted by submitted_at desc
      } else if (submissionNumberFilter === "all") {
        // For "all", we take the latest submission
        targetSubmission = userSubmissions[0];
      } else {
        // Specific submission number (1-7)
        const submissionNum = parseInt(submissionNumberFilter);
        targetSubmission = userSubmissions.find(s => s.submission_number === submissionNum) || null;
      }

      if (targetSubmission) {
        filtered.push(targetSubmission);
      }
    });

    return filtered;
  };

  const prepareBulkResponse = () => {
    if (!selectedSession || !bulkResponse.trim()) {
      toast.error("Respons tidak boleh kosong");
      return;
    }

    // Get filtered submissions based on custom filters
    const targetSubmissions = getFilteredSubmissions();
    
    let withExisting = 0;
    let withoutResponse = 0;

    targetSubmissions.forEach(submission => {
      if (submission.counselor_response && submission.counselor_response.trim()) {
        withExisting++;
      } else {
        withoutResponse++;
      }
    });

    // Initialize selected recipients (all selected by default)
    const recipientIds = new Set(targetSubmissions.map(s => s.user_id));
    setSelectedRecipients(recipientIds);
    setSelectAllRecipients(true);

    setBulkResponseStats({
      total: targetSubmissions.length,
      withExistingResponse: withExisting,
      withoutResponse: withoutResponse
    });

    setShowBulkConfirmation(true);
  };

  const handleBulkResponse = async () => {
    if (!selectedSession || !bulkResponse.trim()) {
      toast.error("Respons tidak boleh kosong");
      return;
    }

    if (selectedRecipients.size === 0) {
      toast.error("Pilih minimal satu penerima");
      return;
    }

    try {
      setShowBulkConfirmation(false);
      
      const submissionTable = selectedSession.program === "intervensi" 
        ? "sb_intervensi_submission_history" 
        : "sb_psikoedukasi_submission_history";
      
      // Get filtered submissions and apply recipient selection
      const targetSubmissions = getFilteredSubmissions().filter(
        submission => selectedRecipients.has(submission.user_id)
      );

      // Apply skip existing responses logic
      const submissionsToUpdate = skipExistingResponses
        ? targetSubmissions.filter(s => !s.counselor_response || !s.counselor_response.trim())
        : targetSubmissions;

      if (submissionsToUpdate.length === 0) {
        toast.info("Tidak ada submisi yang perlu diupdate");
        return;
      }

      // Set progress tracking
      setBulkResponseProgress({
        current: 0,
        total: submissionsToUpdate.length,
        isProcessing: true
      });

      const successUpdates: string[] = [];
      const failedUpdates: { userId: string; userName: string; error: string }[] = [];

      for (let i = 0; i < submissionsToUpdate.length; i++) {
        const submission = submissionsToUpdate[i];
        
        try {
          const { error } = await supabase
            .from(submissionTable as any)
            .update({
              counselor_response: bulkResponse,
              counselor_name: user?.full_name || "Konselor",
              responded_at: new Date().toISOString()
            })
            .eq("id", submission.id);

          if (error) throw error;
          
          successUpdates.push(submission.user_id);
          
          // Update progress
          setBulkResponseProgress({
            current: i + 1,
            total: submissionsToUpdate.length,
            isProcessing: true
          });
        } catch (err: any) {
          const userName = profiles[submission.user_id]?.full_name || "Unknown";
          failedUpdates.push({
            userId: submission.user_id,
            userName: userName,
            error: err.message || "Unknown error"
          });
        }
      }

      // Reset progress
      setBulkResponseProgress({
        current: 0,
        total: 0,
        isProcessing: false
      });

      // Show results
      if (failedUpdates.length === 0) {
        toast.success(`Respons berhasil dikirim ke ${successUpdates.length} peserta`);
      } else {
        toast.warning(
          `Berhasil: ${successUpdates.length}, Gagal: ${failedUpdates.length}. Periksa console untuk detail.`,
          { duration: 5000 }
        );
        console.error("Failed bulk response updates:", failedUpdates);
      }

      setIsBulkResponseOpen(false);
      setBulkResponse("");
      setSkipExistingResponses(false);
      setSubmissionNumberFilter("latest");
      setBulkGroupFilter("all");
      setSelectedRecipients(new Set());
      setSelectAllRecipients(true);
      
      if (selectedSession) fetchSessionAssignments(selectedSession);
    } catch (error: any) {
      setBulkResponseProgress({
        current: 0,
        total: 0,
        isProcessing: false
      });
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

  // Delete submissions functions
  const handleOpenDeleteDialog = (assignment: Assignment) => {
    const userSubmissions = submissionsByUser[assignment.user_id] || [];
    const userName = profiles[assignment.user_id]?.full_name || "Tidak diketahui";
    
    setDeleteTarget({
      userId: assignment.user_id,
      userName: userName,
      submissions: userSubmissions
    });
    
    // Reset selection
    setSelectedDeleteSubmissions(new Set());
    setDeleteAllMode(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteAllMode) {
      // All submissions will be deleted
      setShowDeleteConfirmation(true);
    } else if (selectedDeleteSubmissions.size === 0) {
      toast.error("Pilih minimal satu jawaban untuk dihapus");
      return;
    } else {
      setShowDeleteConfirmation(true);
    }
  };

  const handleDeleteSubmissions = async () => {
    if (!deleteTarget || !selectedSession) return;
    
    setIsDeleting(true);
    
    try {
      const submissionTable = selectedSession.program === "intervensi" 
        ? "sb_intervensi_submission_history" 
        : "sb_psikoedukasi_submission_history";
      
      let submissionIdsToDelete: string[] = [];
      
      if (deleteAllMode) {
        // Delete all submissions for this user
        submissionIdsToDelete = deleteTarget.submissions.map(s => s.id);
      } else {
        // Delete only selected submissions
        submissionIdsToDelete = Array.from(selectedDeleteSubmissions);
      }
      
      if (submissionIdsToDelete.length === 0) {
        toast.error("Tidak ada jawaban yang dipilih");
        setIsDeleting(false);
        return;
      }
      
      console.log("🗑️ Deleting submissions:", {
        table: submissionTable,
        ids: submissionIdsToDelete,
        userId: deleteTarget.userId,
        sessionNumber: selectedSession.number
      });
      
      // Delete submissions from database
      const { data: deletedData, error } = await supabase
        .from(submissionTable as any)
        .delete()
        .in("id", submissionIdsToDelete)
        .select();
      
      if (error) {
        console.error("❌ Delete error:", error);
        throw error;
      }
      
      console.log("✅ Deleted submissions:", deletedData);
      
      // Check remaining submissions in database
      const { data: remainingData, error: checkError } = await supabase
        .from(submissionTable as any)
        .select("id")
        .eq("user_id", deleteTarget.userId)
        .eq("session_number", selectedSession.number);
      
      if (checkError) {
        console.error("❌ Check error:", checkError);
      } else {
        console.log("📊 Remaining submissions in DB:", remainingData?.length || 0);
      }
      
      // If all submissions deleted, also clear user_progress
      const remainingSubmissions = deleteTarget.submissions.filter(
        s => !submissionIdsToDelete.includes(s.id)
      );
      
      if (remainingSubmissions.length === 0 || remainingData?.length === 0) {
        const progressTable = selectedSession.program === "intervensi" 
          ? "sb_intervensi_user_progress" 
          : "sb_psikoedukasi_user_progress";
        
        console.log("🧹 Clearing user_progress for user:", deleteTarget.userId);
        
        await supabase
          .from(progressTable as any)
          .update({
            counselor_response: null,
            counselor_name: null,
            responded_at: null
          })
          .eq("user_id", deleteTarget.userId)
          .eq("session_number", selectedSession.number);
      }
      
      toast.success(`${submissionIdsToDelete.length} jawaban berhasil dihapus`);
      
      // Close dialogs first
      setShowDeleteConfirmation(false);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      setSelectedDeleteSubmissions(new Set());
      setDeleteAllMode(false);
      
      // Force refresh from database with cache busting
      if (selectedSession) {
        console.log("🔄 Refreshing data from database...");
        await fetchSessionAssignments(selectedSession);
        console.log("✅ Data refreshed");
      }
    } catch (error: any) {
      console.error("Error deleting submissions:", error);
      toast.error("Gagal menghapus jawaban: " + (error.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
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
                  <th className="text-left p-4 font-medium">Jawaban Dikirim</th>
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
                            <span className="font-medium">{profiles[assignment.user_id]?.full_name || "Tidak diketahui"}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs text-green-900 bg-green-300 hover:bg-green-600 hover:text-white px-2 py-1">
                                  {submissionCount} {submissionCount === 1 ? 'jawaban' : 'jawaban'}
                                </Badge>
                              </div>
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
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewDetail(assignment)} className="inline-flex items-center" title="Lihat Detail">
                                <EyeIcon className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleOpenDeleteDialog(assignment)} className="inline-flex items-center text-red-600 hover:text-red-700 hover:bg-red-50" title="Hapus Jawaban">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
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
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Kirim Respons ke Semua Peserta - Custom Selection</DialogTitle>
              <DialogDescription>
                Pilih kriteria pengiriman dan penerima yang akan menerima respons
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
              <div className="py-4 space-y-6">
                {/* Response Text */}
                <div>
                  <Label htmlFor="bulk-response">Respons Universal</Label>
                  <Textarea
                    id="bulk-response"
                    rows={6}
                    placeholder="Tulis respons universal untuk peserta yang dipilih..."
                    value={bulkResponse}
                    onChange={(e) => setBulkResponse(e.target.value)}
                    disabled={bulkResponseProgress.isProcessing}
                  />
                </div>

                {/* Custom Selection Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="space-y-2">
                    <Label htmlFor="submission-filter">Pilih Nomor Jawaban</Label>
                    <Select 
                      value={submissionNumberFilter} 
                      onValueChange={(val) => setSubmissionNumberFilter(val as any)}
                      disabled={bulkResponseProgress.isProcessing}
                    >
                      <SelectTrigger id="submission-filter">
                        <SelectValue placeholder="Pilih jawaban..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Jawaban Paling Akhir</SelectItem>
                        <SelectItem value="all">Semua Jawaban (Latest per User)</SelectItem>
                        <SelectItem value="1">Jawaban #1</SelectItem>
                        <SelectItem value="2">Jawaban #2</SelectItem>
                        <SelectItem value="3">Jawaban #3</SelectItem>
                        <SelectItem value="4">Jawaban #4</SelectItem>
                        <SelectItem value="5">Jawaban #5</SelectItem>
                        <SelectItem value="6">Jawaban #6</SelectItem>
                        <SelectItem value="7">Jawaban #7</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Tentukan jawaban keberapa yang akan menerima respons
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-filter">Filter Grup</Label>
                    <Select 
                      value={bulkGroupFilter} 
                      onValueChange={(val) => setBulkGroupFilter(val as any)}
                      disabled={bulkResponseProgress.isProcessing}
                    >
                      <SelectTrigger id="group-filter">
                        <SelectValue placeholder="Pilih grup..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Grup</SelectItem>
                        <SelectItem value="A">Grup A</SelectItem>
                        <SelectItem value="B">Grup B</SelectItem>
                        <SelectItem value="C">Grup C</SelectItem>
                        <SelectItem value="none">Tanpa Grup</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Batasi pengiriman berdasarkan grup peserta
                    </p>
                  </div>
                </div>

                {/* Skip existing responses option */}
                <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Checkbox
                    id="skip-existing"
                    checked={skipExistingResponses}
                    onCheckedChange={(checked) => setSkipExistingResponses(checked as boolean)}
                    disabled={bulkResponseProgress.isProcessing}
                  />
                  <Label 
                    htmlFor="skip-existing" 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Lewati peserta yang sudah memiliki respons (hanya kirim ke yang belum direspons)
                  </Label>
                </div>

                {/* Progress bar */}
                {bulkResponseProgress.isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mengirim respons...</span>
                      <span>{bulkResponseProgress.current} / {bulkResponseProgress.total}</span>
                    </div>
                    <Progress 
                      value={(bulkResponseProgress.current / bulkResponseProgress.total) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBulkResponseOpen(false);
                  setBulkResponse("");
                  setSkipExistingResponses(false);
                  setSubmissionNumberFilter("latest");
                  setBulkGroupFilter("all");
                  setSelectedRecipients(new Set());
                  setSelectAllRecipients(true);
                }}
                disabled={bulkResponseProgress.isProcessing}
              >
                Batal
              </Button>
              <Button 
                onClick={prepareBulkResponse} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={bulkResponseProgress.isProcessing || !bulkResponse.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Lanjutkan ke Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog with Recipient Selection */}
        <Dialog open={showBulkConfirmation} onOpenChange={setShowBulkConfirmation}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Konfirmasi dan Pilih Penerima
              </DialogTitle>
              <DialogDescription>
                Pilih peserta yang akan menerima respons
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-250px)]">
              <div className="py-4 space-y-4">
                {/* Summary */}
                <div className="p-4 bg-slate-50 rounded-lg border space-y-2">
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-base mb-2">Ringkasan Pengiriman:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Filter Jawaban:</span>
                        <Badge variant="outline">
                          {submissionNumberFilter === "latest" ? "Paling Akhir" : 
                           submissionNumberFilter === "all" ? "Semua" : 
                           `Jawaban #${submissionNumberFilter}`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Filter Grup:</span>
                        <Badge variant="outline">
                          {bulkGroupFilter === "all" ? "Semua Grup" :
                           bulkGroupFilter === "none" ? "Tanpa Grup" :
                           `Grup ${bulkGroupFilter}`}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <p>• Total penerima yang memenuhi kriteria: <strong>{bulkResponseStats.total}</strong> peserta</p>
                      <p>• Dipilih untuk dikirim: <strong>{selectedRecipients.size}</strong> peserta</p>
                      {!skipExistingResponses && (
                        <>
                          <p>• Belum direspons: <strong>{bulkResponseStats.withoutResponse}</strong> peserta</p>
                          <p className="text-amber-600">• Sudah direspons (akan ditimpa): <strong>{bulkResponseStats.withExistingResponse}</strong> peserta</p>
                        </>
                      )}
                    </div>
                  </div>

                  {!skipExistingResponses && bulkResponseStats.withExistingResponse > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        <strong>Peringatan:</strong> Beberapa respons yang sudah ada akan ditimpa dengan respons baru ini.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recipient List with Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Daftar Penerima</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-recipients"
                        checked={selectAllRecipients}
                        onCheckedChange={(checked) => {
                          setSelectAllRecipients(checked as boolean);
                          if (checked) {
                            const allIds = getFilteredSubmissions().map(s => s.user_id);
                            setSelectedRecipients(new Set(allIds));
                          } else {
                            setSelectedRecipients(new Set());
                          }
                        }}
                      />
                      <Label htmlFor="select-all-recipients" className="text-sm font-normal cursor-pointer">
                        Pilih Semua
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                    {getFilteredSubmissions().map((submission) => {
                      const userName = profiles[submission.user_id]?.full_name || "Unknown";
                      const userGroup = groups[submission.user_id];
                      const hasResponse = submission.counselor_response && submission.counselor_response.trim();
                      const isSelected = selectedRecipients.has(submission.user_id);

                      return (
                        <div 
                          key={submission.id} 
                          className={`flex items-center gap-3 p-3 hover:bg-slate-50 ${hasResponse ? 'bg-amber-50/30' : ''}`}
                        >
                          <Checkbox
                            id={`recipient-${submission.user_id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedRecipients);
                              if (checked) {
                                newSelected.add(submission.user_id);
                              } else {
                                newSelected.delete(submission.user_id);
                                setSelectAllRecipients(false);
                              }
                              setSelectedRecipients(newSelected);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Label 
                                htmlFor={`recipient-${submission.user_id}`}
                                className="font-medium cursor-pointer"
                              >
                                {userName}
                              </Label>
                              {userGroup && (
                                <Badge variant="secondary" className="text-xs">
                                  Grup {userGroup}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Jawaban #{submission.submission_number}
                              </Badge>
                              {hasResponse && (
                                <Badge variant="destructive" className="text-xs">
                                  Akan Ditimpa
                                </Badge>
                              )}
                            </div>
                            {hasResponse && submission.counselor_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Respons sebelumnya oleh: {submission.counselor_name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {getFilteredSubmissions().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Tidak ada peserta yang memenuhi kriteria filter</p>
                      <p className="text-sm mt-1">Coba ubah filter jawaban atau grup</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowBulkConfirmation(false)}
              >
                Kembali
              </Button>
              <Button 
                onClick={handleBulkResponse}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={selectedRecipients.size === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim ke {selectedRecipients.size} Peserta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Submissions Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Hapus Jawaban - {deleteTarget?.userName}
              </DialogTitle>
              <DialogDescription>
                Pilih jawaban yang ingin dihapus atau hapus semua jawaban
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-250px)]">
              <div className="py-4 space-y-4">
                {/* Delete All Option */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="delete-all"
                      checked={deleteAllMode}
                      onCheckedChange={(checked) => {
                        setDeleteAllMode(checked as boolean);
                        if (checked) {
                          setSelectedDeleteSubmissions(new Set());
                        }
                      }}
                    />
                    <Label htmlFor="delete-all" className="text-sm font-medium cursor-pointer text-red-700">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Hapus SEMUA jawaban ({deleteTarget?.submissions.length || 0} jawaban)
                    </Label>
                  </div>
                  {deleteAllMode && (
                    <p className="text-xs text-red-600 mt-2 ml-6">
                      ⚠️ Tindakan ini akan menghapus semua jawaban peserta ini untuk sesi ini dan tidak dapat dibatalkan!
                    </p>
                  )}
                </div>

                {/* Individual Submission Selection */}
                {!deleteAllMode && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Pilih Jawaban yang Ingin Dihapus:</Label>
                    
                    <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                      {deleteTarget?.submissions.map((submission) => {
                        const isSelected = selectedDeleteSubmissions.has(submission.id);
                        const hasResponse = submission.counselor_response && submission.counselor_response.trim();
                        
                        return (
                          <div key={submission.id} className="p-4 hover:bg-slate-50">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`delete-${submission.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedDeleteSubmissions);
                                  if (checked) {
                                    newSelected.add(submission.id);
                                  } else {
                                    newSelected.delete(submission.id);
                                  }
                                  setSelectedDeleteSubmissions(newSelected);
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Label 
                                    htmlFor={`delete-${submission.id}`}
                                    className="font-semibold cursor-pointer text-base"
                                  >
                                    Jawaban #{submission.submission_number}
                                  </Label>
                                  <Badge variant="outline" className="text-xs">
                                    {new Date(submission.submitted_at).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short", 
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </Badge>
                                  {hasResponse && (
                                    <Badge variant="default" className="text-xs bg-green-600">
                                      ✓ Sudah Direspons
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Preview Jawaban */}
                                <div className="mt-2 p-3 bg-slate-50 rounded border text-sm">
                                  <p className="font-medium text-xs text-muted-foreground mb-1">Preview Jawaban:</p>
                                  <div className="max-h-32 overflow-y-auto">
                                    {(() => {
                                      const configArray = selectedSession?.program === "psikoedukasi" 
                                        ? spiritualPsikoedukasiConfigs 
                                        : spiritualIntervensiConfigs;
                                      const sessionConfig = configArray[selectedSession?.number || 0];
                                      
                                      if (sessionConfig && sessionConfig.assignmentFields && submission.answers) {
                                        // Show first 2 fields as preview
                                        return sessionConfig.assignmentFields.slice(0, 2).map((field: any) => {
                                          const value = submission.answers[field.key];
                                          const displayValue = typeof value === 'string' 
                                            ? value.substring(0, 100) + (value.length > 100 ? '...' : '')
                                            : JSON.stringify(value).substring(0, 100);
                                          
                                          return (
                                            <div key={field.key} className="mb-1">
                                              <span className="text-xs font-medium">{field.label}: </span>
                                              <span className="text-xs text-muted-foreground">{displayValue || '-'}</span>
                                            </div>
                                          );
                                        });
                                      }
                                      
                                      // Fallback preview
                                      const firstKey = Object.keys(submission.answers)[0];
                                      const firstValue = submission.answers[firstKey];
                                      const preview = typeof firstValue === 'string' 
                                        ? firstValue.substring(0, 150)
                                        : JSON.stringify(firstValue).substring(0, 150);
                                      
                                      return (
                                        <p className="text-xs text-muted-foreground">
                                          {preview}...
                                        </p>
                                      );
                                    })()}
                                  </div>
                                </div>
                                
                                {hasResponse && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    Respons oleh: {submission.counselor_name} • {new Date(submission.responded_at!).toLocaleDateString("id-ID")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {deleteTarget?.submissions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Tidak ada jawaban untuk dihapus</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteTarget(null);
                  setSelectedDeleteSubmissions(new Set());
                  setDeleteAllMode(false);
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                variant="destructive"
                disabled={!deleteAllMode && selectedDeleteSubmissions.size === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteAllMode 
                  ? `Hapus Semua (${deleteTarget?.submissions.length || 0})` 
                  : `Hapus ${selectedDeleteSubmissions.size} Jawaban`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Konfirmasi Penghapusan
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus jawaban?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <p className="font-medium text-sm">Data yang akan dihapus:</p>
                <ul className="text-sm space-y-1">
                  <li>• Peserta: <strong>{deleteTarget?.userName}</strong></li>
                  <li>• Sesi: <strong>{selectedSession?.title}</strong></li>
                  <li>• Jumlah jawaban: <strong>
                    {deleteAllMode 
                      ? `Semua (${deleteTarget?.submissions.length})` 
                      : selectedDeleteSubmissions.size}
                  </strong></li>
                </ul>
              </div>
              <p className="text-sm text-red-600 mt-4 font-medium">
                ⚠️ Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button 
                onClick={handleDeleteSubmissions}
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ya, Hapus Sekarang
                  </>
                )}
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