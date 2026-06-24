const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// Configuração do Servidor Express para Health Check (Essencial para a Railway)
const app = express();
const PORT = process.env.PORT || 3000;

let currentQR = '';

app.get('/', (req, res) => {
    if (currentQR) {
        res.send(`
            <html>
                <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background-color:#f0f2f5;">
                    <h2 style="color:#333;">Escaneie o QR Code com seu WhatsApp</h2>
                    <div id="qrcode" style="background:white; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);"></div>
                    <p style="color:#666; margin-top:20px;">A página atualiza sozinha...</p>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                    <script>
                        new QRCode(document.getElementById("qrcode"), "${currentQR}");
                        setTimeout(() => location.reload(), 5000);
                    </script>
                </body>
            </html>
        `);
    } else {
        res.send('<h1>✅ Bot do WhatsApp da Mais Trilha está ONLINE e Conectado!</h1>');
    }
});

app.listen(PORT, () => {
    console.log(`[Express] Servidor rodando na porta ${PORT}`);
});

// Configuração do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    currentQR = qr;
    console.log('========================================================');
    console.log('ATENÇÃO: O QR Code está disponível no site da Railway!');
    console.log('Abra o link público da sua aplicação na Railway para escanear.');
    console.log('========================================================');
});

client.on('ready', () => {
    currentQR = '';
    console.log('✅ Robô do WhatsApp conectado e pronto para uso!');
});

// Tratamento de erros de autenticação ou desconexão
client.on('disconnected', (reason) => {
    console.log('❌ O WhatsApp foi desconectado. Motivo:', reason);
    // Destrói a sessão para forçar a geração de um novo QR Code se cair
    client.destroy();
    client.initialize();
});

// Escutador de mensagens (Exemplo base)
client.on('message', message => {
    if(message.body === '!ping') {
        message.reply('pong');
    }
});

// Inicialização
client.initialize();
