import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Tests from "./pages/Tests";
import TestDetail from "./pages/TestDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AboutPage from "./pages/AboutPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import ForgetPassword from "./pages/ForgetPassword";
import SetNewPassword from "./pages/SetNewPassword";
import EmailConfirmed from "./pages/EmailConfirmed";
import TokenExpired from "./pages/TokenExpired";
import CompleteOAuthProfile from "./pages/CompleteOAuthProfile";
import SafeMother from "./pages/SafeMother";
import Psikoedukasi from "./pages/safe-mother/Psikoedukasi";
import ForumKonsultasi from "./pages/safe-mother/ForumKonsultasi";
import CBT from "./pages/safe-mother/CBT";
import Profil from "./pages/safe-mother/Profil";
import SpiritualBudaya from "./pages/SpiritualBudaya";
import SpiritualBudayaMateri from "./pages/SpiritualBudayaMateri";
import IntervensiPertemuan from "./pages/IntervensiPertemuan";
import IntervensiPenugasan from "./pages/IntervensiPenugasan";
import IntervensiPortalSesi from "./pages/IntervensiPortalSesi";
import HibridaNaratifCBT from "./pages/HibridaNaratifCBT";
import HibridaPortalSesi from "./pages/HibridaPortalSesi";
import HibridaPortalSesi2 from "./pages/HibridaPortalSesi2";
import PsikoedukasiPortalSesi from "./pages/PsikoedukasiPortalSesi";
import PsikoedukasiPortalSesi1 from "./pages/PsikoedukasiPortalSesi1";
import PsikoedukasiPortalSesi2 from "./pages/PsikoedukasiPortalSesi2";
import PsikoedukasiPortalSesi3 from "./pages/PsikoedukasiPortalSesi3";
import PsikoedukasiPortalSesi4 from "./pages/PsikoedukasiPortalSesi4";
import UnderMaintanance from "./pages/UnderMaintenance";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();
const ProtectedRoute = ({ children }) => {
  const { user, isLoading, isOAuthProfileIncomplete } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat Data...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to complete profile if needed
  if (isOAuthProfileIncomplete) {
    return (
      <Navigate to="/complete-profile" state={{ from: location }} replace />
    );
  }

  return children;
};

// Auth callback handler
const AuthCallback = () => {
  const { refreshUser, isLoading, isAuthenticated, isOAuthProfileIncomplete } =
    useAuth();
  const navigate = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      await refreshUser();
    };

    handleCallback();
  }, [refreshUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    if (isOAuthProfileIncomplete) {
      return <Navigate to="/complete-profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

// ScrollToTop with exception: keep scroll when switching tabs inside /hibrida-cbt (non-session paths)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    const isHibrida = pathname.startsWith('/hibrida-cbt');
    const wasHibrida = prev.startsWith('/hibrida-cbt');
    const isSession = /\/hibrida-cbt\/(intervensi|psikoedukasi)\/sesi\//.test(pathname);
    const wasSession = /\/hibrida-cbt\/(intervensi|psikoedukasi)\/sesi\//.test(prev);

    // Conditions to scroll:
    // 1. Navigating outside hibrida-cbt area
    // 2. Entering a session portal
    // 3. Leaving a session portal
    // 4. First time arriving to hibrida-cbt from outside
    const shouldScroll = !isHibrida || !wasHibrida || isSession || wasSession;
    if (shouldScroll) {
      try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch { window.scrollTo(0,0); }
    }
    prevPathRef.current = pathname;
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tests" element={<UnderMaintanance />} />
        <Route path="/tests/:id" element={<UnderMaintanance />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/safe-mother" element={<SafeMother />} />
        <Route path="/safe-mother/psikoedukasi" element={<Psikoedukasi />} />
        <Route path="/safe-mother/forum" element={<ForumKonsultasi />} />
        <Route path="/safe-mother/cbt" element={<CBT />} />
        <Route path="/safe-mother/profil" element={<Profil />} />
  <Route path="/spiritual-budaya" element={<SpiritualBudaya />} />
  <Route path="/spiritual-budaya/materi/:slug" element={<SpiritualBudayaMateri />} />
  <Route path="/spiritual-budaya/intervensi/sesi/:sesi" element={<IntervensiPortalSesi />} />
  <Route path="/spiritual-budaya/intervensi/sesi/:sesi/pertemuan" element={<IntervensiPertemuan />} />
  <Route path="/spiritual-budaya/intervensi/sesi/:sesi/penugasan" element={<IntervensiPenugasan />} />
    {/* Hibrida Naratif CBT service routes */}
  <Route path="/hibrida-cbt" element={<HibridaNaratifCBT />} />
  <Route path="/hibrida-cbt/:tab" element={<HibridaNaratifCBT />} />
  <Route path="/hibrida-cbt/intervensi/sesi/2" element={<HibridaPortalSesi2 />} />
  <Route path="/hibrida-cbt/intervensi/sesi/:sesi" element={<HibridaPortalSesi />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/1" element={<PsikoedukasiPortalSesi1 />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/2" element={<PsikoedukasiPortalSesi2 />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/3" element={<PsikoedukasiPortalSesi3 />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/4" element={<PsikoedukasiPortalSesi4 />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/5" element={<NotFound />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/6" element={<NotFound />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/7" element={<NotFound />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/8" element={<NotFound />} />
  <Route path="/hibrida-cbt/psikoedukasi/sesi/:sesi" element={<PsikoedukasiPortalSesi />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/publications" element={<UnderMaintanance />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/forget-password-by-email" element={<ForgetPassword />} />
        <Route path="/set-new-password-forget" element={<SetNewPassword />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/token-expired" element={<TokenExpired />} />
        <Route path="/complete-profile" element={<CompleteOAuthProfile />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    {/* 1. Tambahkan HelmetProvider sebagai pembungkus terluar */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

// Tests
// TestDetail
