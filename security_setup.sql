-- Script de Fechamento de Segurança do Banco de Dados (Supabase RLS)

-- 1. Habilitar RLS nas tabelas (garantia)
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas abertas antigas
DROP POLICY IF EXISTS "Leitura Publica Agendas" ON public.agendas;
DROP POLICY IF EXISTS "Escrita Publica Agendas" ON public.agendas;
DROP POLICY IF EXISTS "Atualizacao Publica Agendas" ON public.agendas;
DROP POLICY IF EXISTS "Exclusao Publica Agendas" ON public.agendas;

DROP POLICY IF EXISTS "Leitura Publica Clients" ON public.clients;
DROP POLICY IF EXISTS "Escrita Publica Clients" ON public.clients;
DROP POLICY IF EXISTS "Atualizacao Publica Clients" ON public.clients;
DROP POLICY IF EXISTS "Exclusao Publica Clients" ON public.clients;

-- 3. Políticas para AGENDAS (Trilhas)
-- O público pode LER as trilhas para o site funcionar.
CREATE POLICY "Leitura Publica Agendas" ON public.agendas FOR SELECT USING (true);
-- Mas Apenas ADMINISTRADORES LOGADOS podem CRIAR, EDITAR ou EXCLUIR.
CREATE POLICY "Escrita Autenticada Agendas" ON public.agendas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Atualizacao Autenticada Agendas" ON public.agendas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Exclusao Autenticada Agendas" ON public.agendas FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Políticas para CLIENTES (Dados Sensíveis)
-- O público não pode LER os clientes! Apenas admins logados.
CREATE POLICY "Leitura Autenticada Clients" ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
-- O público PODE criar um cliente (durante a compra/checkout).
CREATE POLICY "Cadastro Publico Clients" ON public.clients FOR INSERT WITH CHECK (true);
-- Apenas admins podem atualizar ou deletar clientes.
CREATE POLICY "Atualizacao Autenticada Clients" ON public.clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Exclusao Autenticada Clients" ON public.clients FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Proteger Upload de Imagens no Storage
DROP POLICY IF EXISTS "Upload Publico Fotos" ON storage.objects;
CREATE POLICY "Upload Autenticado Fotos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos_agendas' AND auth.role() = 'authenticated');
CREATE POLICY "Atualizacao Autenticada Fotos" ON storage.objects FOR UPDATE USING (bucket_id = 'fotos_agendas' AND auth.role() = 'authenticated');
CREATE POLICY "Exclusao Autenticada Fotos" ON storage.objects FOR DELETE USING (bucket_id = 'fotos_agendas' AND auth.role() = 'authenticated');
-- Manter a leitura pública das fotos
CREATE POLICY "Leitura Publica Fotos" ON storage.objects FOR SELECT USING (bucket_id = 'fotos_agendas');
