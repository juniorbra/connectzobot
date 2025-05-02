/*
  # List all users in the system

  Este script lista todos os usuários no sistema com suas informações principais.
  Útil para administradores obterem uma visão geral de todos os usuários.
*/

-- Listar todos os usuários com informações básicas
SELECT 
  id,
  email,
  nome,
  telefone,
  whatsapp,
  assinatura,
  consumo,
  franquia,
  ROUND((consumo::numeric / franquia::numeric) * 100) AS porcentagem_utilizada,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC;

-- Estatísticas gerais
SELECT
  COUNT(*) AS total_usuarios,
  COUNT(CASE WHEN assinatura = true THEN 1 END) AS usuarios_com_assinatura_ativa,
  COUNT(CASE WHEN assinatura = false OR assinatura IS NULL THEN 1 END) AS usuarios_sem_assinatura,
  COUNT(CASE WHEN whatsapp IS NOT NULL AND whatsapp != '' THEN 1 END) AS usuarios_com_whatsapp_conectado,
  COUNT(CASE WHEN prompt IS NOT NULL AND prompt != '' THEN 1 END) AS usuarios_com_prompt_configurado,
  AVG(consumo) AS media_consumo,
  MAX(consumo) AS maior_consumo
FROM profiles;
