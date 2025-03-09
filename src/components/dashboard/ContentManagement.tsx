
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Search, Plus, Tags, ArrowUpDown } from "lucide-react";

const ContentManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for blog posts
  const mockPosts = [
    {
      id: "1",
      title: "Mengelola Stres di Tempat Kerja: Tips dan Strategi",
      excerpt: "Stres di tempat kerja dapat memengaruhi produktivitas dan kesehatan mental. Artikel ini membahas strategi efektif untuk mengelola stres kerja.",
      category: "Kesehatan Mental",
      published_date: "2023-05-15T09:30:00Z",
      author_name: "Dr. Anita Wijaya"
    },
    {
      id: "2",
      title: "Pentingnya Sleep Hygiene untuk Kualitas Tidur yang Lebih Baik",
      excerpt: "Sleep hygiene mengacu pada kebiasaan dan praktik yang diperlukan untuk tidur malam yang berkualitas dan kewaspadaan penuh pada siang hari.",
      category: "Tips Kesehatan",
      published_date: "2023-05-08T10:15:00Z",
      author_name: "Maya Kusuma, M.Sc"
    },
    {
      id: "3",
      title: "Cognitive Behavioral Therapy (CBT): Panduan Dasar",
      excerpt: "CBT adalah salah satu bentuk psikoterapi yang efektif untuk berbagai kondisi kesehatan mental. Artikel ini membahas prinsip dasar CBT.",
      category: "Psikoterapi",
      published_date: "2023-04-25T14:20:00Z",
      author_name: "Prof. Budi Santoso, Ph.D"
    },
    {
      id: "4",
      title: "Meningkatkan Resiliensi dalam Menghadapi Tantangan Hidup",
      excerpt: "Resiliensi adalah kemampuan untuk bangkit kembali dari kesulitan. Pelajari cara meningkatkan resiliensi Anda dalam artikel ini.",
      category: "Pengembangan Diri",
      published_date: "2023-04-12T11:45:00Z",
      author_name: "Dr. Reza Pratama, M.Kes"
    }
  ];

  // Filter posts based on search query
  const filteredPosts = mockPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Konten</h1>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari konten..."
            className="pl-8 pr-4 py-2 h-10 w-full sm:w-[300px] rounded-md border border-input bg-background text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Link to="/dashboard/content/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Cerita Baru
          </Button>
        </Link>
      </div>
      
      <div className="bg-card rounded-xl shadow-soft">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Daftar Konten</h2>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Urutkan
            </Button>
          </div>
        </div>
        
        <div className="divide-y">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {post.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.published_date)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium">{post.title}</h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Penulis:</span>
                      <span>{post.author_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0">
                    <Link to={`/dashboard/content/edit/${post.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        Pratinjau
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Tidak ada konten ditemukan</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Coba dengan kata kunci lain" : "Belum ada konten yang dibuat"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
