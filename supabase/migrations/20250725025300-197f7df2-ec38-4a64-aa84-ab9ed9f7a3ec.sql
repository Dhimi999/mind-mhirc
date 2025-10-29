-- Create forum users table for anonymous usernames
CREATE TABLE public.forum_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_users
ALTER TABLE public.forum_users ENABLE ROW LEVEL SECURITY;

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forum_user_id UUID NOT NULL REFERENCES public.forum_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forum_user_id UUID NOT NULL REFERENCES public.forum_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Create forum likes table (for both posts and comments)
CREATE TABLE public.forum_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT one_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Enable RLS on forum_likes
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for forum_users
CREATE POLICY "Users can create their own forum profile" 
ON public.forum_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all forum users" 
ON public.forum_users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own forum profile" 
ON public.forum_users 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for forum_posts
CREATE POLICY "Authenticated users can create posts" 
ON public.forum_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view posts" 
ON public.forum_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own posts" 
ON public.forum_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.forum_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for forum_comments
CREATE POLICY "Authenticated users can create comments" 
ON public.forum_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" 
ON public.forum_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own comments" 
ON public.forum_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.forum_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for forum_likes
CREATE POLICY "Authenticated users can create likes" 
ON public.forum_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" 
ON public.forum_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own likes" 
ON public.forum_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_forum_users_updated_at
BEFORE UPDATE ON public.forum_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update likes and comments count
CREATE OR REPLACE FUNCTION public.update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'forum_likes' THEN
    IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'forum_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.forum_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.forum_posts 
      SET comments_count = comments_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update stats
CREATE TRIGGER update_post_likes_count
AFTER INSERT OR DELETE ON public.forum_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_stats();

CREATE TRIGGER update_post_comments_count
AFTER INSERT OR DELETE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_stats();