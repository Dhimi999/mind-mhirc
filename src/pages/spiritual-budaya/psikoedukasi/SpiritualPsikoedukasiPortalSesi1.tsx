import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useSpiritualPsikoedukasiSession } from "@/hooks/useSpiritualPsikoedukasiSession";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";

// Use same progress key across psikoedukasi modules (aligned with listing component)
const PROGRESS_KEY = "spiritualPsikoEduProgress";
const ASSIGNMENT_KEY = "spiritualspiritualPsikoEduSession1Assignment";

interface SessionProgress {
  meetingDone: boolean;
  assignmentDone: boolean;
  sessionOpened: boolean;
  counselorResponse?: string;
}

interface AssignmentData {
  pengertian: string;
  risiko: string;
  protektif: string;
  bantuan: string;
  hasil: string;
  refleksi: string;
  jurnal: string;
  submitted?: boolean;
}

const defaultAssignment: AssignmentData = {
  pengertian: "",
  risiko: "",
  protektif: "",
  bantuan: "",
  hasil: "",
  refleksi: "",
  jurnal: "",
  submitted: false
};

// Jadwal kini diambil dinamis lewat Supabase (sb_psikoedukasi_meetings)

const SpiritualSpiritualPsikoedukasiPortalSesi1: React.FC = () => {
  const sessionNumber = 1;
  const title = "Pengenalan Tentang Bunuh Diri dan Risiko Terkait Bagi Mahasiswa";
  const { user } = useAuth();

  // Ganti ke hook Supabase untuk progres & meeting
  const {
    progress,
    meetingSchedule: schedule,
    markMeetingDone,
    markGuideDone,
    submitAssignment: submitAssignmentRemote,
    loadAssignment,
    autoSaveAssignment,
    groupAssignment,
    isSuperAdmin,
    allGroupSchedules,
    loading
  } = useSpiritualPsikoedukasiSession(sessionNumber, user?.id);
  const [progressMap, setProgressMap] = useState<Record<number, SessionProgress>>({}); // legacy local kept for backward compatibility
  const [assignment, setAssignment] = useState<AssignmentData>(defaultAssignment);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

  // Load existing draft from Supabase (remote) then merge with localStorage fallback
  useEffect(() => {
    (async () => {
      try {
        const remote = await loadAssignment();
        if (remote && typeof remote === 'object') {
          setAssignment(prev => ({ ...prev, ...remote as Partial<AssignmentData> }));
        } else {
          // fallback local (legacy)
          const rawA = localStorage.getItem(ASSIGNMENT_KEY);
          if (rawA) setAssignment(prev => ({ ...prev, ...JSON.parse(rawA) }));
        }
      } catch {}
    })();
  }, [loadAssignment]);

  // Autosave remote + legacy local
  useEffect(() => {
    if (progress.assignmentDone) return;
    const h = setTimeout(() => {
      autoSaveAssignment(assignment);
      try { localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignment)); } catch {}
      setAutoSavedAt(new Date().toLocaleTimeString());
    }, 700);
    return () => clearTimeout(h);
  }, [assignment, progress.assignmentDone, autoSaveAssignment]);

  const updateProgress = (_patch: Partial<SessionProgress>) => { /* handled remotely via hook now */ };

  const assignmentValid = useMemo(() => {
    if (!assignment.pengertian.trim()) return false;
    if (!assignment.risiko.trim()) return false;
    if (!assignment.protektif.trim()) return false;
    if (!assignment.bantuan.trim()) return false;
    if (!assignment.hasil.trim()) return false;
    if (!assignment.refleksi.trim()) return false;
    if (!assignment.jurnal.trim()) return false;
    return true;
  }, [assignment]);

  const overallPercent = useMemo(() => {
    const steps = [progress.sessionOpened, progress.meetingDone, progress.guideDone, !!progress.assignmentDone, !!progress.counselorResponse];
    return steps.filter(Boolean).length * 20;
  }, [progress]);

  const assignmentFillPercent = useMemo(() => {
    const fields = [assignment.pengertian, assignment.risiko, assignment.protektif, assignment.bantuan, assignment.hasil, assignment.refleksi, assignment.jurnal];
    const filled = fields.filter(f => f.trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [assignment]);

  const handleSubmitAssignment = useCallback(async () => {
    if (!assignmentValid || progress.assignmentDone) return;
    const ok = await submitAssignmentRemote(assignment);
    if (ok) {
      setAssignment(prev => ({ ...prev, submitted: true }));
    }
  }, [assignmentValid, progress.assignmentDone, assignment, submitAssignmentRemote]);

  const meeting = schedule; // alias

  const normalizeHref = (url?: string | null) => {
    if (!url) return undefined;
    try { const u = new URL(url); return u.toString(); } catch {
      if (/^\/?\/?[\w.-]+/.test(url)) return `https://${url.replace(/^\/+/, '')}`;
      return url;
    }
  };

  const renderGuide = () => {
    if (!progress.meetingDone) {
      return <div className="text-sm text-muted-foreground">Panduan akan muncul setelah Anda menandai Pertemuan Daring selesai.</div>;
    }
    return (
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="rounded-lg border-l-4 border-amber-600 bg-gradient-to-r from-amber-50 to-white p-4">
          <p className="font-semibold text-amber-800 mb-1">Fokus Sesi 1 — Pengenalan Tentang Bunuh Diri dan Risiko Terkait Bagi Mahasiswa</p>
          <p>Buku Kerja (Workbook) ini dirancang untuk membantu Anda yang sedang menjalani Psikoedukasi Pencegahan Bunuh Diri Bagi Mahasiswa. Pengenalan tentang risiko bunuh diri dan risiko terkait adalah melibatkan penyediaan informasi kepada mahasiswa tentang konsep bunuh diri, faktor risiko, dan tanda-tanda peringatan. Dengan melakukan analisis ini, Anda dapat lebih memahami apa itu bunuh diri dan risiko terjadinya bunuh diri.</p>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Memahami pengertian bunuh diri secara ilmiah dan sosial.</li>
          <li>Mengenali faktor risiko dan protektif.</li>
          <li>Mengetahui cara mencari bantuan dan sumber daya.</li>
          <li>Melakukan refleksi dan jurnal harian terkait topik ini.</li>
        </ul>
        <div className="border rounded p-3 bg-amber-50 text-xs text-amber-800">Catatan: Jika Anda atau teman Anda mengalami pikiran menyakiti diri, segera cari bantuan profesional.</div>
        <div className="text-xs text-muted-foreground">Isi bertahap — otomatis tersimpan.</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Sesi 1 - {title} | Psikoedukasi Spiritual & Budaya</title>
        <meta name="description" content={`Portal psikoedukasi sesi 1: ${title}`} />
        <link rel="canonical" href="https://www.mentalstatus.zone.id/spiritual-budaya/psikoedukasi/sesi/1" />
      </Helmet>
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800" />
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Psikoedukasi" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya/psikoedukasi" className="text-white/90 hover:underline text-sm">← Kembali</Link>
                <Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Sesi</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">Sesi 1: {title}</h1>
              <p className="text-amber-100 max-w-2xl">Fokus pada pengenalan bunuh diri, risiko, protektif, dan refleksi personal.</p>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column: Tips above Sticky Progress to avoid collision */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-xl border border-amber-100 p-4 text-xs leading-relaxed bg-white/60 backdrop-blur">
                  <p className="font-semibold mb-1 text-amber-700">Tips</p>
                  <p>Gunakan jurnal harian untuk merefleksikan perasaan dan pemikiran Anda setiap hari.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 p-5 shadow-sm sticky top-28">
                  <h3 className="font-semibold mb-4 text-sm tracking-wide text-amber-700">PROGRES SESI</h3>
                  <div className="mb-4">
                    <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-full transition-all" style={{ width: `${overallPercent}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-amber-700 font-medium">{overallPercent}% selesai</div>
                  </div>
                  <ol className="space-y-3 text-xs">
                    <li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.sessionOpened ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>1</span><span>Sesi Dibuka</span></li>
                    <li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.meetingDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>2</span><span>Materi Dibaca</span></li>
                    <li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.guideDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>3</span><span>Panduan Penugasan Selesai</span></li>
                    <li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.assignmentDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>4</span><span>Penugasan Selesai</span></li>
                    <li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.counselorResponse ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>5</span><span>Response Konselor</span></li>
                  </ol>
                </div>
                
              </div>
              {/* Right Main */}
              <div className="lg:col-span-3 space-y-8">
                {/* Panduan Sesi */}
                <Card className="border-amber-100 shadow-sm">
                  <CardHeader>
                    <CardTitle>Panduan Sesi</CardTitle>
                    <CardDescription>Alur pengerjaan sesi ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderGuide()}
                  </CardContent>
                </Card>

                {/* Informasi Pertemuan Daring */}
                <Card className="border-amber-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-1">
                    <div className="bg-white rounded-sm">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-600 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <CardTitle className="text-amber-800">Informasi Pertemuan Daring</CardTitle>
                            <CardDescription>Jadwal dan link pertemuan sesi ini</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        {loading ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="rounded border p-3 bg-muted/30 animate-pulse">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="h-3 bg-gray-200 rounded w-16" />
                                  <div className="h-4 bg-gray-200 rounded w-10" />
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-20" />
                              </div>
                            ))}
                          </div>
                        ) : isSuperAdmin && meeting?.has_group_schedules && allGroupSchedules ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {(['A','B','C'] as const).map(k => (
                              <div key={k} className="rounded border p-3 bg-muted/30">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Grup</span>
                                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-amber-100 text-amber-800 border border-amber-200">{k}</span>
                                </div>
                                <div className="text-sm"><span className="text-muted-foreground">Tanggal:</span> <span className="font-medium">{allGroupSchedules[k]?.date || 'TBD'}</span></div>
                                <div className="text-sm"><span className="text-muted-foreground">Waktu:</span> <span className="font-medium">{allGroupSchedules[k]?.time || 'TBD'}</span></div>
                                <div className="text-sm"><span className="text-muted-foreground">Link:</span> {allGroupSchedules[k]?.link ? (
                                  <a className="text-amber-700 underline font-medium" href={normalizeHref(allGroupSchedules[k]?.link)} target="_blank" rel="noreferrer">Tersedia</a>
                                ) : <span className="font-medium">TBD</span>}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 flex items-center gap-2">
                              {meeting?.has_group_schedules && (groupAssignment === 'A' || groupAssignment === 'B' || groupAssignment === 'C') && (
                                <span className="px-2 py-0.5 text-[11px] rounded-full bg-purple-100 text-purple-800 border border-purple-200">Grup {groupAssignment}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-600 rounded-full" /><span className="text-muted-foreground">Tanggal:</span><span className="font-medium">{meeting?.date || 'TBD'}</span></div>
                              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-600 rounded-full" /><span className="text-muted-foreground">Waktu:</span><span className="font-medium">{meeting?.time || 'TBD'}</span></div>
                              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-600 rounded-full" /><span className="text-muted-foreground">Link:</span>{meeting?.link ? <a href={normalizeHref(meeting.link)} target="_blank" rel="noreferrer" className="text-amber-700 underline font-medium">Tersedia</a> : <span className="font-medium">TBD</span>}</div>
                            </div>
                          </>
                        )}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={!meeting?.link} onClick={() => meeting?.link && window.open(meeting.link, '_blank')}>Mulai Pertemuan</Button>
                            <Button size="sm" variant={progress.meetingDone ? "destructive" : "outline"} disabled={progress.meetingDone} onClick={() => !progress.meetingDone && markMeetingDone()}>{progress.meetingDone ? 'Sudah Selesai' : 'Tandai Selesai'}</Button>
                          </div>
                          <div className="sm:ml-auto">
                            <Badge className={progress.meetingDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>{progress.meetingDone ? '✓ Sudah selesai' : '⏳ Belum selesai'}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
                {/* Panduan Penugasan */}
                <Card className="border-amber-100 shadow-sm">
                  <CardHeader>
                    <CardTitle>Panduan Penugasan</CardTitle>
                    <CardDescription>Rujukan materi & instruksi singkat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!progress.meetingDone ? (
                      <div className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded p-4">Panduan penugasan akan muncul setelah Anda menandai Informasi Pertemuan Daring sebagai selesai.</div>
                    ) : (
                      <>
                        <GuidanceMaterialsDisplay
                          guidance_text={meeting?.guidance_text}
                          guidance_pdf_url={meeting?.guidance_pdf_url}
                          guidance_audio_url={meeting?.guidance_audio_url}
                          guidance_video_url={meeting?.guidance_video_url}
                          guidance_links={meeting?.guidance_links}
                        />
                        <div className="flex items-center gap-3 pt-3">
                          {!progress.guideDone && (
                            <Button size="sm" variant="outline" onClick={markGuideDone}>Tandai Selesai</Button>
                          )}
                          <Badge className={progress.guideDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>{progress.guideDone ? '✓ Selesai' : 'Belum Selesai'}</Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                {/* Penugasan */}
                <Card className="border-amber-100 shadow-md">
                  <CardHeader>
                    <CardTitle>Penugasan</CardTitle>
                    <CardDescription>Refleksi dan analisis risiko bunuh diri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!progress.guideDone && !progress.assignmentDone && (
                      <div className="mb-4 p-3 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm">Penugasan terkunci. Selesaikan Panduan Penugasan untuk membuka.</div>
                    )}
                    <div className={(!progress.guideDone && !progress.assignmentDone) ? 'pointer-events-none opacity-60 select-none' : ''}>
                      <div className="space-y-8">
                        <div>
                          <h4 className="font-semibold mb-3">Identitas Peserta</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div>
                              <label className="block text-xs font-medium mb-1">Nama</label>
                              <input className="w-full border rounded p-2 text-sm bg-gray-50" value={user?.full_name || "-"} disabled />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Hari</label>
                              <input className="w-full border rounded p-2 text-sm bg-gray-50" value={new Date().toLocaleDateString('id-ID', { weekday: 'long' })} disabled />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Tanggal</label>
                              <input className="w-full border rounded p-2 text-sm bg-gray-50" value={new Date().toLocaleDateString('id-ID')} disabled />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">1. Pengertian Bunuh Diri</h4>
                          <textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.pengertian} onChange={e => setAssignment(p => ({ ...p, pengertian: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">2. Faktor Risiko</h4>
                          <textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.risiko} onChange={e => setAssignment(p => ({ ...p, risiko: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">3. Faktor Protektif</h4>
                          <textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.protektif} onChange={e => setAssignment(p => ({ ...p, protektif: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">4. Mencari Bantuan</h4>
                          <textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.bantuan} onChange={e => setAssignment(p => ({ ...p, bantuan: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">5. Hasil</h4>
                          <textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.hasil} onChange={e => setAssignment(p => ({ ...p, hasil: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">6. Refleksi</h4>
                          <textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.refleksi} onChange={e => setAssignment(p => ({ ...p, refleksi: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">7. Jurnal Harian</h4>
                          <textarea rows={5} className="w-full rounded border p-2 text-sm" value={assignment.jurnal} onChange={e => setAssignment(p => ({ ...p, jurnal: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t">
                          <Button className="bg-amber-600 hover:bg-amber-700" disabled={!assignmentValid || progress.assignmentDone} onClick={handleSubmitAssignment}>
                            {progress.assignmentDone ? 'Terkirim' : 'Kirim & Tandai Selesai'}
                          </Button>
                          <Badge className={progress.assignmentDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>{progress.assignmentDone ? 'Sudah selesai' : 'Belum selesai'}</Badge>
                          {autoSavedAt && !progress.assignmentDone && <span className="text-xs text-muted-foreground">Draft tersimpan: {autoSavedAt}</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Progress penugasan: {assignmentFillPercent}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Response Konselor */}
                <CounselorResponseDisplay
                  counselorResponse={progress.counselorResponse}
                  counselorName={progress.counselorName}
                  respondedAt={progress.respondedAt}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpiritualSpiritualPsikoedukasiPortalSesi1;
