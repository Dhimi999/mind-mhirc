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
import { useHibridaSession } from "@/hooks/useHibridaSession";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";

interface SessionProgress {
	meetingDone: boolean;
	assignmentDone: boolean;
	sessionOpened: boolean;
	counselorResponse?: string;
}

interface Session2Assignment {
	pengalaman: string; // 1a
	situasi: string;    // 1b
	pikiran: string[];  // 1c (5 slots, min 3)
	tantangan: string[]; // 2 (responses to each pikiran)
	alasan: string[];   // 3 (10, min 5)
	visualisasi: string; // 4
	submitted?: boolean;
}

const defaultAssignment: Session2Assignment = {
	pengalaman: "",
	situasi: "",
	pikiran: Array(5).fill(""),
	tantangan: Array(5).fill(""),
	alasan: Array(10).fill(""),
	visualisasi: "",
	submitted: false
};

const HibridaPortalSesi2: React.FC = () => {
	const sessionNumber = 2;
	const title = "Mengidentifikasi & Menantang Pikiran Negatif";
	const { user } = useAuth();

	// Use Supabase hook
	const {
		progress,
		meetingSchedule: schedule,
		loading: dataLoading,
		markMeetingDone,
		submitAssignment,
		loadAssignment,
		autoSaveAssignment
	} = useHibridaSession(sessionNumber, user?.id);

	const [hasReadGuide, setHasReadGuide] = useState(false);
	const [assignment, setAssignment] = useState<Session2Assignment>(defaultAssignment);
	const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

	// Load assignment from Supabase
	useEffect(() => {
		if (user?.id) {
			loadAssignment().then((data) => {
				if (data && typeof data === 'object') {
					setAssignment(prev => ({ ...prev, ...data as Partial<Session2Assignment> }));
				}
			});
		}
	}, [user?.id, loadAssignment]);

	// Auto-save assignment to Supabase (debounced)
	useEffect(() => {
		if (progress.assignmentDone) return;
		const h = setTimeout(() => {
			autoSaveAssignment(assignment);
			setAutoSavedAt(new Date().toLocaleTimeString());
		}, 1000);
		return () => clearTimeout(h);
	}, [assignment, progress.assignmentDone, autoSaveAssignment]);

	// Validation logic for enabling submit
	const assignmentValid = useMemo(() => {
		if (!assignment.pengalaman.trim()) return false;
		if (!assignment.situasi.trim()) return false;
		const filledPikiran = assignment.pikiran.filter(p => p.trim()).length;
		if (filledPikiran < 3) return false;
		// For each filled pikiran ensure tantangan filled (at least for corresponding indexes)
		for (let i = 0; i < assignment.pikiran.length; i++) {
			if (assignment.pikiran[i].trim() && !assignment.tantangan[i].trim()) return false;
		}
		if (assignment.alasan.filter(a => a.trim()).length < 5) return false;
		if (!assignment.visualisasi.trim()) return false;
		return true;
	}, [assignment]);

	// Derived percent for progress bar (same weighting style as Sesi 1 for overall progress panel)
	const overallPercent = useMemo(() => {
		let total = 0;
		if (progress.sessionOpened) total += 20;
		if (progress.meetingDone) total += 30;
		if (progress.assignmentDone) total += 30;
		if (progress.counselorResponse) total += 20;
		return total;
	}, [progress]);

	// Assignment fill percent (for display inside assignment card maybe not required but helpful)
	const assignmentFillPercent = useMemo(() => {
		const fields: number[] = [];
		fields.push(assignment.pengalaman ? 1 : 0);
		fields.push(assignment.situasi ? 1 : 0);
		fields.push(...assignment.pikiran.map(p => (p ? 1 : 0)));
		fields.push(...assignment.tantangan.map(t => (t ? 1 : 0)));
		fields.push(...assignment.alasan.map(a => (a ? 1 : 0)));
		fields.push(assignment.visualisasi ? 1 : 0);
		const total = fields.length; // 1+1+5+5+10+1 = 23
		const filled = fields.reduce((a, b) => a + b, 0);
		return Math.round((filled / total) * 100);
	}, [assignment]);

	const handleSubmitAssignment = useCallback(async () => {
		if (!assignmentValid) return;
		const success = await submitAssignment(assignment);
		if (success) {
			setAssignment(prev => ({ ...prev, submitted: true }));
		}
	}, [assignmentValid, assignment, submitAssignment]);

	const renderGuide = () => {
		if (!progress.meetingDone) {
			return <div className="text-sm text-muted-foreground">Panduan akan muncul setelah Anda menandai Pertemuan Daring selesai.</div>;
		}
		return (
			<div className="space-y-4 text-sm leading-relaxed">
				<div className="rounded-lg border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white p-4">
					<p className="font-semibold text-indigo-800 mb-1">Fokus Sesi 2 — Mengenali & Menantang Pikiran Negatif Otomatis</p>
					<p>Anda belajar menelusuri pikiran otomatis yang muncul dari pengalaman sulit, lalu menantangnya secara rasional agar narasi diri menjadi lebih seimbang & memberdayakan.</p>
				</div>
				<ul className="list-disc pl-5 space-y-1 text-muted-foreground">
					<li>Menggambarkan pengalaman sulit & respon awal.</li>
					<li>Mengidentifikasi 3–5 pikiran otomatis negatif.</li>
					<li>Menyusun tantangan (counter statements) realistis.</li>
					<li>Menuliskan alasan personal untuk tetap hidup.</li>
					<li>Melakukan visualisasi positif berbasis alasan tersebut.</li>
				</ul>
				<div className="border rounded p-3 bg-indigo-50 text-xs text-indigo-800">Catatan: Jika muncul pikiran menyakiti diri secara intens, hentikan latihan & hubungi bantuan profesional.</div>
				<div className="text-xs text-muted-foreground">Isi bertahap — otomatis tersimpan.</div>
			</div>
		);
	};

	const setArrayValue = (field: keyof Pick<Session2Assignment, 'pikiran' | 'tantangan' | 'alasan'>, idx: number, value: string) => {
		setAssignment(prev => ({ ...prev, [field]: prev[field].map((v, i) => i === idx ? value : v) } as any));
	};

	const renderAssignment = () => {
		const a = assignment;
		return (
			<div className="space-y-10">
				{/* 1 */}
				<div>
					<h4 className="font-semibold mb-3">1. Identifikasi Pikiran Negatif</h4>
					<div className="ml-4 space-y-5">
						<div>
							<label className="block text-sm font-medium mb-1">a. Ceritakan kembali momen pengalaman hidup tersulit Anda menjadi mahasiswa</label>
							<textarea rows={3} className="w-full rounded border p-2 text-sm" value={a.pengalaman} onChange={e => setAssignment(p => ({ ...p, pengalaman: e.target.value }))} disabled={progress.assignmentDone} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">b. Ceritakan situasi tersebut meliputi perasaan & pikiran pertama yang muncul</label>
							<textarea rows={3} className="w-full rounded border p-2 text-sm" value={a.situasi} onChange={e => setAssignment(p => ({ ...p, situasi: e.target.value }))} disabled={progress.assignmentDone} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">c. Tuliskan 3–5 pikiran otomatis negatif yang biasanya muncul saat tertekan / dalam pengalaman tersebut:</label>
							<div className="ml-2 space-y-2">
								{a.pikiran.map((val, i) => (
									<div key={i} className="flex items-center gap-2">
										<span className="w-6 text-xs text-gray-500">{i + 1})</span>
										<input className="flex-1 border rounded p-2 text-sm" value={val} onChange={e => setArrayValue('pikiran', i, e.target.value)} placeholder={`Pikiran negatif ${i + 1}`} disabled={progress.assignmentDone} />
									</div>
								))}
							</div>
							<p className="text-[11px] text-muted-foreground mt-1">Minimal isi 3 agar bisa lanjut.</p>
						</div>
					</div>
				</div>
				{/* 2 */}
				<div>
					<h4 className="font-semibold mb-3">2. Tantangan terhadap Pikiran Negatif</h4>
					<p className="text-xs text-muted-foreground mb-3">Berikan alternatif realistis / rasional untuk tiap pikiran yang sudah Anda tulis.</p>
					<div className="space-y-4 ml-2">
						{a.pikiran.map((pik, i) => (
							<div key={i} className="flex flex-col gap-1">
								<label className="text-xs font-medium">Pikiran {i + 1}: <span className="italic text-gray-500">{pik || '(kosong)'}</span></label>
								<input className="border rounded p-2 text-sm" value={a.tantangan[i]} onChange={e => setArrayValue('tantangan', i, e.target.value)} placeholder={`Tantangan untuk pikiran ${i + 1}`} disabled={progress.assignmentDone || !pik.trim()} />
							</div>
						))}
					</div>
				</div>
				{/* 3 */}
				<div>
					<h4 className="font-semibold mb-3">3. Daftar Alasan untuk Tetap Hidup</h4>
						<p className="text-xs text-muted-foreground mb-2">Tuliskan minimal 5 alasan personal yang membuat Anda ingin tetap hidup:</p>
						<div className="ml-2 space-y-2">
							{a.alasan.map((val, i) => (
								<div key={i} className="flex items-center gap-2">
									<span className="w-6 text-xs text-gray-500">{i + 1})</span>
									<input className="flex-1 border rounded p-2 text-sm" value={val} onChange={e => setArrayValue('alasan', i, e.target.value)} placeholder={`Alasan ${i + 1}`} disabled={progress.assignmentDone} />
								</div>
							))}
						</div>
						<p className="text-[11px] text-muted-foreground mt-1">Saat ini terisi {a.alasan.filter(x => x.trim()).length} / 10 (minimal 5).</p>
				</div>
				{/* 4 */}
				<div>
					<h4 className="font-semibold mb-3">4. Visualisasi Positif (Guided Imagery)</h4>
					<p className="text-xs text-muted-foreground mb-2">Bayangkan diri Anda menjalani hidup dengan alasan-alasan di atas. Tuliskan gambaran yang muncul:</p>
					<textarea rows={5} className="w-full rounded border p-2 text-sm" value={a.visualisasi} onChange={e => setAssignment(p => ({ ...p, visualisasi: e.target.value }))} placeholder="Tuliskan gambaran positif Anda di sini..." disabled={progress.assignmentDone} />
				</div>
				<div className="flex items-center gap-3 pt-2 border-t">
					<Button className="bg-indigo-600 hover:bg-indigo-700" disabled={!assignmentValid || progress.assignmentDone} onClick={handleSubmitAssignment}>
						{progress.assignmentDone ? 'Terkirim' : 'Kirim & Tandai Selesai'}
					</Button>
					<Badge className={progress.assignmentDone ? 'bg-green-600 text-white' : 'bg-indigo-200 text-indigo-900'}>{progress.assignmentDone ? 'Sudah selesai' : 'Belum selesai'}</Badge>
					{autoSavedAt && !progress.assignmentDone && <span className="text-xs text-muted-foreground">Draft tersimpan: {autoSavedAt}</span>}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Helmet>
				<title>Sesi 2 - {title} | Hibrida Naratif CBT</title>
				<meta name="description" content={`Portal intervensi Hibrida Naratif CBT sesi 2: ${title}`} />
				<link rel="canonical" href="https://mind-mhirc.my.id/hibrida-cbt/intervensi/sesi/2" />
			</Helmet>
			<Navbar />
			<main className="flex-1 pt-24">
				{/* Hero */}
				<section className="relative overflow-hidden rounded">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800" />
					<div className="absolute inset-0 opacity-10">
						<img src={heroImage} alt="Hibrida Naratif CBT" className="w-full h-full object-cover" />
					</div>
					<div className="relative container mx-auto px-6 py-14">
						<div className="max-w-5xl mx-auto">
							<div className="flex items-center justify-between mb-6">
								<Link to="/hibrida-cbt/intervensi-hibrida" className="text-white/90 hover:underline text-sm">← Kembali</Link>
								<Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Sesi</Badge>
							</div>
							<h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">Sesi 2: {title}</h1>
							<p className="text-indigo-100 max-w-2xl">Fokus pada mengenali pikiran otomatis negatif & membangun alternatif adaptif berbasis narasi yang lebih sehat.</p>
						</div>
					</div>
				</section>
				<section className="py-12">
					<div className="container mx-auto px-6 max-w-6xl">
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
							{/* Left Column: Tips above Sticky Progress */}
							<div className="lg:col-span-1 space-y-6">
								<div className="rounded-xl border border-indigo-100 p-4 text-xs leading-relaxed bg-white/60 backdrop-blur">
									<p className="font-semibold mb-1 text-indigo-700">Tips</p>
									<p>Simpan daftar alasan (#3) & visualisasi (#4) untuk digunakan saat muncul pikiran negatif.</p>
								</div>
								<div className="rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 p-5 shadow-sm sticky top-28">
									<h3 className="font-semibold mb-4 text-sm tracking-wide text-indigo-700">PROGRES SESI</h3>
									<div className="mb-4">
										<div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden">
											<div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all" style={{ width: `${overallPercent}%` }} />
										</div>
										<div className="mt-2 text-xs text-indigo-700 font-medium">{overallPercent}% selesai</div>
									</div>
									<ol className="space-y-3 text-xs">
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.sessionOpened ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>✓</span>
											<span>Sesi Dibuka</span>
										</li>
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.meetingDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>1</span>
											<span>Pertemuan Daring</span>
										</li>
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${(progress.meetingDone && hasReadGuide) || progress.assignmentDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>2</span>
											<span>Panduan & Penugasan</span>
										</li>
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.counselorResponse ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>3</span>
											<span>Response Konselor</span>
										</li>
									</ol>
								</div>
                
							</div>
							{/* Right Main */}
							<div className="lg:col-span-3 space-y-8">
								{/* Pertemuan Daring */}
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
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
													<div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /><span className="text-muted-foreground">Tanggal:</span><span className="font-medium">{schedule?.date || 'TBD'}</span></div>
													<div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /><span className="text-muted-foreground">Waktu:</span><span className="font-medium">{schedule?.time || 'TBD'}</span></div>
													<div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /><span className="text-muted-foreground">Link:</span>{schedule?.link ? <a href={schedule.link} target="_blank" rel="noreferrer" className="text-indigo-700 underline font-medium">Tersedia</a> : <span className="font-medium">TBD</span>}</div>
												</div>
												<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div className="flex flex-wrap items-center gap-3">
														<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!schedule?.link} onClick={() => schedule?.link && window.open(schedule.link, '_blank')}>Mulai Pertemuan</Button>
														<Button size="sm" variant={progress.meetingDone ? "destructive" : "outline"} onClick={() => progress.meetingDone ? undefined : markMeetingDone()} disabled={progress.assignmentDone}>{progress.meetingDone ? 'Sudah Selesai' : 'Tandai Selesai'}</Button>
													</div>
													<div className="sm:ml-auto">
														<Badge className={progress.meetingDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>{progress.meetingDone ? '✓ Sudah selesai' : '⏳ Belum selesai'}</Badge>
													</div>
												</div>
											</CardContent>
										</div>
									</div>
								</Card>
								{/* Panduan */}
								<Card className="border-indigo-100 shadow-sm">
									<CardHeader>
										<CardTitle>Panduan Sesi</CardTitle>
										<CardDescription>Baca & centang konfirmasi sebelum penugasan.</CardDescription>
									</CardHeader>
									<CardContent>
										{renderGuide()}
										{progress.meetingDone && (
											<div className="mt-4 text-sm space-y-2">
												<label className="flex items-start gap-2 cursor-pointer">
													<input type="checkbox" checked={hasReadGuide || progress.assignmentDone} onChange={() => setHasReadGuide(v => !v)} disabled={progress.assignmentDone} />
													<span>Saya telah membaca dan memahami panduan.</span>
												</label>
												<label className="flex items-start gap-2 cursor-pointer">
													<input type="checkbox" checked={(hasReadGuide && !progress.assignmentDone) || progress.assignmentDone} onChange={() => setHasReadGuide(v => !v)} disabled={!hasReadGuide || progress.assignmentDone} />
													<span>Saya akan mengikuti panduan selama mengerjakan sesi.</span>
												</label>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Guidance Materials */}
								{progress.meetingDone && schedule && (
									<GuidanceMaterialsDisplay
										guidance_text={schedule.guidance_text}
										guidance_pdf_url={schedule.guidance_pdf_url}
										guidance_audio_url={schedule.guidance_audio_url}
										guidance_video_url={schedule.guidance_video_url}
										guidance_links={schedule.guidance_links}
									/>
								)}
								{/* Penugasan */}
								<Card className="border-indigo-100 shadow-md">
									<CardHeader>
										<CardTitle>Penugasan</CardTitle>
										<CardDescription>Restrukturisasi pikiran otomatis</CardDescription>
									</CardHeader>
									<CardContent>
										{!hasReadGuide && !progress.assignmentDone && (
											<div className="mb-4 p-3 rounded border border-indigo-300 bg-indigo-50 text-indigo-900 text-sm">Penugasan terkunci. Baca panduan lalu centang konfirmasi.</div>
										)}
										<div className={(!hasReadGuide && !progress.assignmentDone) ? 'pointer-events-none opacity-60 select-none' : ''}>
											{renderAssignment()}
											<div className="mt-4 text-[11px] text-muted-foreground">Progress penugasan: {assignmentFillPercent}%</div>
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

export default HibridaPortalSesi2;
