/*
  # Reset usage count for all users

  Este script reseta o contador de mensagens utilizadas para todos os usuários.
  Útil para o início de um novo ciclo de faturamento global.
  
  IMPORTANTE: Esta operação afeta todos os usuários e não pode ser desfeita.
*/

-- Criar um backup antes de resetar (por segurança)
DO $$
DECLARE
  backup_table_name TEXT;
BEGIN
  -- Gerar nome da tabela de backup com timestamp
  SELECT 'profiles_pre_reset_' || to_char(now(), 'YYYYMMDD_HH24MISS') INTO backup_table_name;
  
  -- Criar tabela de backup
  EXECUTE 'CREATE TABLE ' || backup_table_name || ' AS SELECT * FROM profiles';
  
  -- Contar registros na tabela de backup
  DECLARE backup_count INTEGER;
  BEGIN
    EXECUTE 'SELECT COUNT(*) FROM ' || backup_table_name INTO backup_count;
    RAISE NOTICE 'Backup criado com sucesso: % (% registros)', backup_table_name, backup_count;
  END;
END $$;

-- Resetar o contador de mensagens para todos os usuários
DO $$
DECLARE
  total_users INTEGER;
  active_users INTEGER;
  total_messages INTEGER;
BEGIN
  -- Obter estatísticas antes do reset
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO active_users FROM profiles WHERE assinatura = true;
  SELECT SUM(consumo) INTO total_messages FROM profiles;
  
  -- Exibir estatísticas antes do reset
  RAISE NOTICE 'Estatísticas antes do reset:';
  RAISE NOTICE 'Total de usuários: %', total_users;
  RAISE NOTICE 'Usuários com assinatura ativa: %', active_users;
  RAISE NOTICE 'Total de mensagens consumidas: %', total_messages;
  
  -- Resetar o contador de mensagens para todos os usuários
  UPDATE profiles SET consumo = 0;
  
  -- Verificar se o reset foi bem-sucedido
  DECLARE reset_check INTEGER;
  BEGIN
    SELECT SUM(consumo) INTO reset_check FROM profiles;
    IF reset_check = 0 THEN
      RAISE NOTICE 'Reset concluído com sucesso! Todos os contadores de mensagens foram zerados.';
    ELSE
      RAISE WARNING 'Algo deu errado. Verifique se todos os contadores foram zerados.';
    END IF;
  END;
END $$;

-- Listar usuários com assinatura ativa após o reset
SELECT 
  id, 
  email, 
  nome, 
  assinatura, 
  consumo, 
  franquia
FROM profiles
WHERE assinatura = true
ORDER BY email;
