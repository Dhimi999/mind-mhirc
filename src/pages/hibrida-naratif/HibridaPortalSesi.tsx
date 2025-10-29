import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useHibridaSession } from "@/hooks/useHibridaSession";
import { GuidanceMaterialsDisplay } from "@/components/dashboard/hibrida-cbt/GuidanceMaterialsDisplay";
import { CounselorResponseDisplay } from "@/components/dashboard/hibrida-cbt/CounselorResponseDisplay";

type SessionProgress = { 
	meetingDone: boolean; 
	assignmentDone: boolean;
	sessionOpened: boolean; // Sesi Dibuka (opened when first accessed)
	counselorResponse?: string; // Response Konselor (if any)
};

const sessionTitles: Record<number, string> = {
	1: "Pengalaman Crisis Response Plan",
	2: "Identifikasi Pikiran Otomatis",
	3: "Restrukturisasi Kognitif Awal",
	4: "Naratif Alternatif & Nilai Hidup",
	5: "Eksposur Naratif Aman",
	6: "Eksperimen Perilaku & Mindfulness",
	7: "Integrasi Cerita & Ketahanan",
	8: "Rencana Lanjut & Relapse Prevention"
};

// Placeholder schedule (can be wired to backend later)
const meetingSchedule: Record<number, { date: string; time: string; link: string } | undefined> = {
	1: { date: "2025-10-05", time: "20:00 WIB", link: "https://meet.google.com/hn-cbt-sesi-1" },
	2: undefined,
	3: undefined,
	4: undefined,
	5: undefined,
	6: undefined,
	7: undefined,
	8: undefined
};

// Data shape for Sesi 1 assignment answers
interface Session1Assignment {
	pengalaman_a: string;
	pengalaman_b: string;
	pengalaman_c: string;
	pemicu: string[];
	pemicu_lainnya: string;
	pikiran_otomatis: string;
	emosi: string[];
	emosi_lainnya: string;
	perilaku: string[];
	perilaku_lainnya: string;
	// New fields (6 - 11)
	tanda_peringatan: string; // 6
	strategi_memecahkan_masalah: string; // 7a
	strategi_dukungan_teman: string; // 7b
	strategi_fasilitas_kesehatan: string; // 7c
	aktivitas: { [name: string]: number }; // activity -> priority (1..n)
	aktivitas_lainnya: string;
	aktivitas_lainnya_priority: string;
	kontak_temandekat: string; // 9
	kontak_keluarga: string;
	kontak_wali: string;
	kontak_layanan: string;
	lingkungan: { [name: string]: number }; // safe place -> priority
	lingkungan_lainnya: string;
	lingkungan_lainnya_priority: string;
	tindakan_saat_datang: string; // 11
	submitted?: boolean;
}

const defaultSession1Assignment: Session1Assignment = {
	pengalaman_a: "",
	pengalaman_b: "",
	pengalaman_c: "",
	pemicu: [],
	pemicu_lainnya: "",
	pikiran_otomatis: "",
	emosi: [],
	emosi_lainnya: "",
	perilaku: [],
	perilaku_lainnya: "",
	tanda_peringatan: "",
	strategi_memecahkan_masalah: "",
	strategi_dukungan_teman: "",
	strategi_fasilitas_kesehatan: "",
	aktivitas: {},
	aktivitas_lainnya: "",
	aktivitas_lainnya_priority: "",
	kontak_temandekat: "",
	kontak_keluarga: "",
	kontak_wali: "",
	kontak_layanan: "",
	lingkungan: {},
	lingkungan_lainnya: "",
	lingkungan_lainnya_priority: "",
	tindakan_saat_datang: "",
	submitted: false
};

// Option lists
const PEMICU_OPTIONS = [
	"Kata / ucapan tertentu",
	"Suara keras / tiba-tiba",
	"Keramaian",
	"Kesepian",
	"Konflik dengan orang",
	"Kabar buruk / berita negatif",
	"Pengingat pengalaman traumatis",
	"Tekanan tugas / akademik",
	"Penolakan / kritik"
];

const EMOSI_OPTIONS = [
	"Cemas",
	"Sedih",
	"Marah",
	"Takut",
	"Malu",
	"Bersalah",
	"Putus asa",
	"Kosong / mati rasa"
];

const PERILAKU_OPTIONS = [
	"Menarik diri",
	"Menangis",
	"Menghindar situasi",
	"Ledakan marah",
	"Overworking / sibuk berlebihan",
	"Mencari kepastian berulang",
	"Perilaku kompulsif (mis. checking)",
	"Impuls self-harm (tanpa tindakan)"
];

// New selectable options (activities & safe places)
const AKTIVITAS_OPTIONS = [
	"Mendengarkan musik",
	"Berdoa / meditasi",
	"Jalan santai",
	"Menulis jurnal",
	"Menghubungi teman"
];

