
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPost from "@/components/BlogPost";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample blog posts data
  const allPosts = [
    {
      id: "mengenal-anxietas",
      title: "Mengenal Anxietas: Gejala, Penyebab, dan Cara Mengatasinya",
      excerpt: "Anxietas adalah reaksi normal terhadap stres, namun jika berlebihan dapat mengganggu kehidupan sehari-hari. Artikel ini membahas gejala, penyebab, dan strategi mengatasi anxietas.",
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
      date: "3 Jun 2023",
      author: {
        name: "Dr. Anita Wijaya",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      category: "Edukasi"
    },
    {
      id: "digital-wellbeing",
      title: "Digital Wellbeing: Menjaga Kesehatan Mental di Era Digital",
      excerpt: "Perkembangan teknologi membawa tantangan baru bagi kesehatan mental. Simak tips menjaga keseimbangan digital untuk kesejahteraan psikologis yang lebih baik.",
      coverImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80",
      date: "15 Mei 2023",
      author: {
        name: "Budi Santoso, M.Psi",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      category: "Tips"
    },
    {
      id: "mindfulness-indonesia",
      title: "Praktik Mindfulness dalam Konteks Budaya Indonesia",
      excerpt: "Bagaimana memodifikasi praktik mindfulness agar lebih sesuai dengan nilai-nilai budaya Indonesia. Artikel ini membahas adaptasi dan penerapannya.",
      coverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80",
      date: "27 Apr 2023",
      author: {
        name: "Maya Putri, M.Psi",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg"
      },
      category: "Edukasi"
    },
    {
      id: "seminar-kesehatan-mental",
      title: "Mind MHIRC Mengadakan Seminar Nasional Kesehatan Mental Remaja",
      excerpt: "Seminar yang dihadiri oleh 500 peserta dari seluruh Indonesia membahas tantangan kesehatan mental remaja di era digital dan strategi intervensi berbasis sekolah.",
      coverImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80",
      date: "10 Apr 2023",
      author: {
        name: "Tim Redaksi",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      category: "Berita"
    },
    {
      id: "penelitian-depresi",
      title: "Penelitian Terbaru Mind MHIRC tentang Pola Depresi pada Mahasiswa",
      excerpt: "Tim peneliti Mind MHIRC telah melakukan studi tentang pola depresi pada mahasiswa di 5 universitas di Indonesia. Hasil menunjukkan adanya korelasi antara pola tidur dan tingkat depresi.",
      coverImage: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80",
      date: "2 Apr 2023",
      author: {
        name: "Dr. Rudi Hermawan",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg"
      },
      category: "Berita"
    },
    {
      id: "tips-kelola-stres",
      title: "5 Tips Mengelola Stres di Tempat Kerja yang Efektif",
      excerpt: "Tempat kerja bisa menjadi sumber stres yang signifikan. Artikel ini memberikan 5 strategi praktis yang dapat diterapkan untuk mengelola stres di lingkungan kerja.",
      coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
      date: "18 Mar 2023",
      author: {
        name: "Siti Nurhaliza, M.Psi",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg"
      },
      category: "Tips"
    }
  ];
  
  // Filtered posts based on search query
  const filteredPosts = allPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Posts separated by category
  const newsPosts = allPosts.filter(post => post.category === "Berita");
  const eduPosts = allPosts.filter(post => post.category === "Edukasi" || post.category === "Tips");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog Mind MHIRC</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Jelajahi artikel, berita, dan tips tentang kesehatan mental dari para ahli dan peneliti kami.
            </p>
            
            {/* Search Box */}
            <div className="relative mb-12">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Cari artikel..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-8 w-full flex justify-start border-b">
                <TabsTrigger value="all" className="px-6">Semua</TabsTrigger>
                <TabsTrigger value="news" className="px-6">Berita Terbaru</TabsTrigger>
                <TabsTrigger value="edu" className="px-6">Edukasi</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <BlogPost key={post.id} {...post} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-muted-foreground">Tidak ada artikel yang ditemukan. Silakan coba dengan kata kunci lain.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="news">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {newsPosts.filter(post => 
                    searchQuery === "" || 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    newsPosts
                      .filter(post => 
                        searchQuery === "" || 
                        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((post) => (
                        <BlogPost key={post.id} {...post} />
                      ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-muted-foreground">Tidak ada berita yang ditemukan. Silakan coba dengan kata kunci lain.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="edu">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {eduPosts.filter(post => 
                    searchQuery === "" || 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    eduPosts
                      .filter(post => 
                        searchQuery === "" || 
                        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((post) => (
                        <BlogPost key={post.id} {...post} />
                      ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-muted-foreground">Tidak ada artikel edukasi yang ditemukan. Silakan coba dengan kata kunci lain.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
