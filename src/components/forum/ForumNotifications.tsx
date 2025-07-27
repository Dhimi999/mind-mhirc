import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
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

interface NotificationItem {
  id: string;
  type: 'like' | 'comment';
  created_at: string;
  content?: string; // For comments
  post_content: string;
  actor_username: string;
  others_count?: number; // For multiple likes
}

interface ForumNotificationsProps {
  forumUser: ForumUser;
  isOpen: boolean;
  onClose: () => void;
}

export const ForumNotifications = ({ forumUser, isOpen, onClose }: ForumNotificationsProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && forumUser) {
      fetchNotifications();
    }
  }, [isOpen, forumUser]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch like notifications
      const { data: likeNotifications, error: likeError } = await supabase
        .from("forum_likes")
        .select(`
          id,
          created_at,
          forum_posts(
            id,
            content,
            forum_user_id
          ),
          user_id
        `)
        .not("user_id", "eq", forumUser.user_id)
        .eq("forum_posts.forum_user_id", forumUser.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (likeError) throw likeError;

      // Fetch comment notifications
      const { data: commentNotifications, error: commentError } = await supabase
        .from("forum_comments")
        .select(`
          id,
          content,
          created_at,
          forum_users(username),
          forum_posts(
            id,
            content,
            forum_user_id
          )
        `)
        .not("user_id", "eq", forumUser.user_id)
        .eq("forum_posts.forum_user_id", forumUser.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (commentError) throw commentError;

      // Process notifications
      const processedNotifications: NotificationItem[] = [];

      // Group likes by post and get usernames
      const likesByPost = new Map<string, any[]>();
      for (const like of likeNotifications || []) {
        const postId = like.forum_posts?.id;
        if (!postId) continue;
        
        if (!likesByPost.has(postId)) {
          likesByPost.set(postId, []);
        }
        likesByPost.get(postId)?.push(like);
      }

      // Create like notifications
      for (const [postId, likes] of likesByPost.entries()) {
        if (likes.length === 0) continue;
        
        const firstLike = likes[0];
        const { data: userData } = await supabase
          .from("forum_users")
          .select("username")
          .eq("user_id", firstLike.user_id)
          .single();

        processedNotifications.push({
          id: `like-${postId}`,
          type: 'like',
          created_at: firstLike.created_at,
          post_content: firstLike.forum_posts.content,
          actor_username: userData?.username || 'Unknown',
          others_count: likes.length - 1
        });
      }

      // Create comment notifications
      for (const comment of commentNotifications || []) {
        if (comment.forum_posts && comment.forum_users) {
          processedNotifications.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            created_at: comment.created_at,
            content: comment.content,
            post_content: comment.forum_posts.content,
            actor_username: comment.forum_users.username
          });
        }
      }

      // Sort by created_at
      processedNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(processedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Gagal memuat notifikasi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {notification.type === 'like' ? (
                        <Heart className="h-4 w-4 text-red-500" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {notification.type === 'like' ? (
                          <>
                            Mind Anda{" "}
                            <span className="italic text-muted-foreground">
                              "{notification.post_content.substring(0, 50)}..."
                            </span>{" "}
                            disukai <strong>@{notification.actor_username}</strong>
                            {notification.others_count && notification.others_count > 0 && (
                              <span> dan {notification.others_count} lain</span>
                            )}
                          </>
                        ) : (
                          <>
                            <strong>@{notification.actor_username}</strong> berkomentar{" "}
                            <span className="italic text-muted-foreground">
                              "{notification.content?.substring(0, 50)}..."
                            </span>{" "}
                            pada mind Anda{" "}
                            <span className="italic text-muted-foreground">
                              "{notification.post_content.substring(0, 30)}..."
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada notifikasi</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};