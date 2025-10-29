-- Update handle_new_user function to include subtypes and parent_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user already exists in profiles before insert
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (
      id, 
      full_name, 
      account_type, 
      birth_date, 
      city, 
      profession,
      forwarding,
      subtypes,
      parent_id
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'account_type',
      CASE 
        WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
        THEN TO_DATE(NEW.raw_user_meta_data->>'birth_date', 'YYYY-MM-DD')
        ELSE NULL
      END,
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'profession',
      NEW.raw_user_meta_data->>'forwarding',
      -- Handle subtypes array from jsonb
      CASE 
        WHEN NEW.raw_user_meta_data->'subtypes' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subtypes'))::text[]
        ELSE NULL
      END,
      -- Handle parent_id, convert to uuid if provided
      CASE 
        WHEN NEW.raw_user_meta_data->>'parent_id' IS NOT NULL 
          AND NEW.raw_user_meta_data->>'parent_id' != ''
        THEN (NEW.raw_user_meta_data->>'parent_id')::uuid
        ELSE NULL
      END
    );
  END IF;

  RETURN NEW;
END;
$function$;