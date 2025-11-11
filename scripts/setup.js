#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Configurando iMavyBot...\n');

// Verifica se o .env existe
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Arquivo .env criado a partir do .env.example');
        console.log('⚠️  IMPORTANTE: Configure suas variáveis de ambiente no arquivo .env\n');
    } else {
        console.log('❌ Arquivo .env.example não encontrado');
        process.exit(1);
    }
} else {
    console.log('✅ Arquivo .env já existe');
}

// Cria diretórios necessários
const directories = ['logs', 'auth_info'];

directories.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Diretório ${dir}/ criado`);
    } else {
        console.log(`✅ Diretório ${dir}/ já existe`);
    }
});

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure o arquivo .env com suas credenciais');
console.log('2. Execute: npm start');
console.log('3. Escaneie o QR code no WhatsApp');

console.log('\n📚 Documentação completa no README.md');