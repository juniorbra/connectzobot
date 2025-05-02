/*
  # Backup profiles table

  Este script cria uma cópia de backup da tabela profiles.
  Útil para criar backups antes de fazer alterações significativas no banco de dados.
  
  O backup é criado com um timestamp para facilitar a identificação.
*/

-- Criar tabela de backup com timestamp atual
DO $$
DECLARE
  backup_table_name TEXT;
  current_timestamp TEXT;
BEGIN
  -- Gerar nome da tabela de backup com timestamp
  SELECT to_char(now(), 'YYYYMMDD_HH24MISS') INTO current_timestamp;
  backup_table_name := 'profiles_backup_' || current_timestamp;
  
  -- Criar tabela de backup
  EXECUTE 'CREATE TABLE ' || backup_table_name || ' AS SELECT * FROM profiles';
  
  -- Contar registros na tabela de backup
  EXECUTE 'SELECT COUNT(*) FROM ' || backup_table_name INTO current_timestamp;
  
  -- Exibir informações do backup
  RAISE NOTICE 'Backup criado com sucesso!';
  RAISE NOTICE 'Nome da tabela de backup: %', backup_table_name;
  RAISE NOTICE 'Número de registros copiados: %', current_timestamp;
  RAISE NOTICE 'Data e hora do backup: %', now();
  
  -- Listar todas as tabelas de backup existentes
  RAISE NOTICE 'Tabelas de backup existentes:';
  FOR backup_table_name IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE 'profiles_backup_%' 
    ORDER BY table_name
  LOOP
    RAISE NOTICE '%', backup_table_name;
  END LOOP;
END $$;
