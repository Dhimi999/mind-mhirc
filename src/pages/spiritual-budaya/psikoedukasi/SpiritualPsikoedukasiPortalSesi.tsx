import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import heroImage from '@/assets/spiritual-cultural-hero.jpg';
import { useAuth } from '@/contexts/AuthContext';
import { useSpiritualPsikoedukasiSession } from '@/hooks/useSpiritualPsikoedukasiSession';
import { useSpiritualRole } from '@/hooks/useSpiritualRole';
import { GuidanceMaterialsDisplay } from '@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay';
import { CounselorResponseDisplay } from '@/components/dashboard/hibrida-cbt/CounselorResponseDisplay';
import { supabase } from '@/integrations/supabase/client';

const psikoModules: Record<number, { title: string; focus: string; description: string }> = {
  1: { title: 'Spiritualitas & Kesejahteraan', focus: 'Memahami hubungan spiritualitas dengan kesehatan mental', description: 'Mengenali peran spiritualitas dalam kehidupan sehari-hari.' },
  2: { title: 'Budaya & Identitas Diri', focus: 'Eksplorasi identitas budaya dan pengaruhnya', description: 'Memahami bagaimana budaya membentuk perspektif diri.' },
  3: { title: 'Kearifan Lokal & Coping', focus: 'Memanfaatkan kearifan lokal untuk mengatasi stress', description: 'Belajar strategi coping berbasis budaya lokal.' },
  4: { title: 'Komunitas & Dukungan', focus: 'Peran komunitas dalam kesehatan mental', description: 'Membangun jaringan dukungan berbasis komunitas.' },
  5: { title: 'Praktik Spiritual Harian', focus: 'Integrasi praktik spiritual dalam rutinitas', description: 'Mengembangkan kebiasaan spiritual yang konsisten.' },
  6: { title: 'Resiliensi Budaya', focus: 'Membangun ketahanan melalui nilai budaya', description: 'Menguatkan resiliensi dengan akar budaya.' },
  7: { title: 'Harmoni & Keseimbangan', focus: 'Mencapai keseimbangan spiritual-psikologis', description: 'Menyeimbangkan dimensi spiritual dan psikologis.' },
  8: { title: 'Keberlanjutan & Implementasi', focus: 'Rencana keberlanjutan praktik spiritual-budaya', description: 'Merancang langkah konkret untuk masa depan.' }
};

// Assignment structure (keeping existing richer fields)
interface AssignmentData {
  konsep: string[];
  aplikasi: string[];
  distorsi: { label: string; alternatif: string }[];
  rencana7Hari: string;
  submitted?: boolean;
}

const defaultAssignment: AssignmentData = {
  konsep: Array(3).fill(''),
  aplikasi: Array(3).fill(''),
  distorsi: Array(2).fill(0).map(() => ({ label: '', alternatif: '' })),
  rencana7Hari: '',
  submitted: false
};

