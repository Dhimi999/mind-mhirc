
import { Brain, Users, Heart, BookOpen, MessageSquare, BarChart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";

const Services = () => {
  // Sample services data
  const services = [
    {
      id: "1",
      title: "Konsultasi Kesehatan Jiwa",
      description: "Layanan konsultasi kesehatan jiwa profesional untuk individu, pasangan, keluarga, dan kelompok.",
      icon: Brain,
      color: "bg-primary"
    },
    {
      id: "2",
      title: "Workshop & Pelatihan",
      description: "Program pelatihan dan workshop untuk meningkatkan keterampilan manajemen stres dan kesejahteraan mental.",
      icon: Users,
      color: "bg-secondary"
    },
    {
      id: "3",
      title: "Program Dukungan",
      description: "Grup dukungan untuk berbagai isu kesehatan mental seperti depresi, kecemasan, dan kesulitan adaptasi.",
      icon: Heart,
      color: "bg-accent-600"
    },
    {
      id: "4",
      title: "Edukasi & Literasi",
      description: "Program edukasi dan peningkatan literasi kesehatan mental untuk sekolah, perusahaan, dan komunitas.",
      icon: BookOpen,
      color: "bg-teal-500"
    },
    {
      id: "5",
      title: "Intervensi Krisis",
      description: "Layanan dukungan dan intervensi untuk situasi krisis mental dan emosional.",
      icon: MessageSquare,
      color: "bg-rose-500"
    },
    {
      id: "6",
      title: "Riset & Evaluasi",
      description: "Layanan riset dan evaluasi program kesehatan mental untuk lembaga, organisasi, dan institusi.",
      icon: BarChart,
      color: "bg-blue-500"
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto text-center fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Layanan Kami</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Kami menyediakan berbagai layanan komprehensif untuk mendukung kesehatan mental
                dan kesejahteraan masyarakat Indonesia dengan pendekatan berbasis bukti dan peka budaya.
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
                Program khusus yang dirancang untuk memenuhi kebutuhan spesifik berbagai kelompok masyarakat,
                seperti anak-anak, remaja, dewasa, dan lansia.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 fade-in">
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">Mind for Kids</h3>
                <p className="text-muted-foreground mb-6">
                  Program intervensi dini untuk anak-anak yang mengalami kesulitan perilaku, emosi, 
                  atau perkembangan. Menggunakan pendekatan bermain dan kreatif untuk membantu anak-anak
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
                  Program dukungan untuk remaja yang menghadapi tantangan kesehatan mental seperti
                  kecemasan, depresi, masalah penyesuaian, dan tekanan akademik. Dengan pendekatan yang
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
              </div>
              
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-semibold mb-4">Mind for Workplace</h3>
                <p className="text-muted-foreground mb-6">
                  Program kesehatan mental di tempat kerja yang komprehensif untuk membantu 
                  organisasi menciptakan lingkungan kerja yang sehat secara mental dan 
                  meningkatkan produktivitas.
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
                  Program untuk mendukung kesehatan mental dan kognitif pada lansia, 
                  membantu mereka mengatasi tantangan penuaan dan mempertahankan kualitas hidup.
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
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto fade-in">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Butuh Layanan Khusus?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Kami dapat menyesuaikan layanan kami untuk memenuhi kebutuhan spesifik Anda, 
                organisasi, atau komunitas. Hubungi kami untuk mendiskusikan kebutuhan Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/about#contact" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium">
                  Hubungi Kami
                </a>
                <a href="/tests" className="bg-muted text-foreground px-6 py-3 rounded-lg hover:bg-muted/80 transition-colors font-medium">
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
