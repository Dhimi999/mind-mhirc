import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, Heart, Users, BookOpen, MessageSquare, User, Brain, ArrowRight, Baby, Shield, Sparkles, Map, Calendar, Star, ArrowDown } from "lucide-react";
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
      window.location.href = '/login?redirect=/safe-mother';
      return;
    }
    
    if (!userProfile?.safe_mother_role) {
      setShowTutorial(true);
    } else {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const journeyStages = [
    {
      stage: "Persiapan",
      icon: Calendar,
      title: "Rencana Hamil",
      description: "Mempersiapkan diri secara mental dan emosional untuk menyambut kehamilan",
      color: "from-purple-100 to-pink-100",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      stage: "Kehamilan",
      icon: Heart,
      title: "Masa Kehamilan",
      description: "Mendampingi Anda menjalani 9 bulan penuh tantangan dan kebahagiaan",
      color: "from-pink-100 to-red-100",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      stage: "Pasca Nifas",
      icon: Baby,
      title: "Setelah Melahirkan",
      description: "Dukungan untuk pemulihan dan adaptasi sebagai ibu baru",
      color: "from-red-100 to-orange-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>Safe Mother - Pendamping Perjalanan Keibuan | Mind MHIRC</title>
        <meta
          name="description"
          content="Safe Mother adalah sahabat Anda dalam perjalanan keibuan. Dari persiapan hamil, masa kehamilan, hingga pasca nifas - kami hadir dengan dukungan psikologis yang penuh kasih."
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
        {/* Hero Section - Welcoming & Warm */}
        <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-purple-50/30 to-blue-50/40"></div>
          
          {/* Animated floating elements */}
          <div className="absolute top-1/4 right-[15%] w-64 h-64 rounded-full bg-pink-200/20 animate-float blur-3xl"></div>
          <div className="absolute bottom-1/3 left-[10%] w-48 h-48 rounded-full bg-purple-200/20 animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-blue-200/15 animate-float blur-2xl" style={{ animationDelay: '4s' }}></div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8 fade-in">
              <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2 text-pink-700 text-sm font-medium shadow-soft">
                <Heart className="w-4 h-4 animate-pulse-soft" />
                <span>Sahabat Perjalanan Keibuan Anda</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Setiap Langkah
                <span className="block text-pink-600">Dijalani Bersama</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Dari mimpi menjadi ibu hingga memeluk buah hati, kami hadir di setiap langkah 
                perjalanan Anda dengan dukungan, pemahaman, dan kasih sayang
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg" 
                  className="group shadow-lg hover:shadow-xl transition-all"
                  onClick={handleJoinProgram}
                >
                  Mulai Perjalanan Anda
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm">
                  Pelajari Lebih Lanjut
                </Button>
              </div>

              <div className="pt-8">
                <p className="text-sm text-muted-foreground mb-4">Dipercaya oleh ribuan ibu di Indonesia</p>
                <div className="flex justify-center items-center gap-8 flex-wrap">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600">100%</div>
                    <div className="text-sm text-muted-foreground">Gratis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-muted-foreground">Dukungan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-muted-foreground">Tahap Layanan</div>
                  </div>
                </div>
              </div>

              <div className="pt-12 animate-bounce">
                <ArrowDown className="w-6 h-6 mx-auto text-pink-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Journey Section - Visual Timeline */}
        <section className="section-padding bg-white relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 fade-in">
              <div className="inline-flex items-center space-x-2 bg-pink-100 rounded-full px-4 py-1 text-pink-700 text-sm font-medium mb-4">
                <Map className="w-4 h-4" />
                <span>Perjalanan Keibuan</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Kami Hadir di Setiap Tahap
              </h2>
              <p className="text-lg text-muted-foreground">
                Dari persiapan hingga pasca melahirkan, Safe Mother mendampingi 
                Anda dengan layanan yang disesuaikan untuk setiap fase perjalanan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection line for desktop */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 z-0" style={{ top: '6rem' }}></div>
              
              {journeyStages.map((stage, index) => (
                <div key={index} className="relative fade-in group" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className={`bg-gradient-to-br ${stage.color} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative z-10 h-full border-2 border-white group-hover:scale-105`}>
                    <div className={`w-16 h-16 ${stage.iconBg} rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-md`}>
                      <stage.icon className={`w-8 h-8 ${stage.iconColor}`} />
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mb-3">
                        Tahap {index + 1}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{stage.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{stage.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/50">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>Dukungan Penuh</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                Lihat Layanan Kami
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section - Warm & Inviting */}
        <section id="services" className="section-padding bg-gradient-to-b from-pink-50/30 to-purple-50/30">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-1 text-purple-700 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Layanan Kami</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Dukungan yang Anda Butuhkan
              </h2>
              <p className="text-lg text-muted-foreground">
                Layanan komprehensif yang dirancang dengan penuh kasih untuk mendukung 
                kesehatan mental dan emosional Anda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link to="/safe-mother/psikoedukasi" className="group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-transparent hover:border-pink-200 group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Psikoedukasi</h3>
                  <p className="text-muted-foreground mb-4">
                    Artikel, video, dan materi edukatif untuk memahami perjalanan keibuan dengan lebih baik
                  </p>
                  <div className="flex items-center text-pink-600 font-medium group-hover:translate-x-2 transition-transform">
                    Pelajari Lebih Lanjut
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>

              <Link to="/safe-mother/forum-konsultasi" className="group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-transparent hover:border-purple-200 group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Forum & Konsultasi</h3>
                  <p className="text-muted-foreground mb-4">
                    Berbagi cerita dengan sesama ibu dan konsultasi dengan profesional kesehatan mental
                  </p>
                  <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform">
                    Bergabung Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>

              <Link to="/safe-mother/cbt" className="group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-transparent hover:border-blue-200 group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Program CBT</h3>
                  <p className="text-muted-foreground mb-4">
                    Terapi Kognitif Perilaku terstruktur untuk mendukung kesehatan mental maternal
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                    Mulai Program
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section - Encouraging & Supportive */}
        <section className="section-padding bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNC00LTRzLTQgMi00IDQgMiA0IDQgNCA0LTIgNC00em0wLTMwYzAtMiAyLTQgNC00czQgMiA0IDQtMiA0LTQgNC00LTItNC00em0tMjAgMGMwLTIgMi00IDQtNHM0IDIgNCA0LTIgNC00IDQtNC0yLTQtNHptMCAzMGMwLTIgMi00IDQtNHM0IDIgNCA0LTIgNCA0IDQtNC0yLTQtNHpNMzYgNGMwLTIgMi00IDQtNHM0IDIgNCA0LTIgNC00IDQtNC0yLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto text-white fade-in">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium mb-6">
                <Heart className="w-4 h-4 animate-pulse-soft" />
                <span>Mulai Hari Ini</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Anda Tidak Sendiri
              </h2>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
                Ribuan ibu telah memulai perjalanan mereka bersama Safe Mother. 
                Mari kita jalani perjalanan keibuan Anda dengan penuh kasih, dukungan, dan pemahaman.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-pink-600 hover:bg-white/90 shadow-xl"
                  onClick={handleJoinProgram}
                >
                  {userProfile?.safe_mother_role ? 'Buka Dashboard' : 'Bergabung Gratis'}
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Hubungi Kami
                </Button>
              </div>

              <div className="mt-12 pt-12 border-t border-white/20">
                <p className="text-white/80 text-sm mb-4">
                  Safe Mother - Layanan berbasis bukti ilmiah dan peka budaya Indonesia
                </p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Aman & Terpercaya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Komunitas Peduli</span>
                  </div>
                </div>
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
