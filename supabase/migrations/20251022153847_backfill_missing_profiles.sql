-- Backfill missing profiles and user_preferences for existing users
-- This migration handles users created before the trigger was set up

-- Insert missing profiles for existing auth users
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Insert missing user_preferences for existing users
INSERT INTO public.user_preferences (user_id, created_at, updated_at)
SELECT 
  au.id,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.user_preferences up ON up.user_id = au.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Log the results
DO $$
DECLARE
  profiles_created INTEGER;
  preferences_created INTEGER;
BEGIN
  -- Count would have been created (this is post-insert so we just log)
  SELECT COUNT(*) INTO profiles_created 
  FROM public.profiles;
  
  SELECT COUNT(*) INTO preferences_created 
  FROM public.user_preferences;
  
  RAISE NOTICE 'Backfill complete!';
  RAISE NOTICE 'Total profiles: %', profiles_created;
  RAISE NOTICE 'Total preferences: %', preferences_created;
END $$;