const SpiritualPsikoedukasiPortalSesi: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const navigate = useNavigate();
  const sessionNumber = Number(sesi || '1');
  const meta = psikoModules[sessionNumber] || psikoModules[1];
  const { user } = useAuth();
  const { role, loading: roleLoading } = useSpiritualRole();

  const {
    progress,
    meetingSchedule,
    loading,
    markMeetingDone,
    markGuideDone,
    submitAssignment,
    loadAssignment,
    autoSaveAssignment,
    groupAssignment,
    isSuperAdmin: isSuperAdminFromHook,
    allGroupSchedules,
  } = useSpiritualPsikoedukasiSession(sessionNumber, user?.id);

  const [assignment, setAssignment] = useState<AssignmentData>(defaultAssignment);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [previousSessionProgress, setPreviousSessionProgress] = useState<any>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const isSuperAdmin = role === 'super-admin' || isSuperAdminFromHook;

  // Sequential access control
  useEffect(() => {
    const checkSessionAccess = async () => {
      if (!user?.id || sessionNumber === 1 || isSuperAdmin) {
        setCheckingAccess(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sb_psikoedukasi_user_progress' as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('session_number', sessionNumber - 1)
          .maybeSingle() as any;

        if (error && error.code !== 'PGRST116') throw error;
        setPreviousSessionProgress(data);
        if (!data || !data.assignment_done) {
          navigate('/spiritual-budaya');
        }
      } catch (e) {
        console.error('Error checking session access:', e);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkSessionAccess();
  }, [user?.id, sessionNumber, isSuperAdmin, navigate]);

  // Validation for this richer assignment structure
  const assignmentValid = useMemo(() => {
    const konsepCount = assignment.konsep.filter(k => k.trim()).length; if (konsepCount < 2) return false;
    const aplikasiCount = assignment.aplikasi.filter(a => a.trim()).length; if (aplikasiCount < 2) return false;
    const distorsiFilled = assignment.distorsi.filter(d => d.label.trim() && d.alternatif.trim()).length; if (distorsiFilled < 1) return false;
    if (!assignment.rencana7Hari.trim()) return false;
    return true;
  }, [assignment]);

  // Load existing answers from DB
  useEffect(() => {
    (async () => {
      const loaded = await loadAssignment();
      if (!loaded) return;
      setAssignment(prev => ({
        konsep: Array.isArray(loaded.konsep) ? [
          loaded.konsep[0] ?? prev.konsep[0],
          loaded.konsep[1] ?? prev.konsep[1],
          loaded.konsep[2] ?? prev.konsep[2],
        ] : prev.konsep,
        aplikasi: Array.isArray(loaded.aplikasi) ? [
          loaded.aplikasi[0] ?? prev.aplikasi[0],
          loaded.aplikasi[1] ?? prev.aplikasi[1],
          loaded.aplikasi[2] ?? prev.aplikasi[2],
        ] : prev.aplikasi,
        distorsi: Array.isArray(loaded.distorsi) ? loaded.distorsi.map((d:any,i:number)=> ({
          label: d?.label ?? prev.distorsi[i]?.label ?? '',
          alternatif: d?.alternatif ?? prev.distorsi[i]?.alternatif ?? '',
        })) : prev.distorsi,
        rencana7Hari: typeof loaded.rencana7Hari === 'string' ? loaded.rencana7Hari : prev.rencana7Hari,
        submitted: !!loaded.submitted || prev.submitted,
      }));
    })();
  }, [loadAssignment]);

  // Debounced autosave
  useEffect(() => {
    const t = setTimeout(() => {
      autoSaveAssignment(assignment);
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setAutoSavedAt(`${hh}:${mm}`);
    }, 1200);
    return () => clearTimeout(t);
  }, [assignment, autoSaveAssignment]);

  const handleSubmit = useCallback(async () => {
    if (!assignmentValid) return;
    const success = await submitAssignment(assignment);
    if (success) setAssignment(p => ({ ...p, submitted: true }));
  }, [assignment, assignmentValid, submitAssignment]);

  const moduleNavigation = (
    <div className='flex flex-wrap gap-2 text-xs'>
      {Object.keys(psikoModules).map(n => {
        const num = Number(n);
        const active = num === sessionNumber;
        return (
          <button key={n} onClick={() => navigate(`/spiritual-budaya/psikoedukasi/sesi/${num}`)} className={`px-3 py-1 rounded-full border transition ${active ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-amber-50 border-amber-200 text-amber-700'}`}>Modul {num}</button>
        );
      })}
    </div>
  );

  if (loading || roleLoading || checkingAccess) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat data modul...</p>
      </div>
    );
  }

  const pageTitle = `Psikoedukasi Sesi ${sessionNumber} - ${meta?.title || 'Spiritual & Budaya'} | Spiritual & Budaya`;
  const pageDescription = `Portal psikoedukasi sesi ${sessionNumber} fokus: ${meta?.focus || ''}`;

  return (
    <div className='min-h-screen flex flex-col'>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name='description' content={pageDescription} />
      </Helmet>
      <Navbar />
      <main className='flex-1 pt-24'>
        {/* Hero */}
        <section className='relative overflow-hidden rounded'>
          <div className='absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800' />
            <div className='absolute inset-0 opacity-20'>
              <img src={heroImage} alt='Psikoedukasi Spiritual & Budaya' className='w-full h-full object-cover' />
            </div>
          <div className='relative container mx-auto px-6 py-12'>
            <div className='max-w-5xl mx-auto text-white'>
              <div className='flex items-center justify-between mb-4'>
                <Link to='/spiritual-budaya/psikoedukasi' className='text-white/80 hover:underline text-sm'>← Kembali</Link>
                <Badge className='bg-white/20 backdrop-blur border border-white/30'>Psikoedukasi</Badge>
              </div>
              <h1 className='text-3xl md:text-5xl font-bold mb-3'>Modul {sessionNumber}: {meta.title}</h1>
              <p className='text-amber-100 max-w-2xl mb-4'>{meta.description}</p>
              {moduleNavigation}
            </div>
          </div>
        </section>
        <section className='py-12'>
          <div className='container mx-auto px-6 max-w-6xl'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
              {/* Left column: Tips + Progress (Tips non-sticky) */}
              <div className='lg:col-span-1 space-y-6'>
                {/* Tips Card (non-sticky) */}
                <div className='rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 p-5 shadow-sm'>
                  <h3 className='font-semibold mb-3 text-sm tracking-wide text-amber-700'>TIPS</h3>
                  <ul className='list-disc pl-5 text-sm text-muted-foreground space-y-2'>
                    <li>Siapkan waktu dan tempat yang tenang sebelum memulai.</li>
                    <li>Catat poin penting atau pertanyaan yang muncul.</li>
                    <li>Refleksikan keterkaitan materi dengan pengalaman pribadi.</li>
                    <li>Hubungi fasilitator bila menemui kendala.</li>
                  </ul>
                </div>
                <div className='rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 p-5 shadow-sm sticky top-28'>
                  <h3 className='font-semibold mb-4 text-sm tracking-wide text-amber-700'>PROGRES SESI</h3>
                  <div className='mb-4'>
                    <div className='h-3 w-full bg-amber-100 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-full transition-all'
                        style={{ width: `${(() => {
                          const steps = [progress.sessionOpened, progress.meetingDone, progress.guideDone, !!progress.assignmentDone, !!progress.counselorResponse];
                          const done = steps.filter(Boolean).length;
                          return done * 20;
                        })()}%` }}
                      />
                    </div>
                    <div className='mt-2 text-xs text-amber-700 font-medium'>
                      {(() => {
                        const steps = [progress.sessionOpened, progress.meetingDone, progress.guideDone, !!progress.assignmentDone, !!progress.counselorResponse];
                        const done = steps.filter(Boolean).length;
                        return done * 20;
                      })()}% selesai
                    </div>
                  </div>
                  <ol className='space-y-3 text-xs'>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.sessionOpened ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>1</span>
                      <span>Sesi Dibuka</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.meetingDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>2</span>
                      <span>Materi Dibaca</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.guideDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>3</span>
                      <span>Panduan Penugasan Selesai</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.assignmentDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>4</span>
                      <span>Penugasan Selesai</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.counselorResponse ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>5</span>
                      <span>Response Konselor</span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Right Main */}
              <div className='lg:col-span-3 space-y-8'>
                {/* Session Locked Warning */}
                {!isSuperAdmin && sessionNumber > 1 && !previousSessionProgress?.assignment_done && (
                  <Card className='border-red-200 bg-red-50 shadow-sm'>
                    <CardContent className='pt-6'>
                      <div className='flex items-start gap-3'>
                        <AlertCircle className='w-5 h-5 text-red-600 mt-0.5' />
                        <div>
                          <h4 className='font-semibold text-red-900 mb-1'>Sesi Terkunci</h4>
                          <p className='text-sm text-red-700'>
                            Anda harus menyelesaikan dan mengumpulkan penugasan Sesi {sessionNumber - 1} terlebih dahulu sebelum dapat mengakses sesi ini.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Panduan Sesi (Static Guide) */}
                <Card className='border-amber-100 shadow-sm'>
                  <CardHeader>
                    <CardTitle>Panduan Sesi</CardTitle>
                    <CardDescription>Alur pengerjaan sesi ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4 text-sm leading-relaxed'>
                      <div className='rounded-lg border-l-4 border-amber-600 bg-gradient-to-r from-amber-50 to-white p-4'>
                        <p className='font-semibold text-amber-800 mb-2'>Fokus Modul {sessionNumber} — {meta.title}</p>
                        <p className='text-muted-foreground'>{meta.focus}</p>
                      </div>
                      <div className='bg-muted/50 rounded-lg p-4'>
                        <h5 className='font-semibold mb-3'>Alur Pengerjaan:</h5>
                        <ol className='list-decimal pl-5 space-y-2 text-muted-foreground'>
                          <li>Baca <strong>Materi Inti</strong> yang tersedia di bawah</li>
                          <li>Tandai materi sebagai <strong>Sudah Dibaca</strong> setelah selesai membaca</li>
                          <li>Baca <strong>Panduan Penugasan</strong> untuk arahan mengerjakan tugas</li>
                          <li>Kerjakan <strong>Penugasan</strong> dengan mengisi semua pertanyaan yang diperlukan</li>
                          <li>Tekan tombol <strong>Kirim Penugasan</strong> setelah selesai</li>
                          <li>Tunggu <strong>Response Konselor</strong> yang akan muncul setelah penugasan direview</li>
                        </ol>
                      </div>
                      <div className='border rounded p-3 bg-amber-50 text-xs text-amber-800'>
                        💡 <strong>Catatan:</strong> Data Anda otomatis tersimpan saat mengisi penugasan. Anda dapat melanjutkan kapan saja sebelum mengirim.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meeting Info (aligned with Intervensi) */}
                <Card className='border-amber-100 shadow-sm'>
                  <CardHeader>
                    <CardTitle>Informasi Pertemuan Daring</CardTitle>
                    <CardDescription>Jadwal dan link pertemuan sesi ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meetingSchedule ? (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <p className='text-sm text-muted-foreground'>Tanggal</p>
                            <p className='font-medium'>{meetingSchedule.date || 'Belum dijadwalkan'}</p>
                          </div>
                          <div>
                            <p className='text-sm text-muted-foreground'>Waktu</p>
                            <p className='font-medium'>{meetingSchedule.time || 'Belum ditentukan'}</p>
                          </div>
                        </div>
                        {meetingSchedule.link && typeof meetingSchedule.link === 'string' && (
                          <div>
                            <p className='text-sm text-muted-foreground mb-2'>Link Pertemuan</p>
                            <a href={meetingSchedule.link} target='_blank' rel='noopener noreferrer' className='text-amber-600 hover:underline break-all'>{meetingSchedule.link}</a>
                          </div>
                        )}
                        {!isSuperAdmin && meetingSchedule.has_group_schedules && (groupAssignment === 'A' || groupAssignment === 'B' || groupAssignment === 'C') && (
                          <div className='mt-1'>
                            <Badge className='bg-purple-100 text-purple-900 border border-purple-200'>Grup Anda: {groupAssignment}</Badge>
                          </div>
                        )}
                        {isSuperAdmin && meetingSchedule.has_group_schedules && allGroupSchedules && (
                          <div className='mt-4 border-t pt-4'>
                            <p className='text-sm font-semibold mb-2'>Jadwal per Grup (Super Admin)</p>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
                              {(['A','B','C'] as const).map(g => (
                                <div key={g} className='rounded border p-3 bg-muted/30'>
                                  <div className='font-semibold mb-1'>Grup {g}</div>
                                  <div>Tanggal: <span className='font-medium'>{allGroupSchedules[g]?.date || '—'}</span></div>
                                  <div>Waktu: <span className='font-medium'>{allGroupSchedules[g]?.time || '—'}</span></div>
                                  <div className='truncate'>Link: {allGroupSchedules[g]?.link ? (<a className='text-amber-700 hover:underline' href={allGroupSchedules[g]!.link} target='_blank' rel='noreferrer'>{allGroupSchedules[g]!.link}</a>) : '—'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className='flex items-center gap-3 pt-2'>
                          <Button size='sm' variant={progress?.meetingDone ? 'destructive' : 'outline'} onClick={markMeetingDone}>
                            {progress?.meetingDone ? 'Batalkan Centang' : 'Tandai Sudah Dibaca'}
                          </Button>
                          <Badge className={progress?.meetingDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>
                            {progress?.meetingDone ? '✓ Dibaca' : 'Belum Dibaca'}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>Informasi pertemuan belum tersedia.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Panduan Penugasan (Assignment Guidance) */}
                <Card className='border-amber-100 shadow-sm'>
                  <CardHeader>
                    <CardTitle>Panduan Penugasan</CardTitle>
                    <CardDescription>Materi dan panduan untuk mengerjakan penugasan sesi ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!progress.meetingDone ? (
                      <div className='text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded p-4'>
                        Panduan penugasan akan muncul setelah Anda menandai Informasi Pertemuan Daring sebagai selesai.
                      </div>
                    ) : (
                      <>
                        {(!meetingSchedule?.guidance_text && !meetingSchedule?.guidance_pdf_url && !meetingSchedule?.guidance_audio_url && !meetingSchedule?.guidance_video_url && (!meetingSchedule?.guidance_links || meetingSchedule.guidance_links.length === 0)) ? (
                          <div className='text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded p-4'>
                            <p>Tidak ada panduan penugasan untuk sesi ini, silakan mengerjakan mengikuti arahan materi inti.</p>
                          </div>
                        ) : (
                          <GuidanceMaterialsDisplay 
                            guidance_text={meetingSchedule?.guidance_text}
                            guidance_pdf_url={meetingSchedule?.guidance_pdf_url}
                            guidance_audio_url={meetingSchedule?.guidance_audio_url}
                            guidance_video_url={meetingSchedule?.guidance_video_url}
                            guidance_links={meetingSchedule?.guidance_links}
                            showTitle={false}
                          />
                        )}
                        <div className='flex items-center gap-3 pt-3'>
                          {!progress.guideDone && (
                            <Button size='sm' variant='outline' onClick={markGuideDone}>Tandai Selesai</Button>
                          )}
                          <Badge className={progress.guideDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>
                            {progress.guideDone ? '✓ Selesai' : 'Belum Selesai'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Penugasan */}
                <Card className='border-amber-100 shadow-md'>
                  <CardHeader>
                    <CardTitle>Penugasan Psikoedukasi</CardTitle>
                    <CardDescription>Refleksi & penerapan konsep spiritual-budaya</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!progress?.guideDone && !progress?.assignmentDone && (
                      <div className='mb-4 p-3 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm'>Penugasan terkunci. Selesaikan Panduan Penugasan untuk membuka.</div>
                    )}
                    <div className={(!progress?.guideDone && !progress?.assignmentDone) ? 'pointer-events-none opacity-60 select-none' : ''}>
                      <div className='space-y-8'>
                        {/* 1 Konsep */}
                        <div>
                          <h4 className='font-semibold mb-3'>1. Ringkas 2–3 Konsep Utama</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Tuliskan dengan kata sendiri untuk memahami lebih dalam.</p>
                          <div className='space-y-2 ml-2'>
                            {assignment.konsep.map((v,i)=>(
                              <div key={i} className='flex items-start gap-2'>
                                <span className='w-6 text-xs text-gray-500'>{i+1})</span>
                                <textarea rows={2} className='flex-1 border rounded p-2 text-sm' placeholder={`Konsep ${i+1}`} value={v} onChange={e=> setAssignment(p => ({ ...p, konsep: p.konsep.map((x,idx)=> idx===i? e.target.value : x) }))} disabled={progress?.assignmentDone} />
                              </div>
                            ))}
                          </div>
                          <p className='text-[11px] text-muted-foreground mt-1'>Minimal isi 2 konsep.</p>
                        </div>
                        {/* 2 Aplikasi */}
                        <div>
                          <h4 className='font-semibold mb-3'>2. Contoh Aplikasi Harian</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Bagaimana Anda dapat menerapkan konsep spiritual-budaya di atas?</p>
                          <div className='space-y-2 ml-2'>
                            {assignment.aplikasi.map((v,i)=>(
                              <div key={i} className='flex items-center gap-2'>
                                <span className='w-6 text-xs text-gray-500'>{i+1})</span>
                                <input className='flex-1 border rounded p-2 text-sm' placeholder={`Aplikasi ${i+1}`} value={v} onChange={e=> setAssignment(p => ({ ...p, aplikasi: p.aplikasi.map((x,idx)=> idx===i? e.target.value : x) }))} disabled={progress?.assignmentDone} />
                              </div>
                            ))}
                          </div>
                          <p className='text:[11px] text-muted-foreground mt-1'>Minimal isi 2 contoh.</p>
                        </div>
                        {/* 3 Distorsi */}
                        <div>
                          <h4 className='font-semibold mb-3'>3. Distorsi Kognitif & Alternatif</h4>
                          <p className='text-xs text-muted-foreground mb-2'>Identifikasi 1–2 distorsi yang sering muncul & padankan dengan alternatif adaptif.</p>
                          <div className='space-y-4 ml-2'>
                            {assignment.distorsi.map((d,i)=>(
                              <div key={i} className='space-y-1 border rounded p-3 bg-white'>
                                <div className='flex flex-col gap-1'>
                                  <label className='text-xs font-medium'>Distorsi {i+1}</label>
                                  <input className='border rounded p-2 text-sm' placeholder='Misal: berpikir biner / overgeneralisasi' value={d.label} onChange={e=> setAssignment(p => ({ ...p, distorsi: p.distorsi.map((x,idx)=> idx===i? { ...x, label: e.target.value } : x) }))} disabled={progress?.assignmentDone} />
                                </div>
                                <div className='flex flex-col gap-1'>
                                  <label className='text-xs font-medium'>Alternatif Adaptif</label>
                                  <input className='border rounded p-2 text-sm' placeholder='Reframe / pikiran alternatif' value={d.alternatif} onChange={e=> setAssignment(p => ({ ...p, distorsi: p.distorsi.map((x,idx)=> idx===i? { ...x, alternatif: e.target.value } : x) }))} disabled={progress?.assignmentDone} />
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
                          <textarea rows={5} className='w-full border rounded p-2 text-sm' placeholder='Tuliskan rencana Anda...' value={assignment.rencana7Hari} onChange={e=> setAssignment(p=> ({ ...p, rencana7Hari: e.target.value }))} disabled={progress?.assignmentDone} />
                        </div>
                        <div className='flex items-center gap-3 pt-2 border-t'>
                          {!progress?.assignmentDone && (
                            <>
                              <Button onClick={handleSubmit} disabled={!assignmentValid || assignment.submitted}>
                                {assignment.submitted ? 'Terkirim ✓' : 'Kirim Penugasan'}
                              </Button>
                              {autoSavedAt && <p className='text-xs text-muted-foreground'>Draft tersimpan {autoSavedAt}</p>}
                            </>
                          )}
                          {progress?.assignmentDone && (
                            <Badge className='bg-green-600 text-white'>✓ Penugasan Selesai</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Counselor Response */}
                <Card className='border-green-100 shadow-sm'>
                  <CardHeader>
                    <CardTitle>Response/Balasan Konselor</CardTitle>
                    <CardDescription>Feedback dari konselor untuk penugasan Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {progress?.counselorResponse ? (
                      <CounselorResponseDisplay 
                        counselorResponse={progress.counselorResponse}
                        counselorName={progress.counselorName}
                        respondedAt={progress.respondedAt}
                      />
                    ) : (
                      <div className='text-sm text-muted-foreground bg-green-50 border border-green-200 rounded p-4'>
                        <p>Belum ada balasan dari Konselor. Response akan muncul setelah konselor mereview penugasan Anda.</p>
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
