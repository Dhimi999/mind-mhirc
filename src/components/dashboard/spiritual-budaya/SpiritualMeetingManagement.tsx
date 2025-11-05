import React, { useEffect, useMemo, useState } from "react";
import { parseGroupSchedule } from "@/utils/groupSchedule";
import { CalendarCheck2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ProgramType = 'intervensi' | 'psikoedukasi';

interface Meeting {
  id: string;
  session_number: number;
  date: string | null;
  time: string | null;
  link: string | null;
  description: string | null;
}

const SpiritualMeetingManagement: React.FC = () => {
  const [program, setProgram] = useState<ProgramType>('intervensi');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "", time: "", link: "", description: "" });
  const [usePerGroup, setUsePerGroup] = useState(false);
  type GroupKey = 'A'|'B'|'C';
  type GroupSchedule = { date?: string; time?: string; link?: string };
  type GroupSchedules = Partial<Record<GroupKey, GroupSchedule>>;
  const [groupSchedules, setGroupSchedules] = useState<GroupSchedules>({});

  const parseGroupJson = (raw: string | null): GroupSchedules | null => parseGroupSchedule(raw);

  // Helpers to convert time formats and parse single-schedule JSON stored in `time` column
  const colonToDot = (v?: string) => (v ? v.replace(":", ".") : "");
  const dotToColon = (v?: string) => (v ? v.replace(".", ":") : "");
  const formatDate = (iso?: string | null) => {
    if (!iso) return 'Belum diatur';
    const parts = iso.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    }
    return iso;
  };
  const parseTimeJson = (raw: string | null | undefined): { start?: string; end?: string } => {
    if (!raw) return {};
    try {
      const obj = JSON.parse(raw);
      // supports { start, end } or { "start": "HH.mm" }
      const start = obj.start as string | undefined;
      const end = obj.end as string | undefined;
      return { start, end };
    } catch {
      // Fallback legacy format like "HH:MM - HH:MM" or single time
      const s = String(raw);
      if (s.includes("-")) {
        const [a, b] = s.split("-").map(x => x.trim());
        return { start: a, end: b };
      }
      return { start: s };
    }
  };

  const tableName = program === 'intervensi' ? 'sb_intervensi_meetings' : 'sb_psikoedukasi_meetings';

  useEffect(() => { fetchMeetings(); }, [program]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .order("session_number", { ascending: true });
      if (error) throw error;
      setMeetings((data as any) || []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat jadwal pertemuan");
    } finally { setLoading(false); }
  };

  const startEdit = (m: Meeting) => {
    setEditing(m);
    const parsed = parseGroupJson(m.link);
    setUsePerGroup(!!parsed);
    setGroupSchedules(parsed || {});
    // Prefill from single-schedule JSON in `time`
    const { start, end } = parseTimeJson(m.time);
    setForm({
      date: m.date || "",
      start_time: dotToColon(start) || "",
      end_time: dotToColon(end) || "",
      time: m.time || "",
      link: parsed ? "" : (m.link || ""),
      description: m.description || ""
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    try {
      // Persist single-schedule time as JSON text in `time` column: { start: "HH.mm", end: "HH.mm" }
      const startDot = colonToDot(form.start_time);
      const endDot = colonToDot(form.end_time);
      const timeJson = (startDot || endDot)
        ? JSON.stringify({ start: startDot || undefined, end: endDot || undefined })
        : null;
      const payload = {
        date: usePerGroup ? null : (form.date || null),
        time: usePerGroup ? null : timeJson,
        link: usePerGroup ? (groupSchedules as any) : (form.link || null),
        description: form.description || null
      };
      const { error } = await supabase
        .from(tableName as any)
        .update(payload)
        .eq('id', editing.id);
      if (error) throw error;
      toast.success("Berhasil menyimpan jadwal");
      setIsDialogOpen(false);
      setEditing(null);
      fetchMeetings();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Spiritual & Budaya — Manajemen Pertemuan</h1>
          <p className="text-sm text-muted-foreground">Kelola jadwal pertemuan untuk 8 sesi {program === 'intervensi' ? 'Intervensi' : 'Psikoedukasi'}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded px-3 py-2 bg-background">
            <span className="text-xs text-muted-foreground">Program:</span>
            <select className="text-sm bg-transparent" value={program} onChange={e=> setProgram(e.target.value as ProgramType)}>
              <option value="intervensi">Intervensi</option>
              <option value="psikoedukasi">Psikoedukasi</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMeetings}>Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-amber-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {meetings.map(m => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{program === 'intervensi' ? 'Intervensi' : 'Psiko'} Sesi {m.session_number}</CardTitle>
                    <CardDescription className="text-xs mt-1">{m.description || 'Belum ada deskripsi'}</CardDescription>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded"><CalendarCheck2 className="h-4 w-4 text-amber-700 dark:text-amber-300" /></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {(() => {
                  const parsed = parseGroupJson(m.link);
                  if (parsed) {
                    return (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Jadwal per grup:</div>
                        {(['A','B','C'] as GroupKey[]).map(k => (
                          <div key={k} className="rounded border p-2 bg-muted/30">
                            <div className="font-semibold">Grup {k}</div>
                            <div className="flex flex-col">
                              <span>Tanggal: <span className="font-medium">{formatDate(parsed[k]?.date || null)}</span></span>
                              <span>Waktu: <span className="font-medium">{(parsed as any)[k]?.start_time || (parsed as any)[k]?.end_time
                                ? `${(parsed as any)[k]?.start_time || ''}${(parsed as any)[k]?.start_time && (parsed as any)[k]?.end_time ? ' - ' : ''}${(parsed as any)[k]?.end_time || ''}`
                                : (parsed[k]?.time || 'Belum diatur')}</span></span>
                              <span className="truncate">Link: {parsed[k]?.link ? (<a href={parsed[k]!.link} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline">{parsed[k]!.link}</a>) : 'Belum diatur'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  const single = parseTimeJson(m.time);
                  const startColon = dotToColon(single.start || '');
                  const endColon = dotToColon(single.end || '');
                  const timeDisplay = (startColon || endColon)
                    ? `${startColon}${startColon && endColon ? ' - ' : ''}${endColon}`
                    : (m.time || 'Belum diatur');
                  return (
                    <>
                      <div><span className="text-muted-foreground">Tanggal:</span> <span className="font-medium">{formatDate(m.date)}</span></div>
                      <div><span className="text-muted-foreground">Waktu:</span> <span className="font-medium">{timeDisplay}</span></div>
                      <div className="truncate"><span className="text-muted-foreground">Link:</span> {m.link ? (<a href={m.link} className="text-amber-700 hover:underline" target="_blank" rel="noreferrer">{m.link}</a>) : 'Belum diatur'}</div>
                    </>
                  );
                })()}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full justify-center" onClick={()=> startEdit(m)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Edit Jadwal Sesi {editing?.session_number}</DialogTitle>
            <DialogDescription>Perbarui informasi pertemuan daring untuk sesi ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!usePerGroup ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input id="date" type="date" value={form.date} onChange={e=> setForm(f=> ({...f, date: e.target.value}))} placeholder="2025-10-05" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start">Jam Mulai</Label>
                    <Input id="start" type="time" value={form.start_time} onChange={e=> setForm(f=> ({...f, start_time: e.target.value}))} placeholder="20:00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end">Jam Selesai</Label>
                    <Input id="end" type="time" value={form.end_time} onChange={e=> setForm(f=> ({...f, end_time: e.target.value}))} placeholder="21:00" />
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Link Pertemuan</Label>
                    <Input id="link" value={form.link} onChange={e=> setForm(f=> ({...f, link: e.target.value}))} placeholder="https://meet.google.com/..." />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Mode jadwal per grup diaktifkan. Form jadwal umum dinonaktifkan.</div>
            )}

            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Gunakan jadwal per grup</Label>
                <input type="checkbox" checked={usePerGroup} onChange={e=> setUsePerGroup(e.target.checked)} />
              </div>
              {usePerGroup && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['A','B','C'] as GroupKey[]).map(g => (
                    <div key={g} className="space-y-2 border rounded p-3">
                      <div className="font-semibold">Grup {g}</div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tanggal</Label>
                        <Input type="date" placeholder="Tanggal" value={groupSchedules[g]?.date || ''} onChange={e=> setGroupSchedules(prev=> ({...prev, [g]: { ...(prev[g]||{}), date: e.target.value }}))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Jam Mulai</Label>
                        <Input type="time" placeholder="Jam Mulai" value={(groupSchedules[g] as any)?.start_time || groupSchedules[g]?.time || ''} onChange={e=> setGroupSchedules(prev=> ({...prev, [g]: { ...(prev[g]||{}), start_time: e.target.value }}))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Jam Selesai</Label>
                        <Input type="time" placeholder="Jam Selesai" value={(groupSchedules[g] as any)?.end_time || ''} onChange={e=> setGroupSchedules(prev=> ({...prev, [g]: { ...(prev[g]||{}), end_time: e.target.value }}))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Link</Label>
                        <Input placeholder="Link" value={groupSchedules[g]?.link || ''} onChange={e=> setGroupSchedules(prev=> ({...prev, [g]: { ...(prev[g]||{}), link: e.target.value }}))} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Jika mode per grup aktif, data akan disimpan sebagai JSON dan menggantikan jadwal umum.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Deskripsi</Label>
              <Textarea id="desc" rows={3} value={form.description} onChange={e=> setForm(f=> ({...f, description: e.target.value}))} placeholder="Deskripsi singkat sesi..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={save} className="bg-amber-600 hover:bg-amber-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpiritualMeetingManagement;
