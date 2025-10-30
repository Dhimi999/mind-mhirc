import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useSpiritualIntervensiSession } from "@/hooks/useSpiritualIntervensiSession";
import { useSpiritualRole } from "@/hooks/useSpiritualRole";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";
import { supabase } from "@/integrations/supabase/client";

const sessionTitles: Record<number, string> = {
	1: "Pengenalan Nilai Spiritual & Budaya",
	2: "Eksplorasi Identitas Kultural",
	3: "Praktik Spiritual dalam Keseharian",
	4: "Kearifan Lokal & Kesehatan Mental",
	5: "Resiliensi Berbasis Budaya",
	6: "Komunitas & Dukungan Sosial",
	7: "Integrasi Spiritual-Psikologis",
	8: "Keberlanjutan & Rencana Masa Depan"
};

interface SessionAssignment {
	jawaban_1: string;
	jawaban_2: string;
	jawaban_3: string;
	refleksi: string;
	submitted?: boolean;
}

const defaultAssignment: SessionAssignment = {
	jawaban_1: "",
	jawaban_2: "",
	jawaban_3: "",
	refleksi: "",
	submitted: false
};

const SpiritualIntervensiPortalSesi: React.FC = () => {
	const { sesi } = useParams<{ sesi: string }>();
	const navigate = useNavigate();
	const sessionNumber = parseInt(sesi || "1", 10);
	const title = sessionTitles[sessionNumber] || "Spiritual & Budaya";
	const { user } = useAuth();
	const { role, loading: roleLoading } = useSpiritualRole();

	const {
		progress,
		meeting,
		loading: dataLoading,
		updateProgress,
		groupAssignment,
		isSuperAdmin: isSuperAdminFromHook,
		loadAssignment: loadAssignmentIntervensi,
		autoSaveAssignment: autoSaveIntervensi,
		lastAutoSaveAt,
	} = useSpiritualIntervensiSession(sessionNumber);

	const [previousSessionProgress, setPreviousSessionProgress] = useState<any>(null);
	const [checkingAccess, setCheckingAccess] = useState(true);

	const [assignment, setAssignment] = useState<SessionAssignment>(defaultAssignment);
	// Assignment khusus sesi 1 (struktur baru)
	const [assignmentS1, setAssignmentS1] = useState({
		situasi_pemicu: "",
		pikiran_otomatis: "",
		emosi: "",
		perilaku: "",
		coping: {
			aktivitas: "",
			kontak: "",
			layanan: "",
			lingkungan: "",
		},
		teknik_metagora: "",
		submitted: false as boolean | undefined,
	});
	const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

	const isSuperAdmin = role === 'super-admin' || isSuperAdminFromHook;

	// Load any existing answers on mount
	useEffect(() => {
		(async () => {
			const loaded = await loadAssignmentIntervensi();
			if (!loaded) return;
			if (sessionNumber === 1) {
				setAssignmentS1(prev => ({
					situasi_pemicu: loaded.situasi_pemicu ?? prev.situasi_pemicu,
					pikiran_otomatis: loaded.pikiran_otomatis ?? prev.pikiran_otomatis,
					emosi: loaded.emosi ?? prev.emosi,
					perilaku: loaded.perilaku ?? prev.perilaku,
					coping: {
						aktivitas: loaded.coping?.aktivitas ?? prev.coping.aktivitas,
						kontak: loaded.coping?.kontak ?? prev.coping.kontak,
						layanan: loaded.coping?.layanan ?? prev.coping.layanan,
						lingkungan: loaded.coping?.lingkungan ?? prev.coping.lingkungan,
					},
					teknik_metagora: loaded.teknik_metagora ?? prev.teknik_metagora,
					submitted: prev.submitted,
				}));
			} else {
				setAssignment(prev => ({
					jawaban_1: loaded.jawaban_1 ?? prev.jawaban_1,
					jawaban_2: loaded.jawaban_2 ?? prev.jawaban_2,
					jawaban_3: loaded.jawaban_3 ?? prev.jawaban_3,
					refleksi: loaded.refleksi ?? prev.refleksi,
				}));
			}
		})();
	}, [loadAssignmentIntervensi, sessionNumber]);

	// Debounced autosave on changes
	useEffect(() => {
		const handler = setTimeout(() => {
			const payload = sessionNumber === 1 ? assignmentS1 : assignment;
			autoSaveIntervensi(payload);
			setAutoSavedAt(lastAutoSaveAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
		}, 1200);
		return () => clearTimeout(handler);
	}, [assignment, assignmentS1, sessionNumber, autoSaveIntervensi, lastAutoSaveAt]);

	// Check if user can access this session (sequential access control)
	useEffect(() => {
		const checkSessionAccess = async () => {
			if (!user?.id || sessionNumber === 1 || isSuperAdmin) {
				setCheckingAccess(false);
				return;
			}

			try {
				const { data, error } = await supabase
					.from('sb_intervensi_user_progress' as any)
					.select('*')
					.eq('user_id', user.id)
					.eq('session_number', sessionNumber - 1)
					.maybeSingle() as any;

				if (error && error.code !== 'PGRST116') throw error;

				setPreviousSessionProgress(data);

				// Check if previous session is completed
				if (!data || !data.assignment_done) {
					navigate('/spiritual-budaya/intervensi');
				}
			} catch (error) {
				console.error('Error checking session access:', error);
			} finally {
				setCheckingAccess(false);
			}
		};

		checkSessionAccess();
	}, [user?.id, sessionNumber, isSuperAdmin, navigate]);

	const percent = useMemo(() => {
		if (!progress) return 0;
		let total = 0;
		if (progress.meeting_done) total += 50;
		if (progress.assignment_done) total += 30;
		if (progress.counselor_feedback) total += 20;
		return total;
	}, [progress]);

	const assignmentValid = useMemo(() => {
		if (sessionNumber === 1) {
			const a = assignmentS1;
			return (
				a.situasi_pemicu.trim() !== "" &&
				a.pikiran_otomatis.trim() !== "" &&
				a.emosi.trim() !== "" &&
				a.perilaku.trim() !== "" &&
				a.coping.aktivitas.trim() !== "" &&
				a.coping.kontak.trim() !== "" &&
				a.coping.layanan.trim() !== "" &&
				a.coping.lingkungan.trim() !== "" &&
				a.teknik_metagora.trim() !== ""
			);
		}
		return assignment.jawaban_1.trim() && assignment.jawaban_2.trim() && assignment.refleksi.trim();
	}, [assignment, assignmentS1, sessionNumber]);

	const handleSubmitAssignment = useCallback(async () => {
		if (!assignmentValid) return;
		const payload = sessionNumber === 1 ? assignmentS1 : assignment;
		const result = await updateProgress({ assignment_data: payload, assignment_done: true });
		if (result?.success) {
			if (sessionNumber === 1) {
				setAssignmentS1(prev => ({ ...prev, submitted: true }));
			} else {
				setAssignment(prev => ({ ...prev, submitted: true }));
			}
		}
	}, [assignmentValid, assignment, assignmentS1, updateProgress, sessionNumber]);

	const handleMarkMeetingDone = useCallback(async () => {
		await updateProgress({ meeting_done: !progress?.meeting_done });
	}, [progress, updateProgress]);

	if (dataLoading || roleLoading || checkingAccess) {
		return (
			<div className="flex flex-col justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
				<p className="text-muted-foreground">Memuat data sesi...</p>
			</div>
		);
	}

	const pageTitle = `Sesi ${sessionNumber} - ${title} | Spiritual & Budaya`;
	const pageDescription = `Portal sesi ${sessionNumber} Spiritual & Budaya`;

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
						<img src={heroImage} alt='Spiritual & Budaya' className='w-full h-full object-cover' />
					</div>
					<div className='relative container mx-auto px-6 py-12'>
						<div className='max-w-5xl mx-auto text-white'>
							<div className='flex items-center justify-between mb-4'>
								<Link to='/spiritual-budaya/intervensi' className='text-white/80 hover:underline text-sm'>← Kembali</Link>
								<Badge className='bg-white/20 backdrop-blur border border-white/30'>Intervensi</Badge>
							</div>
							<h1 className='text-3xl md:text-5xl font-bold mb-3'>Sesi {sessionNumber}: {title}</h1>
							<p className='text-amber-100 max-w-2xl mb-4'>Integrasi nilai spiritual dan budaya dalam kesehatan mental</p>
						</div>
					</div>
				</section>

				<section className='py-12'>
					<div className='container mx-auto px-6 max-w-6xl'>
						<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
							{/* Left column: Tips + Progress */}
							<div className='lg:col-span-1 space-y-6'>
								{/* Tips Card (sticky) */}
								<div className='rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 p-5 shadow-sm'>
									<h3 className='font-semibold mb-3 text-sm tracking-wide text-amber-700'>TIPS</h3>
									<ul className='list-disc pl-5 text-sm text-muted-foreground space-y-2'>
										<li>Pastikan Anda memiliki koneksi internet yang stabil.</li>
										<li>Siapkan catatan untuk menulis poin penting.</li>
										<li>Gabung 5 menit sebelum jadwal dimulai.</li>
										<li>Hubungi fasilitator jika ada kendala teknis.</li>
									</ul>
								</div>
								<div className='rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 p-5 shadow-sm sticky top-28'>
									<h3 className='font-semibold mb-4 text-sm tracking-wide text-amber-700'>PROGRES SESI</h3>
									<div className='mb-4'>
										<div className='h-3 w-full bg-amber-100 rounded-full overflow-hidden'>
											<div className='h-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-full transition-all' style={{ width: `${percent}%` }} />
										</div>
										<div className='mt-2 text-xs text-amber-700 font-medium'>{percent}% selesai</div>
									</div>
									<ol className='space-y-3 text-xs'>
										<li className='flex items-center gap-2'>
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold bg-green-500 text-white`}>1</span>
											<span>Sesi Dibuka</span>
										</li>
										<li className='flex items-center gap-2'>
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress?.meeting_done ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>2</span>
											<span>Pertemuan Daring</span>
										</li>
										<li className='flex items-center gap-2'>
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress?.assignment_done ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>3</span>
											<span>Penugasan Selesai</span>
										</li>
										<li className='flex items-center gap-2'>
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress?.counselor_feedback ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-800'}`}>4</span>
											<span>Response Konselor</span>
										</li>
									</ol>
								</div>
							</div>

							{/* Main Content */}
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
												<p className='font-semibold text-amber-800 mb-2'>Fokus Sesi {sessionNumber} — {title}</p>
												<p className='text-muted-foreground'>
													Integrasi nilai spiritual dan budaya dalam kesehatan mental untuk meningkatkan kesejahteraan psikologis.
												</p>
											</div>
											<div className='bg-muted/50 rounded-lg p-4'>
												<h5 className='font-semibold mb-3'>Alur Pengerjaan:</h5>
												<ol className='list-decimal pl-5 space-y-2 text-muted-foreground'>
													<li>Ikuti <strong>Pertemuan Daring</strong> sesuai jadwal yang ditentukan</li>
													<li>Tandai pertemuan sebagai <strong>Selesai</strong> setelah mengikuti</li>
													<li>Baca <strong>Panduan Penugasan</strong> yang tersedia di bawah</li>
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

								{/* Meeting Info */}
								<Card className='border-amber-100 shadow-sm'>
									<CardHeader>
										<CardTitle>Informasi Pertemuan Daring</CardTitle>
										<CardDescription>Jadwal dan link pertemuan sesi ini</CardDescription>
									</CardHeader>
									<CardContent>
										{meeting ? (
											<div className='space-y-4'>
												{!(isSuperAdmin && meeting.has_group_schedules) && (
													<>
														<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
															<div>
																<p className='text-sm text-muted-foreground'>Tanggal</p>
																<p className='font-medium'>{meeting.date || 'Belum dijadwalkan'}</p>
															</div>
															<div>
																<p className='text-sm text-muted-foreground'>Waktu</p>
																<p className='font-medium'>{meeting.time || 'Belum ditentukan'}</p>
															</div>
														</div>
														{meeting.link && typeof meeting.link === 'string' && (
															<div>
																<p className='text-sm text-muted-foreground mb-2'>Link Pertemuan</p>
																<a href={meeting.link} target='_blank' rel='noopener noreferrer' className='text-amber-600 hover:underline break-all'>{meeting.link}</a>
															</div>
														)}
														{meeting.description && (
															<div>
																<p className='text-sm text-muted-foreground mb-2'>Deskripsi</p>
																<p className='text-sm'>{meeting.description}</p>
															</div>
														)}
													</>
												)}
												{!isSuperAdmin && meeting.has_group_schedules && (groupAssignment === 'A' || groupAssignment === 'B' || groupAssignment === 'C') && (
													<div className='mt-1'>
														<Badge className='bg-purple-100 text-purple-900 border border-purple-200'>Grup Anda: {groupAssignment}</Badge>
													</div>
												)}

												{isSuperAdmin && meeting.has_group_schedules && meeting.all_group_schedules && (
													<div className='mt-4 border-t pt-4'>
														<p className='text-sm font-semibold mb-2'>Jadwal per Grup (Super Admin)</p>
														<div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
															{(['A','B','C'] as const).map(g => (
																<div key={g} className='rounded border p-3 bg-muted/30'>
																	<div className='font-semibold mb-1'>Grup {g}</div>
																	<div>Tanggal: <span className='font-medium'>{meeting.all_group_schedules[g]?.date || '—'}</span></div>
																	<div>Waktu: <span className='font-medium'>{meeting.all_group_schedules[g]?.time || '—'}</span></div>
																	<div className='truncate'>Link: {meeting.all_group_schedules[g]?.link ? (<a className='text-amber-700 hover:underline' href={meeting.all_group_schedules[g]!.link} target='_blank' rel='noreferrer'>{meeting.all_group_schedules[g]!.link}</a>) : '—'}</div>
																</div>
															))}
														</div>
													</div>
												)}
												<div className='flex items-center gap-3 pt-2'>
													<Button size='sm' variant={progress?.meeting_done ? 'destructive' : 'default'} onClick={handleMarkMeetingDone}>
														{progress?.meeting_done ? 'Batalkan Centang' : 'Tandai Sudah Mengikuti'}
													</Button>
													<Badge className={progress?.meeting_done ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>
														{progress?.meeting_done ? '✓ Selesai' : 'Belum Selesai'}
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
										{!meeting?.guidance_text && !meeting?.guidance_pdf_url && !meeting?.guidance_audio_url && !meeting?.guidance_video_url && (!meeting?.guidance_links || meeting.guidance_links.length === 0) ? (
											<div className='text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded p-4'>
												<p>Tidak ada panduan penugasan untuk sesi ini, silakan mengerjakan mengikuti arahan pertemuan daring.</p>
											</div>
										) : (
											<GuidanceMaterialsDisplay 
												guidance_text={meeting?.guidance_text}
												guidance_pdf_url={meeting?.guidance_pdf_url}
												guidance_audio_url={meeting?.guidance_audio_url}
												guidance_video_url={meeting?.guidance_video_url}
												guidance_links={meeting?.guidance_links}
												showTitle={false}
											/>
										)}
									</CardContent>
								</Card>

								{/* Assignment */}
								<Card className='border-amber-100 shadow-md'>
									<CardHeader>
										<CardTitle>Penugasan Sesi {sessionNumber}</CardTitle>
										<CardDescription>Refleksi dan penerapan materi sesi</CardDescription>
									</CardHeader>
									<CardContent>
										{!progress?.meeting_done && !progress?.assignment_done && (
											<div className='mb-4 p-3 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm'>
												Penugasan terkunci. Tandai pertemuan daring sudah diikuti untuk membuka.
											</div>
										)}
										<div className={(!progress?.meeting_done && !progress?.assignment_done) ? 'pointer-events-none opacity-60 select-none' : ''}>
											<div className='space-y-6'>
												{sessionNumber === 1 ? (
													<>
														<div>
															<label className='block text-sm font-medium mb-2'>(1) Situasi Pemicu Krisis</label>
															<textarea rows={4} className='w-full rounded border p-3 text-sm' placeholder='Jelaskan situasi pemicu krisis yang Anda alami...' value={assignmentS1.situasi_pemicu} onChange={e=> setAssignmentS1(p=> ({ ...p, situasi_pemicu: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>(2) Pikiran otomatis yang muncul sebagai respons terhadap kejadian</label>
															<textarea rows={4} className='w-full rounded border p-3 text-sm' placeholder='Tuliskan pikiran otomatis yang muncul...' value={assignmentS1.pikiran_otomatis} onChange={e=> setAssignmentS1(p=> ({ ...p, pikiran_otomatis: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>(3) Emosi yang muncul terkait kejadian tersebut</label>
															<textarea rows={4} className='w-full rounded border p-3 text-sm' placeholder='Tuliskan emosi yang dirasakan...' value={assignmentS1.emosi} onChange={e=> setAssignmentS1(p=> ({ ...p, emosi: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>(4) Perilaku atau respons yang muncul akibat peristiwa tersebut</label>
															<textarea rows={4} className='w-full rounded border p-3 text-sm' placeholder='Jelaskan perilaku atau respons Anda...' value={assignmentS1.perilaku} onChange={e=> setAssignmentS1(p=> ({ ...p, perilaku: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>(5) Strategi Koping Pribadi yang Sehat</label>
															<div className='space-y-3'>
																<div>
																	<label className='block text-xs text-muted-foreground mb-1'>a. Aktivitas yang dapat mengalihkan diri</label>
																	<input className='w-full rounded border p-3 text-sm' placeholder='Contoh: berjalan, mendengarkan musik, dll.' value={assignmentS1.coping.aktivitas} onChange={e=> setAssignmentS1(p=> ({ ...p, coping: { ...p.coping, aktivitas: e.target.value } }))} disabled={progress?.assignment_done} />
																</div>
																<div>
																	<label className='block text-xs text-muted-foreground mb-1'>b. Orang yang bisa dihubungi</label>
																	<input className='w-full rounded border p-3 text-sm' placeholder='Contoh: teman dekat, keluarga, mentor' value={assignmentS1.coping.kontak} onChange={e=> setAssignmentS1(p=> ({ ...p, coping: { ...p.coping, kontak: e.target.value } }))} disabled={progress?.assignment_done} />
																</div>
																<div>
																	<label className='block text-xs text-muted-foreground mb-1'>c. Layanan profesional atau darurat yang dapat diakses</label>
																	<input className='w-full rounded border p-3 text-sm' placeholder='Contoh: hotline darurat, layanan konseling, rumah sakit' value={assignmentS1.coping.layanan} onChange={e=> setAssignmentS1(p=> ({ ...p, coping: { ...p.coping, layanan: e.target.value } }))} disabled={progress?.assignment_done} />
																</div>
																<div>
																	<label className='block text-xs text-muted-foreground mb-1'>d. Lingkungan aman atau tempat untuk menenangkan diri</label>
																	<input className='w-full rounded border p-3 text-sm' placeholder='Contoh: kamar, ruang ibadah, taman' value={assignmentS1.coping.lingkungan} onChange={e=> setAssignmentS1(p=> ({ ...p, coping: { ...p.coping, lingkungan: e.target.value } }))} disabled={progress?.assignment_done} />
																</div>
															</div>
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>(6) Menggunakan teknik metafora "bingkai dalam film" untuk menggali pikiran dan perasaan lebih dalam</label>
															<textarea rows={5} className='w-full rounded border p-3 text-sm' placeholder='Tuliskan hasil eksplorasi menggunakan teknik metafora “bingkai dalam film”...' value={assignmentS1.teknik_metagora} onChange={e=> setAssignmentS1(p=> ({ ...p, teknik_metagora: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
													</>
												) : (
													<>
														<div>
															<label className='block text-sm font-medium mb-2'>1. Nilai spiritual apa yang paling bermakna bagi Anda?</label>
															<textarea rows={4} className='w-full rounded border p-3 text-sm' placeholder='Jelaskan nilai spiritual yang Anda anut...' value={assignment.jawaban_1} onChange={e => setAssignment(p => ({ ...p, jawaban_1: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>2. Bagaimana budaya Anda mempengaruhi cara Anda memandang kesehatan mental?</label>
															<textarea rows={4} className='w-full rounded border p-3 text-sm' placeholder='Deskripsikan pengaruh budaya terhadap perspektif Anda...' value={assignment.jawaban_2} onChange={e => setAssignment(p => ({ ...p, jawaban_2: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>3. Praktik budaya apa yang membantu Anda mengatasi stress? (opsional)</label>
															<textarea rows={3} className='w-full rounded border p-3 text-sm' placeholder='Contoh: doa, meditasi, ritual tertentu...' value={assignment.jawaban_3} onChange={e => setAssignment(p => ({ ...p, jawaban_3: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
														<div>
															<label className='block text-sm font-medium mb-2'>Refleksi Pribadi</label>
															<textarea rows={5} className='w-full rounded border p-3 text-sm' placeholder='Tulis refleksi Anda tentang materi sesi ini...' value={assignment.refleksi} onChange={e => setAssignment(p => ({ ...p, refleksi: e.target.value }))} disabled={progress?.assignment_done} />
														</div>
													</>
												)}
												<div className='flex items-center gap-3 pt-2 border-t'>
													{!progress?.assignment_done && (
														<>
															<Button onClick={handleSubmitAssignment} disabled={!assignmentValid || (sessionNumber === 1 ? !!assignmentS1.submitted : !!assignment.submitted)}>
																{(sessionNumber === 1 ? assignmentS1.submitted : assignment.submitted) ? 'Terkirim ✓' : 'Kirim Penugasan'}
															</Button>
															{autoSavedAt && <p className='text-xs text-muted-foreground'>Draft tersimpan {autoSavedAt}</p>}
														</>
													)}
													{progress?.assignment_done && (
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
										{progress?.counselor_feedback ? (
											<CounselorResponseDisplay 
												counselorResponse={progress.counselor_feedback}
												counselorName={progress.counselor_name}
												respondedAt={progress.updated_at}
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

export default SpiritualIntervensiPortalSesi;
