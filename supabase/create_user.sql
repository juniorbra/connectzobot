/*
  # Create a new user directly in the database

  Este script cria um novo usuário diretamente no banco de dados.
  Útil para administradores criarem usuários sem passar pelo processo de registro.
  
  IMPORTANTE: Substitua os valores conforme necessário.
*/

-- Criar um novo usuário
DO $$
DECLARE
  new_user_id UUID;
  new_user_email TEXT := 'novo.usuario@exemplo.com';  -- Substitua pelo email desejado
  new_user_nome TEXT := 'Novo Usuário';               -- Substitua pelo nome desejado
  new_user_telefone TEXT := '+5511999999999';         -- Substitua pelo telefone desejado
  new_user_whatsapp TEXT := '+5511999999999';         -- Substitua pelo WhatsApp desejado
  new_user_assinatura BOOLEAN := true;                -- true para assinatura ativa, false para inativa
  new_user_consumo INTEGER := 0;                      -- quantidade inicial de mensagens consumidas
  new_user_franquia INTEGER := 1000;                  -- limite de mensagens do plano
  new_user_prompt TEXT := 'Olá! Eu sou o Zobot, seu assistente virtual. Estou aqui para ajudar com suas dúvidas e fornecer informações úteis. Como posso ajudar você hoje?';  -- Prompt inicial do agente
BEGIN
  -- Verificar se o email já está em uso
  IF EXISTS (SELECT 1 FROM profiles WHERE email = new_user_email) THEN
    RAISE EXCEPTION 'Email % já está em uso', new_user_email;
  END IF;
  
  -- Gerar um novo UUID para o usuário
  new_user_id := uuid_generate_v4();
  
  -- Inserir o novo usuário na tabela profiles
  INSERT INTO profiles (
    id,
    email,
    nome,
    telefone,
    whatsapp,
    assinatura,
    consumo,
    franquia,
    prompt,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_email,
    new_user_nome,
    new_user_telefone,
    new_user_whatsapp,
    new_user_assinatura,
    new_user_consumo,
    new_user_franquia,
    new_user_prompt,
    now(),
    now()
  );
  
  -- Exibir informações do usuário criado
  RAISE NOTICE 'Usuário criado com sucesso!';
  RAISE NOTICE 'ID: %', new_user_id;
  RAISE NOTICE 'Email: %', new_user_email;
  RAISE NOTICE 'Nome: %', new_user_nome;
  
  -- IMPORTANTE: Este script cria apenas o registro na tabela profiles.
  -- Para que o usuário possa fazer login, você precisa criar um registro correspondente na tabela auth.users.
  -- Isso geralmente é feito através da API de autenticação do Supabase, não diretamente via SQL.
  RAISE NOTICE 'ATENÇÃO: Este usuário não poderá fazer login até que você crie um registro correspondente na tabela auth.users usando a API de autenticação do Supabase.';
END $$;
