
import { TabsContent } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import ContentListItem from "./ContentListItem";

type BlogPost = Tables<'blog_posts'>;

interface ContentCategoryTabProps {
  value: string;
  title: string;
  posts: BlogPost[];
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onUpdateCoverImage: (id: string, url: string) => void;
  onDeleteComment: (id: string, commentIndex: number, comments: any[]) => void;
  onEdit: (slug: string) => void;
}

const ContentCategoryTab = ({
  value,
  title,
  posts,
  onDelete,
  onUpdateCategory,
  onUpdateCoverImage,
  onDeleteComment,
  onEdit
}: ContentCategoryTabProps) => {
  return (
    <TabsContent value={value}>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{title} ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">Belum ada konten {value !== "all" ? `dalam kategori ${value}` : "blog"}.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <ContentListItem 
                  key={post.id} 
                  post={post} 
                  onDelete={onDelete}
                  onUpdateCategory={onUpdateCategory}
                  onUpdateCoverImage={onUpdateCoverImage}
                  onDeleteComment={onDeleteComment}
                  onEdit={() => onEdit(post.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default ContentCategoryTab;
