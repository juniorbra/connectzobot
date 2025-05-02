/*
  # Update profile information for a specific user

  Este script atualiza as informações de perfil para um usuário específico.
  Substitua os valores conforme necessário.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja atualizar.
*/

-- Atualizar as informações de perfil para um usuário específico
UPDATE profiles
SET 
  nome = 'Novo Nome',           -- Substitua pelo nome desejado
  telefone = '+5511988888888'   -- Substitua pelo telefone desejado
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, nome, telefone
FROM profiles
WHERE email = 'SEU_EMAIL_AQUI';
