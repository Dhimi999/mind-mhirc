// Appointment Types untuk TypeScript
// File ini untuk manual import jika perlu sebelum regenerate types dari Supabase

export type AppointmentStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'rescheduled' 
  | 'completed' 
  | 'cancelled';

export type ConsultationType = 
  | 'mental-health' 
  | 'stress' 
  | 'anxiety' 
  | 'depression' 
  | 'relationship' 
  | 'other';

export interface Appointment {
  id: string;
  user_id: string;
  professional_id: string;
  consultation_type: ConsultationType;
  topic: string | null;
  preferred_datetime: string; // ISO timestamp
  status: AppointmentStatus;
  approved_datetime: string | null; // ISO timestamp
  rejection_reason: string | null;
  reschedule_notes: string | null;
  chat_room_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AppointmentInsert {
  user_id: string;
  professional_id: string;
  consultation_type: ConsultationType;
  topic?: string | null;
  preferred_datetime: string;
  status?: 'pending'; // Always pending on insert
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  approved_datetime?: string | null;
  rejection_reason?: string | null;
  reschedule_notes?: string | null;
  completed_at?: string | null;
}

// Extended types dengan relasi
export interface AppointmentWithProfiles extends Appointment {
  user_profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  professional_profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    profession: string | null;
  };
}
