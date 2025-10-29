import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SpiritualRole = 'reguler' | 'grup-int' | 'grup-cont' | 'super-admin' | null;
export type SpiritualGroup = 'A' | 'B' | 'C' | 'Admin' | null;
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface SpiritualEnrollment {
  role: SpiritualRole;
  group: SpiritualGroup;
  status: EnrollmentStatus | null;
  enrollmentRequestedAt: string | null;
  approvedAt: string | null;
}

export const useSpiritualRole = () => {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState<SpiritualRole>(null);
  const [group, setGroup] = useState<SpiritualGroup>(null);
  const [enrollment, setEnrollment] = useState<SpiritualEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnrollment = async () => {
    if (!user?.id) {
      setRole(null);
      setGroup(null);
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sb_enrollments' as any)
        .select('role, group_assignment, enrollment_status, enrollment_requested_at, approved_at')
        .eq('user_id', user.id)
        .maybeSingle() as any;

      if (error) {
        console.error('Error fetching spiritual enrollment:', error);
        setRole(null);
        setGroup(null);
        setEnrollment(null);
        return;
      }

      if (data) {
        const enrollmentData: SpiritualEnrollment = {
          role: (data as any).role as SpiritualRole,
          group: ((data as any).group_assignment || null) as SpiritualGroup,
          status: (data as any).enrollment_status as EnrollmentStatus,
          enrollmentRequestedAt: (data as any).enrollment_requested_at,
          approvedAt: (data as any).approved_at
        };
        
        setRole(enrollmentData.role);
        setGroup(enrollmentData.group);
        setEnrollment(enrollmentData);
      } else {
        setRole(null);
        setGroup(null);
        setEnrollment(null);
      }
    } catch (error) {
      console.error('Error in fetchEnrollment:', error);
      setRole(null);
      setGroup(null);
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
      // Call the enroll-program edge function
      const { data, error } = await supabase.functions.invoke('enroll-program', {
        body: { program: 'spiritual-budaya' }
      });

      if (error) throw error;

      if (!data?.success) {
        return { success: false, error: data?.message || 'Failed to enroll' };
      }

      await fetchEnrollment();
      return { success: true };
    } catch (error: any) {
      console.error('Error requesting enrollment:', error);
      return { success: false, error: error.message };
    }
  };

  const canAccessIntervensiSB = enrollment?.status === 'approved' && 
    (enrollment?.role === 'grup-int' || enrollment?.role === 'super-admin');

  const canAccessPsikoedukasiSB = enrollment?.status === 'approved' && 
    (enrollment?.role === 'grup-cont' || enrollment?.role === 'super-admin');

  const isSuperAdmin = enrollment?.role === 'super-admin';

  return { 
    role, 
    group, 
    enrollment,
    loading,
    requestEnrollment,
    refreshEnrollment: fetchEnrollment,
    canAccessIntervensiSB,
    canAccessPsikoedukasiSB,
    isSuperAdmin
  };
};
