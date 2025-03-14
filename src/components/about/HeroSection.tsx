
import React from "react";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-gradient-to-b from-background to-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-primary/5 animate-float blur-3xl"></div>
      <div 
        className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full bg-secondary/5 animate-float blur-3xl" 
        style={{ animationDelay: '2s' }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Tentang <span className="text-primary">Mind MHIRC</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Pusat Riset Inovatif Kesehatan Mental yang didedikasikan untuk mengembangkan 
            solusi kesehatan mental yang berbasis bukti, peka budaya, dan terjangkau 
            untuk masyarakat Indonesia.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
