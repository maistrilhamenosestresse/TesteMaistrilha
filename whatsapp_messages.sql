-- Criação da tabela de log e fila do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text,
  client_phone text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'sent', 'error'
  error_log text,
  scheduled_for timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Segurança RLS (Opcional)
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users"
  ON whatsapp_messages FOR ALL
  USING (true)
  WITH CHECK (true);
