/*
  # Increment message usage count for a specific user

  Este script incrementa o contador de mensagens utilizadas para um usuário específico.
  Substitua os valores conforme necessário.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja atualizar.
*/

-- Incrementar o contador de mensagens utilizadas para um usuário específico
UPDATE profiles
SET consumo = consumo + 1  -- Incrementa em 1, ajuste conforme necessário
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar o contador de mensagens após a atualização
SELECT id, email, nome, consumo, franquia, 
       ROUND((consumo::numeric / franquia::numeric) * 100) AS porcentagem_utilizada
FROM profiles
WHERE email = 'SEU_EMAIL_AQUI';
