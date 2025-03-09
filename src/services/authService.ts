import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  birth_date?: string;
  city?: string;
  profession?: string;
  account_type: "general" | "professional";
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string | null;
  account_type?: "general" | "professional";
  is_admin?: boolean | null;
  birth_date?: string | null;
  city?: string | null;
  profession?: string | null;
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!data) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    full_name: data?.full_name,
    avatar_url: data?.avatar_url,
    account_type: data?.account_type as "general" | "professional",
    birth_date: data?.birth_date,
    city: data?.city,
    profession: data?.profession,
    is_admin: data?.is_admin
  };
};

export const signUp = async (
  userData: SignUpData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          birth_date: userData.birth_date,
          city: userData.city,
          profession: userData.profession,
          account_type: userData.account_type
        }
      }
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: error.message || "Pendaftaran gagal. Silakan coba lagi."
    };
  }
};

export const signIn = async (
  credentials: SignInData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.message || "Login gagal. Silakan coba lagi."
    };
  }
};

export const signOut = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // First clear the local session
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    // Clear any local storage items related to auth if needed
    localStorage.removeItem("supabase.auth.token");

    // Return success
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);

    // Even if there's an error, we want to attempt to clear local state
    localStorage.removeItem("supabase.auth.token");

    return {
      success: false,
      error:
        error.message || "Terjadi kesalahan saat logout. Silakan coba lagi."
    };
  }
};

export const updateProfile = async (
  profileData: Partial<{
    full_name: string;
    city: string;
    profession: string;
    avatar_url: string;
  }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: "Anda harus login untuk memperbarui profil"
      };
    }

    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", session.user.id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui profil. Silakan coba lagi."
    };
  }
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session || !session.user.email) {
      return {
        success: false,
        error: "Sesi login tidak valid"
      };
    }

    // First verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword
    });

    if (signInError) {
      return {
        success: false,
        error: "Password saat ini tidak valid"
      };
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Password update error:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui password. Silakan coba lagi."
    };
  }
};
