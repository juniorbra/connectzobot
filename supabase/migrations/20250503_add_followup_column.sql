-- Migration: Add followup column to workflows table
-- Date: 2025-05-03

ALTER TABLE public.workflows
ADD COLUMN followup BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.workflows.followup IS 'Flag indicating if follow-up functionality is enabled for this workflow';
