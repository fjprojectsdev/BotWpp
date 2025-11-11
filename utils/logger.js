import fs from 'fs';
import path from 'path';

const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, `bot-${new Date().toISOString().split('T')[0]}.log`);

// Cria diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const logger = {
    info: (message, data = null) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] INFO: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
        console.log(`ℹ️ ${message}`);
        fs.appendFileSync(LOG_FILE, logEntry);
    },
    
    error: (message, error = null) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ERROR: ${message}${error ? ` | Error: ${error.message || error}` : ''}\n`;
        console.error(`❌ ${message}`);
        fs.appendFileSync(LOG_FILE, logEntry);
    },
    
    warn: (message, data = null) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] WARN: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
        console.warn(`⚠️ ${message}`);
        fs.appendFileSync(LOG_FILE, logEntry);
    },
    
    success: (message, data = null) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] SUCCESS: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
        console.log(`✅ ${message}`);
        fs.appendFileSync(LOG_FILE, logEntry);
    }
};