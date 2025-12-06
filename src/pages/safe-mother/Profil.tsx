import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  User, 
  Edit, 
  Share2, 
  Copy, 
  Heart, 
  Calendar, 
  MapPin, 
  Phone,
  Sparkles,
  Shield,
  Activity,
  Users,
  Save,
  X
} from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Profil = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    city: "",
    birth_date: "",
    profession: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setFormData({
          full_name: profile.full_name || "",
          city: profile.city || "",
          birth_date: profile.birth_date || "",
          profession: profile.profession || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil berhasil diperbarui",
        description: "Perubahan profil Anda telah disimpan.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive"
      });
    }
  };

  const copyUUID = () => {
    if (profile?.safe_mother_uuid) {
      navigator.clipboard.writeText(profile.safe_mother_uuid);
      toast({
        title: "UUID disalin",
        description: "UUID keluarga berhasil disalin ke clipboard",
        className: "bg-pink-50 border-pink-200 text-pink-800"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      "ibu": "Seorang Ibu (Istri)",
      "ayah": "Ayah (Suami)",
      "anak": "Anak",
      "kakek": "Kakek",
      "nenek": "Nenek",
      "ayah_ibu": "Ayah dari Ibu",
      "ibu_ibu": "Ibu dari Ibu"
    };
    return roleLabels[role] || role;
  };

  const getStageLabel = (stage: string) => {
    const stageLabels: Record<string, string> = {
      "rencana_hamil": "Rencana Hamil",
      "sedang_hamil": "Sedang Hamil",
      "pasca_nifas": "Ibu Pasca Nifas"
    };
    return stageLabels[stage] || stage;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
        <SafeMotherNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Memuat profil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>Profil Saya - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Kelola profil Safe Mother Anda, lihat informasi akun, dan bagikan UUID keluarga dengan anggota keluarga lainnya."
        />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-sm rounded-full mb-4 shadow-sm">
              <Heart className="w-6 h-6 text-pink-500 mr-2" />
              <span className="text-pink-600 font-medium">Profil Safe Mother</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Profil Saya
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kelola informasi pribadi dan pengaturan akun Safe Mother Anda untuk pengalaman yang lebih personal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 border-b border-white/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-pink-500" />
                      Informasi Pribadi
                    </CardTitle>
                    <CardDescription>Data diri dan informasi kontak Anda</CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing ? "" : "border-pink-200 text-pink-700 hover:bg-pink-50 hover:text-pink-800"}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Batal
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profil
                      </>
                    )}
                  </Button>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <User className="w-10 h-10 text-pink-400" />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {profile?.full_name || "Nama Pengguna"}
                      </h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                          <Shield className="w-3 h-3 mr-1" />
                          {profile?.safe_mother_role ? getRoleLabel(profile.safe_mother_role) : "Role belum diatur"}
                        </span>
                        {profile?.safe_mother_stage && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Activity className="w-3 h-3 mr-1" />
                            {getStageLabel(profile.safe_mother_stage)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Bergabung sejak {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nama Lengkap</Label>
                      {isEditing ? (
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="bg-white/50 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-gray-800 font-medium">
                          {profile?.full_name || "-"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Kota Domisili</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="bg-white/50 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-gray-800 flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {profile?.city || "-"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Tanggal Lahir</Label>
                      {isEditing ? (
                        <Input
                          id="birth_date"
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="bg-white/50 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-gray-800 flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Profesi / Pekerjaan</Label>
                      {isEditing ? (
                        <Input
                          id="profession"
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          className="bg-white/50 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-gray-800">
                          {profile?.profession || "-"}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 flex justify-end animate-fade-in">
                      <Button 
                        onClick={handleSave} 
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Safe Mother Status */}
              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-white/50 border-b border-pink-100 pb-3">
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                    Status Safe Mother
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Users className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role Keluarga</p>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {profile?.safe_mother_role ? getRoleLabel(profile.safe_mother_role) : "Belum diatur"}
                      </p>
                    </div>
                  </div>

                  {profile?.safe_mother_stage && (
                    <div className="flex items-start space-x-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Activity className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tahap Saat Ini</p>
                        <p className="font-medium text-gray-900 mt-0.5">
                          {getStageLabel(profile.safe_mother_stage)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* UUID Sharing */}
              {profile?.safe_mother_uuid && (
                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative p-6 text-white">
                    <div className="flex items-center space-x-2 mb-3">
                      <Share2 className="w-5 h-5" />
                      <h3 className="text-lg font-bold">Kode Keluarga</h3>
                    </div>
                    
                    <p className="text-pink-100 text-sm mb-4 leading-relaxed">
                      Bagikan kode ini kepada anggota keluarga agar mereka dapat terhubung dengan profil Anda.
                    </p>
                    
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-1 flex items-center justify-between border border-white/10">
                      <code className="text-sm font-mono px-3 py-2 truncate flex-1 text-pink-50">
                        {profile.safe_mother_uuid}
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={copyUUID} 
                        className="text-white hover:bg-white/20 hover:text-white rounded-lg h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Support */}
              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-md overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Butuh Bantuan?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Tim support kami siap membantu Anda dengan segala pertanyaan seputar Safe Mother.
                  </p>
                  <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                    Hubungi Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profil;