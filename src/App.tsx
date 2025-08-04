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
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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

// ScrollToTop component to handle automatic scrolling
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
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
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

// Tests
// TestDetail
