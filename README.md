# iMavyBot - WhatsApp Bot com IA

Bot inteligente para WhatsApp integrado com Hugging Face AI, desenvolvido com Node.js e Baileys.

## 🚀 Características

- **IA Integrada**: Usa modelos Hugging Face para respostas inteligentes
- **Segurança Robusta**: Validação de entrada, rate limiting e sanitização
- **Logging Completo**: Sistema de logs estruturado
- **Agendamento**: Mensagens automáticas programadas
- **Tratamento de Erros**: Recuperação automática de falhas
- **Testes**: Cobertura de testes unitários

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- Conta no Hugging Face com API key
- WhatsApp Business ou pessoal

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd BOT2
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
HUGGING_FACE_API=sua_api_key_aqui
TARGET_GROUP_ID=id_do_grupo_alvo
ADMIN_ID=seu_id_de_admin
BOT_TRIGGER=iMavy
```

## 🚀 Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testes
```bash
npm test
```

## 📱 Como Usar o Bot

1. **Ativação**: Digite `iMavy` seguido da sua mensagem
2. **Exemplo**: `iMavy como está o tempo hoje?`
3. **Comandos Admin**: Apenas administradores podem usar comandos de configuração

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `HUGGING_FACE_API` | API Key do Hugging Face | Obrigatório |
| `TARGET_GROUP_ID` | ID do grupo alvo | - |
| `ADMIN_ID` | ID do administrador | - |
| `BOT_TRIGGER` | Palavra para ativar o bot | iMavy |
| `MODEL_ID` | Modelo da IA | meta-llama/Llama-3.1-8B-Instruct |
| `MAX_TOKENS` | Máximo de tokens | 256 |
| `TEMPERATURE` | Criatividade da IA | 0.7 |

### Agendamento

- **Fechamento**: 00:00 (horário de Brasília)
- **Abertura**: 07:00 (horário de Brasília)

## 🔒 Segurança

- **Validação de Entrada**: Remove caracteres perigosos
- **Rate Limiting**: Previne spam
- **Grupos Autorizados**: Apenas grupos configurados
- **Logs de Segurança**: Monitora tentativas suspeitas

## 📁 Estrutura do Projeto

```
BOT2/
├── functions/          # Módulos funcionais
│   ├── autoReply.js   # Respostas automáticas
│   ├── groupResponder.js # Processamento de grupos
│   ├── huggingFace.js # API Router
│   ├── huggingFaceBot.js # API Inference
│   ├── scheduler.js   # Agendamento
│   └── welcomeMessage.js # Boas-vindas
├── utils/             # Utilitários
│   ├── logger.js      # Sistema de logs
│   └── validator.js   # Validações
├── tests/             # Testes unitários
├── logs/              # Arquivos de log
├── auth_info/         # Dados de autenticação
├── .env               # Variáveis de ambiente
├── .env.example       # Exemplo de configuração
├── .gitignore         # Arquivos ignorados
├── package.json       # Dependências
└── index.js           # Arquivo principal
```

## 🐛 Solução de Problemas

### Bot não responde
1. Verifique se a API key está correta
2. Confirme se o trigger está sendo usado
3. Verifique os logs em `logs/`

### Erro de conexão
1. Escaneie o QR code novamente
2. Verifique a conexão com internet
3. Reinicie o bot

### Rate limit
- Aguarde alguns minutos antes de tentar novamente
- Verifique se não há spam de mensagens

## 📊 Logs

Os logs são salvos em `logs/bot-YYYY-MM-DD.log` com:
- Informações de conexão
- Mensagens processadas
- Erros e warnings
- Atividade de segurança

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.