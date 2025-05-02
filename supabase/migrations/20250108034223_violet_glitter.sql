-- Add prompt column to profiles table
ALTER TABLE profiles
ADD COLUMN prompt text;

-- Update RLS policies to include prompt
CREATE POLICY "Usuários podem ler próprio prompt"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio prompt"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
