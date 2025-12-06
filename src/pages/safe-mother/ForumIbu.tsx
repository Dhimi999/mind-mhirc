// =======================================================================================
// File: src/pages/safe-mother/ForumIbu.tsx
// Deskripsi: Komponen forum yang dikhususkan untuk forum Ibu (forum_type: "mother")
// dengan fitur penandaan dan filter jawaban profesional.
// =======================================================================================
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  Users,
  MoreHorizontal,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";

// --- Definisi Tipe ---
type ForumType = "public" | "parent" | "child" | "mother";

interface ForumUser {
  id: string;
  username: string;
  user_id: string;
  subtypes?: string[];
  account_type?: string;
}

interface ForumPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  forum_users: ForumUser;
  is_liked: boolean;
  professional_answer_id: string | null;
}

interface ForumComment {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  forum_users: ForumUser;
  is_liked: boolean;
}

// --- Komponen & Utilitas Placeholder ---
const formatPostDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: id
    });
  } catch (error) {
    return dateString;
  }
};

// --- Komponen Header ---
interface ForumHeaderProps {
  forumUser: ForumUser | null;
  activeForum: ForumType;
  onProfileClick: () => void;
  onNotificationClick: () => void;
  isLoadingPosts: boolean;
}

const ForumHeader: React.FC<ForumHeaderProps> = ({
  forumUser,
  activeForum,
  onProfileClick,
  onNotificationClick,
  isLoadingPosts
}) => {
  const navigate = useNavigate();
  const forumTitles: Record<ForumType, string> = {
    public: "Forum Publik",
    parent: "Forum Orang Tua",
    child: "Forum Anak",
    mother: "Forum Khusus Ibu"
  };

  return (
    <header className="mb-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="bg-white/50 hover:bg-white rounded-full shadow-sm backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
        
        <div className="flex items-center gap-3">
          {forumUser && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onProfileClick}
                className="rounded-full bg-white/50 border-pink-100 hover:bg-pink-50 text-pink-700"
              >
                @{forumUser.username}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onNotificationClick}
                className="rounded-full bg-white/50 border-pink-100 hover:bg-pink-50 text-pink-700"
              >
                <Users className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-pink-100/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-pink-200 animate-fade-in">
          <MessageSquare className="w-4 h-4 text-pink-600" />
          <span className="text-pink-700 font-medium text-sm">Ruang Berbagi Ibu</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 animate-fade-in-up">
          {forumTitles[activeForum]}
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Tempat aman untuk berbagi cerita, pengalaman, dan mendapatkan dukungan dari sesama ibu dan profesional.
        </p>
      </div>

      {isLoadingPosts && (
        <div className="w-full h-1 bg-pink-100 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-pink-500 animate-indeterminate-progress rounded-full"></div>
        </div>
      )}
    </header>
  );
};

