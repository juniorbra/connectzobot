-- Migration: Create initial tables (profiles, workflows, connections)
-- Date: 2025-05-01

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  stop_bot_on_message boolean default false,
  pause_window_minutes int4 default 0,
  split_long_messages boolean default false,
  show_typing_indicator boolean default false,
  typing_delay_per_char_ms int4 default 0,
  concat_messages boolean default false,
  concat_time_seconds int4 default 0
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  instance_name text not null,
  state text,
  wa_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 
-- Function: public.handle_new_user()
--
-- Descrição:
--   Trigger executada após a criação de um novo usuário em auth.users.
--   Cria automaticamente um registro correspondente na tabela public.profiles,
--   preenchendo os campos nome e telefone a partir dos metadados do usuário, se disponíveis.
--
-- Parâmetros:
--   Não recebe parâmetros diretos. Utiliza os dados do registro NEW do trigger.
--
-- Retorno:
--   Retorna o registro NEW para permitir a continuidade do fluxo de autenticação.
--
-- Observações:
--   - O campo email é convertido para minúsculas.
--   - Os campos nome e telefone são extraídos dos metadados (raw_user_meta_data).
--   - Em caso de erro, um aviso é registrado, mas o processo de autenticação não é interrompido.
--   - A função deve ser associada a um trigger AFTER INSERT na tabela auth.users.
--
-- Exemplo de uso:
--   CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

--
-- Trigger: on_auth_user_created
--
-- Descrição:
--   Trigger associada à tabela auth.users, executada após a inserção de um novo usuário.
--   Responsável por acionar a função public.handle_new_user(), que cria automaticamente
--   um registro correspondente na tabela public.profiles com os dados do novo usuário.
--
-- Observações:
--   - Garante que todo novo usuário autenticado tenha um perfil criado automaticamente.
--   - O comando DROP TRIGGER IF EXISTS é utilizado para evitar conflitos em caso de recriação.
--   - A trigger é do tipo AFTER INSERT e executa para cada linha inserida.
--

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
