import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseGroupSchedule, pickGroupEntry } from '@/utils/groupSchedule';
import { useAuth } from '@/contexts/AuthContext';

export type SessionProgress = {
  session_number: number;
  meeting_done: boolean;
  assignment_done: boolean;
  assignment_data?: any; // used only for UI; answers stored in sb_intervensi_assignments
  counselor_feedback?: string; // counselor_response is stored in progress table
  counselor_name?: string;
  updated_at?: string;
};

export const useSpiritualIntervensiSession = (sessionNumber: number) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [groupAssignment, setGroupAssignment] = useState<'A'|'B'|'C'|'Admin'|null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  // expose assignment helpers for autosave/load
  const [lastAutoSaveAt, setLastAutoSaveAt] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id || !sessionNumber) {
      setLoading(false);
      return;
    }

    try {
      // Determine group and role from enrollment
      try {
        const { data: enroll, error: enrollErr } = await supabase
          .from('sb_enrollments' as any)
          .select('group_assignment, enrollment_status, role')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!enrollErr && enroll && (enroll as any).enrollment_status === 'approved') {
          setGroupAssignment(((enroll as any).group_assignment as any) || null);
          setIsSuperAdmin((enroll as any).role === 'super-admin');
        } else {
          setGroupAssignment(null);
          setIsSuperAdmin(false);
        }
      } catch {
        setGroupAssignment(null);
        setIsSuperAdmin(false);
      }

      // Additionally treat platform admins as super-admins
      try {
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        if (!profErr && profile?.is_admin === true) {
          setIsSuperAdmin(true);
        }
      } catch {}

      // Fetch progress
      const { data: progressData, error: progressError } = await supabase
        .from('sb_intervensi_user_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('session_number', sessionNumber)
        .maybeSingle() as any;

      if (progressError && progressError.code !== 'PGRST116') throw progressError;

      if (progressData) {
        setProgress(progressData as SessionProgress);
      } else {
        setProgress({
          session_number: sessionNumber,
          meeting_done: false,
          assignment_done: false,
        });
      }

      // Fetch meeting info and apply group-based schedule selection
      const { data: meetingData, error: meetingError } = await supabase
        .from('sb_intervensi_meetings' as any)
        .select('date, time, link, description, guidance_text, guidance_pdf_url, guidance_audio_url, guidance_video_url, guidance_links')
        .eq('session_number', sessionNumber)
        .maybeSingle() as any;

      if (meetingError && meetingError.code !== 'PGRST116') throw meetingError;

      if (meetingData) {
        const rawLink: string | null = (meetingData as any).link;
        const parsed = parseGroupSchedule(rawLink);
        let date = (meetingData as any).date;
        let time = (meetingData as any).time;
        let link = (meetingData as any).link;
        let groupKeyUsed: 'A'|'B'|'C'|null = null;
        let hasGroupSchedules = false;
        let allGroupSchedules: Partial<Record<'A'|'B'|'C', { date: string; time: string; link: string }>> | null = null;

        if (parsed) {
          hasGroupSchedules = true;
          allGroupSchedules = parsed as any;
          if (!isSuperAdmin) {
            const picked = pickGroupEntry(parsed, (groupAssignment as any) ?? null);
            if (picked.entry) {
              date = picked.entry.date || null;
              time = picked.entry.time || null;
              link = picked.entry.link || null;
            }
            groupKeyUsed = picked.usedKey as any;
          }
        }

        setMeeting({
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
          all_group_schedules: allGroupSchedules,
        });
      } else {
        setMeeting(null);
      }
    } catch (error) {
      console.error('Error fetching spiritual intervensi session:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, sessionNumber, groupAssignment, isSuperAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load existing assignment answers (draft or submitted)
  const loadAssignment = useCallback(async () => {
    if (!user?.id) return null;
    try {
      const { data, error } = await supabase
        .from('sb_intervensi_assignments' as any)
        .select('answers, submitted, submitted_at')
        .eq('user_id', user.id)
        .eq('session_number', sessionNumber)
        .maybeSingle();
      if (error && (error as any).code !== 'PGRST116') throw error;
      const raw = (data as any)?.answers;
      if (!raw) return null;
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
      }
      return raw;
    } catch (e) {
      console.error('Load intervensi assignment failed', e);
      return null;
    }
  }, [user?.id, sessionNumber]);

  // Autosave draft answers without marking submitted
  const autoSaveAssignment = useCallback(async (answers: any) => {
    if (!user?.id) return;
    try {
      await supabase
        .from('sb_intervensi_assignments' as any)
        .upsert({
          user_id: user.id,
          session_number: sessionNumber,
          answers,
          submitted: false,
        }, { onConflict: 'user_id,session_number' });
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setLastAutoSaveAt(`${hh}:${mm}`);
    } catch (e) {
      console.error('Intervensi autosave failed', e);
    }
  }, [user?.id, sessionNumber]);

  const updateProgress = async (updates: Partial<SessionProgress>) => {
    if (!user?.id) return;

    try {
      // If assignment_data present, write to assignments table first
      if (Object.prototype.hasOwnProperty.call(updates, 'assignment_data')) {
        const raw = (updates as any).assignment_data;
        let answers: any = raw;
        if (typeof raw === 'string') {
          try { answers = JSON.parse(raw); } catch { answers = raw; }
        }
        const { error: aErr } = await supabase
          .from('sb_intervensi_assignments' as any)
          .upsert({
            user_id: user.id,
            session_number: sessionNumber,
            answers: answers ?? null,
            submitted: true,
            submitted_at: new Date().toISOString(),
          }, { onConflict: 'user_id,session_number' });
        if (aErr) throw aErr;
        // Ensure assignment_done reflected in progress
        (updates as any).assignment_done = true;
        // Remove transient field
        delete (updates as any).assignment_data;
      }

      const { data, error } = await supabase
        .from('sb_intervensi_user_progress' as any)
        .upsert({
          user_id: user.id,
          session_number: sessionNumber,
          ...updates,
        }, {
          onConflict: 'user_id,session_number'
        })
        .select()
        .single() as any;

      if (error) throw error;

      setProgress(data as SessionProgress);
      return { success: true };
    } catch (error) {
      console.error('Error updating spiritual intervensi progress:', error);
      return { success: false, error };
    }
  };

  return {
    progress,
    meeting,
    loading,
    updateProgress,
    groupAssignment,
    isSuperAdmin,
    loadAssignment,
    autoSaveAssignment,
    lastAutoSaveAt,
  };
};
