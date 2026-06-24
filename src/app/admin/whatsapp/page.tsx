"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Users, Send, AlertCircle, CheckCircle2, MessageCircle, Gift } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppAdmin() {
  const [botStatus, setBotStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'status' | 'broadcast' | 'birthdays'>('status');
  
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  const [clients, setClients] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    checkStatus();
    loadClients();
  }, []);

  const checkStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/whatsapp');
      const data = await res.json();
      setBotStatus(data);
    } catch (e) {
      setBotStatus({ error: 'Erro ao conectar com a API' });
    }
    setIsLoadingStatus(false);
  };

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('*');
    if (data) {
      setClients(data);
      
      // Filtrar aniversariantes do mês atual
      const currentMonth = new Date().getMonth() + 1;
      const bdays = data.filter(c => {
        if (!c.birth_date) return false;
        const [year, month] = c.birth_date.split('-');
        return parseInt(month) === currentMonth;
      });
      setBirthdays(bdays);
    }
  };

  const handleBroadcast = async (targetClients: any[], customMessage: string) => {
    if (!customMessage.trim()) return alert('Digite uma mensagem!');
    if (!targetClients.length) return alert('Nenhum cliente selecionado!');

    const confirm = window.confirm(`Deseja enviar essa mensagem para ${targetClients.length} pessoas?\nO robô fará pausas automáticas de 60 segundos entre cada envio para evitar banimentos.`);
    if (!confirm) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const phones = targetClients.map(c => c.phone).filter(Boolean);
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          contacts: phones,
          message: customMessage
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSendResult({ success: true, message: data.message });
        setBroadcastMessage('');
      } else {
        setSendResult({ success: false, message: data.error });
      }
    } catch (error: any) {
      setSendResult({ success: false, message: error.message });
    }
    
    setIsSending(false);
    checkStatus(); // Atualiza a fila
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans pb-20">
      <div className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto">
        <Link href="/admin" className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-900 mb-6 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para o Painel Administrativo</span>
        </Link>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Central do WhatsApp</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Controle o robô de disparos e campanhas de marketing.</p>
          </div>

          {/* Abas */}
          <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <button onClick={() => setActiveTab('status')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'status' ? 'bg-[#d93025] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              <AlertCircle className="w-4 h-4" /> <span>Status do Robô</span>
            </button>
            <button onClick={() => setActiveTab('broadcast')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'broadcast' ? 'bg-[#d93025] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              <MessageCircle className="w-4 h-4" /> <span>Disparo em Massa</span>
            </button>
            <button onClick={() => setActiveTab('birthdays')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'birthdays' ? 'bg-[#d93025] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Gift className="w-4 h-4" /> <span>Aniversariantes do Mês ({birthdays.length})</span>
            </button>
          </div>

          {/* STATUS */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Saúde do Robô</h2>
                  <p className="text-gray-500 text-sm mt-1">Verifique se o robô da Railway está online e conectado ao seu celular.</p>
                </div>
                <button onClick={checkStatus} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                  {isLoadingStatus ? 'Verificando...' : 'Atualizar Status'}
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  {botStatus?.online ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                  )}
                  <h3 className="font-bold text-gray-900">Conexão do WhatsApp</h3>
                  <p className={`text-sm mt-1 font-medium ${botStatus?.online ? 'text-green-600' : 'text-red-600'}`}>
                    {botStatus?.online ? 'Conectado e Operante' : 'Offline / Desconectado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  <Send className="w-12 h-12 text-blue-500 mb-3" />
                  <h3 className="font-bold text-gray-900">Fila Anti-Ban</h3>
                  <p className="text-sm mt-1 text-gray-600">
                    <strong>{botStatus?.queue_length || 0}</strong> mensagens aguardando envio
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  <MessageCircle className="w-12 h-12 text-purple-500 mb-3" />
                  <h3 className="font-bold text-gray-900">Status da Máquina</h3>
                  <p className="text-sm mt-1 text-gray-600">
                    {botStatus?.is_broadcasting ? 'Enviando mensagens ativamente...' : 'Ocioso (Pronto para disparos)'}
                  </p>
                </div>
              </div>

              {botStatus?.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                  <strong>Erro de Comunicação:</strong> {botStatus.error}. Verifique se a URL da Railway foi configurada nas variáveis de ambiente da Vercel.
                </div>
              )}
            </div>
          )}

          {/* BROADCAST LIVRE */}
          {activeTab === 'broadcast' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Disparo em Massa</h2>
                <p className="text-gray-500 text-sm mt-1">Envie uma mensagem livre para todos os <strong>{clients.length}</strong> clientes da sua base de dados.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem do Disparo</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#d93025] focus:border-[#d93025] p-4"
                    placeholder="Olá! Temos uma novidade incrível na Mais Trilha..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Dica: Use *asteriscos* para negrito, _underline_ para itálico.</p>
                </div>

                <button 
                  onClick={() => handleBroadcast(clients, broadcastMessage)}
                  disabled={isSending || !botStatus?.online}
                  className="w-full flex items-center justify-center space-x-2 bg-[#d93025] hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSending ? 'Processando Fila...' : `Enviar para todos (${clients.length} clientes)`}</span>
                </button>

                {sendResult && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {sendResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANIVERSARIANTES */}
          {activeTab === 'birthdays' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Marketing de Aniversário</h2>
                <p className="text-gray-500 text-sm mt-1">Fidelize seus clientes mandando uma mensagem de feliz aniversário para os aniversariantes do mês atual.</p>
              </div>

              {birthdays.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
                  Não há aniversariantes cadastrados neste mês.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {birthdays.map((b, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                          {b.birth_date.split('-')[2]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{b.name}</p>
                          <p className="text-xs text-gray-500">{b.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem de Parabéns</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#d93025] focus:border-[#d93025] p-4"
                      placeholder="A Mais Trilha deseja um Feliz Aniversário! Temos um cupom de desconto especial para você..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={() => handleBroadcast(birthdays, broadcastMessage)}
                    disabled={isSending || !botStatus?.online}
                    className="w-full flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Gift className="w-5 h-5" />
                    <span>{isSending ? 'Processando Fila...' : `Disparar Parabéns (${birthdays.length} aniversariantes)`}</span>
                  </button>

                  {sendResult && (
                     <div className={`p-4 rounded-xl text-sm font-medium ${sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                     {sendResult.message}
                   </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
