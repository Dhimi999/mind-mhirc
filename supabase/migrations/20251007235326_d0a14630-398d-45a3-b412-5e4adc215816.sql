-- Tabel untuk jadwal pertemuan daring setiap sesi
CREATE TABLE IF NOT EXISTS public.hibrida_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number integer NOT NULL UNIQUE,
  date text,
  time text,
  link text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabel untuk progress user per sesi
CREATE TABLE IF NOT EXISTS public.hibrida_user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number integer NOT NULL,
  session_opened boolean DEFAULT false,
  meeting_done boolean DEFAULT false,
  assignment_done boolean DEFAULT false,
  counselor_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_number)
);

-- Tabel untuk jawaban penugasan
CREATE TABLE IF NOT EXISTS public.hibrida_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number integer NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted boolean DEFAULT false,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_number)
);

-- Insert default meeting schedules (8 sesi)
INSERT INTO public.hibrida_meetings (session_number, date, time, link, description)
VALUES 
  (1, '2025-10-05', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-1', 'Pengalaman Crisis Response Plan'),
  (2, '2025-10-12', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-2', 'Identifikasi Pikiran Otomatis'),
  (3, '2025-10-19', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-3', 'Restrukturisasi Kognitif Awal'),
  (4, '2025-10-26', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-4', 'Naratif Alternatif & Nilai Hidup'),
  (5, '2025-11-02', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-5', 'Eksposur Naratif Aman'),
  (6, '2025-11-09', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-6', 'Eksperimen Perilaku & Mindfulness'),
  (7, '2025-11-16', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-7', 'Integrasi Cerita & Ketahanan'),
  (8, '2025-11-23', '20:00 WIB', 'https://meet.google.com/hn-cbt-sesi-8', 'Rencana Lanjut & Relapse Prevention')
ON CONFLICT (session_number) DO NOTHING;

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION public.update_hibrida_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hibrida_meetings_updated_at
  BEFORE UPDATE ON public.hibrida_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_updated_at();

CREATE TRIGGER trigger_hibrida_user_progress_updated_at
  BEFORE UPDATE ON public.hibrida_user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_updated_at();

CREATE TRIGGER trigger_hibrida_assignments_updated_at
  BEFORE UPDATE ON public.hibrida_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_updated_at();