import { useEffect, useState, useCallback } from 'react';
// Using an ad-hoc client instance without generics to access a table not yet in generated types
import { createClient } from '@supabase/supabase-js';
const anonClient = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gfeuhclekmdxaatyyiez.supabase.co',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZXVoY2xla21keGFhdHl5aWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDI2MzIsImV4cCI6MjA1NjUxODYzMn0.zl3T3J2a8cCJxq5OI9IdAnWEYXSwdUwcJ6D_5MglXCI'
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
