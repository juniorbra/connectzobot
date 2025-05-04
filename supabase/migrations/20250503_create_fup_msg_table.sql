-- Migration: Create fup_msg table
-- Date: 2025-05-03

CREATE TABLE public.fup_msg (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.workflows(id) ON DELETE CASCADE,
  estagio_1 text,
  estagio_2 text,
  estagio_3 text,
  estagio_4 text,
  estagio_5 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index on workflow_id for better query performance
CREATE INDEX idx_fup_msg_workflow_id ON public.fup_msg(workflow_id);

-- Comment on table and columns for documentation
COMMENT ON TABLE public.fup_msg IS 'Table for storing follow-up messages for workflows';
COMMENT ON COLUMN public.fup_msg.id IS 'Unique identifier for the follow-up message';
COMMENT ON COLUMN public.fup_msg.workflow_id IS 'Reference to the workflow this follow-up message belongs to';
COMMENT ON COLUMN public.fup_msg.estagio_1 IS 'Text content for stage 1 of the follow-up';
COMMENT ON COLUMN public.fup_msg.estagio_2 IS 'Text content for stage 2 of the follow-up';
COMMENT ON COLUMN public.fup_msg.estagio_3 IS 'Text content for stage 3 of the follow-up';
COMMENT ON COLUMN public.fup_msg.estagio_4 IS 'Text content for stage 4 of the follow-up';
COMMENT ON COLUMN public.fup_msg.estagio_5 IS 'Text content for stage 5 of the follow-up';
