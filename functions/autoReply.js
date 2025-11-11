import { logger } from '../utils/logger.js';
import { validateInput, checkRateLimit } from '../utils/validator.js';

/**
 * Gera resposta automática baseada no conteúdo
 */
function generateAutoReply(messageContent) {
    const content = messageContent.toLowerCase();
    
    if (content.includes('oi') || content.includes('olá')) {
        return '👋 Olá! Bem-vindo ao iMavyBot! Digite "iMavy" seguido da sua mensagem para interagir.';
    }
    
    if (content.includes('tudo bem') || content.includes('como vai')) {
        return '😊 Tudo ótimo por aqui! E você? Como posso ajudar?';
    }
    
    if (content.includes('ajuda') || content.includes('help')) {
        return '🆘 Para usar o bot, digite "iMavy" seguido da sua pergunta ou mensagem.';
    }
    
    return '🤖 Mensagem recebida! Use "iMavy" antes da sua mensagem para ativar a IA.';
}

/**
 * Inicializa sistema de resposta automática
 */
export function initAutoReply(sock) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify') return;
            
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;
            
            const sender = msg.key.remoteJid;
            const messageContent = msg.message.conversation || '';
            
            // Validações
            const validation = validateInput(messageContent);
            if (!validation.valid) {
                logger.warn(`Mensagem inválida ignorada de ${sender}`);
                return;
            }
            
            if (!checkRateLimit(sender, 5, 30000)) { // 5 mensagens por 30 segundos
                logger.warn(`Rate limit para auto-reply excedido: ${sender}`);
                return;
            }
            
            const reply = generateAutoReply(validation.sanitized);
            
            await sock.sendMessage(sender, { text: reply });
            logger.info(`Auto-reply enviado para: ${sender}`);
            
        } catch (error) {
            logger.error('Erro no sistema de auto-reply', error);
        }
    });
}
