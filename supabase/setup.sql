-- Zobot Database Setup Script

/*
  This script creates all necessary tables and configurations for the Zobot application.
  It includes:
  1. The profiles table for storing user information and AI agent configuration
  2. Row Level Security (RLS) policies
  3. Triggers for automatic profile creation
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  telefone TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT,
  assinatura BOOLEAN DEFAULT false,
  consumo INTEGER DEFAULT 0,
  franquia INTEGER DEFAULT 1000,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_email_key UNIQUE (email)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _nome TEXT;
  _telefone TEXT;
BEGIN
  -- Get metadata values with proper null handling
  _nome := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'nome', '')), '');
  _telefone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'telefone', '')), '');

  -- Insert new profile
  INSERT INTO public.profiles (id, email, nome, telefone)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create helper function to execute SQL (for migrations)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;

-- Create RPC function to get user profile
CREATE OR REPLACE FUNCTION get_profile()
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profiles
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
