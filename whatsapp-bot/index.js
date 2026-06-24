const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WHATSAPP_API_KEY || 'M@isTrilh@S3cur3K3y2026';

// Supabase (para ler a fila do banco)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

app.use(express.json());

// Habilita CORS para testes diretos pelo frontend do laboratório
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-api-key");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

let currentQR = '';
let isClientReady = false;

// ---------------------------------------------------------
// EXPRESS: PÁGINA PÚBLICA DO QR CODE
// ---------------------------------------------------------
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
    } else if (isClientReady) {
        res.send('<h1>✅ Bot do WhatsApp da Mais Trilha está ONLINE e Conectado!</h1>');
    } else {
        res.send('<h1>⏳ Iniciando o robô do WhatsApp... aguarde!</h1><script>setTimeout(()=>location.reload(), 3000);</script>');
    }
});

// ---------------------------------------------------------
// MIDDLEWARE DE SEGURANÇA
// ---------------------------------------------------------
const authMiddleware = (req, res, next) => {
    const key = req.headers['x-api-key'] || req.query.key;
    if (key !== API_KEY) {
        return res.status(401).json({ error: 'Não autorizado. Chave de API inválida.' });
    }
    next();
};

// ---------------------------------------------------------
// UTILITÁRIOS E FILA ANTI-BAN (SUPABASE)
// ---------------------------------------------------------
function formatNumber(phone) {
    if (!phone) return '';
    let clean = String(phone).replace(/\D/g, '');
    // PROVA VIVA: Se não colocarmos o 55, o WhatsApp recusa imediatamente com erro "No LID for user"
    // pois ele não sabe para qual país ligar. Precisamos devolver o 55.
    if (clean.length === 10 || clean.length === 11) {
        clean = '55' + clean;
    }
    return clean;
}

const sendWithTimeout = (promise, ms = 45000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de comunicação (o WhatsApp Web demorou muito).')), ms))
    ]);
};

async function smartGetNumberId(phoneStr) {
    let clean = String(phoneStr).replace(/\D/g, '');
    
    // Sempre garante o 55 para o getNumberId do whatsapp-web.js
    if (clean.length === 10 || clean.length === 11) {
        clean = '55' + clean;
    }

    console.log(`[SmartSearch] Buscando formato original: ${clean}...`);
    try {
        // Timeout muito rápido: 4 segundos. Se o número for válido, retorna em milissegundos.
        // Se for inválido, a biblioteca trava. Nós usamos esse travamento a nosso favor!
        const res = await sendWithTimeout(client.getNumberId(clean), 4000);
        if (res) return res;
    } catch (e) {
        console.log(`[SmartSearch] Travou ou falhou. O número não é ${clean}.`);
    }

    // Plano B: Se era com 9, tenta sem o 9. Se era sem 9, tenta com 9.
    if (clean.length === 13 && clean.startsWith('55')) {
        const cleanSem9 = clean.substring(0, 4) + clean.substring(5);
        console.log(`[SmartSearch] Tentando formato alternativo (Sem o 9): ${cleanSem9}...`);
        try {
            const resSem9 = await sendWithTimeout(client.getNumberId(cleanSem9), 4000);
            if (resSem9) return resSem9;
        } catch (e) { }
    } else if (clean.length === 12 && clean.startsWith('55')) {
        const cleanCom9 = clean.substring(0, 4) + '9' + clean.substring(4);
        console.log(`[SmartSearch] Tentando formato alternativo (Com o 9): ${cleanCom9}...`);
        try {
            const resCom9 = await sendWithTimeout(client.getNumberId(cleanCom9), 4000);
            if (resCom9) return resCom9;
        } catch (e) { }
    }

    throw new Error("O WhatsApp não reconheceu o número nem com o 9 nem sem o 9.");
}

async function safeSendMessage(phoneStr, message, mediaUrl = null) {
    let media = null;
    if (mediaUrl && mediaUrl.startsWith('http')) {
        try {
            media = await MessageMedia.fromUrl(mediaUrl);
        } catch(e) {
            console.error('Erro ao baixar mídia:', e.message);
        }
    }

    try {
        const numberDetails = await smartGetNumberId(phoneStr);
        const targetId = numberDetails._serialized;
        
        console.log(`[Send] Sucesso na busca! ID oficial: ${targetId}. Disparando mensagem...`);
        
        if (media) await sendWithTimeout(client.sendMessage(targetId, media, { caption: message || '' }), 25000);
        else await sendWithTimeout(client.sendMessage(targetId, message || ''), 25000);
        
        return targetId;
    } catch (e) {
        throw new Error(e.message);
    }
}

let isBroadcasting = false;

