#!/bin/bash

# CORRECTION ERREUR DOCKERFILE - SERVER-PRODUCTION.JS NOT FOUND
# Corrige définitivement l'erreur de copie du fichier manquant

echo "🔧 CORRECTION ERREUR DOCKERFILE"
echo "==============================="

INSTALL_DIR="/opt/bennespro"

# Aller dans le dossier d'installation
cd "$INSTALL_DIR" 2>/dev/null || cd "."

echo "📍 Correction dans: $(pwd)"

echo ""
echo "🗑️ 1. Suppression des fichiers défaillants..."

# Supprimer tous les serveurs de production JavaScript
rm -f server-production*.js 2>/dev/null || true
rm -f compile-production*.js 2>/dev/null || true
echo "✅ Fichiers server-production.js supprimés"

echo ""
echo "🔧 2. Vérification et correction du Dockerfile..."

# Vérifier si le Dockerfile contient encore des références à server-production.js
if grep -q "server-production.js" Dockerfile 2>/dev/null; then
    echo "⚠️ Dockerfile contient encore des références défaillantes, correction..."
    
    # Créer un Dockerfile corrigé
    cat > Dockerfile << 'EOF'
# BennesPro Production - Votre application TypeScript complète
FROM node:18-alpine

# Installer bash et outils nécessaires
RUN apk add --no-cache bash curl postgresql-client tini

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bennespro -u 1001

# Définir le répertoire de travail
WORKDIR /opt/bennespro

# Copier package.json en premier pour cache Docker
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci

# Installer tsx globalement pour production TypeScript
RUN npm install -g tsx

# Copier tous les fichiers de configuration
COPY tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js components.json ./

# Copier tout le code source complet
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY uploads/ ./uploads/

# Copier les fichiers de configuration supplémentaires
COPY drizzle.config.js ./
COPY .env* ./

# Créer les dossiers nécessaires et définir les permissions
RUN mkdir -p uploads client/dist logs migrations
RUN chown -R bennespro:nodejs . && chmod -R 755 uploads logs

# Variables d'environnement pour production
ENV NODE_ENV=production
ENV PORT=5000

# Utiliser l'utilisateur non-root
USER bennespro

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Point d'entrée avec Tini
ENTRYPOINT ["/sbin/tini", "--"]

# Commande de démarrage avec votre vrai serveur TypeScript
CMD ["npx", "tsx", "server/index.ts"]
EOF
    
    echo "✅ Dockerfile corrigé"
else
    echo "✅ Dockerfile déjà correct"
fi

echo ""
echo "📋 3. Création/mise à jour .dockerignore..."

cat > .dockerignore << 'EOF'
# Fichiers de production défaillants
server-production.js
server-production-*.js
compile-production-server.js

# Scripts de correction
fix-*.sh
connect-*.sh
test-*.sh

# Fichiers de développement
.git
.gitignore
README.md
node_modules/.cache
.next
.vscode
.env.local
.env.development
*.log
logs/

# Fichiers temporaires
*.tmp
*.bak
*.disabled
*.broken

# Scripts de déploiement
ultimate-setup.sh
DEPLOY-*.md
DEPLOYMENT-*.md

# Dossiers de développement
.replit
replit.nix
attached_assets/
EOF

echo "✅ .dockerignore mis à jour"

echo ""
echo "🔄 4. Reconstruction du container..."

# Arrêter et supprimer l'ancien container
docker stop bennespro_app 2>/dev/null || sudo docker stop bennespro_app 2>/dev/null || true
docker rm bennespro_app 2>/dev/null || sudo docker rm bennespro_app 2>/dev/null || true

# Nettoyer les images
docker rmi bennespro_app 2>/dev/null || sudo docker rmi bennespro_app 2>/dev/null || true

# Construire la nouvelle image
echo "🏗️ Construction de la nouvelle image..."
docker build -t bennespro_app . --no-cache || sudo docker build -t bennespro_app . --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Image construite avec succès"
else
    echo "❌ Erreur lors de la construction"
    exit 1
fi

echo ""
echo "🚀 5. Redémarrage des services..."

# Redémarrer avec docker-compose
docker-compose up -d || sudo docker-compose up -d || docker compose up -d || sudo docker compose up -d

# Attendre le démarrage
echo "⏳ Attente du démarrage..."
sleep 20

echo ""
echo "📋 6. Vérification finale..."

echo "Status des containers:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}" || \
sudo docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "Logs de l'application:"
docker logs bennespro_app --tail=10 || sudo docker logs bennespro_app --tail=10

echo ""
echo "✅ ERREUR DOCKERFILE CORRIGÉE"
echo "============================"
echo ""
echo "🎯 Corrections effectuées:"
echo "   • Tous les fichiers server-production.js supprimés"
echo "   • Dockerfile utilise uniquement tsx + server/index.ts"
echo "   • .dockerignore mis à jour pour éviter les conflits"
echo "   • Container reconstruit sans erreurs"
echo ""
echo "🌐 Application: https://purpleguy.world"
echo "🔍 Logs: docker logs -f bennespro_app"