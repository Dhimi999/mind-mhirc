
import { useState, useEffect } from "react";
import { Search, Filter, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestCard from "@/components/TestCard";
import Button from "@/components/Button";
import { Link } from "react-router-dom";
import testsData from "@/data/testsData";

const Tests = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Convert testsData object to array for UI
  const allTests = Object.values(testsData).map(test => ({
    id: test.id,
    title: test.shortTitle || test.title,
    description: test.description,
    duration: test.duration,
    questions: test.questions.length,
    image: test.image,
    category: test.category
  }));
  
  // Get unique categories
  const categories = Array.from(new Set(allTests.map(test => test.category)));
  
  // Filter tests based on search query and category
  const filteredTests = allTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? test.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 page-transition">
        {/* Hero Section */}
        <section className="bg-muted py-24 px-6 md:px-12 lg:px-24 relative">
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <span>Tes Mental</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Evaluasi Kesehatan Mental Anda
              </h1>
              <p className="text-lg text-muted-foreground">
                Pilih dari berbagai tes yang dirancang oleh para ahli untuk membantu Anda 
                menilai dan memahami kondisi kesehatan mental Anda.
              </p>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-4">
                <div className="relative w-full md:w-auto md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari tes..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative w-full md:w-auto md:min-w-[180px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <select
                    className="w-full pl-10 pr-8 py-2 rounded-lg border appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tests Grid Section */}
        <section className="section-padding">
          <div className="container mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="rounded-xl overflow-hidden shadow-soft bg-card h-full">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-20 bg-muted rounded"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="h-10 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
                {filteredTests.map((test) => (
                  <TestCard key={test.id} {...test} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 fade-in">
                <div className="mb-4 text-muted-foreground">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Tidak ada tes yang ditemukan</h3>
                <p className="text-muted-foreground">
                  Tidak ada tes yang cocok dengan kriteria pencarian Anda.
                </p>
                <div className="mt-6">
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}>
                    Reset Pencarian
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Information Section */}
        <section className="section-padding bg-muted">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3 space-y-6 fade-in">
                <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-4 py-1 text-secondary text-sm font-medium mb-2">
                  <span>Informasi Penting</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Memahami Hasil Tes Mental
                </h2>
                <p className="text-muted-foreground">
                  Tes mental adalah alat bantu untuk memahami kondisi Anda secara umum, 
                  bukan diagnosis klinis. Hasil tes ini dapat menjadi langkah awal untuk 
                  mengenali kondisi Anda dan mencari bantuan profesional jika diperlukan.
                </p>
                
                <div className="space-y-4 pt-4">
                  {[
                    {
                      title: "Bukan Pengganti Konsultasi",
                      desc: "Hasil tes tidak menggantikan diagnosis dan konsultasi dengan profesional kesehatan mental."
                    },
                    {
                      title: "Langkah Awal",
                      desc: "Anggap hasil tes sebagai informasi awal untuk memahami kondisi Anda lebih baik."
                    },
                    {
                      title: "Kerahasiaan Terjamin",
                      desc: "Semua data yang Anda berikan dijamin kerahasiaannya dan hanya digunakan untuk keperluan hasil tes."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                        <span className="text-primary font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <Link to="/services">
                    <Button variant="outline">
                      Lihat Layanan Konsultasi <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="lg:col-span-2 fade-in">
                <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
                  <h3 className="text-xl font-semibold text-center">
                    Keuntungan Akun Terdaftar
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      "Simpan riwayat tes yang pernah Anda lakukan",
                      "Pantau perkembangan kondisi mental Anda",
                      "Dapatkan rekomendasi yang lebih personal",
                      "Ekspor hasil tes dalam format PDF",
                      "Akses fitur eksklusif untuk pengguna terdaftar"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-accent-600 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4">
                    <Link to="/login?register=true">
                      <Button className="w-full">
                        Daftar Sekarang
                      </Button>
                    </Link>
                    <div className="text-center mt-4 text-sm text-muted-foreground">
                      Sudah punya akun?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tests;
