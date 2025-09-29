import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PlayCircle, FileText, Clock, User, Search, Filter, Heart } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";

const Psikoedukasi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "Semua" },
    { value: "pregnancy", label: "Kehamilan" },
    { value: "postpartum", label: "Pasca Melahirkan" },
    { value: "mental-health", label: "Kesehatan Mental" },
    { value: "parenting", label: "Pengasuhan" },
  ];

  const materials = [
    {
      id: 1,
      title: "Memahami Perubahan Emosi Selama Kehamilan",
      description: "Pelajari tentang perubahan hormonal dan emosional yang normal terjadi selama kehamilan.",
      type: "video",
      duration: "15 menit",
      author: "Dr. Sarah Amanda",
      category: "pregnancy",
      thumbnail: "https://images.unsplash.com/photo-1578496780896-7081cc446fb1?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      title: "Mengatasi Kecemasan Jelang Persalinan",
      description: "Teknik relaksasi dan persiapan mental untuk menghadapi proses persalinan.",
      type: "article",
      readTime: "8 menit baca",
      author: "Dr. Maya Sari",
      category: "pregnancy",
      thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      title: "Baby Blues vs Depresi Postpartum",
      description: "Membedakan antara baby blues yang normal dengan depresi postpartum yang memerlukan penanganan.",
      type: "video",
      duration: "12 menit",
      author: "Dr. Rina Wijaya",
      category: "postpartum",
      thumbnail: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 4,
      title: "Membangun Bonding dengan Bayi",
      description: "Cara efektif membangun ikatan emosional yang kuat dengan bayi baru lahir.",
      type: "article",
      readTime: "6 menit baca",
      author: "Dr. Lila Pratiwi",
      category: "parenting",
      thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 5,
      title: "Teknik Mindfulness untuk Ibu",
      description: "Praktik mindfulness sederhana yang dapat membantu mengelola stres sehari-hari.",
      type: "video",
      duration: "20 menit",
      author: "Dr. Anita Sari",
      category: "mental-health",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 6,
      title: "Nutrisi untuk Kesehatan Mental Ibu",
      description: "Hubungan antara nutrisi dan kesehatan mental, serta makanan yang mendukung mood positif.",
      type: "article",
      readTime: "10 menit baca",
      author: "Dr. Kartika Dewi",
      category: "mental-health",
      thumbnail: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=400",
    },
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>Psikoedukasi - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Materi edukasi komprehensif tentang kesehatan mental maternal, kehamilan, dan pengasuhan untuk mendukung perjalanan keibuan Anda."
        />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-pink-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-pink-600" />
              <span className="text-pink-700 font-medium text-sm">Psikoedukasi Maternal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Materi Edukasi Kesehatan Mental
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pelajari berbagai topik penting tentang kesehatan mental maternal, 
              kehamilan, dan pengasuhan melalui video dan artikel dari para ahli.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari materi edukasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={material.thumbnail}
                    alt={material.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  
                  {/* Type indicator */}
                  <div className="absolute top-4 left-4">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                      material.type === "video" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {material.type === "video" ? (
                        <PlayCircle className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span>{material.type === "video" ? "Video" : "Artikel"}</span>
                    </div>
                  </div>

                  {/* Duration/Read time */}
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{material.type === "video" ? material.duration : material.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {material.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {material.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    <span>{material.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada materi ditemukan
              </h3>
              <p className="text-gray-600">
                Coba ubah kata kunci pencarian atau filter kategori Anda.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Psikoedukasi;