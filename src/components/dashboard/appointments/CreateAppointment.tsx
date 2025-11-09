import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar, Plus, User } from "lucide-react";
import type { ConsultationType } from "@/types/appointments";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  account_type: string | null;
}

export const CreateAppointment = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [professionals, setProfessionals] = useState<Profile[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    professional_id: "",
    consultation_type: "" as ConsultationType | "",
    topic: "",
    preferred_date: "",
    preferred_time: ""
  });

  // Fetch professionals saat dialog dibuka
  useEffect(() => {
    if (isOpen) {
      fetchProfessionals();
    }
  }, [isOpen]);

  const fetchProfessionals = async () => {
    setIsLoadingProfessionals(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, profession, account_type")
        .eq("account_type", "professional")
        .order("full_name");

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast.error("Gagal memuat daftar profesional");
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Anda harus login untuk membuat janji");
      return;
    }

    // Validation
    if (!formData.professional_id || !formData.consultation_type || 
        !formData.preferred_date || !formData.preferred_time) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date & time menjadi ISO timestamp
      const preferred_datetime = new Date(
        `${formData.preferred_date}T${formData.preferred_time}:00`
      ).toISOString();

      const { error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          professional_id: formData.professional_id,
          consultation_type: formData.consultation_type as ConsultationType,
          topic: formData.topic || null,
          preferred_datetime: preferred_datetime,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Permintaan janji konsultasi berhasil dikirim!");
      
      // Reset form & close dialog
      setFormData({
        professional_id: "",
        consultation_type: "",
        topic: "",
        preferred_date: "",
        preferred_time: ""
      });
      setIsOpen(false);

    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Gagal membuat janji konsultasi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Buat Janji Konsultasi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Buat Janji Konsultasi
          </DialogTitle>
          <DialogDescription>
            Isi form berikut untuk mengajukan permintaan janji konsultasi. 
            Konselor akan meninjau permintaan Anda dan memberikan konfirmasi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Konselor */}
          <div className="space-y-2">
            <Label htmlFor="professional">
              Pilih Konselor/Profesional <span className="text-destructive">*</span>
            </Label>
            {isLoadingProfessionals ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Memuat daftar profesional...
              </div>
            ) : (
              <Select
                value={formData.professional_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, professional_id: value })
                }
              >
                <SelectTrigger id="professional">
                  <SelectValue placeholder="Pilih konselor" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        {prof.avatar_url ? (
                          <img
                            src={prof.avatar_url}
                            alt={prof.full_name || ""}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <span>
                          {prof.full_name || "Nama tidak tersedia"}
                          {prof.profession && (
                            <span className="text-muted-foreground text-xs ml-1">
                              - {prof.profession}
                            </span>
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Jenis Konsultasi */}
          <div className="space-y-2">
            <Label htmlFor="consultation_type">
              Jenis Konsultasi <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.consultation_type}
              onValueChange={(value) =>
                setFormData({ ...formData, consultation_type: value as ConsultationType })
              }
            >
              <SelectTrigger id="consultation_type">
                <SelectValue placeholder="Pilih jenis konsultasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mental-health">Kesehatan Mental Umum</SelectItem>
                <SelectItem value="stress">Manajemen Stres</SelectItem>
                <SelectItem value="anxiety">Kecemasan</SelectItem>
                <SelectItem value="depression">Depresi</SelectItem>
                <SelectItem value="relationship">Hubungan & Keluarga</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Waktu Preferensi */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferred_date">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preferred_date"
                type="date"
                min={new Date().toISOString().split("T")[0]} // Tidak bisa pilih tanggal lalu
                value={formData.preferred_date}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_time">
                Waktu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preferred_time"
                type="time"
                value={formData.preferred_time}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Topik/Masalah */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Ceritakan singkat tentang yang ingin Anda konsultasikan
            </Label>
            <Textarea
              id="topic"
              placeholder="Contoh: Saya mengalami kesulitan tidur dan sering merasa cemas dalam beberapa minggu terakhir..."
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              maxLength={500}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.topic.length}/500 karakter
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </>
              ) : (
                "Kirim Permintaan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
