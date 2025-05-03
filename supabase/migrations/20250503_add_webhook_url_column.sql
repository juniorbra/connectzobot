-- Migration: Add webhook_url column to workflows table
-- Date: 2025-05-03

ALTER TABLE public.workflows
ADD COLUMN webhook_url text;
