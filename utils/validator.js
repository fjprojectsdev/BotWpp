import { logger } from './logger.js';

/**
 * Valida entrada de texto para prevenir ataques
 */
export function validateInput(text) {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: 'Texto inválido' };
    }
    
    // Remove caracteres perigosos
    const sanitized = text.replace(/[<>\"'&]/g, '');
    
    // Verifica tamanho máximo
    if (sanitized.length > 1000) {
        return { valid: false, error: 'Texto muito longo' };
    }
    
    return { valid: true, sanitized };
}

/**
 * Rate limiting simples
 */
const rateLimiter = new Map();

export function checkRateLimit(userId, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const userRequests = rateLimiter.get(userId) || [];
    
    // Remove requests antigas
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
        logger.warn(`Rate limit excedido para usuário: ${userId}`);
        return false;
    }
    
    validRequests.push(now);
    rateLimiter.set(userId, validRequests);
    return true;
}

/**
 * Valida se é um grupo autorizado
 */
export function validateGroup(groupId, allowedGroups) {
    if (!allowedGroups.includes(groupId)) {
        logger.warn(`Tentativa de acesso a grupo não autorizado: ${groupId}`);
        return false;
    }
    return true;
}