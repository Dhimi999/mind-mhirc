
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EmailConfirmed = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Email Terkonfirmasi!</h1>
            <p className="text-muted-foreground mb-8">
              Alamat email Anda telah berhasil dikonfirmasi. Sekarang Anda dapat login ke akun Anda.
            </p>
            
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
