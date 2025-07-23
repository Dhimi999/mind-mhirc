
import React from "react";
import { Sparkles, Lightbulb, Network, Brain } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LogoMeaning = () => {
  return (
    <section className="py-16 px-4 sm:px-6 bg-background relative overflow-hidden">
      <div className="absolute right-0 top-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute left-20 bottom-20 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-10 fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Logo Kami</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Makna Logo Mind MHIRC
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Logo kami merepresentasikan visi dan misi Mind MHIRC sebagai pusat riset inovatif 
            kesehatan mental yang menghubungkan ilmu pengetahuan dengan solusi praktis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center order-1">
            <div className="relative">
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/5 via-accent/5 to-secondary/5 rounded-full animate-spin-slow blur-3xl opacity-70"></div>
              <div className="relative overflow-hidden rounded-full p-2 bg-gradient-to-tr from-primary/30 to-secondary/30 shadow-xl">
                <div className="bg-white rounded-full p-4">
                  <img 
                    src="web_tumbnail\f1e145af-f219-4e03-adfb-d4d892faee8a.png"
                    alt="Logo Mind MHIRC"
                    className="w-48 h-48 md:w-60 md:h-60 object-contain relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 order-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="lamp">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">Lampu Pengetahuan</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground pl-[52px]">
                    Melambangkan pencerahan, inovasi, dan solusi baru dalam kesehatan mental.
                    Cahaya yang menerangi jalan untuk pemahaman yang lebih baik tentang kesehatan mental.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="network">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Network className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="font-semibold text-lg">Koneksi Jaringan</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground pl-[52px]">
                    Garis-garis yang menghubungkan melambangkan integrasi ilmu pengetahuan, 
                    teknologi, dan praktik klinis. Juga mewakili kolaborasi antara berbagai 
                    pemangku kepentingan dalam ekosistem kesehatan mental.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="connection">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5 text-accent-600" />
                    </div>
                    <span className="font-semibold text-lg">Titik Koneksi</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground pl-[52px]">
                    Lingkaran oranye di setiap ujung melambangkan berbagai aspek kesehatan 
                    mental yang kami teliti dan kembangkan, serta menggambarkan pendekatan 
                    holistik kami terhadap kesehatan mental.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMeaning;
