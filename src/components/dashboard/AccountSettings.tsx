import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
  Copy,
  Users,
  Send,
  Edit,
  Brain,
  Trash2
} from "lucide-react";

// Updated ProfileFormValues to include subtypes, parent_id, and updated_at
interface ProfileFormValues {
  full_name: string;
  avatar_url: string | null;
  city: string;
  profession: string;
  birth_date: string;
  account_type: string | null;
  subtypes: ("parent" | "child")[];
  parent_id: string | null;
  updated_at?: string; // Add optional updated_at property
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

  // State for profile and avatar
  const [loading, setLoading] = useState(false);
  const [profileValues, setProfileValues] = useState<ProfileFormValues>({
    full_name: "",
    avatar_url: null,
    city: "",
    profession: "",
    birth_date: "",
    account_type: "",
    subtypes: [],
    parent_id: null
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEmailProvider, setIsEmailProvider] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false); // State to toggle role editing

  // State for password
  const [passwordValues, setPasswordValues] = useState<PasswordFormValues>({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State for deactivating account
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  // State for AI Facts
  const [aiFacts, setAiFacts] = useState<{ id: string; content: string; created_at: string }[]>([]);
  const [loadingFacts, setLoadingFacts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAiFacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAiFacts = async () => {
    if (!user) return;
    try {
      setLoadingFacts(true);
      const { data, error } = await supabase
        .from("ai_user_facts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAiFacts(data || []);
    } catch (error) {
      console.error("Error fetching AI facts:", error);
    } finally {
      setLoadingFacts(false);
    }
  };

  const deleteAiFact = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_user_facts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setAiFacts(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Memori dihapus",
        description: "Fakta berhasil dihapus dari memori AI."
      });
    } catch (error) {
      console.error("Error deleting fact:", error);
      toast({
        title: "Gagal menghapus",
        description: "Terjadi kesalahan saat menghapus memori.",
        variant: "destructive"
      });
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
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
          subtypes: (data.subtypes as ("parent" | "child")[] | null) || [],
          parent_id: data.parent_id || null
        });
      }
      // Check provider from session
      const {
        data: { session }
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
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for subtype checkbox changes
  const handleSubtypeChange = (subtype: "parent" | "child") => {
    setProfileValues((prev) => {
      const newSubtypes = new Set(prev.subtypes);
      if (newSubtypes.has(subtype)) {
        newSubtypes.delete(subtype);
      } else {
        newSubtypes.add(subtype);
      }

      const updatedSubtypes = Array.from(newSubtypes);
      const parentId = updatedSubtypes.includes("child")
        ? prev.parent_id
        : null;

      return { ...prev, subtypes: updatedSubtypes, parent_id: parentId };
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 2MB.",
          variant: "destructive"
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Format file tidak didukung",
          description: "Hanya file gambar yang diperbolehkan.",
          variant: "destructive"
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileValues((prev) => ({
            ...prev,
            avatar_url: event.target.result as string
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
      const { url, error: uploadError } = await uploadAvatar(
        user.id,
        avatarFile
      );
      if (uploadError) throw new Error(uploadError);
      if (url) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: url, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (updateError) throw updateError;
        setProfileValues((prev) => ({ ...prev, avatar_url: url }));
        setAvatarFile(null);
        toast({
          title: "Foto profil diperbarui",
          description: "Foto profil Anda telah berhasil diperbarui."
        });
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Gagal mengunggah foto profil",
        description: "Terjadi kesalahan saat mengunggah foto profil.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      profileValues.subtypes.includes("parent") &&
      profileValues.subtypes.includes("child") &&
      profileValues.parent_id === user.id
    ) {
      toast({
        title: "Input Tidak Valid",
        description:
          "Anda tidak dapat menautkan akun ke diri sendiri. Masukkan ID wali yang valid.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const updatePayload: Partial<ProfileFormValues> = {
        full_name: profileValues.full_name,
        avatar_url: profileValues.avatar_url,
        updated_at: new Date().toISOString()
      };

      if (profileValues.account_type === "general") {
        updatePayload.subtypes = profileValues.subtypes;
        updatePayload.parent_id = profileValues.subtypes.includes("child")
          ? profileValues.parent_id
          : null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setIsEditingRole(false); // Turn off editing mode after successful save
      toast({
        title: "Profil diperbarui",
        description: "Data profil Anda telah berhasil diperbarui."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan saat memperbarui data profil Anda.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValues.new_password !== passwordValues.confirm_password) {
      toast({
        title: "Konfirmasi password tidak cocok",
        description: "Pastikan password baru dan konfirmasi password sama.",
        variant: "destructive"
      });
      return;
    }
    if (passwordValues.new_password.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password baru minimal 6 karakter.",
        variant: "destructive"
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const { success, error } = await updatePassword(
        passwordValues.current_password,
        passwordValues.new_password
      );
      if (!success) throw new Error(error);
      setPasswordValues({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      toast({
        title: "Password diperbarui",
        description: "Password Anda telah berhasil diperbarui."
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Gagal memperbarui password",
        description: error.message || "Terjadi kesalahan.",
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }
    setIsDeactivating(true);
    try {
      const { success, error } = await deactivateAccount();
      if (!success) throw new Error(error);
      toast({
        title: "Akun dinonaktifkan",
        description: "Akun Anda berhasil dinonaktifkan."
      });
      setDeactivateOpen(false);
      setTimeout(() => logout(), 1500);
    } catch (error: any) {
      console.error("Error deactivating account:", error);
      toast({
        title: "Gagal menonaktifkan akun",
        description: error.message || "Terjadi kesalahan.",
        variant: "destructive"
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast({
        title: "ID Pengguna Disalin",
        description: "Anda dapat membagikan ID ini kepada anak Anda."
      });
    }
  };

  const avatarInitials = profileValues.full_name
    ? profileValues.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  // Helper to determine if we should show the role editor
  const showRoleEditor =
    profileValues.account_type === "general" &&
    (profileValues.subtypes.length === 0 || isEditingRole);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="ai-companion" className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            Teman AI
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

        <TabsContent value="general" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    className="object-cover"
                    src={profileValues.avatar_url || ""}
                    alt="Avatar"
                  />
                  <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
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
                      Format: JPG, PNG, JPEG. Maksimal 2MB.
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

          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-6">
              {/* START: Family Role Card Logic */}
              {profileValues.account_type === "general" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Peran Keluarga</CardTitle>
                    <CardDescription>
                      Atur peran Anda sebagai orang tua atau anak untuk
                      menautkan akun.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {showRoleEditor ? (
                      <>
                        {/* --- Editing/Selection View --- */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isParent"
                              onCheckedChange={() =>
                                handleSubtypeChange("parent")
                              }
                              checked={profileValues.subtypes.includes(
                                "parent"
                              )}
                            />
                            <Label
                              htmlFor="isParent"
                              className="cursor-pointer font-normal"
                            >
                              Saya adalah Orang Tua / Wali
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isChild"
                              onCheckedChange={() =>
                                handleSubtypeChange("child")
                              }
                              checked={profileValues.subtypes.includes("child")}
                            />
                            <Label
                              htmlFor="isChild"
                              className="cursor-pointer font-normal"
                            >
                              Saya adalah Anak
                            </Label>
                          </div>
                        </div>

                        {profileValues.subtypes.includes("child") && (
                          <div className="space-y-2 animate-in fade-in-50">
                            <Label htmlFor="parent_id">
                              ID Akun Wali / Orang Tua
                            </Label>
                            <Input
                              id="parent_id"
                              name="parent_id"
                              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                              value={profileValues.parent_id || ""}
                              onChange={handleProfileChange}
                              required
                            />
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs text-blue-600 hover:underline"
                                >
                                  <Send className="mr-1 h-3 w-3" />
                                  Orang tua/wali Anda belum punya akun? Undang
                                  mereka.
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Undang Orang Tua / Wali
                                  </DialogTitle>
                                  <DialogDescription>
                                    Untuk menautkan akun, orang tua/wali Anda
                                    perlu mendaftar terlebih dahulu. Setelah
                                    mendaftar, mereka bisa mendapatkan ID unik
                                    di halaman pengaturan akun mereka untuk Anda
                                    gunakan di sini.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        window.location.origin +
                                          "/login?register=true"
                                      )
                                    }
                                  >
                                    Salin Tautan Pendaftaran
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* --- Display View --- */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Peran Anda Saat Ini</Label>
                            <div className="flex flex-wrap gap-2">
                              {profileValues.subtypes.map((role) => (
                                <div
                                  key={role}
                                  className="capitalize text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                                >
                                  {role === "parent"
                                    ? "Orang Tua / Wali"
                                    : "Anak"}
                                </div>
                              ))}
                            </div>
                          </div>

                          {profileValues.subtypes.includes("parent") && (
                            <div className="space-y-2">
                              <Label>ID Orang Tua Anda (Untuk Dibagikan)</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={user?.id || ""}
                                  readOnly
                                  className="font-mono text-sm bg-muted"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={copyUserId}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {profileValues.subtypes.includes("child") &&
                            profileValues.parent_id && (
                              <div className="space-y-2">
                                <Label>Tertaut dengan Akun Wali</Label>
                                <Input
                                  value={profileValues.parent_id}
                                  readOnly
                                  className="font-mono text-sm bg-muted"
                                />
                              </div>
                            )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditingRole(true)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Ubah Peran
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
              {/* END: Family Role Card Logic */}

              <Card>
                <CardHeader>
                  <CardTitle>Data Profil</CardTitle>
                </CardHeader>
                <CardContent>
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
                      Untuk mengubah data profesi, kota, atau tanggal lahir,
                      silakan hubungi administrator.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end sticky bottom-4">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="shadow-lg"
                >
                  {loading ? "Menyimpan..." : "Simpan Semua Perubahan"}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="ai-companion" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Memori Teman AI</CardTitle>
              <CardDescription>
                Berikut adalah hal-hal yang diingat oleh EVA tentang Anda untuk membuat percakapan lebih personal.
                Anda dapat menghapus memori yang tidak diinginkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFacts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : aiFacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Belum ada memori yang tersimpan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiFacts.map((fact) => (
                    <div
                      key={fact.id}
                      className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border group hover:bg-muted transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{fact.content}</p>
                        <p className="text-xs text-muted-foreground">
                          Disimpan pada {new Date(fact.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteAiFact(fact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                      <Label
                        htmlFor="current_password"
                        className="flex items-center gap-1"
                      >
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
                      <Label
                        htmlFor="new_password"
                        className="flex items-center gap-1"
                      >
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
                      <Label
                        htmlFor="confirm_password"
                        className="flex items-center gap-1"
                      >
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
                      Akun Anda terhubung dengan provider eksternal, sehingga
                      password tidak dapat diubah di sini.
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
                    Tindakan ini tidak dapat diurungkan. Anda akan perlu
                    menghubungi admin untuk reaktivasi.
                  </p>
                </div>
                <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Nonaktifkan Akun Saya
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Anda yakin ingin menonaktifkan akun?
                      </DialogTitle>
                      <DialogDescription>
                        Tindakan ini akan menonaktifkan akun Anda secara
                        permanen. Untuk mengonfirmasi, ketik "Konfirmasi
                        Nonaktifkan Akun" di bawah ini.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label
                        htmlFor="deactivation-confirmation"
                        className="text-sm font-medium"
                      >
                        Ketik <strong>"Konfirmasi Nonaktifkan Akun"</strong>
                      </Label>
                      <Textarea
                        id="deactivation-confirmation"
                        placeholder="Konfirmasi Nonaktifkan Akun"
                        className="mt-2"
                        value={deactivateConfirmation}
                        onChange={(e) =>
                          setDeactivateConfirmation(e.target.value)
                        }
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
                          deactivateConfirmation !==
                            "Konfirmasi Nonaktifkan Akun"
                        }
                      >
                        {isDeactivating
                          ? "Menonaktifkan..."
                          : "Ya, Nonaktifkan Akun"}
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
