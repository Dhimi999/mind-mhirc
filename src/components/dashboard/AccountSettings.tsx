import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/services/storageService";
import { updatePassword, deactivateAccount } from "@/services/authService";
import {
  User,
  KeyRound,
  Lock,
  AlertCircle,
  Info,
} from "lucide-react";

interface ProfileFormValues {
  full_name: string;
  avatar_url: string | null;
  city: string;
  profession: string;
  birth_date: string;
  account_type: string | null;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function AccountSettings() {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State untuk profil dan avatar
  const [loading, setLoading] = useState(false);
  const [profileValues, setProfileValues] = useState<ProfileFormValues>({
    full_name: "",
    avatar_url: null,
    city: "",
    profession: "",
    birth_date: "",
    account_type: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEmailProvider, setIsEmailProvider] = useState(false);

  // State untuk password
  const [passwordValues, setPasswordValues] = useState<PasswordFormValues>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State untuk nonaktifkan akun
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      if (data) {
        setProfileValues({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || null,
          city: data.city || "",
          profession: data.profession || "",
          birth_date: data.birth_date
            ? new Date(data.birth_date).toISOString().split("T")[0]
            : "",
          account_type: data.account_type || "",
        });
      }
      // Cek provider dari session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const providerInfo = session.user.app_metadata?.provider || "";
        setIsEmailProvider(providerInfo === "email" || !providerInfo);
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

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validasi ukuran file (max 5MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 2MB.",
          variant: "destructive",
        });
        return;
      }
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Format file tidak didukung",
          description: "Hanya file gambar yang diperbolehkan.",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      // Tampilkan preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileValues((prev) => ({
            ...prev,
            avatar_url: event.target.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    try {
      setUploadingAvatar(true);
      const { url, error: uploadError } = await uploadAvatar(user.id, avatarFile);
      if (uploadError) throw new Error(uploadError);
      if (url) {
        // Update foto profil di database
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (updateError) throw updateError;
        setProfileValues((prev) => ({ ...prev, avatar_url: url }));
        setAvatarFile(null);
        toast({
          title: "Foto profil diperbarui",
          description: "Foto profil Anda telah berhasil diperbarui.",
        });
      }
    } catch (error: any) {
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileValues.full_name,
          city: profileValues.city,
          profession: profileValues.profession,
          birth_date: profileValues.birth_date,
          avatar_url: profileValues.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      toast({
        title: "Profil diperbarui",
        description: "Data profil Anda telah berhasil diperbarui.",
      });
    } catch (error: any) {
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

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValues.new_password !== passwordValues.confirm_password) {
      toast({
        title: "Konfirmasi password tidak cocok",
        description: "Pastikan password baru dan konfirmasi password sama.",
        variant: "destructive",
      });
      return;
    }
    if (passwordValues.new_password.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password baru minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const { success, error } = await updatePassword(
        passwordValues.current_password,
        passwordValues.new_password
      );
      if (!success) {
        throw new Error(error);
      }
      setPasswordValues({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast({
        title: "Password diperbarui",
        description: "Password Anda telah berhasil diperbarui.",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Gagal memperbarui password",
        description: error.message || "Terjadi kesalahan saat memperbarui password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (deactivateConfirmation !== "Konfirmasi Nonaktifkan Akun") {
      toast({
        title: "Teks konfirmasi tidak sesuai",
        description: "Silakan ketik teks konfirmasi dengan benar.",
        variant: "destructive",
      });
      return;
    }
    setIsDeactivating(true);
    try {
      const { success, error } = await deactivateAccount();
      if (!success) throw new Error(error);
      toast({
        title: "Akun dinonaktifkan",
        description: "Akun Anda berhasil dinonaktifkan.",
      });
      setDeactivateOpen(false);
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error: any) {
      console.error("Error deactivating account:", error);
      toast({
        title: "Gagal menonaktifkan akun",
        description: error.message || "Terjadi kesalahan saat menonaktifkan akun.",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  // Jika tidak ada foto profil, gunakan inisial dari nama atau email
  const avatarInitials = profileValues.full_name
    ? profileValues.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <KeyRound className="mr-2 h-4 w-4" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Lanjutan
          </TabsTrigger>
        </TabsList>

        {/* Tab Umum: Foto Profil dan Data Profil */}
        <TabsContent value="general" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    {profileValues.avatar_url ? (
                      <AvatarImage
                        className="object-cover"
                        src={profileValues.avatar_url}
                        alt="Avatar"
                      />
                    ) : (
                      <AvatarFallback>{avatarInitials}</AvatarFallback>
                    )}
                  </Avatar>
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
                      Format yang didukung: JPG, PNG, JPEG. Maksimal 2MB.
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
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accountType">Jenis Akun</Label>
                    <Input
                      id="accountType"
                      value={
                        profileValues.account_type === "professional"
                          ? "Akun Profesional"
                          : "Akun Umum/Reguler"
                      }
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profileValues.full_name}
                      onChange={handleProfileChange}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Kota</Label>
                      <Input
                        id="city"
                        name="city"
                        value={profileValues.city || ""}
                        disabled
                        placeholder="Kota"
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession">Profesi</Label>
                      <Input
                        id="profession"
                        name="profession"
                        value={profileValues.profession || ""}
                        disabled
                        placeholder="-"
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth_date">Tanggal Lahir</Label>
                      <Input
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        value={profileValues.birth_date || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                      <Info className="inline-block mr-2 h-4 w-4" />
                      Untuk mengubah data profesi, kota, atau tanggal lahir, silakan hubungi administrator.
                  </p> 
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Keamanan: Pembaruan Password */}
        <TabsContent value="security" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perbarui Password</CardTitle>
            </CardHeader>
            <CardContent>
              {isEmailProvider ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password" className="flex items-center gap-1">
                        <KeyRound className="w-4 h-4" />
                        Password Saat Ini
                      </Label>
                      <Input
                        id="current_password"
                        name="current_password"
                        type="password"
                        value={passwordValues.current_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password" className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Password Baru
                      </Label>
                      <Input
                        id="new_password"
                        name="new_password"
                        type="password"
                        value={passwordValues.new_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password" className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Konfirmasi Password Baru
                      </Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        value={passwordValues.confirm_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="mt-2"
                  >
                    {passwordLoading ? "Memperbarui..." : "Perbarui Password"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <p className="text-amber-800 text-sm">
                      <Lock className="inline-block mr-2 h-4 w-4" />
                      Akun Anda terhubung dengan Google, sehingga tidak dapat merubah password.
                    </p>
                  </div>
                  <Button disabled variant="outline" className="w-full">
                    Perbarui Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Lanjutan: Nonaktifkan Akun */}
        <TabsContent value="advanced" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nonaktifkan Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-amber-800 text-sm">
                    <AlertCircle className="inline-block mr-2 h-4 w-4" />
                    Menonaktifkan akun Anda akan melarang Anda mengakses aplikasi sampai Anda mengaktifkannya kembali. Akun yang dinonaktifkan selama lebih dari 30 hari mungkin perlu bantuan administrator untuk diaktifkan kembali.
                  </p>
                </div>
                <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Nonaktifkan Akun
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nonaktifkan Akun</DialogTitle>
                      <DialogDescription>
                        Tindakan ini akan menonaktifkan akun Anda. Untuk mengonfirmasi, ketik "Konfirmasi Nonaktifkan Akun" di bawah ini.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="deactivation-confirmation" className="text-sm font-medium">
                        Konfirmasi dengan mengetik <strong>"Konfirmasi Nonaktifkan Akun"</strong>
                      </Label>
                      <Textarea
                        id="deactivation-confirmation"
                        placeholder="Konfirmasi Nonaktifkan Akun"
                        className="mt-2"
                        value={deactivateConfirmation}
                        onChange={(e) => setDeactivateConfirmation(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeactivateOpen(false)}
                        disabled={isDeactivating}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeactivateAccount}
                        disabled={
                          isDeactivating ||
                          deactivateConfirmation !== "Konfirmasi Nonaktifkan Akun"
                        }
                      >
                        {isDeactivating ? "Menonaktifkan..." : "Nonaktifkan Akun"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
