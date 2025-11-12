// groupResponder.js
import 'dotenv/config';
import { generateAIResponse } from './openAI.js';
import { logger } from '../utils/logger.js';
import { validateInput, checkRateLimit, validateGroup } from '../utils/validator.js';

const TARGET_GROUP = process.env.TARGET_GROUP_ID || '120363420952651026@g.us';
const BOT_TRIGGER = process.env.BOT_TRIGGER || 'iMavy';
const ADMIN_ID = process.env.ADMIN_ID || '227349882745008@lid';
const ALLOWED_GROUPS = [TARGET_GROUP];

// Sistema de contagem de mensagens
const messageCount = new Map(); // {userId: {name: string, count: number, weeklyCount: number, dailyMessages: [], hourlyStats: []}}
const warnings = new Map(); // {userId: warningCount}
const mutedUsers = new Map(); // {userId: unmuteTime}
const reminders = new Map(); // {id: {time, message, groupId}}
const polls = new Map(); // {pollId: {question, options, votes}}
const spamDetection = new Map(); // {userId: {lastMessage, count, timestamp}}

// Dados temporais
const dailyStats = new Map(); // {date: messageCount}
const hourlyStats = new Array(24).fill(0); // [0-23] horas

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
 * Gera ranking de membros mais ativos
 */
function generateRanking() {
    const sorted = Array.from(messageCount.entries())
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10);
    
    if (sorted.length === 0) {
        return '📊 RANKING DE MEMBROS\n\nNenhuma mensagem registrada ainda.';
    }
    
    let ranking = '🏆 RANKING DE MEMBROS MAIS ATIVOS\n\n';
    
    sorted.forEach(([userId, data], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}️⃣`;
        ranking += `${medal} ${data.name}: ${data.count} mensagens\n`;
    });
    
    const totalMessages = Array.from(messageCount.values()).reduce((sum, data) => sum + data.count, 0);
    ranking += `\n📊 Total de mensagens: ${totalMessages}`;
    
    return ranking;
}

/**
 * Gera estatísticas do grupo
 */
function generateStats() {
    const totalMessages = Array.from(messageCount.values()).reduce((sum, data) => sum + data.count, 0);
    const totalMembers = messageCount.size;
    const avgMessages = totalMembers > 0 ? Math.round(totalMessages / totalMembers) : 0;
    
    let stats = '📊 ESTATÍSTICAS DO GRUPO\n\n';
    stats += `👥 Membros ativos: ${totalMembers}\n`;
    stats += `💬 Total de mensagens: ${totalMessages}\n`;
    stats += `📈 Média por membro: ${avgMessages}\n`;
    
    return stats;
}

/**
 * Detecta spam
 */
function detectSpam(userId, text) {
    const now = Date.now();
    const userSpam = spamDetection.get(userId) || { lastMessage: '', count: 0, timestamp: now };
    
    if (now - userSpam.timestamp > 60000) {
        userSpam.count = 0;
        userSpam.timestamp = now;
    }
    
    if (userSpam.lastMessage === text) {
        userSpam.count++;
    } else {
        userSpam.count = 1;
        userSpam.lastMessage = text;
    }
    
    spamDetection.set(userId, userSpam);
    return userSpam.count >= 3;
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
 * Manipula mensagens apenas do grupo DESENVOLVIMENTO IA
 */
export async function handleGroupMessages(sock, message) {
    try {
        const groupId = message.key.remoteJid;
        const isGroup = groupId.endsWith('@g.us');
        
        if (!isGroup) return;
        
        // Verificar se é o grupo correto
        const groupInfo = await sock.groupMetadata(groupId);
        const groupName = groupInfo.subject;
        
        if (groupName !== 'DESENVOLVIMENTO IA') {
            logger.info(`Mensagem ignorada - grupo: ${groupName}`);
            return;
        }
        
        const text = extractMessageText(message);
        const senderId = message.key.participant || message.key.remoteJid;
        const senderName = message.pushName || 'Usuário';
        
        // Contar mensagem com dados temporais
        const now = Date.now();
        const hour = new Date().getHours();
        
        if (!messageCount.has(senderId)) {
            messageCount.set(senderId, { 
                name: senderName, 
                count: 0, 
                weeklyCount: 0,
                dailyMessages: []
            });
        }
        
        const userData = messageCount.get(senderId);
        userData.count++;
        userData.weeklyCount = (userData.weeklyCount || 0) + 1;
        userData.name = senderName;
        userData.dailyMessages = userData.dailyMessages || [];
        userData.dailyMessages.push(now);
        
        // Limpar mensagens antigas (mais de 24h)
        userData.dailyMessages = userData.dailyMessages.filter(time => now - time < 86400000);
        
        // Atualizar estatísticas horárias
        hourlyStats[hour]++;
        
        if (!text) return;
        
        logger.info(`Mensagem do grupo DESENVOLVIMENTO IA: ${text}`);
        
        // Anti-spam
        if (detectSpam(senderId, text)) {
            await sock.sendMessage(groupId, { 
                text: `⚠️ @${senderName} detectado spam! Evite repetir mensagens.`,
                mentions: [senderId]
            });
            return;
        }
        
        // Comandos de ranking e estatísticas
        if (text.toLowerCase().includes('/ranking') || text.toLowerCase().includes('ranking')) {
            const rankingText = generateRanking();
            await sock.sendMessage(groupId, { text: rankingText }, { quoted: message });
            return;
        }
        
        if (text.toLowerCase().includes('/stats')) {
            const statsText = generateStats();
            await sock.sendMessage(groupId, { text: statsText }, { quoted: message });
            return;
        }
        
        // Comando de lembrete
        if (text.toLowerCase().startsWith('/lembrete ')) {
            const parts = text.split(' ');
            if (parts.length >= 3) {
                const time = parts[1]; // ex: 30m, 1h
                const reminderText = parts.slice(2).join(' ');
                
                let minutes = 0;
                if (time.endsWith('m')) minutes = parseInt(time);
                if (time.endsWith('h')) minutes = parseInt(time) * 60;
                
                if (minutes > 0) {
                    setTimeout(async () => {
                        await sock.sendMessage(groupId, { 
                            text: `🔔 LEMBRETE: ${reminderText}\n\nSolicitado por: @${senderName}`,
                            mentions: [senderId]
                        });
                    }, minutes * 60000);
                    
                    await sock.sendMessage(groupId, { 
                        text: `✅ Lembrete agendado para ${minutes} minutos!` 
                    }, { quoted: message });
                    return;
                }
            }
            await sock.sendMessage(groupId, { 
                text: '⚠️ Uso: /lembrete 30m texto do lembrete' 
            });
            return;
        }
        
        // Comando de sorteio
        if (text.toLowerCase().includes('/sorteio')) {
            const members = Array.from(messageCount.keys());
            if (members.length > 0) {
                const winner = members[Math.floor(Math.random() * members.length)];
                const winnerData = messageCount.get(winner);
                await sock.sendMessage(groupId, { 
                    text: `🎉 SORTEIO!\n\nVencedor: @${winnerData.name}\n🎆 Parabéns!`,
                    mentions: [winner]
                });
            }
            return;
        }
        
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
