/*
  # Export user data to CSV

  Este script exporta os dados dos usuários para um formato CSV.
  Útil para análise de dados ou backup em formato legível.
  
  NOTA: Este script gera o conteúdo CSV que você pode copiar e colar em um arquivo.
  O Supabase SQL Editor não suporta exportação direta para arquivos, mas você pode
  copiar o resultado e salvá-lo como um arquivo .csv.
*/

-- Exportar dados dos usuários para CSV
WITH user_data AS (
  SELECT 
    id,
    email,
    nome,
    telefone,
    whatsapp,
    CASE 
      WHEN assinatura = true THEN 'Ativa'
      WHEN assinatura = false THEN 'Inativa'
      ELSE 'Inativa'
    END AS assinatura,
    consumo,
    franquia,
    CASE 
      WHEN prompt IS NULL OR prompt = '' THEN 'Não'
      ELSE 'Sim'
    END AS prompt_configurado,
    LENGTH(COALESCE(prompt, '')) AS tamanho_prompt,
    to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS data_criacao,
    to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS data_atualizacao
  FROM profiles
  ORDER BY created_at DESC
)
SELECT 
  -- Cabeçalho CSV
  'ID,Email,Nome,Telefone,WhatsApp,Assinatura,Consumo,Franquia,Prompt Configurado,Tamanho do Prompt,Data de Criação,Data de Atualização'
UNION ALL
-- Dados em formato CSV
SELECT 
  id || ',' || 
  '"' || REPLACE(email, '"', '""') || '"' || ',' || 
  '"' || REPLACE(COALESCE(nome, ''), '"', '""') || '"' || ',' || 
  '"' || REPLACE(COALESCE(telefone, ''), '"', '""') || '"' || ',' || 
  '"' || REPLACE(COALESCE(whatsapp, ''), '"', '""') || '"' || ',' || 
  assinatura || ',' || 
  consumo || ',' || 
  franquia || ',' || 
  prompt_configurado || ',' || 
  tamanho_prompt || ',' || 
  '"' || data_criacao || '"' || ',' || 
  '"' || data_atualizacao || '"'
FROM user_data;

-- Estatísticas gerais (não incluídas no CSV)
SELECT
  COUNT(*) AS total_usuarios,
  COUNT(CASE WHEN assinatura = true THEN 1 END) AS usuarios_com_assinatura_ativa,
  COUNT(CASE WHEN assinatura = false OR assinatura IS NULL THEN 1 END) AS usuarios_sem_assinatura,
  COUNT(CASE WHEN whatsapp IS NOT NULL AND whatsapp != '' THEN 1 END) AS usuarios_com_whatsapp_conectado,
  COUNT(CASE WHEN prompt IS NOT NULL AND prompt != '' THEN 1 END) AS usuarios_com_prompt_configurado,
  ROUND(AVG(consumo)) AS media_consumo,
  MAX(consumo) AS maior_consumo,
  MIN(created_at) AS usuario_mais_antigo,
  MAX(created_at) AS usuario_mais_recente
FROM profiles;

/*
  INSTRUÇÕES:
  
  1. Execute este script no SQL Editor do Supabase
  2. Copie o resultado da primeira consulta (formato CSV)
  3. Cole em um editor de texto
  4. Salve o arquivo com extensão .csv
  5. Abra o arquivo em um programa de planilhas como Excel ou Google Sheets
  
  NOTA: Se você estiver usando o SQL Editor do Supabase, pode ser necessário
  ajustar a visualização para "Text" em vez de "Table" para copiar o resultado
  corretamente.
*/
