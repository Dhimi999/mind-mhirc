import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight, Heart, Users, BookOpen, MessageSquare, User, Home, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

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
  const [currentTab, setCurrentTab] = useState("beranda");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        if (!profile.safe_mother_role) {
          setShowTutorial(true);
        }
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const handleTutorialComplete = (profileData: any) => {
    setShowTutorial(false);
    checkUserProfile();
  };

  const menuItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "psikoedukasi", label: "Psikoedukasi", icon: BookOpen },
    { id: "forum", label: "Forum & Konsultasi", icon: MessageSquare },
    { id: "cbt", label: "CBT", icon: Brain },
    { id: "profil", label: "Profil", icon: User }
  ];

  const renderContent = () => {
    switch (currentTab) {
      case "beranda":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-2">Selamat Datang di Safe Mother</h2>
              <p className="text-muted-foreground mb-4">
                Layanan MLIPI untuk mendampingi perjalanan keibuan Anda
              </p>
              {userProfile?.safe_mother_role === "ibu" && userProfile?.safe_mother_uuid && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium">Kode UUID Anda:</p>
                  <p className="font-mono text-primary">{userProfile.safe_mother_uuid}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bagikan kode ini kepada keluarga untuk bergabung
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-semibold mb-2">Materi Terbaru</h3>
                <p className="text-sm text-muted-foreground">
                  Akses materi psikoedukasi terbaru seputar kesehatan mental maternal
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-semibold mb-2">Konsultasi</h3>
                <p className="text-sm text-muted-foreground">
                  Terhubung dengan profesional dan komunitas yang mendukung
                </p>
              </div>
            </div>
          </div>
        );
      case "psikoedukasi":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Materi Psikoedukasi</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-semibold mb-2">Persiapan Menjadi Ibu</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Panduan lengkap mempersiapkan diri secara mental dan emosional
                </p>
                <button className="text-primary hover:underline text-sm">Baca Selengkapnya</button>
              </div>
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-semibold mb-2">Manajemen Stress Kehamilan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Teknik-teknik mengelola stress dan kecemasan selama kehamilan
                </p>
                <button className="text-primary hover:underline text-sm">Baca Selengkapnya</button>
              </div>
            </div>
          </div>
        );
      case "forum":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Forum & Konsultasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-semibold mb-2">Forum Ibu</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Berbagi pengalaman dan saling mendukung dengan ibu lainnya
                </p>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm">
                  Masuk Forum
                </button>
              </div>
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-semibold mb-2">Konsultasi Profesional</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Konsultasi dengan psikolog dan tenaga kesehatan profesional
                </p>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm">
                  Mulai Konsultasi
                </button>
              </div>
            </div>
          </div>
        );
      case "cbt":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">CBT (Cognitive Behavioral Therapy)</h2>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">Portal Penugasan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Tugas Minggu 1</span>
                  <span className="text-sm text-green-600">Selesai</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Tugas Minggu 2</span>
                  <span className="text-sm text-orange-600">Dalam Progress</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Tugas Minggu 3</span>
                  <span className="text-sm text-gray-400">Belum Dimulai</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "profil":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profil Saya</h2>
            <div className="bg-card p-6 rounded-xl border">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Peran</label>
                  <p className="font-medium capitalize">{userProfile?.safe_mother_role?.replace("_", " ")}</p>
                </div>
                {userProfile?.safe_mother_stage && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tahap</label>
                    <p className="font-medium capitalize">{userProfile.safe_mother_stage.replace("_", " ")}</p>
                  </div>
                )}
                {userProfile?.safe_mother_uuid && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">UUID Keluarga</label>
                    <p className="font-mono text-sm">{userProfile.safe_mother_uuid}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 bg-card border-r">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Safe Mother</h1>
                  <p className="text-xs text-muted-foreground">MLIPI Service</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      currentTab === item.id
                        ? "bg-primary text-white"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-card border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  <h1 className="font-bold">Safe Mother</h1>
                </div>
                <span className="text-sm text-muted-foreground">MLIPI</span>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <div className="bg-card border-t p-2">
              <div className="flex justify-around">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                      currentTab === item.id
                        ? "bg-primary text-white"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeMother;