/*
  # Reset message usage count for a specific user

  Este script reseta o contador de mensagens utilizadas para um usuário específico.
  Útil para o início de um novo ciclo de faturamento.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja atualizar.
*/

-- Resetar o contador de mensagens utilizadas para um usuário específico
UPDATE profiles
SET consumo = 0  -- Reseta para zero
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar o contador de mensagens após o reset
SELECT id, email, nome, consumo, franquia, 
       ROUND((consumo::numeric / franquia::numeric) * 100) AS porcentagem_utilizada
FROM profiles
WHERE email = 'SEU_EMAIL_AQUI';
