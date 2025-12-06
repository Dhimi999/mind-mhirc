import { Helmet } from "react-helmet-async";
import { Users, MessageCircle, Stethoscope, UserCheck, Heart, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";

const ForumKonsultasi = () => {
  const navigate = useNavigate();
  // Workaround JSX typing for Helmet in some TS setups
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HelmetAny = Helmet as unknown as React.FC<any>;

  const consultationOptions = [{
    id: "forum-ibu",
    title: "Forum Ibu",
    description: "Berbagi pengalaman, tips, dan saling mendukung dengan sesama ibu dalam komunitas yang aman dan suportif.",
    icon: Users,
    color: "bg-pink-100",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
    hoverColor: "hover:bg-pink-50",
    href: "/safe-mother/forumIbu",
    features: ["Diskusi grup dengan sesama ibu", "Berbagi pengalaman kehamilan dan pengasuhan", "Dukungan emosional dari komunitas", "Tips praktis dari ibu berpengalaman"]
  }, {
    id: "konsultasi-professional",
    title: "Konsultasi Profesional",
    description: "Konsultasi dengan tenaga profesional/perawat (termasuk perawat jiwa) yang berpengalaman dalam kesehatan mental maternal.",
    icon: UserCheck,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    hoverColor: "hover:bg-purple-50",
    href: "/safe-mother/privatekonsultasi",
    features: ["Sesi konsultasi individual", "Tenaga profesional/perawat berpengalaman", "Konsultasi via chat, video call, atau telepon", "Jadwal fleksibel sesuai kebutuhan"]
  }, {
    id: "konsultasi-kesehatan",
    title: "Konsultasi Layanan Kesehatan",
    description: "Konsultasi dengan tenaga kesehatan profesional untuk pertanyaan medis terkait kehamilan dan kesehatan ibu.",
    icon: Stethoscope,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    hoverColor: "hover:bg-blue-50",
    href: "/safe-mother/#",
    features: ["Konsultasi dengan dokter dan bidan", "Informasi medis terpercaya", "Panduan kesehatan kehamilan", "Rujukan ke layanan kesehatan terdekat"]
  }, {
    id: "grup-support",
    title: "Grup Support Khusus",
    description: "Grup dukungan tematik untuk situasi khusus seperti kehamilan risiko tinggi, kehilangan, atau kondisi tertentu.",
    icon: MessageCircle,
    color: "bg-green-100",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
    hoverColor: "hover:bg-green-50",
    href: "/safe-mother/#",
    features: ["Grup support berdasarkan kondisi khusus", "Moderasi oleh tenaga profesional", "Diskusi terarah dan terstruktur", "Privacy dan kerahasiaan terjamin"]
  }];

  const stats = [{
    number: "1,200+",
    label: "Ibu Bergabung"
  }, {
    number: "50+",
    label: "Tenaga Profesional"
  }, {
    number: "24/7",
    label: "Dukungan Online"
  }, {
    number: "95%",
    label: "Tingkat Kepuasan"
  }];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 font-sans selection:bg-pink-100 selection:text-pink-900">
      <HelmetAny>
        <title>Forum & Konsultasi - Safe Mother | Mind MHIRC</title>
        <meta name="description" content="Platform forum dan konsultasi untuk ibu dengan berbagai pilihan dukungan: forum ibu, konsultasi profesional/perawat, layanan kesehatan, dan grup support khusus." />
      </HelmetAny>

      <SafeMotherNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md rounded-full px-6 py-2 mb-8 shadow-sm border border-white/50 animate-fade-in">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              <span className="text-purple-800 font-medium text-sm">Ruang Aman & Nyaman Untuk Ibu</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
              Berbagi Cerita, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Temukan Dukungan
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Jangan berjuang sendirian. Terhubunglah dengan komunitas ibu yang saling menguatkan dan konsultasikan masalah Anda dengan para ahli.
            </p>

            {/* Floating Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-16">
          {/* Consultation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {consultationOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <div 
                  key={option.id} 
                  className="group relative bg-white/60 backdrop-blur-md rounded-3xl p-1 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover:-translate-y-2"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl pointer-events-none"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-[22px] p-8 h-full flex flex-col border border-white/50">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                        <Icon className={`w-8 h-8 ${option.iconColor}`} />
                      </div>
                      {option.id === "konsultasi-professional" && (
                        <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide border border-purple-200 shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Rekomendasi
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                      {option.title}
                    </h3>

                    <p className="text-gray-600 mb-8 leading-relaxed">{option.description}</p>

                    {/* Features List */}
                    <div className="bg-gray-50/80 rounded-2xl p-6 mb-8 flex-1 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                        Fitur Utama
                      </h4>
                      <ul className="space-y-3">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3 text-sm text-gray-600">
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-gray-200 text-green-500 shadow-sm mt-0.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      {(() => {
                        const isComingSoon =
                          option.id === "konsultasi-kesehatan" ||
                          option.id === "grup-support";
                        
                        return (
                          <button
                            disabled={isComingSoon}
                            onClick={
                              isComingSoon
                                ? undefined
                                : () => navigate(option.href)
                            }
                            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 group/btn ${
                              isComingSoon 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                                : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            }`}
                          >
                            <span>{isComingSoon ? "Segera Hadir" : "Mulai Sekarang"}</span>
                            {!isComingSoon && (
                              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How it Works - Redesigned */}
          <div className="relative rounded-[2.5rem] overflow-hidden mb-24">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            
            <div className="relative z-10 p-10 md:p-20">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Cara Menggunakan Layanan
                </h2>
                <p className="text-purple-100 text-lg">
                  Tiga langkah mudah untuk mendapatkan dukungan yang Anda butuhkan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-white/20 z-0"></div>

                {[
                  { step: 1, title: "Pilih Layanan", desc: "Tentukan jenis dukungan yang sesuai dengan kebutuhan Anda saat ini.", icon: "🎯" },
                  { step: 2, title: "Bergabung", desc: "Masuk ke forum diskusi atau jadwalkan sesi konsultasi privat.", icon: "🤝" },
                  { step: 3, title: "Dapatkan Dukungan", desc: "Mulai berinteraksi dan rasakan kelegaan emosional.", icon: "💖" }
                ].map((item, idx) => (
                  <div key={idx} className="relative z-10 text-center group">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/20 transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">{item.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {item.title}
                    </h3>
                    <p className="text-purple-100 leading-relaxed px-4">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=2070&auto=format&fit=crop" 
                alt="Motherhood" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-12 md:p-24 text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Siap Memulai Perjalanan <br/> Bersama Kami?
              </h2>
              <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
                Bergabunglah dengan ribuan ibu lainnya yang telah merasakan
                manfaat dukungan komunitas dan konsultasi profesional kami.
              </p>
              <button className="bg-white text-purple-900 px-12 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-purple-50 transition-all transform hover:-translate-y-1 flex items-center gap-3 mx-auto">
                Bergabung Sekarang - Gratis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForumKonsultasi;