import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function generateInsuranceSummaryPDF(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const primaryColor = rgb(17/255, 58/255, 93/255); // #113a5d
  const black = rgb(0.2, 0.2, 0.2); // #333

  let y = 770;
  const margin = 50;
  const maxW = 595.28 - (margin * 2);

  // Helper to draw text
  const writeText = (text: string, f: any, size: number, color: any, indent = 0) => {
    page.drawText(text, { x: margin + indent, y, size, font: f, color });
    y -= (size + 10);
  };

  const writeMultiLine = (text: string, f: any, size: number, color: any, indent = 0) => {
    const words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const textWidth = f.widthOfTextAtSize(testLine, size);
      if (textWidth > (maxW - indent) && i > 0) {
        page.drawText(line, { x: margin + indent, y, size, font: f, color });
        line = words[i] + ' ';
        y -= (size + 5);
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x: margin + indent, y, size, font: f, color });
    y -= (size + 15);
  };

  writeText('RESUMO DO SEGURO AVENTURA', boldFont, 18, primaryColor, 120);
  y -= 10;
  
  writeMultiLine('Este documento é um resumo das coberturas e procedimentos do seu seguro, garantindo a sua tranquilidade durante a atividade.', font, 12, black);
  y -= 10;

  writeText('SUAS COBERTURAS (PLANO 2)', boldFont, 14, primaryColor);
  y -= 5;
  
  writeText('• Morte Acidental (MA): R$ 30.000,00', boldFont, 12, black, 10);
  writeMultiLine('Garante o pagamento de indenização em caso de morte do Segurado ocasionada exclusivamente por acidente pessoal coberto.', font, 11, black, 20);

  writeText('• Invalidez Permanente (IPA): R$ 30.000,00', boldFont, 12, black, 10);
  writeMultiLine('Garante o pagamento de indenização relativa à perda, à redução ou à impotência funcional definitiva de um membro ou órgão por lesão física.', font, 11, black, 20);

  writeText('• DMHO: R$ 3.000,00', boldFont, 12, black, 10);
  writeMultiLine('Garante o reembolso de despesas médicas, hospitalares e odontológicas efetuadas para o tratamento após a ocorrência de acidente.', font, 11, black, 20);

  writeText('• Cobertura de Deslocamento:', boldFont, 12, black, 10);
  writeMultiLine('Garantida em todo território nacional de ida e volta entre os locais de embarque/desembarque e o local do evento.', font, 11, black, 20);
  y -= 10;

  writeText('PROCEDIMENTOS EM CASO DE ACIDENTE', boldFont, 14, primaryColor);
  y -= 5;

  writeText('1. Comunicação Imediata:', boldFont, 12, black);
  writeMultiLine('O participante deve comunicar o guia responsável. Não haverá indenização se o responsável não tiver conhecimento do acidente no local.', font, 11, black);
  
  writeText('2. Atendimento Médico:', boldFont, 12, black);
  writeMultiLine('O primeiro atendimento médico deverá ocorrer no mesmo dia do acidente ou no máximo em até 5 (cinco) dias.', font, 11, black);
  
  writeText('3. Documentação Exigida para Reembolso:', boldFont, 12, black);
  const docs = [
    '• Foto do segurado no local do acidente;',
    '• Prontuário Médico constando data e procedimentos realizados;',
    '• Relatório detalhado do médico atestando o tratamento realizado;',
    '• Notas fiscais originais (Não será aceito recibo);',
    '• Comprovação dos exames médicos e Receita Médica;',
    '• Fotocópia do RG/CPF e comprovante de residência;',
    '• Comprovante bancário em nome do Segurado.'
  ];
  docs.forEach(item => {
    writeText(item, font, 11, black, 10);
    y += 5; // reduce spacing slightly
  });

  y -= 30;
  writeText('Mais Trilha Menos Estresse - Turismo de Aventura Responsável.', italicFont, 10, rgb(0.5, 0.5, 0.5), 100);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { client } = data;

    if (!client || !client.email) {
      return NextResponse.json({ success: false, error: 'Email do cliente não informado.' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Credenciais de email não configuradas.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Gera o PDF em memória
    const pdfBuffer = await generateInsuranceSummaryPDF();

    const firstName = client.full_name.split(' ')[0];
    const termoUrl = `https://maistrilhamenosestresse.com.br/admin/termo/${client.id}`;

    const mailOptions = {
      from: `Mais Trilha Menos Estresse <${process.env.GMAIL_USER}>`,
      to: client.email,
      subject: `Inscrição Confirmada, ${firstName}! Prepare a mochila 🎒`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #F17B37; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Bem-vindo(a) à Mais Trilha!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Sua inscrição foi recebida com sucesso.</p>
          </div>
          
          <div style="padding: 30px 20px; color: #333; line-height: 1.6;">
            <p>Olá <strong>${firstName}</strong>,</p>
            <p>Parabéns! Nós recebemos o seu cadastro e a sua assinatura do Termo de Responsabilidade.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #F17B37; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #113a5d;">Seu Termo de Responsabilidade</h3>
              <p style="margin-bottom: 0;">Você pode acessar, salvar ou imprimir uma cópia do seu termo assinado a qualquer momento clicando no link abaixo:</p>
              <br/>
              <a href="${termoUrl}" style="background-color: #113a5d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acessar Meu Contrato</a>
            </div>

            <h3 style="color: #113a5d;">Seguro Aventura Ativo 🛡️</h3>
            <p>Sua segurança é nossa prioridade. O seu Seguro Aventura estará ativo durante toda a atividade. Nós anexamos a este e-mail um PDF contendo o <strong>Resumo das Coberturas e Procedimentos</strong> para a sua leitura e acompanhamento.</p>
            
            <br/>
            <p>Em breve, nossa equipe enviará as instruções detalhadas e horários no grupo oficial. Fique atento!</p>
            
            <p style="margin-top: 30px;">Um grande abraço,<br/><strong>Equipe Mais Trilha Menos Estresse</strong></p>
          </div>
          
          <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            Este é um e-mail automático. Por favor, não responda diretamente.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'Resumo_Seguro_Aventura.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erro ao enviar e-mail para o cliente:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
