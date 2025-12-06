import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, FileText, Video, Image } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Material {
  id: string;
  title: string;
  type: string;
  category: string;
  created_at: string;
  author_name: string;
}

interface ManagePsikoedukasiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (materialId: string) => void;
  onMaterialDeleted?: () => void;
}

export const ManagePsikoedukasiDialog = ({ open, onOpenChange, onEdit, onMaterialDeleted }: ManagePsikoedukasiDialogProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchMaterials();
    }
  }, [open]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safe_mother_materials')
        .select('id, title, type, category, created_at, author_name')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setMaterials((data || []) as Material[]);
    } catch (error: any) {
      toast.error("Gagal memuat materi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('safe_mother_materials')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Materi berhasil dihapus");
      fetchMaterials();
      if (onMaterialDeleted) {
        onMaterialDeleted();
      }
    } catch (error: any) {
      toast.error("Gagal menghapus materi");
      console.error(error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "leaflet":
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video";
      case "leaflet":
        return "Leaflet/Poster";
      default:
        return "Artikel";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manajemen Psikoedukasi</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Memuat materi...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada materi yang tersedia</p>
              ) : (
                materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(material.type)}
                        <h3 className="font-semibold text-gray-900">{material.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getTypeLabel(material.type)} • {material.author_name} • {new Date(material.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onEdit(material.id);
                          onOpenChange(false);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm(material.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
