/*
  # Delete a user from the system

  Este script remove um usuário do sistema.
  CUIDADO: Esta operação é irreversível e removerá todos os dados do usuário.
  
  IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email do usuário que deseja remover.
*/

-- Primeiro, verificar se o usuário existe
DO $$
DECLARE
  user_id UUID;
  user_email TEXT := 'SEU_EMAIL_AQUI';  -- Substitua pelo email do usuário que deseja remover
BEGIN
  -- Obter o ID do usuário
  SELECT id INTO user_id FROM profiles WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
  
  -- Exibir informações do usuário antes de remover
  RAISE NOTICE 'Informações do usuário que será removido:';
  RAISE NOTICE 'ID: %', user_id;
  RAISE NOTICE 'Email: %', user_email;
  
  -- Remover o usuário da tabela profiles
  -- Isso também removerá o usuário da tabela auth.users devido à restrição de chave estrangeira ON DELETE CASCADE
  DELETE FROM profiles WHERE id = user_id;
  
  RAISE NOTICE 'Usuário removido com sucesso!';
END $$;
