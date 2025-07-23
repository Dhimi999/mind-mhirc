
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the absolute path including the domain
      const redirectUrl = new URL('/set-new-password-forget', window.location.origin).toString();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Email Terkirim",
        description: "Silakan periksa email Anda untuk instruksi reset password",
      });
    } catch (error: any) {
      toast({
        title: "Gagal Mengirim Email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowAdditionalInfo(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Lupa Password</h1>
              <p className="text-muted-foreground">
                Masukkan email Anda untuk menerima instruksi reset password
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Mengirim..." : "Kirim Instruksi Reset"}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  Jika email Anda terdaftar, Anda akan menerima email berisi instruksi untuk reset password.
                </p>
              </div>

              {showAdditionalInfo && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Apakah Anda merasa akun belum terdaftar?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Buat akun
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgetPassword;
