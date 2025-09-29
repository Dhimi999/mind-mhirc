import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, User, Calendar, Download } from "lucide-react";
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
          <p className="text-gray-600">Memuat materi...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>{material.title} - Psikoedukasi Safe Mother | Mind MHIRC</title>
        <meta name="description" content={material.description} />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8 my-[12px] py-[12px]">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-[24px]">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/safe-mother/psikoedukasi')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Psikoedukasi
          </Button>

          {/* Article Header */}
          <article className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {(material.type === "text" || material.type === "leaflet") && material.thumbnail_url && (
              <div className="w-full h-96 overflow-hidden">
                <img
                  src={material.thumbnail_url}
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {material.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{material.author_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {format(new Date(material.created_at), "d MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {format(new Date(material.created_at), "HH:mm", { locale: id })} WIB
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {material.description}
              </p>

              {/* Content */}
              {material.type === "text" && material.content && (
                <div 
                  className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: material.content }}
                />
              )}

              {/* Video */}
              {material.type === "video" && material.video_url && (
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
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
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden shadow-lg">
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
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Gambar HD
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
