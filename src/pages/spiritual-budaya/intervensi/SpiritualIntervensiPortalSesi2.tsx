import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useSpiritualIntervensiSession } from "@/hooks/useSpiritualIntervensiSession";
import { useSpiritualRole } from "@/hooks/useSpiritualRole";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SpiritualIntervensiPortalSesi2: React.FC = () => {
	const sessionNumber = 2;
	const title = "Eksplorasi Identitas Kultural";
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

	// Assignment khusus sesi 2 (Doa, Meditasi, Jurnal)
	const [assignmentS2, setAssignmentS2] = useState({
		doa_reflektif: "",
		meditasi_nilai: "",
		jurnal_spiritual: "",
		submitted: false as boolean | undefined,
	});
	const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

	const isSuperAdmin = role === 'super-admin' || isSuperAdminFromHook;

	// Load any existing answers on mount
	useEffect(() => {
		(async () => {
			const loaded = await loadAssignmentIntervensi();
			if (!loaded) return;
			setAssignmentS2(prev => ({
				doa_reflektif: loaded.doa_reflektif ?? prev.doa_reflektif,
				meditasi_nilai: loaded.meditasi_nilai ?? prev.meditasi_nilai,
				jurnal_spiritual: loaded.jurnal_spiritual ?? prev.jurnal_spiritual,
				submitted: prev.submitted,
			}));
		})();
	}, [loadAssignmentIntervensi]);

	// Debounced autosave on changes (skip if already submitted)
	useEffect(() => {
		// Don't autosave if assignment already done
		if (progress?.assignment_done) return;
		
		const handler = setTimeout(() => {
			autoSaveIntervensi(assignmentS2);
			setAutoSavedAt(lastAutoSaveAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
		}, 1200);
		return () => clearTimeout(handler);
	}, [assignmentS2, autoSaveIntervensi, lastAutoSaveAt, progress?.assignment_done]);

	// Check if user can access this session (sequential access control)
	useEffect(() => {
		const checkSessionAccess = async () => {
			if (!user?.id || isSuperAdmin) {
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
		const a = assignmentS2;
		return (
			a.doa_reflektif.trim() !== "" &&
			a.meditasi_nilai.trim() !== "" &&
			a.jurnal_spiritual.trim() !== ""
		);
	}, [assignmentS2]);

	const handleSubmitAssignment = useCallback(async () => {
		if (!assignmentValid || isSubmitting) return;
		
		setIsSubmitting(true);
		try {
			const result = await updateProgress({ assignment_data: assignmentS2, assignment_done: true });
			
			if (result?.success) {
				setAssignmentS2(prev => ({ ...prev, submitted: true }));
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
	}, [assignmentValid, isSubmitting, assignmentS2, updateProgress, toast]);

	const handleMarkMeetingDone = useCallback(async () => {
		await updateProgress({ meeting_done: !progress?.meeting_done });
	}, [progress, updateProgress]);

	// Fix: Add handler for guide_done checkbox
	const handleMarkGuideDone = useCallback(async () => {
		await updateProgress({ guide_done: !progress?.guide_done });
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

			{/* Hero Section */}
			<section className='relative h-72 bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800 overflow-hidden'>
				<div className='absolute inset-0'>
					<img src={heroImage} alt='Spiritual & Budaya' className='w-full h-full object-cover opacity-20' />
					<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
				</div>
				<div className='relative z-10 h-full flex items-center justify-center text-center'>
					<div className='max-w-4xl mx-auto px-6 text-white'>
						<h1 className='text-5xl font-bold mb-4 drop-shadow-lg'>Intervensi Spiritual & Budaya</h1>
						<p className='text-xl opacity-95 drop-shadow-md'>Sesi {sessionNumber}: {title}</p>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<main className='flex-1 pt-12 bg-gray-50'>
				<section className='py-12'>
					<div className='container mx-auto px-6 max-w-6xl'>
						<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
							{/* Left Sidebar */}
							<div className='lg:col-span-1 space-y-6'>
								{/* Tips Card */}
								<Card className='border-amber-100 bg-amber-50/50 shadow-sm'>
									<CardHeader>
										<CardTitle className='text-base flex items-center gap-2'>
											<span>💡</span>
											Tips Pengerjaan
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-3 text-sm'>
										<p className='flex items-start gap-2'>
											<span className='text-amber-600 font-bold'>1.</span>
											<span>Bacalah setiap panduan dengan seksama</span>
										</p>
										<p className='flex items-start gap-2'>
											<span className='text-amber-600 font-bold'>2.</span>
											<span>Ikuti pertemuan daring sesuai jadwal</span>
										</p>
										<p className='flex items-start gap-2'>
											<span className='text-amber-600 font-bold'>3.</span>
											<span>Kerjakan penugasan dengan jujur dan terbuka</span>
										</p>
										<p className='flex items-start gap-2'>
											<span className='text-amber-600 font-bold'>4.</span>
											<span>Tandai selesai setelah mengerjakan setiap tahap</span>
										</p>
									</CardContent>
								</Card>

								{/* Progress Card */}
								<div className='sticky top-28'>
									<Card className='border-amber-200 shadow-md'>
										<CardHeader>
											<CardTitle className='text-base'>Progress Sesi</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div>
												<div className='flex items-center justify-between mb-2 text-sm'>
													<span className='text-muted-foreground'>Penyelesaian</span>
													<span className='font-semibold text-amber-700'>{progressPercentage}%</span>
												</div>
												<div className='w-full bg-gray-200 rounded-full h-2.5'>
													<div
														className='bg-gradient-to-r from-amber-500 to-orange-600 h-2.5 rounded-full transition-all duration-500'
														style={{ width: `${progressPercentage}%` }}
													/>
												</div>
											</div>
											<div className='space-y-2 text-sm'>
												<div className='flex items-center gap-2'>
													<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress?.guide_done ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
														{progress?.guide_done ? '✓' : '1'}
													</div>
													<span className={progress?.guide_done ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
														Membaca Panduan
													</span>
												</div>
												<div className='flex items-center gap-2'>
													<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress?.meeting_done ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
														{progress?.meeting_done ? '✓' : '2'}
													</div>
													<span className={progress?.meeting_done ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
														Mengikuti Pertemuan
													</span>
												</div>
												<div className='flex items-center gap-2'>
													<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress?.assignment_done ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
														{progress?.assignment_done ? '✓' : '3'}
													</div>
													<span className={progress?.assignment_done ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
														Mengumpulkan Penugasan
													</span>
												</div>
												<div className='flex items-center gap-2'>
													<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress?.counselor_feedback ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
														{progress?.counselor_feedback ? '✓' : '4'}
													</div>
													<span className={progress?.counselor_feedback ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
														Menerima Feedback
													</span>
												</div>
											</div>
											<Link to='/spiritual-budaya' className='block'>
												<Button variant='outline' size='sm' className='w-full'>
													← Kembali ke Dashboard
												</Button>
											</Link>
										</CardContent>
									</Card>
								</div>
							</div>

							{/* Main Content */}
							<div className='lg:col-span-3 space-y-8'>
								{/* Panduan Sesi */}
								<Card className='border-amber-100 shadow-sm'>
									<CardHeader>
										<CardTitle className='text-amber-800'>Panduan Sesi {sessionNumber}</CardTitle>
										<CardDescription>Ikuti langkah-langkah di bawah ini untuk menyelesaikan sesi intervensi</CardDescription>
									</CardHeader>
									<CardContent className='space-y-4'>
										<div className='bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg'>
											<p className='font-semibold text-amber-900 mb-1'>🎯 Fokus Sesi:</p>
											<p className='text-amber-800'>{title}</p>
										</div>
										<div className='bg-muted/50 p-4 rounded-lg space-y-2'>
											<p className='font-semibold text-sm'>Alur Pengerjaan:</p>
											<ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
												<li>Baca panduan materi spiritual yang disediakan</li>
												<li>Tandai "Sudah membaca panduan" setelah selesai</li>
												<li>Ikuti pertemuan daring sesuai jadwal grup Anda</li>
												<li>Tandai "Sudah mengikuti pertemuan" setelah selesai</li>
												<li>Kerjakan penugasan dengan mengisi semua field yang tersedia</li>
												<li>Klik "Kirim Penugasan" untuk menyimpan hasil kerja</li>
											</ol>
										</div>
										<div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-sm'>
											<p className='text-blue-900'>
												<strong>Catatan:</strong> Penugasan hanya bisa dikerjakan setelah Anda menandai sudah membaca panduan dan mengikuti pertemuan daring.
											</p>
										</div>
									</CardContent>
								</Card>

								{/* Informasi Pertemuan Daring */}
								{meeting ? (
									<Card className='border-amber-100 shadow-sm'>
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
					) : (
						<Card className='border-gray-200 shadow-sm'>
							<CardContent className='pt-6'>
								<p className='text-sm text-muted-foreground text-center'>Informasi pertemuan belum tersedia.</p>
							</CardContent>
						</Card>
					)}

					{/* Panduan Penugasan */}
					<Card className='border-amber-100 shadow-sm'>
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
							<div className='flex items-center gap-2 mt-4 pt-4 border-t'>
								<input
									type='checkbox'
									id='guideDone'
									checked={progress?.guide_done || false}
									onChange={handleMarkGuideDone}
									className='w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
								/>
								<label htmlFor='guideDone' className='text-sm text-gray-700 cursor-pointer'>
									Sudah membaca panduan
								</label>
							</div>
						</CardContent>
					</Card>

					{/* Penugasan */}
					<Card className='border-amber-100 shadow-sm'>
						<CardHeader>
							<CardTitle>Penugasan Sesi {sessionNumber}</CardTitle>
							<CardDescription>Refleksi spiritual dan budaya melalui praktik pribadi</CardDescription>
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
										<label className='block text-sm font-medium mb-2'>Bagian 1: Doa Reflektif</label>
										<p className='text-xs text-muted-foreground mb-2'>Tuliskan doa atau refleksi spiritual Anda terkait dengan perjalanan kesehatan mental yang sedang Anda jalani.</p>
										<textarea rows={6} className='w-full rounded border p-3 text-sm' placeholder='Tulis doa reflektif Anda di sini...' value={assignmentS2.doa_reflektif} onChange={e=> setAssignmentS2(p=> ({ ...p, doa_reflektif: e.target.value }))} disabled={progress?.assignment_done} />
									</div>
									<div>
										<label className='block text-sm font-medium mb-2'>Bagian 2: Meditasi Nilai</label>
										<p className='text-xs text-muted-foreground mb-2'>Renungkan nilai-nilai spiritual dan budaya yang Anda anut. Bagaimana nilai-nilai tersebut membantu Anda menghadapi tantangan?</p>
										<textarea rows={6} className='w-full rounded border p-3 text-sm' placeholder='Tulis hasil meditasi nilai Anda di sini...' value={assignmentS2.meditasi_nilai} onChange={e=> setAssignmentS2(p=> ({ ...p, meditasi_nilai: e.target.value }))} disabled={progress?.assignment_done} />
									</div>
									<div>
										<label className='block text-sm font-medium mb-2'>Bagian 3: Jurnal Spiritual</label>
										<p className='text-xs text-muted-foreground mb-2'>Tuliskan pengalaman spiritual yang bermakna bagi Anda minggu ini, dan bagaimana hal tersebut memengaruhi kesejahteraan mental Anda.</p>
										<textarea rows={6} className='w-full rounded border p-3 text-sm' placeholder='Tulis jurnal spiritual Anda di sini...' value={assignmentS2.jurnal_spiritual} onChange={e=> setAssignmentS2(p=> ({ ...p, jurnal_spiritual: e.target.value }))} disabled={progress?.assignment_done} />
									</div>
									<div className='flex items-center gap-3 pt-2 border-t'>
										{!progress?.assignment_done && (
											<>
												<Button 
													className='bg-amber-600 hover:bg-amber-700'
													onClick={handleSubmitAssignment} 
													disabled={!assignmentValid || isSubmitting || !!assignmentS2.submitted}
												>
													{isSubmitting ? 'Mengirim...' : assignmentS2.submitted ? 'Terkirim ✓' : 'Kirim Penugasan'}
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
						<Card className='border-amber-100 shadow-sm'>
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
				</div>
			</div>
		</div>
	</section>
</main>
<Footer />
</div>
);
};

export default SpiritualIntervensiPortalSesi2;
