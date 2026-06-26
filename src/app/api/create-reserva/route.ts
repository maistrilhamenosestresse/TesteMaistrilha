import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { client_id, agenda_id, status_pagamento = 'pendente', valor_pago = 0 } = await request.json();

    if (!client_id || !agenda_id) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    const { data: reservaData, error: reservaError } = await supabaseAdmin.from('reservas').insert([{
      client_id,
      agenda_id,
      status_pagamento,
      valor_pago
    }]).select();

    if (reservaError) {
      console.error("Erro interno ao inserir reserva:", reservaError);
      return NextResponse.json({ error: reservaError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reserva: reservaData[0] });

  } catch (error: any) {
    console.error("Erro em /api/create-reserva:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
