
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, getCurrentUser, signOut, checkOAuthProfileCompletion } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOAuthProfileIncomplete: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOAuthProfileIncomplete: false,
  refreshUser: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOAuthProfileIncomplete, setIsOAuthProfileIncomplete] = useState(false);
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      console.log("Current user from refreshUser:", currentUser);
      setUser(currentUser);
      
      // Check if OAuth profile needs completion (has auth but missing birth_date/city)
      if (currentUser) {
        const { complete } = await checkOAuthProfileCompletion();
        setIsOAuthProfileIncomplete(!complete);
      } else {
        setIsOAuthProfileIncomplete(false);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { success, error } = await signOut();

      if (success) {
        // Clear all session data
        setUser(null);
        localStorage.removeItem("supabase.auth.token");

        toast({
          title: "Logout Berhasil",
          description: "Anda telah berhasil keluar dari akun",
          variant: "default"
        });
      } else if (error) {
        throw new Error(error);
      }
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({
        title: "Gagal Logout",
        description: "Terjadi kesalahan saat logout. Silakan coba lagi.",
        variant: "destructive"
      });
      // Force clear user state anyway
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial user fetch
    refreshUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "Auth state changed:",
          event,
          session ? "Session exists" : "No session"
        );

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          refreshUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      // Clean up subscription
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isOAuthProfileIncomplete,
        refreshUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
