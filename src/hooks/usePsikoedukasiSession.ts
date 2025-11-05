import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SessionProgress {
  meetingDone: boolean;
  guideDone: boolean;
  assignmentDone: boolean;
  sessionOpened: boolean;
  counselorResponse?: string;
  counselorName?: string;
  respondedAt?: string;
}

export interface MeetingSchedule {
  date: string | null;
  time: string | null;
  link: string | null;
  description: string | null;
  guidance_text: string | null;
  guidance_pdf_url: string | null;
  guidance_audio_url: string | null;
  guidance_video_url: string | null;
  guidance_links: Array<{ title: string; url: string }> | null;
  group_key_used?: 'A' | 'B' | 'C' | null;
  has_group_schedules?: boolean;
}

export const usePsikoedukasiSession = (sessionNumber: number, userId: string | undefined) => {
  const [progress, setProgress] = useState<SessionProgress>({
    meetingDone: false,
    guideDone: false,
    assignmentDone: false,
    sessionOpened: false,
    counselorResponse: undefined,
    counselorName: undefined,
    respondedAt: undefined
  });
  const [meetingSchedule, setMeetingSchedule] = useState<MeetingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupAssignment, setGroupAssignment] = useState<'A'|'B'|'C'|'Admin'|null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [allGroupSchedules, setAllGroupSchedules] = useState<Partial<Record<'A'|'B'|'C', { date: string; time: string; link: string }>> | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      let detectedGroup: 'A' | 'B' | 'C' | 'Admin' | null = null;
      try {
        const { data: enroll, error: enrollErr } = await supabase
          .from('cbt_hibrida_enrollments' as any)
          .select('group_assignment, enrollment_status, role')
          .eq('user_id', userId)
          .maybeSingle();
        if (!enrollErr && enroll && (enroll as any).enrollment_status === 'approved') {
          detectedGroup = ((enroll as any).group_assignment as any) || null;
          setGroupAssignment(detectedGroup);
          setIsSuperAdmin((enroll as any).role === 'super-admin');
        } else {
          setGroupAssignment(null);
          setIsSuperAdmin(false);
        }
      } catch (e) {
        setGroupAssignment(null);
        setIsSuperAdmin(false);
      }

      try {
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle();
        if (!profErr && profile?.is_admin === true) {
          setIsSuperAdmin(true);
        }
      } catch {}

      const { data: progressData, error: progressError } = await supabase
        .from("cbt_psikoedukasi_user_progress" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (progressError && progressError.code !== "PGRST116") throw progressError;

      const { data: meetingData, error: meetingError } = await supabase
        .from("cbt_psikoedukasi_meetings" as any)
        .select("date, time, link, description, guidance_text, guidance_pdf_url, guidance_audio_url, guidance_video_url, guidance_links")
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (meetingError && meetingError.code !== "PGRST116") throw meetingError;

      if (progressData) {
        setProgress({
          meetingDone: (progressData as any).meeting_done || false,
          guideDone: (progressData as any).guide_done || false,
          assignmentDone: (progressData as any).assignment_done || false,
          sessionOpened: (progressData as any).session_opened || false,
          counselorResponse: (progressData as any).counselor_response || undefined,
          counselorName: (progressData as any).counselor_name || undefined,
          respondedAt: (progressData as any).responded_at || undefined
        });
      } else {
        await markSessionOpened();
      }

      if (meetingData) {
        const tryParse = (raw: string | null) => {
          if (!raw) return null as any;
          try { return JSON.parse(raw); } catch { return null as any; }
        };
        const rawLink: string | null = (meetingData as any).link;
        let parsed = tryParse(rawLink);
        if (!parsed && rawLink) {
          try { parsed = tryParse(decodeURIComponent(rawLink)); } catch {}
        }
        let date = (meetingData as any).date;
        let time = (meetingData as any).time;
        let link = (meetingData as any).link;
        let groupKeyUsed: 'A'|'B'|'C'|null = null;
        let hasGroupSchedules = false;
        if (parsed && (parsed.A || parsed.B || parsed.C)) {
          hasGroupSchedules = true;
          const key = (detectedGroup === 'A' || detectedGroup === 'B' || detectedGroup === 'C') ? detectedGroup : 'A';
          const entry = parsed[key] || parsed.A || parsed.B || parsed.C;
          date = entry?.date || null;
          time = entry?.time || null;
          link = entry?.link || null;
          groupKeyUsed = (parsed[key] ? key : (parsed.A ? 'A' : parsed.B ? 'B' : parsed.C ? 'C' : null)) as any;
          setAllGroupSchedules(parsed as any);
        } else {
          setAllGroupSchedules(null);
        }
        setMeetingSchedule({
          date: date || null,
          time: time || null,
          link: link || null,
          description: (meetingData as any).description || null,
          guidance_text: (meetingData as any).guidance_text || null,
          guidance_pdf_url: (meetingData as any).guidance_pdf_url || null,
          guidance_audio_url: (meetingData as any).guidance_audio_url || null,
          guidance_video_url: (meetingData as any).guidance_video_url || null,
          guidance_links: (meetingData as any).guidance_links || null,
          group_key_used: groupKeyUsed,
          has_group_schedules: hasGroupSchedules
        });
      } else {
        setMeetingSchedule(null);
      }
    } catch (error: any) {
      console.error("Error fetching session data:", error);
      toast.error("Gagal memuat data sesi");
    } finally {
      setLoading(false);
    }
  }, [userId, sessionNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markSessionOpened = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("cbt_psikoedukasi_user_progress" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          session_opened: true,
          meeting_done: false,
          assignment_done: false
        }, {
          onConflict: "user_id,session_number"
        });

      if (error) throw error;
      setProgress(prev => ({ ...prev, sessionOpened: true }));
    } catch (error: any) {
      console.error("Error marking session opened:", error);
    }
  }, [userId, sessionNumber]);

  const markMeetingDone = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("cbt_psikoedukasi_user_progress" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          meeting_done: true,
          session_opened: true
        }, {
          onConflict: "user_id,session_number"
        });

      if (error) throw error;
      setProgress(prev => ({ ...prev, meetingDone: true }));
      toast.success("Pertemuan ditandai selesai");
    } catch (error: any) {
      console.error("Error marking meeting done:", error);
      toast.error("Gagal menandai pertemuan selesai");
    }
  }, [userId, sessionNumber]);

  const markGuideDone = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("cbt_psikoedukasi_user_progress" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          guide_done: true,
          session_opened: true
        }, {
          onConflict: "user_id,session_number"
        });

      if (error) throw error;
      setProgress(prev => ({ ...prev, guideDone: true }));
      toast.success("Panduan penugasan ditandai selesai");
    } catch (error: any) {
      console.error("Error marking guide done:", error);
      toast.error("Gagal menandai panduan selesai");
    }
  }, [userId, sessionNumber]);

  const submitAssignment = useCallback(async (answers: any) => {
    if (!userId) return false;

    try {
      // 1) Tulis ke tabel assignments (current/latest)
      const { error: assignmentError } = await supabase
        .from("cbt_psikoedukasi_assignments" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          answers: answers,
          submitted: true,
          submitted_at: new Date().toISOString()
        }, {
          onConflict: "user_id,session_number"
        });

      if (assignmentError) throw assignmentError;

      // 2) Ambil submission_number terakhir dan hitung berikutnya
      let nextSubmissionNumber = 1;
      try {
        const { data: last } = await supabase
          .from('cbt_psikoedukasi_submission_history' as any)
          .select('submission_number')
          .eq('user_id', userId)
          .eq('session_number', sessionNumber)
          .order('submission_number', { ascending: false })
          .limit(1);
        if (last && last.length > 0) {
          nextSubmissionNumber = ((last[0] as any).submission_number || 0) + 1;
        }
      } catch {}

      // 3) Append ke tabel submission_history untuk mendukung multiple submissions
      const { error: histError } = await supabase
        .from('cbt_psikoedukasi_submission_history' as any)
        .insert({
          id: crypto.randomUUID(), // Generate UUID manually to avoid NULL constraint
          user_id: userId,
          session_number: sessionNumber,
          submission_number: nextSubmissionNumber,
          answers: answers,
          submitted_at: new Date().toISOString()
        });
      if (histError) {
        console.error('History insert error detail:', histError);
        throw histError;
      }

      // 4) Update progress
      const { error: progressError } = await supabase
        .from("cbt_psikoedukasi_user_progress" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          assignment_done: true,
          session_opened: true
        }, {
          onConflict: "user_id,session_number"
        });

      if (progressError) throw progressError;

      setProgress(prev => ({ ...prev, assignmentDone: true }));
      toast.success("Jawaban berhasil dikirim");
      return true;
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      toast.error("Gagal mengirim jawaban");
      return false;
    }
  }, [userId, sessionNumber]);

  const loadAssignment = useCallback(async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("cbt_psikoedukasi_assignments" as any)
        .select("answers")
        .eq("user_id", userId)
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      const raw = (data as any)?.answers;
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return raw;
    } catch (error: any) {
      console.error("Error loading assignment:", error);
      return null;
    }
  }, [userId, sessionNumber]);

  const autoSaveAssignment = useCallback(async (answers: any) => {
    if (!userId) return;

    try {
      await supabase
        .from("cbt_psikoedukasi_assignments" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          answers: answers,
          submitted: false
        }, {
          onConflict: "user_id,session_number"
        });
    } catch (error: any) {
      console.error("Error auto-saving assignment:", error);
    }
  }, [userId, sessionNumber]);

  const fetchSubmissionHistory = useCallback(async () => {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('cbt_psikoedukasi_submission_history' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('session_number', sessionNumber)
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Fetch psikoedukasi submission history failed', e);
      return [];
    }
  }, [userId, sessionNumber]);

  return {
    progress,
    meetingSchedule,
    loading,
    groupAssignment,
    isSuperAdmin,
    allGroupSchedules,
    markMeetingDone,
    markGuideDone,
    submitAssignment,
    loadAssignment,
    autoSaveAssignment,
    fetchSubmissionHistory,
    refetch: fetchData
  };
};