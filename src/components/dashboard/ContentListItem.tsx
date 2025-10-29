
import { useState } from "react";
import { Eye, Trash, Tag, Image, MessageSquare, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type BlogPost = Tables<'blog_posts'>;

interface ContentListItemProps {
  post: BlogPost;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onUpdateCoverImage: (id: string, url: string) => void;
  onDeleteComment: (id: string, commentIndex: number, comments: any[]) => void;
  onEdit: () => void;
}

const ContentListItem = ({
  post,
  onDelete,
  onUpdateCategory,
  onUpdateCoverImage,
  onDeleteComment,
  onEdit
}: ContentListItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editingCoverImage, setEditingCoverImage] = useState(false);
  const [newCoverImageUrl, setNewCoverImageUrl] = useState(post.cover_image);
  
  // Parse comments from JSON if needed
  const comments = Array.isArray(post.comments) 
    ? post.comments 
    : (typeof post.comments === 'string' ? JSON.parse(post.comments) : []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full mr-2 
                  ${post.category === 'Berita' ? 'bg-blue-100 text-blue-800' : 
                    post.category === 'Edukasi' ? 'bg-green-100 text-green-800' : 
                    post.category === 'Tips' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.published_date)} • {post.likes || 0} likes • {comments.length} komentar
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
            </div>
            
            <button 
              onClick={() => setExpanded(!expanded)}
              className="ml-2 p-1 rounded-md hover:bg-muted"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {expanded && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/blog/${post.slug}`} target="_blank">
                    <Eye size={16} className="mr-1" />
                    Lihat
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => onDelete(post.id)}>
                  <Trash size={16} className="mr-1" />
                  Hapus
                </Button>
                
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                
                {/* Replace the dropdown with Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Tag size={16} className="mr-1" />
                      Kategori
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1" align="start">
                    <button 
                      onClick={() => onUpdateCategory(post.id, 'Berita')}
                      className="block w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-muted"
                    >
                      Berita
                    </button>
                    <button 
                      onClick={() => onUpdateCategory(post.id, 'Edukasi')}
                      className="block w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-muted"
                    >
                      Edukasi
                    </button>
                    <button 
                      onClick={() => onUpdateCategory(post.id, 'Tips')}
                      className="block w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-muted"
                    >
                      Tips
                    </button>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingCoverImage(!editingCoverImage)}
                >
                  <Image size={16} className="mr-1" />
                  Header URL
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare size={16} className="mr-1" />
                  Komentar ({comments.length})
                </Button>
              </div>
              
              {editingCoverImage && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    value={newCoverImageUrl}
                    onChange={(e) => setNewCoverImageUrl(e.target.value)}
                    placeholder="URL Gambar Sampul Baru"
                  />
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      onUpdateCoverImage(post.id, newCoverImageUrl);
                      setEditingCoverImage(false);
                    }}
                  >
                    Simpan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setNewCoverImageUrl(post.cover_image);
                      setEditingCoverImage(false);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              )}
              
              {showComments && comments.length > 0 && (
                <div className="space-y-3 mt-4 bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium">Daftar Komentar ({comments.length})</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment: any, idx: number) => (
                      <div key={idx} className="bg-card p-2 rounded-md border text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{comment.name}</div>
                            <div className="text-xs text-muted-foreground">{comment.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(comment.date)}
                            </div>
                          </div>
                          <button 
                            className="p-1 hover:bg-muted rounded"
                            onClick={() => onDeleteComment(post.id, idx, comments)}
                          >
                            <Trash size={14} className="text-red-500" />
                          </button>
                        </div>
                        <p className="mt-1 whitespace-pre-line">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {showComments && comments.length === 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Belum ada komentar pada konten ini.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentListItem;
