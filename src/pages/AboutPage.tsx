import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Import refactored components
import HeroSection from "@/components/about/HeroSection";
import MentalHealthImpact from "@/components/about/MentalHealthImpact";
import LogoMeaning from "@/components/about/LogoMeaning";
import OrganizationProfile from "@/components/about/OrganizationProfile";
import TeamSection from "@/components/about/TeamSection";
import ContactSection from "@/components/about/ContactSection";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <MentalHealthImpact />
        <LogoMeaning />
        <OrganizationProfile />
        <TeamSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
