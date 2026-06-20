import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Atue como um assistente executivo autônomo de uma Agência de Ecoturismo ("Mais Trilha Menos Estresse").
    Você receberá uma transcrição de voz do dono da agência ditando os detalhes de uma nova trilha que ele quer cadastrar.
    Sua tarefa é extrair e estruturar todos os dados para preencher o banco de dados.

    REGRAS DE EXTRAÇÃO E CONSTRUÇÃO:
    1. **title**: O título ou local da trilha. (Ex: "Serra do Cipó")
    2. **date**: A data do evento no formato YYYY-MM-DD. Se ele disser "dia 20 de maio", descubra o ano atual ou próximo e monte. Ex: "2024-05-20".
    3. **price**: O valor cobrado. Apenas números e vírgulas. Ex: Se "150 reais", escreva "150,00".
    4. **meeting_point**: Extraia os locais de embarque e horários. Formate do mesmo jeito profissional: use CAIXA ALTA, coloque emojis 📍 e ⏰, e formate o horário para 24h oficial de Brasília (Ex: "5 da manhã" vira 05:00, "5 da tarde" vira 17:00).
    5. **description**: Crie um roteiro super empolgante, identificando o local e INJETANDO pesquisas e curiosidades reais sobre belezas naturais ou história do lugar. Use emojis de aventura. Parágrafos espaçados, sem asteriscos de markdown.
    6. **image_prompt**: O dono vai pedir para você gerar um "flyer" ou uma capa. Crie um PROMPT DE FOTOGRAFIA CINEMATOGRÁFICA EXTREMAMENTE DETALHADO EM INGLÊS baseado no local da trilha. Ex: "A breathtaking cinematic poster for a hiking adventure at [Local], lush green mountains, crystal clear waterfall, adventurous vibe, 8k resolution, highly detailed, photorealistic". (Não inclua textos na imagem). Se não pedir flyer, crie um padrão incrível do destino mesmo assim.

    Você DEVE retornar APENAS UM JSON válido. Não inclua \`\`\`json no começo, retorne o JSON cru.
    
    ESTRUTURA DO JSON ESPERADA:
    {
      "title": "string",
      "date": "YYYY-MM-DD",
      "price": "string",
      "meeting_point": "string",
      "description": "string",
      "image_prompt": "string"
    }

    === TRANSCRIÇÃO RECEBIDA ===
    "${text}"
    =============================
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpar possíveis blocos de markdown do JSON que o Gemini pode colocar mesmo com as instruções
    const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const agendaData = JSON.parse(cleanedJsonText);

    // Gerar o Flyer via Motor Gráfico (Pollinations)
    // Tamanho ideal para redes/flyers: 1080x1350 (Vertical)
    const flyerUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(agendaData.image_prompt)}?width=1080&height=1350&nologo=true`;

    return NextResponse.json({ 
      result: {
        ...agendaData,
        flyerUrl
      } 
    });

  } catch (error: any) {
    console.error("Erro na API do Agente IA:", error);
    return NextResponse.json({ error: 'Erro ao gerar agenda inteligente', details: error.message }, { status: 500 });
  }
}
