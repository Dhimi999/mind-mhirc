import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Eye,
  Key,
  Trash2,
  MoreVertical,
  Search,
  BadgeCheck,
  User,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Pencil
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  account_type: string | null;
  is_admin: boolean | null;
  avatar_url: string | null;
  forwarding: string | null;
  city: string | null;
  profession: string | null;
  birth_date: string | null;
  created_at: string | null;
}

const USERS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      // Implement edge function call for password reset
      toast.success("Reset password akan diimplementasikan melalui Edge Function");
      setShowResetPassword(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Gagal mereset password");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete the user from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedUser.id);
        
      if (profileError) throw profileError;
      
      toast.success("Pengguna berhasil dihapus");
      setShowDeleteConfirm(false);
      
      // Update local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus pengguna");
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean | null) => {
    if (!user?.is_admin) {
      toast.error("Anda tidak memiliki izin untuk melakukan tindakan ini");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !isCurrentlyAdmin })
        .eq("id", userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !isCurrentlyAdmin } : u
      ));
      
      toast.success(`User ${isCurrentlyAdmin ? "bukan lagi admin" : "sekarang menjadi admin"}`);

      
      // Update selected user if it's the currently selected one
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, is_admin: !isCurrentlyAdmin });
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Gagal mengubah status admin");
    }
  };

  const handleSaveUserDetails = async () => {
    if (!selectedUser || !editedUser) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update(editedUser)
        .eq("id", selectedUser.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedUser = { ...selectedUser, ...editedUser };
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      
      toast.success("Detail pengguna berhasil diperbarui");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("Gagal memperbarui detail pengguna");
    }
  };

  // Filter users based on search query and active tab
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = !searchQuery || 
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.forwarding && user.forwarding.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Tab filter
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "general") return matchesSearch && user.account_type === "general";
    if (activeTab === "professional") return matchesSearch && user.account_type === "professional";
    if (activeTab === "admin") return matchesSearch && user.is_admin === true;
    
    return matchesSearch;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE, 
    currentPage * USERS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Pengguna</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Kelola profil pengguna, reset password, dan atur hak akses
          </CardDescription>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
              />
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => {
                setActiveTab(v);
                setCurrentPage(1); // Reset to first page on tab change
              }}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Tidak ada pengguna yang sesuai dengan pencarian"
                  : "Tidak ada pengguna yang terdaftar"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Informasi Pengguna</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {userItem.avatar_url ? (
                                <img
                                  src={userItem.avatar_url}
                                  alt={userItem.full_name || "User"}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{userItem.full_name || "Tanpa Nama"}</p>
                              <p className="text-sm text-muted-foreground">
                                {userItem.forwarding || "No email"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={text-xs px-2 py-0.5 rounded-full ${
                                  userItem.account_type === "professional" 
                                    ? "bg-blue-100 text-blue-700" 
                                    : "bg-green-100 text-green-700"
                                }}>
                                  {userItem.account_type === "professional" ? "Professional" : "General"}
                                </span>
                                {userItem.is_admin && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                    Admin
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  ID: {userItem.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowUserDetails(true);
                                  setEditMode(false);
                                  setEditedUser({});
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Detail Pengguna</span>
                              </DropdownMenuItem>
                              {user?.is_admin && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(userItem);
                                      setEditMode(true);
                                      setEditedUser({
                                        full_name: userItem.full_name,
                                        forwarding: userItem.forwarding,
                                        city: userItem.city,
                                        profession: userItem.profession
                                      });
                                      setShowUserDetails(true);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit Profil</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(userItem);
                                      setShowResetPassword(true);
                                    }}
                                  >
                                    <Key className="mr-2 h-4 w-4" />
                                    <span>Reset Password</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(userItem);
                                      setShowDeleteConfirm(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus Pengguna</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleAdmin(userItem.id, userItem.is_admin)}
                                  >
                                    {userItem.is_admin ? (
                                      <>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Batalkan Admin</span>
                                      </>
                                    ) : (
                                      <>
                                        <BadgeCheck className="mr-2 h-4 w-4" />
                                        <span>Jadikan Admin</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Profil Pengguna" : "Detail Pengguna"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Ubah informasi profil pengguna" : "Informasi lengkap tentang pengguna ini"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name || "User"}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  {editMode ? (
                    <Input 
                      value={editedUser.full_name || ''} 
                      onChange={(e) => setEditedUser({...editedUser, full_name: e.target.value})}
                      placeholder="Nama Lengkap"
                      className="mb-1"
                    />
                  ) : (
                    <h3 className="font-medium">{selectedUser.full_name || "Tanpa Nama"}</h3>
                  )}
                  
                  {editMode ? (
                    <Input 
                      value={editedUser.forwarding || ''} 
                      onChange={(e) => setEditedUser({...editedUser, forwarding: e.target.value})}
                      placeholder="Email"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.forwarding || "No email"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">ID Pengguna</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Jenis Akun</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedUser.account_type || "Tidak diketahui"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status Admin</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.is_admin ? "Ya" : "Tidak"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tanggal Lahir</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.birth_date || "Tidak diisi"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Kota</p>
                  {editMode ? (
                    <Input 
                      value={editedUser.city || ''} 
                      onChange={(e) => setEditedUser({...editedUser, city: e.target.value})}
                      placeholder="Kota"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.city || "Tidak diisi"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Profesi</p>
                  {editMode ? (
                    <Input 
                      value={editedUser.profession || ''} 
                      onChange={(e) => setEditedUser({...editedUser, profession: e.target.value})}
                      placeholder="Profesi"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.profession || "Tidak diisi"}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Tanggal Bergabung</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleString("id-ID")
                      : "Tidak diketahui"}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setEditMode(false);
                  setEditedUser({});
                }}>
                  Batal
                </Button>
                <Button onClick={handleSaveUserDetails}>
                  Simpan Perubahan
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                  Tutup
                </Button>
                {user?.is_admin && selectedUser && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditMode(true);
                        setEditedUser({
                          full_name: selectedUser.full_name,
                          forwarding: selectedUser.forwarding,
                          city: selectedUser.city,
                          profession: selectedUser.profession
                        });
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profil
                    </Button>
                    <Button onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.is_admin)}>
                      {selectedUser.is_admin ? "Batalkan Admin" : "Jadikan Admin"}
                    </Button>
                  </>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password untuk pengguna {selectedUser?.full_name || "ini"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm">
              Masukkan password baru untuk pengguna ini.
            </p>
            
            <Input
              placeholder="Password baru"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>
              Batal
            </Button>
            <Button onClick={handleResetPassword} disabled={!newPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna {selectedUser?.full_name || "ini"}?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600">
              Hapus Pengguna
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
