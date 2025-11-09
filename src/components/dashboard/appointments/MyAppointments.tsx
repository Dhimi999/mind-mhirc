import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Loader2,
  User,
  Info,
  Brain
} from "lucide-react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Extended type untuk include professional data
type AppointmentWithProfessionalData = {
  id: string;
  user_id: string;
  professional_id: string;
  consultation_type: string;
  topic: string | null;
  preferred_datetime: string;
  status: string;
  approved_datetime: string | null;
  rejection_reason: string | null;
  reschedule_notes: string | null;
  chat_room_id: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  professional?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    profession: string | null;
  } | null;
};

export const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithProfessionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Detail dialog
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    appointment: AppointmentWithProfessionalData | null;
  }>({ open: false, appointment: null });
  
  // Cancel dialog
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    if (user) {
      fetchAppointments();
      subscribeToChanges();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const professionalIds = appointmentsData?.map(a => a.professional_id).filter(Boolean) || [];
      
      let professionalsData: any[] = [];
      if (professionalIds.length > 0) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, profession")
          .in("id", professionalIds);
        
        if (!error) professionalsData = data || [];
      }

      const appointmentsWithProfiles = appointmentsData?.map(appointment => ({
        ...appointment,
        professional: professionalsData.find(p => p.id === appointment.professional_id) || null
      })) || [];

      setAppointments(appointmentsWithProfiles);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Gagal memuat data janji konsultasi");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToChanges = () => {
    if (!user) return;

    const subscription = supabase
      .channel("user_appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const openDetailDialog = (appointment: AppointmentWithProfessionalData) => {
    setDetailDialog({ open: true, appointment });
  };

  const closeDetailDialog = () => {
    setDetailDialog({ open: false, appointment: null });
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setCancellingId(selectedAppointment);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          rejection_reason: cancellationReason || null
        })
        .eq("id", selectedAppointment);

      if (error) throw error;

      toast.success("Janji konsultasi berhasil dibatalkan");
      setShowCancelDialog(false);
      setCancellationReason("");
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Gagal membatalkan janji konsultasi");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { icon: Clock, label: "Menunggu", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      approved: { icon: CheckCircle2, label: "Disetujui", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      rejected: { icon: XCircle, label: "Ditolak", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      completed: { icon: CheckCircle2, label: "Selesai", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
      cancelled: { icon: XCircle, label: "Dibatalkan", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge className={`gap-1 ${config.color} border-0`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getConsultationTypeLabel = (type: string) => {
    const labels = {
      "mental-health": "Kesehatan Mental",
      "stress": "Stres",
      "anxiety": "Kecemasan",
      "depression": "Depresi",
      "relationship": "Hubungan",
      "other": "Lainnya"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderCompactCard = (appointment: AppointmentWithProfessionalData) => (
    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Professional Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {appointment.professional?.avatar_url ? (
              <img
                src={appointment.professional.avatar_url}
                alt={appointment.professional.full_name || "Profesional"}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {appointment.professional?.full_name || "Profesional"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {getConsultationTypeLabel(appointment.consultation_type)}
              </p>
            </div>
          </div>

          {/* Middle: Time & Status */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(
                  new Date(appointment.approved_datetime || appointment.preferred_datetime), 
                  "dd MMM, HH:mm", 
                  { locale: idLocale }
                )}
              </span>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Right: Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDetailDialog(appointment)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lihat Detail</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {appointment.status === "approved" && appointment.chat_room_id && (
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = `/dashboard/messages#room=${appointment.chat_room_id}`;
                }}
                className="gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
            )}

            {appointment.status === "pending" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedAppointment(appointment.id);
                  setShowCancelDialog(true);
                }}
                disabled={cancellingId === appointment.id}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Batal</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center font-medium">
            Belum ada janji konsultasi
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Buat permintaan appointment untuk memulai konsultasi
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {appointments.map(renderCompactCard)}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={() => closeDetailDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detail Janji Konsultasi
            </DialogTitle>
          </DialogHeader>

          {detailDialog.appointment && (
            <div className="space-y-4">
              {/* Professional Info */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {detailDialog.appointment.professional?.avatar_url ? (
                  <img
                    src={detailDialog.appointment.professional.avatar_url}
                    alt={detailDialog.appointment.professional.full_name || ""}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {detailDialog.appointment.professional?.full_name || "Profesional"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detailDialog.appointment.professional?.profession || "Konselor"}
                  </p>
                </div>
              </div>

              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Jenis Konsultasi</p>
                  <Badge variant="outline" className="gap-1">
                    <Brain className="h-3 w-3" />
                    {getConsultationTypeLabel(detailDialog.appointment.consultation_type)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Status</p>
                  {getStatusBadge(detailDialog.appointment.status)}
                </div>
              </div>

              {/* Waktu */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                      Waktu yang Diminta
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {format(new Date(detailDialog.appointment.preferred_datetime), "EEEE, dd MMMM yyyy - HH:mm", {
                        locale: idLocale
                      })}
                    </p>
                  </div>
                </div>

                {detailDialog.appointment.approved_datetime && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100 text-sm">
                        Waktu yang Disetujui
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        {format(new Date(detailDialog.appointment.approved_datetime), "EEEE, dd MMMM yyyy - HH:mm", {
                          locale: idLocale
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Topic */}
              {detailDialog.appointment.topic && (
                <div>
                  <p className="text-sm font-medium mb-2">Topik / Masalah</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{detailDialog.appointment.topic}</p>
                  </div>
                </div>
              )}

              {/* Reschedule Notes */}
              {detailDialog.appointment.reschedule_notes && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">
                      Catatan dari Konselor
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      {detailDialog.appointment.reschedule_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {detailDialog.appointment.status === "rejected" && detailDialog.appointment.rejection_reason && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 dark:text-red-100 text-sm">
                      Alasan Penolakan
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {detailDialog.appointment.rejection_reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {detailDialog.appointment.status === "approved" && detailDialog.appointment.chat_room_id && (
                  <Button
                    onClick={() => {
                      window.location.href = `/dashboard/messages#room=${detailDialog.appointment!.chat_room_id}`;
                    }}
                    className="flex-1 gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Buka Chat Room
                  </Button>
                )}

                {detailDialog.appointment.status === "pending" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedAppointment(detailDialog.appointment!.id);
                      setShowCancelDialog(true);
                      closeDetailDialog();
                    }}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Batalkan Appointment
                  </Button>
                )}
              </div>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                Dibuat: {format(new Date(detailDialog.appointment.created_at), "dd MMMM yyyy, HH:mm", {
                  locale: idLocale
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Batalkan Janji Konsultasi?
            </DialogTitle>
            <DialogDescription>
              Anda yakin ingin membatalkan janji konsultasi ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Alasan pembatalan (opsional)
            </label>
            <Textarea
              placeholder="Beritahu konselor mengapa Anda membatalkan..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              maxLength={300}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{cancellationReason.length}/300 karakter</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason("");
                setSelectedAppointment(null);
              }}
              disabled={!!cancellingId}
            >
              Tidak
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={!!cancellingId}
            >
              {cancellingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Membatalkan...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Ya, Batalkan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
