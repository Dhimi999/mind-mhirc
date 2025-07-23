
import React from "react";
import {
  Calendar,
  CalendarIcon,
  User,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const AppointmentsDashboard: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Janji Konsultasi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - now with a larger container */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kalender Janji</CardTitle>
            <CardDescription>
              Pilih tanggal untuk melihat janji konsultasi yang dijadwalkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-3/5">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={idLocale}
                  className="rounded-md border w-full"
                />
              </div>
              <div className="md:w-2/5 space-y-4">
                <div className="text-center py-8 px-4 border rounded-lg flex flex-col items-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Segera Datang!</h3>
                  <p className="text-muted-foreground mt-2">
                    Fitur penjadwalan janji konsultasi akan segera tersedia. 
                    Anda akan dapat menjadwalkan sesi konsultasi dengan konselor profesional.
                  </p>
                </div>
                {date && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "EEEE, dd MMMM yyyy", { locale: idLocale })}
                    </h3>
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Tidak ada janji pada tanggal ini.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Janji Mendatang</CardTitle>
            <CardDescription>
              Daftar janji konsultasi yang telah dijadwalkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 px-4 border rounded-lg flex flex-col items-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Segera Datang!</h3>
              <p className="text-muted-foreground mt-2">
                Fitur ini akan segera tersedia. Anda akan dapat melihat daftar janji konsultasi
                yang telah dijadwalkan di sini.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Counselors */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Konselor Tersedia</CardTitle>
            <CardDescription>
              Daftar konselor profesional yang tersedia untuk konsultasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center py-8 px-4 border rounded-lg flex flex-col items-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Segera Datang!</h3>
                <p className="text-muted-foreground mt-2">
                  Daftar konselor profesional akan segera tersedia. 
                  Anda akan dapat melihat profil dan menjadwalkan konsultasi dengan konselor pilihan Anda.
                </p>
              </div>
              <div className="text-center py-8 px-4 border rounded-lg flex flex-col items-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Segera Datang!</h3>
                <p className="text-muted-foreground mt-2">
                  Jadwal ketersediaan konselor akan segera tersedia.
                  Anda akan dapat melihat jadwal dan waktu konsultasi yang tersedia.
                </p>
              </div>
              <div className="text-center py-8 px-4 border rounded-lg flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Pemberitahuan</h3>
                <p className="text-muted-foreground mt-2">
                  Semua fitur janji konsultasi masih dalam pengembangan.
                  Terima kasih atas kesabaran Anda menunggu layanan ini tersedia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsDashboard;
