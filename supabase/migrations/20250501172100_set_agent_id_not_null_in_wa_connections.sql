-- Set agent_id as NOT NULL in wa_connections
ALTER TABLE public.wa_connections
ALTER COLUMN agent_id SET NOT NULL;
