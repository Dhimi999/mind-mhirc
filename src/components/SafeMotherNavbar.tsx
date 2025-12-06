import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  Home,
  BookOpen,
  MessageSquare,
  Brain,
  User,
  ArrowLeft
} from "lucide-react";

const SafeMotherNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Beranda", href: "/safe-mother", icon: Home },
    { name: "Psikoedukasi", href: "/safe-mother/psikoedukasi", icon: BookOpen },
    {
      name: "Forum & Konsultasi",
      href: "/safe-mother/forum",
      icon: MessageSquare
    },
    { name: "M-LIPI", href: "/safe-mother/cbt", icon: Brain },
    { name: "Profil", href: "/safe-mother/profil", icon: User }
  ];

  const isActive = (href: string) => {
    if (href === "/safe-mother") {
      return location.pathname === "/safe-mother";
    }
    // Khusus menu Forum & Konsultasi: aktifkan juga di private konsultasi
    if (href === "/safe-mother/forum") {
      return (
        location.pathname.startsWith("/safe-mother/forum") ||
        location.pathname.startsWith("/safe-mother/privatekonsultasi")
      );
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/safe-mother" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">Safe Mother</h1>
              <p className="text-xs text-pink-600 font-medium">MLIPI Program by Mind MHIRC</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Tombol Kembali ke Halaman Utama */}
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-white/50 text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-100 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>

            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200 transform scale-105"
                      : "text-gray-600 hover:text-pink-600 hover:bg-pink-50/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : ""}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-pink-100">
            <div className="space-y-2">
              {/* Tombol Kembali untuk Mobile */}
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Halaman Utama</span>
              </Link>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-pink-100 text-pink-700 shadow-soft"
                        : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SafeMotherNavbar;
