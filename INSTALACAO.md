# 📦 Guia de Instalação - Node.js e Configuração

## 🔧 Instalação do Node.js

### Para macOS (seu sistema atual)

#### Opção 1: Homebrew (Recomendado)
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node
```

#### Opção 2: Instalador Oficial
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador
4. Siga as instruções

#### Opção 3: NVM (Node Version Manager)
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal ou executar:
source ~/.zshrc

# Instalar Node.js
nvm install --lts
nvm use --lts
```

### Verificar Instalação
```bash
node --version
npm --version
```

## 🚀 Configuração do Projeto

Após instalar o Node.js:

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar chave da YouTube API:**
   - Abra `frontend/script.js`
   - Substitua a linha 2 pela sua chave:
   ```javascript
   const API_KEY = "SUA_CHAVE_AQUI";
   ```

3. **Iniciar o servidor:**
   ```bash
   npm start
   ```

4. **Acessar a aplicação:**
   - Abra: http://localhost:3000

## 🔑 Como obter a chave da YouTube Data API v3

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**
4. Vá em "Credenciais"
5. Clique em "Criar credenciais" → "Chave de API"
6. Copie a chave gerada

## 🐛 Problemas Comuns

### "command not found: npm"
- Node.js não está instalado
- Siga as instruções de instalação acima

### "Permission denied"
```bash
sudo chown -R $USER /usr/local/lib/node_modules
```

### "EACCES: permission denied"
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se o npm está instalado: `npm --version`
3. Consulte a documentação oficial: https://nodejs.org/ 