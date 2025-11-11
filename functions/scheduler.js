import schedule from 'node-schedule';
import { logger } from '../utils/logger.js';

const TARGET_GROUP = process.env.TARGET_GROUP_ID || '120363420952651026@g.us';

/**
 * Fecha o grupo para apenas admins
 */
async function closeGroup(sock) {
    try {
        await sock.groupSettingUpdate(TARGET_GROUP, 'announcement');
        logger.success('Grupo fechado para apenas admins');
    } catch (error) {
        logger.error('Erro ao fechar grupo', error);
    }
}

/**
 * Abre o grupo para todos
 */
async function openGroup(sock) {
    try {
        await sock.groupSettingUpdate(TARGET_GROUP, 'not_announcement');
        logger.success('Grupo aberto para todos');
    } catch (error) {
        logger.error('Erro ao abrir grupo', error);
    }
}

/**
 * Envia mensagem agendada com tratamento de erro
 */
async function sendScheduledMessage(sock, message, type) {
    try {
        await sock.sendMessage(TARGET_GROUP, { text: message });
        logger.success(`Mensagem de ${type} enviada com sucesso`);
    } catch (error) {
        logger.error(`Erro ao enviar mensagem de ${type}`, error);
    }
}

/**
 * Configura agendamento de mensagens do grupo
 */
export function scheduleGroupMessages(sock) {
    try {
        // Horário de fechamento: 00:00 horário de Brasília (UTC-3 = hora 3 UTC)
        const closeJob = schedule.scheduleJob('grupo-fechamento', { hour: 3, minute: 0 }, async () => {
            const message = `🔒 GRUPO FECHADO

Fala Galera! O grupo foi fechado para Horário Noturno.

⏰ Voltamos amanhã às 07:00

📝 Apenas admins podem enviar mensagens até lá!`;
            
            await closeGroup(sock);
            await sendScheduledMessage(sock, message, 'fechamento');
        });
        
        // Horário de abertura: 07:00 horário de Brasília (UTC-3 = hora 10 UTC)
        const openJob = schedule.scheduleJob('grupo-abertura', { hour: 10, minute: 0 }, async () => {
            const message = `🔓 GRUPO ABERTO

Bom dia! O grupo está aberto novamente.

⏰ Fecha às 00:00

📝 Todos podem participar das conversas!`;
            
            await openGroup(sock);
            await sendScheduledMessage(sock, message, 'abertura');
        });
        
        if (closeJob && openJob) {
            logger.success('Agendamento de mensagens configurado com sucesso');
        } else {
            logger.error('Falha ao configurar agendamento de mensagens');
        }
        
    } catch (error) {
        logger.error('Erro ao configurar agendamento', error);
    }
}