const LINGKUNGAN_OPTIONS = [
	"Kamar pribadi",
	"Perpustakaan kampus",
	"Taman kampus",
	"Tempat ibadah",
	"Cafe",
	"Ruang musik / seni",
	"Lapangan olahraga",
	"Pantai / gunung / alam",
	"Ruang konseling kampus",
	"Rumah keluarga",
	"Kost"
];

const HibridaPortalSesi: React.FC = () => {
	const { sesi } = useParams<{ sesi: string }>();
	const sessionNumber = parseInt(sesi || "0", 10);
	const title = sessionTitles[sessionNumber];
	const { user } = useAuth();

	// Use Supabase hook
	const {
		progress,
		meetingSchedule: schedule,
		loading: dataLoading,
		groupAssignment,
		isSuperAdmin,
		allGroupSchedules,
		markMeetingDone,
		submitAssignment,
		loadAssignment,
		autoSaveAssignment
	} = useHibridaSession(sessionNumber, user?.id);

	const [hasReadGuide, setHasReadGuide] = useState(false);
	const [sesi1Assignment, setSesi1Assignment] = useState<Session1Assignment>(defaultSession1Assignment);
	const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

	// Load assignment from Supabase on mount
	useEffect(() => {
		if (sessionNumber === 1 && user?.id) {
			loadAssignment().then((data) => {
				if (data && typeof data === 'object') {
					setSesi1Assignment(prev => ({ ...prev, ...data as Partial<Session1Assignment> }));
				}
			});
		}
	}, [sessionNumber, user?.id, loadAssignment]);

	// Auto-save assignment to Supabase (debounced)
	useEffect(() => {
		if (sessionNumber !== 1 || progress.assignmentDone) return;
		const h = setTimeout(() => {
			autoSaveAssignment(sesi1Assignment);
			setAutoSavedAt(new Date().toLocaleTimeString());
		}, 1000);
		return () => clearTimeout(h);
	}, [sesi1Assignment, sessionNumber, progress.assignmentDone, autoSaveAssignment]);

	const percent = useMemo(() => {
		let total = 0;
		if (progress.sessionOpened) total += 20;
		if (progress.meetingDone) total += 30;
		if (progress.assignmentDone) total += 30;
		if (progress.counselorResponse) total += 20;
		return total;
	}, [progress]);

	const normalizeHref = (url?: string | null) => {
		if (!url) return undefined;
		try {
			const u = new URL(url);
			return u.toString();
		} catch {
			// If missing protocol, prepend https://
			if (/^\/?\/?[\w.-]+/.test(url)) {
				return `https://${url.replace(/^\/+/, '')}`;
			}
			return url;
		}
	};

	const toggleArrayValue = (arr: string[], val: string) => (arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

	// Validation for session 1 assignment
	const sesi1Valid = useMemo(() => {
		if (sessionNumber !== 1) return false;
		const a = sesi1Assignment;
		if (!a.pengalaman_a.trim() || !a.pengalaman_b.trim() || !a.pengalaman_c.trim()) return false;
		if (a.pemicu.length === 0 && !a.pemicu_lainnya.trim()) return false;
		if (!a.pikiran_otomatis.trim()) return false;
		if (a.emosi.length === 0 && !a.emosi_lainnya.trim()) return false;
		if (a.perilaku.length === 0 && !a.perilaku_lainnya.trim()) return false;
		if (!a.tanda_peringatan.trim()) return false;
		// At least one coping strategy filled
		if (!a.strategi_memecahkan_masalah.trim() && !a.strategi_dukungan_teman.trim() && !a.strategi_fasilitas_kesehatan.trim()) return false;
		// Activities: need >=3 with unique priorities (include 'lainnya' if filled)
		const aktivitasEntries = Object.entries(a.aktivitas).filter(([, pr]) => pr !== undefined && pr !== null);
		const aktivitasCount = aktivitasEntries.length + (a.aktivitas_lainnya && a.aktivitas_lainnya_priority ? 1 : 0);
		if (aktivitasCount < 3) return false;
		const aktivitasPriorities = [
			...aktivitasEntries.map(([, pr]) => pr as number),
			...(a.aktivitas_lainnya && a.aktivitas_lainnya_priority ? [Number(a.aktivitas_lainnya_priority)] : [])
		];
		if (new Set(aktivitasPriorities).size !== aktivitasPriorities.length) return false; // unique priorities overall
		// Safe environments >=3 (include 'lainnya' if filled)
		const lingkunganEntries = Object.entries(a.lingkungan).filter(([, pr]) => pr !== undefined && pr !== null);
		const lingkunganCount = lingkunganEntries.length + (a.lingkungan_lainnya && a.lingkungan_lainnya_priority ? 1 : 0);
		if (lingkunganCount < 3) return false;
		const lingkunganPriorities = [
			...lingkunganEntries.map(([, pr]) => pr as number),
			...(a.lingkungan_lainnya && a.lingkungan_lainnya_priority ? [Number(a.lingkungan_lainnya_priority)] : [])
		];
		if (new Set(lingkunganPriorities).size !== lingkunganPriorities.length) return false;
		if (!a.tindakan_saat_datang.trim()) return false;
		return true;
	}, [sessionNumber, sesi1Assignment]);

	const handleSubmitAssignment = useCallback(async () => {
		if (sessionNumber !== 1) return;
		if (!sesi1Valid) return;
		const success = await submitAssignment(sesi1Assignment);
		if (success) {
			setSesi1Assignment(prev => ({ ...prev, submitted: true }));
		}
	}, [sessionNumber, sesi1Valid, sesi1Assignment, submitAssignment]);

	const renderGuide = () => {
		if (!progress.meetingDone) {
			return <div className="text-sm text-muted-foreground">Panduan akan muncul setelah Anda menandai Pertemuan Daring selesai.</div>;
		}
		if (sessionNumber === 1) {
			return (
				<div className="space-y-4 text-sm leading-relaxed">
					<div className="rounded-lg border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 p-4">
						<p className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Fokus Sesi 1 — Pengalaman Crisis Response Plan</p>
						<p>
							Membangun gambaran awal Crisis Response Plan melalui pemetaan pengalaman tersulit dan rantai reaksi (pemicu → pikiran → emosi → perilaku) sehingga Anda dapat mulai menata strategi koping yang lebih adaptif dan aman.
						</p>
					</div>
					<ul className="list-disc pl-5 space-y-1 text-muted-foreground">
						<li>Mendeskripsikan pengalaman hidup tersulit (konteks, dampak, respon awal).</li>
						<li>Mengidentifikasi pemicu internal / eksternal yang mengaktifkan memori atau emosi.</li>
						<li>Mencatat pikiran otomatis yang biasanya muncul.</li>
						<li>Mengeksplor emosi serta intensitas (bila ingin menambahkan angka / skala pribadi).</li>
						<li>Mengenali reaksi perilaku berulang.</li>
						<li>Melanjutkan ke tanda peringatan pribadi, strategi koping sehat, aktivitas penenang, jaringan kontak, tempat aman, dan rencana tindakan.</li>
					</ul>
					<div className="border rounded p-3 bg-indigo-50 text-xs text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-100">Catatan sensitif: Bila muncul dorongan kuat menyakiti diri atau pikiran bunuh diri, hentikan latihan dan segera hubungi tenaga profesional / layanan krisis setempat.</div>
					<div className="mt-1 text-xs text-muted-foreground">Anda boleh mengisi secara bertahap. Draft otomatis tersimpan.</div>
				</div>
			);
		}
		return <div className="text-sm text-muted-foreground">Panduan khusus sesi ini akan ditambahkan.</div>;
	};

	const renderAssignment = () => {
		if (sessionNumber !== 1) {
			return <div className="text-sm text-muted-foreground">Penugasan sesi ini belum tersedia.</div>;
		}
		const a = sesi1Assignment;
		// Small helper to render rank selector (1..10) for a numeric priority value
		const RankSelect: React.FC<{ value: number | null | undefined; onChange: (val: number | null) => void; disabled?: boolean; max?: number }> = ({ value, onChange, disabled, max = 10 }) => (
			<select
				className="w-20 rounded border p-1 text-sm"
				value={value ?? ''}
				onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
				disabled={disabled}
			>
				<option value="">-</option>
				{Array.from({ length: max }).map((_, i) => (
					<option key={i+1} value={i + 1}>{i + 1}</option>
				))}
			</select>
		);
		// Helper to update priority maps ensuring uniqueness (allow overwrite)
		const setAktivitasPriority = (name: string, priority: number | null) => {
			setSesi1Assignment(p => {
				const next = { ...p.aktivitas };
				if (priority === null) delete next[name]; else next[name] = priority;
				return { ...p, aktivitas: next };
			});
		};
		const setLingkunganPriority = (name: string, priority: number | null) => {
			setSesi1Assignment(p => {
				const next = { ...p.lingkungan };
				if (priority === null) delete next[name]; else next[name] = priority;
				return { ...p, lingkungan: next };
			});
		};
		const aktivitasSelectedCount = Object.keys(a.aktivitas).length + (a.aktivitas_lainnya && a.aktivitas_lainnya_priority ? 1 : 0);
		const lingkunganSelectedCount = Object.keys(a.lingkungan).length + (a.lingkungan_lainnya && a.lingkungan_lainnya_priority ? 1 : 0);
		const aktivitasPriorityConflict = (() => {
			const values = Object.values(a.aktivitas);
			const others = a.aktivitas_lainnya_priority ? [...values, Number(a.aktivitas_lainnya_priority)] : values;
			return new Set(others).size !== others.length;
		})();
		const lingkunganPriorityConflict = (() => {
			const values = Object.values(a.lingkungan);
			const others = a.lingkungan_lainnya_priority ? [...values, Number(a.lingkungan_lainnya_priority)] : values;
			return new Set(others).size !== others.length;
		})();

		return (
			<div className="space-y-10">
				{/* 1. Pengalaman Hidup Tersulit */}
				<div>
					<h4 className="font-semibold mb-3">1. Pengalaman Hidup Tersulit</h4>
					<p className="text-xs text-muted-foreground mb-4">Isi ringkas & jujur sebatas nyaman. Tidak perlu sangat detail atau memaksa mengingat hal yang terlalu berat.</p>
					<div className="ml-4 space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">a. Peristiwa yang paling berat</label>
							<textarea
								rows={3}
								className="w-full rounded border p-2 text-sm"
								placeholder="Ceritakan secara singkat peristiwa yang menurut Anda paling berat..."
								value={a.pengalaman_a}
								onChange={e => setSesi1Assignment(p => ({ ...p, pengalaman_a: e.target.value }))}
								disabled={progress.assignmentDone}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">b. Kapan terjadi dan bagaimana memengaruhi hidup sekarang</label>
							<textarea
								rows={3}
								className="w-full rounded border p-2 text-sm"
								placeholder="Waktu kejadian, durasi, dan dampaknya pada kehidupan Anda saat ini..."
								value={a.pengalaman_b}
								onChange={e => setSesi1Assignment(p => ({ ...p, pengalaman_b: e.target.value }))}
								disabled={progress.assignmentDone}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">c. Bagaimana Anda merespons saat itu dan setelahnya</label>
							<textarea
								rows={3}
								className="w-full rounded border p-2 text-sm"
								placeholder="Reaksi awal Anda dan pola respon setelah peristiwa itu..."
								value={a.pengalaman_c}
								onChange={e => setSesi1Assignment(p => ({ ...p, pengalaman_c: e.target.value }))}
								disabled={progress.assignmentDone}
							/>
						</div>
					</div>
				</div>

				{/* 2. Pemicu Emosi */}
				<div>
					<h4 className="font-semibold mb-2">2. Pemicu Emosi</h4>
					<p className="text-xs text-muted-foreground mb-3">Pilih semua yang relevan. Tambahkan lainnya bila tidak ada dalam daftar.</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
						{PEMICU_OPTIONS.map(opt => (
							<label key={opt} className="flex items-start gap-2 text-sm bg-muted/40 rounded p-2 cursor-pointer">
								<input
									type="checkbox"
									checked={a.pemicu.includes(opt)}
									onChange={() => setSesi1Assignment(p => ({ ...p, pemicu: toggleArrayValue(p.pemicu, opt) }))}
									disabled={progress.assignmentDone}
								/>
								<span>{opt}</span>
							</label>
						))}
					</div>
					<div className="mt-2">
						<label className="block text-sm font-medium mb-1">Lainnya (opsional)</label>
						<input
							type="text"
							placeholder="Pemicu lain..."
							className="w-full rounded border p-2 text-sm"
							value={a.pemicu_lainnya}
							onChange={e => setSesi1Assignment(p => ({ ...p, pemicu_lainnya: e.target.value }))}
							disabled={progress.assignmentDone}
						/>
					</div>
				</div>

				{/* 3. Pikiran Otomatis */}
				<div>
					<h4 className="font-semibold mb-2">3. Pikiran Otomatis</h4>
					<p className="text-xs text-muted-foreground mb-2">Ceritakan pikiran pertama yang biasanya muncul saat terjadi pengalaman tersulit. Fokus pada kata/kalimat spontan tanpa disaring.</p>
					<textarea
						rows={4}
						className="w-full rounded border p-2 text-sm"
						placeholder="Tuliskan contoh kalimat spontan yang muncul (mis: 'Aku lemah', 'Aku tidak aman', dsb.)"
						value={a.pikiran_otomatis}
						onChange={e => setSesi1Assignment(p => ({ ...p, pikiran_otomatis: e.target.value }))}
						disabled={progress.assignmentDone}
					/>
				</div>

				{/* 4. Emosi yang Muncul */}
				<div>
					<h4 className="font-semibold mb-2">4. Emosi yang Muncul</h4>
					<p className="text-xs text-muted-foreground mb-2">Apa emosi yang biasanya muncul ketika Anda mengalami pengalaman tersulit? Pilih semua yang sesuai.</p>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
						{EMOSI_OPTIONS.map(opt => (
							<label key={opt} className="flex items-start gap-2 text-sm bg-muted/40 rounded p-2 cursor-pointer">
								<input
									type="checkbox"
									checked={a.emosi.includes(opt)}
									onChange={() => setSesi1Assignment(p => ({ ...p, emosi: toggleArrayValue(p.emosi, opt) }))}
									disabled={progress.assignmentDone}
								/>
								<span>{opt}</span>
							</label>
						))}
					</div>
					<div className="mt-2">
						<label className="block text-sm font-medium mb-1">Lainnya (opsional)</label>
						<input
							type="text"
							placeholder="Emosi lain..."
							className="w-full rounded border p-2 text-sm"
							value={a.emosi_lainnya}
							onChange={e => setSesi1Assignment(p => ({ ...p, emosi_lainnya: e.target.value }))}
							disabled={progress.assignmentDone}
						/>
					</div>
				</div>

				{/* 5. Reaksi Perilaku */}
				<div>
					<h4 className="font-semibold mb-2">5. Reaksi Perilaku</h4>
					<p className="text-xs text-muted-foreground mb-2">Apa yang biasanya Anda lakukan ketika pengalaman tersulit muncul? (mis. menghindar, menarik diri, dll.)</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
						{PERILAKU_OPTIONS.map(opt => (
							<label key={opt} className="flex items-start gap-2 text-sm bg-muted/40 rounded p-2 cursor-pointer">
								<input
									type="checkbox"
									checked={a.perilaku.includes(opt)}
									onChange={() => setSesi1Assignment(p => ({ ...p, perilaku: toggleArrayValue(p.perilaku, opt) }))}
									disabled={progress.assignmentDone}
								/>
								<span>{opt}</span>
							</label>
						))}
					</div>
					<div className="mt-2">
						<label className="block text-sm font-medium mb-1">Lainnya (opsional)</label>
						<input
							type="text"
							placeholder="Perilaku lain..."
							className="w-full rounded border p-2 text-sm"
							value={a.perilaku_lainnya}
							onChange={e => setSesi1Assignment(p => ({ ...p, perilaku_lainnya: e.target.value }))}
							disabled={progress.assignmentDone}
						/>
					</div>
				</div>

				{/* 6. Tanda Peringatan Pribadi */}
				<div>
					<h4 className="font-semibold mb-2">6. Tanda Peringatan Pribadi</h4>
					<p className="text-xs text-muted-foreground mb-2">Ciri-ciri (fisik, emosi, perilaku, pikiran) yang menandakan Anda mulai masuk dalam pengalaman tersulit.</p>
					<textarea
						rows={3}
						className="w-full rounded border p-2 text-sm"
						placeholder="Contoh: jantung berdebar, sulit fokus, merasa terputus, ingin menghindar..."
						value={a.tanda_peringatan}
						onChange={e => setSesi1Assignment(p => ({ ...p, tanda_peringatan: e.target.value }))}
						disabled={progress.assignmentDone}
					/>
				</div>

				{/* 7. Strategi Koping Sehat */}
				<div>
					<h4 className="font-semibold mb-2">7. Strategi Koping Sehat</h4>
					<p className="text-xs text-muted-foreground mb-4">Isi hal-hal yang bisa Anda lakukan untuk menenangkan diri / mengelola situasi.</p>
					<div className="ml-4 space-y-3">
						<div>
							<label className="block text-sm font-medium mb-1">a. Memecahkan Masalah</label>
							<textarea
								rows={2}
								className="w-full rounded border p-2 text-sm"
								placeholder="Langkah konkret memecah masalah menjadi bagian kecil, membuat daftar, dsb."
								value={a.strategi_memecahkan_masalah}
								onChange={e => setSesi1Assignment(p => ({ ...p, strategi_memecahkan_masalah: e.target.value }))}
								disabled={progress.assignmentDone}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">b. Mencari Dukungan Teman Sebaya</label>
							<textarea
								rows={2}
								className="w-full rounded border p-2 text-sm"
								placeholder="Cara Anda menghubungi / meminta dukungan teman."
								value={a.strategi_dukungan_teman}
								onChange={e => setSesi1Assignment(p => ({ ...p, strategi_dukungan_teman: e.target.value }))}
								disabled={progress.assignmentDone}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">c. Memanfaatkan Fasilitas Kesehatan</label>
							<textarea
								rows={2}
								className="w-full rounded border p-2 text-sm"
								placeholder="Mis: booking konseling, menghubungi hotline, konsultasi klinik kampus."
								value={a.strategi_fasilitas_kesehatan}
								onChange={e => setSesi1Assignment(p => ({ ...p, strategi_fasilitas_kesehatan: e.target.value }))}
								disabled={progress.assignmentDone}
							/>
						</div>
					</div>
				</div>

				{/* 8. Aktivitas Penenang Diri */}
				<div>
					<h4 className="font-semibold mb-2">8. Aktivitas Penenang Diri / Mengalihkan Diri</h4>
					<p className="text-xs text-muted-foreground mb-3">Pilih minimal 3. Berikan prioritas unik (1 = paling efektif / sering). Jika batal pilih, hapus prioritas.</p>
					<div className="space-y-2 mb-2">
						{AKTIVITAS_OPTIONS.map(opt => {
							const selected = a.aktivitas[opt] !== undefined;
							const priority = a.aktivitas[opt];
							return (
								<div key={opt} className="flex items-center gap-3 bg-muted/40 rounded p-2">
									<label className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
										<input
											type="checkbox"
											checked={selected}
											onChange={() => setAktivitasPriority(opt, selected ? null : (Object.keys(a.aktivitas).length + 1))}
											disabled={progress.assignmentDone}
										/>
										<span>{opt}</span>
									</label>
									{selected && (
										<RankSelect value={priority ?? null} onChange={(val) => setAktivitasPriority(opt, val)} disabled={progress.assignmentDone} />
									)}
								</div>
							);
						})}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
						<input
							type="text"
							placeholder="Aktivitas lainnya..."
							className="rounded border p-2 text-sm"
							value={a.aktivitas_lainnya}
							onChange={e => setSesi1Assignment(p => ({ ...p, aktivitas_lainnya: e.target.value }))}
							disabled={progress.assignmentDone}
						/>
							<div>
								<select
									className="w-full rounded border p-2 text-sm"
									value={a.aktivitas_lainnya_priority}
									onChange={e => setSesi1Assignment(p => ({ ...p, aktivitas_lainnya_priority: e.target.value }))}
									disabled={progress.assignmentDone || !a.aktivitas_lainnya}
								>
									<option value="">Prioritas</option>
									{Array.from({ length: 10 }).map((_, i) => (
										<option key={i+1} value={String(i + 1)}>{i + 1}</option>
									))}
								</select>
							</div>
					</div>
					<div className="text-xs text-muted-foreground">
						Dipilih: {aktivitasSelectedCount} / minimal 3 {aktivitasPriorityConflict && <span className="text-red-600">(Prioritas duplikat)</span>}
					</div>
				</div>

				{/* 9. Kontak Darurat */}
				<div>
					<h4 className="font-semibold mb-2">9. Kontak Darurat</h4>
					<p className="text-xs text-muted-foreground mb-3">Cantumkan nama & nomor / cara menghubungi (format singkat).</p>
					<div className="grid gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Teman dekat</label>
							<input type="text" className="w-full rounded border p-2 text-sm" placeholder="Nama / No / Handle" value={a.kontak_temandekat} onChange={e => setSesi1Assignment(p => ({ ...p, kontak_temandekat: e.target.value }))} disabled={progress.assignmentDone} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Keluarga</label>
							<input type="text" className="w-full rounded border p-2 text-sm" value={a.kontak_keluarga} onChange={e => setSesi1Assignment(p => ({ ...p, kontak_keluarga: e.target.value }))} disabled={progress.assignmentDone} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Dosen wali / konselor</label>
							<input type="text" className="w-full rounded border p-2 text-sm" value={a.kontak_wali} onChange={e => setSesi1Assignment(p => ({ ...p, kontak_wali: e.target.value }))} disabled={progress.assignmentDone} />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Layanan darurat kampus / RS</label>
							<input type="text" className="w-full rounded border p-2 text-sm" value={a.kontak_layanan} onChange={e => setSesi1Assignment(p => ({ ...p, kontak_layanan: e.target.value }))} disabled={progress.assignmentDone} />
						</div>
					</div>
				</div>

				{/* 10. Lingkungan Aman */}
				<div>
					<h4 className="font-semibold mb-2">10. Lingkungan Aman atau Tempat untuk Menenangkan Diri</h4>
					<p className="text-xs text-muted-foreground mb-3">Pilih minimal 3 dengan prioritas unik (1 = paling sering / efektif Anda gunakan).</p>
					<div className="space-y-2 mb-2">
						{LINGKUNGAN_OPTIONS.map(opt => {
							const selected = a.lingkungan[opt] !== undefined;
							const priority = a.lingkungan[opt];
							return (
								<div key={opt} className="flex items-center gap-3 bg-muted/40 rounded p-2">
									<label className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
										<input
											type="checkbox"
											checked={selected}
											onChange={() => setLingkunganPriority(opt, selected ? null : (Object.keys(a.lingkungan).length + 1))}
											disabled={progress.assignmentDone}
										/>
										<span>{opt}</span>
									</label>
									{selected && (
										<RankSelect value={priority ?? null} onChange={(val) => setLingkunganPriority(opt, val)} disabled={progress.assignmentDone} />
									)}
								</div>
							);
						})}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
						<input
							type="text"
							placeholder="Tempat lainnya..."
							className="rounded border p-2 text-sm"
							value={a.lingkungan_lainnya}
							onChange={e => setSesi1Assignment(p => ({ ...p, lingkungan_lainnya: e.target.value }))}
							disabled={progress.assignmentDone}
						/>
							<div>
								<select
									className="w-full rounded border p-2 text-sm"
									value={a.lingkungan_lainnya_priority}
									onChange={e => setSesi1Assignment(p => ({ ...p, lingkungan_lainnya_priority: e.target.value }))}
									disabled={progress.assignmentDone || !a.lingkungan_lainnya}
								>
									<option value="">Prioritas</option>
									{Array.from({ length: 10 }).map((_, i) => (
										<option key={i+1} value={String(i + 1)}>{i + 1}</option>
									))}
								</select>
							</div>
					</div>
					<div className="text-xs text-muted-foreground">
						Dipilih: {lingkunganSelectedCount} / minimal 3 {lingkunganPriorityConflict && <span className="text-red-600">(Prioritas duplikat)</span>}
					</div>
				</div>

				{/* 11. Tindakan Saat Pengalaman Datang */}
				<div>
					<h4 className="font-semibold mb-2">11. Tindakan Anda Ketika Pengalaman Tersulit Datang</h4>
					<p className="text-xs text-muted-foreground mb-2">Tuliskan langkah berurutan yang ingin Anda lakukan. Misal: 1) Tarik napas 3x dalam, 2) Hubungi X, 3) Pindah ke tempat aman, 4) Lakukan aktivitas prioritas 1, dll.</p>
					<textarea
						rows={5}
						className="w-full rounded border p-2 text-sm"
						placeholder="Tuliskan rencana tindakan langkah demi langkah..."
						value={a.tindakan_saat_datang}
						onChange={e => setSesi1Assignment(p => ({ ...p, tindakan_saat_datang: e.target.value }))}
						disabled={progress.assignmentDone}
					/>
				</div>

				<div className="flex flex-wrap items-center gap-3 pt-2 border-t">
					<Button
						className="bg-indigo-600 hover:bg-indigo-700"
						disabled={!sesi1Valid || progress.assignmentDone}
						onClick={handleSubmitAssignment}
					>
						{progress.assignmentDone ? 'Terkirim' : 'Kirim & Tandai Selesai'}
					</Button>
					<Badge className={progress.assignmentDone ? 'bg-green-600 text-white' : 'bg-indigo-200 text-indigo-900'}>
						{progress.assignmentDone ? 'Sudah selesai' : 'Belum selesai'}
					</Badge>
					{autoSavedAt && !progress.assignmentDone && (
						<span className="text-xs text-muted-foreground">Draft tersimpan otomatis: {autoSavedAt}</span>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Helmet>
				<title>{title ? `Sesi ${sessionNumber} - ${title} | Hibrida Naratif CBT` : 'Portal Sesi'} | Mind MHIRC</title>
				<meta name="description" content={title ? `Portal intervensi Hibrida Naratif CBT sesi ${sessionNumber}: ${title}` : 'Portal intervensi sesi Hibrida Naratif CBT'} />
				<link rel="canonical" href={`https://mind-mhirc.my.id/hibrida-cbt/intervensi/sesi/${sessionNumber}`} />
			</Helmet>
			<Navbar />
			<main className="flex-1 pt-24">
				<section className="relative overflow-hidden rounded">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800" />
					<div className="absolute inset-0 opacity-10">
						<img src={heroImage} alt="Hibrida Naratif CBT Background" className="w-full h-full object-cover" />
					</div>
					<div className="relative container mx-auto px-6 py-14">
						<div className="max-w-5xl mx-auto">
							<div className="flex items-center justify-between mb-6">
								<Link to="/hibrida-cbt/intervensi-hibrida" className="text-white/90 hover:underline text-sm">← Kembali</Link>
								<Badge className="bg-white/20 backdrop-blur text-white border border-white/30" variant="secondary">Portal Sesi</Badge>
							</div>
							<h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-sm">
								{title ? `Sesi ${sessionNumber}: ${title}` : 'Sesi tidak ditemukan'}
							</h1>
							<p className="text-indigo-100 max-w-2xl">Portal intervensi dengan desain khusus Hibrida Naratif CBT — alur progresif & fokus pada konstruksi narasi adaptif.</p>
						</div>
					</div>
				</section>
				<section className="py-12">
					<div className="container mx-auto px-6 max-w-6xl">
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
							{/* Left Column: Tips above Sticky Progress */}
							<div className="lg:col-span-1 space-y-6">
								<div className="rounded-xl border border-indigo-100 dark:border-indigo-800 p-4 text-xs leading-relaxed bg-white/60 dark:bg-indigo-950/30 backdrop-blur">
									<p className="font-semibold mb-1 text-indigo-700 dark:text-indigo-200">Tips</p>
									<p>Simpan rencana tindakan (#11) di tempat mudah diakses (catatan ponsel) setelah selesai.</p>
								</div>
								<div className="rounded-xl bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/40 border border-indigo-100 dark:border-indigo-800 p-5 shadow-sm sticky top-28">
									<h3 className="font-semibold mb-4 text-sm tracking-wide text-indigo-700 dark:text-indigo-300">PROGRES SESI</h3>
									<div className="mb-4">
										<div className="h-3 w-full bg-indigo-100 dark:bg-indigo-800/40 rounded-full overflow-hidden">
											<div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all" style={{ width: `${percent}%` }} />
										</div>
										<div className="mt-2 text-xs text-indigo-700 dark:text-indigo-200 font-medium">{percent}% selesai</div>
									</div>
									<ol className="space-y-3 text-xs">
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.sessionOpened ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'}`}>✓</span>
											<span>Sesi Dibuka</span>
										</li>
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.meetingDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'}`}>1</span>
											<span>Pertemuan Daring</span>
										</li>
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${(progress.meetingDone && hasReadGuide) || progress.assignmentDone ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'}`}>2</span>
											<span>Panduan & Penugasan</span>
										</li>
										<li className="flex items-center gap-2">
											<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${progress.counselorResponse ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'}`}>3</span>
											<span>Response Konselor</span>
										</li>
									</ol>
								</div>
                
							</div>
							{/* Main Content */}
							<div className="lg:col-span-3 space-y-8">
								{/* Pertemuan Daring */}
							<Card className="border-indigo-100 dark:border-indigo-800 shadow-sm overflow-hidden">
								<div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 p-1">
									<div className="bg-white dark:bg-gray-900 rounded-sm">
										<CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30">
											<div className="flex items-center gap-3">
												<div className="p-2 bg-indigo-600 rounded-lg">
													<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
													</svg>
												</div>
												<div>
													<CardTitle className="text-indigo-800 dark:text-indigo-200">Pertemuan Daring</CardTitle>
													<CardDescription>Sesi sinkron bersama fasilitator</CardDescription>
												</div>
											</div>
										</CardHeader>
										<CardContent className="p-6">
											{/* If super-admin and there are per-group schedules, show all groups */}
											{dataLoading ? (
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
											) : isSuperAdmin && schedule?.has_group_schedules && allGroupSchedules ? (
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
													{/* Participant view: show selected schedule plus group badge if applicable */}
													<div className="mb-2 flex items-center gap-2">
														{schedule?.has_group_schedules && (groupAssignment === 'A' || groupAssignment === 'B' || groupAssignment === 'C') && (
															<span className="px-2 py-0.5 text-[11px] rounded-full bg-purple-100 text-purple-800 border border-purple-200">Grup {groupAssignment}</span>
														)}
													</div>
													{dataLoading ? (
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
															{Array.from({ length: 3 }).map((_, i) => (
																<div key={i} className="flex items-center gap-2 text-sm animate-pulse">
																	<div className="w-2 h-2 bg-gray-300 rounded-full" />
																	<div className="h-3 bg-gray-200 rounded w-20" />
																	<div className="h-3 bg-gray-200 rounded w-24" />
																</div>
															))}
														</div>
													) : (
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
															<div className="flex items-center gap-2 text-sm">
																<div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
																<span className="text-muted-foreground">Tanggal:</span>
																<span className="font-medium">{schedule?.date || 'TBD'}</span>
															</div>
															<div className="flex items-center gap-2 text-sm">
																<div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
																<span className="text-muted-foreground">Waktu:</span>
																<span className="font-medium">{schedule?.time || 'TBD'}</span>
															</div>
															<div className="flex items-center gap-2 text-sm">
																<div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
																<span className="text-muted-foreground">Link:</span>
																{schedule?.link ? (
																	<a className="text-indigo-700 underline font-medium" href={normalizeHref(schedule.link)} target="_blank" rel="noreferrer">Tersedia</a>
																) : <span className="font-medium">TBD</span>}
															</div>
														</div>
													)}
												</>
											)}
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
												<div className="flex flex-wrap items-center gap-3">
													<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!schedule?.link} onClick={() => schedule?.link && window.open(schedule.link, '_blank')}>
														<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-7V8a3 3 0 00-3-3H8a3 3 0 00-3 3v1M9 21h6" />
														</svg>
														Mulai Pertemuan
													</Button>
													<Button 
														size="sm" 
														variant={progress.meetingDone ? "destructive" : "outline"}
														onClick={() => progress.meetingDone ? undefined : markMeetingDone()}
														disabled={progress.assignmentDone}
													>
														{progress.meetingDone ? 'Sudah Selesai' : 'Tandai Selesai'}
													</Button>
												</div>
												<div className="sm:ml-auto">
													<Badge className={progress.meetingDone ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'}>
														{progress.meetingDone ? '✓ Sudah selesai' : '⏳ Belum selesai'}
													</Badge>
												</div>
											</div>
										</CardContent>
									</div>
								</div>
							</Card>
							{/* Panduan Sesi */}
							<Card className="border-indigo-100 dark:border-indigo-800 shadow-sm">
								<CardHeader>
									<CardTitle>Panduan Sesi</CardTitle>
									<CardDescription>Baca & centang konfirmasi sebelum mengerjakan penugasan.</CardDescription>
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

							{/* Guidance Materials - always show the container with placeholder if empty */}
							<GuidanceMaterialsDisplay
								guidance_text={schedule?.guidance_text}
								guidance_pdf_url={schedule?.guidance_pdf_url}
								guidance_audio_url={schedule?.guidance_audio_url}
								guidance_video_url={schedule?.guidance_video_url}
								guidance_links={schedule?.guidance_links}
							/>

							{/* Penugasan */}
							<Card className="border-indigo-100 dark:border-indigo-800 shadow-md">
								<CardHeader>
									<CardTitle>Penugasan</CardTitle>
									<CardDescription>Refleksi & struktur awal Crisis Response Plan</CardDescription>
								</CardHeader>
								<CardContent>
									{!hasReadGuide && !progress.assignmentDone && (
										<div className="mb-4 p-3 rounded border border-indigo-300 bg-indigo-50 text-indigo-900 text-sm">Penugasan terkunci. Baca panduan lalu centang konfirmasi.</div>
									)}
									<div className={(!hasReadGuide && !progress.assignmentDone) ? 'pointer-events-none opacity-60 select-none' : ''}>
										{renderAssignment()}
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

export default HibridaPortalSesi;
