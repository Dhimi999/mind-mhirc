import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";

const SpiritualIntervensiPortalSesi1: React.FC = () => {
	const sessionNumber = 1;
	const title = "Pengenalan Nilai Spiritual & Budaya";
	const navigate = useNavigate();
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

	const { toast } = useToast();
	const [previousSessionProgress, setPreviousSessionProgress] = useState<any>(null);
	const [checkingAccess, setCheckingAccess] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
		})();
	}, [loadAssignmentIntervensi]);

	// Debounced autosave on changes (skip if already submitted)
	useEffect(() => {
		// Don't autosave if assignment already done
		if (progress?.assignment_done) return;
		
		const handler = setTimeout(() => {
			autoSaveIntervensi(assignmentS1);
			setAutoSavedAt(lastAutoSaveAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
		}, 1200);
		return () => clearTimeout(handler);
	}, [assignmentS1, autoSaveIntervensi, lastAutoSaveAt, progress?.assignment_done]);

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
					.maybeSingle();

				if (error && (error as any).code !== 'PGRST116') throw error;

				if (!data || !(data as any).assignment_done) {
					navigate('/spiritual-budaya/intervensi/sesi/1');
					toast({
						title: "Akses Ditolak",
						description: `Selesaikan Sesi ${sessionNumber - 1} terlebih dahulu untuk mengakses sesi ini.`,
						variant: "destructive",
					});
					return;
				}

				setPreviousSessionProgress(data);
			} catch (error) {
				console.error('Error checking session access:', error);
			} finally {
				setCheckingAccess(false);
			}
		};

		checkSessionAccess();
	}, [user?.id, sessionNumber, isSuperAdmin, navigate, toast]);

	const progressPercentage = useMemo(() => {
		if (!progress) return 0;
		let total = 0;
		if (progress.meeting_done) total += 50;
		if (progress.assignment_done) total += 30;
		if (progress.counselor_feedback) total += 20;
		return total;
	}, [progress]);

	const assignmentValid = useMemo(() => {
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
	}, [assignmentS1]);

	const handleSubmitAssignment = useCallback(async () => {
		if (!assignmentValid || isSubmitting) return;
		
		setIsSubmitting(true);
		try {
			const result = await updateProgress({ assignment_data: assignmentS1, assignment_done: true });
			
			if (result?.success) {
				setAssignmentS1(prev => ({ ...prev, submitted: true }));
				toast({
					title: "Penugasan Berhasil Dikirim",
					description: "Jawaban Anda telah tersimpan dan menunggu respons konselor.",
					variant: "default",
				});
			} else {
				throw new Error(result?.error?.message || "Gagal mengirim penugasan");
			}
		} catch (error) {
			console.error("Submit assignment error:", error);
			toast({
				title: "Gagal Mengirim Penugasan",
				description: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [assignmentValid, isSubmitting, assignmentS1, updateProgress, toast]);

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

			{/* Hero */}
			<div className='relative h-64 bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center'>
				<div className='absolute inset-0'>
					<img src={heroImage} alt='Spiritual & Budaya' className='w-full h-full object-cover opacity-20' />
				</div>
				<div className='relative z-10 max-w-4xl mx-auto px-6 text-center text-white'>
					<h1 className='text-4xl font-bold mb-2'>Intervensi Spiritual & Budaya</h1>
					<p className='text-lg opacity-90'>Sesi {sessionNumber}: {title}</p>
				</div>
			</div>

			{/* Main Content */}
			<div className='flex-1 bg-gray-50 py-8'>
				<div className='max-w-5xl mx-auto px-6 space-y-6'>
					{/* Progress & Navigation */}
					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center justify-between mb-4'>
								<div className='flex items-center gap-2'>
									<Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-200'>
										Sesi {sessionNumber}/8
									</Badge>
									<span className='text-sm text-muted-foreground'>
										{progressPercentage}% Selesai
									</span>
								</div>
								<Link to='/spiritual-budaya'>
									<Button variant='outline' size='sm'>
										← Kembali ke Dashboard
									</Button>
								</Link>
							</div>
							<div className='w-full bg-gray-200 rounded-full h-2'>
								<div
									className='bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500'
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Panduan Sesi */}
					<Card className='border-amber-200 bg-amber-50'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<span>📖</span> Panduan Sesi
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-gray-700 leading-relaxed'>
								Pada sesi ini, Anda akan diajak untuk mengenal lebih dalam tentang nilai-nilai spiritual dan budaya yang Anda miliki, 
								serta bagaimana hal tersebut dapat menjadi sumber kekuatan dalam menghadapi krisis kesehatan mental.
							</p>
						</CardContent>
					</Card>

					{/* Informasi Pertemuan Daring */}
					{meeting && (
						<Card>
							<CardHeader>
								<CardTitle>Informasi Pertemuan Daring</CardTitle>
								<CardDescription>Jadwal dan detail pertemuan untuk sesi ini</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								{isSuperAdmin && meeting.has_group_schedules && meeting.all_group_schedules ? (
									<div className='space-y-4'>
										<div className='p-3 rounded border border-blue-200 bg-blue-50 text-blue-900 text-sm'>
											<strong>Mode Super Admin:</strong> Menampilkan jadwal untuk semua grup.
										</div>
										{(['A', 'B', 'C'] as const).map(grp => {
											const sch = (meeting.all_group_schedules as any)?.[grp];
											return sch ? (
												<div key={grp} className='border rounded-lg p-4 bg-gray-50'>
													<h4 className='font-semibold text-amber-700 mb-2'>Grup {grp}</h4>
													<div className='space-y-2 text-sm'>
														<p><strong>Tanggal:</strong> {sch.date || '-'}</p>
														<p><strong>Waktu:</strong> {sch.time || '-'}</p>
														{sch.link && (
															<div>
																<strong>Link:</strong>{' '}
																<a href={sch.link} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline break-all'>
																	{sch.link}
																</a>
															</div>
														)}
													</div>
												</div>
											) : null;
										})}
									</div>
								) : (
									<div className='space-y-3'>
										{meeting.group_key_used && (
											<Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200'>
												Grup {meeting.group_key_used}
											</Badge>
										)}
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div>
												<p className='text-sm font-semibold text-gray-700'>Tanggal</p>
												<p className='text-sm text-gray-600'>{meeting.date || '-'}</p>
											</div>
											<div>
												<p className='text-sm font-semibold text-gray-700'>Waktu</p>
												<p className='text-sm text-gray-600'>{meeting.time || '-'}</p>
											</div>
										</div>
										{meeting.link && (
											<div>
												<p className='text-sm font-semibold text-gray-700 mb-1'>Link Pertemuan</p>
												<a
													href={meeting.link}
													target='_blank'
													rel='noopener noreferrer'
													className='text-sm text-blue-600 hover:underline break-all'
												>
													{meeting.link}
												</a>
											</div>
										)}
										{meeting.description && (
											<div>
												<p className='text-sm font-semibold text-gray-700 mb-1'>Deskripsi</p>
												<p className='text-sm text-gray-600 whitespace-pre-line'>{meeting.description}</p>
											</div>
										)}
									</div>
								)}
								<div className='flex items-center gap-2 pt-3 border-t'>
									<input
										type='checkbox'
										id='meetingDone'
										checked={progress?.meeting_done || false}
										onChange={handleMarkMeetingDone}
										className='w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
									/>
									<label htmlFor='meetingDone' className='text-sm text-gray-700 cursor-pointer'>
										Tandai pertemuan sudah diikuti
									</label>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Panduan Penugasan */}
					<Card>
						<CardHeader>
							<CardTitle>Panduan Penugasan</CardTitle>
							<CardDescription>Materi dan panduan untuk mengerjakan penugasan sesi ini</CardDescription>
						</CardHeader>
						<CardContent>
							{meeting?.guidance_text || meeting?.guidance_pdf_url || meeting?.guidance_audio_url || meeting?.guidance_video_url || meeting?.guidance_links ? (
								<GuidanceMaterialsDisplay
									guidance_text={meeting.guidance_text}
									guidance_pdf_url={meeting.guidance_pdf_url}
									guidance_audio_url={meeting.guidance_audio_url}
									guidance_video_url={meeting.guidance_video_url}
									guidance_links={meeting.guidance_links}
								/>
							) : (
								<p className='text-sm text-muted-foreground'>Panduan belum tersedia.</p>
							)}
						</CardContent>
					</Card>

					{/* Penugasan */}
					<Card>
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
										<textarea rows={5} className='w-full rounded border p-3 text-sm' placeholder='Tuliskan hasil eksplorasi menggunakan teknik metafora "bingkai dalam film"...' value={assignmentS1.teknik_metagora} onChange={e=> setAssignmentS1(p=> ({ ...p, teknik_metagora: e.target.value }))} disabled={progress?.assignment_done} />
									</div>
									<div className='flex items-center gap-3 pt-2 border-t'>
										{!progress?.assignment_done && (
											<>
												<Button 
													onClick={handleSubmitAssignment} 
													disabled={!assignmentValid || isSubmitting || !!assignmentS1.submitted}
												>
													{isSubmitting ? 'Mengirim...' : assignmentS1.submitted ? 'Terkirim ✓' : 'Kirim Penugasan'}
												</Button>
												{autoSavedAt && !isSubmitting && <p className='text-xs text-muted-foreground'>Draft tersimpan {autoSavedAt}</p>}
												{isSubmitting && <p className='text-xs text-muted-foreground'>Mengirim penugasan...</p>}
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

					{/* Respons Konselor */}
					{progress?.counselor_feedback && (
						<Card>
							<CardHeader>
								<CardTitle>Respons Konselor</CardTitle>
								<CardDescription>Feedback dari konselor untuk penugasan Anda</CardDescription>
							</CardHeader>
						<CardContent>
							<CounselorResponseDisplay
								counselorResponse={progress.counselor_feedback}
								counselorName={progress.counselor_name}
								respondedAt={progress.updated_at}
							/>
						</CardContent>
						</Card>
					)}

					{/* Navigation */}
					<Card>
						<CardContent className='pt-6'>
							<div className='flex justify-between items-center'>
								<Link to='/spiritual-budaya/intervensi'>
									<Button variant='outline'>
										← Kembali ke Daftar Sesi
									</Button>
								</Link>
								{sessionNumber < 8 && progress?.assignment_done && (
									<Link to={`/spiritual-budaya/intervensi/sesi/${sessionNumber + 1}`}>
										<Button className='bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'>
											Lanjut ke Sesi {sessionNumber + 1} →
										</Button>
									</Link>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default SpiritualIntervensiPortalSesi1;
