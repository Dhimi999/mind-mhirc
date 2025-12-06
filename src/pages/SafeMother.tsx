import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  X, ChevronRight, Heart, Users, BookOpen, MessageSquare, User, Brain, 
  ArrowRight, Baby, Shield, Sparkles, Map, Calendar, Star, ArrowDown, 
  CheckCircle2, PlayCircle 
} from "lucide-react";
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
    { value: "ibu", label: "Seorang Ibu (Istri)", icon: Heart },
    { value: "ayah", label: "Ayah (Suami)", icon: User },
    { value: "anak", label: "Anak", icon: Baby },
    { value: "kakek", label: "Kakek", icon: User },
    { value: "nenek", label: "Nenek", icon: User },
    { value: "ayah_ibu", label: "Ayah dari Ibu", icon: User },
    { value: "ibu_ibu", label: "Ibu dari Ibu", icon: User }
  ];

  const stages = [
    { value: "rencana_hamil", label: "Rencana Hamil", desc: "Persiapan fisik & mental" },
    { value: "sedang_hamil", label: "Sedang Hamil", desc: "Menjaga kesehatan janin & ibu" },
    { value: "pasca_nifas", label: "Ibu Pasca Nifas", desc: "Pemulihan & adaptasi baru" }
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
      subtitle: "Layanan Kesehatan Mental Maternal Terpadu",
      content: (
        <div className="text-center space-y-6 py-4">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-pink-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-16 h-16 text-pink-500 fill-pink-100" />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            Kami hadir untuk mendampingi perjalanan keibuan Anda dengan layanan komprehensif: 
            <span className="font-semibold text-pink-600"> Psikoedukasi</span>, 
            <span className="font-semibold text-purple-600"> Konsultasi</span>, dan 
            <span className="font-semibold text-blue-600"> Terapi CBT</span>.
          </p>
        </div>
      )
    },
    {
      title: "Lengkapi Profil Anda",
      subtitle: "Bantu kami menyesuaikan pengalaman Anda",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Siapakah Anda?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((role) => (
                <label 
                  key={role.value} 
                  className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    profileData.role === role.value 
                      ? "border-pink-500 bg-pink-50 ring-1 ring-pink-500" 
                      : "border-gray-200 hover:border-pink-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={profileData.role === role.value}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-full ${profileData.role === role.value ? "bg-pink-200" : "bg-gray-100"}`}>
                    <role.icon className={`w-4 h-4 ${profileData.role === role.value ? "text-pink-700" : "text-gray-500"}`} />
                  </div>
                  <span className={`font-medium ${profileData.role === role.value ? "text-pink-900" : "text-gray-700"}`}>
                    {role.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {profileData.role === "ibu" && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tahap kehamilan saat ini:</label>
              <div className="grid grid-cols-1 gap-3">
                {stages.map((stage) => (
                  <label 
                    key={stage.value} 
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      profileData.stage === stage.value 
                        ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500" 
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="stage"
                        value={stage.value}
                        checked={profileData.stage === stage.value}
                        onChange={(e) => setProfileData({ ...profileData, stage: e.target.value })}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        profileData.stage === stage.value ? "border-purple-600" : "border-gray-400"
                      }`}>
                        {profileData.stage === stage.value && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                      </div>
                      <div>
                        <div className={`font-medium ${profileData.stage === stage.value ? "text-purple-900" : "text-gray-900"}`}>
                          {stage.label}
                        </div>
                        <div className="text-xs text-gray-500">{stage.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {profileData.role && profileData.role !== "ibu" && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Kode UUID Keluarga Ibu (jika ada):</label>
              <input
                type="text"
                placeholder="Masukkan kode UUID yang diberikan oleh Ibu"
                value={profileData.familyUuid}
                onChange={(e) => setProfileData({ ...profileData, familyUuid: e.target.value })}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                *Kode ini diperlukan untuk menghubungkan akun Anda dengan akun Ibu.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Semua Sudah Siap!",
      subtitle: "Selamat datang di komunitas Safe Mother",
      content: (
        <div className="text-center space-y-6 py-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Users className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-gray-600 text-lg">
            Profil Anda telah siap. Anda kini dapat mengakses seluruh layanan dan terhubung dengan komunitas yang mendukung.
          </p>
          {profileData.role === "ibu" && (
            <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100">
              <p className="text-sm text-pink-800 font-medium">
                <strong>Info Penting:</strong> Anda akan mendapatkan kode UUID unik di halaman Profil. Bagikan kode tersebut kepada keluarga agar mereka dapat bergabung dalam lingkaran dukungan Anda.
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 to-purple-50/50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{slides[currentSlide].title}</h2>
            <p className="text-gray-500 mt-1">{slides[currentSlide].subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {slides[currentSlide].content}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-8 bg-pink-600" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              {currentSlide < slides.length - 1 ? (
                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  disabled={currentSlide === 1 && !profileData.role}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:opacity-90 flex items-center space-x-2 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Mulai Safe Mother</span>
                  <Heart className="w-4 h-4 fill-white" />
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

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-pink-100 selection:text-pink-900">
      <Helmet>
        <title>Safe Mother - Ruang Aman Ibu & Keluarga | Mind MHIRC</title>
        <meta
          name="description"
          content="Platform kesehatan mental maternal holistik. Psikoedukasi, Konsultasi, dan Terapi CBT untuk ibu hamil dan pasca melahirkan."
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
        {/* Hero Section with Image Background */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=2070&auto=format&fit=crop" 
              alt="Mother and child" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
          </div>

          <div className="container relative z-10 mx-auto px-4 sm:px-6 pt-20">
            <div className="max-w-2xl space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-pink-100/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-pink-700 text-sm font-medium border border-pink-200">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>#1 Platform Kesehatan Mental Maternal</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                Ibu Bahagia, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Keluarga Sejahtera
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                Pendamping setia perjalanan keibuan Anda. Dari masa persiapan, kehamilan, hingga mengasuh buah hati, kami hadir dengan dukungan profesional dan komunitas yang peduli.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-200/50 rounded-full px-8 h-14 text-lg"
                  onClick={handleJoinProgram}
                >
                  Mulai Perjalanan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/50 backdrop-blur-sm border-gray-300 hover:bg-white text-gray-700 rounded-full px-8 h-14 text-lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Pelajari Program
                </Button>
              </div>

              <div className="pt-8 flex items-center gap-6 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Terverifikasi Medis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Privasi Terjamin</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-20 -mt-20 pb-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Ibu Bergabung", value: "2,000+", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Sesi Konsultasi", value: "500+", icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50" },
                { label: "Materi Edukasi", value: "100+", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center space-x-4 transform hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid (Bento Style) */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Layanan Komprehensif</h2>
              <p className="text-gray-600 text-lg">Semua yang Anda butuhkan untuk menjaga kesehatan mental dan emosional selama masa keibuan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Psikoedukasi - Large Card */}
              <div className="md:col-span-8 group relative overflow-hidden rounded-3xl shadow-lg h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=2070&auto=format&fit=crop" 
                  alt="Education" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="bg-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Psikoedukasi & Artikel</h3>
                  <p className="text-gray-200 mb-4 max-w-lg">Akses ratusan artikel dan video edukasi yang dikurasi oleh ahli kesehatan mental maternal.</p>
                  <Link to="/safe-mother/psikoedukasi" className="inline-flex items-center text-pink-300 hover:text-pink-200 font-medium">
                    Mulai Belajar <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* CBT - Tall Card */}
              <div className="md:col-span-4 group relative overflow-hidden rounded-3xl shadow-lg h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop" 
                  alt="Meditation" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Program CBT</h3>
                  <p className="text-gray-200 mb-4">Terapi Kognitif Perilaku mandiri untuk mengelola kecemasan.</p>
                  <Link to="/safe-mother/cbt" className="inline-flex items-center text-purple-300 hover:text-purple-200 font-medium">
                    Ikuti Program <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Forum - Wide Card */}
              <div className="md:col-span-12 group relative overflow-hidden rounded-3xl shadow-lg h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop" 
                  alt="Community" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center p-8 md:p-12">
                  <div className="max-w-xl text-white">
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Forum & Konsultasi Ahli</h3>
                    <p className="text-gray-200 text-lg mb-6">Jangan berjuang sendirian. Bergabunglah dengan komunitas ibu yang saling mendukung dan konsultasikan masalah Anda dengan psikolog profesional.</p>
                    <Link to="/safe-mother/forum" className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center">
                      Gabung Komunitas <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Timeline (Redesigned) */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-pink-600 font-semibold tracking-wider uppercase text-sm">Timeline</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Perjalanan Anda Bersama Kami</h2>
            </div>

            <div className="relative">
              {/* Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {[
                  { title: "Persiapan Kehamilan", desc: "Membangun kesiapan mental dan fisik.", icon: Calendar, color: "bg-teal-100 text-teal-600" },
                  { title: "Masa Kehamilan", desc: "Pendampingan intensif selama 9 bulan.", icon: Heart, color: "bg-pink-100 text-pink-600" },
                  { title: "Pasca Melahirkan", desc: "Dukungan pemulihan dan adaptasi peran baru.", icon: Baby, color: "bg-orange-100 text-orange-600" }
                ].map((step, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg text-center group hover:border-pink-200 transition-colors">
                    <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner`}>
                      <step.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-24 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
             <img 
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
                  alt="Background" 
                  className="w-full h-full object-cover"
            />
          </div>
          <div className="container relative z-10 mx-auto px-4 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Siap Menjadi Ibu yang Lebih Bahagia?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Bergabunglah dengan ribuan ibu lainnya yang telah merasakan manfaat program Safe Mother.</p>
            <Button 
              size="lg" 
              className="bg-pink-600 hover:bg-pink-500 text-white px-10 py-6 text-lg rounded-full shadow-2xl shadow-pink-900/50"
              onClick={handleJoinProgram}
            >
              Daftar Sekarang - Gratis
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SafeMother;
