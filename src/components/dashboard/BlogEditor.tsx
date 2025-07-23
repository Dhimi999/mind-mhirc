
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImagePreview from "./ImagePreview";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const BlogEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [category, setCategory] = useState("Berita");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [slug_, setSlug] = useState("");
  
  // New fields
  const [readTime, setReadTime] = useState("5 min");
  const [references, setReferences] = useState("");
  
  // Preview state
  const [showAuthorPreview, setShowAuthorPreview] = useState(false);
  const [showCoverPreview, setShowCoverPreview] = useState(false);
  
  // Fetch post data if editing
  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        try {
          setLoadingPost(true);
          const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data) {
            setTitle(data.title);
            setAuthorName(data.author_name);
            setAuthorAvatar(data.author_avatar);
            setCategory(data.category);
            setCoverImage(data.cover_image);
            setExcerpt(data.excerpt);
            setContent(data.content);
            setTags(data.tags ? data.tags.join(", ") : "");
            setSlug(data.slug);
            setReadTime(data.read_time || "5 min");
            
            // Handle references_cit, which might be stored as a JSON array or string
            if (data.references_cit) {
              if (typeof data.references_cit === 'string') {
                setReferences(data.references_cit);
              } else if (Array.isArray(data.references_cit)) {
                setReferences(data.references_cit.join("\n"));
              } else {
                // Handle JSON object if that's how it's stored
                try {
                  const refsArray = Object.values(data.references_cit);
                  setReferences(refsArray.join("\n"));
                } catch (e) {
                  console.error("Error parsing references:", e);
                  setReferences("");
                }
              }
            }
          }
        } catch (err) {
          console.error("Error fetching post:", err);
          toast.error("Gagal memuat data konten");
        } finally {
          setLoadingPost(false);
        }
      };
      
      fetchPost();
    }
  }, [slug]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = async () => {
    if (!title || !authorName || !authorAvatar || !category || !coverImage || !excerpt || !content || !slug_ || !readTime) {
      toast.error("Semua field diperlukan kecuali referensi");
      return;
    }
    
    try {
      setLoading(true);
      
      const tagsArray = tags
        ? tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      // Process references - split by new line and create array
      const referencesArray = references
        ? references.split("\n").map(ref => ref.trim()).filter(ref => ref)
        : null;
      
      const now = new Date().toISOString();
      
      const postData = {
        title,
        author_name: authorName,
        author_avatar: authorAvatar,
        category,
        cover_image: coverImage,
        excerpt,
        content,
        slug: slug_,
        tags: tagsArray,
        comments: [],
        likes: 0,
        featured: false,
        read_time: readTime,
        references_cit: referencesArray,
        published_date: now,
        updated_date: now
      };
      
      if (slug) {
        // Update existing post
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: postData.title,
            author_name: postData.author_name,
            author_avatar: postData.author_avatar,
            category: postData.category,
            cover_image: postData.cover_image,
            excerpt: postData.excerpt,
            content: postData.content,
            tags: postData.tags,
            updated_date: now,
            read_time: postData.read_time,
            references_cit: postData.references_cit
          })
          .eq("slug", slug);
        
        if (error) {
          throw error;
        }
        
        toast.success("Konten berhasil diperbarui");
      } else {
        // Create new post
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);
        
        if (error) {
          throw error;
        }
        
        toast.success("Konten berhasil disimpan");
      }
      
      // Redirect back to content management
      navigate("/dashboard/content");
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error("Gagal menyimpan konten");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/content");
  };

  if (loadingPost) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {slug ? "Edit Konten" : "Tambah Konten Baru"}
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleCancel} variant="outline">
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="font-medium" htmlFor="title">
              Judul
            </label>
            <Input
              id="title"
              placeholder="Judul konten"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium" htmlFor="slug">
              Slug URL
            </label>
            <Input
              id="slug"
              placeholder="url-konten-anda"
              value={slug_}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!!slug}
            />
            {slug && (
              <p className="text-sm text-muted-foreground">
                Slug tidak dapat diubah setelah konten dibuat
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium" htmlFor="author-name">
                Nama Penulis
              </label>
              <Input
                id="author-name"
                placeholder="Nama penulis"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium" htmlFor="author-avatar">
                URL Foto Penulis
              </label>
              <div className="flex gap-2">
                <Input
                  id="author-avatar"
                  placeholder="https://example.com/avatar.jpg"
                  value={authorAvatar}
                  onChange={(e) => setAuthorAvatar(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowAuthorPreview(!showAuthorPreview)}
                >
                  {showAuthorPreview ? "Tutup" : "Lihat"}
                </Button>
              </div>
              {showAuthorPreview && authorAvatar && (
                <ImagePreview url={authorAvatar} alt="Author avatar" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium" htmlFor="category">
                Kategori
              </label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Berita">Berita</SelectItem>
                  <SelectItem value="Edukasi">Edukasi</SelectItem>
                  <SelectItem value="Tips">Tips</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="font-medium" htmlFor="tags">
                Tags (pisahkan dengan koma)
              </label>
              <Input
                id="tags"
                placeholder="kesehatan, mental, tips"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* New field: Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium" htmlFor="read-time">
                Estimasi Waktu Baca
              </label>
              <Select
                value={readTime}
                onValueChange={(value) => setReadTime(value)}
              >
                <SelectTrigger id="read-time">
                  <SelectValue placeholder="Pilih estimasi waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 min">3 menit</SelectItem>
                  <SelectItem value="5 min">5 menit</SelectItem>
                  <SelectItem value="7 min">7 menit</SelectItem>
                  <SelectItem value="10 min">10 menit</SelectItem>
                  <SelectItem value="15 min">15 menit</SelectItem>
                  <SelectItem value="20 min">20+ menit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium" htmlFor="cover-image">
              URL Gambar Sampul
            </label>
            <div className="flex gap-2">
              <Input
                id="cover-image"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowCoverPreview(!showCoverPreview)}
              >
                {showCoverPreview ? "Tutup" : "Lihat"}
              </Button>
            </div>
            {showCoverPreview && coverImage && (
              <ImagePreview url={coverImage} alt="Cover image" />
            )}
          </div>

          <div className="space-y-2">
            <label className="font-medium" htmlFor="excerpt">
              Ringkasan
            </label>
            <Textarea
              id="excerpt"
              placeholder="Ringkasan singkat dari konten"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          {/* New field: References */}
          <div className="space-y-2">
            <label className="font-medium" htmlFor="references">
              Referensi (opsional, satu referensi per baris)
            </label>
            <Textarea
              id="references"
              placeholder="Masukkan daftar referensi, satu per baris"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Contoh: Nama Pengarang. (Tahun). Judul artikel. Nama Jurnal, Volume(Nomor), Halaman.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-medium">Konten</label>
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Tulis konten artikel Anda di sini..."
              className="min-h-[500px]"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button onClick={handleCancel} variant="outline">
          Batal
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
