-- 1. Colunas para a tabela agendas
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS max_capacity integer DEFAULT 15;
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS requirements text;
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS duration_hours numeric;
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS distance_km numeric;
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium';

-- 2. Tabela de Notificacoes
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reserva_id uuid REFERENCES public.reservas(id) ON DELETE CASCADE,
  mensagem text NOT NULL,
  lida boolean DEFAULT false
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 3. Politicas da tabela de Notificacoes (Somente Admins logados podem ver/modificar)
CREATE POLICY "Leitura Autenticada Notificacoes" ON public.notificacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Atualizacao Autenticada Notificacoes" ON public.notificacoes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Exclusao Autenticada Notificacoes" ON public.notificacoes FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Escrita Autenticada Notificacoes" ON public.notificacoes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
