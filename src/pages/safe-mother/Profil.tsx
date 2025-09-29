import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { User, Edit, Share2, Copy, Heart, Calendar, MapPin, Phone } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profil = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    city: "",
    birth_date: "",
    profession: "",
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
          profession: profile.profession || "",
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
        description: "Perubahan profil Anda telah disimpan."
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
        description: "UUID keluarga berhasil disalin ke clipboard"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
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
    const stageLabels = {
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
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profil...</p>
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

      <main className="flex-1 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-pink-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-pink-600" />
              <span className="text-pink-700 font-medium text-sm">Profil Safe Mother</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Profil Saya
            </h1>
            <p className="text-gray-600">
              Kelola informasi profil dan pengaturan akun Safe Mother Anda
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Informasi Profil</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{isEditing ? "Batal" : "Edit"}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profile?.full_name || "Nama belum diisi"}
                      </h3>
                      <p className="text-pink-600 font-medium">
                        {profile?.safe_mother_role ? getRoleLabel(profile.safe_mother_role) : "Role belum diatur"}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {profile?.full_name || "Belum diisi"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {profile?.city || "Belum diisi"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Lahir
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('id-ID') : "Belum diisi"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profesi
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {profile?.profession || "Belum diisi"}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Simpan Perubahan
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Safe Mother Info */}
            <div className="space-y-6">
              {/* Safe Mother Status */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Safe Mother</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Role dalam keluarga</label>
                    <p className="font-medium text-gray-900">
                      {profile?.safe_mother_role ? getRoleLabel(profile.safe_mother_role) : "Belum diatur"}
                    </p>
                  </div>

                  {profile?.safe_mother_stage && (
                    <div>
                      <label className="text-sm text-gray-600">Tahap saat ini</label>
                      <p className="font-medium text-gray-900">
                        {getStageLabel(profile.safe_mother_stage)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-600">Bergabung sejak</label>
                    <p className="font-medium text-gray-900">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID') : "Tidak diketahui"}
                    </p>
                  </div>
                </div>
              </div>

              {/* UUID Sharing */}
              {profile?.safe_mother_uuid && (
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <Share2 className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Kode UUID Keluarga</h3>
                  </div>
                  
                  <p className="text-pink-100 text-sm mb-4">
                    Bagikan kode ini kepada anggota keluarga agar mereka dapat bergabung dengan profil Safe Mother Anda.
                  </p>
                  
                  <div className="bg-white/20 rounded-lg p-3 flex items-center justify-between">
                    <code className="text-sm font-mono break-all">
                      {profile.safe_mother_uuid}
                    </code>
                    <button
                      onClick={copyUUID}
                      className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Support */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Butuh Bantuan?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Tim support kami siap membantu Anda dengan segala pertanyaan seputar Safe Mother.
                </p>
                <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profil;