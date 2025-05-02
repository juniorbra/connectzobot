/*
  # Create agent profiles table

  1. New Tables
    - `agent_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `nome` (text)
      - `mensagem` (text)
      - `voz` (text)
      - `descricao` (text)
      - `assinatura` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `agent_profiles` table
    - Add policies for authenticated users to read and update their own data
*/

CREATE TABLE IF NOT EXISTS agent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  mensagem text,
  voz text,
  descricao text,
  assinatura boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agent profile"
  ON agent_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own agent profile"
  ON agent_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent profile"
  ON agent_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);