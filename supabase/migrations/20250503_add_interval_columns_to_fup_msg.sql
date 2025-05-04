-- Migration: Add interval columns to fup_msg table
-- Date: 2025-05-03

ALTER TABLE public.fup_msg
ADD COLUMN intervalo_1 int4,
ADD COLUMN intervalo_2 int4,
ADD COLUMN intervalo_3 int4,
ADD COLUMN intervalo_4 int4,
ADD COLUMN intervalo_5 int4;

-- Add comments for documentation
COMMENT ON COLUMN public.fup_msg.intervalo_1 IS 'Intervalo em dias para o estágio 1 do follow-up';
COMMENT ON COLUMN public.fup_msg.intervalo_2 IS 'Intervalo em dias para o estágio 2 do follow-up';
COMMENT ON COLUMN public.fup_msg.intervalo_3 IS 'Intervalo em dias para o estágio 3 do follow-up';
COMMENT ON COLUMN public.fup_msg.intervalo_4 IS 'Intervalo em dias para o estágio 4 do follow-up';
COMMENT ON COLUMN public.fup_msg.intervalo_5 IS 'Intervalo em dias para o estágio 5 do follow-up';
