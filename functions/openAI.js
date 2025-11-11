import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { validateInput } from '../utils/validator.js';
import { tryGroq, tryReplicate, tryMistral, tryFreeGPT } from './freeAPIs.js';

const REQUEST_TIMEOUT = 8000;

/**
 * API gratuita do Perplexity
 */
async function tryPerplexity(prompt) {
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        }
    } catch (error) {
        logger.warn('Perplexity falhou');
    }
    return null;
}

/**
 * API do DeepSeek (gratuita)
 */
async function tryDeepSeek(prompt) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        }
    } catch (error) {
        logger.warn('DeepSeek falhou');
    }
    return null;
}

/**
 * Gera resposta inteligente baseada em padrões
 */
function generateSmartResponse(prompt) {
    const input = prompt.toLowerCase();
    
    // Saudações
    if (input.includes('oi') || input.includes('olá') || input.includes('hello') || input.includes('boa')) {
        const greetings = [
            '👋 Olá! Como posso ajudar você hoje?',
            '😊 Oi! Em que posso ser útil?',
            '🤖 Olá! Estou aqui para conversar!'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Perguntas sobre tempo/clima
    if (input.includes('tempo') || input.includes('clima') || input.includes('chuva') || input.includes('sol')) {
        return '🌤️ Não tenho acesso a dados meteorológicos, mas recomendo verificar um app de clima!';
    }
    
    // Hora atual
    if (input.includes('hora') || input.includes('horário')) {
        const now = new Date().toLocaleTimeString('pt-BR');
        return `🕐 Agora são ${now}`;
    }
    
    // Data atual
    if (input.includes('data') || input.includes('dia') || input.includes('hoje')) {
        const today = new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        return `📅 Hoje é ${today}`;
    }
    
    // Estado/bem-estar
    if (input.includes('como está') || input.includes('tudo bem') || input.includes('como vai')) {
        const responses = [
            '😊 Estou funcionando perfeitamente! E você?',
            '🤖 Tudo ótimo por aqui! Como posso ajudar?',
            '✨ Estou bem e pronto para conversar!'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Ajuda
    if (input.includes('ajuda') || input.includes('help') || input.includes('socorro')) {
        return '🆘 Comandos disponíveis:\n\n🔒 "fechar grupo" ou "/fechar" - Fecha o grupo\n🔓 "abrir grupo" ou "/abrir" - Abre o grupo\n🤖 "iMavy [mensagem]" - Conversar com IA\n\nPosso ajudar com conversas, informações, piadas e muito mais!';
    }
    
    // Agradecimentos
    if (input.includes('obrigad') || input.includes('valeu') || input.includes('thanks')) {
        const thanks = [
            '😊 De nada! Fico feliz em ajudar!',
            '🤗 Por nada! Sempre à disposição!',
            '✨ Foi um prazer ajudar!'
        ];
        return thanks[Math.floor(Math.random() * thanks.length)];
    }
    
    // Piadas
    if (input.includes('piada') || input.includes('engraçado') || input.includes('humor')) {
        const jokes = [
            '😄 Por que os pássaros voam para o sul? Porque é longe demais para ir andando!',
            '😂 O que o pato disse para a pata? Vem quá!',
            '🤣 Por que o livro de matemática estava triste? Tinha muitos problemas!',
            '😆 O que a impressora falou para a outra? Essa folha é sua ou é impressão minha?',
            '🤪 Por que o café foi ao psicólogo? Porque estava depressivo!'
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Perguntas sobre o bot
    if (input.includes('quem é você') || input.includes('o que você é') || input.includes('seu nome')) {
        return '🤖 Sou o iMavyBot! Um assistente virtual inteligente.\n\n📋 Comandos:\n• fechar grupo / /fechar\n• abrir grupo / /abrir\n• iMavy [mensagem] para conversar';
    }
    
    // Despedidas
    if (input.includes('tchau') || input.includes('bye') || input.includes('até logo')) {
        const goodbyes = [
            '👋 Tchau! Foi ótimo conversar!',
            '😊 Até logo! Volte sempre!',
            '🤖 Tchau! Estarei aqui quando precisar!'
        ];
        return goodbyes[Math.floor(Math.random() * goodbyes.length)];
    }
    
    // Respostas contextuais inteligentes
    const contextualResponses = [
        '🤔 Interessante! Me conte mais sobre isso.',
        '💭 Entendo seu ponto de vista. É uma questão complexa!',
        '🧠 Boa pergunta! Isso me faz refletir.',
        '💡 Vejo o que você quer dizer. Perspectiva interessante!',
        '🎯 Essa é uma observação muito pertinente!',
        '🤖 Compreendo! É um assunto fascinante.',
        '✨ Que pensamento interessante! Continue...',
        '🔍 Hmm, deixe-me processar isso. É uma boa questão!'
    ];
    
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
}

/**
 * Função principal para gerar respostas
 */
export async function generateAIResponse(prompt) {
    try {
        const validation = validateInput(prompt);
        if (!validation.valid) {
            return '🤖 Mensagem inválida.';
        }
        
        const sanitizedPrompt = validation.sanitized;
        logger.info('Gerando resposta inteligente');
        
        // Tenta APIs externas em ordem
        const apis = [tryPerplexity, tryDeepSeek, tryMistral, tryReplicate, tryFreeGPT, tryGroq];
        
        for (const apiFunc of apis) {
            try {
                const apiResponse = await Promise.race([
                    apiFunc(sanitizedPrompt),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT))
                ]);
                
                if (apiResponse) {
                    logger.success('Resposta gerada via API externa');
                    return apiResponse;
                }
            } catch (error) {
                continue;
            }
        }
        
        // Fallback para resposta inteligente local
        const smartResponse = generateSmartResponse(sanitizedPrompt);
        logger.success('Resposta gerada localmente');
        return smartResponse;
        
    } catch (error) {
        logger.error('Erro ao gerar resposta', error);
        return generateSmartResponse(prompt);
    }
}