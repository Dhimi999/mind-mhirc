import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Dialog dihapus, penugasan kini inline box
import heroImage from "@/assets/spiritual-cultural-hero.jpg";

// Progress keys
const PROGRESS_KEY = "spiritualInterventionProgress";

type SessionProgress = { meetingDone: boolean; assignmentDone: boolean };

const sessionTitles: Record<number, string> = {
  1: "Identitas Budaya Dan Makna Diri",
  2: "Spiritualitas Sebagai Pilar Harapan",
  3: "Ekspresi Emosi Melalui Budaya",
  4: "Mengurai Stigma Melalui Nilai Komunitas",
  5: "Peran Komunitas Dalam Dukungan Emosional",
  6: "Ritual Dan Tradisi Sebagai Media Kesembuhan",
  7: "Literasi Spiritual Dan Budaya Kesehatan Jiwa",
  8: "Komitmen Hidup Dan Prospek Masa Depan",
};

const meetingSchedule: Record<number, { date: string; time: string; link: string } | undefined> = {
  1: { date: "2025-10-05", time: "19:30 WIB", link: "https://meet.google.com/sesi-1" },
  2: { date: "2025-10-12", time: "19:30 WIB", link: "https://meet.google.com/sesi-2" },
  3: { date: "2025-10-19", time: "19:30 WIB", link: "https://meet.google.com/sesi-3" },
  4: { date: "2025-10-26", time: "19:30 WIB", link: "https://meet.google.com/sesi-4" },
  5: { date: "2025-11-02", time: "19:30 WIB", link: "https://meet.google.com/sesi-5" },
  6: { date: "2025-11-09", time: "19:30 WIB", link: "https://meet.google.com/sesi-6" },
  7: { date: "2025-11-16", time: "19:30 WIB", link: "https://meet.google.com/sesi-7" },
  8: { date: "2025-11-23", time: "19:30 WIB", link: "https://meet.google.com/sesi-8" },
};

