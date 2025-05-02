/*
  # Update prompt for a specific user

  Este script atualiza o campo 'prompt' para um usuário específico.
  Substitua os valores conforme necessário.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja atualizar.
*/

-- Atualizar o prompt para um usuário específico
UPDATE profiles
SET prompt = 'Olá! Eu sou o Zobot, seu assistente virtual. Estou aqui para ajudar com suas dúvidas e fornecer informações úteis. Como posso ajudar você hoje?'
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, nome, prompt
FROM profiles
WHERE email = 'SEU_EMAIL_AQUI';
