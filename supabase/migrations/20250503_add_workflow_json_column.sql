-- Migration: Add workflow_json column to workflows table
-- Date: 2025-05-03

ALTER TABLE public.workflows
ADD COLUMN workflow_json JSONB;
