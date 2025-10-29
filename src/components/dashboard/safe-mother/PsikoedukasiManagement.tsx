import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddMaterialDialog } from "@/components/safe-mother/AddMaterialDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { FileText, Image as ImageIcon, MoreVertical, Plus, RefreshCcw, Search, Trash2, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type MaterialType = "text" | "video" | "leaflet";

interface Material {
  id: string;
  title: string;
  description?: string;
  type: string; // stored values may be "text" | "video" | "leaflet" | "Leaflet/Poster"
  category?: string;
  created_at: string;
  author_name?: string;
  slug: string;
}

const normalizeType = (raw: string): MaterialType => {
  const v = (raw || "").toLowerCase();
  if (v === "leaflet" || v.includes("leaflet")) return "leaflet";
  if (v === "video") return "video";
  return "text";
};

const typeIcon = (t: MaterialType) => {
  switch (t) {
    case "video":
      return <Video className="w-4 h-4" />;
    case "leaflet":
      return <ImageIcon className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const typeLabel = (t: MaterialType) => {
  switch (t) {
    case "video":
      return "Video";
    case "leaflet":
      return "Leaflet/Poster";
    default:
      return "Artikel";
  }
};

const categories = [
  { value: "all", label: "Semua" },
  { value: "pregnancy", label: "Kehamilan" },
  { value: "postpartum", label: "Pasca Melahirkan" },
  { value: "mental-health", label: "Kesehatan Mental" },
  { value: "parenting", label: "Pengasuhan" }
];

const PsikoedukasiManagement: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);

  const authorName = (user as any)?.full_name || user?.email || "Professional";
  const authorId = user?.id || "";
  const canDelete = (user?.is_admin === true) && (user?.account_type === "professional");

  const buildFilteredQuery = () => {
    let query = supabase
      .from("safe_mother_materials")
      .select("id, title, description, type, category, created_at, author_name, slug", { count: "exact" })
      .order("created_at", { ascending: false });

    // Search across title/description
    const q = search.trim();
    if (q) {
      // Supabase .or() expects encoded filters
      const like = `%${q}%`;
      query = query.or(`title.ilike.${like},description.ilike.${like}`);
    }
    // Category filter
    if (category !== "all") {
      query = query.eq("category", category);
    }
    // Type filter
    if (typeFilter !== "all") {
      if (typeFilter === "leaflet") {
        // Stored as "Leaflet/Poster"
        query = query.eq("type", "Leaflet/Poster");
      } else {
        query = query.eq("type", typeFilter);
      }
    }
    return query;
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Count with same filters
      const countQuery = buildFilteredQuery();
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotal(count || 0);

      // Page data with same filters
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let pageQuery = buildFilteredQuery().range(from, to);
      const { data, error } = await pageQuery;
      if (error) throw error;
      setMaterials((data || []) as any);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat materi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // refetch when filters/search change
  useEffect(() => {
    setPage(1);
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, typeFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials.filter((m) => {
      const nt = normalizeType(m.type);
      const matchText = !q || m.title.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q);
      const matchCat = category === "all" || (m.category || "") === category;
      const matchType = typeFilter === "all" || nt === (typeFilter as MaterialType);
      return matchText && matchCat && matchType;
    });
  }, [materials, search, category, typeFilter]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("safe_mother_materials").delete().eq("id", id);
      if (error) throw error;
      toast.success("Materi berhasil dihapus");
      fetchMaterials();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus materi");
    } finally {
      setDeleteId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="mb-1">
        <h1 className="text-2xl font-semibold">Manajemen Psikoedukasi — Safe Mother</h1>
        <p className="text-sm text-muted-foreground">Tambah, ubah, dan hapus materi psikoedukasi dari dashboard.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari judul atau deskripsi..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 bg-background"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="border rounded-md px-3 py-2 bg-background"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Semua Jenis</option>
          <option value="text">Artikel</option>
          <option value="video">Video</option>
          <option value="leaflet">Leaflet/Poster</option>
        </select>
        <Button variant="outline" onClick={fetchMaterials} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Muat Ulang
        </Button>
        <Button
          onClick={() => {
            setEditId(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Materi
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 bg-muted text-xs font-medium text-muted-foreground">
          <div className="col-span-5">Judul</div>
          <div className="col-span-2">Jenis</div>
          <div className="col-span-2">Kategori</div>
          <div className="col-span-2">Tanggal</div>
          <div className="col-span-1 text-right">Aksi</div>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Memuat data...</div>
        ) : materials.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Tidak ada materi ditemukan</div>
        ) : (
          <div className="divide-y">
            {materials.map((m) => {
              const nt = normalizeType(m.type);
              return (
                <div key={m.id} className="px-3 py-3">
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5 min-w-0">
                      <div className="font-medium truncate">{m.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.author_name || "-"}</div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {typeIcon(nt)}
                      <span className="text-sm">{typeLabel(nt)}</span>
                    </div>
                    <div className="col-span-2 text-sm">{m.category || "-"}</div>
                    <div className="col-span-2 text-sm">
                      {new Date(m.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Aksi</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(`/safe-mother/psikoedukasi/${m.slug}`, "_blank")}>Lihat</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditId(m.id); setDialogOpen(true); }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem disabled={!canDelete} onClick={() => canDelete && setDeleteId(m.id)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {/* Mobile card */}
                  <div className="md:hidden">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{typeIcon(nt)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-snug">{m.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {typeLabel(nt)} • {m.category || "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/safe-mother/psikoedukasi/${m.slug}`, "_blank")}>Lihat</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditId(m.id); setDialogOpen(true); }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem disabled={!canDelete} onClick={() => canDelete && setDeleteId(m.id)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Menampilkan {(materials.length === 0 ? 0 : (page - 1) * pageSize + 1)}–{(page - 1) * pageSize + materials.length} dari {total}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Sebelumnya</Button>
          <div className="text-sm">{page} / {totalPages}</div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Berikutnya</Button>
        </div>
      </div>

      <AddMaterialDialog
        open={dialogOpen}
        onOpenChange={(o) => setDialogOpen(o)}
        onSuccess={fetchMaterials}
        authorName={authorName as string}
        authorId={authorId}
        editMaterialId={editId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Materi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Materi akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} disabled={!canDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PsikoedukasiManagement;
