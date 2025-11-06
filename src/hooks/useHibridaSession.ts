import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SessionProgress {
  meetingDone: boolean;
  assignmentDone: boolean;
  sessionOpened: boolean;
  guidanceRead?: boolean;
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
  start_time?: string | null;
  end_time?: string | null;
}

export const useHibridaSession = (sessionNumber: number, userId: string | undefined) => {
  const [progress, setProgress] = useState<SessionProgress>({
    meetingDone: false,
    assignmentDone: false,
    sessionOpened: false,
    guidanceRead: false,
    counselorResponse: undefined
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
      let groupAssignment: 'A' | 'B' | 'C' | 'Admin' | null = null;
      try {
        const { data: enroll, error: enrollErr } = await supabase
          .from('cbt_hibrida_enrollments' as any)
          .select('group_assignment, enrollment_status, role')
          .eq('user_id', userId)
          .maybeSingle();
        if (!enrollErr && enroll && (enroll as any).enrollment_status === 'approved') {
          groupAssignment = ((enroll as any).group_assignment as any) || null;
          setGroupAssignment(groupAssignment);
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
        .from("cbt_hibrida_user_progress" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (progressError && progressError.code !== "PGRST116") throw progressError;

      const { data: meetingData, error: meetingError } = await supabase
        .from("cbt_hibrida_meetings" as any)
        .select("date, time, link, description, guidance_text, guidance_pdf_url, guidance_audio_url, guidance_video_url, guidance_links")
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (meetingError && meetingError.code !== "PGRST116") throw meetingError;

      if (progressData) {
        setProgress({
          meetingDone: (progressData as any).meeting_done || false,
          assignmentDone: (progressData as any).assignment_done || false,
          sessionOpened: (progressData as any).session_opened || false,
          guidanceRead: (progressData as any).guidance_read || false,
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
        
        // Helper to convert dot notation time (HH.mm) to colon notation (HH:mm)
        const dotToColon = (timeStr: string | null | undefined) => {
          if (!timeStr) return '';
          return timeStr.replace('.', ':');
        };
        
        const rawLinkAny = (meetingData as any).link;
        const rawTimeAny = (meetingData as any).time;
        // Normalize possible object/jsonb values from Supabase
        const rawLink: any = rawLinkAny;
        const rawTime: any = rawTimeAny;
        
        let parsed: any = null;
        if (rawLink && typeof rawLink === 'object') {
          parsed = rawLink;
        } else {
          parsed = tryParse(rawLink as string | null);
        }
        if (!parsed && rawLink) {
          try { parsed = tryParse(decodeURIComponent(rawLink as string)); } catch {}
        }
        
        // Parse time JSON if it's not a group schedule
        let parsedTime: any = null;
        if (rawTime && typeof rawTime === 'object') {
          parsedTime = rawTime;
        } else {
          parsedTime = tryParse(rawTime as string | null);
        }
        let start_time: string | null = null;
        let end_time: string | null = null;
        
        // If time is JSON with start/end fields, extract them
        if (parsedTime && typeof parsedTime === 'object' && !Array.isArray(parsedTime)) {
          if (parsedTime.start) start_time = dotToColon(parsedTime.start);
          if (parsedTime.end) end_time = dotToColon(parsedTime.end);
        }
        
        let date = (meetingData as any).date;
        let time = rawTime as string | null;
        let link = (meetingData as any).link as string | null;
        let groupKeyUsed: 'A'|'B'|'C'|null = null;
        let hasGroupSchedules = false;
        
        if (parsed && (parsed.A || parsed.B || parsed.C)) {
          hasGroupSchedules = true;
          const key = (groupAssignment === 'A' || groupAssignment === 'B' || groupAssignment === 'C') ? groupAssignment : 'A';
          const entry = parsed[key] || parsed.A || parsed.B || parsed.C;
          date = entry?.date || null;
          time = entry?.time || null;
          link = entry?.link || null;
          
          // Extract start_time and end_time from group schedule if available
          if (entry) {
            start_time = entry.start_time || null;
            end_time = entry.end_time || null;
          }
          
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
          has_group_schedules: hasGroupSchedules,
          start_time: start_time,
          end_time: end_time,
          // attach all schedules for super-admin view consumers expecting it on the object
          ...(hasGroupSchedules ? { all_group_schedules: parsed } : {})
        } as any);
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
        .from("cbt_hibrida_user_progress" as any)
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

  const updateProgress = useCallback(async (updates: Partial<Record<string, any>>) => {
    if (!userId) return;

    try {
      // Convert camelCase keys to snake_case for database
      const snakeCaseMap: Record<string, string> = {
        meetingDone: 'meeting_done',
        assignmentDone: 'assignment_done',
        sessionOpened: 'session_opened',
        guidanceRead: 'guidance_read',
        counselorResponse: 'counselor_response',
      };
      
      const dbUpdates: Record<string, any> = {};
      Object.keys(updates).forEach(key => {
        const dbKey = snakeCaseMap[key] || key;
        dbUpdates[dbKey] = updates[key];
      });

      const { error } = await supabase
        .from("cbt_hibrida_user_progress" as any)
        .upsert({
          user_id: userId,
          session_number: sessionNumber,
          ...dbUpdates
        }, {
          onConflict: "user_id,session_number"
        });

      if (error) throw error;
      
      // Update local state based on changes
      const camelCaseMap: Record<string, keyof SessionProgress> = {
        meeting_done: 'meetingDone',
        assignment_done: 'assignmentDone',
        session_opened: 'sessionOpened',
        guidance_read: 'guidanceRead',
      };
      
      const localUpdates: Partial<SessionProgress> = {};
      Object.keys(updates).forEach(key => {
        if (key in snakeCaseMap) {
          // Already in camelCase
          (localUpdates as any)[key] = updates[key];
        } else if (camelCaseMap[key]) {
          // In snake_case, convert to camelCase
          (localUpdates as any)[camelCaseMap[key]] = updates[key];
        }
      });
      
      if (Object.keys(localUpdates).length > 0) {
        setProgress(prev => ({ ...prev, ...localUpdates }));
      }
    } catch (error: any) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }, [userId, sessionNumber]);

  const markMeetingDone = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("cbt_hibrida_user_progress" as any)
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

  const submitAssignment = useCallback(async (answers: any) => {
    if (!userId) return false;

    try {
      // 1) Tulis ke tabel assignments (current/latest)
      const { error: assignmentError } = await supabase
        .from("cbt_hibrida_assignments" as any)
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
          .from('cbt_hibrida_submission_history' as any)
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
        .from('cbt_hibrida_submission_history' as any)
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
        .from("cbt_hibrida_user_progress" as any)
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
        .from("cbt_hibrida_assignments" as any)
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
        .from("cbt_hibrida_assignments" as any)
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
        .from('cbt_hibrida_submission_history' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('session_number', sessionNumber)
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Fetch hibrida submission history failed', e);
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
    updateProgress,
    markMeetingDone,
    submitAssignment,
    loadAssignment,
    autoSaveAssignment,
    fetchSubmissionHistory,
    refetch: fetchData
  };
};