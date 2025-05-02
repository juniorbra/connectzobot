-- Adiciona campos de configurações adicionais para o bot na tabela agents

ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS stop_bot_on_message boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS pause_window_minutes integer NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS split_long_messages boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_typing_indicator boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS typing_delay_per_char_ms integer NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS concat_messages boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS concat_time_seconds integer NOT NULL DEFAULT 7;
