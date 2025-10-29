-- Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.bfi_results ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for bfi_results since it seems to be missing them
CREATE POLICY "Users can view their own BFI results" 
ON public.bfi_results 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert their own BFI results" 
ON public.bfi_results 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Update function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_post_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
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
$function$;