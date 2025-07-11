# 🚀 Guia de Deploy - Watchlist v3

Este guia te ajudará a disponibilizar sua aplicação para que qualquer computador possa acessá-la.

## 📋 Pré-requisitos

1. **Conta no GitHub** - Para hospedar o código
2. **Chave da YouTube API** - Já configurada no `frontend/script.js`
3. **Node.js** - Para desenvolvimento local

## 🌐 Opções de Deploy

### 1. **Render (Recomendado - Gratuito)**

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Deploy automático
- ✅ SSL automático
- ✅ Fácil configuração

**Passos:**

1. **Fazer push para o GitHub:**
```bash
git add .
git commit -m "Preparando para deploy"
git push origin main
```

2. **Criar conta no Render:**
   - Acesse: https://render.com
   - Faça login com GitHub

3. **Criar novo Web Service:**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - **Name:** `watchlistv3`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** `Free`

4. **Configurar variáveis de ambiente:**
   - Vá em "Environment"
   - Adicione:
     ```
     NODE_ENV=production
     JWT_SECRET=sua_chave_secreta_muito_segura_aqui
     ```

5. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o deploy (2-3 minutos)

**URL final:** `https://seu-app.onrender.com`

---

### 2. **Railway (Alternativa Gratuita)**

**Vantagens:**
- ✅ Gratuito para projetos pequenos
- ✅ Deploy muito rápido
- ✅ Integração com GitHub

**Passos:**

1. **Acesse:** https://railway.app
2. **Faça login com GitHub**
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório**
6. **Aguarde o deploy automático**

**URL final:** `https://seu-app.railway.app`

---

### 3. **Vercel (Para Frontend + API)**

**Vantagens:**
- ✅ Excelente performance
- ✅ Deploy instantâneo
- ✅ CDN global

**Passos:**

1. **Instale Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Siga as instruções no terminal**

**URL final:** `https://seu-app.vercel.app`

---

### 4. **Heroku (Pago, mas muito estável)**

**Vantagens:**
- ✅ Muito estável
- ✅ Excelente documentação
- ✅ Integração com GitHub

**Passos:**

1. **Criar conta:** https://heroku.com
2. **Instalar CLI:**
```bash
npm install -g heroku
```

3. **Login:**
```bash
heroku login
```

4. **Criar app:**
```bash
heroku create seu-app-name
```

5. **Deploy:**
```bash
git push heroku main
```

6. **Configurar variáveis:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_secreta
```

**URL final:** `https://seu-app-name.herokuapp.com`

---

## 🔧 Configurações Importantes

### 1. **Atualizar URL da API no Frontend**

Após o deploy, você precisa atualizar a URL da API no `frontend/script.js`:

```javascript
// Mudar de:
const API_BASE_URL = 'http://localhost:3000/api';

// Para:
const API_BASE_URL = 'https://seu-app.onrender.com/api';
```

### 2. **Configurar CORS (se necessário)**

Se tiver problemas de CORS, atualize o `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://seu-dominio.com', 'https://www.seu-dominio.com'],
  credentials: true
}));
```

### 3. **Variáveis de Ambiente**

Configure estas variáveis no seu serviço de deploy:

```bash
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
PORT=3000
```

## 🧪 Testando o Deploy

1. **Acesse a URL do seu app**
2. **Teste o registro de usuário**
3. **Teste o login**
4. **Teste adicionar vídeos à biblioteca**
5. **Teste criar playlists**

## 🔍 Troubleshooting

### Problema: "Cannot find module"
**Solução:** Verifique se o `package.json` está na raiz do projeto

### Problema: "Port already in use"
**Solução:** Configure a variável `PORT` no seu serviço de deploy

### Problema: "CORS error"
**Solução:** Configure o CORS corretamente no `backend/server.js`

### Problema: "Database error"
**Solução:** Verifique se o banco SQLite está sendo criado corretamente

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do seu serviço de deploy
2. Teste localmente primeiro
3. Verifique se todas as dependências estão no `package.json`

## 🎉 Pronto!

Após seguir estes passos, sua aplicação estará disponível para qualquer pessoa acessar pela internet! 