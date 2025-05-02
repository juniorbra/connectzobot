# Zobot Database Setup

Este diretório contém os scripts SQL necessários para configurar o banco de dados do Zobot no Supabase.

> **Visão Geral do Sistema**: Para uma visão geral completa de como todos os scripts trabalham juntos, consulte o arquivo [OVERVIEW.md](./OVERVIEW.md).

## Configuração Inicial

Existem duas maneiras de configurar o banco de dados:

1. **Usando o script de configuração completo** (`setup.sql`): Este arquivo contém todas as instruções SQL necessárias para criar as tabelas, políticas de segurança, funções e gatilhos necessários para o funcionamento do aplicativo.

2. **Usando migrações incrementais** (pasta `migrations`): Esta pasta contém scripts SQL separados que podem ser executados em sequência para configurar o banco de dados de forma incremental.

### Como executar o script de configuração completo

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até "SQL Editor" no menu lateral
4. Clique em "New Query" (Nova Consulta)
5. Copie e cole o conteúdo do arquivo `setup.sql`
6. Clique em "Run" (Executar)

### Como executar as migrações incrementais

As migrações devem ser executadas na seguinte ordem:

1. `20250428194300_create_profiles_table.sql` - Cria a tabela de perfis básica
2. `20250428194400_add_prompt_to_profiles.sql` - Adiciona o campo de prompt para o agente de IA
3. `20250428194500_add_subscription_fields.sql` - Adiciona campos relacionados à assinatura
4. `20250428194600_add_whatsapp_field.sql` - Adiciona o campo para o número do WhatsApp
5. `20250428194700_add_helper_functions.sql` - Adiciona funções auxiliares

Para executar cada migração:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até "SQL Editor" no menu lateral
4. Clique em "New Query" (Nova Consulta)
5. Copie e cole o conteúdo do arquivo de migração
6. Clique em "Run" (Executar)
7. Repita para cada arquivo de migração na ordem listada acima

## O que o script faz

O script `setup.sql` configura:

1. **Tabela de Perfis (`profiles`)**
   - Armazena informações do usuário (nome, telefone, email)
   - Armazena configurações do WhatsApp (número conectado)
   - Armazena configurações do agente de IA (prompt)
   - Armazena informações de assinatura e uso (assinatura, consumo, franquia)

2. **Políticas de Segurança (RLS)**
   - Configura Row Level Security para garantir que os usuários só possam acessar seus próprios dados
   - Cria políticas para leitura e atualização de perfis

3. **Funções e Gatilhos**
   - Cria função para atualizar o timestamp `updated_at` automaticamente
   - Cria função para criar perfis automaticamente quando novos usuários se registram
   - Cria função auxiliar `execute_sql` para migrações
   - Cria função RPC `get_profile` para obter o perfil do usuário atual

## Configurações Adicionais

Após executar o script, você precisa configurar a autenticação no Supabase:

1. Navegue até "Authentication" > "Providers" no dashboard do Supabase
2. Certifique-se de que o provedor "Email" esteja habilitado
3. Em "Authentication" > "Email Templates", você pode personalizar os templates de email

## Verificação

### Verificação Manual

Para verificar manualmente se a configuração foi bem-sucedida:

1. Navegue até "Table Editor" no dashboard do Supabase
2. Você deve ver a tabela `profiles` listada
3. Crie um usuário de teste através da interface do seu aplicativo
4. Verifique se um registro correspondente foi criado na tabela `profiles`

### Verificação Automatizada

Foi incluído um script de teste (`test_setup.sql`) que verifica automaticamente se a configuração do banco de dados está funcionando corretamente. Este script:

1. Cria um usuário de teste na tabela `profiles`
2. Verifica se o usuário foi inserido corretamente
3. Atualiza os dados do usuário
4. Verifica se os dados foram atualizados corretamente
5. Remove o usuário de teste
6. Verifica se o usuário foi removido corretamente

Para executar o script de teste:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até "SQL Editor" no menu lateral
4. Clique em "New Query" (Nova Consulta)
5. Copie e cole o conteúdo do arquivo `test_setup.sql`
6. Clique em "Run" (Executar)

Se o script for executado sem erros, a configuração do banco de dados está funcionando corretamente.

**Importante**: Este script de teste é apenas para verificação e não deve ser executado em um ambiente de produção com dados reais.

