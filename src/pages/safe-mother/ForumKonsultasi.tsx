import { Helmet } from "react-helmet-async";
import { Users, MessageCircle, Stethoscope, UserCheck, Heart, ArrowRight } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
const ForumKonsultasi = () => {
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
    label: "Tenaga Profesional/Perawat"
  }, {
    number: "24/7",
    label: "Dukungan Online"
  }, {
    number: "95%",
    label: "Tingkat Kepuasan"
  }];
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <HelmetAny>
        <title>Forum & Konsultasi - Safe Mother | Mind MHIRC</title>
        <meta name="description" content="Platform forum dan konsultasi untuk ibu dengan berbagai pilihan dukungan: forum ibu, konsultasi profesional/perawat, layanan kesehatan, dan grup support khusus." />
      </HelmetAny>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8 my-[12px] py-[12px]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl my-[12px] py-[12px]">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 font-medium text-sm">
                Forum & Konsultasi
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dukungan dan Konsultasi Maternal
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Dapatkan dukungan dari komunitas dan konsultasi dengan profesional
              untuk mendampingi perjalanan keibuan Anda.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>)}
            </div>
          </div>

          {/* Consultation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {consultationOptions.map(option => {
            const Icon = option.icon;
            return <div key={option.id} className={`bg-white rounded-2xl shadow-soft ${option.hoverColor} transition-all duration-300 overflow-hidden border ${option.borderColor} group cursor-pointer`}>
                  <div className="p-6">
                    <div className={`w-14 h-14 ${option.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${option.iconColor}`} />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                      {option.title}
                    </h3>

                    <p className="text-gray-600 mb-4">{option.description}</p>

                    <ul className="space-y-2 mb-6">
                      {option.features.map((feature, index) => <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{feature}</span>
                        </li>)}
                    </ul>

                    <div className="flex items-center justify-between">
                      {(() => {
                        const isComingSoon =
                          option.id === "konsultasi-kesehatan" ||
                          option.id === "grup-support";
                        const classActive =
                          "bg-pink-600 hover:bg-pink-700 text-white";
                        const classDisabled =
                          "bg-gray-200 text-gray-600 cursor-not-allowed";
                        return (
                          <button
                            disabled={isComingSoon}
                            onClick={
                              isComingSoon
                                ? undefined
                                : () => (window.location.href = option.href)
                            }
                            className={`${
                              isComingSoon ? classDisabled : classActive
                            } px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2`}
                          >
                            <span>{isComingSoon ? "Segera Datang" : "Mulai Sekarang"}</span>
                            {!isComingSoon && (
                              <ArrowRight className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })()}
                      <span className="text-xs text-gray-500">Gratis</span>
                    </div>
                  </div>
                </div>;
          })}
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Cara Menggunakan Layanan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-pink-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Pilih Layanan
                </h3>
                <p className="text-sm text-gray-600">
                  Pilih jenis dukungan yang Anda butuhkan dari berbagai opsi
                  yang tersedia.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Bergabung</h3>
                <p className="text-sm text-gray-600">
                  Daftar atau masuk ke forum/jadwalkan konsultasi sesuai
                  kebutuhan Anda.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Dapatkan Dukungan
                </h3>
                <p className="text-sm text-gray-600">
                  Mulai mendapatkan dukungan dan bimbingan yang Anda perlukan.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Siap Memulai Perjalanan Bersama Kami?
            </h2>
            <p className="mb-6 opacity-90">
              Bergabunglah dengan ribuan ibu lainnya yang telah merasakan
              manfaat dukungan komunitas dan konsultasi profesional kami.
            </p>
            <button className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors">
              Bergabung Sekarang
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default ForumKonsultasi;