const ForumPostSkeletonList = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="border-none shadow-sm bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const CreatePost: React.FC<{
  onPostCreated: (post: ForumPost) => void;
  activeForum: ForumType;
  forumUser: ForumUser | null;
}> = ({ onPostCreated, activeForum, forumUser }) => {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!content.trim() || !forumUser) return;
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          content: content.trim(),
          forum_type: activeForum,
          user_id: forumUser.user_id,
          forum_user_id: forumUser.id
        })
        .select("*, forum_users(*)")
        .single();
      if (error) throw error;
      toast({ title: "Postingan berhasil dibuat!" });
      onPostCreated({ ...data, is_liked: false });
      setContent("");
    } catch (error) {
      toast({ title: "Gagal membuat postingan", variant: "destructive" });
    }
  };

  return (
    <Card className="mb-8 border-none shadow-lg shadow-pink-100/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden transform transition-all hover:scale-[1.01]">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
            {forumUser?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder={`Apa yang sedang Anda pikirkan, Bunda ${forumUser?.username}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-4 min-h-[100px] border-gray-200 focus:border-pink-300 focus:ring-pink-200 bg-gray-50/50 rounded-2xl resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleCreatePost} 
                disabled={!content.trim()}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md shadow-pink-200"
              >
                <Send className="w-4 h-4 mr-2" />
                Kirim Postingan
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ForumProfile: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  forumUser: ForumUser | null;
}> = ({ isOpen, onClose, forumUser }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="rounded-3xl">
      <DialogHeader>
        <DialogTitle>Profil Forum</DialogTitle>
      </DialogHeader>
      <div className="p-4 bg-gray-50 rounded-2xl">
        <p className="text-gray-600">Username: <span className="font-bold text-gray-900">@{forumUser?.username}</span></p>
      </div>
    </DialogContent>
  </Dialog>
);

const ForumNotifications: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  forumUser: ForumUser | null;
}> = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="rounded-3xl">
      <DialogHeader>
        <DialogTitle>Notifikasi</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">Tidak ada notifikasi baru saat ini.</p>
      </div>
    </DialogContent>
  </Dialog>
);

// --- Komponen Utama ---
const ForumIbu = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Helmet typing workaround
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HelmetAny = Helmet as unknown as React.FC<any>;

  // --- State Management ---
  const [forumUser, setForumUser] = useState<ForumUser | null>(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showOnlyAnswered, setShowOnlyAnswered] = useState(false);

  const activeForum: ForumType = "mother";
  const POSTS_PER_PAGE = 10;

  // --- Effects ---
  useEffect(() => {
    if (user) checkForumUser();
    else setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (forumUser) fetchPosts(true);
  }, [forumUser, showOnlyAnswered]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight - 150 ||
        isLoadingMore ||
        !hasMorePosts
      )
        return;
      loadMorePosts();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMorePosts]);

  // --- Pengambilan Data & Manajemen User ---
  const checkForumUser = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: forumUserData, error: forumUserError } = await supabase
        .from("forum_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (forumUserError && forumUserError.code !== "PGRST116")
        throw forumUserError;

      if (!forumUserData) {
        setShowUsernameDialog(true);
        setIsLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("subtypes, account_type")
        .eq("id", user.id)
        .single();

      setForumUser({
        ...forumUserData,
        subtypes: profileData?.subtypes || [],
        account_type: profileData?.account_type || undefined
      });
    } catch (error) {
      console.error("Error saat memeriksa user forum:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna forum.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createForumUser = async () => {
    if (!user || !username.trim()) return;
    try {
      const { data, error } = await supabase
        .from("forum_users")
        .insert({ user_id: user.id, username: username.trim() })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Username sudah digunakan",
            description: "Silakan pilih username lain.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }
      setForumUser({ ...data, subtypes: [], account_type: "general" });
      setShowUsernameDialog(false);
      setUsername("");
    } catch (error) {
      console.error("Error membuat user forum:", error);
      toast({
        title: "Error",
        description: "Gagal membuat username.",
        variant: "destructive"
      });
    }
  };

  const fetchPosts = async (reset = false) => {
    if (!forumUser) return;
    if (reset) setIsLoadingPosts(true);
    const currentPage = reset ? 0 : page;
    if (reset) {
      setPosts([]);
      setHasMorePosts(true);
      setPage(0);
    }
    const startRange = currentPage * POSTS_PER_PAGE;
    const endRange = startRange + POSTS_PER_PAGE - 1;

    try {
      let query = supabase
        .from("forum_posts")
        .select("*, forum_users(id, username, user_id)")
        .eq("forum_type", activeForum);

      if (showOnlyAnswered) {
        query = query.not("professional_answer_id", "is", null);
      }

      query = query.order("professional_answer_id", {
        ascending: false,
        nullsFirst: false
      });
      query = query.order("created_at", { ascending: false });

      query = query.range(startRange, endRange);

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return;

      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          const { data: likeData } = await supabase
            .from("forum_likes")
            .select("id", { count: "exact" })
            .eq("post_id", post.id)
            .eq("user_id", user?.id);
          return { ...post, is_liked: (likeData?.length ?? 0) > 0 };
        })
      );
      setPosts((prev) =>
        reset ? postsWithLikes : [...prev, ...postsWithLikes]
      );
      setPage(currentPage + 1);
      setHasMorePosts(postsWithLikes.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error mengambil postingan:", error);
    } finally {
      if (reset) setIsLoadingPosts(false);
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;
    setIsLoadingMore(true);
    await fetchPosts(false);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePosts, page, activeForum, showOnlyAnswered]);

  const handlePostCreated = (newPost: ForumPost) => {
    const postWithLikeStatus = { ...newPost, is_liked: false };
    setPosts((prevPosts) => [postWithLikeStatus, ...prevPosts]);
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      )
    );

    try {
      if (isLiked) {
        await supabase
          .from("forum_likes")
          .delete()
          .match({ post_id: postId, user_id: user.id });
      } else {
        await supabase
          .from("forum_likes")
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: isLiked,
                likes_count: isLiked
                  ? post.likes_count + 1
                  : post.likes_count - 1
              }
            : post
        )
      );
    }
  };

  const deletePost = async (postId: string) => {
    const originalPosts = posts;
    setPosts(originalPosts.filter((p) => p.id !== postId));

    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Postingan berhasil dihapus." });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus postingan.",
        variant: "destructive"
      });
      setPosts(originalPosts);
    }
  };

  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*, forum_users(*)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data) {
        setComments([]);
        return;
      }

      const commentsWithLikes = await Promise.all(
        data.map(async (comment) => {
          const { data: likeData } = await supabase
            .from("forum_likes")
            .select("id", { count: "exact" })
            .eq("comment_id", comment.id)
            .eq("user_id", user?.id);
          return { ...comment, is_liked: (likeData?.length ?? 0) > 0 };
        })
      );

      setComments(commentsWithLikes);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const createComment = async () => {
    if (!user || !forumUser || !selectedPost || !newCommentContent.trim())
      return;
    const tempId = `temp-${Date.now()}`;
    const newComment: ForumComment = {
      id: tempId,
      content: newCommentContent.trim(),
      created_at: new Date().toISOString(),
      forum_users: {
        id: forumUser.id,
        username: forumUser.username,
        user_id: forumUser.user_id,
        account_type: forumUser.account_type
      },
      is_liked: false,
      likes_count: 0
    };

    setComments((prev) => [...prev, newComment]);
    setPosts(
      posts.map((p) =>
        p.id === selectedPost.id
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      )
    );
    setNewCommentContent("");

    try {
      const { data: createdComment, error } = await supabase
        .from("forum_comments")
        .insert({
          post_id: selectedPost.id,
          user_id: user.id,
          forum_user_id: forumUser.id,
          content: newComment.content
        })
        .select("*, forum_users(*)")
        .single();
      if (error) throw error;

      if (forumUser.account_type === "professional") {
        const { error: updateError } = await supabase
          .from("forum_posts")
          .update({ professional_answer_id: createdComment.id })
          .eq("id", selectedPost.id);

        if (updateError) {
          console.error("Gagal menandai jawaban profesional:", updateError);
        } else {
          setPosts(
            posts.map((p) =>
              p.id === selectedPost.id
                ? { ...p, professional_answer_id: createdComment.id }
                : p
            )
          );
        }
      }

      setComments((prev) =>
        prev.map((c) =>
          c.id === tempId ? { ...createdComment, is_liked: false } : c
        )
      );
    } catch (error) {
      console.error("Error creating comment:", error);
      setComments(comments.filter((c) => c.id !== tempId));
      setPosts(
        posts.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments_count: p.comments_count - 1 }
            : p
        )
      );
    }
  };

  const deleteComment = async (commentId: string) => {
    const originalComments = comments;
    setComments(originalComments.filter((c) => c.id !== commentId));
    if (selectedPost) {
      setPosts(
        posts.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments_count: p.comments_count - 1 }
            : p
        )
      );
    }

    try {
      const { error } = await supabase
        .from("forum_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting comment:", error);
      setComments(originalComments);
      if (selectedPost) {
        setPosts(
          posts.map((p) =>
            p.id === selectedPost.id
              ? { ...p, comments_count: p.comments_count + 1 }
              : p
          )
        );
      }
    }
  };

  // --- Render ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
        <SafeMotherNavbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <ForumHeader
            forumUser={null}
            activeForum={activeForum}
            onProfileClick={() => {}}
            onNotificationClick={() => {}}
            isLoadingPosts={true}
          />
          <div className="mb-6">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardContent className="pt-6">
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
          <ForumPostSkeletonList />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 font-sans selection:bg-pink-100 selection:text-pink-900">
      <HelmetAny>
        <title>Forum & Konsultasi - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Platform forum dan konsultasi untuk ibu dengan berbagai pilihan dukungan: forum ibu, konsultasi profesional/perawat, layanan kesehatan, dan grup support khusus."
        />
      </HelmetAny>

      <SafeMotherNavbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        <ForumHeader
          forumUser={forumUser}
          activeForum={activeForum}
          onProfileClick={() => setShowProfile(true)}
          onNotificationClick={() => setShowNotifications(true)}
          isLoadingPosts={isLoadingPosts}
        />

        <div className="mb-6">
          <Button
            variant={showOnlyAnswered ? "default" : "outline"}
            onClick={() => setShowOnlyAnswered(!showOnlyAnswered)}
            className={`w-full rounded-xl h-12 transition-all ${
              showOnlyAnswered 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 border-none" 
                : "bg-white/50 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
            }`}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {showOnlyAnswered
              ? "Tampilkan Semua Postingan"
              : "Hanya Tampilkan yang Dijawab Profesional"}
          </Button>
        </div>

        <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Buat Username Anonim</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Anda perlu membuat username anonim untuk beraktivitas di forum.
              </p>
              <Input
                placeholder="Masukkan username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createForumUser()}
                className="rounded-xl"
              />
              <Button onClick={createForumUser} className="w-full rounded-xl bg-pink-600 hover:bg-pink-700">
                Buat Username
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {forumUser && (
          <>
            <CreatePost
              key={activeForum}
              forumUser={forumUser}
              onPostCreated={handlePostCreated}
              activeForum={activeForum}
            />
            
            <ForumProfile 
              isOpen={showProfile} 
              onClose={() => setShowProfile(false)} 
              forumUser={forumUser} 
            />
            
            <ForumNotifications 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
              forumUser={forumUser} 
            />

            <div className="space-y-6 mt-8">
              {isLoadingPosts ? (
                <ForumPostSkeletonList />
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden group">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {post.forum_users.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              @{post.forum_users.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatPostDate(post.created_at)}
                            </p>
                          </div>
                        </div>
                        {user?.id === post.forum_users.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem
                                onClick={() => deletePost(post.id)}
                                className="text-destructive focus:text-destructive rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {post.professional_answer_id && (
                        <div className="inline-flex items-center mb-4 rounded-xl px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Dijawab oleh Profesional
                        </div>
                      )}

                      <p className="mb-6 whitespace-pre-wrap text-gray-700 leading-relaxed text-[15px]">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id, post.is_liked)}
                          className={`rounded-full px-4 hover:bg-pink-50 ${post.is_liked ? "text-pink-500" : "text-gray-500 hover:text-pink-500"}`}
                        >
                          <Heart
                            className={`h-4 w-4 mr-2 ${
                              post.is_liked ? "fill-current" : ""
                            }`}
                          />
                          {post.likes_count}
                        </Button>
                        <Dialog
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedPost(post);
                              fetchComments(post.id);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-full px-4 hover:bg-blue-50 text-gray-500 hover:text-blue-500">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {post.comments_count}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col rounded-3xl p-0 overflow-hidden">
                            <div className="p-6 border-b bg-gray-50/50">
                              <DialogHeader>
                                <DialogTitle>Komentar</DialogTitle>
                              </DialogHeader>
                            </div>
                            
                            <div className="p-6 border-b bg-white">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                  {post.forum_users.username.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-bold text-gray-900 text-sm">
                                  @{post.forum_users.username}
                                </p>
                              </div>
                              <p className="whitespace-pre-wrap text-gray-700 text-sm pl-11">
                                {post.content}
                              </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                              {isLoadingComments ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                                </div>
                              ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className={`flex gap-3 ${comment.forum_users.account_type === "professional" ? "bg-green-50/50 p-4 rounded-2xl border border-green-100" : ""}`}
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      comment.forum_users.account_type === "professional" 
                                        ? "bg-green-100 text-green-700" 
                                        : "bg-gray-200 text-gray-600"
                                    }`}>
                                      {comment.forum_users.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-bold text-gray-900 text-sm">
                                            @{comment.forum_users.username}
                                          </p>
                                          {comment.forum_users.account_type === "professional" && (
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 py-0 h-5">
                                              Profesional
                                            </Badge>
                                          )}
                                          <span className="text-[10px] text-gray-400">
                                            {formatPostDate(comment.created_at)}
                                          </span>
                                        </div>
                                        {user?.id === comment.forum_users.user_id && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                                            onClick={() => deleteComment(comment.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                      <p className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-12">
                                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                  <p className="text-sm text-gray-500">
                                    Belum ada komentar. Jadilah yang pertama!
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 bg-white border-t">
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Tulis komentar..."
                                  value={newCommentContent}
                                  onChange={(e) => setNewCommentContent(e.target.value)}
                                  className="min-h-[44px] max-h-[120px] rounded-xl bg-gray-50 border-gray-200 focus:ring-pink-200 focus:border-pink-300 resize-none"
                                />
                                <Button
                                  onClick={createComment}
                                  size="icon"
                                  disabled={!newCommentContent.trim()}
                                  className="h-11 w-11 rounded-xl bg-pink-600 hover:bg-pink-700 shrink-0"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm rounded-3xl">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada postingan</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      {showOnlyAnswered
                        ? "Tidak ada postingan yang dijawab oleh profesional."
                        : "Jadilah yang pertama membagikan cerita atau pertanyaan di forum ini!"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {isLoadingMore && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                </div>
              )}

              {!hasMorePosts && posts.length > 0 && !isLoadingPosts && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Anda telah mencapai akhir
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForumIbu;