// =======================================================================================
// File: src/components/forum/CreatePost.tsx
// Deskripsi: Komponen untuk membuat postingan baru, sekarang menyertakan forum_type.
// =======================================================================================

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Send, Edit3 } from "lucide-react";

type ForumType = "public" | "parent" | "child";

interface ForumUser {
  id: string;
  username: string;
  user_id: string;
}

interface CreatePostProps {
  user: any;
  forumUser: ForumUser;
  onPostCreated: (newPost: any) => void;
  activeForum: ForumType;
}

export const CreatePost = ({
  user,
  forumUser,
  onPostCreated,
  activeForum
}: CreatePostProps) => {
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const createPost = async () => {
    if (!user || !forumUser || !newPostContent.trim()) return;
    setIsCreating(true);
    try {
      const { data: newPost, error } = await supabase
        .from("forum_posts")
        .insert({
          user_id: user.id,
          forum_user_id: forumUser.id,
          content: newPostContent.trim(),
          forum_type: activeForum
        })
        .select("*, forum_users(*)")
        .single();

      if (error) throw error;

      setNewPostContent("");
      setIsExpanded(false);
      onPostCreated(newPost);
      toast({ title: "Berhasil", description: "Postingan berhasil dibuat!" });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Gagal membuat postingan.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[120px] z-10 border-primary/20">
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="w-full justify-between text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(true)}
          >
            <span>Bagikan Pikiran Anda...</span>
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[120px] z-10 border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Buat Postingan Baru</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setNewPostContent("");
            }}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Apa yang ingin Anda bagikan hari ini?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="min-h-[100px]"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsExpanded(false);
              setNewPostContent("");
            }}
          >
            Batal
          </Button>
          <Button
            onClick={createPost}
            disabled={!newPostContent.trim() || isCreating}
          >
            <Send className="h-4 w-4 mr-2" />
            {isCreating ? "Memposting..." : "Posting"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
