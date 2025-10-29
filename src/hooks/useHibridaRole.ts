import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type HibridaRole = 'reguler' | 'grup-int' | 'grup-cont' | 'super-admin';
export type HibridaGroup = 'A' | 'B' | 'C' | 'Admin' | null;
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface HibridaEnrollment {
  role: HibridaRole;
  group: HibridaGroup;
  status: EnrollmentStatus;
  enrollmentRequestedAt: string | null;
  approvedAt: string | null;
}

export const useHibridaRole = () => {
  const { user, isAuthenticated } = useAuth();
  const [enrollment, setEnrollment] = useState<HibridaEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnrollment = async () => {
    if (!user?.id) {
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
  .from('cbt_hibrida_enrollments' as any)
        .select('role, group_assignment, enrollment_status, enrollment_requested_at, approved_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching Hibrida enrollment:', error);
        setEnrollment(null);
        return;
      }

      if (data) {
        setEnrollment({
          role: (data as any).role as HibridaRole,
          group: (data as any).group_assignment as HibridaGroup,
          status: (data as any).enrollment_status as EnrollmentStatus,
          enrollmentRequestedAt: (data as any).enrollment_requested_at,
          approvedAt: (data as any).approved_at
        });
      }
    } catch (error) {
      console.error('Error in fetchEnrollment:', error);
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollment();
  }, [user?.id]);

  const requestEnrollment = async () => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    try {
      // First try to update an existing row to pending
      const { error: updateError } = await supabase
        .from('cbt_hibrida_enrollments' as any)
        .update({ 
          enrollment_status: 'pending',
          enrollment_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Ensure a row exists; if none, insert one
      const { data: existing, error: selectError } = await supabase
        .from('cbt_hibrida_enrollments' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) throw selectError;
      if (!existing) {
        const { error: insertError } = await supabase
          .from('cbt_hibrida_enrollments' as any)
          .insert({
            user_id: user.id,
            role: 'reguler',
            enrollment_status: 'pending',
            enrollment_requested_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        if (insertError) throw insertError;
      }

      await fetchEnrollment();
      return { success: true };
    } catch (error: any) {
      console.error('Error requesting enrollment:', error);
      return { success: false, error: error?.message || 'Failed to request enrollment' };
    }
  };

  const canAccessIntervensiHNCBT = enrollment?.status === 'approved' && 
    (enrollment?.role === 'grup-int' || enrollment?.role === 'super-admin');

  const canAccessIntervensiPsikoedukasi = enrollment?.status === 'approved' && 
    (enrollment?.role === 'grup-cont' || enrollment?.role === 'super-admin');

  const isSuperAdmin = enrollment?.role === 'super-admin';

  return {
    enrollment,
    loading,
    requestEnrollment,
    refreshEnrollment: fetchEnrollment,
    canAccessIntervensiHNCBT,
    canAccessIntervensiPsikoedukasi,
    isSuperAdmin
  };
};