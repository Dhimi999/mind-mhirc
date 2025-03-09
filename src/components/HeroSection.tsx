import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button";
const HeroSection = () => {
  return <div className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background with nature image and overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90"></div>
        <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80" alt="Pemandangan yang menenangkan" className="w-full h-full object-cover" />
      </div>
      
      {/* Floating shapes for visual interest */}
      <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-primary/5 animate-float blur-3xl"></div>
      <div className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full bg-secondary/5 animate-float blur-3xl" style={{
      animationDelay: '2s'
    }}></div>
      <div className="absolute top-1/3 left-[15%] w-32 h-32 rounded-full bg-accent/5 animate-float blur-3xl" style={{
      animationDelay: '1s'
    }}></div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Hero Additional Container */}
        <div className="relative fade-in order-first lg:order-last" style={{
        animationDelay: '0.3s'
      }}>
          <div className="relative z-10 glass-effect p-6 rounded-2xl shadow-highlight max-w-lg md:max-w-lg sm:max-w-md xs:max-w-sm mx-auto h-auto">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600" alt="Profesional kesehatan mental" className="w-full h-auto rounded-xl object-cover" />
            
            <div className="absolute -bottom-6 -right-6 glass-effect p-4 rounded-xl shadow-soft animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-sm font-medium">Didukung oleh penelitian ilmiah</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 -left-16 lg:-left-16 md:left-8 sm:left-8 xs:left-8 transform -translate-y-1/2 glass-effect p-4 rounded-xl shadow-soft animate-float max-w-[200px]">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">Terapi Berbasis Bukti</span>
            </div>
          </div>
          
          <div className="absolute -top-8 right-12 glass-effect p-4 rounded-xl shadow-soft animate-float max-w-[220px]" style={{
          animationDelay: '1.5s'
        }}>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm font-medium">Pendekatan Peka Budaya</span>
            </div>
          </div>
        </div>

        {/* Hero Text Container */}
        <div className="space-y-6 md:space-y-8 fade-in order-last lg:order-first">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></span>
            <span>Kesehatan Mental untuk Semua</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Inovasi untuk <span className="text-primary">Kesehatan Mental</span> yang Lebih Baik
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground md:pr-12">
            Mind MHIRC memadukan riset ilmiah, teknologi inovatif, dan pendekatan peka budaya 
            untuk menghadirkan solusi kesehatan mental yang terjangkau dan efektif.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-2 md:pt-4">
            <Link to="/tests">
              <Button size="lg" className="w-full sm:w-auto">
                Coba Tes Mental <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-4 md:pt-6">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">20+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Jenis Tes Mental</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">5k+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pengguna Terdaftar</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">15+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pakar Kesehatan</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;