import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigationItems = [{
    label: 'Tes',
    path: '/tests'
  }, {
    label: 'Layanan',
    path: '/services'
  }, {
    label: 'Blog',
    path: '/blog'
  }, {
    label: 'Tentang',
    path: '/about'
  }];
  const {
    isAuthenticated
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah berhasil keluar dari akun",
      variant: "default"
    });
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const onScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  const isActive = path => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };
  return <>
      <nav className={`fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 ${isScrolled ? 'glass-effect py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">Mind MHIRC</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigationItems.map(item => <Link key={item.path} to={item.path} className={`font-medium text-sm transition-colors ${isActive(item.path) ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                {item.label}
              </Link>)}
          </div>

          {/* Desktop Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? <>
                <Link to="/dashboard" className={`font-medium text-sm transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-50 bg-sky-800 hover:bg-sky-150 focus:ring-2 focus:ring-sky-500">
                  Logout
                </Button>
              </> : <Link to="/login">
                <Button variant="outline" size="sm" className="text-slate-50 bg-sky-800 hover:bg-sky-150 focus:ring-2 focus:ring-sky-500">
                  Login
                </Button>
              </Link>}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden focus:outline-none" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && <div className="md:hidden glass-effect">
          <div className="px-6 py-4 space-y-4">
            {navigationItems.map(item => <Link key={item.path} to={item.path} className={`block font-medium text-sm transition-colors ${isActive(item.path) ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                {item.label}
              </Link>)}
            <div className="pt-4 flex flex-col space-y-2">
              {isAuthenticated ? <>
                  <Link to="/dashboard" className={`block font-medium text-sm transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </> : <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>}
            </div>
          </div>
        </div>}
    </>;
};
export default Navbar;