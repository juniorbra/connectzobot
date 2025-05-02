/*
  # Criação da tabela de perfis

  1. Nova Tabela
    - `profiles`
      - `id` (uuid, chave primária)
      - `nome` (texto)
      - `telefone` (texto)
      - `email` (texto)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilita RLS na tabela `profiles`
    - Adiciona política para usuários autenticados lerem seus próprios dados
    - Adiciona política para usuários autenticados atualizarem seus próprios dados
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  telefone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler próprio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);