import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

/**
 * API gratuita do Groq
 */
async function tryGroq(prompt) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        }
    } catch (error) {
        logger.warn('Groq API falhou');
    }
    return null;
}

/**
 * API do Replicate (gratuita)
 */
async function tryReplicate(prompt) {
    try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'meta/llama-2-7b-chat',
                input: {
                    prompt: prompt,
                    max_new_tokens: 100
                }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.output?.join('')?.trim();
        }
    } catch (error) {
        logger.warn('Replicate falhou');
    }
    return null;
}

/**
 * API do Mistral (gratuita)
 */
async function tryMistral(prompt) {
    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistral-tiny',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        }
    } catch (error) {
        logger.warn('Mistral falhou');
    }
    return null;
}

/**
 * Resposta usando ChatGPT gratuito via web scraping
 */
async function tryFreeGPT(prompt) {
    try {
        const response = await fetch('https://chatgpt-api.shn.hk/v1/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        }
    } catch (error) {
        logger.warn('FreeGPT falhou');
    }
    return null;
}

export { tryGroq, tryReplicate, tryMistral, tryFreeGPT };