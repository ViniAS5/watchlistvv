# 🎬 Watchlist - Sistema de Playlist YouTube com Autenticação

Um sistema completo de playlist YouTube onde cada usuário tem sua própria biblioteca e fila de reprodução, com sistema de login e senha.

## ✨ Funcionalidades

- 🔐 **Sistema de Autenticação**: Registro e login de usuários
- 📚 **Biblioteca Pessoal**: Cada usuário tem sua própria biblioteca de vídeos
- 📋 **Fila de Reprodução**: Playlist individual para cada usuário
- 🏷️ **Sistema de Tags**: Organize vídeos por categorias
- 💬 **Comentários**: Adicione notas pessoais aos vídeos
- ✅ **Controle de Visualização**: Marque vídeos como assistidos
- 🎯 **Filtros**: Filtre vídeos por tags
- 📱 **Interface Responsiva**: Funciona em desktop e mobile

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript** - Lógica da aplicação
- **YouTube Data API v3** - Informações dos vídeos
- **YouTube IFrame API** - Player de vídeos

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm (vem com o Node.js)
- Chave da YouTube Data API v3

### Passos

1. **Clone ou baixe o projeto**
   ```bash
   cd watchlistv3
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a chave da YouTube API**
   - Abra o arquivo `frontend/script.js`
   - Substitua a linha 2 pela sua chave:
   ```javascript
   const API_KEY = "SUA_CHAVE_AQUI";
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```

5. **Acesse a aplicação**
   - Abra seu navegador
   - Vá para: `http://localhost:3000`

## 🔑 Como obter a chave da YouTube Data API v3

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**
4. Vá em "Credenciais"
5. Clique em "Criar credenciais" → "Chave de API"
6. Copie a chave gerada

## 🚀 Como usar

### Primeiro Acesso
1. Acesse `http://localhost:3000`
2. Clique em "Criar conta"
3. Preencha: Nome, Email e Senha
4. Clique em "Criar Conta"

### Adicionando Vídeos à Biblioteca
1. Faça login na sua conta
2. Na seção "Biblioteca", cole a URL de um vídeo do YouTube
3. Adicione tags (ex: música, tutorial, entretenimento)
4. Clique em "Adicionar à Biblioteca"

### Criando sua Playlist
1. Na biblioteca, clique no menu (⋮) de um vídeo
2. Selecione "+ Adicionar à Fila"
3. O vídeo aparecerá na seção "Fila"
4. Clique em "▶ Play" para começar a reprodução

### Organizando Vídeos
- **Tags**: Use tags para categorizar vídeos
- **Filtros**: Use o dropdown para filtrar por categoria
- **Comentários**: Adicione notas pessoais aos vídeos
- **Marcar como assistido**: Controle o que você já viu

## 📁 Estrutura do Projeto

```
watchlistv3/
├── frontend/
│   ├── index.html          # Interface principal
│   └── script.js           # Lógica do frontend
├── backend/
│   ├── server.js           # Servidor principal
│   ├── database.js         # Configuração do banco
│   ├── auth.js             # Autenticação JWT
│   └── routes/
│       ├── auth.js         # Rotas de autenticação
│       └── playlists.js    # Rotas de playlist/biblioteca
├── package.json            # Dependências
├── database.sqlite         # Banco de dados (criado automaticamente)
└── README.md              # Este arquivo
```

## 🔧 Configurações Avançadas

### Mudando a Porta
Edite o arquivo `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Mude 3000 para a porta desejada
```

### Configuração de Produção
1. **Variáveis de Ambiente**: Use `.env` para chaves secretas
2. **HTTPS**: Configure SSL para produção
3. **Banco de Dados**: Considere usar PostgreSQL ou MySQL para produção
4. **Rate Limiting**: Ajuste os limites de requisições

### Personalização
- **Cores**: Edite as variáveis CSS no `frontend/index.html`
- **Logo**: Substitua o ícone do YouTube por sua logo
- **Funcionalidades**: Adicione novas features no backend

## 🐛 Solução de Problemas

### Erro: "YouTube Data API quota exceeded"
- A API gratuita tem limite de 10.000 requisições/dia
- Considere implementar cache local
- Ou solicite aumento de quota no Google Cloud Console

### Erro: "Database is locked"
- O SQLite pode ter problemas com múltiplas conexões
- Reinicie o servidor
- Em produção, use PostgreSQL ou MySQL

### Vídeos não carregam
- Verifique se a chave da API está correta
- Confirme se a URL do vídeo é válida
- Verifique o console do navegador para erros

## 🔒 Segurança

- ✅ Senhas são hasheadas com bcrypt
- ✅ Autenticação via JWT
- ✅ Rate limiting para prevenir spam
- ✅ Validação de dados no backend
- ✅ CORS configurado adequadamente

## 📈 Próximas Funcionalidades

- [ ] Compartilhamento de playlists
- [ ] Importação de playlists do YouTube
- [ ] Notificações de novos vídeos
- [ ] Modo offline
- [ ] Temas personalizáveis
- [ ] Estatísticas de visualização

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas:
1. Verifique a seção "Solução de Problemas"
2. Abra uma issue no GitHub
3. Consulte a documentação da YouTube Data API

---

**Desenvolvido com ❤️ para organizar suas playlists do YouTube!** 