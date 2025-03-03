
import { useState } from "react";
import { 
  Users, Sparkles, Heart, Brain, BookOpen, 
  BarChart4, ArrowRight, Activity, UserCheck, Send, Lightbulb, Network
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeamMember from "@/components/TeamMember";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  subject: z.string().min(5, "Subjek minimal 5 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

type FormValues = z.infer<typeof formSchema>;

const About = () => {
  const [activeTab, setActiveTab] = useState<"visi" | "misi" | "nilai">("visi");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const tabs = [
    { id: "visi", label: "Visi Kami" },
    { id: "misi", label: "Misi Kami" },
    { id: "nilai", label: "Nilai-Nilai Kami" }
  ];

  const team = [
    {
      name: "Dr. Anita Wijaya, M.Psi",
      role: "Direktur & Peneliti Utama",
      bio: "Psikolog klinis dengan pengalaman 15+ tahun dalam penelitian dan praktik kesehatan mental. Spesialisasi dalam terapi berbasis bukti untuk gangguan kecemasan dan trauma.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      email: "anita.wijaya@mindmhirc.org",
      socialLinks: {
        linkedin: "#",
        twitter: "#",
        website: "#"
      }
    },
    {
      name: "Prof. Budi Santoso, Ph.D",
      role: "Kepala Divisi Riset",
      bio: "Peneliti dengan fokus pada pengembangan instrumen pengukuran kesehatan mental yang valid secara budaya. Penulis 30+ publikasi ilmiah di jurnal internasional.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      email: "budi.santoso@mindmhirc.org",
      socialLinks: {
        linkedin: "#",
        website: "#"
      }
    },
    {
      name: "Maya Kusuma, M.Sc",
      role: "Kepala Divisi Teknologi",
      bio: "Spesialis teknologi kesehatan dengan keahlian dalam pengembangan aplikasi mobile dan AI untuk mendukung intervensi kesehatan mental.",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      email: "maya.kusuma@mindmhirc.org",
      socialLinks: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Dr. Reza Pratama, M.Kes",
      role: "Kepala Divisi Edukasi",
      bio: "Dokter dan pendidik kesehatan dengan pengalaman dalam pengembangan program edukasi kesehatan mental berbasis masyarakat di berbagai daerah di Indonesia.",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      email: "reza.pratama@mindmhirc.org",
      socialLinks: {
        linkedin: "#",
        website: "#"
      }
    }
  ];

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here we would typically send the data to a backend API
      // For demonstration purposes, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      form.reset();
      toast({
        title: "Pesan terkirim!",
        description: "Terima kasih telah menghubungi kami. Kami akan segera membalas pesan Anda.",
      });
    } catch (error) {
      toast({
        title: "Gagal mengirim pesan",
        description: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Judul */}
        <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-gradient-to-b from-background to-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-primary/5 animate-float blur-3xl"></div>
          <div className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full bg-secondary/5 animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12 fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Tentang <span className="text-primary">Mind MHIRC</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Pusat Riset Inovatif Kesehatan Mental yang didedikasikan untuk mengembangkan 
                solusi kesehatan mental yang berbasis bukti, peka budaya, dan terjangkau 
                untuk masyarakat Indonesia.
              </p>
            </div>
          </div>
        </section>
        
        {/* New Mental Health Impact Section */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-tr from-primary/5 via-background to-secondary/5 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-16 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></span>
                <span>Dampak Kesehatan Mental</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mengapa Kesehatan Mental Sangat Penting?
              </h2>
              <p className="text-muted-foreground">
                Kesehatan mental yang baik sama pentingnya dengan kesehatan fisik. Kondisi mental yang sehat 
                memungkinkan kita untuk mengembangkan potensi diri, mengatasi stres kehidupan, 
                dan berkontribusi positif dalam masyarakat.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in">
              <div className="rounded-2xl overflow-hidden shadow-medium transition-all duration-300 hover:shadow-highlight bg-white/90 backdrop-blur-sm relative h-full group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full transform translate-x-16 -translate-y-16"></div>
                
                <div className="p-8 relative z-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Kesehatan Otak</h3>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-primary">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Meningkatkan fungsi kognitif dan daya ingat</span>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-primary">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Mendukung pembuatan keputusan yang lebih baik</span>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-primary">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Meningkatkan neuroplastisitas otak</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center text-primary font-medium">
                    <span className="text-sm">48% penderita gangguan mental mengalami penurunan fungsi kognitif</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden shadow-medium transition-all duration-300 hover:shadow-highlight bg-white/90 backdrop-blur-sm relative h-full group">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/0 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full transform translate-x-16 -translate-y-16"></div>
                
                <div className="p-8 relative z-10">
                  <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Activity className="h-7 w-7 text-secondary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Kesehatan Fisik</h3>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-secondary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-secondary">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Memperkuat sistem kekebalan tubuh</span>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-secondary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-secondary">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Menurunkan risiko penyakit jantung dan stroke</span>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-secondary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-secondary">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Memperbaiki kualitas tidur dan energi</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center text-secondary font-medium">
                    <span className="text-sm">67% pasien dengan gangguan mental kronis memiliki masalah kesehatan fisik</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden shadow-medium transition-all duration-300 hover:shadow-highlight bg-white/90 backdrop-blur-sm relative h-full group">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full transform translate-x-16 -translate-y-16"></div>
                
                <div className="p-8 relative z-10">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                    <UserCheck className="h-7 w-7 text-accent-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Kualitas Hidup</h3>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-accent/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-accent-600">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Meningkatkan kepuasan dan kebahagiaan hidup</span>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-accent/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-accent-600">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Memperkuat hubungan dan koneksi sosial</span>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-accent/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-accent-600">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Meningkatkan produktivitas dan kreativitas</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center text-accent-600 font-medium">
                    <span className="text-sm">85% orang melaporkan peningkatan kualitas hidup setelah terapi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute left-0 bottom-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute right-20 top-20 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
          <div className="absolute right-0 bottom-1/3 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
        </section>
        
        {/* Redesigned Logo Mind MHIRC Section */}
        <section className="py-16 px-4 sm:px-6 bg-background relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute left-20 bottom-20 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-10 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Logo Kami</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Makna Logo Mind MHIRC
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Logo kami merepresentasikan visi dan misi Mind MHIRC sebagai pusat riset inovatif 
                kesehatan mental yang menghubungkan ilmu pengetahuan dengan solusi praktis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="flex justify-center order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-10 bg-gradient-to-tr from-primary/5 via-accent/5 to-secondary/5 rounded-full animate-spin-slow blur-3xl opacity-70"></div>
                  <div className="relative overflow-hidden rounded-full p-2 bg-gradient-to-tr from-primary/30 to-secondary/30 shadow-xl">
                    <div className="bg-white rounded-full p-4">
                      <img 
                        src="/lovable-uploads/f1e145af-f219-4e03-adfb-d4d892faee8a.png"
                        alt="Logo Mind MHIRC"
                        className="w-48 h-48 md:w-60 md:h-60 object-contain relative z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 order-1 lg:order-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white shadow-xl rounded-xl border border-primary/10 overflow-hidden transform transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                    <div className="flex items-stretch">
                      <div className="w-3 bg-primary"></div>
                      <div className="flex-1 p-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-bold text-xl">Lampu Pengetahuan</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Melambangkan pencerahan, inovasi, dan solusi baru dalam kesehatan mental.
                          Cahaya yang menerangi jalan untuk pemahaman yang lebih baik tentang kesehatan mental.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-xl rounded-xl border border-secondary/10 overflow-hidden transform transition-all duration-300 hover:shadow-secondary/20 hover:-translate-y-1">
                    <div className="flex items-stretch">
                      <div className="w-3 bg-secondary"></div>
                      <div className="flex-1 p-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Network className="h-6 w-6 text-secondary" />
                          </div>
                          <h3 className="font-bold text-xl">Koneksi Jaringan</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Garis-garis yang menghubungkan melambangkan integrasi ilmu pengetahuan, 
                          teknologi, dan praktik klinis. Juga mewakili kolaborasi antara berbagai 
                          pemangku kepentingan dalam ekosistem kesehatan mental.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-xl rounded-xl border border-accent/10 overflow-hidden transform transition-all duration-300 hover:shadow-accent/20 hover:-translate-y-1">
                    <div className="flex items-stretch">
                      <div className="w-3 bg-accent"></div>
                      <div className="flex-1 p-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Brain className="h-6 w-6 text-accent-600" />
                          </div>
                          <h3 className="font-bold text-xl">Titik Koneksi</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Lingkaran oranye di setiap ujung melambangkan berbagai aspek kesehatan 
                          mental yang kami teliti dan kembangkan, serta menggambarkan pendekatan 
                          holistik kami terhadap kesehatan mental.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Profil Lembaga Section */}
        <section className="py-16 px-4 sm:px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center fade-in">
                <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-4 py-1 text-secondary text-sm font-medium mb-4">
                  <span>Profil Lembaga</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Mind MHIRC: Inovasi untuk Kesehatan Mental
                </h2>
                <p className="text-muted-foreground">
                  Menghubungkan penelitian ilmiah, teknologi, dan pemahaman budaya lokal
                  untuk menciptakan solusi kesehatan mental yang inklusif dan efektif.
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-soft mb-10 fade-in">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 mb-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as "visi" | "misi" | "nilai")}
                      className={`px-5 py-3 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "hover:bg-primary/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="bg-muted rounded-lg p-6">
                  {activeTab === "visi" && (
                    <div className="fade-in">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Visi Kami</h3>
                      </div>
                      
                      <p className="mb-4 text-muted-foreground">
                        Menjadi pusat unggulan dalam pengembangan dan implementasi solusi 
                        kesehatan mental inovatif yang berbasis bukti dan peka budaya untuk 
                        meningkatkan kesejahteraan mental masyarakat Indonesia.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white p-4 rounded-lg shadow-soft flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Riset Berkualitas</h4>
                            <p className="text-sm text-muted-foreground">
                              Menghasilkan penelitian berkualitas tinggi yang relevan dengan konteks lokal
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-soft flex items-start space-x-3">
                          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mt-1">
                            <Users className="h-4 w-4 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Inklusif</h4>
                            <p className="text-sm text-muted-foreground">
                              Layanan kesehatan mental yang dapat diakses oleh semua kalangan masyarakat
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "misi" && (
                    <div className="fade-in">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart4 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Misi Kami</h3>
                      </div>
                      
                      <ul className="space-y-4 mb-4">
                        <li className="flex items-start">
                          <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
                            <span className="text-xs font-bold text-primary">1</span>
                          </div>
                          <p className="text-muted-foreground">
                            Melakukan penelitian berkualitas tinggi untuk mengembangkan solusi kesehatan mental yang efektif dan peka budaya.
                          </p>
                        </li>
                        
                        <li className="flex items-start">
                          <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
                            <span className="text-xs font-bold text-primary">2</span>
                          </div>
                          <p className="text-muted-foreground">
                            Mengembangkan teknologi dan inovasi untuk meningkatkan akses dan kualitas layanan kesehatan mental.
                          </p>
                        </li>
                        
                        <li className="flex items-start">
                          <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
                            <span className="text-xs font-bold text-primary">3</span>
                          </div>
                          <p className="text-muted-foreground">
                            Menjalin kemitraan strategis dengan berbagai pemangku kepentingan untuk memperluas jangkauan layanan kesehatan mental.
                          </p>
                        </li>
                        
                        <li className="flex items-start">
                          <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
                            <span className="text-xs font-bold text-primary">4</span>
                          </div>
                          <p className="text-muted-foreground">
                            Meningkatkan kesadaran masyarakat tentang pentingnya kesehatan mental melalui edukasi dan advokasi.
                          </p>
                        </li>
                      </ul>
                    </div>
                  )}
                  
                  {activeTab === "nilai" && (
                    <div className="fade-in">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Nilai-Nilai Kami</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-soft">
                          <h4 className="font-medium mb-2 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-primary">E</span>
                            </div>
                            Etis
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Menjunjung tinggi prinsip-prinsip etika dalam semua aspek penelitian dan layanan.
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-soft">
                          <h4 className="font-medium mb-2 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-primary">I</span>
                            </div>
                            Inovatif
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Terus mengembangkan pendekatan dan solusi baru yang efektif.
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-soft">
                          <h4 className="font-medium mb-2 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-primary">K</span>
                            </div>
                            Kolaboratif
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Bekerja sama dengan berbagai pihak untuk mencapai tujuan bersama.
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-soft">
                          <h4 className="font-medium mb-2 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-primary">I</span>
                            </div>
                            Inklusif
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Menghargai keberagaman dan memastikan akses yang setara bagi semua.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tim Kami Section */}
        <section className="py-16 px-4 sm:px-6 bg-background">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <span>Tim Kami</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Para Ahli di Balik Mind MHIRC
              </h2>
              <p className="text-muted-foreground">
                Tim multidisiplin kami terdiri dari psikolog, peneliti, pengembang teknologi, 
                dan pendidik yang berdedikasi untuk menciptakan solusi kesehatan mental terbaik.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
              {team.map((member) => (
                <TeamMember key={member.name} {...member} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Formulir Kontak Section */}
        <section className="py-16 px-4 sm:px-6 bg-muted/50 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <Send className="h-4 w-4" />
                <span>Hubungi Kami</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tinggalkan Pesan untuk Kami
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Apakah Anda memiliki pertanyaan, saran, atau ingin berkolaborasi dengan kami? 
                Jangan ragu untuk menghubungi kami melalui formulir di bawah ini.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-background rounded-2xl p-6 shadow-medium">
                  <h3 className="font-bold text-xl mb-4">Informasi Kontak</h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
                        <p className="font-medium mt-1">info@mindmhirc.org</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Telepon</h4>
                        <p className="font-medium mt-1">+62 21 7890 1234</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Alamat</h4>
                        <p className="font-medium mt-1">Jl. Kesehatan Mental No. 45, Jakarta Selatan 12345, Indonesia</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background rounded-2xl p-6 shadow-medium">
                  <h3 className="font-bold text-xl mb-4">Jam Operasional</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-muted-foreground">Senin - Jumat</span>
                      <span className="font-medium">08:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-muted-foreground">Sabtu</span>
                      <span className="font-medium">09:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Minggu & Hari Libur</span>
                      <span className="font-medium">Tutup</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <div className="bg-background rounded-2xl p-6 shadow-medium">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Lengkap</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="email@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjek</FormLabel>
                            <FormControl>
                              <Input placeholder="Subjek pesan Anda" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pesan</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tuliskan pesan Anda di sini" 
                                className="min-h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengirim...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Send className="h-4 w-4 mr-2" />
                            Kirim Pesan
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute left-10 top-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute right-10 bottom-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;

