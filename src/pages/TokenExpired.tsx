
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowRight, RefreshCw, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { sendReauthenticationToken } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

const TokenExpired = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Extract error information from URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");
    
    console.log("Auth error details:", { error, errorCode, errorDescription });
  }, []);

  const handleSendToken = async () => {
    if (!email || !email.includes('@')) {
      toast.error("Masukkan alamat email yang valid");
      return;
    }

    setIsSending(true);
    try {
      const { success, error } = await sendReauthenticationToken(email);
      
      if (success) {
        toast.success("Token autentikasi telah dikirim ke email Anda");
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim token autentikasi");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!email || !token) {
      toast.error("Masukkan email dan token");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;
      
      toast.success("Verifikasi berhasil!");
      navigate("/email-confirmed");
    } catch (error: any) {
      toast.error(error.message || "Token tidak valid, silakan coba lagi");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
  <main className="flex-1 pt-navbar">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Link Telah Kadaluarsa</h1>
            <p className="text-muted-foreground mb-8">
              Maaf, link yang Anda gunakan telah kadaluarsa atau tidak valid. Silakan pilih salah satu opsi di bawah ini.
            </p>
            
            <Tabs defaultValue="reset-password" className="mt-8">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="reset-password">Reset Password</TabsTrigger>
                <TabsTrigger value="reauthenticate">Autentikasi Ulang</TabsTrigger>
              </TabsList>

              <TabsContent value="reset-password" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Jika Anda mencoba mereset password, minta link baru atau kembali ke halaman login.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/forget-password-by-email">
                    Minta Link Reset Password Baru
                  </Link>
                </Button>
                
                <Button asChild className="w-full">
                  <Link to="/login">
                    Kembali ke Halaman Login
                  </Link>
                </Button>
              </TabsContent>

              <TabsContent value="reauthenticate" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Jika Anda mencoba mengonfirmasi email, isi data berikut untuk melakukan autentikasi ulang:
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSendToken}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Kirim Token ke Email
                      </>
                    )}
                  </Button>
                  
                  <div className="space-y-2 text-left">
                    <label htmlFor="token" className="text-sm font-medium">Token</label>
                    <Input 
                      id="token" 
                      placeholder="Masukkan token dari email"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Periksa kotak masuk email Anda untuk menemukan token
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleVerifyToken}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Autentikasi Akun
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TokenExpired;
