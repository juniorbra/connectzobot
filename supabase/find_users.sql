/*
  # Find users with specific criteria

  Este script permite encontrar usuários que correspondem a critérios específicos.
  Útil para administradores identificarem usuários com características específicas.
  
  INSTRUÇÕES: Descomente e ajuste as consultas conforme necessário para encontrar
  os usuários que você está procurando.
*/

-- Configurações gerais
\set QUIET on
\set ON_ERROR_STOP on
\timing off

-- Encontrar usuários com uso alto (acima de 80% da franquia)
SELECT 
  id, 
  email, 
  nome, 
  consumo, 
  franquia, 
  ROUND((consumo::NUMERIC / franquia::NUMERIC) * 100) AS porcentagem_utilizada
FROM profiles
WHERE (consumo::NUMERIC / franquia::NUMERIC) > 0.8
ORDER BY porcentagem_utilizada DESC;

-- Encontrar usuários com assinatura ativa mas sem WhatsApp conectado
/*
SELECT 
  id, 
  email, 
  nome, 
  telefone, 
  whatsapp, 
  assinatura
FROM profiles
WHERE 
  assinatura = true AND 
  (whatsapp IS NULL OR whatsapp = '')
ORDER BY email;
*/

-- Encontrar usuários com assinatura ativa mas sem prompt configurado
/*
SELECT 
  id, 
  email, 
  nome, 
  assinatura, 
  CASE WHEN prompt IS NULL OR prompt = '' THEN 'Não' ELSE 'Sim' END AS prompt_configurado
FROM profiles
WHERE 
  assinatura = true AND 
  (prompt IS NULL OR prompt = '')
ORDER BY email;
*/

-- Encontrar usuários recentes (últimos 30 dias)
/*
SELECT 
  id, 
  email, 
  nome, 
  assinatura, 
  created_at
FROM profiles
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
*/

-- Encontrar usuários inativos (sem login recente)
/*
SELECT 
  p.id, 
  p.email, 
  p.nome, 
  p.assinatura, 
  au.last_sign_in_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE 
  au.last_sign_in_at < NOW() - INTERVAL '90 days' OR
  au.last_sign_in_at IS NULL
ORDER BY au.last_sign_in_at NULLS FIRST;
*/

-- Encontrar usuários com prompt muito longo (potencialmente problemático)
/*
SELECT 
  id, 
  email, 
  nome, 
  LENGTH(prompt) AS tamanho_prompt
FROM profiles
WHERE LENGTH(COALESCE(prompt, '')) > 2000
ORDER BY tamanho_prompt DESC;
*/

-- Encontrar usuários com prompt muito curto (potencialmente ineficaz)
/*
SELECT 
  id, 
  email, 
  nome, 
  LENGTH(prompt) AS tamanho_prompt
FROM profiles
WHERE 
  prompt IS NOT NULL AND 
  prompt != '' AND 
  LENGTH(prompt) < 100
ORDER BY tamanho_prompt ASC;
*/

-- Encontrar usuários com emails duplicados (potencial problema)
/*
SELECT 
  LOWER(email) AS email_normalizado, 
  COUNT(*) AS contagem
FROM profiles
GROUP BY LOWER(email)
HAVING COUNT(*) > 1
ORDER BY contagem DESC;
*/

-- Encontrar usuários com números de telefone duplicados (potencial problema)
/*
SELECT 
  telefone, 
  COUNT(*) AS contagem,
  STRING_AGG(email, ', ') AS emails
FROM profiles
WHERE telefone IS NOT NULL AND telefone != ''
GROUP BY telefone
HAVING COUNT(*) > 1
ORDER BY contagem DESC;
*/

-- Encontrar usuários com números de WhatsApp duplicados (potencial problema)
/*
SELECT 
  whatsapp, 
  COUNT(*) AS contagem,
  STRING_AGG(email, ', ') AS emails
FROM profiles
WHERE whatsapp IS NOT NULL AND whatsapp != ''
GROUP BY whatsapp
HAVING COUNT(*) > 1
ORDER BY contagem DESC;
*/

-- Encontrar usuários com maior consumo
/*
SELECT 
  id, 
  email, 
  nome, 
  consumo, 
  franquia, 
  ROUND((consumo::NUMERIC / franquia::NUMERIC) * 100) AS porcentagem_utilizada
FROM profiles
ORDER BY consumo DESC
LIMIT 20;
*/

-- Encontrar usuários com maior franquia
/*
SELECT 
  id, 
  email, 
  nome, 
  consumo, 
  franquia, 
  ROUND((consumo::NUMERIC / franquia::NUMERIC) * 100) AS porcentagem_utilizada
FROM profiles
ORDER BY franquia DESC
LIMIT 20;
*/

-- Encontrar usuários por domínio de email
/*
SELECT 
  SPLIT_PART(LOWER(email), '@', 2) AS dominio,
  COUNT(*) AS contagem
FROM profiles
GROUP BY dominio
ORDER BY contagem DESC;
*/

-- Encontrar usuários por parte do nome ou email (pesquisa)
/*
SELECT 
  id, 
  email, 
  nome, 
  telefone, 
  whatsapp, 
  assinatura
FROM profiles
WHERE 
  LOWER(email) LIKE LOWER('%gmail%') OR
  LOWER(nome) LIKE LOWER('%silva%')
ORDER BY email;
*/

/*
  INSTRUÇÕES DE USO:
  
  1. Remova os comentários /* */ da consulta que deseja executar
  2. Ajuste os critérios conforme necessário (valores, intervalos, etc.)
  3. Execute o script no SQL Editor do Supabase
  4. Analise os resultados
  
  Você pode combinar diferentes critérios em uma única consulta para
  encontrar usuários que atendam a múltiplas condições.
*/
