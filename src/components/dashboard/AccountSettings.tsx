import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/services/storageService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const AccountSettings = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<string | null>(null);
  const [profession, setProfession] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || null);
        setAccountType(data.account_type || null);
        setProfession(data.profession || null);
        setCity(data.city || null);
        setBirthDate(data.birth_date ? new Date(data.birth_date).toISOString().split("T")[0] : null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Gagal memuat profil",
        description: "Terjadi kesalahan saat memuat data profil Anda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profil diperbarui",
        description: "Data profil Anda telah berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan saat memperbarui data profil Anda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Format file tidak didukung",
          description: "Hanya file gambar yang diperbolehkan.",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    
    try {
      setUploadingAvatar(true);
      
      // Upload the avatar to Supabase storage
      const { url, error: uploadError } = await uploadAvatar(user.id, avatarFile);
      
      if (uploadError) throw new Error(uploadError);
      
      if (url) {
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
          
        if (updateError) throw updateError;
        
        setAvatarUrl(url);
        setAvatarFile(null);
        
        toast({
          title: "Foto profil diperbarui",
          description: "Foto profil Anda telah berhasil diperbarui.",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Gagal mengunggah foto profil",
        description: "Terjadi kesalahan saat mengunggah foto profil.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First update profile data
    await updateProfile();
    
    // Then upload avatar if there's a new one
    if (avatarFile) {
      await handleAvatarUpload();
    }
  };

  const getAccountTypeLabel = (type: string | null) => {
    switch (type) {
      case "professional":
        return "Akun Profesional";
      case "admin":
        return "Admin";
      default:
        return "Akun Umum/Reguler";
    }
  };

  const isProfessional = accountType === "professional";

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setDeleteLoading(true);
      
      // First delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
        
      if (profileError) throw profileError;
      
      // Then delete the auth user (this will cascade delete all related data due to RLS)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) throw authError;
      
      // Log the user out
      await logout();
      
      toast({
        title: "Akun Dihapus",
        description: "Akun Anda telah berhasil dihapus.",
      });
      
      // Redirect to homepage
      navigate("/");
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Gagal Menghapus Akun",
        description: error.message || "Terjadi kesalahan saat menghapus akun Anda.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Pengaturan Akun</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium text-xl">
                    {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar" className="block mb-2">
                  Unggah foto baru
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.
                </p>
              </div>

              {avatarFile && (
                <Button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Mengunggah..." : "Unggah Foto"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountType">Jenis Akun</Label>
                <Input
                  id="accountType"
                  value={getAccountTypeLabel(accountType)}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Email tidak dapat diubah.
                </p>
              </div>
              
              {isProfessional && (
                <>
                  <div>
                    <Label htmlFor="profession">Profesi</Label>
                    <Input
                      id="profession"
                      value={profession || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={city || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="birthDate">Tanggal Lahir</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    Untuk mengubah data profesi, kota, atau tanggal lahir, silakan hubungi administrator.
                  </p>
                </>
              )}
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Termination Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Terminasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Menghapus akun Anda akan menghapus semua data profil, hasil tes, dan informasi lainnya yang terkait dengan akun Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Terminasi Akun Saya
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Penghapusan Akun</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus akun Anda? Semua data Anda akan dihapus secara permanen dan tidak dapat dikembalikan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Menghapus..." : "Ya, Hapus Akun Saya"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
