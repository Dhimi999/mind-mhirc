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

const ASSIGNMENT_KEY = "spiritualPsikoEduSession4Assignment";

interface AssignmentData { situasi: string; perilakuMencariBantuan: string; tindakan: string; hasil: string; refleksi: string; jurnal: string; submitted?: boolean; }

const defaultAssignment: AssignmentData = { situasi: "", perilakuMencariBantuan: "", tindakan: "", hasil: "", refleksi: "", jurnal: "", submitted: false };

// Jadwal diambil dinamis lewat Supabase (psikoedukasi_meetings)

const SpiritualPsikoedukasiPortalSesi4: React.FC = () => {
  const sessionNumber = 4;
  const title = "Perilaku Mencari Bantuan Bagi Mahasiswa";
  const { user } = useAuth();
  const { progress, meetingSchedule: schedule, markMeetingDone, submitAssignment: submitAssignmentRemote, loadAssignment, autoSaveAssignment, groupAssignment, isSuperAdmin, allGroupSchedules, loading } = useSpiritualPsikoedukasiSession(sessionNumber, user?.id);
  const [hasReadGuide, setHasReadGuide] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentData>(defaultAssignment);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const remote = await loadAssignment();
      if (remote && typeof remote === 'object') {
        setAssignment(prev => ({ ...prev, ...(remote as Partial<AssignmentData>) }));
      } else {
        try { const rawA = localStorage.getItem(ASSIGNMENT_KEY); if (rawA) setAssignment(prev => ({ ...prev, ...JSON.parse(rawA) })); } catch (_e) { /* ignore */ }
      }
    })();
  }, [loadAssignment]);

  useEffect(() => {
    if (progress.assignmentDone) return;
    const h = setTimeout(() => {
  autoSaveAssignment(assignment);
  try { localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignment)); } catch (_e) { /* ignore */ }
      setAutoSavedAt(new Date().toLocaleTimeString());
    }, 700);
    return () => clearTimeout(h);
  }, [assignment, progress.assignmentDone, autoSaveAssignment]);

  const assignmentValid = useMemo(() => [assignment.situasi, assignment.perilakuMencariBantuan, assignment.tindakan, assignment.hasil, assignment.refleksi, assignment.jurnal].every(f=> f.trim()), [assignment]);
  const overallPercent = useMemo(() => { let t=0; if (progress.sessionOpened) t+=20; if (progress.meetingDone) t+=30; if (progress.assignmentDone) t+=30; if (progress.counselorResponse) t+=20; return t; }, [progress]);
  const assignmentFillPercent = useMemo(()=> { const fields=[assignment.situasi, assignment.perilakuMencariBantuan, assignment.tindakan, assignment.hasil, assignment.refleksi, assignment.jurnal]; const filled=fields.filter(x=> x.trim()).length; return Math.round((filled/fields.length)*100); }, [assignment]);
  const handleSubmitAssignment = useCallback(async () => { if(!assignmentValid || progress.assignmentDone) return; const ok = await submitAssignmentRemote(assignment); if (ok) setAssignment(p=> ({ ...p, submitted:true })); }, [assignmentValid, progress.assignmentDone, assignment, submitAssignmentRemote]);

  const renderGuide = () => { if (!progress.meetingDone) return <div className="text-sm text-muted-foreground">Panduan akan muncul setelah Anda menandai Pertemuan Daring selesai.</div>; return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="rounded-lg border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white p-4">
        <p className="font-semibold text-indigo-800 mb-1">Fokus Sesi 4 â€” Perilaku Mencari Bantuan</p>
        <p>Perilaku mencari bantuan mendorong mahasiswa aktif mengakses dukungan ketika kewalahan: konseling kampus, teman sebaya suportif, hotline krisis, atau layanan profesional. Kesadaran dan kesiapan mencari bantuan menurunkan risiko eskalasi masalah.</p>
      </div>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Mengidentifikasi situasi pemicu kebutuhan bantuan.</li>
        <li>Mendefinisikan perilaku mencari bantuan adaptif.</li>
        <li>Menjabarkan langkah tindakan konkret.</li>
        <li>Mengevaluasi hasil & hambatan.</li>
        <li>Refleksi motivasi & rencana tindak lanjut.</li>
      </ul>
      <div className="border rounded p-3 bg-indigo-50 text-xs text-indigo-800">Catatan: Normal untuk merasa ragu mencari bantuan â€” latihan ini membantu membangun keberanian & struktur langkah.</div>
      <div className="text-xs text-muted-foreground">Isi bertahap â€” otomatis tersimpan.</div>
    </div>
  ); };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Sesi 4 - {title} | Psikoedukasi</title>
        <meta name="description" content={`Portal psikoedukasi sesi 4: ${title}`} />
        <link rel="canonical" href="https://mind-mhirc.my.id/spiritual-budaya/psikoedukasi/sesi/4" />
      </Helmet>
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative overflow-hidden rounded">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800" />
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Psikoedukasi" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya/psikoedukasi" className="text-white/90 hover:underline text-sm">â† Kembali</Link>
                <Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Sesi</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">Sesi 4: {title}</h1>
              <p className="text-indigo-100 max-w-2xl">Membangun kesiapan & langkah konkret mencari bantuan.</p>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6"><div className="rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 p-5 shadow-sm sticky top-28"><h3 className="font-semibold mb-4 text-sm tracking-wide text-indigo-700">PROGRES SESI</h3><div className="mb-4"><div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all" style={{ width: `${overallPercent}%` }} /></div><div className="mt-2 text-xs text-indigo-700 font-medium">{overallPercent}% selesai</div></div><ol className="space-y-3 text-xs"><li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.sessionOpened?'bg-green-500 text-white':'bg-indigo-200 text-indigo-800'}`}>âœ“</span><span>Sesi Dibuka</span></li><li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.meetingDone?'bg-green-500 text-white':'bg-indigo-200 text-indigo-800'}`}>1</span><span>Pertemuan Daring</span></li><li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${(progress.meetingDone && hasReadGuide)||progress.assignmentDone?'bg-green-500 text-white':'bg-indigo-200 text-indigo-800'}`}>2</span><span>Panduan & Penugasan</span></li><li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.counselorResponse?'bg-green-500 text-white':'bg-indigo-200 text-indigo-800'}`}>3</span><span>Response Konselor</span></li></ol></div><div className="rounded-xl border border-indigo-100 p-4 text-xs leading-relaxed bg-white/60 backdrop-blur"><p className="font-semibold mb-1 text-indigo-700">Tips</p><p>Siapkan daftar kontak bantuan (teman, hotline, layanan kampus) sebelum krisis.</p></div></div>
          <div className="lg:col-span-3 space-y-8">
            <Card className="border-indigo-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 p-1">
                <div className="bg-white rounded-sm">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <CardTitle className="text-indigo-800">Pertemuan Daring</CardTitle>
                        <CardDescription>Sesi sinkron fasilitator</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => { const meeting = schedule; const normalizeHref = (url?: string | null) => { if (!url) return undefined; try { const u = new URL(url); return u.toString(); } catch { if (/^\/?\/?[\w.-]+/.test(url)) return `https://${url.replace(/^\/+/, '')}`; return url; } }; return (
                      loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded border p-3 bg-muted/30 animate-pulse">
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
                                <span className="px-2 py-0.5 text-[11px] rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">{k}</span>
                              </div>
                              <div className="text-sm"><span className="text-muted-foreground">Tanggal:</span> <span className="font-medium">{allGroupSchedules[k]?.date || 'TBD'}</span></div>
                              <div className="text-sm"><span className="text-muted-foreground">Waktu:</span> <span className="font-medium">{allGroupSchedules[k]?.time || 'TBD'}</span></div>
                              <div className="text-sm"><span className="text-muted-foreground">Link:</span> {allGroupSchedules[k]?.link ? (
                                <a className="text-indigo-700 underline font-medium" href={normalizeHref(allGroupSchedules[k]?.link)} target="_blank" rel="noreferrer">Tersedia</a>
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
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /><span className="text-muted-foreground">Tanggal:</span><span className="font-medium">{meeting?.date || 'TBD'}</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /><span className="text-muted-foreground">Waktu:</span><span className="font-medium">{meeting?.time || 'TBD'}</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /><span className="text-muted-foreground">Link:</span>{meeting?.link ? <a href={normalizeHref(meeting.link)} target="_blank" rel="noreferrer" className="text-indigo-700 underline font-medium">Tersedia</a> : <span className="font-medium">TBD</span>}</div>
                          </div>
                        </>
                      )
                    ); })()}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!schedule?.link} onClick={() => schedule?.link && window.open(schedule.link, '_blank')}>Mulai Pertemuan</Button>
                        <Button size="sm" variant={progress.meetingDone ? "destructive" : "outline"} disabled={progress.meetingDone} onClick={() => !progress.meetingDone && markMeetingDone()}>{progress.meetingDone ? 'Sudah Selesai' : 'Tandai Selesai'}</Button>
                      </div>
                      <div className="sm:ml-auto">
                        <Badge className={progress.meetingDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>{progress.meetingDone ? 'âœ“ Sudah selesai' : 'â³ Belum selesai'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
            <Card className="border-indigo-100 shadow-sm"><CardHeader><CardTitle>Panduan Sesi</CardTitle><CardDescription>Baca & centang konfirmasi sebelum penugasan.</CardDescription></CardHeader><CardContent>{renderGuide()}{progress.meetingDone && (<div className="mt-4 text-sm space-y-2"><label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={hasReadGuide || progress.assignmentDone} onChange={()=> setHasReadGuide(v=> !v)} disabled={progress.assignmentDone} /><span>Saya telah membaca dan memahami panduan.</span></label><label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={(hasReadGuide && !progress.assignmentDone) || progress.assignmentDone} onChange={()=> setHasReadGuide(v=> !v)} disabled={!hasReadGuide || progress.assignmentDone} /><span>Saya akan mengikuti panduan selama mengerjakan sesi.</span></label></div>)}</CardContent></Card>
            <GuidanceMaterialsDisplay
              guidance_text={schedule?.guidance_text}
              guidance_pdf_url={schedule?.guidance_pdf_url}
              guidance_audio_url={schedule?.guidance_audio_url}
              guidance_video_url={schedule?.guidance_video_url}
              guidance_links={schedule?.guidance_links}
            />
            <Card className="border-indigo-100 shadow-md"><CardHeader><CardTitle>Penugasan</CardTitle><CardDescription>Latihan perilaku mencari bantuan</CardDescription></CardHeader><CardContent>{!hasReadGuide && !progress.assignmentDone && (<div className="mb-4 p-3 rounded border border-indigo-300 bg-indigo-50 text-indigo-900 text-sm">Penugasan terkunci. Baca panduan lalu centang konfirmasi.</div>)}<div className={(!hasReadGuide && !progress.assignmentDone)?'pointer-events-none opacity-60 select-none':''}><div className="space-y-8"><div><h4 className="font-semibold mb-3">Identitas Peserta</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2"><div><label className="block text-xs font-medium mb-1">Nama</label><input className="w-full border rounded p-2 text-sm bg-gray-50" value={user?.full_name||'-'} disabled /></div><div><label className="block text-xs font-medium mb-1">Hari</label><input className="w-full border rounded p-2 text-sm bg-gray-50" value={new Date().toLocaleDateString('id-ID',{ weekday:'long'})} disabled /></div><div><label className="block text-xs font-medium mb-1">Tanggal</label><input className="w-full border rounded p-2 text-sm bg-gray-50" value={new Date().toLocaleDateString('id-ID')} disabled /></div></div></div><div><h4 className="font-semibold mb-3">1. Situasi</h4><textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.situasi} onChange={e=> setAssignment(p=> ({ ...p, situasi: e.target.value }))} disabled={progress.assignmentDone} /></div><div><h4 className="font-semibold mb-3">2. Perilaku Mencari Bantuan</h4><textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.perilakuMencariBantuan} onChange={e=> setAssignment(p=> ({ ...p, perilakuMencariBantuan: e.target.value }))} disabled={progress.assignmentDone} /></div><div><h4 className="font-semibold mb-3">3. Tindakan</h4><textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.tindakan} onChange={e=> setAssignment(p=> ({ ...p, tindakan: e.target.value }))} disabled={progress.assignmentDone} /></div><div><h4 className="font-semibold mb-3">4. Hasil</h4><textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.hasil} onChange={e=> setAssignment(p=> ({ ...p, hasil: e.target.value }))} disabled={progress.assignmentDone} /></div><div><h4 className="font-semibold mb-3">5. Refleksi</h4><textarea rows={3} className="w-full rounded border p-2 text-sm" value={assignment.refleksi} onChange={e=> setAssignment(p=> ({ ...p, refleksi: e.target.value }))} disabled={progress.assignmentDone} /></div><div><h4 className="font-semibold mb-3">6. Jurnal Harian</h4><textarea rows={5} className="w-full rounded border p-2 text-sm" value={assignment.jurnal} onChange={e=> setAssignment(p=> ({ ...p, jurnal: e.target.value }))} disabled={progress.assignmentDone} /></div><div className="flex items-center gap-3 pt-2 border-t"><Button className="bg-indigo-600 hover:bg-indigo-700" disabled={!assignmentValid || progress.assignmentDone} onClick={handleSubmitAssignment}>{progress.assignmentDone? 'Terkirim':'Kirim & Tandai Selesai'}</Button><Badge className={progress.assignmentDone?'bg-green-600 text-white':'bg-indigo-200 text-indigo-900'}>{progress.assignmentDone? 'Sudah selesai':'Belum selesai'}</Badge>{autoSavedAt && !progress.assignmentDone && <span className="text-xs text-muted-foreground">Draft tersimpan: {autoSavedAt}</span>}</div><div className="text-[11px] text-muted-foreground">Progress penugasan: {assignmentFillPercent}%</div></div></div></CardContent></Card>
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

export default SpiritualPsikoedukasiPortalSesi4;
