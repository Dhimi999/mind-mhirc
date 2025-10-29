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
  CheckCircle2 // <-- Tambahkan ikon baru
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
import { Badge } from "@/components/ui/badge"; // <-- Import Badge

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
  professional_answer_id: string | null; // <-- Izinkan null
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
    <header className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{forumTitles[activeForum]}</h1>
        <div className="flex items-center gap-2">
          {forumUser && (
            <>
              <Button variant="outline" size="sm" onClick={onProfileClick}>
                @{forumUser.username}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onNotificationClick}
              >
                <Users className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {isLoadingPosts && (
        <div className="w-full h-1 bg-primary/20 rounded overflow-hidden">
          <div className="w-1/3 h-full bg-primary animate-indeterminate-progress"></div>
        </div>
      )}
    </header>
  );
};
const ForumPostSkeletonList = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Textarea
          placeholder="Apa yang Anda pikirkan?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleCreatePost} disabled={!content.trim()}>
          Kirim
        </Button>
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Profil Forum</DialogTitle>
      </DialogHeader>
      <p>Username: @{forumUser?.username}</p>
    </DialogContent>
  </Dialog>
);

const ForumNotifications: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  forumUser: ForumUser | null;
}> = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Notifikasi</DialogTitle>
      </DialogHeader>
      <p className="text-center text-muted-foreground py-8">
        Tidak ada notifikasi baru.
      </p>
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
  const [showOnlyAnswered, setShowOnlyAnswered] = useState(false); // <-- State Baru untuk Filter

  const activeForum: ForumType = "mother";
  const POSTS_PER_PAGE = 10;

  // --- Effects ---
  useEffect(() => {
    if (user) checkForumUser();
    else setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (forumUser) fetchPosts(true);
  }, [forumUser, showOnlyAnswered]); // <-- Tambahkan showOnlyAnswered sebagai dependency

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
      setForumUser({ ...data, subtypes: [], account_type: "general" }); // Asumsi default account_type adalah 'user'
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

      // --- [MODIFIKASI 1] Logika Filter ---
      if (showOnlyAnswered) {
        query = query.not("professional_answer_id", "is", null);
      }

      // --- [MODIFIKASI 2] Logika Urutan ---
      // Urutkan berdasarkan professional_answer_id (yang ada di atas), lalu berdasarkan tanggal
      query = query.order("professional_answer_id", {
        ascending: false,
        nullsFirst: false
      });
      query = query.order("created_at", { ascending: false });

      query = query.range(startRange, endRange);

      const { data, error } = await query;
      // --- Akhir Modifikasi ---

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

      // --- [MODIFIKASI 3] Update Postingan Jika Profesional Menjawab ---
      if (forumUser.account_type === "professional") {
        const { error: updateError } = await supabase
          .from("forum_posts")
          .update({ professional_answer_id: createdComment.id })
          .eq("id", selectedPost.id);

        if (updateError) {
          console.error("Gagal menandai jawaban profesional:", updateError);
        } else {
          // Update state post secara lokal agar badge langsung muncul
          setPosts(
            posts.map((p) =>
              p.id === selectedPost.id
                ? { ...p, professional_answer_id: createdComment.id }
                : p
            )
          );
        }
      }
      // --- Akhir Modifikasi ---

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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ForumHeader
          forumUser={null}
          activeForum={activeForum}
          onProfileClick={() => {}}
          onNotificationClick={() => {}}
          isLoadingPosts={true}
        />
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="h-10 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
        <ForumPostSkeletonList />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <HelmetAny>
        <title>Forum & Konsultasi - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Platform forum dan konsultasi untuk ibu dengan berbagai pilihan dukungan: forum ibu, konsultasi profesional/perawat, layanan kesehatan, dan grup support khusus."
        />
      </HelmetAny>

      <SafeMotherNavbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ForumHeader
          forumUser={forumUser}
          activeForum={activeForum}
          onProfileClick={() => setShowProfile(true)}
          onNotificationClick={() => setShowNotifications(true)}
          isLoadingPosts={isLoadingPosts}
        />

        {/* --- [MODIFIKASI 4] Tambahkan Tombol Filter --- */}
        <div className="mb-4">
          <Button
            variant={showOnlyAnswered ? "default" : "outline"}
            onClick={() => setShowOnlyAnswered(!showOnlyAnswered)}
            className="w-full"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {showOnlyAnswered
              ? "Tampilkan Semua Postingan"
              : "Hanya Tampilkan yang Dijawab Profesional"}
          </Button>
        </div>
        {/* --- Akhir Modifikasi --- */}

        <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
          <DialogContent>
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
              />
              <Button onClick={createForumUser} className="w-full">
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
            {/* ... (komponen Profile & Notifikasi tidak berubah) */}
            <div className="space-y-4 mt-6">
              {isLoadingPosts ? (
                <ForumPostSkeletonList />
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-primary">
                            @{post.forum_users.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPostDate(post.created_at)}
                          </p>
                        </div>
                        {user?.id === post.forum_users.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => deletePost(post.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* --- [MODIFIKASI 5] Badge Jawaban Profesional --- */}
                      {post.professional_answer_id && (
                        <span className="inline-flex items-center mb-3 rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1.5" />
                          Dijawab oleh Profesional
                        </span>
                      )}
                      {/* --- Akhir Modifikasi --- */}

                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id, post.is_liked)}
                          className={post.is_liked ? "text-red-500" : ""}
                        >
                          <Heart
                            className={`h-4 w-4 mr-1 ${
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
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments_count}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            {/* ... Konten Dialog Komentar akan dirender di sini ... */}
                            <DialogHeader>
                              <DialogTitle>Komentar</DialogTitle>
                            </DialogHeader>
                            <div className="border-b pb-4">
                              <p className="font-semibold text-primary mb-1">
                                @{post.forum_users.username}
                              </p>
                              <p className="whitespace-pre-wrap">
                                {post.content}
                              </p>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                              {isLoadingComments ? (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                  Memuat komentar...
                                </p>
                              ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="border-l-2 border-muted pl-4"
                                  >
                                    <div className="flex justify-between items-center">
                                      <p className="font-semibold text-primary text-sm">
                                        @{comment.forum_users.username}
                                        {comment.forum_users.account_type ===
                                          "professional" && (
                                          <span className="ml-2 inline-flex items-center rounded border border-green-600 px-1.5 py-0.5 text-xs font-medium text-green-700">
                                            Profesional
                                          </span>
                                        )}
                                      </p>
                                      {user?.id ===
                                        comment.forum_users.user_id && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            deleteComment(comment.id)
                                          }
                                        >
                                          <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                      )}
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">
                                      {comment.content}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Belum ada komentar.
                                </p>
                              )}
                            </div>
                            <div className="border-t pt-4 space-y-2">
                              <Textarea
                                placeholder="Tulis komentar..."
                                value={newCommentContent}
                                onChange={(e) =>
                                  setNewCommentContent(e.target.value)
                                }
                              />
                              <Button
                                onClick={createComment}
                                size="sm"
                                disabled={!newCommentContent.trim()}
                              >
                                <Send className="h-4 w-4 mr-2" /> Kirim
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {showOnlyAnswered
                        ? "Tidak ada postingan yang dijawab oleh profesional."
                        : "Belum ada postingan di forum ini. Jadilah yang pertama!"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {isLoadingMore && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Memuat...</p>
                </div>
              )}

              {!hasMorePosts && posts.length > 0 && !isLoadingPosts && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    -- Anda telah mencapai akhir --
                  </p>
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
