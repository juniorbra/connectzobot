/*
  # Check database health

  Este script verifica a saúde do banco de dados e identifica possíveis problemas.
  Útil para administradores monitorarem o estado do banco de dados.
*/

-- Verificar a saúde do banco de dados
DO $$
DECLARE
  total_users INTEGER;
  active_subscriptions INTEGER;
  inactive_subscriptions INTEGER;
  users_with_whatsapp INTEGER;
  users_with_prompt INTEGER;
  avg_prompt_length NUMERIC;
  max_prompt_length INTEGER;
  min_prompt_length INTEGER;
  avg_usage NUMERIC;
  max_usage INTEGER;
  oldest_user TIMESTAMP;
  newest_user TIMESTAMP;
  days_since_oldest INTEGER;
  days_since_newest INTEGER;
BEGIN
  -- Contar usuários
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Contar assinaturas ativas e inativas
  SELECT COUNT(*) INTO active_subscriptions FROM profiles WHERE assinatura = true;
  SELECT COUNT(*) INTO inactive_subscriptions FROM profiles WHERE assinatura = false OR assinatura IS NULL;
  
  -- Contar usuários com WhatsApp conectado
  SELECT COUNT(*) INTO users_with_whatsapp FROM profiles WHERE whatsapp IS NOT NULL AND whatsapp != '';
  
  -- Contar usuários com prompt configurado
  SELECT COUNT(*) INTO users_with_prompt FROM profiles WHERE prompt IS NOT NULL AND prompt != '';
  
  -- Calcular estatísticas de prompt
  SELECT 
    AVG(LENGTH(prompt)),
    MAX(LENGTH(prompt)),
    MIN(LENGTH(prompt))
  INTO 
    avg_prompt_length,
    max_prompt_length,
    min_prompt_length
  FROM profiles 
  WHERE prompt IS NOT NULL AND prompt != '';
  
  -- Calcular estatísticas de uso
  SELECT 
    AVG(consumo),
    MAX(consumo)
  INTO 
    avg_usage,
    max_usage
  FROM profiles;
  
  -- Obter data do usuário mais antigo e mais recente
  SELECT 
    MIN(created_at),
    MAX(created_at)
  INTO 
    oldest_user,
    newest_user
  FROM profiles;
  
  -- Calcular dias desde o usuário mais antigo e mais recente
  SELECT 
    EXTRACT(DAY FROM NOW() - oldest_user),
    EXTRACT(DAY FROM NOW() - newest_user)
  INTO 
    days_since_oldest,
    days_since_newest;
  
  -- Exibir relatório de saúde
  RAISE NOTICE '=== RELATÓRIO DE SAÚDE DO BANCO DE DADOS ===';
  RAISE NOTICE 'Data e hora do relatório: %', NOW();
  RAISE NOTICE '';
  
  RAISE NOTICE '--- ESTATÍSTICAS DE USUÁRIOS ---';
  RAISE NOTICE 'Total de usuários: %', total_users;
  RAISE NOTICE 'Assinaturas ativas: % (%.1f%%)', active_subscriptions, 
    CASE WHEN total_users > 0 THEN (active_subscriptions::NUMERIC / total_users) * 100 ELSE 0 END;
  RAISE NOTICE 'Assinaturas inativas: % (%.1f%%)', inactive_subscriptions, 
    CASE WHEN total_users > 0 THEN (inactive_subscriptions::NUMERIC / total_users) * 100 ELSE 0 END;
  RAISE NOTICE 'Usuários com WhatsApp conectado: % (%.1f%%)', users_with_whatsapp, 
    CASE WHEN total_users > 0 THEN (users_with_whatsapp::NUMERIC / total_users) * 100 ELSE 0 END;
  RAISE NOTICE 'Usuários com prompt configurado: % (%.1f%%)', users_with_prompt, 
    CASE WHEN total_users > 0 THEN (users_with_prompt::NUMERIC / total_users) * 100 ELSE 0 END;
  RAISE NOTICE '';
  
  RAISE NOTICE '--- ESTATÍSTICAS DE PROMPT ---';
  RAISE NOTICE 'Tamanho médio do prompt: % caracteres', ROUND(avg_prompt_length);
  RAISE NOTICE 'Maior prompt: % caracteres', max_prompt_length;
  RAISE NOTICE 'Menor prompt: % caracteres', min_prompt_length;
  RAISE NOTICE '';
  
  RAISE NOTICE '--- ESTATÍSTICAS DE USO ---';
  RAISE NOTICE 'Uso médio: % mensagens', ROUND(avg_usage);
  RAISE NOTICE 'Uso máximo: % mensagens', max_usage;
  RAISE NOTICE '';
  
  RAISE NOTICE '--- ESTATÍSTICAS DE TEMPO ---';
  RAISE NOTICE 'Usuário mais antigo: % (há % dias)', oldest_user, days_since_oldest;
  RAISE NOTICE 'Usuário mais recente: % (há % dias)', newest_user, days_since_newest;
  RAISE NOTICE '';
  
  -- Verificar possíveis problemas
  RAISE NOTICE '--- POSSÍVEIS PROBLEMAS ---';
  
  -- Verificar se há usuários sem email
  DECLARE missing_email INTEGER;
  BEGIN
    SELECT COUNT(*) INTO missing_email FROM profiles WHERE email IS NULL OR email = '';
    IF missing_email > 0 THEN
      RAISE NOTICE 'ALERTA: % usuários sem email', missing_email;
    END IF;
  END;
  
  -- Verificar se há usuários com uso acima da franquia
  DECLARE over_quota INTEGER;
  BEGIN
    SELECT COUNT(*) INTO over_quota FROM profiles WHERE consumo > franquia;
    IF over_quota > 0 THEN
      RAISE NOTICE 'ALERTA: % usuários com uso acima da franquia', over_quota;
    END IF;
  END;
  
  -- Verificar se há usuários com assinatura ativa mas sem WhatsApp conectado
  DECLARE active_no_whatsapp INTEGER;
  BEGIN
    SELECT COUNT(*) INTO active_no_whatsapp FROM profiles 
    WHERE assinatura = true AND (whatsapp IS NULL OR whatsapp = '');
    IF active_no_whatsapp > 0 THEN
      RAISE NOTICE 'ALERTA: % usuários com assinatura ativa mas sem WhatsApp conectado', active_no_whatsapp;
    END IF;
  END;
  
  -- Verificar se há usuários com assinatura ativa mas sem prompt configurado
  DECLARE active_no_prompt INTEGER;
  BEGIN
    SELECT COUNT(*) INTO active_no_prompt FROM profiles 
    WHERE assinatura = true AND (prompt IS NULL OR prompt = '');
    IF active_no_prompt > 0 THEN
      RAISE NOTICE 'ALERTA: % usuários com assinatura ativa mas sem prompt configurado', active_no_prompt;
    END IF;
  END;
  
  -- Verificar se não há novos usuários recentemente (últimos 30 dias)
  DECLARE recent_users INTEGER;
  BEGIN
    SELECT COUNT(*) INTO recent_users FROM profiles 
    WHERE created_at > NOW() - INTERVAL '30 days';
    IF recent_users = 0 THEN
      RAISE NOTICE 'ALERTA: Nenhum novo usuário nos últimos 30 dias';
    END IF;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== FIM DO RELATÓRIO ===';
END $$;

-- Listar os 10 usuários mais ativos (maior consumo)
SELECT 
  id, 
  email, 
  nome, 
  consumo, 
  franquia, 
  ROUND((consumo::NUMERIC / franquia::NUMERIC) * 100) AS porcentagem_utilizada,
  created_at
FROM profiles
ORDER BY consumo DESC
LIMIT 10;
