// 📝 Arquivo de Exemplo de Configuração
// Copie este arquivo para config.js e configure suas chaves

module.exports = {
  // 🔑 YouTube Data API v3
  // Obtenha sua chave em: https://console.cloud.google.com/
  YOUTUBE_API_KEY: "SUA_CHAVE_AQUI",
  
  // 🔐 JWT Secret (para produção, use uma chave mais segura)
  JWT_SECRET: "sua_chave_secreta_muito_segura_aqui_2024",
  
  // 🌐 Configurações do Servidor
  PORT: 3000,
  
  // 🗄️ Configurações do Banco de Dados
  DATABASE_PATH: "./database.sqlite",
  
  // 🛡️ Configurações de Segurança
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
  },
  
  // 🔒 Configurações de CORS
  CORS_ORIGIN: "*", // Em produção, especifique domínios específicos
  
  // 📧 Configurações de Email (para futuras funcionalidades)
  EMAIL: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "seu-email@gmail.com",
      pass: "sua-senha-de-app"
    }
  }
};

// 📋 Como usar:
// 1. Copie este arquivo: cp config.example.js config.js
// 2. Edite config.js com suas configurações
// 3. No backend/server.js, importe: const config = require('../config');
// 4. Use: const PORT = config.PORT; 