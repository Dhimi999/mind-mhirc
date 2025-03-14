
import React from "react";
import { Send } from "lucide-react";
import ContactForm from "@/components/ContactForm";

const ContactSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 bg-muted/50 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
            <Send className="h-4 w-4" />
            <span>Hubungi Kami</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tinggalkan Pesan untuk Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Apakah Anda memiliki pertanyaan, saran, atau ingin berkolaborasi dengan kami? 
            Jangan ragu untuk menghubungi kami melalui formulir di bawah ini.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <div className="bg-background rounded-2xl p-6 shadow-medium">
              <h3 className="font-bold text-xl mb-4">Informasi Kontak</h3>
              
              <div className="space-y-5">
                <ContactInfo 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Email"
                  value="info@mindmhirc.org"
                />
                
                <ContactInfo 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                  label="Telepon"
                  value="+62 21 7890 1234"
                />
                
                <ContactInfo 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Alamat"
                  value="Jl. Kesehatan Mental No. 45, Jakarta Selatan 12345, Indonesia"
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute left-10 top-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
      <div className="absolute right-10 bottom-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
    </section>
  );
};

interface ContactInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ContactInfo = ({ icon, label, value }: ContactInfoProps) => (
  <div className="flex items-start space-x-4">
    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-medium text-sm text-muted-foreground">{label}</h4>
      <p className="font-medium mt-1">{value}</p>
    </div>
  </div>
);

export default ContactSection;
