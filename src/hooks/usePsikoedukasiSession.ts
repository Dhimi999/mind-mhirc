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
}

export const usePsikoedukasiSession = (sessionNumber: number, userId: string | undefined) => {
  const [progress, setProgress] = useState<SessionProgress>({
    meetingDone: false,
    assignmentDone: false,
    sessionOpened: false,
    counselorResponse: undefined,
    counselorName: undefined,
    respondedAt: undefined
  });
  const [meetingSchedule, setMeetingSchedule] = useState<MeetingSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data: progressData, error: progressError } = await supabase
        .from("psikoedukasi_user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("session_number", sessionNumber)
        .maybeSingle();

      if (progressError && progressError.code !== "PGRST116") throw progressError;

      const { data: meetingData, error: meetingError } = await supabase
        .from("psikoedukasi_meetings")
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
        await markSessionOpened();
      }

      setMeetingSchedule(meetingData ? {
        ...meetingData,
        guidance_links: (meetingData.guidance_links as any) || null
      } : null);
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
        .from("psikoedukasi_user_progress")
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
        .from("psikoedukasi_user_progress")
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
      const { error: assignmentError } = await supabase
        .from("psikoedukasi_assignments")
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

      const { error: progressError } = await supabase
        .from("psikoedukasi_user_progress")
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

  const loadAssignment = useCallback(async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("psikoedukasi_assignments")
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

  const autoSaveAssignment = useCallback(async (answers: any) => {
    if (!userId) return;

    try {
      await supabase
        .from("psikoedukasi_assignments")
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
    markMeetingDone,
    submitAssignment,
    loadAssignment,
    autoSaveAssignment,
    refetch: fetchData
  };
};
