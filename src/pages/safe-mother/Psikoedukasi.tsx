import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { PlayCircle, FileText, User, Search, Filter, Heart, Plus, Calendar, Settings, Image as ImageIcon, Sparkles, BookOpen } from "lucide-react";
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

  const handleMaterialDeleted = () => {
    // Clear cache
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {}
    // Refetch
    fetchMaterials();
  };

  const categories = [
    { value: "all", label: "Semua Topik" },
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 font-sans selection:bg-pink-100 selection:text-pink-900">
      <Helmet>
        <title>Psikoedukasi - Safe Mother | Mind MHIRC</title>
        <meta name="description" content="Materi edukasi komprehensif tentang kesehatan mental maternal, kehamilan, dan pengasuhan untuk mendukung perjalanan keibuan Anda." />
      </Helmet>

      <SafeMotherNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-soft"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-200/30 to-teal-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-sm rounded-full mb-6 shadow-sm border border-white/50 animate-fade-in">
              <BookOpen className="w-5 h-5 text-pink-500 mr-2" />
              <span className="text-pink-600 font-medium">Pusat Edukasi Maternal</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
              Perkaya Wawasan, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Tenangkan Pikiran
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Kumpulan artikel, video, dan panduan praktis yang dikurasi oleh ahli untuk mendampingi setiap langkah perjalanan keibuan Anda.
            </p>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-pink-100/50 border border-white/50 flex flex-col md:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari topik (misal: kecemasan, menyusui)..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="block w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all placeholder-gray-400 text-gray-800" 
                />
              </div>
              <div className="md:w-72 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)} 
                  className="block w-full pl-11 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all text-gray-800 appearance-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12">
          {/* Add Material Buttons for Professionals */}
          {isProfessional && (
            <div className="mb-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-end animate-fade-in">
              <Button
                onClick={() => {
                  setEditMaterialId(undefined);
                  setIsDialogOpen(true);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-200/50 rounded-full px-6 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Materi
              </Button>
              <Button
                onClick={() => setIsManageDialogOpen(true)}
                variant="outline"
                className="border-pink-200 text-pink-700 hover:bg-pink-50 rounded-full px-6"
              >
                <Settings className="w-4 h-4 mr-2" />
                Kelola Materi
              </Button>
            </div>
          )}

          {/* Materials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white/60 backdrop-blur-sm rounded-3xl h-96 animate-pulse border border-white/50 shadow-sm"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMaterials.map((material, idx) => (
                <div 
                  key={material.id} 
                  className="group bg-white/70 backdrop-blur-md rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/50 cursor-pointer flex flex-col h-full animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => navigate(`/safe-mother/psikoedukasi/${material.slug}`)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={material.thumbnail_url || "https://images.unsplash.com/photo-1578496780896-7081cc446fb1?auto=format&fit=crop&q=80&w=400"} 
                      alt={material.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20 ${
                        material.type === "video" ? "bg-red-500/90 text-white" : 
                        material.type === "leaflet" ? "bg-green-500/90 text-white" :
                        "bg-blue-500/90 text-white"
                      }`}>
                        {material.type === "video" ? <PlayCircle className="w-3 h-3" /> : 
                         material.type === "leaflet" ? <ImageIcon className="w-3 h-3" /> :
                         <FileText className="w-3 h-3" />}
                        <span>{material.type === "video" ? "Video" : material.type === "leaflet" ? "Infografis" : "Artikel"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 text-xs font-medium border border-pink-100">
                          {categories.find(c => c.value === material.category)?.label || material.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2 leading-tight">
                        {material.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {material.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <User className="w-3 h-3 mr-1.5 text-pink-400" />
                        <span className="truncate max-w-[120px]">{material.author_name}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 font-medium">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        <span>{new Date(material.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredMaterials.length === 0 && !loading && (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 animate-fade-in">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tidak ada materi ditemukan
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Kami tidak dapat menemukan materi yang cocok dengan pencarian "{searchTerm}". Coba gunakan kata kunci lain atau ubah filter kategori.
              </p>
              <Button 
                variant="outline" 
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
                onClick={() => {setSearchTerm(""); setSelectedCategory("all");}}
              >
                Reset Pencarian
              </Button>
            </div>
          )}
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
            onMaterialDeleted={handleMaterialDeleted}
          />
        </>
      )}
    </div>
  );
};

export default Psikoedukasi;