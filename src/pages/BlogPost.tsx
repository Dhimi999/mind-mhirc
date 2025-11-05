import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, MessageSquare, Heart, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
type BlogPost = Tables<'blog_posts'>;
type Comment = {
  name: string;
  email: string;
  content: string;
  date: string;
};
const BlogPostPage = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.from('blog_posts').select('*').eq('slug', id).single();
        if (error) {
          throw error;
        }
        if (data) {
          setPost(data);
          setLikeCount(data.likes || 0);
          if (data.comments && Array.isArray(data.comments)) {
            setComments(data.comments as Comment[]);
          } else {
            setComments([]);
          }
        } else {
          setError('Artikel tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchPostData();
    }
  }, [id]);
  const handleLike = async () => {
    if (!post) return;
    try {
      setLikeLoading(true);
      const newLikeCount = likeCount + 1;
      const {
        error
      } = await supabase.from('blog_posts').update({
        likes: newLikeCount
      }).eq('id', post.id);
      if (error) {
        throw error;
      }
      setLikeCount(newLikeCount);
      toast.success('Terima kasih atas dukungan Anda!');
    } catch (err) {
      console.error('Error updating likes:', err);
      toast.error('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setLikeLoading(false);
    }
  };
  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!post || !commentName || !commentEmail || !commentContent) {
      toast.error('Mohon lengkapi semua kolom komentar');
      return;
    }
    try {
      setCommentLoading(true);
      const newComment: Comment = {
        name: commentName,
        email: commentEmail,
        content: commentContent,
        date: new Date().toISOString()
      };
      const updatedComments = [...comments, newComment];
      const {
        error
      } = await supabase.from('blog_posts').update({
        comments: updatedComments
      }).eq('id', post.id);
      if (error) {
        throw error;
      }
      setComments(updatedComments);
      setCommentName("");
      setCommentEmail("");
      setCommentContent("");
      toast.success('Komentar berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Gagal menambahkan komentar. Silakan coba lagi.');
    } finally {
      setCommentLoading(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
  <main className="flex-1 pt-navbar">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-12"></div>
                <div className="h-64 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
  <main className="flex-1 pt-navbar">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p className="text-muted-foreground mb-8">{error}</p>
              <Link to="/blog">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Blog
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  if (!post) return null;
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
  <main className="flex-1 pt-navbar">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-sm text-primary mb-8 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Blog
            </Link>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {post.category}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(post.published_date)}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <User size={14} className="mr-1" />
                  {post.author_name}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
              
              <div className="flex items-center space-x-3 pt-2">
                <img src={post.author_avatar} alt={post.author_name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-sm">{post.author_name}</p>
                  <p className="text-xs text-muted-foreground">{post.read_time || "5 menit"} waktu baca</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9]">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
            
            <article className="prose prose-lg max-w-none blog-content">
              <div dangerouslySetInnerHTML={{
              __html: post.content
            }} />
              
              {post.references_cit && Array.isArray(post.references_cit) && (
                <div className="mt-12 pt-6 border-t break-words">
                  <h2 className="text-xl font-semibold mb-4">Referensi</h2>
                  <ul className="list-disc list-outside pl-1 space-y-2 text-justify">
                  {post.references_cit.map((ref: string, idx: number) => (
                    <li className="pr-4" key={idx}>{ref}</li>
                  ))}
                  </ul>
                </div>
              )}
            </article>
            
            <div className="border-t border-border mt-12 pt-8">
              <div className="flex items-center justify-between mb-8 text-rose-700">
                <button className={`flex items-center text-sm ${likeLoading ? 'opacity-70' : 'hover:text-primary'}`} onClick={handleLike} disabled={likeLoading}>
                  <Heart className={`mr-1.5 h-5 w-5 ${likeLoading && 'animate-pulse'}`} />
                  Suka ({likeCount})
                </button>
                
                <div className="flex space-x-2">
                  {post.tags && post.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-muted text-xs font-medium rounded-full">
                      #{tag}
                    </span>)}
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Komentar ({comments.length})
                </h3>
                
                {comments.length > 0 ? <div className="space-y-6 mb-8">
                    {comments.map((comment, index) => <div key={index} className="border border-border rounded-lg p-4 bg-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{comment.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.date)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-line">{comment.content}</p>
                      </div>)}
                  </div> : <p className="text-muted-foreground text-sm mb-6">
                    Belum ada komentar. Jadilah yang pertama berkomentar!
                  </p>}
                
                <form onSubmit={handleSubmitComment} className="border border-border rounded-lg p-5">
                  <h4 className="font-semibold mb-4">Tambahkan Komentar</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nama
                      </label>
                      <input id="name" type="text" value={commentName} onChange={e => setCommentName(e.target.value)} className="w-full p-2 border border-input rounded-md" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input id="email" type="email" value={commentEmail} onChange={e => setCommentEmail(e.target.value)} className="w-full p-2 border border-input rounded-md" required />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium mb-1">
                      Komentar
                    </label>
                    <Textarea id="comment" value={commentContent} onChange={e => setCommentContent(e.target.value)} className="w-full min-h-24" placeholder="Tulis komentar Anda di sini..." required />
                  </div>
                  
                  <button type="submit" className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70" disabled={commentLoading}>
                    {commentLoading ? <>
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Mengirim...
                      </> : <>
                        <Send className="mr-1.5 h-4 w-4" />
                        Kirim Komentar
                      </>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style>
        {`
        .blog-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }
        
        .blog-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }
        
        .blog-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
        }
        
        .blog-content blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 4px solid #e5e7eb;
          color: #6b7280;
        }
        
        .blog-content ul {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .blog-content ol {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
          overflow-wrap: break-word;
        }
        
        .blog-content p {
          text-align: justify;
          line-height: 1.625;
          overflow-wrap: break-word;
        }
        
        .blog-content img {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
          margin-left: auto;
          margin-right: auto;
        }
        `}
      </style>
      
      <Footer />
    </div>;
};
export default BlogPostPage;
