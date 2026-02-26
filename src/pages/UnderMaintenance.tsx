import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const UnderMaintanance = () => {
  return <div className="min-h-screen flex flex-col">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Segera Hadir | Mind MHIRC</title>
      </Helmet>
      <Navbar />       
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">503</h1>
          <p className="text-xl text-gray-600 mb-4">Whops! Halaman sedang dalam Pemeliharaan</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Kembali ke Beranda
        </a>
        </div>
      </div>
      <Footer />
    </div>;
};

export default UnderMaintanance;