
import React, { useState } from "react";
import { Sparkles, BarChart4, Heart, BookOpen, Users } from "lucide-react";

const OrganizationProfile = () => {
  const [activeTab, setActiveTab] = useState<"visi" | "misi" | "nilai">("visi");

  const tabs = [
    { id: "visi", label: "Visi Kami" },
    { id: "misi", label: "Misi Kami" },
    { id: "nilai", label: "Nilai-Nilai Kami" }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center fade-in">
            <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-4 py-1 text-secondary text-sm font-medium mb-4">
              <span>Profil Lembaga</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mind MHIRC: Inovasi untuk Kesehatan Mental
            </h2>
            <p className="text-muted-foreground">
              Menghubungkan penelitian ilmiah, teknologi, dan pemahaman budaya lokal
              untuk menciptakan solusi kesehatan mental yang inklusif dan efektif.
            </p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-soft mb-10 fade-in">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "visi" | "misi" | "nilai")}
                  className={`px-5 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="bg-muted rounded-lg p-6">
              {activeTab === "visi" && <VisionContent />}
              {activeTab === "misi" && <MissionContent />}
              {activeTab === "nilai" && <ValuesContent />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const VisionContent = () => (
  <div className="fade-in">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-xl font-bold">Visi Kami</h3>
    </div>
    
    <p className="mb-4 text-muted-foreground">
      Menjadi pusat unggulan dalam pengembangan dan implementasi solusi 
      kesehatan mental inovatif yang berbasis bukti dan peka budaya untuk 
      meningkatkan kesejahteraan mental masyarakat Indonesia.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-lg shadow-soft flex items-start space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h4 className="font-medium text-xl">Riset Berkualitas</h4>
          <p className="text-sm text-muted-foreground">
            Menghasilkan penelitian berkualitas tinggi yang relevan dengan konteks lokal
          </p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-soft flex items-start space-x-3">
        <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mt-1">
          <Users className="h-4 w-4 text-secondary" />
        </div>
        <div>
          <h4 className="font-medium text-xl">Inklusif</h4>
          <p className="text-sm text-muted-foreground">
            Layanan kesehatan mental yang dapat diakses oleh semua kalangan masyarakat
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MissionContent = () => (
  <div className="fade-in">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <BarChart4 className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-xl font-bold">Misi Kami</h3>
    </div>
    
    <ul className="space-y-4 mb-4">
      <li className="flex items-start">
        <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
          <span className="text-xs font-bold text-primary">1</span>
        </div>
        <p className="text-muted-foreground">
          Melakukan penelitian berkualitas tinggi untuk mengembangkan solusi kesehatan mental yang efektif dan peka budaya.
        </p>
      </li>
      
      <li className="flex items-start">
        <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
          <span className="text-xs font-bold text-primary">2</span>
        </div>
        <p className="text-muted-foreground">
          Mengembangkan teknologi dan inovasi untuk meningkatkan akses dan kualitas layanan kesehatan mental.
        </p>
      </li>
      
      <li className="flex items-start">
        <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
          <span className="text-xs font-bold text-primary">3</span>
        </div>
        <p className="text-muted-foreground">
          Menjalin kemitraan strategis dengan berbagai pemangku kepentingan untuk memperluas jangkauan layanan kesehatan mental.
        </p>
      </li>
      
      <li className="flex items-start">
        <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary/20">
          <span className="text-xs font-bold text-primary">4</span>
        </div>
        <p className="text-muted-foreground">
          Meningkatkan kesadaran masyarakat tentang pentingnya kesehatan mental melalui edukasi dan advokasi.
        </p>
      </li>
    </ul>
  </div>
);

const ValuesContent = () => (
  <div className="fade-in">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Heart className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-xl font-bold">Nilai-Nilai Kami</h3>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-soft">
        <h4 className="font-medium mb-2 flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">E</span>
          </div>
          Etis
        </h4>
        <p className="text-sm text-muted-foreground">
          Menjunjung tinggi prinsip-prinsip etika dalam semua aspek penelitian dan layanan.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-soft">
        <h4 className="font-medium mb-2 flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">I</span>
          </div>
          Inovatif
        </h4>
        <p className="text-sm text-muted-foreground">
          Terus mengembangkan pendekatan dan solusi baru yang efektif.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-soft">
        <h4 className="font-medium mb-2 flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">K</span>
          </div>
          Kolaboratif
        </h4>
        <p className="text-sm text-muted-foreground">
          Bekerja sama dengan berbagai pihak untuk mencapai tujuan bersama.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-soft">
        <h4 className="font-medium mb-2 flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">I</span>
          </div>
          Inklusif
        </h4>
        <p className="text-sm text-muted-foreground">
          Menghargai keberagaman dan memastikan akses yang setara bagi semua.
        </p>
      </div>
    </div>
  </div>
);

export default OrganizationProfile;
