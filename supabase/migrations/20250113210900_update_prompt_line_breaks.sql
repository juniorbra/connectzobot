/*
  # Atualizando o texto do prompt no banco de dados para usar quebras de linha reais

  1. Changes
    - Atualizando o texto do prompt no banco de dados para usar quebras de linha reais
*/

UPDATE profiles 
SET prompt = '## Quem é você Descreva aqui as informações gerais sobre o seu agente, o seu nome (se houver), qual a função dele.

  ## Personalidade Descreva aqui o tom de voz do seu agente (ex. amigável, acolhedora, casual, formal, entusiasmada, etc.)'
WHERE prompt LIKE '%\n\n%' OR prompt LIKE '%<br><br%';
