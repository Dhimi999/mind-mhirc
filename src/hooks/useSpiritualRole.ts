import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SpiritualRole = 'reguler' | 'grup-int' | 'grup-cont' | 'super-admin' | null;
export type SpiritualGroup = 'A' | 'B' | 'C' | 'Admin' | null;

export const useSpiritualRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<SpiritualRole>(null);
  const [group, setGroup] = useState<SpiritualGroup>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setRole(null);
      setGroup(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('sb_enrollments' as any)
          .select('role, group_assignment')
          .eq('user_id', user.id)
          .maybeSingle() as any;

        if (error) throw error;

        if (data) {
          setRole((data as any).role as SpiritualRole);
          setGroup(((data as any).group_assignment || null) as SpiritualGroup);
        } else {
          setRole(null);
          setGroup(null);
        }
      } catch (error) {
        console.error('Error fetching spiritual role:', error);
        setRole(null);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user?.id]);

  return { role, group, loading };
};
