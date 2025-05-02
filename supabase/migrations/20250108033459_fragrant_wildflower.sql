/*
  # Fix User Registration Schema

  1. Changes
    - Add proper triggers for user creation
    - Ensure profile creation on user signup
*/

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, telefone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'telefone');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();