import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar, User, AlertCircle } from "lucide-react";
import { format, differenceInDays, differenceInHours, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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

interface Props {
  appointments: AppointmentWithUserData[];
}

export const AppointmentStatistics = ({ appointments }: Props) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter appointments
  const pending = appointments.filter(a => a.status === 'pending');
  const approved = appointments.filter(a => a.status === 'approved');
  const todayAppts = approved.filter(a => {
    if (!a.approved_datetime) return false;
    const apptDate = new Date(a.approved_datetime);
    return apptDate >= today && apptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  });

  // Sort pending by urgency (closest to today)
  const urgentPending = [...pending].sort((a, b) => {
    const aDate = new Date(a.preferred_datetime);
    const bDate = new Date(b.preferred_datetime);
    return aDate.getTime() - bDate.getTime();
  }).slice(0, 3); // Top 3 most urgent

  // Upcoming appointments grouped
  const thisWeekStart = startOfWeek(now, { locale: idLocale });
  const thisWeekEnd = endOfWeek(now, { locale: idLocale });
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const nextMonthStart = addMonths(thisMonthStart, 1);
  const nextMonthEnd = endOfMonth(nextMonthStart);

  const thisWeek = approved.filter(a => {
    if (!a.approved_datetime) return false;
    const apptDate = new Date(a.approved_datetime);
    return apptDate > today && apptDate >= thisWeekStart && apptDate <= thisWeekEnd;
  });

  const thisMonth = approved.filter(a => {
    if (!a.approved_datetime) return false;
    const apptDate = new Date(a.approved_datetime);
    return apptDate > thisWeekEnd && apptDate >= thisMonthStart && apptDate <= thisMonthEnd;
  });

  const nextMonth = approved.filter(a => {
    if (!a.approved_datetime) return false;
    const apptDate = new Date(a.approved_datetime);
    return apptDate >= nextMonthStart && apptDate <= nextMonthEnd;
  });

  const getUrgencyLevel = (datetime: string) => {
    const diff = differenceInHours(new Date(datetime), now);
    if (diff < 24) return { label: "Sangat Urgent", color: "bg-red-100 text-red-800" };
    if (diff < 48) return { label: "Urgent", color: "bg-orange-100 text-orange-800" };
    if (diff < 72) return { label: "Mendesak", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Normal", color: "bg-blue-100 text-blue-800" };
  };

  const renderUserCard = (appt: AppointmentWithUserData, showTime = true) => (
    <div key={appt.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={appt.user?.avatar_url || undefined} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{appt.user?.full_name || "User"}</p>
        {showTime && appt.approved_datetime && (
          <p className="text-xs text-muted-foreground">
            {format(new Date(appt.approved_datetime), "HH:mm", { locale: idLocale })}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Pending Urgent */}
      {urgentPending.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Permintaan Mendesak ({pending.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentPending.map(appt => (
              <div key={appt.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={appt.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{appt.user?.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(appt.preferred_datetime), "dd MMM, HH:mm", { locale: idLocale })}
                  </p>
                </div>
                <Badge className={getUrgencyLevel(appt.preferred_datetime).color + " border-0"}>
                  {getUrgencyLevel(appt.preferred_datetime).label}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today - Expanded */}
      {todayAppts.length > 0 && (
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Jadwal Hari Ini ({todayAppts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {todayAppts.sort((a, b) => 
                new Date(a.approved_datetime!).getTime() - new Date(b.approved_datetime!).getTime()
              ).map(appt => renderUserCard(appt, true))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming - Expanded */}
      <Card className="border-l-4 border-l-indigo-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Jadwal Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {thisWeek.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-indigo-700 mb-2">Minggu Ini ({thisWeek.length})</h4>
              <div className="grid gap-2">
                {thisWeek.sort((a, b) => 
                  new Date(a.approved_datetime!).getTime() - new Date(b.approved_datetime!).getTime()
                ).slice(0, 5).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={appt.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{appt.user?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appt.approved_datetime!), "EEEE, HH:mm", { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                ))}
                {thisWeek.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">+{thisWeek.length - 5} lainnya</p>
                )}
              </div>
            </div>
          )}

          {thisMonth.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-indigo-700 mb-2">Bulan Ini ({thisMonth.length})</h4>
              <div className="grid gap-2">
                {thisMonth.sort((a, b) => 
                  new Date(a.approved_datetime!).getTime() - new Date(b.approved_datetime!).getTime()
                ).slice(0, 3).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={appt.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{appt.user?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appt.approved_datetime!), "dd MMM, HH:mm", { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                ))}
                {thisMonth.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">+{thisMonth.length - 3} lainnya</p>
                )}
              </div>
            </div>
          )}

          {nextMonth.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-indigo-700 mb-2">Bulan Depan ({nextMonth.length})</h4>
              <p className="text-sm text-muted-foreground">
                {nextMonth.length} janji terjadwal
              </p>
            </div>
          )}

          {thisWeek.length === 0 && thisMonth.length === 0 && nextMonth.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada jadwal mendatang
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
