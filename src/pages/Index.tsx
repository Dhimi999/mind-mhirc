import { useState, useEffect } from "react";
import {
  Heart,
  Brain,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TestCard from "@/components/TestCard";
import ServiceCard from "@/components/ServiceCard";
import BlogPost from "@/components/BlogPost";
import Button from "@/components/Button";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import testsData from "@/data/testsData";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import WebVitals from "@/components/seo/WebVitals";
import { RelatedContent } from "@/components/seo/InternalLinking";

const Index = () => {
  const [blogPosts, setBlogPosts] = useState<Tables<"blog_posts">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("published_date", { ascending: false })
          .limit(2);

        if (error) {
          console.error("Error fetching blog posts:", error);
          return;
        }

        if (data) {
          setBlogPosts(data);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const allTests = Object.values(testsData).map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    duration: test.duration,
    questions: test.questions.length,
    image: test.image,
    category: test.category,
    featured: test.featured
  }));

  const featuredTests = allTests.filter((test) => test.featured);

  const services = [
    {
      id: "konsultasi",
      title: "Konsultasi Psikologis",
      description:
        "Layanan konsultasi dengan psikolog profesional untuk membantu mengatasi masalah kesehatan mental dan emosional.",
      icon: Heart,
      color: "bg-primary"
    },
    {
      id: "edukasi",
      title: "Program Edukasi",
      description:
        "Berbagai workshop, seminar, dan kursus untuk meningkatkan pemahaman tentang kesehatan mental.",
      icon: Brain,
      color: "bg-secondary"
    },
    {
      id: "pendampingan",
      title: "Pendampingan Kelompok",
      description:
        "Program dukungan kelompok yang dipimpin oleh fasilitator terlatih untuk berbagi pengalaman dan strategi coping.",
      icon: Users,
      color: "bg-accent-600"
    }
  ];

  const fallbackBlogPosts: Tables<"blog_posts">[] = [
    {
      id: "mengenal-anxietas",
      title: "Mengenal Anxietas: Gejala, Penyebab, dan Cara Mengatasinya",
      excerpt:
        "Anxietas adalah reaksi normal terhadap stres, namun jika berlebihan dapat mengganggu kehidupan sehari-hari. Artikel ini membahas gejala, penyebab, dan strategi mengatasi anxietas.",
      cover_image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
      published_date: "2023-06-03T00:00:00Z",
      updated_date: "2023-06-03T00:00:00Z",
      author_name: "Dr. Anita Wijaya",
      author_avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      category: "Edukasi",
      slug: "mengenal-anxietas",
      content: "",
      featured: false,
      read_time: "5 menit",
      references_cit: null,
      tags: ["anxietas", "mental-health"],
      likes: 0,
      comments: []
    },
    {
      id: "digital-wellbeing",
      title: "Digital Wellbeing: Menjaga Kesehatan Mental di Era Digital",
      excerpt:
        "Perkembangan teknologi membawa tantangan baru bagi kesehatan mental. Simak tips menjaga keseimbangan digital untuk kesejahteraan psikologis yang lebih baik.",
      cover_image:
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80",
      published_date: "2023-05-15T00:00:00Z",
      updated_date: "2023-05-15T00:00:00Z",
      author_name: "Budi Santoso, M.Psi",
      author_avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      category: "Tips",
      slug: "digital-wellbeing",
      content: "",
      featured: false,
      read_time: "7 menit",
      references_cit: null,
      tags: ["digital", "mental-health"],
      likes: 0,
      comments: []
    }
  ];

  const displayedBlogPosts =
    blogPosts.length > 0 ? blogPosts : fallbackBlogPosts;

  const testimonials = [
    {
      content:
        "Mind MHIRC telah membantu saya memahami kondisi mental saya dengan lebih baik. Tes-tes yang disediakan sangat mudah diikuti dan hasilnya memberikan wawasan yang berharga.",
      author: {
        name: "Annisa Wijaya",
        role: "Mahasiswa",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      rating: 5
    },
    {
      content:
        "Sebagai praktisi kesehatan mental, saya sangat terkesan dengan pendekatan Mind MHIRC yang berbasis bukti dan peka budaya. Platform ini adalah terobosan dalam edukasi kesehatan mental di Indonesia.",
      author: {
        name: "Dr. Hadi Prasetyo",
        role: "Psikiater",
        avatar: "https://randomuser.me/api/portraits/men/54.jpg"
      },
      rating: 4.5
    },
    {
      content:
        "Artikelnya informatif dan program edukasinya sangat membantu. Saya merasa lebih percaya diri dalam menghadapi tantangan kesehatan mental sehari-hari berkat Mind MHIRC.",
      author: {
        name: "Dewi Susanto",
        role: "Guru",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg"
      },
      rating: 5
    },
    {
      content:
        "Saya awalnya ragu untuk mencari bantuan, tapi platform ini membuat segalanya terasa aman dan mudah diakses. Terima kasih Mind MHIRC telah menjadi langkah awal dalam perjalanan kesehatan mental saya.",
      author: {
        name: "Budi Santoso",
        role: "Profesional IT",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      rating: 4
    },
    {
      content:
        "Tes-tes di Mind MHIRC sangat membantu saya memahami diri sendiri. Interpretasi hasil tesnya jelas dan mudah dipahami oleh orang awam sekalipun.",
      author: {
        name: "Siti Rahayu",
        role: "Ibu Rumah Tangga",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      rating: 4.5
    },
    {
      content:
        "Saya bersyukur menemukan platform ini saat sedang mengalami masa sulit. Rekomendasi yang diberikan sangat praktis dan bermanfaat.",
      author: {
        name: "Reza Kurniawan",
        role: "Pengusaha",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg"
      },
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Judul Halaman Utama (Penting untuk SEO) */}
        <title>
          MIND MHIRC: Tes Psikologi, Konsultasi & Edukasi Kesehatan Mental
        </title>

        {/* Deskripsi Halaman yang Lebih Spesifik */}
        <meta
          name="description"
          content="Pusat riset dan layanan kesehatan mental di Indonesia. Temukan tes psikologi online, layanan konsultasi, dan artikel tepercaya untuk kesejahteraan mental Anda di MIND MHIRC."
        />

        {/* --- URL Konsisten --- */}
        <link rel="canonical" href="https://mind-mhirc.my.id/" />
        <meta property="og:url" content="https://mind-mhirc.my.id/" />

        {/* --- Open Graph Tags (untuk Media Sosial) --- */}
        <meta
          property="og:title"
          content="MIND MHIRC: Tes Psikologi, Konsultasi & Edukasi Kesehatan Mental"
        />
        <meta
          property="og:description"
          content="Mulai perjalanan kesehatan mental Anda dengan tes, konsultasi, dan edukasi berbasis bukti dari MIND MHIRC."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://mind-mhirc.my.id/hero-image.jpg"
        />
        {/* Ganti 'hero-image.jpg' dengan nama file gambar utama Anda */}

        {/* --- Twitter Card Tags (untuk Twitter) --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="MIND MHIRC: Tes Psikologi, Konsultasi & Edukasi Kesehatan Mental"
        />
        <meta
          name="twitter:description"
          content="Mulai perjalanan kesehatan mental Anda dengan tes, konsultasi, dan edukasi berbasis bukti dari MIND MHIRC."
        />
        <meta
          name="twitter:image"
          content="https://mind-mhirc.my.id/hero-image.jpg"
        />
        {/* Ganti 'hero-image.jpg' dengan nama file gambar utama Anda */}
      </Helmet>
      <Navbar />

      <main className="flex-1">
        <HeroSection />

        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-primary/5 to-secondary/5 overflow-hidden relative">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Fakta Kesehatan Mental di Indonesia
              </h2>
              <p className="text-muted-foreground">
                Yuk, kenali kondisi kesehatan mental di Indonesia dan arti
                pentingnya untuk kualitas hidup kita.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full transform group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">
                    19 Juta+
                  </h3>
                  <p className="text-muted-foreground">
                    Penduduk Indonesia usia &gt;15 tahun mengalami gangguan
                    mental emosional
                  </p>
                </div>
                <div className="w-24 h-24 absolute -bottom-8 -left-8 bg-secondary/5 rounded-full"></div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-secondary/10 rounded-full transform group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/10 mb-4">
                    <Activity className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-secondary">
                    85%
                  </h3>
                  <p className="text-muted-foreground">
                    Gangguan mental tidak mendapat pengobatan yang tepat
                  </p>
                </div>
                <div className="w-24 h-24 absolute -bottom-8 -left-8 bg-primary/5 rounded-full"></div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-accent/10 rounded-full transform group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 mb-4">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-accent-600">
                    30%
                  </h3>
                  <p className="text-muted-foreground">
                    Peningkatan kesejahteraan bagi mereka yang mencari bantuan
                  </p>
                </div>
                <div className="w-24 h-24 absolute -bottom-8 -left-8 bg-accent/5 rounded-full"></div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full transform group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">
                    10 Menit
                  </h3>
                  <p className="text-muted-foreground">
                    Meditasi harian dapat menurunkan tingkat stres hingga 40%
                  </p>
                </div>
                <div className="w-24 h-24 absolute -bottom-8 -left-8 bg-secondary/5 rounded-full"></div>
              </div>
            </div>

            <div className="mt-10 text-center fade-in">
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Pelajari Lebih Lanjut <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute top-1/3 left-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full animate-float"></div>
          <div
            className="absolute bottom-1/4 right-0 w-32 h-32 bg-secondary/5 blur-2xl rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </section>

        <section className="section-padding bg-muted">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-4 py-1 text-secondary text-sm font-medium mb-4">
                <span>Tes Mental</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Evaluasi Kesehatan Mental Anda
              </h2>
              <p className="text-muted-foreground">
                Mulai perjalanan kesehatan mental Anda dengan berbagai tes yang
                dirancang oleh para ahli.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fade-in">
              {featuredTests.map((test) => (
                <TestCard key={test.id} {...test} />
              ))}
            </div>

            <div className="text-center mt-12 fade-in">
              <Link to="/tests">
                <Button variant="outline" size="lg">
                  Lihat Semua Tes <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
                <span>Layanan Kami</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Solusi Komprehensif untuk Kesehatan Mental
              </h2>
              <p className="text-muted-foreground">
                Mind MHIRC menyediakan berbagai layanan yang dirancang untuk
                membantu Anda mencapai kesejahteraan mental yang optimal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in">
              {services.map((service) => (
                <ServiceCard key={service.id} {...service} />
              ))}
            </div>

            <div className="text-center mt-12 fade-in">
              <Link to="/services">
                <Button variant="outline" size="lg">
                  Eksplorasi Semua Layanan{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-b from-muted to-background relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="fade-in">
                <div className="inline-flex items-center space-x-2 bg-accent/10 rounded-full px-4 py-1 text-accent-600 text-sm font-medium mb-4">
                  <span>Riset &amp; Inovasi</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Memadukan Ilmu Pengetahuan &amp; Teknologi
                </h2>
                <p className="text-muted-foreground mb-6">
                  Mind MHIRC merupakan pusat riset inovatif yang berfokus pada
                  pengembangan solusi kesehatan mental berbasis bukti dan peka
                  budaya. Kami memadukan riset ilmiah, teknologi mutakhir, dan
                  pemahaman konteks budaya lokal.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Penelitian berbasis bukti tentang intervensi kesehatan mental",
                    "Pengembangan teknologi untuk meningkatkan aksesibilitas layanan",
                    "Adaptasi dan validasi instrumen penilaian kesehatan mental",
                    "Studi tentang kesehatan mental dalam konteks budaya Indonesia"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-secondary text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/about">
                  <Button>
                    Pelajari Lebih Lanjut{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="relative fade-in">
                <div className="rounded-2xl overflow-hidden shadow-highlight">
                  <img
                    src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80"
                    alt="Research Lab"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-medium max-w-[260px]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Publikasi Ilmiah</p>
                      <p className="text-sm text-muted-foreground">
                        25+ publikasi di jurnal internasional
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-4 py-1 text-secondary text-sm font-medium mb-4">
                <span>Blog</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Artikel Terbaru
              </h2>
              <p className="text-muted-foreground">
                Temukan wawasan, tips, dan informasi terkini seputar kesehatan
                mental dari para ahli dan peneliti Mind MHIRC.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 fade-in">
                <div className="flex flex-col space-y-3">
                  <div className="h-56 bg-muted animate-pulse rounded-xl mb-4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-2"></div>
                  <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="h-56 bg-muted animate-pulse rounded-xl mb-4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-2"></div>
                  <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 fade-in">
                {displayedBlogPosts.map((post) => (
                  <BlogPost key={post.id} post={post} />
                ))}
              </div>
            )}

            <div className="text-center mt-12 fade-in">
              <Link to="/blog">
                <Button variant="outline" size="lg">
                  Baca Semua Artikel <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="section-padding bg-secondary/5">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 fade-in">
              <div className="inline-flex items-center space-x-2 bg-accent/10 rounded-full px-4 py-1 text-accent-600 text-sm font-medium mb-4">
                <span>Testimoni</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Apa Kata Mereka
              </h2>
              <p className="text-muted-foreground mb-8">
                Dengarkan pengalaman mereka yang telah menggunakan layanan dan
                mengikuti program Mind MHIRC.
              </p>
            </div>

            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>

        <section className="section-padding bg-primary/5">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-6 fade-in">
              <h2 className="text-3xl md:text-4xl font-bold">
                Mulai Perjalanan Kesehatan Mental Anda Sekarang
              </h2>
              <p className="text-lg text-muted-foreground">
                Gabung dengan ribuan orang yang telah mengambil langkah pertama
                menuju kesehatan mental yang lebih baik bersama Mind MHIRC.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Link to="/tests">
                  <Button size="lg">Coba Tes Mental Gratis</Button>
                </Link>
                <Link to="/login?register=true">
                  <Button variant="outline" size="lg">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Internal linking section for SEO */}
        <section className="container mx-auto px-4 py-16">
          <RelatedContent
            title="Mulai Perjalanan Kesehatan Mental Anda"
            links={[
              {
                to: "/tests",
                text: "Tes Kesehatan Mental",
                description: "Evaluasi kondisi kesehatan mental Anda dengan berbagai tes yang telah tervalidasi"
              },
              {
                to: "/about",
                text: "Tentang Mind MHIRC",
                description: "Pelajari lebih lanjut tentang misi dan visi kami dalam kesehatan mental"
              },
              {
                to: "/services",
                text: "Layanan Kami",
                description: "Temukan berbagai layanan kesehatan mental yang kami tawarkan"
              },
              {
                to: "/blog",
                text: "Artikel Kesehatan Mental",
                description: "Baca artikel terbaru tentang tips dan informasi kesehatan mental"
              }
            ]}
          />
        </section>
      </main>

      <Footer />
      <WebVitals />
      
      {/* SEO Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Mind MHIRC",
          "description": "Pusat riset dan layanan kesehatan mental berbasis bukti di Indonesia",
          "url": "https://mind-mhirc.my.id",
          "logo": "https://mind-mhirc.my.id/logo.png",
          "sameAs": [
            "https://www.facebook.com/mindmhirc",
            "https://www.instagram.com/mindmhirc"
          ]
        })}
      </script>
    </div>
  );
};

export default Index;
