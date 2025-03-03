
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  birth_date?: string;
  city?: string;
  profession?: string;
  account_type: 'general' | 'professional';
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
  account_type?: 'general' | 'professional';
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!data) return null;
  
  return {
    id: session.user.id,
    email: session.user.email,
    full_name: data?.full_name,
    avatar_url: null, // Set to null since the column doesn't exist in profiles table
    account_type: data?.account_type as 'general' | 'professional'
  };
};

export const signUp = async (userData: SignUpData): Promise<{ success: boolean; error?: string }> => {
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

export const signIn = async (credentials: SignInData): Promise<{ success: boolean; error?: string }> => {
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

export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
    toast({
      title: "Gagal Logout",
      description: "Terjadi kesalahan saat logout. Silakan coba lagi.",
      variant: "destructive"
    });
  }
};