## Scripts Utilitários

Foram incluídos scripts utilitários para ajudar na gestão do banco de dados:

### 1. Atualizar Prompt do Agente (`update_prompt.sql`)

Este script permite atualizar o campo `prompt` (instruções do agente de IA) para um usuário específico.

Para usar:
1. Abra o arquivo `update_prompt.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja atualizar
3. Modifique o texto do prompt conforme necessário
4. Execute o script no SQL Editor do Supabase

### 2. Atualizar Assinatura (`update_subscription.sql`)

Este script permite atualizar os campos relacionados à assinatura (`assinatura`, `consumo`, `franquia`) para um usuário específico.

Para usar:
1. Abra o arquivo `update_subscription.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja atualizar
3. Modifique os valores de assinatura, consumo e franquia conforme necessário
4. Execute o script no SQL Editor do Supabase

### 3. Atualizar WhatsApp (`update_whatsapp.sql`)

Este script permite atualizar o número de WhatsApp conectado para um usuário específico.

Para usar:
1. Abra o arquivo `update_whatsapp.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja atualizar
3. Modifique o número de WhatsApp conforme necessário
4. Execute o script no SQL Editor do Supabase

### 4. Atualizar Perfil (`update_profile.sql`)

Este script permite atualizar as informações básicas de perfil (nome, telefone) para um usuário específico.

Para usar:
1. Abra o arquivo `update_profile.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja atualizar
3. Modifique o nome e telefone conforme necessário
4. Execute o script no SQL Editor do Supabase

### 5. Incrementar Uso de Mensagens (`increment_usage.sql`)

Este script permite incrementar o contador de mensagens utilizadas para um usuário específico, útil para rastrear o uso do serviço.

Para usar:
1. Abra o arquivo `increment_usage.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja atualizar
3. Ajuste o valor de incremento conforme necessário (padrão: +1)
4. Execute o script no SQL Editor do Supabase

### 6. Resetar Uso de Mensagens (`reset_usage.sql`)

Este script permite resetar o contador de mensagens utilizadas para um usuário específico, útil para o início de um novo ciclo de faturamento.

Para usar:
1. Abra o arquivo `reset_usage.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja atualizar
3. Execute o script no SQL Editor do Supabase

### 7. Listar Usuários (`list_users.sql`)

Este script lista todos os usuários no sistema com suas informações principais e fornece estatísticas gerais. Útil para administradores obterem uma visão geral do sistema.

Para usar:
1. Abra o arquivo `list_users.sql`
2. Execute o script no SQL Editor do Supabase
3. Visualize a lista de usuários e as estatísticas gerais

### 8. Remover Usuário (`delete_user.sql`)

Este script remove um usuário do sistema, incluindo todos os seus dados. Esta operação é irreversível.

