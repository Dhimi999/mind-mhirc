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
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
  Info,
  ChevronRight,
  Brain
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppointmentStatistics } from "./AppointmentStatistics";
import { AppointmentCalendar } from "./AppointmentCalendar";

// Extended type untuk include user data
type AppointmentWithUserData = {
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
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const AppointmentRequests = () => {
  const { user } = useAuth();
  const [pendingAppointments, setPendingAppointments] = useState<AppointmentWithUserData[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentWithUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Persistent active tab state (solves tab reset issue)
  const [activeTab, setActiveTab] = useState("pending");
  
  // Detail dialog
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    appointment: AppointmentWithUserData | null;
  }>({ open: false, appointment: null });
  
  // Action states
  const [actionDialog, setActionDialog] = useState<{
    type: 'approve' | 'reject' | 'reschedule' | null;
    appointmentId: string | null;
  }>({ type: null, appointmentId: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [approvedDatetime, setApprovedDatetime] = useState("");
  const [approvedTime, setApprovedTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
    const channel = supabase
      .channel("professional_appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `professional_id=eq.${user.id}`
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!user.is_admin) {
        query = query.eq("professional_id", user.id);
      }

      const { data: appointmentsData, error: appointmentsError } = await query;

      if (appointmentsError) throw appointmentsError;

      const userIds = appointmentsData?.map(a => a.user_id).filter(Boolean) || [];
      
      let usersData: any[] = [];
      if (userIds.length > 0) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        
        if (!error) usersData = data || [];
      }

      const appointmentsWithUsers = appointmentsData?.map(appointment => ({
        ...appointment,
        user: usersData.find(u => u.id === appointment.user_id) || null
      })) || [];

      // Urutkan: Tampilkan yang disetujui (hari ini & mendatang) terlebih dahulu di "Semua Riwayat"
      const sortedAll = [...appointmentsWithUsers].sort((a, b) => {
        const aApproved = a.status === 'approved';
        const bApproved = b.status === 'approved';
        if (aApproved && !bApproved) return -1;
        if (!aApproved && bApproved) return 1;
        if (aApproved && bApproved) {
          const aTime = a.approved_datetime ? new Date(a.approved_datetime).getTime() : new Date(a.preferred_datetime).getTime();
          const bTime = b.approved_datetime ? new Date(b.approved_datetime).getTime() : new Date(b.preferred_datetime).getTime();
          return aTime - bTime; // lebih cepat tampil duluan
        }
        // selain approved, urutkan terbaru ke lama
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setPendingAppointments(appointmentsWithUsers.filter(a => a.status === 'pending'));
      setAllAppointments(sortedAll);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Gagal memuat data appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // subscribeToChanges is now managed inside useEffect with proper cleanup

  const openDetailDialog = (appointment: AppointmentWithUserData) => {
    setDetailDialog({ open: true, appointment });
  };

  const closeDetailDialog = () => {
    setDetailDialog({ open: false, appointment: null });
  };

  const openActionDialog = (type: 'approve' | 'reject' | 'reschedule', appointmentId: string, preferredDatetime?: string) => {
    setActionDialog({ type, appointmentId });
    closeDetailDialog();
    
    if ((type === 'approve' || type === 'reschedule') && preferredDatetime) {
      const date = new Date(preferredDatetime);
      setApprovedDatetime(format(date, "yyyy-MM-dd"));
      setApprovedTime(format(date, "HH:mm"));
    }
  };

  const closeActionDialog = () => {
    setActionDialog({ type: null, appointmentId: null });
    setApprovedDatetime("");
    setApprovedTime("");
    setNotes("");
  };

  const handleApprove = async () => {
    if (!actionDialog.appointmentId || !approvedDatetime || !approvedTime) {
      toast.error("Mohon pilih waktu approval");
      return;
    }

    setIsSubmitting(true);
    try {
      const approved_datetime = new Date(`${approvedDatetime}T${approvedTime}:00`).toISOString();

      const { error } = await supabase
        .from("appointments")
        .update({
          status: "approved",
          approved_datetime: approved_datetime,
          reschedule_notes: notes || null
        })
        .eq("id", actionDialog.appointmentId);

      if (error) throw error;

  toast.success("Appointment berhasil disetujui! Chat room otomatis dibuat.");
  await fetchAppointments();
      closeActionDialog();
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast.error("Gagal menyetujui appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!actionDialog.appointmentId || !notes.trim()) {
      toast.error("Mohon berikan alasan penolakan");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "rejected",
          rejection_reason: notes
        })
        .eq("id", actionDialog.appointmentId);

      if (error) throw error;

  toast.success("Appointment berhasil ditolak");
  await fetchAppointments();
      closeActionDialog();
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast.error("Gagal menolak appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!actionDialog.appointmentId || !approvedDatetime || !approvedTime) {
      toast.error("Mohon pilih waktu reschedule");
      return;
    }

    setIsSubmitting(true);
    try {
      const new_datetime = new Date(`${approvedDatetime}T${approvedTime}:00`).toISOString();

      // Update appointment ke approved dengan waktu baru (bukan rescheduled)
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "approved",
          approved_datetime: new_datetime,
          reschedule_notes: notes || null
        })
        .eq("id", actionDialog.appointmentId);

      if (error) throw error;

      toast.success("Appointment berhasil dijadwal ulang dan disetujui!");
      await fetchAppointments();
      closeActionDialog();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Gagal menjadwal ulang appointment");
    } finally {
      setIsSubmitting(false);
    }
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Menunggu", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      approved: { variant: "default" as const, icon: CheckCircle2, label: "Disetujui", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Ditolak", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      completed: { variant: "outline" as const, icon: CheckCircle2, label: "Selesai", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
      cancelled: { variant: "outline" as const, icon: XCircle, label: "Dibatalkan", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" }
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

  // Filter appointments for "Semua Riwayat" tab
  const today = new Date();
  const isSameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  const inProgressToday = allAppointments.filter(a => a.status === 'approved' && a.approved_datetime && isSameDay(new Date(a.approved_datetime), today));
  const upcoming = allAppointments.filter(a => a.status === 'approved' && a.approved_datetime && new Date(a.approved_datetime) > today && !isSameDay(new Date(a.approved_datetime), today));
  const finished = allAppointments.filter(a => a.status === 'completed');
  const cancelled = allAppointments.filter(a => a.status === 'cancelled' || a.status === 'rejected');

  const renderCompactCard = (appointment: AppointmentWithUserData) => (
    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {appointment.user?.avatar_url ? (
              <img
                src={appointment.user.avatar_url}
                alt={appointment.user.full_name || "User"}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{appointment.user?.full_name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">
                {getConsultationTypeLabel(appointment.consultation_type)}
              </p>
            </div>
          </div>

          {/* Middle: Time & Status */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(new Date(appointment.preferred_datetime), "dd MMM, HH:mm", { locale: idLocale })}</span>
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

            {appointment.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => openActionDialog('approve', appointment.id, appointment.preferred_datetime)}
                  className="gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Setujui</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openActionDialog('reject', appointment.id)}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Tolak</span>
                </Button>
              </>
            )}

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
            {user?.is_admin && appointment.status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkCompleted(appointment)}
                disabled={isSubmitting}
                className="gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Tandai Selesai</span>
              </Button>
            )}
          </div>
        </div>

        {/* Topic preview (truncated) */}
        {appointment.topic && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-1 pl-13">
            {appointment.topic}
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Tandai selesai (admin only) -> ubah status ke completed dan kirim pesan sistem
  const handleMarkCompleted = async (appointment: AppointmentWithUserData) => {
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", appointment.id);
      if (updateError) throw updateError;

      if (appointment.chat_room_id) {
        const SYSTEM_MESSAGE = "[PESAN OTOMATIS] Obrolan ini sudah diakhiri, jika ingin melakukan konsultassi, harap ajukan janji konsultasi kembali [PESAN OTOMATIS]";
        const { error: messageError } = await supabase
          .from("chat_messages")
          .insert({
            chat_room_id: appointment.chat_room_id,
            sender_id: user?.id,
            content: SYSTEM_MESSAGE,
            read_by: user ? [user.id] : []
          });
        if (messageError) throw messageError;
      }

      toast.success("Appointment ditandai selesai dan pesan sistem dikirim.");
      await fetchAppointments();
    } catch (err) {
      console.error("Error marking completed:", err);
      toast.error("Gagal menandai selesai");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {user?.is_admin && (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AppointmentStatistics appointments={allAppointments} />
            </div>
            <div className="lg:col-span-1">
              <AppointmentCalendar appointments={allAppointments} />
            </div>
          </div>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Permintaan Baru
            {pendingAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {pendingAppointments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Calendar className="h-4 w-4" />
            Semua Riwayat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pendingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center font-medium">
                  Tidak ada permintaan baru
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Permintaan appointment akan muncul di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingAppointments.map(renderCompactCard)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {allAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center font-medium">
                  Belum ada riwayat
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Semua appointment akan tersimpan di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {inProgressToday.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-blue-600">Sedang Berlangsung (Hari Ini)</h3>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">{inProgressToday.map(renderCompactCard)}</div>
                </div>
              )}
              {upcoming.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-indigo-600">Mendatang</h3>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">{upcoming.map(renderCompactCard)}</div>
                </div>
              )}
              {finished.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-green-600">Selesai</h3>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">{finished.map(renderCompactCard)}</div>
                </div>
              )}
              {cancelled.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-red-600">Dibatalkan / Ditolak</h3>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">{cancelled.map(renderCompactCard)}</div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={() => closeDetailDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detail Permintaan Konsultasi
            </DialogTitle>
          </DialogHeader>

          {detailDialog.appointment && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {detailDialog.appointment.user?.avatar_url ? (
                  <img
                    src={detailDialog.appointment.user.avatar_url}
                    alt={detailDialog.appointment.user.full_name || "User"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{detailDialog.appointment.user?.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">Klien</p>
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

              {/* Notes */}
              {detailDialog.appointment.reschedule_notes && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Catatan</p>
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
              {detailDialog.appointment.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => openActionDialog('approve', detailDialog.appointment!.id, detailDialog.appointment!.preferred_datetime)}
                    className="flex-1 gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Setujui Permintaan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openActionDialog('reschedule', detailDialog.appointment!.id, detailDialog.appointment!.preferred_datetime)}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => openActionDialog('reject', detailDialog.appointment!.id)}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Tolak
                  </Button>
                </div>
              )}

              {detailDialog.appointment.status === "approved" && detailDialog.appointment.chat_room_id && (
                <Button
                  onClick={() => {
                    window.location.href = `/dashboard/messages#room=${detailDialog.appointment!.chat_room_id}`;
                  }}
                  className="w-full gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Buka Chat Room
                </Button>
              )}

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

      {/* Approve Dialog */}
      <Dialog open={actionDialog.type === 'approve'} onOpenChange={() => closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Setujui Appointment
            </DialogTitle>
            <DialogDescription>
              Pilih waktu final untuk konsultasi. Chat room akan otomatis dibuat setelah disetujui.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approve_date">Tanggal</Label>
                <Input
                  id="approve_date"
                  type="date"
                  value={approvedDatetime}
                  onChange={(e) => setApprovedDatetime(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approve_time">Waktu</Label>
                <Input
                  id="approve_time"
                  type="time"
                  value={approvedTime}
                  onChange={(e) => setApprovedTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve_notes">Catatan (opsional)</Label>
              <Textarea
                id="approve_notes"
                placeholder="Contoh: Saya siap membantu Anda..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionDialog.type === 'reject'} onOpenChange={() => closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Tolak Appointment
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan agar klien memahami situasinya.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject_reason">Alasan Penolakan *</Label>
            <Textarea
              id="reject_reason"
              placeholder="Contoh: Jadwal saya penuh untuk minggu ini. Mohon pilih waktu minggu depan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">{notes.length}/300 karakter</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={actionDialog.type === 'reschedule'} onOpenChange={() => closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Jadwal Ulang Appointment
            </DialogTitle>
            <DialogDescription>
              Ubah waktu konsultasi dan berikan catatan untuk klien. Appointment akan langsung disetujui dengan waktu baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reschedule_date">Tanggal Baru</Label>
                <Input
                  id="reschedule_date"
                  type="date"
                  value={approvedDatetime}
                  onChange={(e) => setApprovedDatetime(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule_time">Waktu Baru</Label>
                <Input
                  id="reschedule_time"
                  type="time"
                  value={approvedTime}
                  onChange={(e) => setApprovedTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule_notes">Catatan (opsional)</Label>
              <Textarea
                id="reschedule_notes"
                placeholder="Contoh: Waktu yang Anda request sudah terisi, saya reschedule ke waktu di atas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleReschedule} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule & Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Definisi fungsi handleMarkCompleted diposisikan di atas return sebelumnya, tambahkan jika belum tersisip
// (Catatan: Fungsi sudah ditambahkan sebelumnya tetapi editor memerlukan penempatan yang terdeteksi sebelum pemakaian.)
