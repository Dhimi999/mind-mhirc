import React, { useEffect, useState } from "react";
import { CalendarCheck2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Meeting {
  id: string;
  session_number: number;
  date: string | null;
  time: string | null;
  link: string | null;
  description: string | null;
  materials?: any; // keep compatibility if materials field added
}

type ProgramType = 'hibrida' | 'psikoedukasi';

const HibridaMeetingManagement: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [program, setProgram] = useState<ProgramType>('hibrida');

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    link: "",
    description: ""
  });

  useEffect(() => {
    fetchMeetings();
  }, [program]);

  const fetchMeetings = async () => {
    try {
      const table = program === 'hibrida' ? 'hibrida_meetings' : 'psikoedukasi_meetings';
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("session_number", { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat jadwal pertemuan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      date: meeting.date || "",
      time: meeting.time || "",
      link: meeting.link || "",
      description: meeting.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingMeeting) return;

    try {
      const table = program === 'hibrida' ? 'hibrida_meetings' : 'psikoedukasi_meetings';
      const { error } = await supabase
        .from(table)
        .update({
          date: formData.date || null,
          time: formData.time || null,
          link: formData.link || null,
          description: formData.description || null
        })
        .eq("id", editingMeeting.id);

      if (error) throw error;

      toast.success("Jadwal pertemuan berhasil diperbarui");
      setIsDialogOpen(false);
      fetchMeetings();
    } catch (error: any) {
      toast.error("Gagal memperbarui jadwal");
      console.error(error);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingMeeting(null);
    setFormData({ date: "", time: "", link: "", description: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Manajemen Pertemuan</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Kelola jadwal, tautan meeting, dan deskripsi untuk 8 sesi {program === 'hibrida' ? 'Intervensi HN-CBT' : 'Intervensi Psikoedukasi'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
            <span className="text-xs font-medium text-muted-foreground">Program:</span>
            <select
              className="text-sm bg-transparent focus:outline-none"
              value={program}
              onChange={e => setProgram(e.target.value as ProgramType)}
            >
              <option value="hibrida">HN-CBT</option>
              <option value="psikoedukasi">Psikoedukasi</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMeetings}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{program === 'hibrida' ? 'HN-CBT' : 'Psiko'} Sesi {meeting.session_number}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {meeting.description || "Belum ada deskripsi"}
                  </CardDescription>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded">
                  <CalendarCheck2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Tanggal:</span>
                <p className="font-medium">{meeting.date || "Belum diatur"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Waktu:</span>
                <p className="font-medium">{meeting.time || "Belum diatur"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Link:</span>
                <p className="font-medium text-xs truncate">
                  {meeting.link ? (
                    <a 
                      href={meeting.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {meeting.link}
                    </a>
                  ) : (
                    "Belum diatur"
                  )}
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(meeting)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Jadwal Sesi {editingMeeting?.session_number}</DialogTitle>
            <DialogDescription>
              Perbarui informasi pertemuan daring untuk sesi ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="text"
                  placeholder="2025-10-05"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Waktu</Label>
                <Input
                  id="time"
                  type="text"
                  placeholder="20:00 WIB"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link Pertemuan</Label>
              <Input
                id="link"
                type="text"
                placeholder="https://meet.google.com/..."
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat sesi..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HibridaMeetingManagement;
