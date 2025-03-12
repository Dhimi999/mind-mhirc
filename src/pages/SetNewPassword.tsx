import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getSession();
  }, []);

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
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Password Berhasil Diperbarui",
        description: "Silakan login dengan password baru Anda",
      });
      
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
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
                  <Input id="email" type="email" value={email} disabled />
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

              {/* Teks tambahan yang selalu muncul */}
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Apakah Anda merasa email belum terdaftar?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-primary font-medium hover:underline ml-1"
                  >
                    Mari buat akun baru
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SetNewPassword;
