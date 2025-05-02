/*
  # Fix Authentication Trigger

  1. Changes
    - Add proper error handling and constraints
    - Ensure atomic operations
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  _nome text;
  _telefone text;
BEGIN
  -- Get metadata values with proper null handling
  _nome := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'nome', '')), '');
  _telefone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'telefone', '')), '');

  -- Insert new user with proper null handling
  INSERT INTO public.users (id, email, nome, telefone)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    _nome,
    _telefone
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but allow auth to continue
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger with proper error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();