import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { PlayCircle, FileText, User, Search, Filter, Heart, Plus, Calendar, Settings, Image as ImageIcon } from "lucide-react";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddMaterialDialog } from "@/components/safe-mother/AddMaterialDialog";
import { ManagePsikoedukasiDialog } from "@/components/safe-mother/ManagePsikoedukasiDialog";
import { useAuth } from "@/contexts/AuthContext";
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
  created_at: string;
  slug: string;
}

const Psikoedukasi = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<string | undefined>(undefined);
  const [isProfessional, setIsProfessional] = useState(false);
  // simple cache using sessionStorage with TTL to avoid refetch on tab refocus
  const CACHE_KEY = 'safe_mother_materials_cache_v1';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  const cacheLoadedRef = useRef(false);

  useEffect(() => {
    // Load from cache on first mount
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; data: Material[] };
        const fresh = Date.now() - parsed.ts < CACHE_TTL_MS;
        if (fresh && Array.isArray(parsed.data)) {
          setMaterials(parsed.data);
          setLoading(false);
          cacheLoadedRef.current = true;
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Always check role when user changes
    checkUserRole();
    // Fetch only if not loaded from cache yet
    if (!cacheLoadedRef.current) {
      fetchMaterials();
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single();
      
    if (data && !error) {
      setIsProfessional(data.account_type === 'professional');
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safe_mother_materials')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      const list = (data || []) as Material[];
      setMaterials(list);
      // update cache
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }));
      } catch {}
    } catch (error: any) {
      toast.error("Gagal memuat materi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "Semua" },
    { value: "pregnancy", label: "Kehamilan" },
    { value: "postpartum", label: "Pasca Melahirkan" },
    { value: "mental-health", label: "Kesehatan Mental" },
    { value: "parenting", label: "Pengasuhan" }
  ];
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) || material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <Helmet>
        <title>Psikoedukasi - Safe Mother | Mind MHIRC</title>
        <meta name="description" content="Materi edukasi komprehensif tentang kesehatan mental maternal, kehamilan, dan pengasuhan untuk mendukung perjalanan keibuan Anda." />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1 pt-8 my-[12px] py-[12px]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-[24px]">
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
                <input type="text" placeholder="Cari materi edukasi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none">
                  {categories.map(category => <option key={category.value} value={category.value}>
                      {category.label}
                    </option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Add Material Buttons for Professionals */}
          {isProfessional && (
            <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
              <Button
                onClick={() => {
                  setEditMaterialId(undefined);
                  setIsDialogOpen(true);
                }}
                className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto min-w-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Psikoedukasi
              </Button>
              <Button
                onClick={() => setIsManageDialogOpen(true)}
                variant="outline"
                className="border-pink-600 text-pink-600 hover:bg-pink-50 w-full sm:w-auto min-w-0"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manajemen Psikoedukasi
              </Button>
            </div>
          )}

          {/* Materials Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat materi...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map(material => (
                <div 
                  key={material.id} 
                  className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
                  onClick={() => navigate(`/safe-mother/psikoedukasi/${material.slug}`)}
                >
                  <div className="relative">
                    <img 
                      src={material.thumbnail_url || "https://images.unsplash.com/photo-1578496780896-7081cc446fb1?auto=format&fit=crop&q=80&w=400"} 
                      alt={material.title} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    
                    {/* Type indicator */}
                    <div className="absolute top-4 left-4">
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        material.type === "video" ? "bg-red-100 text-red-700" : 
                        material.type === "leaflet" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {material.type === "video" ? <PlayCircle className="w-3 h-3" /> : 
                         material.type === "leaflet" ? <ImageIcon className="w-3 h-3" /> :
                         <FileText className="w-3 h-3" />}
                        <span>{material.type === "video" ? "Video" : material.type === "leaflet" ? "Media Grafis" : "Artikel"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                        {material.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {material.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{material.author_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(material.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredMaterials.length === 0 && <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada materi ditemukan
              </h3>
              <p className="text-gray-600">
                Coba ubah kata kunci pencarian atau filter kategori Anda.
              </p>
            </div>}
        </div>
      </main>

      <Footer />
      
      {user && isProfessional && (
        <>
          <AddMaterialDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSuccess={fetchMaterials}
            authorName={user.full_name || user.email || "Professional"}
            authorId={user.id}
            editMaterialId={editMaterialId}
          />
          <ManagePsikoedukasiDialog
            open={isManageDialogOpen}
            onOpenChange={setIsManageDialogOpen}
            onEdit={(id) => {
              setEditMaterialId(id);
              setIsDialogOpen(true);
            }}
          />
        </>
      )}
    </div>;
};
export default Psikoedukasi;