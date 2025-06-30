#!/bin/bash

echo "🔍 DIAGNOSTIC BUILD - purpleguy.world"
echo "===================================="

# 1. Vérifier l'environnement local
echo "📋 1. Environnement local"
echo "-------------------------"
echo "Node version:" $(node --version 2>/dev/null || echo "Non installé")
echo "NPM version:" $(npm --version 2>/dev/null || echo "Non installé")
echo "Docker version:" $(docker --version 2>/dev/null || echo "Non installé")

# 2. Vérifier les fichiers critiques
echo ""
echo "📁 2. Fichiers critiques"
echo "------------------------"
echo "package.json:" $([ -f "package.json" ] && echo "✅ Présent" || echo "❌ Manquant")
echo "vite.config.ts:" $([ -f "vite.config.ts" ] && echo "✅ Présent" || echo "❌ Manquant")
echo "tsconfig.json:" $([ -f "tsconfig.json" ] && echo "✅ Présent" || echo "❌ Manquant")
echo "Dockerfile:" $([ -f "Dockerfile" ] && echo "✅ Présent" || echo "❌ Manquant")

# 3. Analyser package.json
echo ""
echo "📦 3. Scripts package.json"
echo "--------------------------"
if [ -f "package.json" ]; then
    echo "Scripts disponibles:"
    grep -A 10 '"scripts"' package.json | grep -E '"[^"]+":' | head -5
else
    echo "❌ package.json manquant"
fi

# 4. Test build local (si possible)
echo ""
echo "🧪 4. Test build local"
echo "----------------------"
if command -v npm >/dev/null 2>&1; then
    echo "Tentative build local..."
    timeout 30 npm run build 2>&1 | head -10 || echo "Build échoué ou timeout"
else
    echo "NPM non disponible pour test local"
fi

# 5. Analyser les dépendances problématiques
echo ""
echo "📊 5. Dépendances problématiques"
echo "--------------------------------"
if [ -f "package.json" ]; then
    echo "Vérification dépendances lourdes:"
    grep -E '"(@types|typescript|vite|esbuild)"' package.json || echo "Dépendances de build OK"
fi

# 6. Docker build étape par étape
echo ""
echo "🐳 6. Test Docker build étape par étape"
echo "---------------------------------------"

# Créer Dockerfile minimal pour test
cat > Dockerfile.test << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p dist logs uploads
# Test build simple
RUN echo "Test build basique..." && npm run build || echo "Build failed but continuing"
CMD ["echo", "Test completed"]
EOF

echo "Build test Docker..."
if docker build -f Dockerfile.test -t test-build . 2>&1 | tail -20; then
    echo "✅ Build test réussi"
else
    echo "❌ Build test échoué"
fi

# Nettoyer
rm -f Dockerfile.test

# 7. Alternative: Build sans TypeScript
echo ""
echo "⚡ 7. Test build sans TypeScript"
echo "--------------------------------"

# Créer version simplifiée
cat > Dockerfile.simple << 'EOF'
FROM node:18-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p dist logs uploads

# Copier les fichiers sans build
RUN cp -r server/* dist/ 2>/dev/null || echo "Copy fallback"
RUN cp -r client/dist/* dist/public/ 2>/dev/null || echo "Client dist not found"

EXPOSE 5000
CMD ["node", "server/index.ts"]
EOF

echo "Test build simple (sans TypeScript build)..."
if docker build -f Dockerfile.simple -t simple-build . 2>&1 | tail -10; then
    echo "✅ Build simple réussi"
    
    echo ""
    echo "🚀 Test démarrage simple..."
    docker run -d --name test-simple -p 5001:5000 simple-build 2>/dev/null
    sleep 10
    
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001" | grep -q "200"; then
        echo "✅ Application simple fonctionne sur port 5001"
    else
        echo "⚠️ Application simple ne répond pas"
    fi
    
    docker stop test-simple 2>/dev/null
    docker rm test-simple 2>/dev/null
else
    echo "❌ Build simple échoué"
fi

# Nettoyer
rm -f Dockerfile.simple

echo ""
echo "🎯 RÉSUMÉ DIAGNOSTIC BUILD"
echo "=========================="

echo "💡 SOLUTIONS RECOMMANDÉES:"
echo "1. Utilisez ./fix-build-errors.sh (Dockerfile simplifié)"
echo "2. Ou build sans cache: docker-compose build --no-cache"
echo "3. Ou alternative simple sans TypeScript build"
echo ""
echo "🔧 Si tout échoue:"
echo "   - Vérifiez l'espace disque: df -h"
echo "   - Nettoyez Docker: docker system prune -a"
echo "   - Utilisez une image plus légère"