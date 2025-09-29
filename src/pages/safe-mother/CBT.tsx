import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Brain, CheckCircle, Clock, Calendar, Target, Award, Heart, Play } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";

const CBT = () => {
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    {
      id: 1,
      title: "TM 1: Pengenalan CBT untuk Ibu",
      description: "Memahami dasar-dasar Cognitive Behavioral Therapy dan bagaimana dapat membantu kesehatan mental maternal.",
      duration: "45 menit",
      tasks: 5,
      status: "available",
      progress: 0,
      objectives: [
        "Memahami konsep dasar CBT",
        "Mengenali pola pikir otomatis",
        "Belajar teknik breathing exercise",
        "Mengidentifikasi trigger emosi"
      ]
    },
    {
      id: 2,
      title: "TM 2: Mengelola Kecemasan Kehamilan",
      description: "Teknik CBT khusus untuk mengatasi kecemasan dan kekhawatiran selama masa kehamilan.",
      duration: "50 menit",
      tasks: 6,
      status: "locked",
      progress: 0,
      objectives: [
        "Mengidentifikasi sumber kecemasan",
        "Teknik relaksasi progresif",
        "Restrukturisasi kognitif",
        "Latihan mindfulness"
      ]
    },
    {
      id: 3,
      title: "TM 3: Persiapan Mental Persalinan",
      description: "Persiapan mental dan emosional menghadapi proses persalinan dengan teknik CBT.",
      duration: "55 menit",
      tasks: 7,
      status: "locked",
      progress: 0,
      objectives: [
        "Visualization techniques",
        "Pain management strategies",
        "Building confidence",
        "Emergency coping skills"
      ]
    },
    {
      id: 4,
      title: "TM 4: Adaptasi Pasca Melahirkan",
      description: "Mengelola perubahan peran dan tantangan emosional setelah melahirkan.",
      duration: "60 menit",
      tasks: 8,
      status: "locked",
      progress: 0,
      objectives: [
        "Role transition coping",
        "Postpartum mood management",
        "Self-compassion practices",
        "Support system building"
      ]
    },
    {
      id: 5,
      title: "TM 5: Bonding dan Attachment",
      description: "Membangun ikatan emosional yang sehat dengan bayi melalui pendekatan CBT.",
      duration: "45 menit",
      tasks: 6,
      status: "locked",
      progress: 0,
      objectives: [
        "Understanding attachment theory",
        "Bonding exercises",
        "Addressing bonding difficulties",
        "Building secure attachment"
      ]
    },
    {
      id: 6,
      title: "TM 6: Keseimbangan Hidup",
      description: "Menciptakan keseimbangan antara peran sebagai ibu, pasangan, dan individu.",
      duration: "50 menit",
      tasks: 7,
      status: "locked",
      progress: 0,
      objectives: [
        "Time management skills",
        "Setting boundaries",
        "Self-care strategies",
        "Communication skills"
      ]
    }
  ];

  const achievements = [
    { icon: Target, title: "Konsisten 7 Hari", description: "Menyelesaikan tugas selama 7 hari berturut-turut" },
    { icon: Award, title: "Modul Pertama", description: "Menyelesaikan TM 1 dengan sempurna" },
    { icon: Brain, title: "CBT Master", description: "Menguasai semua teknik CBT dasar" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200";
      case "locked":
        return "bg-gray-100 text-gray-500 border-gray-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Tersedia";
      case "locked":
        return "Terkunci";
      case "completed":
        return "Selesai";
      default:
        return "Tidak Tersedia";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>Program CBT - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Program Cognitive Behavioral Therapy (CBT) khusus untuk ibu dengan berbagai modul terstruktur untuk mendukung kesehatan mental maternal."
        />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium text-sm">Program CBT</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cognitive Behavioral Therapy untuk Ibu
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Program CBT terstruktur yang dirancang khusus untuk mendukung kesehatan mental 
              maternal melalui berbagai modul pembelajaran dan penugasan harian.
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Anda</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">0/6</div>
                <div className="text-sm text-gray-600">Modul Selesai</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Hari Berturut-turut</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Total Poin</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">Pencapaian</div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  module.status === "locked" ? "opacity-75" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        module.status === "available" 
                          ? "bg-blue-100" 
                          : module.status === "completed" 
                          ? "bg-green-100" 
                          : "bg-gray-100"
                      }`}>
                        <Brain className={`w-6 h-6 ${
                          module.status === "available" 
                            ? "text-blue-600" 
                            : module.status === "completed" 
                            ? "text-green-600" 
                            : "text-gray-400"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(module.status)}`}>
                          {getStatusText(module.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{module.tasks} tugas</span>
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tujuan Pembelajaran:</h4>
                    <ul className="space-y-1">
                      {module.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        module.status === "available"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={module.status !== "available"}
                    >
                      {module.status === "available" ? (
                        <div className="flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Mulai Modul</span>
                        </div>
                      ) : (
                        "Tidak Tersedia"
                      )}
                    </button>
                    
                    {module.progress > 0 && (
                      <div className="text-sm text-gray-500">
                        Progress: {module.progress}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pencapaian</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl opacity-50">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">{achievement.title}</h3>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Tasks */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tugas Harian</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Tugas Aktif
              </h3>
              <p className="text-gray-600">
                Mulai modul pertama untuk mendapatkan tugas harian Anda.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CBT;