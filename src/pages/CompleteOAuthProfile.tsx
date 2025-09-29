import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { checkOAuthProfileCompletion } from "@/services/authService";
import OAuthProfileCompletion from "@/components/OAuthProfileCompletion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CompleteOAuthProfile = () => {
  const { isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userData, setUserData] = useState<{
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const { complete, userData } = await checkOAuthProfileCompletion();

        if (userData) {
          setUserData({
            email: userData.email,
            fullName: userData.full_name,
            avatarUrl: userData.avatar_url || undefined
          });
        }

        setIsProfileComplete(complete);
      } catch (error) {
        console.error("Error checking profile status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!authLoading) {
      checkProfileStatus();
    }
  }, [authLoading]);

  // Show loading while checking
  if (authLoading || isChecking) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat Data...</p>
      </div>
    );
  }

  // If profile is already complete, redirect to dashboard
  if (isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Lengkapi Profil Anda</h1>
              <p className="text-muted-foreground">
                Beberapa informasi tambahan diperlukan untuk melengkapi akun
                Anda
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-soft">
              <OAuthProfileCompletion
                email={userData?.email}
                fullName={userData?.fullName}
                avatarUrl={userData?.avatarUrl}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompleteOAuthProfile;
