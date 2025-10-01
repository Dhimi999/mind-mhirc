import {
  Brain,
  Users,
  Heart,
  BookOpen,
  MessageSquare,
  BarChart,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Helmet } from "react-helmet-async"; // Jangan lupa import

const Services = () => {
  // Helper to render multiple labels/links per program with consistent tones
  const ProgramActions = ({
    items
  }: {
    items: Array<{
      kind: "label" | "link";
      label: string;
      href?: string;
      tone?: "amber" | "pink" | "blue" | "emerald";
    }>;
  }) => {
    const tone = (t?: string) => {
      switch (t) {
        case "amber":
          return {
            label: "bg-amber-100 text-amber-700",
            button: "bg-amber-600 hover:bg-amber-700",
          };
        case "pink":
          return {
            label: "bg-pink-100 text-pink-700",
            button: "bg-pink-600 hover:bg-pink-700",
          };
        case "emerald":
          return {
            label: "bg-emerald-100 text-emerald-700",
            button: "bg-emerald-600 hover:bg-emerald-700",
          };
        case "blue":
          return {
            label: "bg-blue-100 text-blue-700",
            button: "bg-blue-600 hover:bg-blue-700",
          };
        default:
          return {
            label: "bg-gray-100 text-gray-800",
            button: "bg-gray-600 hover:bg-gray-700",
          };
      }
    };

    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {items.map((it, idx) => {
          const t = tone(it.tone);
          if (it.kind === "label") {
            return (
              <span
                key={idx}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${t.label}`}
              >
                {it.label}
              </span>
            );
          }
          return (
            <a
              key={idx}
              href={it.href || "#"}
              className={`inline-flex items-center text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium ${t.button}`}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    );
  };
  // Sample services data
  const services = [
    {
      id: "1",
      title: "Konsultasi Kesehatan Jiwa",
      description:
        "Layanan konsultasi kesehatan jiwa profesional untuk individu, pasangan, keluarga, dan kelompok.",
      icon: Brain,
      color: "bg-primary"
    },
    {
      id: "2",
      title: "Workshop & Pelatihan",
      description:
        "Program pelatihan dan workshop untuk meningkatkan keterampilan manajemen stres dan kesejahteraan mental.",
      icon: Users,
      color: "bg-secondary"
    },
    {
      id: "3",
      title: "Program Dukungan",
      description:
        "Grup dukungan untuk berbagai isu kesehatan mental seperti depresi, kecemasan, dan kesulitan adaptasi.",
      icon: Heart,
      color: "bg-accent-600"
    },
    {
      id: "4",
      title: "Edukasi & Literasi",
      description:
        "Program edukasi dan peningkatan literasi kesehatan mental untuk sekolah, perusahaan, dan komunitas.",
      icon: BookOpen,
      color: "bg-teal-500"
    },
    {
      id: "5",
      title: "Intervensi Krisis",
      description:
        "Layanan dukungan dan intervensi untuk situasi krisis mental dan emosional.",
      icon: MessageSquare,
      color: "bg-rose-500"
    },
    {
      id: "6",
      title: "Riset & Evaluasi",
      description:
        "Layanan riset dan evaluasi program kesehatan mental untuk lembaga, organisasi, dan institusi.",
      icon: BarChart,
      color: "bg-blue-500"
    },
    {
      id: "7",
      title: "Safe Mother",
      description:
        "Layanan Maternal Low-Intensity Psychological Intervention (MLIPI) untuk mendampingi Calon Ibu, Ibu Hamil, dan Ibu Pasca Melahirkan dengan layanan komprehensif mulai dari psikoedukasi hingga konsultasi.",
      icon: Heart,
      color: "bg-pink-500"
    },
    {
      id: "8",
      title: "Spiritual & Budaya",
      description:
        "Intervensi self compassion berbasis spiritual dan budaya untuk mendukung kesehatan mental melalui nilai-nilai kearifan lokal dan spiritualitas Indonesia.",
      icon: Sparkles,
      color: "bg-amber-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Judul yang kaya kata kunci dan jelas */}
        <title>Layanan Kesehatan Mental & Program Khusus - Mind MHIRC</title>

        {/* Deskripsi yang merangkum semua layanan yang ditawarkan */}
        <meta
          name="description"
          content="Jelajahi layanan kesehatan mental komprehensif dari Mind MHIRC, termasuk konsultasi jiwa, workshop, program dukungan, hingga program khusus untuk anak, remaja, dan perusahaan."
        />

        {/* --- URL Konsisten untuk Halaman 'Services' --- */}
        <link rel="canonical" href="https://mind-mhirc.my.id/services" />
        <meta property="og:url" content="https://mind-mhirc.my.id/services" />

        {/* --- Open Graph Tags (untuk Media Sosial) --- */}
        <meta
          property="og:title"
          content="Layanan Kesehatan Mental Profesional | Mind MHIRC"
        />
        <meta
          property="og:description"
          content="Temukan dukungan yang tepat melalui layanan konsultasi, workshop, dan program kesehatan mental khusus dari Mind MHIRC untuk individu, keluarga, dan organisasi."
        />
        <meta property="og:type" content="website" />
        {/* Ganti dengan URL gambar yang merepresentasikan layanan Anda */}
        <meta
          property="og:image"
          content="https://mind-mhirc.my.id/image-services.jpg"
        />

        {/* --- Twitter Card Tags (untuk Twitter) --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Layanan Kesehatan Mental Profesional | Mind MHIRC"
        />
        <meta
          name="twitter:description"
          content="Temukan dukungan yang tepat melalui layanan konsultasi, workshop, dan program kesehatan mental khusus dari Mind MHIRC untuk individu, keluarga, dan organisasi."
        />
        <meta
          name="twitter:image"
          content="https://mind-mhirc.my.id/image-services.jpg"
        />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto text-center fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Layanan Kami
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Kami menyediakan berbagai layanan komprehensif untuk mendukung
                kesehatan mental dan kesejahteraan masyarakat Indonesia dengan
                pendekatan berbasis bukti dan peka budaya.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  color={service.color}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Specialized Programs */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16 fade-in">
              <h2 className="text-3xl font-bold mb-4">Program Khusus</h2>
              <p className="text-muted-foreground">
                Program khusus yang dirancang untuk memenuhi kebutuhan spesifik
                berbagai kelompok masyarakat, seperti anak-anak, remaja, dewasa,
                dan lansia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 fade-in">
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">Mind for Kids</h3>
                <p className="text-muted-foreground mb-6">
                  Program intervensi dini untuk anak-anak yang mengalami
                  kesulitan perilaku, emosi, atau perkembangan. Menggunakan
                  pendekatan bermain dan kreatif untuk membantu anak-anak
                  mengembangkan keterampilan sosial-emosional.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Asesmen perkembangan komprehensif</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Terapi bermain dan seni</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Konsultasi dengan orang tua dan sekolah</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">Mind for Teens</h3>
                <p className="text-muted-foreground mb-6">
                  Program dukungan untuk remaja yang menghadapi tantangan
                  kesehatan mental seperti kecemasan, depresi, masalah
                  penyesuaian, dan tekanan akademik. Dengan pendekatan yang
                  relevan dan menarik bagi remaja.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Konseling individual dan kelompok</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Workshop keterampilan sosial dan emosional</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Program dukungan sebaya</span>
                  </li>
                </ul>
                <ProgramActions
                  items={[
                    { kind: "label", label: "Spiritual & Budaya", tone: "amber" },
                    { kind: "link", label: "Lihat Spiritual & Budaya", href: "/spiritual-budaya/pengantar", tone: "amber" },
                  ]}
                />
              </div>

              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">
                  Mind for Workplace
                </h3>
                <p className="text-muted-foreground mb-6">
                  Program kesehatan mental di tempat kerja yang komprehensif
                  untuk membantu organisasi menciptakan lingkungan kerja yang
                  sehat secara mental dan meningkatkan produktivitas.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Asesmen kesehatan mental organisasi</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Pelatihan manajemen stres untuk karyawan</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Konsultasi untuk kebijakan kesehatan mental</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">Mind for Elderly</h3>
                <p className="text-muted-foreground mb-6">
                  Program untuk mendukung kesehatan mental dan kognitif pada
                  lansia, membantu mereka mengatasi tantangan penuaan dan
                  mempertahankan kualitas hidup.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Latihan kognitif dan memori</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Dukungan untuk kondisi seperti demensia</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Aktivitas sosial dan program stimulasi mental</span>
                  </li>
                </ul>
              </div>

              {/* New: Mind for Mothers */}
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">Mind for Mothers</h3>
                <p className="text-muted-foreground mb-6">
                  Program pendampingan untuk calon ibu, ibu hamil, dan ibu pasca melahirkan dengan pendekatan Low-Intensity Psychological Intervention (MLIPI) yang komprehensif: dari psikoedukasi, dukungan komunitas, hingga konsultasi.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Psikoedukasi maternal yang praktis</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Konseling intensitas rendah (low-intensity)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Dukungan dan forum komunitas ibu</span>
                  </li>
                </ul>
                <ProgramActions
                  items={[
                    { kind: "label", label: "Safe Mother", tone: "pink" },
                    { kind: "link", label: "Buka Safe Mother", href: "/safe-mother", tone: "pink" },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto fade-in">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Butuh Layanan Khusus?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Kami dapat menyesuaikan layanan kami untuk memenuhi kebutuhan
                spesifik Anda, organisasi, atau komunitas. Hubungi kami untuk
                mendiskusikan kebutuhan Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/about#contact"
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Hubungi Kami
                </a>
                <a
                  href="/tests"
                  className="bg-muted text-foreground px-6 py-3 rounded-lg hover:bg-muted/80 transition-colors font-medium"
                >
                  Lihat Tes Mental
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
