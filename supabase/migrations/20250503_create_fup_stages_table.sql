-- Migration: Create fup_stages table
-- Date: 2025-05-03

CREATE TABLE public.fup_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.workflows(id) ON DELETE CASCADE,
  instancia text,
  key text,
  numero text,
  created_at timestamptz DEFAULT now(),
  estagio int8,
  updated_at timestamptz DEFAULT now()
);

-- Add index on workflow_id for better query performance
CREATE INDEX idx_fup_stages_workflow_id ON public.fup_stages(workflow_id);

-- Add index on the combination of instancia and key for faster lookups
CREATE INDEX idx_fup_stages_instancia_key ON public.fup_stages(instancia, key);

-- Comment on table and columns for documentation
COMMENT ON TABLE public.fup_stages IS 'Table for storing follow-up stages for workflows';
COMMENT ON COLUMN public.fup_stages.id IS 'Unique identifier for the follow-up stage';
COMMENT ON COLUMN public.fup_stages.workflow_id IS 'Reference to the workflow this follow-up stage belongs to';
COMMENT ON COLUMN public.fup_stages.instancia IS 'Instance identifier';
COMMENT ON COLUMN public.fup_stages.key IS 'Key identifier';
COMMENT ON COLUMN public.fup_stages.numero IS 'Number identifier';
COMMENT ON COLUMN public.fup_stages.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.fup_stages.estagio IS 'Stage number';
