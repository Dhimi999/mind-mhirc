import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, Heart, Users, BookOpen, MessageSquare, User, Brain, ArrowRight, Baby, Shield, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";

interface SafeMotherTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profileData: any) => void;
}

const SafeMotherTutorial = ({ isOpen, onClose, onComplete }: SafeMotherTutorialProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [profileData, setProfileData] = useState({
    role: "",
    stage: "",
    familyUuid: "",
    uuid: "",
    additionalInfo: {}
  });
  const { toast } = useToast();

  const roles = [
    { value: "ibu", label: "Seorang Ibu (Istri)" },
    { value: "ayah", label: "Ayah (Suami)" },
    { value: "anak", label: "Anak" },
    { value: "kakek", label: "Kakek" },
    { value: "nenek", label: "Nenek" },
    { value: "ayah_ibu", label: "Ayah dari Ibu" },
    { value: "ibu_ibu", label: "Ibu dari Ibu" }
  ];

  const stages = [
    { value: "rencana_hamil", label: "Rencana Hamil" },
    { value: "sedang_hamil", label: "Sedang Hamil" },
    { value: "pasca_nifas", label: "Ibu Pasca Nifas" }
  ];

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive"
        });
        return;
      }

      let finalProfileData = { ...profileData };
      
      // Generate UUID for mothers
      if (profileData.role === "ibu") {
        finalProfileData.uuid = generateUUID();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          safe_mother_role: finalProfileData.role,
          safe_mother_stage: finalProfileData.stage,
          safe_mother_uuid: finalProfileData.uuid,
          safe_mother_family_uuid: finalProfileData.familyUuid,
          safe_mother_additional_info: finalProfileData.additionalInfo
        })
        .eq("id", user.id);

      if (error) throw error;

      onComplete(finalProfileData);
      toast({
        title: "Profil Safe Mother berhasil dibuat!",
        description: profileData.role === "ibu" ? `UUID Anda: ${finalProfileData.uuid}` : "Selamat bergabung dengan Safe Mother"
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan profil",
        variant: "destructive"
      });
    }
  };

  const slides = [
    {
      title: "Selamat Datang di Safe Mother",
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Safe Mother adalah layanan Maternal Low-Intensity Psychological Intervention (MLIPI) 
            yang dikembangkan oleh Mind-MHIRC untuk membantu Calon Ibu, Ibu Hamil, dan Ibu Pasca Melahirkan 
            dengan menyediakan layanan yang komprehensif, mulai dari materi psikoedukasi, konsultasi, 
            penugasan harian terpadu (CBT), dan lainnya.
          </p>
        </div>
      )
    },
    {
      title: "Profil Anda",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Siapakah Anda?</label>
            <div className="grid grid-cols-1 gap-2">
              {roles.map((role) => (
                <label key={role.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={profileData.role === role.value}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="text-primary"
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {profileData.role === "ibu" && (
            <div>
              <label className="block text-sm font-medium mb-3">Tahap kehamilan saat ini:</label>
              <div className="grid grid-cols-1 gap-2">
                {stages.map((stage) => (
                  <label key={stage.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="stage"
                      value={stage.value}
                      checked={profileData.stage === stage.value}
                      onChange={(e) => setProfileData({ ...profileData, stage: e.target.value })}
                      className="text-primary"
                    />
                    <span>{stage.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {profileData.role && profileData.role !== "ibu" && (
            <div>
              <label className="block text-sm font-medium mb-3">Kode UUID Keluarga Ibu (jika ada):</label>
              <input
                type="text"
                placeholder="Masukkan kode UUID yang diberikan oleh Ibu"
                value={profileData.familyUuid}
                onChange={(e) => setProfileData({ ...profileData, familyUuid: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
        </div>
      )
    },
    {
      title: "Semua Sudah Siap!",
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-muted-foreground">
            Selamat! Profil Safe Mother Anda telah siap. Anda dapat mulai menikmati layanan 
            yang tersedia dan terhubung dengan komunitas yang mendukung perjalanan keibuan Anda.
          </p>
          {profileData.role === "ibu" && (
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-700">
                <strong>Catatan:</strong> Anda akan mendapatkan kode UUID unik yang dapat dibagikan 
                kepada keluarga untuk bergabung dengan profil Safe Mother Anda.
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{slides[currentSlide].title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8">
            {slides[currentSlide].content}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSlide ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              {currentSlide < slides.length - 1 ? (
                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  disabled={currentSlide === 1 && !profileData.role}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
                >
                  <span>Mulai Safe Mother</span>
                  <Heart className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SafeMother = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const handleTutorialComplete = (profileData: any) => {
    setShowTutorial(false);
    checkUserProfile();
  };

  const handleJoinProgram = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=/safe-mother';
      return;
    }
    
    if (!userProfile?.safe_mother_role) {
      setShowTutorial(true);
    } else {
      // Already enrolled, scroll to services
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      id: "psikoedukasi",
      title: "Psikoedukasi Maternal",
      description: "Materi edukasi komprehensif tentang kesehatan mental ibu, persiapan kehamilan, dan pengelolaan stres.",
      icon: BookOpen,
      color: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      id: "konsultasi",
      title: "Forum & Konsultasi",
      description: "Platform untuk berbagi pengalaman dengan sesama ibu dan konsultasi dengan profesional kesehatan mental.",
      icon: MessageSquare,
      color: "bg-secondary/10", 
      iconColor: "text-secondary"
    },
    {
      id: "cbt",
      title: "Program CBT",
      description: "Terapi Kognitif Perilaku yang dirancang khusus untuk mendukung kesehatan mental maternal.",
      icon: Brain,
      color: "bg-accent/10",
      iconColor: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Safe Mother - Layanan MLIPI | Mind MHIRC</title>
        <meta
          name="description"
          content="Safe Mother adalah layanan Maternal Low-Intensity Psychological Intervention (MLIPI) untuk mendampingi Calon Ibu, Ibu Hamil, dan Ibu Pasca Melahirkan dengan layanan komprehensif."
        />
        <link rel="canonical" href="https://mind-mhirc.my.id/safe-mother" />
      </Helmet>

      <SafeMotherTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      <SafeMotherNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
          {/* Background with maternal theme */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90"></div>
            <img 
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=1920" 
              alt="Ibu dan bayi dalam suasana yang tenang dan bahagia" 
              className="w-full h-full object-cover" 
              loading="lazy"
              width="1920"
              height="1080"
            />
          </div>
          
          {/* Floating shapes */}
          <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-pink-100/20 animate-float blur-3xl"></div>
          <div className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full bg-purple-100/20 animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Image */}
            <div className="relative fade-in order-first lg:order-last" style={{ animationDelay: '0.3s' }}>
              <div className="relative z-10 glass-effect p-6 rounded-2xl shadow-highlight max-w-lg mx-auto">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Safe Mother</h3>
                  <p className="text-sm text-muted-foreground">Maternal Low-Intensity Psychological Intervention</p>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 glass-effect p-4 rounded-xl shadow-soft animate-float">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-sm font-medium">Berbasis Bukti Ilmiah</span>
                </div>
              </div>
              
              <div className="absolute -top-8 right-12 glass-effect p-4 rounded-xl shadow-soft animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Peka Budaya Indonesia</span>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-6 md:space-y-8 fade-in order-last lg:order-first">
              <div className="inline-flex items-center space-x-2 bg-pink-100 rounded-full px-4 py-1 text-pink-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse-soft"></span>
                <span>Kesehatan Mental Maternal</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Mendampingi Perjalanan <span className="text-pink-600">Keibuan</span> Anda
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground md:pr-12">
                Safe Mother menyediakan layanan Maternal Low-Intensity Psychological Intervention (MLIPI) 
                yang komprehensif untuk mendampingi Calon Ibu, Ibu Hamil, dan Ibu Pasca Melahirkan.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-2 md:pt-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={handleJoinProgram}>
                  {userProfile?.safe_mother_role ? 'Lihat Dashboard' : 'Bergabung Sekarang'} 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 md:gap-8 pt-4 md:pt-6">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-pink-600">3</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tahap Layanan</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-pink-600">24/7</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dukungan Online</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-pink-600">100%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Gratis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-pink-50/30 to-purple-50/30 overflow-hidden relative">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Apa itu Safe Mother?
              </h2>
              <p className="text-muted-foreground">
                Program intervensi psikologis intensitas rendah yang dirancang khusus untuk mendukung 
                kesehatan mental ibu di setiap tahap perjalanan keibuan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-100 mb-4">
                  <Baby className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rencana Hamil</h3>
                <p className="text-muted-foreground text-sm">
                  Persiapan mental dan emosional untuk calon ibu yang merencanakan kehamilan.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Masa Kehamilan</h3>
                <p className="text-muted-foreground text-sm">
                  Dukungan kesehatan mental selama masa kehamilan dengan berbagai tantangannya.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-100 mb-4">
                  <Shield className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pasca Nifas</h3>
                <p className="text-muted-foreground text-sm">
                  Pemulihan dan penyesuaian psikologis setelah melahirkan untuk ibu baru.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="section-padding">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <span>Layanan Kami</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Layanan Komprehensif untuk Kesehatan Mental Maternal
              </h2>
              <p className="text-muted-foreground">
                Safe Mother menyediakan berbagai layanan yang dirancang untuk mendampingi 
                perjalanan keibuan Anda dengan pendekatan yang holistik dan berbasis bukti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in">
              {services.map((service) => (
                <div key={service.id} className="bg-card p-6 rounded-xl border hover:shadow-medium transition-all duration-300 group">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                    Pelajari Lebih Lanjut
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-b from-muted to-background relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto fade-in">
              <div className="inline-flex items-center space-x-2 bg-pink-100 rounded-full px-4 py-1 text-pink-700 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Mulai Perjalanan Anda</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap untuk Memulai?
              </h2>
              
              <p className="text-muted-foreground mb-8 text-lg">
                Bergabunglah dengan program Safe Mother dan dapatkan dukungan yang Anda butuhkan 
                untuk perjalanan keibuan yang sehat dan bahagia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleJoinProgram}>
                  {userProfile?.safe_mother_role ? 'Akses Dashboard' : 'Daftar Gratis Sekarang'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SafeMother;