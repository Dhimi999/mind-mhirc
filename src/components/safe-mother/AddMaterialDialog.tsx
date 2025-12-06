import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage } from "@/services/imageCompression";
import { FileText, Video, Upload, Image as ImageIcon } from "lucide-react";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  authorName: string;
  authorId: string;
  editMaterialId?: string;
}

export const AddMaterialDialog = ({ open, onOpenChange, onSuccess, authorName, authorId, editMaterialId }: AddMaterialDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("mental-health");
  const [type, setType] = useState<"text" | "video" | "leaflet">("text");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [hdImageFile, setHdImageFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const contentEditorRef = useRef<HTMLDivElement>(null);

  // Load material data when editing
  useEffect(() => {
    if (open && editMaterialId) {
      loadMaterial(editMaterialId);
    } else if (open && !editMaterialId) {
      resetForm();
    }
  }, [open, editMaterialId]);

  const loadMaterial = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('safe_mother_materials')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setType(data.type as "text" | "video" | "leaflet");
      
      if (data.type === "text" && data.content && contentEditorRef.current) {
        contentEditorRef.current.innerHTML = data.content;
        setContent(data.content);
      }
      
      if (data.type === "video" && data.video_url) {
        setVideoUrl(data.video_url);
      }
    } catch (error: any) {
      toast.error("Gagal memuat data materi");
      console.error(error);
    }
  };

  const extractYoutubeEmbedUrl = (url: string): string => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /youtube\.com\/watch\?.*v=([^&\s]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url; // Return original if no pattern matches
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const checkDuplicateTitle = async (checkTitle: string): Promise<boolean> => {
    const slug = generateSlug(checkTitle);
    const { data, error } = await supabase
      .from('safe_mother_materials')
      .select('id')
      .eq('slug', slug)
      .neq('id', editMaterialId || '');
      
    if (error) {
      console.error(error);
      return false;
    }
    
    return (data && data.length > 0);
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setThumbnailFile(compressed);
        toast.success("Thumbnail berhasil dimuat dan dikompresi");
      } catch (error) {
        toast.error("Gagal memproses gambar");
      }
    }
  };

  const handleHdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHdImageFile(file);
      // Auto set as thumbnail too (but compressed)
      handleThumbnailChange(e);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error("Judul dan deskripsi wajib diisi");
      return;
    }
    
    if (type === "text" && !content) {
      toast.error("Isi materi wajib diisi untuk materi tulisan");
      return;
    }
    
    if (type === "video" && !videoUrl) {
      toast.error("Link video wajib diisi untuk materi video");
      return;
    }

    if (type === "leaflet" && !hdImageFile && !editMaterialId) {
      toast.error("Gambar wajib diunggah untuk leaflet/poster");
      return;
    }
    
    // Show loading and check for duplicate title
    setLoading(true);
    try {
      const isDuplicate = await checkDuplicateTitle(title);
      if (isDuplicate) {
        setShowDuplicateWarning(true);
        return;
      }
      
      // If no duplicate, show confirmation
      setShowConfirmation(true);
    } catch (error) {
      toast.error("Gagal memeriksa duplikasi judul");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmedSubmit = async () => {
    setLoading(true);
    try {
      let thumbnailUrl = null;
      let hdImageUrl = null;
      
      // Upload HD image for leaflet (original quality)
      if (type === "leaflet" && hdImageFile) {
        const fileExt = hdImageFile.name.split('.').pop();
        const hdFileName = `hd-${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: hdUploadError } = await supabase.storage
          .from('safe-mother-materials')
          .upload(hdFileName, hdImageFile);
          
        if (hdUploadError) throw hdUploadError;
        
        const { data: hdUrlData } = supabase.storage
          .from('safe-mother-materials')
          .getPublicUrl(hdFileName);
          
        hdImageUrl = hdUrlData.publicUrl;
      }
      
      // Upload thumbnail if exists (compressed)
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `thumb-${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('safe-mother-materials')
          .upload(fileName, thumbnailFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('safe-mother-materials')
          .getPublicUrl(fileName);
          
        thumbnailUrl = urlData.publicUrl;
      }
      
      // Process video URL if type is video
      const processedVideoUrl = type === "video" ? extractYoutubeEmbedUrl(videoUrl) : null;
      
      const slug = generateSlug(title);
      
      // Insert or update material
      const finalType = type === "leaflet" ? "Leaflet/Poster" : type;
      
      if (editMaterialId) {
        const updateData: any = {
          title,
          description,
          slug,
          content: type === "text" ? content : null,
          video_url: processedVideoUrl,
          type: finalType,
          category,
        };
        
        if (thumbnailUrl) updateData.thumbnail_url = thumbnailUrl;
        if (hdImageUrl) updateData.hd_image_url = hdImageUrl;
        
        const { error: updateError } = await supabase
          .from('safe_mother_materials')
          .update(updateData)
          .eq('id', editMaterialId);
          
        if (updateError) throw updateError;
        toast.success("Materi berhasil diperbarui!");
      } else {
        const { error: insertError } = await supabase
          .from('safe_mother_materials')
          .insert({
            title,
            description,
            slug,
            content: type === "text" ? content : null,
            video_url: processedVideoUrl,
            thumbnail_url: thumbnailUrl,
            hd_image_url: hdImageUrl,
            type: finalType,
            category,
            author_name: authorName,
            author_id: authorId
          });
          
        if (insertError) throw insertError;
        toast.success("Materi berhasil ditambahkan!");
      }
      
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan materi");
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditorRef.current?.focus();
  };

  const handleContentInput = () => {
    if (contentEditorRef.current) {
      setContent(contentEditorRef.current.innerHTML);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setVideoUrl("");
    setCategory("mental-health");
    setType("text");
    setThumbnailFile(null);
    setHdImageFile(null);
    if (contentEditorRef.current) {
      contentEditorRef.current.innerHTML = "";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMaterialId ? "Edit Psikoedukasi" : "Tambah Psikoedukasi"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Materi</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul materi"
              />
            </div>
            
            <div>
              <Label>Jenis Materi</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setType("text")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    type === "text"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium text-sm">Tulisan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("video")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    type === "video"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <Video className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium text-sm">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("leaflet")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    type === "leaflet"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium text-sm">Leaflet/Poster</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="pregnancy">Kehamilan</option>
                <option value="postpartum">Pasca Melahirkan</option>
                <option value="mental-health">Kesehatan Mental</option>
                <option value="parenting">Pengasuhan</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="description">Deskripsi Singkat</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan deskripsi singkat"
                rows={3}
              />
            </div>

            {type !== "leaflet" && (
              <div>
                <Label htmlFor="thumbnail">Unggah Thumbnail</Label>
                <div className="mt-2">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="cursor-pointer"
                  />
                  {thumbnailFile && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      {thumbnailFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {type === "text" && (
              <div>
                <Label htmlFor="content">Isi Materi</Label>
                <div className="border rounded-lg overflow-hidden">
                  {/* Simple Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("bold")}
                      className="h-8 w-8 p-0"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("italic")}
                      className="h-8 w-8 p-0"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("underline")}
                      className="h-8 w-8 p-0"
                      title="Underline"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("insertUnorderedList")}
                      className="h-8 w-8 p-0"
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("insertOrderedList")}
                      className="h-8 w-8 p-0"
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("formatBlock", "H1")}
                      className="h-8 w-8 p-0"
                      title="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("formatBlock", "H2")}
                      className="h-8 w-8 p-0"
                      title="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => execCommand("formatBlock", "H3")}
                      className="h-8 w-8 p-0"
                      title="Heading 3"
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Editor */}
                  <div
                    ref={contentEditorRef}
                    contentEditable
                    onInput={handleContentInput}
                    className="min-h-[200px] p-4 outline-none prose prose-sm max-w-none"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
              </div>
            )}

            {type === "video" && (
              <div>
                <Label htmlFor="videoUrl">Link Video YouTube</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link akan otomatis dikonversi ke format embed
                </p>
              </div>
            )}

            {type === "leaflet" && (
              <div>
                <Label htmlFor="hdImage">Unggah Gambar (HD)</Label>
                <div className="mt-2">
                  <Input
                    id="hdImage"
                    type="file"
                    accept="image/*"
                    onChange={handleHdImageChange}
                    className="cursor-pointer"
                  />
                  {hdImageFile && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      {hdImageFile.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Gambar akan disimpan dalam kualitas HD untuk download, dan versi terkompresi sebagai thumbnail
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Memeriksa..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Publikasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah materi akan dipublikasikan oleh <strong>{authorName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Ya, Publikasikan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Materi Sudah Ada</AlertDialogTitle>
            <AlertDialogDescription>
              Materi dengan judul tersebut sudah ada, silahkan periksa kembali materi Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDuplicateWarning(false)}>
              OKE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
