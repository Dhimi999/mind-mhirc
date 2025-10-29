import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, BookOpen, FileText, UserCheck, ArrowLeft, Download, SendHorizontal, X, Eye, EyeOff, ExternalLink, PlayCircle, Folder, MessageCircle, Globe, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type ProgramType = "intervensi" | "psikoedukasi";

interface SessionInfo { number: number; program: ProgramType; title: string; }
interface Assignment { id: string; user_id: string; session_number: number; answers: any; submitted: boolean; submitted_at: string | null; }
interface UserProgress { id: string; user_id: string; session_number: number; counselor_response: string | null; counselor_name: string | null; responded_at: string | null; }
interface UserProfile { id: string; full_name: string | null; }

const SpiritualAssignmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"list"|"guidance"|"answers"|"participants">("list");
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const intervensiSessions: SessionInfo[] = Array.from({ length: 8 }, (_, i) => ({ number: i+1, program: "intervensi", title: `Intervensi Sesi ${i+1}` }));
  const psikoSessions: SessionInfo[] = Array.from({ length: 8 }, (_, i) => ({ number: i+1, program: "psikoedukasi", title: `Psikoedukasi Sesi ${i+1}` }));

  // Guidance state (serialized in meetings table similar to HN-CBT)
  const [guidanceText, setGuidanceText] = useState<string>("");
  const [guidancePdf, setGuidancePdf] = useState<string[]>([]);
  const [guidanceAudio, setGuidanceAudio] = useState<string[]>([]);
  const [guidanceVideo, setGuidanceVideo] = useState<string[]>([]);
  const [guidanceLinks, setGuidanceLinks] = useState<{ title: string; url: string; icon?: string }[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState<string>("auto");
  const [selectedPdfIndex, setSelectedPdfIndex] = useState<number | null>(null);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState<"pdf"|"audio"|null>(null);

  // Participants state
  const [allParticipants, setAllParticipants] = useState<UserProfile[]>([]);

  // Answers state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<UserProgress | null>(null);
  const [counselorResponse, setCounselorResponse] = useState("");

  const onOpenSession = (session: SessionInfo, v: typeof view) => {
    setSelectedSession(session); setView(v);
    if (v === "guidance") fetchGuidance(session);
    if (v === "answers") fetchAnswers(session);
    if (v === "participants") fetchParticipants(session);
  };

  const tableBase = (p: ProgramType) => p === "intervensi" ? "sb_intervensi" : "sb_psikoedukasi";

  const fetchGuidance = async (session: SessionInfo) => {
    try {
      const { data, error } = await supabase
        .from(`${tableBase(session.program)}_meetings` as any)
        .select("guidance_text, guidance_pdf_url, guidance_audio_url, guidance_video_url, guidance_links")
        .eq("session_number", session.number)
        .maybeSingle();
      if (error) throw error;
      const toArray = (val: string | null): string[] => {
        if (!val) return [];
        const s = String(val).trim();
        if (!s) return [];
        if (s.startsWith("[") && s.endsWith("]")) { try { const arr = JSON.parse(s); if (Array.isArray(arr)) return arr.filter(Boolean); } catch {} }
        return s.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
      };
      setGuidanceText((data as any)?.guidance_text || "");
      setGuidancePdf(toArray((data as any)?.guidance_pdf_url || null));
      setGuidanceAudio(toArray((data as any)?.guidance_audio_url || null));
      setGuidanceVideo(toArray((data as any)?.guidance_video_url || null));
      setGuidanceLinks(((data as any)?.guidance_links as any) || []);
    } catch (e) {
      toast.error("Gagal memuat panduan");
    }
  };

  const fetchParticipants = async (session: SessionInfo) => {
    setLoading(true);
    try {
      const progressTable = `${tableBase(session.program)}_user_progress`;
      const { data: pData, error: pErr } = await supabase
        .from(progressTable as any)
        .select("user_id, meeting_done, assignment_done")
        .eq("session_number", session.number);
      if (pErr) throw pErr;
      const ids = [...new Set(((pData || []) as any[]).map((r: any)=> r.user_id))].map((v) => String(v)) as string[];
      if (ids.length) {
        const { data: prof, error: e2 } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids as string[]);
        if (e2) throw e2;
        setAllParticipants(prof || []);
      }
    } catch (e) {
      toast.error("Gagal memuat peserta");
    } finally { setLoading(false); }
  };

  const fetchAnswers = async (session: SessionInfo) => {
    setLoading(true);
    try {
      const assignmentsTable = `${tableBase(session.program)}_assignments`;
      const progressTable = `${tableBase(session.program)}_user_progress`;
      const { data: aData, error: aErr } = await supabase
        .from(assignmentsTable as any)
        .select("*")
        .eq("session_number", session.number)
        .order("submitted_at", { ascending: false });
      if (aErr) throw aErr;
      const { data: pData, error: pErr } = await supabase
        .from(progressTable as any)
        .select("*")
        .eq("session_number", session.number);
      if (pErr) throw pErr;
      const ids = [...new Set(((aData || []) as any[]).map((r: any)=> r.user_id))].map((v) => String(v)) as string[];
      if (ids.length) {
        const { data: prof, error: e2 } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids as string[]);
        if (e2) throw e2;
        const pm: Record<string, UserProfile> = {};
        prof?.forEach(u => { pm[u.id] = u; });
        setProfiles(pm);
      }
      setAssignments((aData as any) || []);
      const map: Record<string, UserProgress> = {};
      (pData as any)?.forEach((p: any) => { map[p.user_id] = p; });
      setProgress(map);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat jawaban");
    } finally { setLoading(false); }
  };

  const saveGuidance = async () => {
    if (!selectedSession) return;
    try {
      const serialize = (arr: string[]) => arr.length ? arr.join("\n") : null;
      const { error } = await supabase
        .from(`${tableBase(selectedSession.program)}_meetings` as any)
        .update({
          guidance_text: guidanceText || null,
          guidance_pdf_url: serialize(guidancePdf),
          guidance_audio_url: serialize(guidanceAudio),
          guidance_video_url: serialize(guidanceVideo),
          guidance_links: guidanceLinks as any
        })
        .eq('session_number', selectedSession.number);
      if (error) throw error;
      toast.success("Panduan berhasil disimpan");
    } catch (e) { toast.error("Gagal menyimpan panduan"); }
  };

  const handleViewDetail = (a: Assignment) => {
    setSelectedAssignment(a);
    setSelectedProgress(progress[a.user_id] || null);
    setCounselorResponse(progress[a.user_id]?.counselor_response || "");
    setIsDetailOpen(true);
  };

  const saveResponse = async () => {
    if (!selectedSession || !selectedAssignment || !selectedProgress) return;
    try {
      const { error } = await supabase
        .from(`${tableBase(selectedSession.program)}_user_progress` as any)
        .update({
          counselor_response: counselorResponse,
          counselor_name: user?.full_name || 'Konselor',
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedProgress.id);
      if (error) throw error;
      toast.success("Respons disimpan");
      setIsDetailOpen(false);
      fetchAnswers(selectedSession);
    } catch (e) { toast.error("Gagal menyimpan respons"); }
  };

  // Upload helpers reuse session-materials bucket (separate path per program)
  const uploadFile = async (type: "pdf"|"audio", file: File) => {
    if (!selectedSession) return;
    const allowed = type === 'pdf' ? ['application/pdf'] : ['audio/mpeg','audio/mp3','audio/wav'];
    if (!allowed.includes(file.type)) { toast.error(`Format salah: ${type}`); return; }
    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `spiritual-budaya/${selectedSession.program}/session-${selectedSession.number}/${type}/${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from('session-materials').upload(filePath, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('session-materials').getPublicUrl(filePath);
      if (type === 'pdf') setGuidancePdf(prev => [...prev, publicUrl]);
      else setGuidanceAudio(prev => [...prev, publicUrl]);
      toast.success("Berkas diunggah");
    } catch (e: any) { toast.error("Gagal unggah: " + e.message); } finally { setUploading(null); }
  };

  const removeUploaded = async (type: "pdf"|"audio", idx: number) => {
    const list = type === 'pdf' ? guidancePdf : guidanceAudio;
    const url = list[idx]; if (!url) return;
    try {
      const m = url.match(/session-materials\/(.+)$/);
      if (m) await supabase.storage.from('session-materials').remove([m[1]]);
      if (type === 'pdf') setGuidancePdf(prev => prev.filter((_,i)=> i!==idx));
      else setGuidanceAudio(prev => prev.filter((_,i)=> i!==idx));
      toast.success("Berkas dihapus");
    } catch { toast.error("Gagal menghapus berkas"); }
  };

  if (view === 'list') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Spiritual & Budaya — Manajemen Penugasan</h1>
          <p className="text-muted-foreground">Kelola panduan, lihat jawaban peserta, dan kirim respons konselor.</p>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-amber-700"/>Intervensi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {intervensiSessions.map(s => (
                <Card key={`int-${s.number}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">{s.number}</div>
                      <Badge variant="outline" className="text-xs">Intervensi</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">Sesi {s.number}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={()=> onOpenSession(s, 'guidance')}><BookOpen className="h-3 w-3 mr-2"/>Edit Panduan</Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={()=> onOpenSession(s, 'answers')}><FileText className="h-3 w-3 mr-2"/>Lihat Jawaban</Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={()=> onOpenSession(s, 'participants')}><UserCheck className="h-3 w-3 mr-2"/>Daftar Peserta</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-amber-700"/>Psikoedukasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {psikoSessions.map(s => (
                <Card key={`psi-${s.number}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">{s.number}</div>
                      <Badge variant="outline" className="text-xs">Psikoedukasi</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">Sesi {s.number}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={()=> onOpenSession(s, 'guidance')}><BookOpen className="h-3 w-3 mr-2"/>Edit Panduan</Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={()=> onOpenSession(s, 'answers')}><FileText className="h-3 w-3 mr-2"/>Lihat Jawaban</Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={()=> onOpenSession(s, 'participants')}><UserCheck className="h-3 w-3 mr-2"/>Daftar Peserta</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const detailHeader = (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => { setSelectedSession(null); setView('list'); }} className="mb-2 sm:mb-0">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar Sesi
          </Button>
          <h1 className="text-2xl font-semibold mt-2">{selectedSession?.title}</h1>
          <p className="text-muted-foreground">
            {view === 'guidance' ? 'Kelola panduan penugasan untuk sesi ini' : 'Lihat jawaban peserta dan berikan respons konselor'}
          </p>
        </div>
      </div>
    </div>
  );

  if (view === 'guidance') {
    return (
      <div>
        {detailHeader}
        <Card>
          <CardHeader>
            <CardTitle>Teks Panduan</CardTitle>
            <CardDescription>Teks panduan yang akan ditampilkan di portal peserta</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={8} value={guidanceText} onChange={e=> setGuidanceText(e.target.value)} className="mb-4" placeholder="Tulis panduan penugasan untuk sesi ini..." />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>File PDF</CardTitle>
              <CardDescription>Unggah satu atau lebih dokumen PDF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guidancePdf.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4"/><span className="text-sm">PDF {idx+1}</span></div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={()=> window.open(url, '_blank')}><ExternalLink className="h-3 w-3 mr-1"/>Buka</Button>
                      <Button size="sm" variant="destructive" onClick={()=> removeUploaded('pdf', idx)}><Trash2 className="h-3 w-3"/>Hapus</Button>
                    </div>
                  </div>
                ))}
                <Input type="file" accept=".pdf" onChange={e=> e.target.files && uploadFile('pdf', e.target.files[0])} disabled={uploading==='pdf'} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>File Audio</CardTitle>
              <CardDescription>Unggah satu atau lebih file audio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guidanceAudio.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-2"><PlayCircle className="h-4 w-4"/><span className="text-sm">Audio {idx+1}</span></div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={()=> window.open(url, '_blank')}><ExternalLink className="h-3 w-3 mr-1"/>Buka</Button>
                      <Button size="sm" variant="destructive" onClick={()=> removeUploaded('audio', idx)}><Trash2 className="h-3 w-3"/>Hapus</Button>
                    </div>
                  </div>
                ))}
                <Input type="file" accept=".mp3,.wav" onChange={e=> e.target.files && uploadFile('audio', e.target.files[0])} disabled={uploading==='audio'} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Link Video YouTube</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guidanceVideo.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={url} onChange={e=> setGuidanceVideo(prev=> prev.map((u,i)=> i===idx? e.target.value : u))} />
                  <Button size="sm" variant="ghost" onClick={()=> setGuidanceVideo(prev=> prev.filter((_,i)=> i!==idx))}><X className="h-4 w-4"/></Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input placeholder="https://www.youtube.com/watch?v=..." value={newVideoUrl} onChange={e=> setNewVideoUrl(e.target.value)} />
                <Button size="sm" onClick={()=> { if (!newVideoUrl.trim()) return; setGuidanceVideo(prev=> [...prev, newVideoUrl.trim()]); setNewVideoUrl(""); }}>Tambah</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tautan Eksternal</CardTitle>
              <CardDescription>Tambahkan link ke sumber eksternal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {guidanceLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {link.icon === 'youtube' && <PlayCircle className="h-4 w-4"/>}
                      {link.icon === 'google-drive' && <Folder className="h-4 w-4"/>}
                      {link.icon === 'facebook' && <Globe className="h-4 w-4"/>}
                      {link.icon === 'whatsapp' && <MessageCircle className="h-4 w-4"/>}
                      {(!link.icon || link.icon === 'link') && <Link2 className="h-4 w-4"/>}
                      <span className="text-sm font-medium">{link.title}</span>
                    </div>
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:underline truncate block">{link.url}</a>
                  </div>
                  <Button size="sm" variant="ghost" onClick={()=> setGuidanceLinks(prev=> prev.filter((_,i)=> i!==idx))}><Trash2 className="h-3 w-3"/></Button>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Judul link" value={newLinkTitle} onChange={e=> setNewLinkTitle(e.target.value)} />
                <Input placeholder="URL" value={newLinkUrl} onChange={e=> setNewLinkUrl(e.target.value)} />
                <div className="flex items-center gap-2">
                  <select className="flex-1 rounded border p-2 text-sm" value={newLinkIcon} onChange={e=> setNewLinkIcon(e.target.value)}>
                    <option value="auto">Auto</option>
                    <option value="link">Link</option>
                    <option value="youtube">YouTube</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <Button size="sm" onClick={()=> {
                    if (!newLinkTitle.trim() || !newLinkUrl.trim()) { toast.error("Judul dan URL harus diisi"); return; }
                    setGuidanceLinks(prev=> [...prev, { title: newLinkTitle, url: newLinkUrl, icon: newLinkIcon !== "auto" ? newLinkIcon : undefined }]);
                    setNewLinkTitle(""); setNewLinkUrl(""); setNewLinkIcon("auto");
                  }}><Plus className="h-4 w-4"/></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={saveGuidance} className="bg-amber-700 hover:bg-amber-800">Simpan Panduan</Button>
        </div>
      </div>
    );
  }

  // Answers
  if (view === 'answers') {
    return (
      <div>
        {detailHeader}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-amber-700"/></div>
        ) : (
          <div className="bg-card rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium w-16">No.</th>
                    <th className="text-left p-4 font-medium">Nama Peserta</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assignments.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Tidak ada penugasan yang dikumpulkan.</td></tr>
                  ) : (
                    assignments.map((a, i)=> {
                      const p = progress[a.user_id];
                      const hasResp = !!p?.counselor_response;
                      const isSubmitted = !!a.submitted || !!a.submitted_at;
                      const statusLabel = !isSubmitted ? 'Draft' : (hasResp ? 'Selesai' : 'Menunggu Balasan');
                      const statusVariant = !isSubmitted ? 'secondary' : (hasResp ? 'default' : 'outline');
                      return (
                        <tr key={a.id} className="hover:bg-muted/30">
                          <td className="p-4 text-sm text-muted-foreground">{i+1}</td>
                          <td className="p-4">{profiles[a.user_id]?.full_name || 'Tidak diketahui'}</td>
                          <td className="p-4"><Badge variant={statusVariant as any}>{statusLabel}</Badge></td>
                          <td className="p-4"><Button size="sm" variant="outline" onClick={()=> handleViewDetail(a)} className="inline-flex items-center"><FileText className="h-3 w-3"/><span className="hidden sm:inline ml-1">Lihat & Respons</span></Button></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detail Jawaban - {profiles[selectedAssignment?.user_id||""]?.full_name}</DialogTitle>
              <DialogDescription>Lihat jawaban dan beri respons konselor</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded p-3">
                <h4 className="font-semibold mb-2">Jawaban Peserta:</h4>
                <div className="bg-background p-3 rounded border max-h-[300px] overflow-y-auto">
                  {selectedAssignment?.answers ? (
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedAssignment.answers, null, 2)}</pre>
                  ) : (
                    <div className="text-sm text-muted-foreground">Tidak ada jawaban</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="resp">Respons Konselor</label>
                <Textarea id="resp" rows={6} value={counselorResponse} onChange={e=> setCounselorResponse(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=> setIsDetailOpen(false)}>Tutup</Button>
              <Button onClick={saveResponse} className="bg-amber-700 hover:bg-amber-800"><SendHorizontal className="h-4 w-4 mr-2"/>Simpan Respons</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Participants
  if (view === 'participants') {
    return (
      <div>
        {detailHeader}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-amber-700"/></div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Peserta Sesi {selectedSession?.number}</CardTitle>
              <CardDescription>Total {allParticipants.length} peserta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allParticipants.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{idx + 1}.</span>
                      <span className="text-sm">{p.full_name || 'Tanpa Nama'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default SpiritualAssignmentManagement;
