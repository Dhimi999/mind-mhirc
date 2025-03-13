
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TokenExpired = () => {
  const location = useLocation();
  
  // Extract error information from URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");
    
    console.log("Auth error details:", { error, errorCode, errorDescription });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Link Telah Kadaluarsa</h1>
            <p className="text-muted-foreground mb-8">
              Maaf, link yang Anda gunakan telah kadaluarsa atau tidak valid. Silakan minta link baru atau coba login ke akun Anda.
            </p>
            
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TokenExpired;
