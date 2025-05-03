-- Migration: Add api_openai column to workflows table
-- Date: 2025-05-02

ALTER TABLE public.workflows
ADD COLUMN api_openai text;
