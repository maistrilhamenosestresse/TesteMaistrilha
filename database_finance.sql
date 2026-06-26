-- Script de Criação das Tabelas de Finanças e Reservas (Fase 1)

-- 1. Tabela de Custos das Trilhas
CREATE TABLE IF NOT EXISTS public.trilha_custos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  agenda_id uuid NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
  item_nome text NOT NULL,
  valor_custo numeric NOT NULL,
  data_pagamento date
);

-- Habilitar RLS na tabela de custos
ALTER TABLE public.trilha_custos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: Apenas Admins podem ver/modificar os custos
CREATE POLICY "Leitura Autenticada Custos" ON public.trilha_custos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Escrita Autenticada Custos" ON public.trilha_custos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Atualizacao Autenticada Custos" ON public.trilha_custos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Exclusao Autenticada Custos" ON public.trilha_custos FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Tabela de Reservas (Lista de Passageiros)
CREATE TABLE IF NOT EXISTS public.reservas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  agenda_id uuid NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  status_pagamento text DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'cancelado')),
  valor_pago numeric,
  metodo_pagamento text,
  nsu_transacao text
);

-- Habilitar RLS na tabela de reservas
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Reservas
-- Admin pode fazer tudo
CREATE POLICY "Admin All Reservas" ON public.reservas USING (auth.role() = 'authenticated');

-- O Webhook do backend (usando Service Role) bypassa RLS, então não precisamos abrir escrita pública.
-- No entanto, se o próprio usuário criar a reserva no checkout (antes do webhook aprovar),
-- precisaremos de uma permissão pública de INSERT restrita ao status pendente.
CREATE POLICY "Insercao Publica Reservas Pendentes" ON public.reservas FOR INSERT WITH CHECK (status_pagamento = 'pendente');

