import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";

const assignmentGuide: Record<number, { title: string; tasks: { title: string; detail: string }[]; note: string }> = {
  1: {
    title: "Identitas Budaya Dan Makna Diri",
    tasks: [
      { title: "Jurnal Identitas", detail: "Tulis 3 nilai budaya yang paling berarti bagi Anda dan contoh nyata dalam hidup." },
      { title: "Peta Dukungan", detail: "Gambar peta orang/komunitas yang menjadi dukungan Anda." },
    ],
    note: "Sederhanakan bila terasa berat; kualitas refleksi lebih penting dari kuantitas."
  },
  2: {
    title: "Spiritualitas Sebagai Pilar Harapan",
    tasks: [
      { title: "Doa/Mantra Harian", detail: "Pilih satu doa/mantra singkat, praktikkan 3–5 menit selama 5 hari." },
      { title: "Jurnal Harapan", detail: "Catat momen kecil yang menumbuhkan harapan setiap hari." },
    ],
    note: "Hormati kenyamanan Anda; pilih bentuk praktik yang selaras keyakinan."
  },
  3: {
    title: "Ekspresi Emosi Melalui Budaya",
    tasks: [
      { title: "Ekspresi Kreatif", detail: "Buat karya kecil (puisi, sketsa, musik) untuk menyalurkan emosi minggu ini." },
      { title: "Refleksi Emosi", detail: "Tulis 3 situasi pemicu emosi dan respon yang lebih sehat yang Anda coba lakukan." },
    ],
    note: "Tidak ada penilaian estetika; fokus pada proses dan kejujuran emosi."
  },
  4: {
    title: "Mengurai Stigma Melalui Nilai Komunitas",
    tasks: [
      { title: "Narasi Harapan", detail: "Rumuskan ulang satu pikiran stigma menjadi pesan yang lebih manusiawi dan penuh harapan." },
      { title: "Percakapan Aman", detail: "Latih 5 menit komunikasi empatik dengan teman/keluarga yang aman." },
    ],
    note: "Utamakan keselamatan dan batasan pribadi."
  },
  5: {
    title: "Peran Komunitas Dalam Dukungan Emosional",
    tasks: [
      { title: "Check-in Komunitas", detail: "Lakukan check-in singkat dengan 1–2 orang tepercaya pekan ini." },
      { title: "Aset Komunitas", detail: "Catat 3 aset komunitas yang bisa Anda manfaatkan (mis. posyandu, kelompok belajar)." },
    ],
    note: "Mulai dari lingkar terdekat yang paling aman."
  },
  6: {
    title: "Ritual Dan Tradisi Sebagai Media Kesembuhan",
    tasks: [
      { title: "Ritual Aman", detail: "Pilih satu ritual sederhana (syukur, doa singkat) dan lakukan 3 kali pekan ini." },
      { title: "Catatan Dampak", detail: "Tuliskan perubahan kecil pada emosi/energi setelah ritual." },
    ],
    note: "Hindari praktik yang berisiko; utamakan persetujuan diri."
  },
  7: {
    title: "Literasi Spiritual Dan Budaya Kesehatan Jiwa",
    tasks: [
      { title: "Sumber Tepercaya", detail: "Pilih 1–2 sumber bacaan kredibel; ringkas 3 poin utama yang Anda dapat." },
      { title: "Anti‑Stigma", detail: "Tulis 3 kalimat anti‑stigma yang manusiawi untuk diri/komunitas." },
    ],
    note: "Filter informasi; hindari klaim tanpa dasar."
  },
  8: {
    title: "Komitmen Hidup Dan Prospek Masa Depan",
    tasks: [
      { title: "Rencana 4M", detail: "Susun kebiasaan 4M (Mudah, Menarik, Manfaat, Menular) untuk 2 minggu ke depan." },
      { title: "Jembatan Dukungan", detail: "Daftar orang/tempat yang akan Anda hubungi saat butuh bantuan." },
    ],
    note: "Rayakan kemajuan kecil; realistis dan fleksibel."
  },
};

const IntervensiPenugasan: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const sessionNumber = parseInt(sesi || "0", 10);
  const data = assignmentGuide[sessionNumber];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{data ? `Penugasan Sesi ${sessionNumber} - ${data.title}` : "Penugasan"} | Mind MHIRC</title>
        <meta name="description" content={data ? `Penugasan terstruktur untuk sesi ${sessionNumber}: ${data.title}.` : "Penugasan intervensi."} />
        <link rel="canonical" href={`https://mind-mhirc.my.id/spiritual-budaya/intervensi/sesi/${sessionNumber}/penugasan`} />
      </Helmet>

      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative bg-gradient-to-b from-muted/50 to-background overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Spiritual & Budaya Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Link to="/spiritual-budaya" className="text-amber-700 hover:underline text-sm">← Kembali ke Intervensi</Link>
                <Badge className="bg-amber-100 text-amber-800" variant="secondary">Penugasan</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                {data ? `Sesi ${sessionNumber}: ${data.title}` : "Sesi tidak ditemukan"}
              </h1>
              {data && (
                <p className="text-muted-foreground text-lg mb-8">{data.note}</p>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            {!data ? (
              <Card>
                <CardHeader>
                  <CardTitle>Data sesi tidak ditemukan</CardTitle>
                  <CardDescription>Periksa nomor sesi pada URL.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/spiritual-budaya"><Button variant="default" className="bg-amber-600 hover:bg-amber-700">Kembali</Button></Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {data.tasks.map((t, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-xl">{t.title}</CardTitle>
                      <CardDescription>{t.detail}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IntervensiPenugasan;
