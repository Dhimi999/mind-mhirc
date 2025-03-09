import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPost from "@/components/BlogPost";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
type BlogPostType = Tables<'blog_posts'>;
const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allPosts, setAllPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts from Supabase
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.from('blog_posts').select('*').order('published_date', {
          ascending: false
        });
        if (error) {
          throw error;
        }
        if (data) {
          setAllPosts(data);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  // Filtered posts based on search query
  const filteredPosts = allPosts.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

  // Posts separated by category
  const newsPosts = allPosts.filter(post => post.category === "Berita");
  const eduPosts = allPosts.filter(post => post.category === "Edukasi" || post.category === "Tips");
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-12 md:pt-24 lg:pt-24 xl:pt-24 xxl:pt-24">
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
              <input type="text" placeholder="Cari artikel..." className="pl-10 pr-4 py-3 w-full rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            
            {/* Loading State */}
            {loading && <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat artikel...</p>
              </div>}
            
            {/* Error State */}
            {error && <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                  Coba lagi
                </button>
              </div>}
            
            {/* Tabs */}
            {!loading && !error && <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-8 w-full flex justify-start border-b">
                  <TabsTrigger value="all" className="px-6">Semua</TabsTrigger>
                  <TabsTrigger value="news" className="px-6">Berita Terbaru</TabsTrigger>
                  <TabsTrigger value="edu" className="px-6">Edukasi</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {filteredPosts.length > 0 ? filteredPosts.map(post => <BlogPost key={post.id} post={post} />) : <div className="col-span-2 text-center py-12">
                        <p className="text-muted-foreground">Tidak ada artikel yang ditemukan. Silakan coba dengan kata kunci lain.</p>
                      </div>}
                  </div>
                </TabsContent>
                
                <TabsContent value="news">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {newsPosts.filter(post => searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? newsPosts.filter(post => searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())).map(post => <BlogPost key={post.id} post={post} />) : <div className="col-span-2 text-center py-12">
                        <p className="text-muted-foreground">Tidak ada berita yang ditemukan. Silakan coba dengan kata kunci lain.</p>
                      </div>}
                  </div>
                </TabsContent>
                
                <TabsContent value="edu">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {eduPosts.filter(post => searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? eduPosts.filter(post => searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())).map(post => <BlogPost key={post.id} post={post} />) : <div className="col-span-2 text-center py-12">
                        <p className="text-muted-foreground">Tidak ada artikel edukasi yang ditemukan. Silakan coba dengan kata kunci lain.</p>
                      </div>}
                  </div>
                </TabsContent>
              </Tabs>}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Blog;