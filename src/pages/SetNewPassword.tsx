
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SetNewPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleInitialAuth = async () => {
      try {
        // Check if we have token in the URL hash fragment
        const hash = window.location.hash;
        if (hash && hash.includes('error=')) {
          // If there's an error in the hash, redirect to the token expired page
          console.error("Token error found in URL:", hash);
          navigate('/token-expired', { replace: true });
          return;
        }

        const fragment = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = fragment.get("access_token");
        const refreshToken = fragment.get("refresh_token");
        const type = fragment.get("type");

        if (accessToken && type === "recovery") {
          // Set the session with the received tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("Error setting session:", error);
            setHasError(true);
            toast({
              title: "Link Tidak Valid",
              description: "Link reset password tidak valid atau telah kadaluarsa",
              variant: "destructive",
            });
            setTimeout(() => navigate('/token-expired', { replace: true }), 2000);
          } else if (data.session) {
            setEmail(data.session.user.email || "");
          }
        } else {
          // Try to get the current session as a fallback
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            setEmail(session.user.email);
          } else {
            // No valid session or token
            setHasError(true);
            toast({
              title: "Sesi Tidak Valid",
              description: "Silakan gunakan link reset password dari email Anda",
              variant: "destructive",
            });
            setTimeout(() => navigate('/token-expired', { replace: true }), 2000);
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setHasError(true);
        setTimeout(() => navigate('/token-expired', { replace: true }), 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    handleInitialAuth();
  }, [toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Tidak Cocok",
        description: "Password dan konfirmasi password harus sama",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Password Berhasil Diperbarui",
        description: "Silakan login dengan password baru Anda",
      });
      
      // Sign out after password reset to force a fresh login
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Gagal Memperbarui Password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-navbar">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-md mx-auto text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold mb-4">Memverifikasi Link...</h1>
              <p className="text-muted-foreground">
                Mohon tunggu sebentar sementara kami memverifikasi link reset password Anda.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-navbar">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-md mx-auto text-center">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">Link Tidak Valid</h1>
              <p className="text-muted-foreground mb-6">
                Link reset password tidak valid atau telah kadaluarsa. Silakan meminta link reset password baru.
              </p>
              <Button onClick={() => navigate("/forget-password-by-email")}>
                Minta Link Baru
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-navbar">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Atur Password Baru</h1>
              <p className="text-muted-foreground">
                Buat password baru untuk akun Anda
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-8 shadow-soft">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memperbarui..." : "Perbarui Password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SetNewPassword;
