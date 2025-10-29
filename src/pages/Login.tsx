import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    // Check if register param is present in URL
    if (searchParams.get("register") === "true") {
      setActiveTab("register");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Login | Mind MHIRC</title>
      </Helmet>
      <Navbar />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === "login"
                  ? "Login ke Akun Anda"
                  : "Daftar Akun Baru"}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === "login"
                  ? "Masuk untuk mengakses fitur dan layanan Mind MHIRC"
                  : "Buat akun untuk memulai perjalanan kesehatan mental Anda"}
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-soft">
              <div className="flex border-b mb-6">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "login"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "register"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Daftar
                </button>
              </div>

              <LoginForm
                isRegister={activeTab === "register"}
                onToggleMode={() =>
                  setActiveTab(activeTab === "login" ? "register" : "login")
                }
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
