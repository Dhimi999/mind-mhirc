
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserCircle, AtSign, MapPin, Briefcase, Calendar, User, ShieldCheck, Image, KeyRound, Lock } from "lucide-react";
import { updatePassword } from "@/services/authService";

interface ProfileFormValues {
  full_name: string;
  avatar_url: string | null;
  city: string;
  profession: string;
  birth_date: string;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isEmailProvider, setIsEmailProvider] = useState(false);
  
  const [profileValues, setProfileValues] = useState<ProfileFormValues>({
    full_name: "",
    avatar_url: null,
    city: "",
    profession: "",
    birth_date: ""
  });
  
  const [passwordValues, setPasswordValues] = useState<PasswordFormValues>({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  
  // Load user data
  useEffect(() => {
    if (user) {
      setProfileValues({
        full_name: user.full_name || "",
        avatar_url: user.avatar_url || null,
        city: "",
        profession: "",
        birth_date: ""
      });
      
      // Fetch additional profile data
      const fetchProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('city, profession, birth_date')
            .eq('id', user.id)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setProfileValues(prev => ({
              ...prev,
              city: data.city || "",
              profession: data.profession || "",
              birth_date: data.birth_date || "",
            }));
          }
          
          // Check if user is using email provider
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const providerInfo = session.user.app_metadata?.provider || "";
            setIsEmailProvider(providerInfo === "email" || !providerInfo);
          }
          
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };
      
      fetchProfileData();
    }
  }, [user]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update profile data in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileValues.full_name,
          city: profileValues.city,
          profession: profileValues.profession,
          birth_date: profileValues.birth_date,
          avatar_url: profileValues.avatar_url
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Refresh user data in context
      await refreshUser();
      
      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordValues.new_password !== passwordValues.confirm_password) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }
    
    if (passwordValues.new_password.length < 6) {
      toast.error("Password baru minimal 6 karakter");
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
      
      // Reset form
      setPasswordValues({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      
      toast.success("Password berhasil diperbarui");
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || "Gagal memperbarui password");
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const avatarInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi profil dan preferensi akun Anda
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Profil Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col-reverse sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex justify-center sm:block">
                  <div className="space-y-3">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileValues.avatar_url || undefined} alt={user?.full_name || ""} />
                      <AvatarFallback className="text-xl">{avatarInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url" className="flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        URL Avatar
                      </Label>
                      <Input 
                        id="avatar_url" 
                        name="avatar_url"
                        placeholder="https://example.com/avatar.jpg"
                        value={profileValues.avatar_url || ""}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Nama Lengkap
                      </Label>
                      <Input 
                        id="full_name" 
                        name="full_name"
                        value={profileValues.full_name}
                        onChange={handleProfileChange}
                        placeholder="Nama lengkap Anda"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Kota
                  </Label>
                  <Input 
                    id="city" 
                    name="city"
                    value={profileValues.city}
                    onChange={handleProfileChange}
                    placeholder="Kota"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profession" className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Profesi
                  </Label>
                  <Input 
                    id="profession" 
                    name="profession"
                    value={profileValues.profession}
                    onChange={handleProfileChange}
                    placeholder="Profesi"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Tanggal Lahir
                  </Label>
                  <Input 
                    id="birth_date" 
                    name="birth_date"
                    type="date"
                    value={profileValues.birth_date}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account_type" className="flex items-center gap-1">
                    <UserCircle className="w-4 h-4" />
                    Tipe Akun
                  </Label>
                  <Input 
                    id="account_type" 
                    value={user?.account_type || ""}
                    readOnly
                    disabled
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Password & Security Section */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Keamanan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {isEmailProvider ? (
                <>
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
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="w-full"
                    >
                      {passwordLoading ? "Memperbarui..." : "Perbarui Password"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <p className="text-amber-800 text-sm">
                      <Lock className="inline-block mr-2 h-4 w-4" />
                      Akun Anda terhubung dengan Google, sehingga tidak dapat merubah password.
                    </p>
                  </div>
                  
                  <Button 
                    type="button" 
                    disabled={true}
                    variant="outline"
                    className="w-full"
                  >
                    Perbarui Password
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
