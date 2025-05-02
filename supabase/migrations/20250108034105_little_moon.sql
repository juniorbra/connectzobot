/*
  # Drop public.users table
  
  This migration removes the public.users table since we'll be using auth.users directly
*/

-- Drop the public.users table and related objects
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;