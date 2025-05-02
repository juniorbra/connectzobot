/*
  # Update subscription status for all users

  Este script atualiza o status de assinatura para todos os usuários.
  Útil para ativar ou desativar assinaturas em massa.
  
  IMPORTANTE: Esta operação afeta todos os usuários e deve ser usada com cautela.
*/

-- Criar um backup antes de atualizar (por segurança)
DO $$
DECLARE
  backup_table_name TEXT;
BEGIN
  -- Gerar nome da tabela de backup com timestamp
  SELECT 'profiles_pre_subscription_update_' || to_char(now(), 'YYYYMMDD_HH24MISS') INTO backup_table_name;
  
  -- Criar tabela de backup
  EXECUTE 'CREATE TABLE ' || backup_table_name || ' AS SELECT * FROM profiles';
  
  -- Contar registros na tabela de backup
  DECLARE backup_count INTEGER;
  BEGIN
    EXECUTE 'SELECT COUNT(*) FROM ' || backup_table_name INTO backup_count;
    RAISE NOTICE 'Backup criado com sucesso: % (% registros)', backup_table_name, backup_count;
  END;
END $$;

-- Atualizar o status de assinatura para todos os usuários
DO $$
DECLARE
  new_status BOOLEAN := true;  -- Defina como true para ativar ou false para desativar todas as assinaturas
  new_quota INTEGER := 1000;   -- Defina a nova franquia de mensagens (opcional)
  
  total_users INTEGER;
  previous_active INTEGER;
  previous_inactive INTEGER;
BEGIN
  -- Obter estatísticas antes da atualização
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO previous_active FROM profiles WHERE assinatura = true;
  SELECT COUNT(*) INTO previous_inactive FROM profiles WHERE assinatura = false OR assinatura IS NULL;
  
  -- Exibir estatísticas antes da atualização
  RAISE NOTICE 'Estatísticas antes da atualização:';
  RAISE NOTICE 'Total de usuários: %', total_users;
  RAISE NOTICE 'Usuários com assinatura ativa: %', previous_active;
  RAISE NOTICE 'Usuários com assinatura inativa: %', previous_inactive;
  
  -- Atualizar o status de assinatura para todos os usuários
  IF new_quota IS NOT NULL THEN
    -- Atualizar status e franquia
    UPDATE profiles 
    SET 
      assinatura = new_status,
      franquia = new_quota;
    
    RAISE NOTICE 'Atualizando status de assinatura para % e franquia para % mensagens para todos os usuários...', 
      CASE WHEN new_status THEN 'ATIVO' ELSE 'INATIVO' END,
      new_quota;
  ELSE
    -- Atualizar apenas o status
    UPDATE profiles 
    SET assinatura = new_status;
    
    RAISE NOTICE 'Atualizando status de assinatura para % para todos os usuários...', 
      CASE WHEN new_status THEN 'ATIVO' ELSE 'INATIVO' END;
  END IF;
  
  -- Verificar se a atualização foi bem-sucedida
  DECLARE 
    current_active INTEGER;
    current_inactive INTEGER;
  BEGIN
    SELECT COUNT(*) INTO current_active FROM profiles WHERE assinatura = true;
    SELECT COUNT(*) INTO current_inactive FROM profiles WHERE assinatura = false OR assinatura IS NULL;
    
    RAISE NOTICE 'Estatísticas após a atualização:';
    RAISE NOTICE 'Usuários com assinatura ativa: % (alteração: %)', 
      current_active, 
      current_active - previous_active;
    RAISE NOTICE 'Usuários com assinatura inativa: % (alteração: %)', 
      current_inactive, 
      current_inactive - previous_inactive;
    
    IF (new_status = true AND current_active = total_users) OR 
       (new_status = false AND current_inactive = total_users) THEN
      RAISE NOTICE 'Atualização concluída com sucesso!';
    ELSE
      RAISE WARNING 'Algo deu errado. Verifique se todos os status foram atualizados corretamente.';
    END IF;
  END;
END $$;

-- Listar usuários após a atualização
SELECT 
  id, 
  email, 
  nome, 
  assinatura, 
  franquia
FROM profiles
ORDER BY email;
