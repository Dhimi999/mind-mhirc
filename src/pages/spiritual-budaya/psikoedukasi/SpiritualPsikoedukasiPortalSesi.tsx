import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/spiritual-cultural-hero.jpg';

// LocalStorage keys (separate namespace from intervensi hn-cbt)
const PROGRESS_KEY = 'spiritualPsikoEduProgress';
const ASSIGNMENT_KEY_PREFIX = 'spiritualPsikoEduSessionAssignment_';

interface SessionProgress {
  materialRead: boolean;
  assignmentDone: boolean;
  sessionOpened: boolean;
  counselorResponse?: string;
}

interface AssignmentData {
  konsep: string[]; // 3 konsep utama (min 2)
  aplikasi: string[]; // 3 contoh penerapan (min 2)
  distorsi: { label: string; alternatif: string }[]; // 2 distorsi (min 1 pair filled)
  rencana7Hari: string; // plan
  submitted?: boolean;
}

const defaultAssignment: AssignmentData = {
  konsep: Array(3).fill(''),
  aplikasi: Array(3).fill(''),
  distorsi: Array(2).fill(0).map(() => ({ label: '', alternatif: '' })),
  rencana7Hari: '',
  submitted: false
};

const psikoModules: Record<number, { title: string; focus: string; description: string }> = {
  1: { title: 'Fondasi CBT + Naratif', focus: 'Memahami hubungan pikiran-emosi-perilaku & konstruksi naratif diri', description: 'Mengenali bagaimana pikiran membentuk emosi & tindakan serta peran narasi dalam identitas.' },
  2: { title: 'Emosi & Regulasi Dasar', focus: 'Memetakan emosi dan strategi regulatif adaptif', description: 'Mengidentifikasi pemicu emosional dan memilih teknik regulasi yang sesuai.' },
  3: { title: 'Distorsi Kognitif Umum', focus: 'Mengidentifikasi pola pikir tidak akurat dan alternatif adaptif', description: 'Belajar pola distorsi populer dan cara meng-counter bentuknya.' },
  4: { title: 'Aktivasi Perilaku & Nilai', focus: 'Menghubungkan aktivitas bermakna dengan nilai pribadi', description: 'Menyusun rencana aktivitas konsisten yang mendukung nilai inti.' }
};

