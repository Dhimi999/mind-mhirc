
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ContentCategoryTab from "./ContentCategoryTab";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type BlogPost = Tables<'blog_posts'>;

const ContentManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const navigate = useNavigate();

  // Fetch all blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('blog_posts').select('*').order('published_date', { ascending: false });
        
        if (categoryFilter !== "all") {
          query = query.eq('category', categoryFilter);
        }
        
        // Add search functionality
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Gagal memuat data blog. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [categoryFilter, searchQuery]);

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus konten ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        throw error;
      }
      
      // Remove post from state
      setPosts(posts.filter(post => post.id !== postId));
      toast.success("Konten berhasil dihapus");
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error("Gagal menghapus konten. Silakan coba lagi.");
    }
  };

  // Handle category update
  const handleUpdateCategory = async (postId: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ category: newCategory })
        .eq('id', postId);
      
      if (error) {
        throw error;
      }
      
      // Update post in state
      setPosts(posts.map(post => post.id === postId ? { ...post, category: newCategory } : post));
      toast.success("Kategori berhasil diperbarui");
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error("Gagal memperbarui kategori. Silakan coba lagi.");
    }
  };

  // Handle cover image update
  const handleUpdateCoverImage = async (postId: string, newUrl: string) => {
    if (!newUrl || !newUrl.trim()) {
      toast.error("URL gambar tidak boleh kosong");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ cover_image: newUrl })
        .eq('id', postId);
      
      if (error) {
        throw error;
      }
      
      // Update post in state
      setPosts(posts.map(post => post.id === postId ? { ...post, cover_image: newUrl } : post));
      toast.success("URL gambar berhasil diperbarui");
    } catch (err) {
      console.error('Error updating cover image:', err);
      toast.error("Gagal memperbarui URL gambar. Silakan coba lagi.");
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (postId: string, commentIndex: number, comments: any[]) => {
    try {
      // Create a new array without the deleted comment
      const updatedComments = [...comments];
      updatedComments.splice(commentIndex, 1);
      
      const { error } = await supabase
        .from('blog_posts')
        .update({ comments: updatedComments })
        .eq('id', postId);
      
      if (error) {
        throw error;
      }
      
      // Update post in state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: updatedComments };
        }
        return post;
      }));
      
      toast.success("Komentar berhasil dihapus");
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error("Gagal menghapus komentar. Silakan coba lagi.");
    }
  };

  const handleCreatePost = () => {
    navigate('/dashboard/content/new');
  };

  const handleEditPost = (slug: string) => {
    navigate(`/dashboard/content/edit/${slug}`);
  };

  // Calculate total pages
  const totalPages = Math.ceil(posts.length / postsPerPage);
  
  // Get current posts (paginated)
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-card shadow-soft rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="bg-card shadow-soft rounded-xl p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => setCategoryFilter("all")} 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Konten</h1>
        <Button onClick={handleCreatePost} className="bg-primary">
          <Plus size={16} className="mr-1" />
          Tambah Cerita Baru
        </Button>
      </div>
      
      {/* Search box */}
      <div className="w-full md:w-1/2 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Cari konten berdasarkan judul atau isi..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to page 1 when searching
          }}
          className="pl-10"
        />
      </div>
      
      <Tabs defaultValue="all" value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
          <TabsTrigger value="all">Semua Konten</TabsTrigger>
          <TabsTrigger value="Berita">Berita</TabsTrigger>
          <TabsTrigger value="Edukasi">Edukasi</TabsTrigger>
          <TabsTrigger value="Tips">Tips</TabsTrigger>
        </TabsList>

        <ContentCategoryTab
          value="all"
          title="Semua Konten Blog"
          posts={currentPosts}
          onDelete={handleDeletePost}
          onUpdateCategory={handleUpdateCategory}
          onUpdateCoverImage={handleUpdateCoverImage}
          onDeleteComment={handleDeleteComment}
          onEdit={handleEditPost}
        />
        
        <ContentCategoryTab
          value="Berita"
          title="Konten Berita"
          posts={currentPosts}
          onDelete={handleDeletePost}
          onUpdateCategory={handleUpdateCategory}
          onUpdateCoverImage={handleUpdateCoverImage}
          onDeleteComment={handleDeleteComment}
          onEdit={handleEditPost}
        />
        
        <ContentCategoryTab
          value="Edukasi"
          title="Konten Edukasi"
          posts={currentPosts}
          onDelete={handleDeletePost}
          onUpdateCategory={handleUpdateCategory}
          onUpdateCoverImage={handleUpdateCoverImage}
          onDeleteComment={handleDeleteComment}
          onEdit={handleEditPost}
        />
        
        <ContentCategoryTab
          value="Tips"
          title="Konten Tips"
          posts={currentPosts}
          onDelete={handleDeletePost}
          onUpdateCategory={handleUpdateCategory}
          onUpdateCoverImage={handleUpdateCoverImage}
          onDeleteComment={handleDeleteComment}
          onEdit={handleEditPost}
        />
      </Tabs>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index + 1);
                  }}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ContentManagement;
