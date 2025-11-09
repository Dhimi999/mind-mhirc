-- ========================================
-- MIGRATION: Appointment System
-- Date: 2025-01-09
-- Purpose: Implementasi sistem janji konsultasi approval-based
-- ========================================

-- ========================================
-- 1. CREATE APPOINTMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties involved
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request details
  consultation_type TEXT NOT NULL,
    -- Jenis konsultasi: 'mental-health', 'stress', 'anxiety', 'depression', 'relationship', 'other'
  topic TEXT,
    -- Topik/masalah yang ingin dikonsultasikan (max 500 char)
  preferred_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Waktu yang diminta oleh user
  
  -- Approval & scheduling
  status TEXT NOT NULL DEFAULT 'pending',
    -- Status: 'pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled'
  approved_datetime TIMESTAMP WITH TIME ZONE,
    -- Waktu final yang disetujui (bisa beda dari preferred_datetime)
  rejection_reason TEXT,
    -- Alasan jika ditolak (opsional)
  reschedule_notes TEXT,
    -- Catatan/pesan saat reschedule
  
  -- Integration with chat
  chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
    -- Link ke chat room yang auto-created setelah approved
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
    -- Waktu ketika appointment selesai
  
  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled')
  ),
  CONSTRAINT valid_consultation_type CHECK (
    consultation_type IN ('mental-health', 'stress', 'anxiety', 'depression', 'relationship', 'other')
  ),
  CONSTRAINT approved_datetime_required CHECK (
    (status = 'approved' AND approved_datetime IS NOT NULL) OR 
    (status != 'approved')
  ),
  CONSTRAINT chat_room_on_approval CHECK (
    (status = 'approved' AND chat_room_id IS NOT NULL) OR 
    (status != 'approved')
  )
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

-- Index untuk user melihat appointment mereka
CREATE INDEX idx_appointments_user_id 
  ON public.appointments(user_id, status, created_at DESC);

-- Index untuk professional melihat request mereka
CREATE INDEX idx_appointments_professional_id 
  ON public.appointments(professional_id, status, created_at DESC);

-- Index untuk query berdasarkan waktu appointment
CREATE INDEX idx_appointments_approved_datetime 
  ON public.appointments(approved_datetime) 
  WHERE approved_datetime IS NOT NULL;

-- Index untuk query pending requests
CREATE INDEX idx_appointments_pending 
  ON public.appointments(professional_id, created_at DESC) 
  WHERE status = 'pending';

-- ========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. CREATE RLS POLICIES
-- ========================================

-- Policy: Users can view appointments where they are involved
DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
CREATE POLICY "Users can view their appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = professional_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Users can create appointment requests
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
CREATE POLICY "Users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'pending' -- New appointments harus pending
  );

-- Policy: Users can cancel their own pending appointments
DROP POLICY IF EXISTS "Users can cancel their appointments" ON public.appointments;
CREATE POLICY "Users can cancel their appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.uid() = user_id AND 
    status IN ('pending', 'approved') -- Hanya bisa cancel jika pending/approved
  )
  WITH CHECK (
    status = 'cancelled' -- Hanya bisa update ke cancelled
  );

-- Policy: Professionals can update appointments assigned to them
DROP POLICY IF EXISTS "Professionals can update their appointments" ON public.appointments;
CREATE POLICY "Professionals can update their appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.uid() = professional_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND account_type = 'professional'
    )
  );

-- Policy: Admins can do anything
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
CREATE POLICY "Admins have full access to appointments"
  ON public.appointments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ========================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- ========================================

-- Reuse existing function atau create if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 6. CREATE HELPER FUNCTION: GET SHARED CHAT ROOM
-- ========================================
-- Fungsi ini untuk Safe Mother konsultasi (fix missing function)

CREATE OR REPLACE FUNCTION public.get_shared_chat_room(
  user_id_1 UUID,
  user_id_2 UUID,
  room_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  room_id UUID;
BEGIN
  -- Find chat room dimana kedua user adalah partisipan
  SELECT cr.id INTO room_id
  FROM public.chat_rooms cr
  WHERE (room_type IS NULL OR cr.type = room_type)
  AND EXISTS (
    SELECT 1 FROM public.chat_participants cp1
    WHERE cp1.chat_room_id = cr.id AND cp1.user_id = user_id_1
  )
  AND EXISTS (
    SELECT 1 FROM public.chat_participants cp2
    WHERE cp2.chat_room_id = cr.id AND cp2.user_id = user_id_2
  )
  -- Hanya 2 partisipan (bukan group chat)
  AND (
    SELECT COUNT(*) FROM public.chat_participants
    WHERE chat_room_id = cr.id
  ) = 2
  LIMIT 1;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute ke authenticated users
GRANT EXECUTE ON FUNCTION public.get_shared_chat_room(UUID, UUID, TEXT) TO authenticated;

-- ========================================
-- 7. CREATE FUNCTION: AUTO CREATE CHAT ROOM ON APPROVAL
-- ========================================

CREATE OR REPLACE FUNCTION public.create_chat_room_for_appointment()
RETURNS TRIGGER AS $$
DECLARE
  new_room_id UUID;
  existing_room_id UUID;
BEGIN
  -- Hanya execute jika status berubah menjadi 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Check apakah sudah ada chat room antara user & professional
    existing_room_id := public.get_shared_chat_room(
      NEW.user_id, 
      NEW.professional_id, 
      'consultation'
    );
    
    IF existing_room_id IS NOT NULL THEN
      -- Gunakan room yang sudah ada
      NEW.chat_room_id := existing_room_id;
    ELSE
      -- Buat chat room baru
      INSERT INTO public.chat_rooms (created_by, type)
      VALUES (NEW.professional_id, 'consultation')
      RETURNING id INTO new_room_id;
      
      -- Tambahkan partisipan
      INSERT INTO public.chat_participants (chat_room_id, user_id)
      VALUES 
        (new_room_id, NEW.user_id),
        (new_room_id, NEW.professional_id);
      
      -- Set chat_room_id di appointment
      NEW.chat_room_id := new_room_id;
    END IF;
    
    -- Set approved_datetime jika belum diisi
    IF NEW.approved_datetime IS NULL THEN
      NEW.approved_datetime := NEW.preferred_datetime;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_chat_room_on_approval ON public.appointments;
CREATE TRIGGER create_chat_room_on_approval
  BEFORE UPDATE OF status ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_chat_room_for_appointment();

-- ========================================
-- 8. ADD COMMENTS
-- ========================================

COMMENT ON TABLE public.appointments IS 'Stores appointment requests and approvals for consultations';
COMMENT ON COLUMN public.appointments.status IS 'pending: awaiting approval, approved: confirmed, rejected: declined, rescheduled: new time proposed, completed: session finished, cancelled: user cancelled';
COMMENT ON COLUMN public.appointments.consultation_type IS 'Type of consultation requested';
COMMENT ON COLUMN public.appointments.chat_room_id IS 'Auto-created chat room after approval';

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================

-- Check if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'appointments'
  ) THEN
    RAISE NOTICE '✅ Table appointments created successfully';
  ELSE
    RAISE EXCEPTION '❌ Table appointments not found';
  END IF;
END $$;

-- Check RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'appointments' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS enabled on appointments';
  ELSE
    RAISE EXCEPTION '❌ RLS not enabled on appointments';
  END IF;
END $$;

-- List all policies
SELECT 
  policyname, 
  cmd AS operation,
  qual AS using_expression
FROM pg_policies 
WHERE tablename = 'appointments'
ORDER BY policyname;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
