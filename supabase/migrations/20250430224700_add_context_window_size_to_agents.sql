-- Adiciona o campo de tamanho da janela de contexto na tabela agents

ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS context_window_size integer NOT NULL DEFAULT 5;