Para usar:
1. Abra o arquivo `delete_user.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo email do usuário que deseja remover
3. Execute o script no SQL Editor do Supabase
4. Confirme que o usuário foi removido com sucesso

**ATENÇÃO**: Use este script com extrema cautela, pois ele remove permanentemente todos os dados do usuário.

### 9. Criar Usuário (`create_user.sql`)

Este script cria um novo usuário diretamente no banco de dados, sem passar pelo processo de registro normal.

Para usar:
1. Abra o arquivo `create_user.sql`
2. Substitua os valores de email, nome, telefone, etc. conforme necessário
3. Execute o script no SQL Editor do Supabase
4. Confirme que o usuário foi criado com sucesso

**IMPORTANTE**: Este script cria apenas o registro na tabela profiles. Para que o usuário possa fazer login, você precisa criar um registro correspondente na tabela auth.users usando a API de autenticação do Supabase.

### 10. Backup da Tabela Profiles (`backup_profiles.sql`)

Este script cria uma cópia de backup da tabela profiles com um timestamp para facilitar a identificação. Útil para criar backups antes de fazer alterações significativas no banco de dados.

Para usar:
1. Abra o arquivo `backup_profiles.sql`
2. Execute o script no SQL Editor do Supabase
3. Anote o nome da tabela de backup gerada (será exibido nos resultados)

### 11. Restaurar a partir de Backup (`restore_from_backup.sql`)

Este script restaura a tabela profiles a partir de um backup previamente criado. Útil para recuperar dados após alterações indesejadas ou problemas no banco de dados.

Para usar:
1. Abra o arquivo `restore_from_backup.sql`
2. Substitua `'profiles_backup_YYYYMMDD_HHMMSS'` pelo nome da tabela de backup que deseja restaurar
3. Execute o script no SQL Editor do Supabase
4. Confirme que a restauração foi concluída com sucesso

**ATENÇÃO**: Este script cria automaticamente um backup de segurança da tabela atual antes de restaurar, mas ainda assim deve ser usado com cautela.

### 12. Limpar Backups Antigos (`cleanup_backups.sql`)

Este script remove tabelas de backup antigas para liberar espaço. Você pode especificar quantos dias de backups deseja manter.

Para usar:
1. Abra o arquivo `cleanup_backups.sql`
2. Ajuste o valor de `days_to_keep` conforme necessário (padrão: 30 dias)
3. Execute o script no SQL Editor do Supabase
4. Confirme que a limpeza foi concluída com sucesso

**ATENÇÃO**: Esta operação é irreversível e removerá permanentemente as tabelas de backup antigas.

### 13. Verificar Saúde do Banco de Dados (`check_health.sql`)

Este script verifica a saúde do banco de dados e gera um relatório detalhado com estatísticas e possíveis problemas. Útil para administradores monitorarem o estado do sistema.

Para usar:
1. Abra o arquivo `check_health.sql`
2. Execute o script no SQL Editor do Supabase
3. Analise o relatório de saúde gerado e os possíveis alertas
4. Verifique a lista dos 10 usuários mais ativos no final do relatório

### 14. Resetar Uso de Todos os Usuários (`reset_all_usage.sql`)

Este script reseta o contador de mensagens utilizadas para todos os usuários. Útil para o início de um novo ciclo de faturamento global.

Para usar:
1. Abra o arquivo `reset_all_usage.sql`
2. Execute o script no SQL Editor do Supabase
3. Confirme que o reset foi concluído com sucesso
4. Verifique a lista de usuários com assinatura ativa após o reset

**ATENÇÃO**: Esta operação afeta todos os usuários e não pode ser desfeita. O script cria automaticamente um backup antes de executar o reset.

### 15. Atualizar Assinaturas em Massa (`update_all_subscriptions.sql`)

Este script atualiza o status de assinatura para todos os usuários de uma só vez. Útil para ativar ou desativar assinaturas em massa.

Para usar:
1. Abra o arquivo `update_all_subscriptions.sql`
2. Modifique as variáveis `new_status` (true/false) e `new_quota` conforme necessário
3. Execute o script no SQL Editor do Supabase
4. Confirme que a atualização foi concluída com sucesso
5. Verifique a lista de usuários após a atualização

**ATENÇÃO**: Esta operação afeta todos os usuários e deve ser usada com cautela. O script cria automaticamente um backup antes de executar a atualização.

### 16. Exportar Dados para CSV (`export_to_csv.sql`)

Este script exporta os dados dos usuários para um formato CSV que pode ser aberto em programas de planilhas como Excel ou Google Sheets. Útil para análise de dados ou backup em formato legível.

Para usar:
1. Abra o arquivo `export_to_csv.sql`
2. Execute o script no SQL Editor do Supabase
3. Copie o resultado da primeira consulta (formato CSV)
4. Cole em um editor de texto e salve com extensão .csv
5. Abra o arquivo em um programa de planilhas

**NOTA**: O script também gera estatísticas gerais sobre os usuários que não são incluídas no CSV, mas são exibidas nos resultados da consulta.

### 17. Encontrar Usuários por Critérios (`find_users.sql`)

Este script contém várias consultas para encontrar usuários que correspondem a critérios específicos, como uso alto, falta de WhatsApp conectado, prompt não configurado, etc. Útil para administradores identificarem usuários com características específicas.

Para usar:
1. Abra o arquivo `find_users.sql`
2. Descomente a consulta que deseja executar (removendo os marcadores `/*` e `*/`)
3. Ajuste os critérios conforme necessário (valores, intervalos, etc.)
4. Execute o script no SQL Editor do Supabase
5. Analise os resultados

**NOTA**: O script inclui consultas para encontrar usuários com uso alto, sem WhatsApp conectado, sem prompt configurado, usuários recentes, usuários inativos, usuários com prompts muito longos ou curtos, emails duplicados, e muito mais.
