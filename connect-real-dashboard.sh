#!/bin/bash

# SCRIPT DE CONNEXION DU VRAI DASHBOARD BENNESPRO
# Remplace l'interface générique par votre vraie application développée

echo "🔧 CONNEXION DU VRAI DASHBOARD BENNESPRO"
echo "========================================"

INSTALL_DIR="/opt/bennespro"
cd "$INSTALL_DIR" || exit 1

echo "📋 1. Vérification de l'application existante..."

# Vérifier les containers
echo "Status containers:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}" || \
sudo docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "🔄 2. Remplacement du serveur générique par le vrai serveur BennesPro..."

# Créer un serveur de production qui utilise TSX pour votre code TypeScript
cat > server-production-bennespro.js << 'EOF'
#!/usr/bin/env node

/**
 * Serveur BennesPro Production - Utilise votre vrai code TypeScript
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 DÉMARRAGE SERVEUR BENNESPRO PRODUCTION');
console.log('==========================================');

// Démarrer le serveur TypeScript avec tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000',
  }
});

// Gérer les signaux de fermeture
process.on('SIGTERM', () => {
  console.log('📤 Arrêt du serveur...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📤 Arrêt du serveur...');
  serverProcess.kill('SIGINT');
});

serverProcess.on('exit', (code) => {
  console.log(`📋 Serveur arrêté avec le code: ${code}`);
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('⚠️ Erreur serveur:', error);
  process.exit(1);
});
EOF

echo "✅ Nouveau serveur créé: server-production-bennespro.js"

echo ""
echo "🔧 3. Mise à jour du Dockerfile pour utiliser votre vrai serveur..."

# Sauvegarder l'ancien Dockerfile
cp Dockerfile Dockerfile.backup

# Créer un nouveau Dockerfile qui utilise votre serveur réel
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Installer bash et autres outils nécessaires
RUN apk add --no-cache bash curl postgresql-client

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Définir le répertoire de travail
WORKDIR /opt/bennespro

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Installer les dépendances
RUN npm ci --only=production

# Installer tsx globalement pour la production TypeScript
RUN npm install -g tsx

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads && chown -R nextjs:nodejs uploads
RUN mkdir -p client/dist && chown -R nextjs:nodejs client

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 5000

# Santé check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Commande de démarrage avec votre vrai serveur TypeScript
CMD ["node", "server-production-bennespro.js"]
EOF

echo "✅ Dockerfile mis à jour pour utiliser votre serveur TypeScript"

echo ""
echo "🔄 4. Reconstruction et redémarrage avec votre vraie application..."

# Arrêter l'ancien container
echo "🛑 Arrêt de l'ancien container..."
docker stop bennespro_app 2>/dev/null || sudo docker stop bennespro_app 2>/dev/null || true
docker rm bennespro_app 2>/dev/null || sudo docker rm bennespro_app 2>/dev/null || true

# Reconstruire l'image avec votre vrai code
echo "🏗️ Reconstruction de l'image avec votre dashboard..."
docker build -t bennespro_app . --no-cache || sudo docker build -t bennespro_app . --no-cache

# Redémarrer avec docker-compose
echo "🚀 Redémarrage des services..."
docker-compose up -d || sudo docker-compose up -d || docker compose up -d || sudo docker compose up -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérifier le statut
echo ""
echo "📋 Vérification du statut:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}" || \
sudo docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "📋 Logs de l'application:"
docker logs bennespro_app --tail=20 || sudo docker logs bennespro_app --tail=20

echo ""
echo "✅ CONNEXION DU VRAI DASHBOARD TERMINÉE"
echo "======================================"
echo ""
echo "🌐 Votre vraie application BennesPro avec tous vos développements"
echo "   devrait maintenant être accessible à: https://purpleguy.world"
echo ""
echo "🔍 Fonctionnalités connectées:"
echo "   - Dashboard client avec toutes vos pages"
echo "   - Interface d'administration complète"
echo "   - Système de réservation avec Google Maps"
echo "   - Gestion des FIDs et documents"
echo "   - Toutes vos fonctionnalités développées"
echo ""
echo "🧪 Pour tester:"
echo "   curl https://purpleguy.world/api/health"
echo ""
echo "📋 Pour surveiller:"
echo "   docker logs -f bennespro_app"