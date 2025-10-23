import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SessionProgress {
  meetingDone: boolean;
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
  // metadata about schedule resolution
  group_key_used?: 'A' | 'B' | 'C' | null;
  has_group_schedules?: boolean;
}

export const useHibridaSession = (sessionNumber: number, userId: string | undefined) => {
  const [progress, setProgress] = useState<SessionProgress>({
    meetingDone: false,
    assignmentDone: false,
    sessionOpened: false,
    counselorResponse: undefined
  });
  const [meetingSchedule, setMeetingSchedule] = useState<MeetingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupAssignment, setGroupAssignment] = useState<'A'|'B'|'C'|'Admin'|null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [allGroupSchedules, setAllGroupSchedules] = useState<Partial<Record<'A'|'B'|'C', { date: string; time: string; link: string }>> | null>(null);

  // Fetch progress dan meeting schedule
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Determine participant group (A/B/C/Admin) if any
      let groupAssignment: 'A' | 'B' | 'C' | 'Admin' | null = null;
      try {
        const { data: enroll, error: enrollErr } = await supabase
          .from('hibrida_enrollments')
          .select('group_assignment, enrollment_status, role')
          .eq('user_id', userId)
          .maybeSingle();
        if (!enrollErr && enroll && enroll.enrollment_status === 'approved') {
          groupAssignment = (enroll.group_assignment as any) || null;
          setGroupAssignment(groupAssignment);
          // also check profiles.is_admin below
          setIsSuperAdmin(enroll.role === 'super-admin');
        } else {
          setGroupAssignment(null);
          setIsSuperAdmin(false);
        }
      } catch (e) {
        setGroupAssignment(null);
        setIsSuperAdmin(false);
      }

      // Augment super-admin detection with profiles.is_admin flag
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

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("hibrida_user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (progressError && progressError.code !== "PGRST116") throw progressError;

      // Fetch meeting schedule with guidance materials
      const { data: meetingData, error: meetingError } = await supabase
        .from("hibrida_meetings")
        .select("date, time, link, description, guidance_text, guidance_pdf_url, guidance_audio_url, guidance_video_url, guidance_links")
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (meetingError && meetingError.code !== "PGRST116") throw meetingError;

      if (progressData) {
        setProgress({
          meetingDone: progressData.meeting_done || false,
          assignmentDone: progressData.assignment_done || false,
          sessionOpened: progressData.session_opened || false,
          counselorResponse: progressData.counselor_response || undefined,
          counselorName: progressData.counselor_name || undefined,
          respondedAt: progressData.responded_at || undefined
        });
      } else {
        // Create initial progress record
        await markSessionOpened();
      }

      if (meetingData) {
        // Support per-group meeting schedule encoded as JSON in `link` column
        const tryParse = (raw: string | null) => {
          if (!raw) return null as any;
          try { return JSON.parse(raw); } catch { return null as any; }
        };
        const rawLink: string | null = meetingData.link;
        let parsed = tryParse(rawLink);
        if (!parsed && rawLink) {
          // Attempt to parse URL-encoded JSON
          try { parsed = tryParse(decodeURIComponent(rawLink)); } catch {}
        }
        let date = meetingData.date;
        let time = meetingData.time;
        let link = meetingData.link;
        let groupKeyUsed: 'A'|'B'|'C'|null = null;
        let hasGroupSchedules = false;
        if (parsed && (parsed.A || parsed.B || parsed.C)) {
          hasGroupSchedules = true;
          const key = (groupAssignment === 'A' || groupAssignment === 'B' || groupAssignment === 'C') ? groupAssignment : 'A';
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
          description: meetingData.description || null,
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

  // Mark session as opened
  const markSessionOpened = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("hibrida_user_progress")
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

  // Mark meeting as done
  const markMeetingDone = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("hibrida_user_progress")
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

  // Submit assignment
  const submitAssignment = useCallback(async (answers: any) => {
    if (!userId) return false;

    try {
      // Save assignment
      const { error: assignmentError } = await supabase
        .from("hibrida_assignments")
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

      // Update progress
      const { error: progressError } = await supabase
        .from("hibrida_user_progress")
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
      toast.success("Penugasan berhasil dikirim");
      return true;
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      toast.error("Gagal mengirim penugasan");
      return false;
    }
  }, [userId, sessionNumber]);

  // Load assignment (for auto-save restoration)
  const loadAssignment = useCallback(async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("hibrida_assignments")
        .select("answers")
        .eq("user_id", userId)
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data?.answers || null;
    } catch (error: any) {
      console.error("Error loading assignment:", error);
      return null;
    }
  }, [userId, sessionNumber]);

  // Auto-save assignment (debounced save)
  const autoSaveAssignment = useCallback(async (answers: any) => {
    if (!userId) return;

    try {
      await supabase
        .from("hibrida_assignments")
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

  return {
    progress,
    meetingSchedule,
    loading,
    groupAssignment,
    isSuperAdmin,
    allGroupSchedules,
    markMeetingDone,
    submitAssignment,
    loadAssignment,
    autoSaveAssignment,
    refetch: fetchData
  };
};
