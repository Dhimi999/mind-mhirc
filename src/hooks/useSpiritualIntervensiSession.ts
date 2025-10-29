import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  useEffect(() => {
    if (!user?.id || !sessionNumber) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
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

        // Fetch meeting info
        const { data: meetingData, error: meetingError } = await supabase
          .from('sb_intervensi_meetings' as any)
          .select('*')
          .eq('session_number', sessionNumber)
          .maybeSingle() as any;

        if (meetingError && meetingError.code !== 'PGRST116') throw meetingError;
        setMeeting(meetingData);
      } catch (error) {
        console.error('Error fetching spiritual intervensi session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
  };
};
