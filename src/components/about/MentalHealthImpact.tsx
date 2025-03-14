
import React from "react";
import { Brain, Activity, UserCheck } from "lucide-react";

const MentalHealthImpact = () => {
  return (
    <section className="py-16 px-4 sm:px-6 bg-gradient-to-tr from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></span>
            <span>Dampak Kesehatan Mental</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Mengapa Kesehatan Mental Sangat Penting?
          </h2>
          <p className="text-muted-foreground">
            Kesehatan mental yang baik sama pentingnya dengan kesehatan fisik. Kondisi mental yang sehat 
            memungkinkan kita untuk mengembangkan potensi diri, mengatasi stres kehidupan, 
            dan berkontribusi positif dalam masyarakat.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in">
          <ImpactCard 
            icon={<Brain className="h-7 w-7 text-primary" />}
            title="Kesehatan Otak"
            color="primary"
            items={[
              "Meningkatkan fungsi kognitif dan daya ingat",
              "Mendukung pembuatan keputusan yang lebih baik",
              "Meningkatkan neuroplastisitas otak"
            ]}
            stat="48% penderita gangguan mental mengalami penurunan fungsi kognitif"
          />
          
          <ImpactCard 
            icon={<Activity className="h-7 w-7 text-secondary" />}
            title="Kesehatan Fisik"
            color="secondary"
            items={[
              "Memperkuat sistem kekebalan tubuh",
              "Menurunkan risiko penyakit jantung dan stroke",
              "Memperbaiki kualitas tidur dan energi"
            ]}
            stat="67% pasien dengan gangguan mental kronis memiliki masalah kesehatan fisik"
          />
          
          <ImpactCard 
            icon={<UserCheck className="h-7 w-7 text-accent-600" />}
            title="Kualitas Hidup"
            color="accent"
            items={[
              "Meningkatkan kepuasan dan kebahagiaan hidup",
              "Memperkuat hubungan dan koneksi sosial",
              "Meningkatkan produktivitas dan kreativitas"
            ]}
            stat="85% orang melaporkan peningkatan kualitas hidup setelah terapi"
          />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute left-0 bottom-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
      <div className="absolute right-20 top-20 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
      <div className="absolute right-0 bottom-1/3 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
    </section>
  );
};

interface ImpactCardProps {
  icon: React.ReactNode;
  title: string;
  color: "primary" | "secondary" | "accent";
  items: string[];
  stat: string;
}

const ImpactCard = ({ icon, title, color, items, stat }: ImpactCardProps) => {
  const colorClasses = {
    bg: {
      primary: "bg-primary/10",
      secondary: "bg-secondary/10",
      accent: "bg-accent/10"
    },
    text: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent-600"
    },
    gradient: {
      primary: "from-primary/0 to-primary/5",
      secondary: "from-secondary/0 to-secondary/5",
      accent: "from-accent/0 to-accent/5"
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-medium transition-all duration-300 hover:shadow-highlight bg-white/90 backdrop-blur-sm relative h-full group">
      <div className={`absolute inset-0 bg-gradient-to-b ${colorClasses.gradient[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full transform translate-x-16 -translate-y-16"></div>
      
      <div className="p-8 relative z-10">
        <div className={`w-14 h-14 ${colorClasses.bg[color]} rounded-2xl flex items-center justify-center mb-6`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        
        <div className="space-y-4 text-muted-foreground">
          {items.map((item, index) => (
            <div key={index} className="flex items-start">
              <div className={`mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full ${colorClasses.bg[color]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 ${colorClasses.text[color]}`}>
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
        
        <div className={`mt-8 flex items-center ${colorClasses.text[color]} font-medium`}>
          <span className="text-sm">{stat}</span>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthImpact;
