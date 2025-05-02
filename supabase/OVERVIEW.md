# Visão Geral do Sistema de Gerenciamento de Banco de Dados Zobot

Este documento fornece uma visão geral do sistema de gerenciamento de banco de dados do Zobot, explicando como os scripts trabalham juntos para configurar, manter e gerenciar o banco de dados.

## Estrutura do Sistema

O sistema de gerenciamento de banco de dados do Zobot é composto por vários scripts SQL organizados em categorias funcionais:

### 1. Scripts de Configuração

- **setup.sql**: Script completo para configurar todo o banco de dados de uma só vez.
- **Migrações** (pasta `migrations`): Scripts incrementais para configurar o banco de dados passo a passo.

### 2. Scripts de Gerenciamento de Usuários

- **create_user.sql**: Cria um novo usuário diretamente no banco de dados.
- **update_profile.sql**: Atualiza informações básicas de perfil (nome, telefone).
- **update_prompt.sql**: Atualiza as instruções do agente de IA.
- **update_whatsapp.sql**: Atualiza o número de WhatsApp conectado.
- **update_subscription.sql**: Atualiza os campos relacionados à assinatura.
- **delete_user.sql**: Remove um usuário do sistema.

### 3. Scripts de Gerenciamento de Uso

- **increment_usage.sql**: Incrementa o contador de mensagens utilizadas.
- **reset_usage.sql**: Reseta o contador de mensagens para um usuário específico.
- **reset_all_usage.sql**: Reseta o contador de mensagens para todos os usuários.
- **update_all_subscriptions.sql**: Atualiza o status de assinatura para todos os usuários.

### 4. Scripts de Backup e Restauração

- **backup_profiles.sql**: Cria uma cópia de backup da tabela profiles.
- **restore_from_backup.sql**: Restaura a tabela profiles a partir de um backup.
- **cleanup_backups.sql**: Remove tabelas de backup antigas.

### 5. Scripts de Monitoramento e Análise

- **list_users.sql**: Lista todos os usuários com informações básicas.
- **find_users.sql**: Encontra usuários que correspondem a critérios específicos.
- **check_health.sql**: Verifica a saúde do banco de dados e gera um relatório.
- **export_to_csv.sql**: Exporta os dados dos usuários para um formato CSV.

### 6. Scripts de Teste

- **test_setup.sql**: Testa a configuração do banco de dados.

## Fluxo de Trabalho Típico

1. **Configuração Inicial**:
   - Execute `setup.sql` para configurar o banco de dados completo, ou
   - Execute as migrações na ordem correta para uma configuração incremental.

2. **Verificação**:
   - Execute `test_setup.sql` para verificar se a configuração foi bem-sucedida.
   - Execute `check_health.sql` para verificar a saúde do banco de dados.

3. **Operações Diárias**:
   - Use `increment_usage.sql` para rastrear o uso de mensagens.
   - Use `list_users.sql` e `find_users.sql` para monitorar os usuários.

4. **Operações Periódicas**:
   - Use `backup_profiles.sql` para criar backups regulares.
   - Use `reset_all_usage.sql` no início de cada ciclo de faturamento.
   - Use `cleanup_backups.sql` para manter o tamanho do banco de dados sob controle.

5. **Operações Ocasionais**:
   - Use `update_all_subscriptions.sql` para ajustar assinaturas em massa.
   - Use `export_to_csv.sql` para análise de dados ou relatórios.

6. **Operações de Emergência**:
   - Use `restore_from_backup.sql` para recuperar dados após problemas.

## Modelo de Dados

O banco de dados do Zobot é centrado na tabela `profiles`, que armazena todas as informações dos usuários:

- **Informações Básicas**: id, nome, telefone, email
- **Configurações do WhatsApp**: whatsapp
- **Configurações do Agente de IA**: prompt
- **Informações de Assinatura**: assinatura, consumo, franquia
- **Metadados**: created_at, updated_at

## Segurança

O sistema utiliza Row Level Security (RLS) do Supabase para garantir que os usuários só possam acessar seus próprios dados:

- Políticas para leitura: Usuários só podem ler seus próprios dados.
- Políticas para atualização: Usuários só podem atualizar seus próprios dados.

## Funções e Gatilhos

O sistema utiliza várias funções e gatilhos para automatizar operações:

- **handle_updated_at**: Atualiza automaticamente o timestamp `updated_at`.
- **handle_new_user**: Cria automaticamente um perfil quando um novo usuário se registra.
- **execute_sql**: Permite executar SQL dinâmico para migrações.
- **get_profile**: Função RPC para obter o perfil do usuário atual.

## Boas Práticas

1. **Sempre faça backup antes de operações importantes**:
   - Muitos scripts já criam backups automaticamente.
   - Use `backup_profiles.sql` antes de operações manuais arriscadas.

2. **Teste em ambiente de desenvolvimento primeiro**:
   - Use `test_setup.sql` para verificar alterações.
   - Evite executar scripts potencialmente destrutivos diretamente em produção.

3. **Monitore regularmente a saúde do banco de dados**:
   - Use `check_health.sql` para identificar problemas potenciais.
   - Use `find_users.sql` para identificar usuários com características específicas.

4. **Mantenha o banco de dados limpo**:
   - Use `cleanup_backups.sql` regularmente para remover backups antigos.
   - Use `delete_user.sql` para remover usuários inativos ou problemáticos.

## Conclusão

Este sistema de gerenciamento de banco de dados fornece todas as ferramentas necessárias para configurar, manter e gerenciar o banco de dados do Zobot de forma eficiente e segura. Seguindo as boas práticas e utilizando os scripts apropriados para cada situação, você pode garantir que o banco de dados funcione corretamente e forneça uma base sólida para o aplicativo Zobot.
