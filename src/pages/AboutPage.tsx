import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/seo/SEO";
import { RelatedContent } from "@/components/seo/InternalLinking";

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
      <SEO
        title="Tentang Mind MHIRC – Misi, Tim, dan Dampak"
        description="Kenali Mind MHIRC: pusat riset dan layanan kesehatan mental berbasis bukti dan peka budaya. Pelajari misi, tim, dan nilai yang kami pegang."
        canonicalPath="/about"
      />

      <main className="flex-1">
        <HeroSection />
        <MentalHealthImpact />
        <LogoMeaning />
        <OrganizationProfile />
        <TeamSection />
        <ContactSection />

        {/* Internal Linking untuk SEO */}
        <section className="container mx-auto px-4 pb-16">
          <RelatedContent
            title="Mulai Perjalanan Bersama Kami"
            links={[
              {
                to: "/services",
                text: "Layanan Kami",
                description: "Jelajahi konsultasi psikologis, program edukasi, dan semua layanan kesehatan mental Mind MHIRC"
              },
              {
                to: "/blog",
                text: "Blog & Artikel",
                description: "Baca artikel terbaru seputar kesehatan mental dari tim peneliti dan psikolog kami"
              },
              {
                to: "/safe-mother",
                text: "Program Safe Mother",
                description: "Program khusus untuk mendampingi ibu hamil dan pasca-nifas secara psikologis"
              },
              {
                to: "/spiritual-budaya",
                text: "Program Spiritual & Budaya",
                description: "Intervensi berbasis kearifan lokal dan spiritualitas untuk kesehatan mental"
              },
              {
                to: "/hibrida-cbt",
                text: "Hibrida Naratif CBT",
                description: "Terapi kognitif-perilaku berbasis naratif untuk rekonstruksi cerita diri yang lebih sehat"
              },
              {
                to: "/login",
                text: "Daftar & Masuk",
                description: "Buat akun Mind MHIRC untuk mengakses semua layanan digital secara personal"
              }
            ]}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
