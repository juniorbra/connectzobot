/*
  # Test script for Zobot database setup

  Este script testa a configuração do banco de dados do Zobot.
  Ele cria um usuário de teste, atualiza seus dados e depois remove o usuário.
  
  IMPORTANTE: Este script é apenas para teste e não deve ser executado em produção.
*/

-- Habilitar saída de mensagens
\echo 'Iniciando teste da configuração do banco de dados Zobot...';

-- 1. Inserir um usuário de teste
\echo '1. Inserindo usuário de teste...';

-- Primeiro, vamos criar um UUID para o usuário de teste
DO $$
DECLARE
  test_user_id UUID := uuid_generate_v4();
BEGIN
  -- Inserir o usuário de teste na tabela profiles
  INSERT INTO profiles (
    id, 
    nome, 
    telefone, 
    email, 
    whatsapp, 
    assinatura, 
    consumo, 
    franquia, 
    prompt
  ) VALUES (
    test_user_id,
    'Usuário de Teste',
    '+5511999999999',
    'teste@exemplo.com',
    '+5511888888888',
    true,
    500,
    1000,
    'Olá, eu sou um agente de IA de teste.'
  );
  
  -- Verificar se o usuário foi inserido corretamente
  \echo '2. Verificando se o usuário foi inserido...';
  
  RAISE NOTICE 'Usuário inserido com ID: %', test_user_id;
  
  -- 3. Atualizar os dados do usuário
  \echo '3. Atualizando dados do usuário...';
  
  UPDATE profiles 
  SET 
    nome = 'Usuário de Teste Atualizado',
    consumo = 600
  WHERE id = test_user_id;
  
  -- Verificar se o usuário foi atualizado corretamente
  \echo '4. Verificando se o usuário foi atualizado...';
  
  RAISE NOTICE 'Dados do usuário após atualização:';
  RAISE NOTICE 'Nome: %', (SELECT nome FROM profiles WHERE id = test_user_id);
  RAISE NOTICE 'Consumo: %', (SELECT consumo FROM profiles WHERE id = test_user_id);
  
  -- 4. Remover o usuário de teste
  \echo '5. Removendo usuário de teste...';
  
  DELETE FROM profiles WHERE id = test_user_id;
  
  -- Verificar se o usuário foi removido corretamente
  \echo '6. Verificando se o usuário foi removido...';
  
  IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
    RAISE EXCEPTION 'Erro: Usuário não foi removido corretamente!';
  ELSE
    RAISE NOTICE 'Usuário removido com sucesso!';
  END IF;
END $$;

\echo 'Teste concluído com sucesso!';
