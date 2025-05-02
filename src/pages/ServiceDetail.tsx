
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Brain, Users, Heart, BookOpen, MessageSquare, BarChart, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Sample services data
  const servicesData = [
    {
      id: "1",
      title: "Konsultasi Kesehatan Jiwa",
      description: "Layanan konsultasi kesehatan jiwa profesional untuk individu, pasangan, keluarga, dan kelompok.",
      longDescription: "Konsultasi kesehatan jiwa kami menawarkan pendekatan yang komprehensif untuk mendukung kesehatan mental Anda. Tim profesional kami yang berpengalaman akan membantu Anda mengidentifikasi tantangan, mengembangkan strategi pengatasan, dan mencapai tujuan kesehatan mental Anda.",
      icon: Brain,
      color: "bg-primary",
      benefits: [
        "Asesmen kesehatan jiwa komprehensif",
        "Terapi individual, pasangan, dan keluarga",
        "Pendekatan berbasis bukti dan peka budaya",
        "Fleksibilitas jadwal konsultasi",
        "Tersedia dalam format tatap muka dan daring"
      ],
      process: [
        "Konsultasi awal untuk menilai kebutuhan",
        "Penyusunan rencana intervensi",
        "Sesi terapi berkelanjutan",
        "Evaluasi kemajuan berkala",
        "Penyelesaian terapi dan rencana tindak lanjut"
      ],
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80"
    },
    {
      id: "2",
      title: "Workshop & Pelatihan",
      description: "Program pelatihan dan workshop untuk meningkatkan keterampilan manajemen stres dan kesejahteraan mental.",
      longDescription: "Workshop dan pelatihan kami dirancang untuk meningkatkan pengetahuan dan keterampilan manajemen kesehatan mental dalam berbagai konteks. Program ini dapat disesuaikan untuk berbagai kelompok seperti sekolah, perusahaan, komunitas, dan organisasi.",
      icon: Users,
      color: "bg-secondary",
      benefits: [
        "Materi yang disesuaikan dengan kebutuhan spesifik",
        "Fasilitator yang berpengalaman dan terlatih",
        "Kombinasi teori dan aktivitas praktis",
        "Evaluasi efektivitas program",
        "Materi pendukung untuk penerapan berkelanjutan"
      ],
      process: [
        "Analisis kebutuhan pelatihan",
        "Desain program yang disesuaikan",
        "Pelaksanaan workshop/pelatihan",
        "Evaluasi dan umpan balik",
        "Dukungan tindak lanjut"
      ],
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?auto=format&fit=crop&q=80"
    },
    {
      id: "3",
      title: "Program Dukungan",
      description: "Grup dukungan untuk berbagai isu kesehatan mental seperti depresi, kecemasan, dan kesulitan adaptasi.",
      longDescription: "Program dukungan kami menyediakan ruang yang aman dan suportif bagi individu yang menghadapi tantangan serupa dalam kesehatan mental. Dipimpin oleh fasilitator terlatih, grup-grup ini menawarkan dukungan sebaya, pembelajaran berbagi, dan pengembangan keterampilan mengatasi masalah.",
      icon: Heart,
      color: "bg-accent-600",
      benefits: [
        "Dukungan dari orang-orang dengan pengalaman serupa",
        "Pengurangan isolasi sosial",
        "Pembelajaran strategi pengatasan baru",
        "Pemberdayaan melalui berbagi pengalaman",
        "Akses ke sumber daya tambahan"
      ],
      process: [
        "Wawancara pra-grup untuk kesesuaian",
        "Orientasi terhadap aturan dan harapan grup",
        "Pertemuan grup reguler",
        "Fasilitasi oleh profesional terlatih",
        "Dukungan berkelanjutan sesuai kebutuhan"
      ],
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80"
    },
    {
      id: "4",
      title: "Edukasi & Literasi",
      description: "Program edukasi dan peningkatan literasi kesehatan mental untuk sekolah, perusahaan, dan komunitas.",
      longDescription: "Program edukasi dan literasi kesehatan mental kami bertujuan untuk meningkatkan pemahaman, mengurangi stigma, dan mempromosikan budaya peduli kesehatan mental. Melalui berbagai format edukatif, kami membantu membangun pengetahuan dan keterampilan untuk mendukung kesehatan mental yang optimal.",
      icon: BookOpen,
      color: "bg-teal-500",
      benefits: [
        "Materi edukasi berbasis bukti terkini",
        "Penekanan pada destigmatisasi",
        "Peningkatan kesadaran tanda-tanda masalah kesehatan mental",
        "Strategi untuk mencari bantuan yang tepat",
        "Bahan-bahan edukasi yang dapat disesuaikan"
      ],
      process: [
        "Asesmen pengetahuan dan kebutuhan",
        "Pengembangan materi edukasi yang relevan",
        "Penyampaian program melalui berbagai media",
        "Evaluasi pemahaman dan dampak",
        "Penguatan berkelanjutan melalui kampanye"
      ],
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80"
    },
    {
      id: "5",
      title: "Intervensi Krisis",
      description: "Layanan dukungan dan intervensi untuk situasi krisis mental dan emosional.",
      longDescription: "Layanan intervensi krisis kami menyediakan respons cepat dan efektif untuk individu yang mengalami situasi krisis mental atau emosional. Tim respons krisis kami terlatih untuk menstabilkan situasi, memberikan dukungan segera, dan menghubungkan dengan layanan tindak lanjut yang sesuai.",
      icon: MessageSquare,
      color: "bg-rose-500",
      benefits: [
        "Respons cepat untuk situasi mendesak",
        "Intervensi oleh tim profesional terlatih",
        "Penilaian risiko dan keamanan menyeluruh",
        "Stabilisasi krisis dan perencanaan keselamatan",
        "Rujukan ke layanan berkelanjutan yang sesuai"
      ],
      process: [
        "Kontak awal dan asesmen krisis",
        "Implementasi intervensi segera",
        "Stabilisasi situasi",
        "Pengembangan rencana keselamatan",
        "Rujukan dan tindak lanjut"
      ],
      image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80"
    },
    {
      id: "6",
      title: "Riset & Evaluasi",
      description: "Layanan riset dan evaluasi program kesehatan mental untuk lembaga, organisasi, dan institusi.",
      longDescription: "Layanan riset dan evaluasi kami membantu organisasi dan program kesehatan mental mengukur efektivitas, mengidentifikasi area perbaikan, dan mengembangkan praktik berbasis bukti. Dengan pendekatan metodologis yang ketat, kami mendukung pengembangan intervensi yang efektif dan berkelanjutan.",
      icon: BarChart,
      color: "bg-blue-500",
      benefits: [
        "Desain penelitian yang metodologis dan komprehensif",
        "Analisis data kualitatif dan kuantitatif",
        "Evaluasi proses dan hasil",
        "Rekomendasi berbasis bukti untuk peningkatan",
        "Dukungan untuk publikasi dan diseminasi"
      ],
      process: [
        "Konsultasi awal dan klarifikasi tujuan",
        "Pengembangan desain penelitian",
        "Pengumpulan dan analisis data",
        "Interpretasi temuan",
        "Penyusunan laporan dan rekomendasi"
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
    }
  ];
  
  // Icons map for dynamic rendering
  const iconsMap: any = {
    Brain,
    Users,
    Heart,
    BookOpen,
    MessageSquare,
    BarChart
  };
  
  useEffect(() => {
    // Simulate fetching service details
    const fetchService = () => {
      setLoading(true);
      setTimeout(() => {
        const foundService = servicesData.find(s => s.id === id);
        setService(foundService || null);
        setLoading(false);
      }, 500);
    };
    
    fetchService();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-4 w-96 bg-muted rounded"></div>
            <div className="h-4 w-80 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Layanan Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">Maaf, layanan yang Anda cari tidak tersedia.</p>
            <Link to="/services">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Layanan
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const ServiceIcon = service.icon ? iconsMap[service.icon.name] : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Service Header */}
        <section className="bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6 py-12">
            <div className="flex items-center mb-8">
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                <div className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span>Kembali ke Layanan</span>
                </div>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center fade-in">
              <div className="md:w-1/2">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${service.color}`}>
                  {ServiceIcon && <ServiceIcon className="h-8 w-8 text-white" />}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {service.longDescription}
                </p>
                <a href="/about#contact">
                  <Button size="lg">Konsultasikan Kebutuhan Anda</Button>
                </a>
              </div>
              
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-medium">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits & Process Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 fade-in">
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h2 className="text-2xl font-bold mb-6">Manfaat</h2>
                <ul className="space-y-4">
                  {service.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h2 className="text-2xl font-bold mb-6">Proses</h2>
                <ol className="space-y-4">
                  {service.process.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <span className={`w-6 h-6 rounded-full ${service.color} flex items-center justify-center text-white text-sm font-medium`}>
                          {index + 1}
                        </span>
                      </div>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto fade-in">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Mengambil Langkah Pertama?</h2>
              <p className="text-muted-foreground mb-8">
                Hubungi kami untuk mendiskusikan bagaimana layanan kami dapat membantu Anda
                atau organisasi Anda mencapai tujuan kesehatan mental yang optimal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/about#contact">
                  <Button size="lg">Hubungi Kami</Button>
                </a>
                <Link to="/services">
                  <Button variant="outline" size="lg">Lihat Layanan Lainnya</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServiceDetail;
