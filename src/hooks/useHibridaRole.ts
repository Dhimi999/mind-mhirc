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
        .from('hibrida_enrollments')
        .select('role, group_assignment, enrollment_status, enrollment_requested_at, approved_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching Hibrida enrollment:', error);
        setEnrollment(null);
        return;
      }

      if (data) {
        setEnrollment({
          role: data.role as HibridaRole,
          group: data.group_assignment as HibridaGroup,
          status: data.enrollment_status as EnrollmentStatus,
          enrollmentRequestedAt: data.enrollment_requested_at,
          approvedAt: data.approved_at
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
      const { data: updateData, error: updateError, status: updateStatus } = await supabase
        .from('hibrida_enrollments')
        .update({ 
          enrollment_status: 'pending',
          enrollment_requested_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // If no row was updated (e.g., older users without auto-created row), insert one
      // Supabase returns 204 No Content for successful update without returning data
      // We check by re-fetching or attempting an insert on conflict
      const ensureRow = async () => {
        // Try to select to verify existence
        const { data: existing, error: selectError } = await supabase
          .from('hibrida_enrollments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (selectError) throw selectError;
        if (existing) return;

        // Insert pending row
        const { error: insertError } = await supabase
          .from('hibrida_enrollments')
          .insert({
            user_id: user.id,
            role: 'reguler',
            enrollment_status: 'pending',
            enrollment_requested_at: new Date().toISOString()
          });
        if (insertError) throw insertError;
      };

      await ensureRow();

      await fetchEnrollment();
      return { success: true };
    } catch (error: any) {
      console.error('Error requesting enrollment:', error);
      return { success: false, error: error.message };
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