const IntervensiPortalSesi: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const sessionNumber = parseInt(sesi || "0", 10);
  const title = sessionTitles[sessionNumber];
  const materiRelated: Record<number, string> = {
    1: "prinsip-dasar",
    2: "regulasi-emosi-budaya",
    3: "regulasi-emosi-budaya",
    4: "komunitas-dukungan",
    5: "komunitas-dukungan",
    6: "kearifan-lokal",
    7: "prinsip-dasar",
    8: "regulasi-emosi-budaya",
  };

  const [progressMap, setProgressMap] = useState<Record<number, SessionProgress>>({});
  const progress = progressMap[sessionNumber] || { meetingDone: false, assignmentDone: false };
  const [hasReadGuide, setHasReadGuide] = useState(false);
  const [assignmentItems, setAssignmentItems] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setProgressMap(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
    } catch {}
  }, [progressMap]);

  const schedule = meetingSchedule[sessionNumber];
  const percent = useMemo(() => (progress.meetingDone ? 50 : 0) + (progress.assignmentDone ? 50 : 0), [progress]);

  // Paraphrased guidance aligned with workbook (ringkas, non-verbatim)
  const renderGuide = () => {
    if (!progress.meetingDone) return null;
    switch (sessionNumber) {
      case 1:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Sesi pengantar untuk memahami pemicu, reaksi, dan pola yang terjadi saat menghadapi situasi sulit. Tujuannya memperjelas rantai peristiwa agar Anda bisa menyiapkan respon yang lebih sehat.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Kenali momen-momen kunci dan makna yang Anda berikan pada peristiwa.</li>
              <li>Catat pikiran/emosi yang dominan serta respon yang Anda coba.</li>
            </ul>
            <div className="mt-2">
              <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/Contoh Sesi 1.pdf" target="_blank" rel="noreferrer">Contoh Sesi 1 (PDF)</a>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Latihan ekspresi emosi melalui medium budaya seperti motif batik, teater cerita rakyat, atau puisi tradisional. Pilih salah satu atau kombinasi yang paling cocok.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Batik ekspresif digital: gambarkan motif/warna yang mewakili emosi Anda, lalu tulis refleksi singkat.</li>
              <li>Teater cerita rakyat: hayati karakter yang relevan dan catat wawasan dari perannya.</li>
              <li>Puisi tradisional (pantun/syair/gurindam): tuangkan perasaan dalam bentuk kata-kata singkat bermakna.</li>
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Fokus pada stigma kesehatan jiwa dan peran nilai komunitas untuk menguranginya melalui diskusi reflektif dan rancangan solusi bersama.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Renungkan kisah penyintas dan dampak stigma pada keseharian.</li>
              <li>Diskusikan langkah komunal yang realistis untuk edukasi dan dukungan.</li>
              <li>Susun rencana aksi pribadi sederhana untuk lingkungan Anda.</li>
            </ul>
          </div>
        );
      case 5:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Menguatkan jejaring dukungan emosional: petakan orang/komunitas kunci dan latih check-in yang aman serta empatik.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Buat peta jaringan sosial dan tandai sumber dukungan.</li>
              <li>Praktik kelompok dukungan (mendengar-aktif, validasi, kalimat suportif).</li>
              <li>Refleksi cara memperkuat dukungan di lingkungan terdekat.</li>
            </ul>
          </div>
        );
      case 6:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Mengenal ritual/tradisi yang aman dan bermakna sebagai sarana ketenangan batin. Utamakan persetujuan diri dan keselamatan.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Ikuti simulasi singkat (mis. doa/meditasi bernuansa lokal) dan amati pengaruhnya.</li>
              <li>Diskusikan makna simbolik dan cara integrasi kecil dalam rutinitas.</li>
              <li>Refleksikan perubahan emosi sebelum/sesudah praktik.</li>
            </ul>
          </div>
        );
      case 7:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Literasi tanda risiko bunuh diri dan dukungan berbasis budaya/komunitas. Tujuannya meningkatkan kepekaan dan respons awal yang aman.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Kenali indikator umum (perubahan perilaku, putus asa, penarikan diri).</li>
              <li>Susun pendekatan berbasis keluarga/komunitas dan rujukan profesional bila perlu.</li>
              <li>Bahas studi kasus secara empatik dan manusiawi.</li>
            </ul>
          </div>
        );
      case 8:
        return (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Menyusun komitmen hidup dan prospek masa depan. Gunakan ritual simbolik sederhana dan afirmasi untuk menopang motivasi.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Surat untuk diri di masa depan: harapan, langkah, dan dukungan yang dibutuhkan.</li>
              <li>Ritual simbolik “api harapan” (visualisasi/niat) untuk melepas ragu dan menguatkan komitmen.</li>
              <li>Afirmasi pribadi/kelompok dan rencana tindak lanjut yang terukur.</li>
            </ul>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Panduan sesi akan tersedia setelah pertemuan daring diselesaikan.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{title ? `Portal Sesi ${sessionNumber} - ${title}` : "Portal Sesi"} | Mind MHIRC</title>
        <meta name="description" content={title ? `Portal Intervensi untuk sesi ${sessionNumber}: ${title}.` : "Portal Intervensi Sesi."} />
        <link rel="canonical" href={`https://mind-mhirc.my.id/spiritual-budaya/intervensi/sesi/${sessionNumber}`} />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24">
        <section className="relative bg-gradient-to-b from-muted/50 to-background overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Spiritual & Budaya Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-12">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya" className="text-amber-700 hover:underline text-sm">← Kembali ke Intervensi</Link>
                <Badge className="bg-amber-100 text-amber-800" variant="secondary">Portal Sesi</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                {title ? `Sesi ${sessionNumber}: ${title}` : "Sesi tidak ditemukan"}
              </h1>
              <p className="text-muted-foreground">Kelola pertemuan daring dan penugasan Anda dari satu tempat.</p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6 max-w-5xl">
            {/* Progress ringkas */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Progres Sesi</CardTitle>
                <CardDescription>Status penyelesaian dua unsur sesi.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-muted h-2 rounded">
                    <div className="h-2 rounded bg-amber-600" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{percent}%</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Pertemuan Daring */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Pertemuan Daring</CardTitle>
                  <CardDescription>Sesi sinkron dengan fasilitator</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Tanggal: {schedule?.date || 'TBD'}</p>
                    <p>Waktu: {schedule?.time || 'TBD'}</p>
                    <p>
                      Link: {schedule?.link ? (
                        <a className="text-amber-700 underline" href={schedule.link} target="_blank" rel="noreferrer">Buka tautan</a>
                      ) : 'TBD'}
                    </p>
                  </div>
                  <div className="pt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => schedule?.link && window.open(schedule.link, '_blank')}
                      disabled={!schedule?.link}
                    >
                      Mulai Pertemuan
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setProgressMap(prev => ({
                        ...prev,
                        [sessionNumber]: { ...(prev[sessionNumber] || { meetingDone: false, assignmentDone: false }), meetingDone: true }
                      }))}
                    >
                      Tandai Selesai
                    </Button>
                    <Badge className={progress.meetingDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-900'}>
                      {progress.meetingDone ? 'Sudah selesai' : 'Belum selesai'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Box 2: Panduan Sesi */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Panduan Sesi</CardTitle>
                  <CardDescription>Baca panduan dan unduh berkas pendukung sebelum mengerjakan penugasan.</CardDescription>
                </CardHeader>
                <CardContent>
                  {!progress.meetingDone ? (
                    <div className="p-4 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm">
                      Panduan Sesi terkunci. Silakan selesaikan terlebih dahulu Pertemuan Daring, lalu kembali ke halaman ini.
                    </div>
                  ) : (
                    <>
                      {/* Paraphrased guide per sesi */}
                      <div className="mb-4">{renderGuide()}</div>

                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>
                          <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/panduan-penugasan.txt" download>
                            Panduan Penugasan (TXT)
                          </a>
                        </li>
                        <li>
                          <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/lembar-kerja.docx" download>
                            Lembar Kerja (DOCX)
                          </a>
                        </li>
                        <li>
                          <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/Buku Kerja Intervensi Digital Berbasis Spiritual dan Budaya.pdf" target="_blank" rel="noreferrer">
                            Buku Kerja Intervensi Digital Berbasis Spiritual & Budaya (PDF)
                          </a>
                        </li>
                        <li>
                          <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/Contoh Sesi 1.pdf" target="_blank" rel="noreferrer">
                            Contoh Sesi 1 (PDF)
                          </a>
                        </li>
                        <li>
                          <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/Buku Kerja Intervensi Digital Berbasis Spiritual dan Budaya.pdf" download>
                            Buku Kerja Intervensi Digital Berbasis Budaya dan Spiritual (PDF)
                          </a>
                        </li>
                      </ul>

                      {sessionNumber === 1 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Contoh Jawaban — Viewer PDF</p>
                            <a
                              className="text-amber-700 underline text-sm"
                              href="/downloads/spiritual-budaya/Contoh Sesi 1.pdf"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Buka/Unduh PDF
                            </a>
                          </div>
                          <div className="w-full border rounded bg-background">
                            <object
                              data="/downloads/spiritual-budaya/Contoh Sesi 1.pdf"
                              type="application/pdf"
                              className="w-full h-96 md:h-[600px]"
                            >
                              <p className="p-4 text-sm text-muted-foreground">
                                Viewer PDF tidak dapat dimuat di browser Anda. Silakan klik{' '}
                                <a className="text-amber-700 underline" href="/downloads/spiritual-budaya/Contoh Sesi 1.pdf" target="_blank" rel="noreferrer">tautan ini</a>
                                {' '}untuk membuka atau mengunduh file.
                              </p>
                            </object>
                          </div>
                        </div>
                      )}

                      {/* Checkbox dipindah ke bawah viewer */}
                      <div className="mt-4 text-sm">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={progress.assignmentDone || hasReadGuide}
                            onChange={() => setHasReadGuide(v => !v)}
                            disabled={progress.assignmentDone}
                          />
                          <span>Saya telah membaca panduan dan memahami instruksi penugasan.</span>
                        </label>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Box 3: Penugasan */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Penugasan</CardTitle>
                  <CardDescription>Latihan terstruktur pasca pertemuan</CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasReadGuide && (
                    <div className="mb-4 p-3 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm">
                      Penugasan terkunci. Silakan baca dan centang Panduan Sesi terlebih dahulu.
                    </div>
                  )}
                  <div className="space-y-4">
                    {assignmentItems.map((val, idx) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium mb-1">Item {idx + 1}</label>
                        <textarea
                          className="w-full rounded border p-2 text-sm"
                          rows={3}
                          placeholder={`Tulis jawaban untuk item ${idx + 1}...`}
                          value={val}
                          onChange={(e) => {
                            const next = [...assignmentItems];
                            next[idx] = e.target.value;
                            setAssignmentItems(next);
                          }}
                          disabled={!hasReadGuide || progress.assignmentDone}
                          required={idx === 0}
                        />
                        {assignmentItems.length > 1 && (
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAssignmentItems(items => items.filter((_, i) => i !== idx))}
                              disabled={!hasReadGuide || progress.assignmentDone}
                            >
                              Hapus Item
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setAssignmentItems(items => [...items, ""])}
                        disabled={!hasReadGuide || progress.assignmentDone}
                      >
                        Tambah Item
                      </Button>
                      <Badge className={progress.assignmentDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-900'}>
                        {progress.assignmentDone ? 'Sudah selesai' : 'Belum selesai'}
                      </Badge>
                    </div>

                    <div>
                      <Button
                        className="bg-amber-600 hover:bg-amber-700"
                        disabled={!hasReadGuide || progress.assignmentDone}
                        onClick={async () => {
                          const hasContent = assignmentItems.some(t => t && t.trim().length > 0);
                          if (!hasContent) return;
                          await new Promise(r => setTimeout(r, 400));
                          setProgressMap(prev => ({
                            ...prev,
                            [sessionNumber]: { ...(prev[sessionNumber] || { meetingDone: false, assignmentDone: false }), assignmentDone: true }
                          }));
                        }}
                      >
                        Kirim Tugas
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Materi terkait */}
            {materiRelated[sessionNumber] && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Materi Terkait</CardTitle>
                  <CardDescription>Baca materi pendukung untuk sesi ini.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/spiritual-budaya/materi/${materiRelated[sessionNumber]}`}>
                    <Button variant="ghost" className="text-amber-700 hover:text-amber-800">Lihat Materi Terkait →</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default IntervensiPortalSesi;
