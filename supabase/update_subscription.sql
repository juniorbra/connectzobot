/*
  # Update subscription fields for a specific user

  Este script atualiza os campos de assinatura para um usuário específico.
  Substitua os valores conforme necessário.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja atualizar.
*/

-- Atualizar os campos de assinatura para um usuário específico
UPDATE profiles
SET 
  assinatura = true,  -- true para assinatura ativa, false para inativa
  consumo = 0,        -- quantidade de mensagens consumidas
  franquia = 2000     -- limite de mensagens do plano
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, nome, assinatura, consumo, franquia
FROM profiles
WHERE email = 'SEU_EMAIL_AQUI';
