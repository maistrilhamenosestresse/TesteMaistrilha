import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { text, history } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // History can be passed to give context, but we inject it in the prompt for simplicity.
    let historyContext = "";
    if (history && history.length > 0) {
      historyContext = "\n\n=== HISTÓRICO DA CONVERSA ===\n";
      history.forEach((msg: any) => {
        historyContext += `${msg.sender === 'user' ? 'Dono' : 'Você'}: ${msg.text}\n`;
      });
      historyContext += "=============================\n\n";
    }

    const prompt = `
    Atue como um assistente executivo autônomo de uma Agência de Ecoturismo ("Mais Trilha Menos Estresse").
    Você está conversando no chat com o dono da agência.
    
    Analise a ÚLTIMA MENSAGEM DO DONO:
    1. Se for uma pergunta solta, pedido de dica, ou conversa normal (Ex: "Qual cachoeira é melhor?", "O que levar pra Ibitipoca?"), você deve RESPONDER COMO UM CHAT NORMAL.
    2. Se for uma ordem clara para CADASTRAR/CRIAR uma trilha (Ex: "Cria a trilha pra Capitólio", "Agenda uma trilha pro dia 20..."), você DEVE EXTRAIR OS DADOS para preencher o sistema.

    REGRAS DE EXTRAÇÃO DE TRILHA (Quando for cadastrar):
    1. **title**: O título ou local da trilha. (Ex: "Serra do Cipó")
    2. **date**: A data do evento no formato YYYY-MM-DD. Tente deduzir o ano (ex: 2024 ou 2025). Ex: "2024-05-20".
    3. **price**: O valor cobrado. Apenas números e vírgulas. Ex: "150,00".
    4. **meeting_point**: Locais de embarque e horários. Formate sem asteriscos, use CAIXA ALTA para destaques, coloque emojis 📍 e ⏰, e formate o horário para 24h oficial de Brasília (Ex: "5 da manhã" vira 05:00, "5 da tarde" vira 17:00).
    5. **description**: Crie um roteiro super empolgante, INJETANDO pesquisas e curiosidades reais sobre belezas naturais ou história do lugar. Use emojis de aventura. 
       - REGRA SUPREMA: NUNCA USE ASTERISCOS (**) PARA NEGRITO. USE APENAS CAIXA ALTA PARA DESTAQUES!
       - REGRA DE INCLUSOS (PRIORIDADE MÁXIMA): Se o dono mencionar no áudio/texto que tem algo incluso (ex: "almoço", "café", "taxa", "transporte"), você DEVE OBRIGATORIAMENTE criar uma sessão "O QUE ESTÁ INCLUSO" (em caixa alta) na descrição e fazer uma lista com o símbolo "-" ou emojis. Jamais esqueça os itens que ele mencionar!

    Você DEVE retornar APENAS UM JSON válido. Não inclua \`\`\`json no começo, retorne o JSON cru.
    
    ESTRUTURA DO JSON ESPERADA SE FOR CONVERSA:
    {
      "type": "chat",
      "message": "Sua resposta amigável e profissional aqui, sem usar asteriscos de markdown."
    }

    ESTRUTURA DO JSON ESPERADA SE FOR CADASTRAR TRILHA:
    {
      "type": "agenda",
      "title": "string",
      "date": "YYYY-MM-DD",
      "price": "string",
      "meeting_point": "string",
      "description": "string"
    }
    ${historyContext}
    ÚLTIMA MENSAGEM DO DONO:
    "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpar possíveis blocos de markdown do JSON que o Gemini pode colocar mesmo com as instruções
    const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanedJsonText);

    return NextResponse.json({ result: data });

  } catch (error: any) {
    console.error("Erro na API do Agente IA:", error);
    return NextResponse.json({ error: 'Erro ao processar', details: error.message }, { status: 500 });
  }
}
