-- Remove existing foreign key constraint on agent_id
ALTER TABLE public.wa_connections
DROP CONSTRAINT IF EXISTS wa_connections_agent_id_fkey;

-- Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.wa_connections
ADD CONSTRAINT wa_connections_agent_id_fkey
FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;
