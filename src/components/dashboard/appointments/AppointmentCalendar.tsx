import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO
} from "date-fns";
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

export const AppointmentCalendar = ({ appointments }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: idLocale });
  const calendarEnd = endOfWeek(monthEnd, { locale: idLocale });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group appointments by date
  const appointmentsByDate = new Map<string, AppointmentWithUserData[]>();
  appointments
    .filter(a => a.status === 'approved' && a.approved_datetime)
    .forEach(appt => {
      const dateKey = format(parseISO(appt.approved_datetime!), 'yyyy-MM-dd');
      if (!appointmentsByDate.has(dateKey)) {
        appointmentsByDate.set(dateKey, []);
      }
      appointmentsByDate.get(dateKey)!.push(appt);
    });

  const getDateColor = (count: number) => {
    if (count === 0) return "";
    if (count === 1) return "bg-blue-200 dark:bg-blue-800";
    if (count === 2) return "bg-blue-400 dark:bg-blue-600";
    return "bg-blue-600 dark:bg-blue-500 text-white";
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Kalender Janji
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Header hari */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {/* Tanggal */}
          {allDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointmentsByDate.get(dateKey) || [];
            const count = dayAppointments.length;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`
                  relative p-2 text-center rounded-lg border transition-colors
                  ${isCurrentMonth ? '' : 'opacity-40'}
                  ${isToday ? 'border-primary border-2 font-bold' : 'border-border'}
                  ${count > 0 ? 'cursor-pointer hover:border-primary/50' : ''}
                  ${getDateColor(count)}
                `}
                title={count > 0 ? `${count} janji` : undefined}
              >
                <div className="text-sm">{format(day, 'd')}</div>
                {count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                  >
                    {count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-200 dark:bg-blue-800 border"></div>
            <span>1 janji</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-400 dark:bg-blue-600 border"></div>
            <span>2 janji</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600 dark:bg-blue-500 text-white border flex items-center justify-center">3+</div>
            <span>3+ janji</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
