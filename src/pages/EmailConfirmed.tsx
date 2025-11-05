
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailConfirmed = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if there's an error in the URL hash
        const hash = window.location.hash;
        if (hash && hash.includes('error=')) {
          console.error("Error in hash found:", hash);
          navigate('/token-expired', { replace: true });
          return;
        }
        
        // First, attempt to get the hash fragment from the URL
        const fragment = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = fragment.get("access_token");
        const refreshToken = fragment.get("refresh_token");
        const type = fragment.get("type");

        if (accessToken && (type === "signup" || type === "recovery")) {
          // Set the session with the received tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("Error setting session:", error);
            throw error;
          }
          
          // Successfully set the session
          setIsVerified(true);
          toast({
            title: "Email Berhasil Dikonfirmasi",
            description: "Akun Anda telah aktif. Silakan login untuk melanjutkan.",
          });
          
          // If it's a signup confirmation, we should sign out to force them to login properly
          if (type === "signup") {
            await supabase.auth.signOut();
          }
        } else {
          // As a fallback, check if we have an active session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setIsVerified(true);
          } else {
            throw new Error("Token tidak valid atau telah kadaluarsa");
          }
        }
      } catch (error: any) {
        console.error("Email confirmation error:", error);
        toast({
          title: "Gagal Mengkonfirmasi Email",
          description: error.message,
          variant: "destructive",
        });
        setIsVerified(false);
        setTimeout(() => navigate('/token-expired', { replace: true }), 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailConfirmation();
  }, [toast, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
  <main className="flex-1 pt-navbar">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-md mx-auto text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold mb-4">Memverifikasi Email...</h1>
              <p className="text-muted-foreground">
                Mohon tunggu sebentar sementara kami memverifikasi email Anda.
              </p>
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
          <div className="max-w-md mx-auto text-center">
            {isVerified ? (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Email Terkonfirmasi!</h1>
                <p className="text-muted-foreground mb-8">
                  Alamat email Anda telah berhasil dikonfirmasi. Sekarang Anda dapat login ke akun Anda.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Verifikasi Gagal</h1>
                <p className="text-muted-foreground mb-8">
                  Maaf, kami tidak dapat memverifikasi email Anda. Link mungkin telah kadaluarsa atau tidak valid.
                </p>
              </>
            )}
            
            <Button asChild size="lg">
              <Link to="/login">
                Login ke Akun Anda
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailConfirmed;
