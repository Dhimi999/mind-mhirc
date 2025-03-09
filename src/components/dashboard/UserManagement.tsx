
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { 
  CalendarDays, 
  MapPin, 
  Briefcase, 
  UserCircle, 
  Shield,
  Trash2,
  Edit2,
  KeyRound,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

type Profile = Tables<'profiles'>;

interface UserRole {
  role: string;
  user_id: string;
}

const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    city: '',
    profession: '',
    birth_date: '',
    account_type: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    const fetchProfilesAndRoles = async () => {
      try {
        setLoading(true);
        
        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (profilesError) {
          throw profilesError;
        }
        
        setProfiles(profilesData || []);
        
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
        
        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          // Don't throw here, as we still want to display profiles even if roles fail
        }
        
        // Organize roles by user_id
        const rolesByUser: Record<string, string[]> = {};
        if (rolesData) {
          rolesData.forEach((roleData: UserRole) => {
            if (!rolesByUser[roleData.user_id]) {
              rolesByUser[roleData.user_id] = [];
            }
            rolesByUser[roleData.user_id].push(roleData.role);
          });
        }
        
        setUserRoles(rolesByUser);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Gagal memuat data pengguna. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfilesAndRoles();
  }, []);

  // Role badge color mapping
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super':
        return "bg-red-500";
      case 'admin':
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      city: user.city || '',
      profession: user.profession || '',
      birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      account_type: user.account_type || 'general'
    });
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = (user: Profile) => {
    setSelectedUser(user);
    setNewPassword('');
    
    // Fetch user's email
    const fetchUserEmail = async () => {
      try {
        // Since we can't query auth.users directly with the JavaScript client,
        // we'll try to use a workaround if possible
        // This is where an admin API or server-side function would be ideal
        setResetEmail(''); // Reset for now
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };
    
    fetchUserEmail();
    setIsResetPasswordDialogOpen(true);
  };

  const handleDeleteUser = (user: Profile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleAdmin = async (user: Profile) => {
    try {
      setIsSubmitting(true);
      
      const newAdminStatus = !(user.is_admin);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: newAdminStatus })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === user.id ? { ...profile, is_admin: newAdminStatus } : profile
      ));
      
      toast.success(`Status Admin untuk ${user.full_name} telah ${newAdminStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      toast.error('Gagal mengubah status admin. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditForm = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare the form data
      const formData: Partial<Profile> = {
        full_name: editForm.full_name,
        city: editForm.city,
        profession: editForm.profession,
        account_type: editForm.account_type
      };
      
      // Add birth_date only if it's provided
      if (editForm.birth_date) {
        formData.birth_date = editForm.birth_date;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === selectedUser.id 
          ? { ...profile, ...formData } 
          : profile
      ));
      
      setIsEditDialogOpen(false);
      toast.success('Profil pengguna berhasil diperbarui');
    } catch (err) {
      console.error('Error updating user profile:', err);
      toast.error('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      
      // In an actual implementation, we would use Supabase's admin functions
      // to reset a user's password. Since this requires admin/service role credentials,
      // we would typically implement this on the server side.
      
      // For a user-facing frontend, we can use passwordResetEmail instead:
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Email reset password telah dikirim ke pengguna');
      setIsResetPasswordDialogOpen(false);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      toast.error('Gagal mereset password. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      
      // In an actual implementation, we would use Supabase's admin functions
      // to delete a user, which requires admin/service role credentials.
      // This would typically be implemented on the server side.
      
      // For now, we'll just delete the user's profile record
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Remove from local state
      setProfiles(profiles.filter(profile => profile.id !== selectedUser.id));
      
      setIsDeleteDialogOpen(false);
      toast.success('Profil pengguna berhasil dihapus');
      
      // Note: In a real application, you would also need to delete the user from auth.users
      // using admin functions or an Edge Function with service role credentials
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error('Gagal menghapus profil. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card shadow-soft rounded-xl p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => setLoading(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <div className="text-sm text-muted-foreground">
          Total Pengguna: {profiles.length}
        </div>
      </div>
      
      <Card className="bg-card shadow-soft">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
            
            {profiles.length === 0 ? (
              <p className="text-muted-foreground">Belum ada pengguna terdaftar.</p>
            ) : (
              <div className="space-y-4 mt-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{profile.full_name || 'Nama tidak tersedia'}</h3>
                          {userRoles[profile.id]?.map((role, index) => (
                            <Badge key={index} className={`text-white ${getRoleBadgeColor(role)}`}>
                              {role}
                            </Badge>
                          ))}
                          {profile.is_admin && 
                            <Badge className="bg-purple-500 text-white">Admin</Badge>
                          }
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <UserCircle size={16} className="mr-2" />
                            <span>{profile.account_type || 'Tipe akun tidak tersedia'}</span>
                          </div>
                          {profile.birth_date && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarDays size={16} className="mr-2" />
                              <span>{formatDate(profile.birth_date)}</span>
                            </div>
                          )}
                          {profile.city && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin size={16} className="mr-2" />
                              <span>{profile.city}</span>
                            </div>
                          )}
                          {profile.profession && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Briefcase size={16} className="mr-2" />
                              <span>{profile.profession}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          <div>Bergabung: {formatDate(profile.created_at || '')}</div>
                          <div>ID: {profile.id.substring(0, 8)}...</div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm mr-1">Admin:</span>
                            <Switch 
                              checked={!!profile.is_admin} 
                              onCheckedChange={() => handleToggleAdmin(profile)}
                              disabled={isSubmitting}
                            />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isSubmitting}>
                                Aksi
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(profile)}>
                                <Edit2 size={16} className="mr-2" />
                                Edit Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(profile)}>
                                <KeyRound size={16} className="mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(profile)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Hapus Akun
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profil Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui detail profil untuk {selectedUser?.full_name || 'pengguna'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nama Lengkap
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                Kota
              </Label>
              <Input
                id="city"
                value={editForm.city}
                onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profession" className="text-right">
                Profesi
              </Label>
              <Input
                id="profession"
                value={editForm.profession}
                onChange={(e) => setEditForm({...editForm, profession: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birth_date" className="text-right">
                Tanggal Lahir
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={editForm.birth_date}
                onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_type" className="text-right">
                Tipe Akun
              </Label>
              <select
                id="account_type"
                value={editForm.account_type}
                onChange={(e) => setEditForm({...editForm, account_type: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="general">General</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button onClick={submitEditForm} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Kirim instruksi reset password ke email pengguna.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reset_email" className="text-right">
                  Email
                </Label>
                <Input
                  id="reset_email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Email pengguna"
                  className="col-span-3"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Link reset password akan dikirim ke email pengguna. Password baru hanya akan aktif setelah pengguna mengklik link tersebut.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button onClick={submitResetPassword} disabled={isSubmitting || !resetEmail}>
              {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun pengguna {selectedUser?.full_name}? Tindakan ini tidak dapat dibatalkan dan semua data pengguna akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-500 hover:bg-red-600" disabled={isSubmitting}>
              {isSubmitting ? "Menghapus..." : "Hapus Akun"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
