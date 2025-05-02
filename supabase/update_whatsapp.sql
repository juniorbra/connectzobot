/*
  # Update WhatsApp number for a specific user

  Este script atualiza o número de WhatsApp para um usuário específico.
  Substitua os valores conforme necessário.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja atualizar.
*/

-- Atualizar o número de WhatsApp para um usuário específico
UPDATE profiles
SET whatsapp = '+5511999999999'  -- Substitua pelo número de WhatsApp desejado
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, nome, telefone, whatsapp
FROM profiles
WHERE email = 'SEU_EMAIL_AQUI';