const SpiritualPsikoedukasiPortalSesi: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const navigate = useNavigate();
  const sessionNumber = Number(sesi || '1');
  const meta = psikoModules[sessionNumber] || psikoModules[1];

  const [progressMap, setProgressMap] = useState<Record<number, SessionProgress>>({});
  const progress = progressMap[sessionNumber] || { materialRead: false, assignmentDone: false, sessionOpened: false };
  const [assignment, setAssignment] = useState<AssignmentData>(defaultAssignment);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

  // Load progress & assignment
  useEffect(() => {
    try { const raw = localStorage.getItem(PROGRESS_KEY); if (raw) setProgressMap(JSON.parse(raw)); } catch {}
    try { const rawA = localStorage.getItem(ASSIGNMENT_KEY_PREFIX + sessionNumber); if (rawA) setAssignment(p => ({ ...p, ...JSON.parse(rawA) })); } catch {}
    // Mark session opened
    setProgressMap(prev => ({ ...prev, [sessionNumber]: { ...(prev[sessionNumber] || { materialRead: false, assignmentDone: false, sessionOpened: true }), sessionOpened: true } }));
  }, [sessionNumber]);

  // Persist progress
  useEffect(() => { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap)); } catch {} }, [progressMap]);
  // Autosave assignment
  useEffect(() => {
    const h = setTimeout(() => {
      try { localStorage.setItem(ASSIGNMENT_KEY_PREFIX + sessionNumber, JSON.stringify(assignment)); setAutoSavedAt(new Date().toLocaleTimeString()); } catch {}
    }, 500);
    return () => clearTimeout(h);
  }, [assignment, sessionNumber]);

  const updateProgress = (patch: Partial<SessionProgress>) => {
    setProgressMap(prev => ({
      ...prev,
      [sessionNumber]: { ...(prev[sessionNumber] || { materialRead: false, assignmentDone: false, sessionOpened: true }), ...patch }
    }));
  };

  // Validation
  const assignmentValid = useMemo(() => {
    const konsepCount = assignment.konsep.filter(k => k.trim()).length; if (konsepCount < 2) return false;
    const aplikasiCount = assignment.aplikasi.filter(a => a.trim()).length; if (aplikasiCount < 2) return false;
    const distorsiFilled = assignment.distorsi.filter(d => d.label.trim() && d.alternatif.trim()).length; if (distorsiFilled < 1) return false;
    if (!assignment.rencana7Hari.trim()) return false;
    return true;
  }, [assignment]);

  const overallPercent = useMemo(() => {
    let t = 0; if (progress.sessionOpened) t += 20; if (progress.materialRead) t += 30; if (progress.assignmentDone) t += 30; if (progress.counselorResponse) t += 20; return t;
  }, [progress]);

  const assignmentFillPercent = useMemo(() => {
    const fields: number[] = [];
    fields.push(...assignment.konsep.map(v => v ? 1 : 0));
    fields.push(...assignment.aplikasi.map(v => v ? 1 : 0));
    fields.push(...assignment.distorsi.map(v => (v.label && v.alternatif) ? 2 : (v.label || v.alternatif) ? 1 : 0)); // weight 2 if complete pair
    fields.push(assignment.rencana7Hari ? 2 : 0);
    const total = 3 + 3 + 2*assignment.distorsi.length + 2; // 3 + 3 + 4 + 2 = 12
    const filled = fields.reduce((a,b) => a + b, 0);
    return Math.min(100, Math.round((filled / total) * 100));
  }, [assignment]);

  const setKonsep = (idx: number, val: string) => setAssignment(p => ({ ...p, konsep: p.konsep.map((v,i)=> i===idx? val : v) }));
  const setAplikasi = (idx: number, val: string) => setAssignment(p => ({ ...p, aplikasi: p.aplikasi.map((v,i)=> i===idx? val : v) }));
  const setDistorsi = (idx: number, key: 'label' | 'alternatif', val: string) => setAssignment(p => ({ ...p, distorsi: p.distorsi.map((d,i)=> i===idx? { ...d, [key]: val }: d) }));

  const handleSubmit = useCallback(async () => {
    if (!assignmentValid) return;
    await new Promise(r => setTimeout(r, 350));
    setAssignment(p => ({ ...p, submitted: true }));
    updateProgress({ assignmentDone: true });
  }, [assignmentValid]);

  const moduleNavigation = (
    <div className='flex flex-wrap gap-2 text-xs'>
      {Object.keys(psikoModules).map(n => {
        const num = Number(n);
        const active = num === sessionNumber;
        return (
          <button key={n} onClick={() => navigate(`/spiritual-budaya/psikoedukasi/sesi/${num}`)} className={`px-3 py-1 rounded-full border transition ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700'}`}>Modul {num}</button>
        );
      })}
    </div>
  );

  return (
    <div className='min-h-screen flex flex-col'>
      <Helmet>
        <title>Psikoedukasi Sesi {sessionNumber} - {meta.title} | Hibrida Naratif CBT</title>
        <meta name='description' content={`Portal psikoedukasi sesi ${sessionNumber} fokus: ${meta.focus}`} />
        <link rel='canonical' href={`https://mind-mhirc.my.id/spiritual-budaya/psikoedukasi/sesi/${sessionNumber}`} />
      </Helmet>
      <Navbar />
      <main className='flex-1 pt-24'>
        {/* Hero */}
        <section className='relative overflow-hidden rounded'>
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800' />
            <div className='absolute inset-0 opacity-20'>
              <img src={heroImage} alt='Psikoedukasi' className='w-full h-full object-cover' />
            </div>
          <div className='relative container mx-auto px-6 py-12'>
            <div className='max-w-5xl mx-auto text-white'>
              <div className='flex items-center justify-between mb-4'>
                <Link to='/spiritual-budaya/psikoedukasi' className='text-white/80 hover:underline text-sm'>â† Kembali</Link>
                <Badge className='bg-white/20 backdrop-blur border border-white/30'>Psikoedukasi</Badge>
              </div>
              <h1 className='text-3xl md:text-5xl font-bold mb-3'>Modul {sessionNumber}: {meta.title}</h1>
              <p className='text-indigo-100 max-w-2xl mb-4'>{meta.description}</p>
              {moduleNavigation}
            </div>
          </div>
        </section>
        <section className='py-12'>
          <div className='container mx-auto px-6 max-w-6xl'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
              {/* Left Progress */}
              <div className='lg:col-span-1 space-y-6'>
                <div className='rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 p-5 shadow-sm sticky top-28'>
                  <h3 className='font-semibold mb-4 text-sm tracking-wide text-indigo-700'>PROGRES MODUL</h3>
                  <div className='mb-4'>
                    <div className='h-3 w-full bg-indigo-100 rounded-full overflow-hidden'>
                      <div className='h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all' style={{ width: `${overallPercent}%` }} />
                    </div>
                    <div className='mt-2 text-xs text-indigo-700 font-medium'>{overallPercent}% selesai</div>
                  </div>
                  <ol className='space-y-3 text-xs'>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.sessionOpened ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>âœ“</span>
                      <span>Modul Dibuka</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.materialRead ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>1</span>
                      <span>Materi Dibaca</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.assignmentDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>2</span>
                      <span>Penugasan Selesai</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.counselorResponse ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>3</span>
                      <span>Response Konselor</span>
                    </li>
                  </ol>
                </div>
                <div className='rounded-xl border border-indigo-100 p-4 text-xs leading-relaxed bg-white/60 backdrop-blur'>
                  <p className='font-semibold mb-1 text-indigo-700'>Catatan</p>
                  <p>Isi penugasan bertahap. Draft tersimpan otomatis untuk mencegah kehilangan data.</p>
                </div>
              </div>
              {/* Right Main */}
              <div className='lg:col-span-3 space-y-8'>
                {/* Materi Ringkas */}
                <Card className='border-indigo-100 shadow-sm'>
                  <CardHeader>
                    <CardTitle>Materi Inti</CardTitle>
                    <CardDescription>Ringkasan konsep utama modul ini.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4 text-sm leading-relaxed'>
                      <div className='rounded-lg border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white p-4'>
                        <p className='font-semibold text-indigo-800 mb-1'>Fokus: {meta.focus}</p>
                        <p>Bagian psikoedukasi ini memberikan dasar konseptual. Bacalah dengan seksama, kemudian tandai bahwa Anda sudah menyelesaikan membaca materi sebelum mengerjakan penugasan.</p>
                      </div>
                      <ul className='list-disc pl-5 space-y-1 text-muted-foreground text-xs'>
                        <li>Konsep 1â€“2 paragraf singkat (placeholder).</li>
                        <li>Integrasi contoh aplikasi sederhana.</li>
                        <li>Transisi ke refleksi personal & implementasi.</li>
                      </ul>
                      <div className='flex items-center gap-3 pt-2'>
                        <Button size='sm' variant={progress.materialRead ? 'destructive' : 'outline'} onClick={() => updateProgress({ materialRead: !progress.materialRead })}>{progress.materialRead ? 'Batalkan Centang' : 'Tandai Sudah Dibaca'}</Button>
                        <Badge className={progress.materialRead ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>{progress.materialRead ? 'âœ“ Dibaca' : 'Belum Dibaca'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Penugasan */}
                <Card className='border-indigo-100 shadow-md'>
                  <CardHeader>
                    <CardTitle>Penugasan Psikoedukasi</CardTitle>
                    <CardDescription>Refleksi & penerapan dasar konsep.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!progress.materialRead && !progress.assignmentDone && (
                      <div className='mb-4 p-3 rounded border border-indigo-300 bg-indigo-50 text-indigo-900 text-sm'>Penugasan terkunci. Tandai materi sudah dibaca untuk membuka.</div>
                    )}
                    <div className={(!progress.materialRead && !progress.assignmentDone) ? 'pointer-events-none opacity-60 select-none' : ''}>
                      <div className='space-y-8'>
                        {/* 1 Konsep */}
                        <div>
                          <h4 className='font-semibold mb-3'>1. Ringkas 2â€“3 Konsep Utama</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Tuliskan dengan kata sendiri agar memahami benar.</p>
                          <div className='space-y-2 ml-2'>
                            {assignment.konsep.map((v,i)=>(
                              <div key={i} className='flex items-start gap-2'>
                                <span className='w-6 text-xs text-gray-500'>{i+1})</span>
                                <textarea rows={2} className='flex-1 border rounded p-2 text-sm' placeholder={`Konsep ${i+1}`} value={v} onChange={e=> setKonsep(i, e.target.value)} disabled={progress.assignmentDone} />
                              </div>
                            ))}
                          </div>
                          <p className='text-[11px] text-muted-foreground mt-1'>Minimal isi 2.</p>
                        </div>
                        {/* 2 Aplikasi */}
                        <div>
                          <h4 className='font-semibold mb-3'>2. Contoh Aplikasi Harian</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Bagaimana Anda dapat menerapkan konsep di atas?</p>
                          <div className='space-y-2 ml-2'>
                            {assignment.aplikasi.map((v,i)=>(
                              <div key={i} className='flex items-center gap-2'>
                                <span className='w-6 text-xs text-gray-500'>{i+1})</span>
                                <input className='flex-1 border rounded p-2 text-sm' placeholder={`Aplikasi ${i+1}`} value={v} onChange={e=> setAplikasi(i, e.target.value)} disabled={progress.assignmentDone} />
                              </div>
                            ))}
                          </div>
                          <p className='text-[11px] text-muted-foreground mt-1'>Minimal isi 2 contoh.</p>
                        </div>
                        {/* 3 Distorsi */}
                        <div>
                          <h4 className='font-semibold mb-3'>3. Distorsi Kognitif & Alternatif</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Identifikasi 1â€“2 distorsi yang sering muncul & padankan dengan alternatif adaptif.</p>
                          <div className='space-y-4 ml-2'>
                            {assignment.distorsi.map((d,i)=>(
                              <div key={i} className='space-y-1 border rounded p-3 bg-white'>
                                <div className='flex flex-col gap-1'>
                                  <label className='text-xs font-medium'>Distorsi {i+1}</label>
                                  <input className='border rounded p-2 text-sm' placeholder='Misal: berpikir biner / overgeneralisasi' value={d.label} onChange={e=> setDistorsi(i,'label', e.target.value)} disabled={progress.assignmentDone} />
                                </div>
                                <div className='flex flex-col gap-1'>
                                  <label className='text-xs font-medium'>Alternatif Adaptif</label>
                                  <input className='border rounded p-2 text-sm' placeholder='Reframe / pikiran alternatif' value={d.alternatif} onChange={e=> setDistorsi(i,'alternatif', e.target.value)} disabled={progress.assignmentDone} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className='text:[11px] text-muted-foreground mt-1'>Minimal 1 pasang lengkap.</p>
                        </div>
                        {/* 4 Rencana 7 Hari */}
                        <div>
                          <h4 className='font-semibold mb-3'>4. Rencana Implementasi 7 Hari</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Susun rencana singkat bagaimana Anda menerapkan konsep (target, waktu, aktivitas kunci).</p>
                          <textarea rows={5} className='w-full border rounded p-2 text-sm' placeholder='Tuliskan rencana Anda...' value={assignment.rencana7Hari} onChange={e=> setAssignment(p=> ({ ...p, rencana7Hari: e.target.value }))} disabled={progress.assignmentDone} />
                        </div>
                        <div className='flex items-center gap-3 pt-2 border-t'>
                          <Button className='bg-indigo-600 hover:bg-indigo-700' disabled={!assignmentValid || progress.assignmentDone} onClick={handleSubmit}>{progress.assignmentDone ? 'Terkirim' : 'Kirim & Tandai Selesai'}</Button>
                          <Badge className={progress.assignmentDone ? 'bg-green-600 text-white' : 'bg-indigo-200 text-indigo-900'}>{progress.assignmentDone ? 'Sudah selesai' : 'Belum selesai'}</Badge>
                          {autoSavedAt && !progress.assignmentDone && <span className='text-xs text-muted-foreground'>Draft: {autoSavedAt}</span>}
                        </div>
                        <div className='text-[11px] text-muted-foreground'>Progress penugasan: {assignmentFillPercent}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Response Konselor */}
                <Card className='border-emerald-100 shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-emerald-600 rounded-lg'>
                        <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' /></svg>
                      </div>
                      <div>
                        <CardTitle className='text-emerald-800'>Response Konselor</CardTitle>
                        <CardDescription>Umpan balik & klarifikasi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {progress.counselorResponse ? (
                      <div className='space-y-3'>
                        <div className='bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500'>
                          <p className='text-sm leading-relaxed whitespace-pre-wrap'>{progress.counselorResponse}</p>
                        </div>
                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' /></svg>
                          Response diterima
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                          <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' /></svg>
                        </div>
                        <p className='text-sm text-muted-foreground mb-1'>{progress.assignmentDone ? 'Menunggu response dari konselor' : 'Response muncul setelah penugasan selesai'}</p>
                        <p className='text-xs text-muted-foreground'>Umpan balik diberikan 1â€“2 hari kerja</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpiritualPsikoedukasiPortalSesi;
