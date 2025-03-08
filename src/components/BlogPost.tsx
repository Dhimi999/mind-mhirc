
import { Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/lib/utils";

interface BlogPostProps {
  post: Tables<'blog_posts'>;
}

const BlogPost = ({ post }: BlogPostProps) => {
  return (
    <article className="group">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="overflow-hidden rounded-xl mb-4 aspect-[16/9]">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {post.category}
          </span>
          <span className="flex items-center text-xs text-muted-foreground">
            <Calendar size={14} className="mr-1" />
            {formatDate(post.published_date)}
          </span>
        </div>
        
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center space-x-3 pt-2">
          <img
            src={post.author_avatar}
            alt={post.author_name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium flex items-center">
            <User size={14} className="mr-1" />
            {post.author_name}
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
