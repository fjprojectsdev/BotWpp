import fetch from 'node-fetch';
import 'dotenv/config';
import { logger } from '../utils/logger.js';
import { validateInput } from '../utils/validator.js';

const HF_API = process.env.HUGGING_FACE_API;
const ROUTER_URL = 'https://router.huggingface.co/hf-inference/gpt-oss-20b';
const REQUEST_TIMEOUT = 25000;

/**
 * Cria timeout para requisições
 */
function createTimeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), ms);
    });
}

/**
 * Gera resposta usando Hugging Face Router (GPT-OSS-20B)
 * @param {string} prompt Texto de entrada
 * @returns {string|null} Resposta gerada ou null
 */
export async function generateHuggingFaceReply(prompt) {
    try {
        if (!HF_API) {
            logger.error('API Key do Hugging Face não configurada');
            return null;
        }
        
        const validation = validateInput(prompt);
        if (!validation.valid) {
            logger.warn(`Prompt inválido: ${validation.error}`);
            return null;
        }
        
        const sanitizedPrompt = validation.sanitized;
        logger.info('Chamando Hugging Face Router API');
        
        const requestBody = {
            inputs: sanitizedPrompt,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
                return_full_text: false
            }
        };
        
        const fetchPromise = fetch(ROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API}`,
                'Content-Type': 'application/json',
                'User-Agent': 'iMavyBot/1.0'
            },
            body: JSON.stringify(requestBody)
        });
        
        const response = await Promise.race([
            fetchPromise,
            createTimeout(REQUEST_TIMEOUT)
        ]);
        
        if (!response.ok) {
            logger.error(`Router API retornou status ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        
        if (data?.error) {
            logger.error('Erro da Router API', data.error);
            return null;
        }
        
        const generatedText = data?.generated_text || data?.[0]?.generated_text;
        
        if (generatedText) {
            logger.success('Resposta gerada via Router API');
            return generatedText.trim();
        }
        
        logger.warn('Resposta vazia da Router API');
        return null;
        
    } catch (error) {
        if (error.message === 'Request timeout') {
            logger.error('Timeout na Router API');
        } else {
            logger.error('Erro ao chamar Router API', error);
        }
        return null;
    }
}
