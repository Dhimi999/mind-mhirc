
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Json } from "@/integrations/supabase/types";

interface BlogPost {
  id: string;
  title: string;
  published_date: string;
  likes?: number | null;
  comments?: Json | null;
  category?: string;
}

interface ContentPerformanceTableProps {
  blogPosts: BlogPost[];
}

export const ContentPerformanceTable = ({ blogPosts }: ContentPerformanceTableProps) => {
  // Helper function to safely get comment count
  const getCommentCount = (comments: Json | null): number => {
    if (!comments) return 0;
    
    if (Array.isArray(comments)) {
      return comments.length;
    }
    
    if (typeof comments === 'string') {
      try {
        const parsedComments = JSON.parse(comments);
        return Array.isArray(parsedComments) ? parsedComments.length : 0;
      } catch {
        return 0;
      }
    }
    
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Performa Konten Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground pb-2 border-b">
            <div>Judul</div>
            <div>Tanggal</div>
            <div className="text-center">Likes</div>
            <div className="text-center">Komentar</div>
          </div>
          {blogPosts.slice(0, 8).map((post) => (
            <div key={post.id} className="grid grid-cols-4 text-sm items-center">
              <div className="font-medium truncate" title={post.title}>
                {post.title}
              </div>
              <div className="text-muted-foreground">
                {format(new Date(post.published_date), "d MMM yyyy", { locale: id })}
              </div>
              <div className="text-center flex justify-center items-center">
                <Heart size={14} className="mr-1 text-red-500" />
                {post.likes || 0}
              </div>
              <div className="text-center flex justify-center items-center">
                <MessageSquare size={14} className="mr-1 text-blue-500" />
                {getCommentCount(post.comments)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
