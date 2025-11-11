import { logger } from '../utils/logger.js';

/**
 * Envia mensagem de boas-vindas com tratamento de erro
 */
export async function sendWelcomeMessage(sock, jid) {
    try {
        const welcomeText = `🤖 Olá! Bem-vindo ao iMavyBot

✨ Bot com IA integrada
💬 Digite "iMavy" seguido da sua mensagem para interagir

Carregando: [████████████████████] 100%`;
        
        await sock.sendMessage(jid, { text: welcomeText });
        logger.success(`Mensagem de boas-vindas enviada para: ${jid}`);
    } catch (error) {
        logger.error('Erro ao enviar mensagem de boas-vindas', error);
    }
}
