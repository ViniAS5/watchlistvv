#!/bin/bash

echo "🚀 Iniciando processo de deploy..."

# Verificar se o git está configurado
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Erro: Este diretório não é um repositório git"
    echo "Execute: git init && git remote add origin SEU_REPOSITORIO"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "📝 Há mudanças não commitadas. Fazendo commit..."
    git add .
    git commit -m "Deploy automático - $(date)"
fi

# Fazer push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin main

echo "✅ Deploy iniciado!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://render.com"
echo "2. Faça login com GitHub"
echo "3. Clique em 'New +' → 'Web Service'"
echo "4. Conecte seu repositório"
echo "5. Configure:"
echo "   - Name: watchlistv3"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "6. Clique em 'Create Web Service'"
echo ""
echo "🌐 Sua aplicação estará disponível em: https://seu-app.onrender.com" 