// Rotina que varre o Supabase a cada 15 segundos buscando mensagens agendadas
async function pollSupabaseQueue() {
    if (isBroadcasting || !isClientReady || !supabase) return;
    
    // Busca mensagens pendentes
    const { data: messages, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(10); // Processa lotes de 10 por vez

    if (error) {
        console.error('[Queue Error]', error.message);
        return;
    }
    
    if (!messages || messages.length === 0) return;

    isBroadcasting = true;
    console.log(`[Queue] Encontradas ${messages.length} mensagens para disparo...`);

    for (let i = 0; i < messages.length; i++) {
        const task = messages[i];
        try {
            const cleanPhone = formatNumber(task.client_phone);
            
            // Envio Seguro com Fallback e Timeout (SEM getNumberId)
            const finalId = await safeSendMessage(cleanPhone, task.message, task.media_url);
            
            console.log(`[Queue] Mensagem enviada com sucesso para ${finalId}`);
            await supabase.from('whatsapp_messages').update({ status: 'sent' }).eq('id', task.id);
        } catch (err) {
            console.log(`[Queue] Erro ao enviar para ${task.client_phone}:`, err.message);
            await supabase.from('whatsapp_messages').update({ status: 'error', error_log: err.message }).eq('id', task.id);
        }
        
        // Delay anti-ban reduzido (15 segundos)
        if (i < messages.length - 1) {
            console.log(`[Queue] Pausa Anti-Ban de 15 segundos...`);
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
    
    isBroadcasting = false;
    console.log('[Queue] Lote finalizado!');
}

// Inicia o "Motor de Busca" a cada 15 segundos
setInterval(pollSupabaseQueue, 15000);


// ---------------------------------------------------------
// ROTAS DA API DO WHATSAPP (Apenas chamadas autorizadas)
// ---------------------------------------------------------

// Rota de Status
app.get('/api/status', authMiddleware, async (req, res) => {
    res.json({
        online: isClientReady,
        is_broadcasting: isBroadcasting
    });
});

// Força o robô a puxar a fila imediatamente
app.post('/api/trigger-queue', authMiddleware, async (req, res) => {
    if (!isClientReady || isBroadcasting) return res.json({ success: true, message: 'Fila já está rodando ou robô offline.' });
    pollSupabaseQueue();
    res.json({ success: true, message: 'Fila disparada com sucesso!' });
});

// Envio Individual Imediato (Usado pelo novo Chat 1 pra 1 e pelo Recibo de Seguro)
app.post('/api/send/individual', authMiddleware, async (req, res) => {
    if (!isClientReady) return res.status(503).json({ error: 'WhatsApp não está conectado.' });
    
    const { phone, message, media_url } = req.body;
    if (!phone || (!message && !media_url)) return res.status(400).json({ error: 'Faltam os campos phone, message ou media_url.' });

    const cleanPhone = formatNumber(phone);
    
    try {
        const finalId = await safeSendMessage(cleanPhone, message, media_url);
        return res.json({ success: true, formattedPhone: finalId });
    } catch (error) {
        console.error(`Erro envio individual imediato:`, error.message);
        return res.status(500).json({ error: error.message });
    }
});

// Entrar em um Grupo via Link de Convite
app.post('/api/group/join', authMiddleware, async (req, res) => {
    if (!isClientReady) return res.status(503).json({ error: 'WhatsApp não está conectado.' });
    
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: 'Falta o inviteCode.' });

    try {
        // Limpa o link para pegar só o código hash
        const inviteId = inviteCode.replace('https://chat.whatsapp.com/', '').split('?')[0];
        const groupId = await client.acceptInvite(inviteId);
        res.json({ success: true, groupId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enviar Mensagem para Grupo Imediato
app.post('/api/group/send', authMiddleware, async (req, res) => {
    if (!isClientReady) return res.status(503).json({ error: 'WhatsApp não está conectado.' });
    
    const { groupId, message, media_url } = req.body;
    if (!groupId || (!message && !media_url)) return res.status(400).json({ error: 'Faltam os campos.' });

    try {
        if (media_url) {
            const media = await MessageMedia.fromUrl(media_url);
            await client.sendMessage(groupId, media, { caption: message || '' });
        } else {
            await client.sendMessage(groupId, message);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR E DO WHATSAPP
// ---------------------------------------------------------
app.listen(PORT, () => {
    console.log(`[Express] Servidor e API Central rodando na porta ${PORT}`);
    if (!supabase) console.log('⚠️ AVISO: SUPABASE_URL não configurada no robô. A fila de agendamentos não funcionará.');
});

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
    isClientReady = false;
    console.log('ATENÇÃO: O QR Code está disponível na URL pública do site!');
});

client.on('ready', () => {
    currentQR = '';
    isClientReady = true;
    console.log('✅ Robô do WhatsApp conectado e pronto para uso!');
    // Tenta puxar a fila logo ao conectar
    pollSupabaseQueue();
});

client.on('disconnected', (reason) => {
    isClientReady = false;
    console.log('❌ WhatsApp Desconectado. Motivo:', reason);
    client.destroy();
    client.initialize();
});

client.initialize();
