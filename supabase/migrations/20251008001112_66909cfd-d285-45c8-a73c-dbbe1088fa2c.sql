-- Tabel untuk jadwal pertemuan psikoedukasi (8 sesi)
CREATE TABLE IF NOT EXISTS public.psikoedukasi_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number integer NOT NULL UNIQUE,
  date text,
  time text,
  link text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabel untuk progress user per sesi psikoedukasi
CREATE TABLE IF NOT EXISTS public.psikoedukasi_user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number integer NOT NULL,
  session_opened boolean DEFAULT false,
  meeting_done boolean DEFAULT false,
  assignment_done boolean DEFAULT false,
  counselor_response text,
  counselor_name text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_number)
);

-- Tabel untuk jawaban penugasan psikoedukasi
CREATE TABLE IF NOT EXISTS public.psikoedukasi_assignments (
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

-- Insert default meeting schedules psikoedukasi (8 sesi)
INSERT INTO public.psikoedukasi_meetings (session_number, date, time, link, description)
VALUES
  (1, '2025-10-14', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-1', 'Pengenalan Tentang Bunuh Diri dan Risiko Terkait'),
  (2, '2025-10-21', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-2', 'Mengenali Tanda-Tanda Dini Risiko Bunuh Diri'),
  (3, '2025-10-28', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-3', 'Membangun Jaringan Dukungan Sosial'),
  (4, '2025-11-04', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-4', 'Keterampilan Mengatasi Krisis'),
  (5, '2025-11-11', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-5', 'Meningkatkan Kesehatan Mental Harian'),
  (6, '2025-11-18', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-6', 'Membantu Orang Lain yang Berisiko'),
  (7, '2025-11-25', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-7', 'Mengatasi Stigma dan Mencari Bantuan'),
  (8, '2025-12-02', '19:00 WIB', 'https://meet.google.com/psikoedukasi-sesi-8', 'Rencana Keamanan dan Pencegahan Relaps')
ON CONFLICT (session_number) DO NOTHING;

-- Update hibrida_user_progress untuk menambah kolom counselor_name dan responded_at
ALTER TABLE public.hibrida_user_progress 
  ADD COLUMN IF NOT EXISTS counselor_name text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- Trigger untuk update updated_at psikoedukasi_meetings
CREATE TRIGGER trigger_psikoedukasi_meetings_updated_at
  BEFORE UPDATE ON public.psikoedukasi_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger untuk update updated_at psikoedukasi_user_progress
CREATE TRIGGER trigger_psikoedukasi_user_progress_updated_at
  BEFORE UPDATE ON public.psikoedukasi_user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_updated_at();

-- Trigger untuk update updated_at psikoedukasi_assignments
CREATE TRIGGER trigger_psikoedukasi_assignments_updated_at
  BEFORE UPDATE ON public.psikoedukasi_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hibrida_updated_at();