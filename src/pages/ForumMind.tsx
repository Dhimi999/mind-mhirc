import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Trash2, Send, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { ForumHeader } from "@/components/forum/ForumHeader";
import { ForumProfile } from "@/components/forum/ForumProfile";
import { ForumNotifications } from "@/components/forum/ForumNotifications";
import { CreatePost } from "@/components/forum/CreatePost";

interface ForumUser {
  id: string;
  username: string;
  user_id: string;
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

const ForumMind = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [forumUser, setForumUser] = useState<ForumUser | null>(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    if (user) {
      checkForumUser();
    }
  }, [user]);

  useEffect(() => {
    if (forumUser) {
      fetchPosts(true);
    }
  }, [forumUser]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoadingMore || !hasMorePosts) {
        return;
      }
      loadMorePosts();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMorePosts]);

  const checkForumUser = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("forum_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setForumUser(data);
      } else {
        setShowUsernameDialog(true);
      }
    } catch (error) {
      console.error("Error checking forum user:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna forum",
        variant: "destructive",
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
        .insert({
          user_id: user.id,
          username: username.trim(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Username sudah digunakan",
            description: "Silakan pilih username lain",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setForumUser(data);
      setShowUsernameDialog(false);
      setUsername("");
      toast({
        title: "Berhasil",
        description: "Username berhasil dibuat!",
      });
    } catch (error) {
      console.error("Error creating forum user:", error);
      toast({
        title: "Error",
        description: "Gagal membuat username",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async (reset = false) => {
    try {
      const startRange = reset ? 0 : page * POSTS_PER_PAGE;
      const endRange = startRange + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("forum_posts")
        .select(`
          *,
          forum_users(id, username, user_id)
        `)
        .order("created_at", { ascending: false })
        .range(startRange, endRange);

      if (error) throw error;

      // Check which posts are liked by current user
      const postsWithLikes = await Promise.all(
        (data || []).map(async (post) => {
          const { data: likeData } = await supabase
            .from("forum_likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", user?.id)
            .single();

          return {
            ...post,
            is_liked: !!likeData,
          };
        })
      );

      if (reset) {
        setPosts(postsWithLikes);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...postsWithLikes]);
        setPage(prev => prev + 1);
      }

      // Check if there are more posts
      setHasMorePosts(postsWithLikes.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Gagal memuat postingan",
        variant: "destructive",
      });
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    await fetchPosts(false);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePosts, page]);

  const handlePostCreated = () => {
    fetchPosts(true);
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("forum_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("forum_likes").insert({
          user_id: user.id,
          post_id: postId,
        });

        if (error) throw error;
      }

      fetchPosts(true);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Gagal memproses like",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      fetchPosts(true);
      toast({
        title: "Berhasil",
        description: "Postingan berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus postingan",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select(`
          *,
          forum_users(id, username, user_id)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Check which comments are liked by current user
      const commentsWithLikes = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: likeData } = await supabase
            .from("forum_likes")
            .select("id")
            .eq("comment_id", comment.id)
            .eq("user_id", user?.id)
            .single();

          return {
            ...comment,
            is_liked: !!likeData,
          };
        })
      );

      setComments(commentsWithLikes);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Gagal memuat komentar",
        variant: "destructive",
      });
    }
  };

  const createComment = async () => {
    if (!user || !forumUser || !selectedPost || !newCommentContent.trim()) return;

    try {
      const { error } = await supabase.from("forum_comments").insert({
        post_id: selectedPost.id,
        user_id: user.id,
        forum_user_id: forumUser.id,
        content: newCommentContent.trim(),
      });

      if (error) throw error;

      setNewCommentContent("");
      fetchComments(selectedPost.id);
      fetchPosts(true); // Refresh posts to update comment count
      toast({
        title: "Berhasil",
        description: "Komentar berhasil dibuat!",
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error",
        description: "Gagal membuat komentar",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <ForumHeader 
        forumUser={forumUser}
        onProfileClick={() => setShowProfile(true)}
        onNotificationClick={() => setShowNotifications(true)}
      />

      {/* Username Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Username Anonim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Untuk menggunakan Forum Mind, Anda perlu membuat username anonim yang akan digunakan untuk semua aktivitas di forum.
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
            user={user}
            forumUser={forumUser}
            onPostCreated={handlePostCreated}
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

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-primary">
                        @{post.forum_users.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    {user?.id === post.forum_users.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            fetchComments(post.id);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments_count}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Komentar</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Original Post */}
                          <div className="border-b pb-4">
                            <p className="font-semibold text-primary mb-1">
                              @{post.forum_users.username}
                            </p>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {/* Comments */}
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {comments.map((comment) => (
                              <div key={comment.id} className="border-l-2 border-muted pl-4">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-semibold text-primary text-sm">
                                    @{comment.forum_users.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), {
                                      addSuffix: true,
                                      locale: id,
                                    })}
                                  </p>
                                </div>
                                <p className="text-sm whitespace-pre-wrap mb-2">
                                  {comment.content}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`text-xs ${
                                    comment.is_liked ? "text-red-500" : ""
                                  }`}
                                >
                                  <Heart
                                    className={`h-3 w-3 mr-1 ${
                                      comment.is_liked ? "fill-current" : ""
                                    }`}
                                  />
                                  {comment.likes_count}
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Add Comment */}
                          <div className="border-t pt-4 space-y-2">
                            <Textarea
                              placeholder="Tulis komentar..."
                              value={newCommentContent}
                              onChange={(e) => setNewCommentContent(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <Button
                              onClick={createComment}
                              disabled={!newCommentContent.trim()}
                              size="sm"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Kirim Komentar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {isLoadingMore && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Memuat postingan lainnya...</p>
              </div>
            )}

            {posts.length === 0 && !isLoading && (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Belum ada postingan. Jadilah yang pertama untuk berbagi!
                  </p>
                </CardContent>
              </Card>
            )}

            {!hasMorePosts && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Semua postingan telah dimuat</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ForumMind;