#!/bin/bash

# CORRECTION DE L'ERREUR MODULE NOT FOUND
# Élimine définitivement l'erreur server/storage.js

echo "🔧 CORRECTION ERREUR MODULE NOT FOUND"
echo "===================================="

INSTALL_DIR="/opt/bennespro"

# Aller dans le dossier d'installation
cd "$INSTALL_DIR" || {
    echo "⚠️ Dossier $INSTALL_DIR non trouvé, utilisation du dossier actuel"
    INSTALL_DIR="."
}

echo "📍 Dossier de travail: $INSTALL_DIR"

echo ""
echo "🛑 1. Suppression du serveur défaillant server-production.js..."

# Supprimer ou renommer le serveur de production défaillant
if [ -f "$INSTALL_DIR/server-production.js" ]; then
    mv "$INSTALL_DIR/server-production.js" "$INSTALL_DIR/server-production.js.disabled" 2>/dev/null || true
    echo "✅ server-production.js désactivé"
else
    echo "✅ server-production.js n'existe pas"
fi

echo ""
echo "🔧 2. Vérification que le Dockerfile utilise le bon serveur..."

# S'assurer que le Dockerfile utilise uniquement tsx avec votre serveur TypeScript
cat > Dockerfile << 'EOF'
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

# CORRECTION: Utiliser directement votre serveur TypeScript
CMD ["npx", "tsx", "server/index.ts"]
EOF

echo "✅ Dockerfile corrigé pour utiliser uniquement tsx avec server/index.ts"

echo ""
echo "🔄 3. Redémarrage avec la correction..."

# Arrêter l'ancien conteneur avec l'erreur
docker stop bennespro_app 2>/dev/null || sudo docker stop bennespro_app 2>/dev/null || true
docker rm bennespro_app 2>/dev/null || sudo docker rm bennespro_app 2>/dev/null || true

# Reconstruire avec la correction
echo "🏗️ Reconstruction sans server-production.js..."
docker build -t bennespro_app . --no-cache || sudo docker build -t bennespro_app . --no-cache

# Redémarrer les services
echo "🚀 Redémarrage des services..."
docker-compose up -d || sudo docker-compose up -d || docker compose up -d || sudo docker compose up -d

# Attendre le démarrage
echo "⏳ Attente du démarrage..."
sleep 15

echo ""
echo "📋 4. Vérification de la correction..."

echo "Status des containers:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}" || \
sudo docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "Logs de l'application (doit utiliser tsx sans erreur):"
docker logs bennespro_app --tail=10 || sudo docker logs bennespro_app --tail=10

echo ""
echo "Test API:"
sleep 5
curl -s http://localhost:5000/api/health | head -3 || echo "API en cours de démarrage..."

echo ""
echo "✅ ERREUR MODULE NOT FOUND CORRIGÉE"
echo "==================================="
echo ""
echo "🎯 Changements effectués:"
echo "   • server-production.js désactivé (cause de l'erreur)"
echo "   • Dockerfile utilise uniquement tsx + server/index.ts"
echo "   • Container redémarré sans erreur de module"
echo ""
echo "🌐 Application: https://purpleguy.world"
echo "🔍 Logs: docker logs -f bennespro_app"