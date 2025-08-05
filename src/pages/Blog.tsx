import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPost from "@/components/BlogPost";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Helmet } from "react-helmet-async"; // Jangan lupa import

type BlogPostType = Tables<"blog_posts">;

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allPosts, setAllPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Active tab state
  const [activeTab, setActiveTab] = useState("all");

  // Fetch blog posts from Supabase
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("published_date", { ascending: false });
        if (error) {
          throw error;
        }
        if (data) {
          setAllPosts(data);
        }
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  // Filter posts berdasarkan search query
  const filteredPosts = allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pisahkan postingan berdasarkan kategori
  const newsPosts = allPosts.filter((post) => post.category === "Berita");
  const eduPosts = allPosts.filter(
    (post) => post.category === "Edukasi" || post.category === "Tips"
  );

  // Berdasarkan activeTab, pilih data yang akan dipaginasi
  let postsToPaginate: BlogPostType[] = [];
  if (activeTab === "all") {
    postsToPaginate = filteredPosts;
  } else if (activeTab === "news") {
    postsToPaginate = newsPosts.filter(
      (post) =>
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else if (activeTab === "edu") {
    postsToPaginate = eduPosts.filter(
      (post) =>
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Reset halaman ke 1 jika activeTab atau searchQuery berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Hitung total halaman dan postingan yang ditampilkan pada halaman saat ini
  const totalPages = Math.ceil(postsToPaginate.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = postsToPaginate.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Judul yang menargetkan keyword pencarian umum */}
        <title>
          Blog Kesehatan Mental: Artikel, Berita & Tips | Mind MHIRC
        </title>

        {/* Deskripsi yang menarik dan kaya kata kunci */}
        <meta
          name="description"
          content="Temukan koleksi artikel, berita terbaru, dan tips praktis seputar kesehatan mental dari para ahli di blog Mind MHIRC. Jelajahi topik seperti anxietas, depresi, dan cara menjaga kesejahteraan mental."
        />

        {/* --- URL Konsisten untuk Halaman 'Blog' --- */}
        <link rel="canonical" href="https://mind-mhirc.my.id/blog" />
        <meta property="og:url" content="https://mind-mhirc.my.id/blog" />

        {/* --- Open Graph Tags (untuk Media Sosial) --- */}
        <meta
          property="og:title"
          content="Kumpulan Artikel Kesehatan Mental Terbaru dari Mind MHIRC"
        />
        <meta
          property="og:description"
          content="Baca wawasan mendalam, berita, dan tips praktis untuk meningkatkan kesejahteraan mental Anda dari para ahli kami."
        />
        <meta property="og:type" content="website" />
        {/* Ganti dengan URL gambar yang merepresentasikan blog Anda */}
        <meta
          property="og:image"
          content="https://mind-mhirc.my.id/image-blog-hero.jpg"
        />

        {/* --- Twitter Card Tags (untuk Twitter) --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Kumpulan Artikel Kesehatan Mental Terbaru dari Mind MHIRC"
        />
        <meta
          name="twitter:description"
          content="Baca wawasan mendalam, berita, dan tips praktis untuk meningkatkan kesejahteraan mental Anda dari para ahli kami."
        />
        <meta
          name="twitter:image"
          content="https://mind-mhirc.my.id/image-blog-hero.jpg"
        />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-12 md:pt-24 lg:pt-24 xl:pt-24 xxl:pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog Mind MHIRC</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Jelajahi artikel, berita, dan tips tentang kesehatan mental dari
              para ahli dan peneliti kami.
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

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat artikel...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Tabs dan Pagination */}
            {!loading && !error && (
              <>
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value)}
                >
                  <TabsList className="mb-8 w-full flex justify-start border-b">
                    <TabsTrigger value="all" className="px-6">
                      Semua
                    </TabsTrigger>
                    <TabsTrigger value="news" className="px-6">
                      Berita Terbaru
                    </TabsTrigger>
                    <TabsTrigger value="edu" className="px-6">
                      Edukasi
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {currentPosts.length > 0 ? (
                        currentPosts.map((post) => (
                          <BlogPost key={post.id} post={post} />
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-12">
                          <p className="text-muted-foreground">
                            Tidak ada artikel yang ditemukan. Silakan coba
                            dengan kata kunci lain.
                          </p>
                        </div>
                      )}
                    </div>
                    {totalPages > 1 && (
                      <Pagination className="mt-6">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1)
                                  setCurrentPage(currentPage - 1);
                              }}
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
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
                                if (currentPage < totalPages)
                                  setCurrentPage(currentPage + 1);
                              }}
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </TabsContent>

                  <TabsContent value="news">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {(() => {
                        const postsNews = newsPosts.filter(
                          (post) =>
                            searchQuery === "" ||
                            post.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            post.excerpt
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        );
                        const totalPagesNews = Math.ceil(
                          postsNews.length / postsPerPage
                        );
                        const indexOfLastPostNews = currentPage * postsPerPage;
                        const indexOfFirstPostNews =
                          indexOfLastPostNews - postsPerPage;
                        const currentPostsNews = postsNews.slice(
                          indexOfFirstPostNews,
                          indexOfLastPostNews
                        );
                        return currentPostsNews.length > 0 ? (
                          currentPostsNews.map((post) => (
                            <BlogPost key={post.id} post={post} />
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-12">
                            <p className="text-muted-foreground">
                              Tidak ada berita yang ditemukan. Silakan coba
                              dengan kata kunci lain.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    {(() => {
                      const postsNews = newsPosts.filter(
                        (post) =>
                          searchQuery === "" ||
                          post.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          post.excerpt
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      );
                      const totalPagesNews = Math.ceil(
                        postsNews.length / postsPerPage
                      );
                      return totalPagesNews > 1 ? (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1)
                                    setCurrentPage(currentPage - 1);
                                }}
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                            {[...Array(totalPagesNews)].map((_, index) => (
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
                                  if (currentPage < totalPagesNews)
                                    setCurrentPage(currentPage + 1);
                                }}
                                className={
                                  currentPage === totalPagesNews
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      ) : null;
                    })()}
                  </TabsContent>

                  <TabsContent value="edu">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {(() => {
                        const postsEdu = eduPosts.filter(
                          (post) =>
                            searchQuery === "" ||
                            post.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            post.excerpt
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        );
                        const totalPagesEdu = Math.ceil(
                          postsEdu.length / postsPerPage
                        );
                        const indexOfLastPostEdu = currentPage * postsPerPage;
                        const indexOfFirstPostEdu =
                          indexOfLastPostEdu - postsPerPage;
                        const currentPostsEdu = postsEdu.slice(
                          indexOfFirstPostEdu,
                          indexOfLastPostEdu
                        );
                        return currentPostsEdu.length > 0 ? (
                          currentPostsEdu.map((post) => (
                            <BlogPost key={post.id} post={post} />
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-12">
                            <p className="text-muted-foreground">
                              Tidak ada artikel edukasi yang ditemukan. Silakan
                              coba dengan kata kunci lain.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    {(() => {
                      const postsEdu = eduPosts.filter(
                        (post) =>
                          searchQuery === "" ||
                          post.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          post.excerpt
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      );
                      const totalPagesEdu = Math.ceil(
                        postsEdu.length / postsPerPage
                      );
                      return totalPagesEdu > 1 ? (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1)
                                    setCurrentPage(currentPage - 1);
                                }}
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                            {[...Array(totalPagesEdu)].map((_, index) => (
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
                                  if (currentPage < totalPagesEdu)
                                    setCurrentPage(currentPage + 1);
                                }}
                                className={
                                  currentPage === totalPagesEdu
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      ) : null;
                    })()}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
