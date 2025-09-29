-- Enable RLS on remaining tables that need it
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Update remaining functions with proper search path
CREATE OR REPLACE FUNCTION public.increment_messages_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  UPDATE public.ai_conversations
  SET messages_count = messages_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  UPDATE public.chat_rooms
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_broadcast_recipients()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  -- If broadcast is for all users
  IF 'all' = ANY(NEW.recipients) THEN
    FOR user_record IN SELECT id FROM auth.users
    LOOP
      INSERT INTO public.broadcast_recipients (broadcast_id, user_id)
      VALUES (NEW.id, user_record.id);
    END LOOP;
    
  -- If broadcast is for general users only
  ELSIF 'users' = ANY(NEW.recipients) THEN
    FOR user_record IN 
      SELECT id FROM auth.users 
      JOIN public.profiles ON auth.users.id = profiles.id
      WHERE profiles.account_type = 'general'
    LOOP
      INSERT INTO public.broadcast_recipients (broadcast_id, user_id)
      VALUES (NEW.id, user_record.id);
    END LOOP;
    
  -- If broadcast is for professional users only
  ELSIF 'professionals' = ANY(NEW.recipients) THEN
    FOR user_record IN 
      SELECT id FROM auth.users 
      JOIN public.profiles ON auth.users.id = profiles.id
      WHERE profiles.account_type = 'professional'
    LOOP
      INSERT INTO public.broadcast_recipients (broadcast_id, user_id)
      VALUES (NEW.id, user_record.id);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;