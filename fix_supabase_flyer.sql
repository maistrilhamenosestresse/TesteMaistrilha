-- Adicionar coluna de Flyer na tabela
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS flyer_url text;
