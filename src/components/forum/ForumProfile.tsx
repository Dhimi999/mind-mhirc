import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { formatPostDate } from "@/utils/dateFormat";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

interface UserComment {
  id: string;
  content: string;
  created_at: string;
  forum_posts: {
    id: string;
    content: string;
    forum_users: ForumUser;
  };
}

interface ForumProfileProps {
  forumUser: ForumUser;
  isOpen: boolean;
  onClose: () => void;
}

export const ForumProfile = ({ forumUser, isOpen, onClose }: ForumProfileProps) => {
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && forumUser) {
      fetchUserData();
    }
  }, [isOpen, forumUser]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch user posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select(`
          *,
          forum_users(id, username, user_id)
        `)
        .eq("forum_user_id", forumUser.id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setUserPosts(postsData || []);

      // Fetch user comments with post details
      const { data: commentsData, error: commentsError } = await supabase
        .from("forum_comments")
        .select(`
          id,
          content,
          created_at,
          forum_posts(
            id,
            content,
            forum_users(id, username, user_id)
          )
        `)
        .eq("forum_user_id", forumUser.id)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;
      setUserComments(commentsData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setUserPosts(prev => prev.filter(post => post.id !== postId));
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

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("forum_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setUserComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Berhasil",
        description: "Komentar berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus komentar",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Forum - @{forumUser.username}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Mind Saya ({userPosts.length})</TabsTrigger>
            <TabsTrigger value="comments">Komentar Saya ({userComments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <p className="flex-1 whitespace-pre-wrap">{post.content}</p>
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
                            Hapus Postingan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments_count}
                      </span>
                      <span>
                        {formatPostDate(post.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada postingan</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : userComments.length > 0 ? (
              userComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Komentar pada postingan @{comment.forum_posts.forum_users.username}:
                          </p>
                          <p className="text-sm italic">"{comment.forum_posts.content.substring(0, 100)}..."</p>
                        </div>
                        <p className="mb-2 whitespace-pre-wrap">{comment.content}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>
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
                            onClick={() => deleteComment(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus Komentar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada komentar</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};