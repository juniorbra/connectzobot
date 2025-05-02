/*
  # Restore profiles table from backup

  Este script restaura a tabela profiles a partir de um backup.
  Útil para recuperar dados após alterações indesejadas ou problemas no banco de dados.
  
  IMPORTANTE: Substitua 'NOME_DA_TABELA_DE_BACKUP' pelo nome da tabela de backup que deseja restaurar.
*/

-- Restaurar a partir de um backup
DO $$
DECLARE
  backup_table_name TEXT := 'profiles_backup_YYYYMMDD_HHMMSS';  -- Substitua pelo nome da tabela de backup (ex: profiles_backup_20250428_195400)
  backup_count INTEGER;
  current_count INTEGER;
BEGIN
  -- Verificar se a tabela de backup existe
  PERFORM 1 FROM information_schema.tables WHERE table_name = backup_table_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tabela de backup % não encontrada', backup_table_name;
  END IF;
  
  -- Contar registros na tabela de backup
  EXECUTE 'SELECT COUNT(*) FROM ' || backup_table_name INTO backup_count;
  
  -- Contar registros na tabela atual
  SELECT COUNT(*) INTO current_count FROM profiles;
  
  -- Exibir informações antes da restauração
  RAISE NOTICE 'Preparando para restaurar a partir do backup: %', backup_table_name;
  RAISE NOTICE 'Registros na tabela de backup: %', backup_count;
  RAISE NOTICE 'Registros na tabela atual: %', current_count;
  
  -- Criar um backup da tabela atual antes de restaurar (por segurança)
  DECLARE
    safety_backup_name TEXT;
  BEGIN
    SELECT 'profiles_pre_restore_' || to_char(now(), 'YYYYMMDD_HH24MISS') INTO safety_backup_name;
    EXECUTE 'CREATE TABLE ' || safety_backup_name || ' AS SELECT * FROM profiles';
    RAISE NOTICE 'Backup de segurança criado: %', safety_backup_name;
  END;
  
  -- Restaurar a partir do backup (substituir todos os registros)
  -- Primeiro, excluir todos os registros da tabela atual
  DELETE FROM profiles;
  
  -- Depois, inserir todos os registros do backup
  EXECUTE 'INSERT INTO profiles SELECT * FROM ' || backup_table_name;
  
  -- Contar registros após a restauração
  SELECT COUNT(*) INTO current_count FROM profiles;
  
  -- Exibir informações após a restauração
  RAISE NOTICE 'Restauração concluída com sucesso!';
  RAISE NOTICE 'Registros na tabela após restauração: %', current_count;
  RAISE NOTICE 'Data e hora da restauração: %', now();
END $$;

-- Listar todas as tabelas de backup existentes para referência
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count,
       pg_size_pretty(pg_total_relation_size(table_name)) AS table_size
FROM (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE 'profiles_backup_%' OR table_name LIKE 'profiles_pre_restore_%'
) t
ORDER BY table_name;
