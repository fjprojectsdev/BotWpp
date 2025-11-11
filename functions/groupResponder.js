// groupResponder.js
import 'dotenv/config';
import { generateAIResponse } from './openAI.js';
import { logger } from '../utils/logger.js';
import { validateInput, checkRateLimit, validateGroup } from '../utils/validator.js';

const TARGET_GROUP = process.env.TARGET_GROUP_ID || '120363420952651026@g.us';
const BOT_TRIGGER = process.env.BOT_TRIGGER || 'iMavy';
const ADMIN_ID = process.env.ADMIN_ID || '227349882745008@lid';
const ALLOWED_GROUPS = [TARGET_GROUP];

/**
 * Extrai texto de diferentes tipos de mensagem
 */
function extractMessageText(message) {
    const contentType = Object.keys(message.message)[0];
    
    switch(contentType) {
        case 'conversation':
            return message.message.conversation;
        case 'extendedTextMessage':
            return message.message.extendedTextMessage.text;
        case 'imageMessage':
            return message.message.imageMessage.caption || '';
        case 'videoMessage':
            return message.message.videoMessage.caption || '';
        default:
            return '';
    }
}

/**
 * Processa comandos administrativos
 */
async function handleAdminCommand(sock, message, text, groupId, senderId) {
    if (senderId !== ADMIN_ID) {
        logger.warn(`Tentativa de comando admin não autorizada de: ${senderId}`);
        return false;
    }
    
    logger.info(`Comando admin recebido de ${senderId}: ${text}`);
    
    try {
        await sock.sendMessage(groupId, { 
            text: '✅ Comando administrativo executado com sucesso.' 
        }, { quoted: message });
        return true;
    } catch (error) {
        logger.error('Erro ao executar comando admin', error);
        return false;
    }
}

/**
 * Manipula mensagens de grupo com validações de segurança
 */
export async function handleGroupMessages(sock, message) {
    try {
        const groupId = message.key.remoteJid;
        const isGroup = groupId.endsWith('@g.us');
        
        if (!isGroup) return;
        
        const text = extractMessageText(message);
        if (!text) return;
        
        logger.info(`Mensagem recebida: ${text}`);
        
        // Comandos administrativos
        if (text.toLowerCase().includes('fechar grupo') || text.toLowerCase().includes('/fechar')) {
            await sock.groupSettingUpdate(groupId, 'announcement');
            await sock.sendMessage(groupId, { 
                text: '🔒 GRUPO FECHADO\n\nApenas administradores podem enviar mensagens.\n\n⚠️ IMPORTANTE: Para reabrir, um ADMIN deve digitar:\n• "abrir grupo" ou "/abrir"\n• "!abrir" (comando especial)' 
            });
            return;
        }
        
        if (text.toLowerCase().includes('abrir grupo') || text.toLowerCase().includes('/abrir') || text.toLowerCase().includes('!abrir')) {
            await sock.groupSettingUpdate(groupId, 'not_announcement');
            await sock.sendMessage(groupId, { 
                text: '🔓 GRUPO ABERTO\n\nTodos podem enviar mensagens novamente!\n\nUse "fechar grupo" ou "/fechar" para fechar.' 
            });
            return;
        }
        
        // IA com trigger
        if (text.toLowerCase().includes(BOT_TRIGGER.toLowerCase())) {
            const reply = await generateAIResponse(text);
            await sock.sendMessage(groupId, { text: reply }, { quoted: message });
        }
        
    } catch (error) {
        logger.error('Erro ao processar mensagem', error);
    }
}
