/*
  # Clean up old backup tables

  Este script remove tabelas de backup antigas para liberar espaço.
  Você pode especificar quantos dias de backups deseja manter.
  
  IMPORTANTE: Esta operação é irreversível e removerá permanentemente as tabelas de backup antigas.
*/

-- Remover tabelas de backup antigas
DO $$
DECLARE
  backup_table RECORD;
  days_to_keep INTEGER := 30;  -- Número de dias de backups para manter (ajuste conforme necessário)
  cutoff_date DATE := CURRENT_DATE - days_to_keep;
  backup_date DATE;
  deleted_count INTEGER := 0;
  kept_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Iniciando limpeza de backups antigos...';
  RAISE NOTICE 'Mantendo backups dos últimos % dias (anteriores a %)', days_to_keep, cutoff_date;
  
  -- Listar todas as tabelas de backup
  FOR backup_table IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE 'profiles_backup_%' OR table_name LIKE 'profiles_pre_restore_%'
    ORDER BY table_name
  LOOP
    -- Extrair a data do nome da tabela (formato: profiles_backup_YYYYMMDD_HHMMSS)
    BEGIN
      IF backup_table.table_name LIKE 'profiles_backup_%' THEN
        backup_date := TO_DATE(SUBSTRING(backup_table.table_name FROM 17 FOR 8), 'YYYYMMDD');
      ELSE -- profiles_pre_restore_
        backup_date := TO_DATE(SUBSTRING(backup_table.table_name FROM 21 FOR 8), 'YYYYMMDD');
      END IF;
      
      -- Verificar se o backup é mais antigo que o limite
      IF backup_date < cutoff_date THEN
        -- Remover a tabela de backup antiga
        EXECUTE 'DROP TABLE ' || backup_table.table_name;
        RAISE NOTICE 'Removida tabela de backup antiga: % (data: %)', backup_table.table_name, backup_date;
        deleted_count := deleted_count + 1;
      ELSE
        RAISE NOTICE 'Mantida tabela de backup recente: % (data: %)', backup_table.table_name, backup_date;
        kept_count := kept_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Se houver erro ao extrair a data, manter a tabela
      RAISE NOTICE 'Erro ao processar tabela %, mantendo-a: %', backup_table.table_name, SQLERRM;
      kept_count := kept_count + 1;
    END;
  END LOOP;
  
  -- Exibir resumo
  RAISE NOTICE 'Limpeza concluída!';
  RAISE NOTICE 'Tabelas de backup removidas: %', deleted_count;
  RAISE NOTICE 'Tabelas de backup mantidas: %', kept_count;
END $$;

-- Listar tabelas de backup restantes
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count,
       pg_size_pretty(pg_total_relation_size(table_name)) AS table_size
FROM (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE 'profiles_backup_%' OR table_name LIKE 'profiles_pre_restore_%'
) t
ORDER BY table_name;
