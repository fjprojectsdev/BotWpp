// huggingFaceBot.js - Redirecionamento para novo sistema
import { generateAIResponse } from './openAI.js';

/**
 * Função de compatibilidade - redireciona para o novo sistema
 */
export async function generateHuggingFaceReply(prompt) {
    return await generateAIResponse(prompt);
}
