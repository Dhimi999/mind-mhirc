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
  forwarding?: string;
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

export interface OAuthProfileData {
  birth_date: string;
  city: string;
  profession?: string;
  account_type: "general" | "professional";
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
    const redirectUrl = new URL('/email-confirmed', window.location.origin).toString();
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          birth_date: userData.birth_date,
          city: userData.city,
          profession: userData.profession,
          account_type: userData.account_type,
          forwarding: userData.forwarding
        },
        emailRedirectTo: redirectUrl
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

export const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const redirectTo = new URL('/auth/callback', window.location.origin).toString();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Google login error:", error);
    return {
      success: false,
      error: error.message || "Login dengan Google gagal. Silakan coba lagi."
    };
  }
};

export const checkOAuthProfileCompletion = async (): Promise<{ complete: boolean; userData?: Partial<AuthUser> }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { complete: false };
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    
    if (error) throw error;
    
    const userMetadata = session.user.user_metadata || {};
    
    const isProfileComplete = data && data.birth_date && data.city ? true : false;
    
    return { 
      complete: isProfileComplete,
      userData: {
        id: session.user.id,
        email: session.user.email,
        full_name: userMetadata.full_name || data?.full_name,
        avatar_url: userMetadata.avatar_url || data?.avatar_url,
        account_type: data?.account_type as "general" | "professional" || "general",
        birth_date: data?.birth_date,
        city: data?.city,
        profession: data?.profession,
        is_admin: data?.is_admin
      }
    };
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return { complete: false };
  }
};

export const completeOAuthProfile = async (
  profileData: OAuthProfileData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { 
        success: false, 
        error: "Sesi login tidak valid" 
      };
    }
    
    const userMetadata = session.user.user_metadata || {};
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: userMetadata.full_name || session.user.user_metadata?.name,
        avatar_url: userMetadata.avatar_url || session.user.user_metadata?.avatar_url,
        birth_date: profileData.birth_date,
        city: profileData.city,
        profession: profileData.profession,
        account_type: profileData.account_type,
        forwarding: session.user.email
      })
      .eq("id", session.user.id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Profile completion error:", error);
    return {
      success: false,
      error: error.message || "Gagal melengkapi profil. Silakan coba lagi."
    };
  }
};

export const signOut = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    localStorage.removeItem("supabase.auth.token");

    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);

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

export const resendConfirmationEmail = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const redirectUrl = new URL('/email-confirmed', window.location.origin).toString();
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Resend confirmation email error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengirim email konfirmasi. Silakan coba lagi."
    };
  }
};

export const sendPasswordResetEmail = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const redirectUrl = new URL('/set-new-password-forget', window.location.origin).toString();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Password reset email error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengirim email reset password. Silakan coba lagi."
    };
  }
};

export const deactivateAccount = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: "Sesi login tidak valid"
      };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        deactive_at: new Date().toISOString()
      })
      .eq("id", session.user.id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Account deactivation error:", error);
    return {
      success: false,
      error: error.message || "Gagal menonaktifkan akun. Silakan coba lagi."
    };
  }
};

export const reactivateAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: true,
        deactive_at: null
      })
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Account reactivation error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengaktifkan kembali akun. Silakan coba lagi."
    };
  }
};

export const sendReauthenticationToken = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: new URL('/email-confirmed', window.location.origin).toString()
      }
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Reauthentication token error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengirim token autentikasi. Silakan coba lagi."
    };
  }
};
