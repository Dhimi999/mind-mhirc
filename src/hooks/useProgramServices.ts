import { useEffect, useState, useCallback } from 'react';
// Using an ad-hoc client instance without generics to access a table not yet in generated types
import { createClient } from '@supabase/supabase-js';
// WARNING: Hardcoded Supabase anon key fallback removed for security hygiene.
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in environment.
const anonClient = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL,
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
);

export interface ProgramServiceRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_name: string;
  color_class: string;
  route_override: string | null;
  ordering: number;
}

export function useProgramServices() {
  const [services, setServices] = useState<ProgramServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // program_services belum ada di definisi types.ts yang di-generate otomatis.
      // Gunakan casting manual sementara sampai types diperbarui.
  const query: any = (anonClient as any).from('program_services');
      const { data, error }: { data: any[] | null; error: any } = await query
        .select('*')
        .eq('is_active', true)
        .order('ordering', { ascending: true });
      if (error) throw error;
      setServices((data || []) as ProgramServiceRecord[]);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat layanan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { services, loading, error, refetch: fetchData };
}
