// index.js
import 'dotenv/config';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, getContentType } from "baileys";
import qrcode from "qrcode-terminal";
import { handleGroupMessages } from './functions/groupResponder.js';
import { scheduleGroupMessages } from './functions/scheduler.js';
import { logger } from './utils/logger.js';
import { validateInput } from './utils/validator.js';

/**
 * Valida configurações necessárias
 */
function validateConfig() {
    // HUGGING_FACE_API é opcional - bot funcionará sem IA se não configurado
    if (!process.env.HUGGING_FACE_API) {
        logger.warn('HUGGING_FACE_API não configurado - funcionalidades de IA desabilitadas');
    }
    
    logger.info('Configuração validada com sucesso');
}

/**
 * Inicia o bot com tratamento de erros robusto
 */
async function startBot() {
    try {
        logger.info("Iniciando iMavyBot com IA integrada");
        
        validateConfig();
        
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            defaultQueryTimeoutMs: 60000
        });
        
        sock.ev.on('creds.update', async () => {
            try {
                await saveCreds();
            } catch (error) {
                logger.error('Erro ao salvar credenciais', error);
            }
        });
        
        sock.ev.on('connection.update', async (update) => {
            try {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr && connection !== 'open') {
                    logger.info("QR Code gerado - escaneie no WhatsApp");
                    qrcode.generate(qr, { small: true });
                }
                
                logger.info(`Status da conexão: ${connection}`);
                
                if (connection === 'open') {
                    logger.success('Conectado ao WhatsApp com sucesso');
                    scheduleGroupMessages(sock);
                }
                
                if (connection === 'close') {
                    const reason = lastDisconnect?.error?.output?.statusCode;
                    logger.warn(`Conexão fechada. Motivo: ${reason}`);
                    
                    if (reason !== DisconnectReason.loggedOut) {
                        logger.info('Tentando reconectar em 5 segundos...');
                        setTimeout(() => startBot(), 5000);
                    } else {
                        logger.error('Sessão desconectada. Necessário escanear QR novamente');
                    }
                }
            } catch (error) {
                logger.error('Erro no evento de conexão', error);
            }
        });
        
        sock.ev.on('messages.upsert', async (msgUpsert) => {
            try {
                const messages = msgUpsert.messages;
                
                for (const message of messages) {
                    if (!message.key.fromMe) {
                        const senderId = message.key.participant || message.key.remoteJid;
                        const isGroup = message.key.remoteJid.endsWith('@g.us');
                        const groupId = isGroup ? message.key.remoteJid : null;
                        
                        const contentType = getContentType(message.message);
                        const content = message.message[contentType];
                        
                        logger.info('Mensagem recebida', {
                            tipo: contentType,
                            de: senderId,
                            grupo: groupId,
                            conteudo: content?.text || 'Mídia/Outro'
                        });
                        
                        await handleGroupMessages(sock, message);
                    }
                }
            } catch (error) {
                logger.error('Erro ao processar mensagens', error);
            }
        });
        
    } catch (error) {
        logger.error('Erro crítico ao iniciar bot', error);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejeitada não tratada', reason);
});

startBot();
