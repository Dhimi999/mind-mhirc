
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users } from "lucide-react";
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

interface Profile {
  id: string;
  created_at?: string;
  full_name?: string | null;
}

interface RecentActivityListProps {
  blogPosts: BlogPost[];
  users: Profile[];
}

export const RecentActivityList = ({ blogPosts, users }: RecentActivityListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blogPosts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <FileText size={14} />
              </div>
              <div>
                <p className="text-sm font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.published_date), "d MMMM yyyy, HH:mm", { locale: id })}
                </p>
              </div>
            </div>
          ))}
          
          {users.slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <Users size={14} />
              </div>
              <div>
                <p className="text-sm font-medium">Pengguna baru: {user.full_name || "Pengguna"}</p>
                <p className="text-xs text-muted-foreground">
                  {user.created_at ? format(new Date(user.created_at), "d MMMM yyyy, HH:mm", { locale: id }) : "Tanggal tidak tersedia"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
