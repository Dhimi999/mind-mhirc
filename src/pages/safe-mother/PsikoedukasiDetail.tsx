import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, User, Calendar, Download, Share2 } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Material {
  id: string;
  title: string;
  description: string;
  type: "text" | "video" | "leaflet";
  author_name: string;
  category: string;
  thumbnail_url: string | null;
  video_url?: string | null;
  content?: string | null;
  hd_image_url?: string | null;
  created_at: string;
  slug: string;
}

const PsikoedukasiDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterial();
  }, [slug]);

  const fetchMaterial = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safe_mother_materials')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) throw error;
      
      setMaterial(data as Material);
    } catch (error: any) {
      toast.error("Gagal memuat materi");
      console.error(error);
      navigate('/safe-mother/psikoedukasi');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHD = () => {
    if (material?.hd_image_url) {
      window.open(material.hd_image_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
        <SafeMotherNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Memuat materi...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 font-sans selection:bg-pink-100 selection:text-pink-900">
      <Helmet>
        <title>{material.title} - Psikoedukasi Safe Mother | Mind MHIRC</title>
        <meta name="description" content={material.description} />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/safe-mother/psikoedukasi')}
            className="mb-8 hover:bg-white/50 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Psikoedukasi
          </Button>

          {/* Article Header */}
          <article className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-white/50 animate-fade-in-up">
            {(material.type === "text" || material.type === "leaflet") && material.thumbnail_url && (
              <div className="w-full h-[400px] overflow-hidden relative group">
                <img
                  src={material.thumbnail_url}
                  alt={material.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            )}

            <div className="p-8 md:p-12">
              {/* Category Badge */}
              <div className="mb-6">
                <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium border border-pink-200">
                  {material.category === 'pregnancy' ? 'Kehamilan' : 
                   material.category === 'postpartum' ? 'Pasca Melahirkan' :
                   material.category === 'mental-health' ? 'Kesehatan Mental' :
                   material.category === 'parenting' ? 'Pengasuhan' : material.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {material.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                  <User className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium text-gray-700">{material.author_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {format(new Date(material.created_at), "d MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {format(new Date(material.created_at), "HH:mm", { locale: id })} WIB
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium italic border-l-4 border-pink-300 pl-6">
                {material.description}
              </p>

              {/* Content */}
              {material.type === "text" && material.content && (
                <div 
                  className="prose prose-lg max-w-none text-gray-800 leading-relaxed prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: material.content }}
                />
              )}

              {/* Video */}
              {material.type === "video" && material.video_url && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/50">
                  <iframe
                    src={material.video_url}
                    title={material.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Leaflet/Poster */}
              {material.type === "leaflet" && (
                <div className="space-y-8">
                  <div className="rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/50 bg-gray-100">
                    <img
                      src={material.hd_image_url || material.thumbnail_url || ""}
                      alt={material.title}
                      className="w-full h-auto"
                    />
                  </div>
                  {material.hd_image_url && (
                    <div className="flex justify-center">
                      <Button
                        onClick={handleDownloadHD}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-200/50 rounded-full px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Gambar Kualitas Tinggi
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PsikoedukasiDetail;
