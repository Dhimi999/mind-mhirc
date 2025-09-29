// Anda bisa membuat komponen baru, atau memodifikasi ProtectedRoute
// Mari kita buat yang baru agar lebih jelas: ProtectedLayout.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedLayout = () => {
  const { user, isLoading, isOAuthProfileIncomplete } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Tampilkan loading spinner
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat Data...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect ke login jika tidak ada user
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isOAuthProfileIncomplete) {
    // Redirect untuk melengkapi profil
    return (
      <Navigate to="/complete-profile" state={{ from: location }} replace />
    );
  }

  // Jika semua pemeriksaan lolos, render rute anak-anaknya
  return <Outlet />;
};

export default ProtectedLayout;
