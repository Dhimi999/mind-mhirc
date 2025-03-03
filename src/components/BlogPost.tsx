
import { Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPostProps {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
}

const BlogPost = ({
  id,
  title,
  excerpt,
  coverImage,
  date,
  author,
  category,
}: BlogPostProps) => {
  return (
    <article className="group">
      <Link to={`/blog/${id}`} className="block">
        <div className="overflow-hidden rounded-xl mb-4 aspect-[16/9]">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {category}
          </span>
          <span className="flex items-center text-xs text-muted-foreground">
            <Calendar size={14} className="mr-1" />
            {date}
          </span>
        </div>
        
        <Link to={`/blog/${id}`}>
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm line-clamp-3">
          {excerpt}
        </p>
        
        <div className="flex items-center space-x-3 pt-2">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium flex items-center">
            <User size={14} className="mr-1" />
            {author.name}
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
