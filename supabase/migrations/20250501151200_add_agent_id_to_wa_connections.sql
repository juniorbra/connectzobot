-- Add agent_id column to wa_connections (NOT NULL)
ALTER TABLE public.wa_connections
ADD COLUMN agent_id UUID NOT NULL REFERENCES public.agents(id);
