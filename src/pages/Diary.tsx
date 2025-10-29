import { useState, useEffect } from "react";
import { Plus, Search, Calendar, Trash2, Edit3, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DiaryEntryForm } from "@/components/diary/DiaryEntryForm";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  theme_color: string;
  background_image?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Remove templates and colors from here as they're now in DiaryEntryForm

const Diary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    theme_color: "#ffffff",
    background_image: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Remove selectedTemplate as it's handled in DiaryEntryForm
  const { toast } = useToast();
  const { user } = useAuth();

  const entriesPerPage = 10;

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      toast({
        title: "Gagal Memuat Catatan",
        description: "Terjadi kesalahan saat memuat catatan harian",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async (data: { title: string; content: string; theme_color: string; background_image: string }) => {
    if (!user || !data.title.trim() || !data.content.trim()) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Harap isi judul dan isi catatan",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('diary_entries')
          .update({
            title: data.title,
            content: data.content,
            theme_color: data.theme_color,
            background_image: data.background_image || null
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        
        toast({
          title: "Catatan Diperbarui",
          description: "Catatan harian berhasil diperbarui"
        });
      } else {
        const { error } = await supabase
          .from('diary_entries')
          .insert({
            user_id: user.id,
            title: data.title,
            content: data.content,
            theme_color: data.theme_color,
            background_image: data.background_image || null
          });

        if (error) throw error;
        
        toast({
          title: "Catatan Disimpan",
          description: "Catatan harian berhasil disimpan"
        });
      }

      setFormData({ title: "", content: "", theme_color: "#ffffff", background_image: "" });
      setEditingEntry(null);
      setIsDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error("Error saving diary entry:", error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan catatan",
        variant: "destructive"
      });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Catatan Dihapus",
        description: "Catatan harian berhasil dihapus"
      });
      
      fetchEntries();
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus catatan",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setFormData({ 
      title: entry.title, 
      content: entry.content,
      theme_color: entry.theme_color || "#ffffff",
      background_image: entry.background_image || ""
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingEntry(null);
    setFormData({ title: "", content: "", theme_color: "#ffffff", background_image: "" });
    setIsDialogOpen(true);
  };

  // Remove this function as template handling is now in DiaryEntryForm

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catatan Harian</h1>
          <p className="text-muted-foreground mt-2">
            Tulis dan simpan catatan harian Anda di sini
          </p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Catatan Baru
        </Button>
        
        <DiaryEntryForm
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            if (!editingEntry) {
              setFormData({ title: "", content: "", theme_color: "#ffffff", background_image: "" });
            }
          }}
          onSave={saveEntry}
          initialData={editingEntry ? formData : undefined}
          isEditing={!!editingEntry}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari catatan..."
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredEntries.length} catatan ditemukan
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? "Tidak ada catatan yang ditemukan" : "Belum ada catatan"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Coba gunakan kata kunci yang berbeda"
              : "Mulai menulis catatan harian pertama Anda"
            }
          </p>
          {!searchTerm && (
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Catatan Pertama
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentEntries.map((entry) => (
              <Card 
                key={entry.id} 
                className="hover:shadow-md transition-shadow"
                style={{ backgroundColor: entry.theme_color }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Catatan</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus catatan "{entry.title}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEntry(entry.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(entry.updated_at)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} dari {filteredEntries.length} catatan
          </div>
        </>
      )}
    </div>
  );
};

export default Diary;