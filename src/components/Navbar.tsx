import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Navigation Items
  const navigationItems = [
    { label: "Tes Mental", path: "/tests" },
    { label: "Layanan", path: "/services" },
    { label: "Blog", path: "/blog" },
    { label: "Tentang", path: "/about" },
  ];

  // Logout Handler
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah berhasil keluar dari akun",
      variant: "default",
    });
  };

  // Toggle Menu Burger
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Scroll Handler
  const onScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Tutup menu burger saat ganti halaman
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check Active Link
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 ${
          isScrolled ? "glass-effect py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">Mind MHIRC</span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium text-sm transition-colors ${
                  isActive(item.path)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Bagian Authentication (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`font-medium text-sm transition-colors ${
                    isActive("/dashboard")
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-50 bg-sky-800 hover:bg-sky-150 focus:ring-2 focus:ring-sky-500"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-50 bg-sky-800 hover:bg-sky-150 focus:ring-2 focus:ring-sky-500"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Tombol Burger (Mobile) */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Menu Dropdown (Mobile) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full glass-effect z-40">
          <div className="px-6 py-4 space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block font-medium text-sm transition-colors ${
                  isActive(item.path)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`block font-medium text-sm transition-colors ${
                      isActive("/dashboard")
                        ? "text-primary"
                        : "text-foreground/80 hover:text-primary"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-50 bg-sky-800 hover:bg-sky-150 focus:ring-2 focus:ring-sky-500"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-50 bg-sky-800 hover:bg-sky-150 focus:ring-2 focus:ring-sky-500 w-full"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
