
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { CalendarDays, MapPin, Briefcase, UserCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
                      <div className="text-sm text-muted-foreground">
                        <div>Bergabung: {formatDate(profile.created_at || '')}</div>
                        <div>ID: {profile.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
