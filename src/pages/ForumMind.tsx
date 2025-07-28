// =======================================================================================
// File: src/pages/forum/ForumMind.tsx
// Deskripsi: Komponen utama yang mengelola state dan logika untuk keseluruhan fitur forum.
// =======================================================================================

import { useState, useEffect, useCallback } from "react";
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
  MoreHorizontal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ForumHeader } from "@/components/forum/ForumHeader";
import { ForumProfile } from "@/components/forum/ForumProfile";
import { ForumNotifications } from "@/components/forum/ForumNotifications";
import { CreatePost } from "@/components/forum/CreatePost";
import { ForumPostSkeletonList } from "@/components/forum/ForumPostSkeleton";
import { formatPostDate } from "@/utils/dateFormat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// --- Definisi Tipe ---
type ForumType = "public" | "parent" | "child";

interface ForumUser {
  id: string;
  username: string;
  user_id: string;
  subtypes?: string[];
}

interface ForumPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  forum_users: ForumUser;
  is_liked: boolean;
}

interface ForumComment {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  forum_users: ForumUser;
  is_liked: boolean;
}

// --- Komponen Utama ---
const ForumMind = () => {
  const { user } = useAuth();
  const { toast } = useToast();

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
  const [activeForum, setActiveForum] = useState<ForumType>("public");

  const POSTS_PER_PAGE = 10;

  // --- Effects ---
  useEffect(() => {
    if (user) {
      checkForumUser();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (forumUser) {
      console.log(
        `%cREFRESH PENUH: Memuat postingan untuk forum '${activeForum}'`,
        "color: orange; font-weight: bold;"
      );
      fetchPosts(true);
    }
  }, [forumUser, activeForum]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight - 150 ||
        isLoadingMore ||
        !hasMorePosts
      ) {
        return;
      }
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

      if (forumUserError && forumUserError.code !== "PGRST116") {
        throw forumUserError;
      }

      if (!forumUserData) {
        setShowUsernameDialog(true);
        setIsLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subtypes")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.warn("Gagal mengambil subtypes profil:", profileError.message);
      }

      setForumUser({ ...forumUserData, subtypes: profileData?.subtypes || [] });
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
      setForumUser({ ...data, subtypes: [] });
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
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*, forum_users(id, username, user_id)")
        .eq("forum_type", activeForum)
        .order("created_at", { ascending: false })
        .range(startRange, endRange);

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
    console.log("REFRESH SEBAGIAN: Memuat postingan selanjutnya...");
    setIsLoadingMore(true);
    await fetchPosts(false);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePosts, page, activeForum]);

  const handlePostCreated = (newPost: ForumPost) => {
    console.log("UPDATE LOKAL: Postingan baru ditambahkan.", newPost);
    const postWithLikeStatus = { ...newPost, is_liked: false };
    setPosts((prevPosts) => [postWithLikeStatus, ...prevPosts]);
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    console.log(`UPDATE LOKAL: Status like diubah untuk post ID: ${postId}`);
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
    console.log(`UPDATE LOKAL: Postingan dihapus untuk post ID: ${postId}`);
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

    console.log("UPDATE LOKAL: Komentar baru ditambahkan.");
    const tempId = `temp-${Date.now()}`;
    const newComment: ForumComment = {
      id: tempId,
      content: newCommentContent.trim(),
      created_at: new Date().toISOString(),
      forum_users: {
        id: forumUser.id,
        username: forumUser.username,
        user_id: forumUser.user_id
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
    console.log(
      `UPDATE LOKAL: Komentar dihapus untuk comment ID: ${commentId}`
    );
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
          onForumChange={setActiveForum}
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <ForumHeader
        forumUser={forumUser}
        activeForum={activeForum}
        onForumChange={setActiveForum}
        onProfileClick={() => setShowProfile(true)}
        onNotificationClick={() => setShowNotifications(true)}
        isLoadingPosts={isLoadingPosts}
      />

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
            user={user}
            forumUser={forumUser}
            onPostCreated={handlePostCreated}
            activeForum={activeForum}
          />
          <ForumProfile
            forumUser={forumUser}
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
          <ForumNotifications
            forumUser={forumUser}
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />

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
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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
                              className="min-h-[80px]"
                            />
                            <Button
                              onClick={createComment}
                              disabled={!newCommentContent.trim()}
                              size="sm"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Kirim
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
                    Belum ada postingan di forum ini.
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
  );
};
export default ForumMind;
