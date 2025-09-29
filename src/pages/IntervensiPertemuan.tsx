import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";

const sessionInfo: Record<number, { title: string; objectives: string[]; liveNote: string }> = {
  1: {
    title: "Identitas Budaya Dan Makna Diri",
    objectives: [
      "Mengenali nilai dan identitas budaya personal",
      "Menghubungkan identitas dengan makna diri dan tujuan terapi",
      "Membangun harapan dan komitmen perubahan"
    ],
    liveNote: "Sesi pengantar, fokus pada orientasi dan harapan; pastikan keamanan psikologis."
  },
  2: {
    title: "Spiritualitas Sebagai Pilar Harapan",
    objectives: ["Menggali sumber harapan", "Menyusun latihan doa/mantra reflektif", "Memetakan dukungan spiritual"],
    liveNote: "Hindari pemaksaan keyakinan; hormati keragaman praktik."
  },
  3: {
    title: "Ekspresi Emosi Melalui Budaya",
    objectives: ["Mengenali emosi", "Menyalurkan melalui seni/ritual aman", "Membangun rencana coping"],
    liveNote: "Sediakan alternatif ekspresi bagi peserta dengan batasan tertentu."
  },
  4: {
    title: "Mengurai Stigma Melalui Nilai Komunitas",
    objectives: ["Memetakan narasi stigma", "Membangun narasi harapan", "Latihan komunikasi empatik"],
    liveNote: "Gunakan bahasa manusiawi; hindari label."
  },
  5: {
    title: "Peran Komunitas Dalam Dukungan Emosional",
    objectives: ["Pemetaan dukungan", "Check-in berkelompok", "Protokol rujukan"],
    liveNote: "Pastikan norma kerahasiaan dan saling menghargai."
  },
  6: {
    title: "Ritual Dan Tradisi Sebagai Media Kesembuhan",
    objectives: ["Identifikasi ritual aman", "Co-design praktik", "Monitoring dan penyesuaian"],
    liveNote: "Utamakan keselamatan dan persetujuan."
  },
  7: {
    title: "Literasi Spiritual Dan Budaya Kesehatan Jiwa",
    objectives: ["Edukasi ringan", "Keterampilan literasi informasi", "Anti-stigma"],
    liveNote: "Gunakan sumber tepercaya, hindari klaim berlebihan."
  },
  8: {
    title: "Komitmen Hidup Dan Prospek Masa Depan",
    objectives: ["Refleksi perjalanan", "Rencana pemeliharaan", "Sumber dukungan lanjutan"],
    liveNote: "Rayakan kemajuan kecil dan realistis."
  }
};

const IntervensiPertemuan: React.FC = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const sessionNumber = parseInt(sesi || "0", 10);
  const data = sessionInfo[sessionNumber];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{data ? `Pertemuan Daring Sesi ${sessionNumber} - ${data.title}` : "Pertemuan Daring"} | Mind MHIRC</title>
        <meta name="description" content={data ? `Pertemuan daring untuk sesi ${sessionNumber}: ${data.title}.` : "Pertemuan daring intervensi."} />
        <link rel="canonical" href={`https://mind-mhirc.my.id/spiritual-budaya/intervensi/sesi/${sessionNumber}/pertemuan`} />
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
                <Badge className="bg-amber-100 text-amber-800" variant="secondary">Pertemuan Daring</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                {data ? `Sesi ${sessionNumber}: ${data.title}` : "Sesi tidak ditemukan"}
              </h1>
              {data && (
                <p className="text-muted-foreground text-lg mb-8">{data.liveNote}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Tujuan Pertemuan</CardTitle>
                  <CardDescription>Ringkasan hasil yang diharapkan dari sesi ini.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {data.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
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

export default IntervensiPertemuan;
