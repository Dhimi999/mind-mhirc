import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LoginRequired: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-white">
      <Navbar />
      <main className="h-screen flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-teal-200 px-6 sm:px-8 py-10 max-w-md w-full mx-4 text-center relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <span className="text-5xl select-none" role="img" aria-label="lock">🔒</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-teal-700 mt-6">Login Diperlukan</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Untuk mengakses sesi Psikoedukasi Hibrida Naratif CBT, Anda harus login terlebih dahulu.<br />
            <span className="font-semibold text-teal-700">Layanan ini hanya untuk peserta terdaftar Mind MHIRC.</span>
          </p>
          <a href="/login?redirect=/hibrida-cbt/psikoedukasi" className="inline-block bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-base sm:text-lg shadow transition">
            Login
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginRequired;
