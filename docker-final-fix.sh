#!/bin/bash

# Solution finale pour résoudre l'erreur import.meta.dirname dans Docker
# Ce script applique un patch au fichier vite.ts pendant le build

echo "🔧 SOLUTION FINALE - Correction import.meta.dirname"
echo "================================================="

# 1. Arrêter tous les conteneurs
echo "📦 Arrêt des conteneurs..."
docker-compose down

# 2. Nettoyer le système
echo "🧹 Nettoyage..."
docker system prune -f

# 3. Créer un Dockerfile avec patch du fichier vite.ts
echo "🔨 Création du Dockerfile avec patch..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache \
    postgresql-client \
    curl \
    sed \
    && rm -rf /var/cache/apk/*

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de configuration des packages
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier les fichiers source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p logs uploads dist

# ÉTAPE CRITIQUE: Patcher le fichier vite.ts avant le build
RUN echo "🔧 Application du patch pour import.meta.dirname..." && \
    # Faire une sauvegarde
    cp server/vite.ts server/vite.ts.backup && \
    # Ajouter l'import fileURLToPath
    sed -i '/import { createServer as createViteServer, createLogger } from "vite";/a import { fileURLToPath } from "url";' server/vite.ts && \
    # Ajouter la définition de __dirname après les imports
    sed -i '/const viteLogger = createLogger();/i const __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n' server/vite.ts && \
    # Remplacer toutes les occurrences de import.meta.dirname par __dirname
    sed -i 's/import\.meta\.dirname/__dirname/g' server/vite.ts && \
    echo "✅ Patch appliqué avec succès" && \
    # Vérifier que le patch a fonctionné
    if grep -q "__dirname" server/vite.ts && ! grep -q "import\.meta\.dirname" server/vite.ts; then \
        echo "✅ Patch confirmé - import.meta.dirname remplacé par __dirname"; \
    else \
        echo "❌ Erreur de patch - restauration de la sauvegarde"; \
        cp server/vite.ts.backup server/vite.ts; \
        exit 1; \
    fi

# Construire l'application avec le fichier patché
RUN npm run build

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["node", "dist/index.js"]
EOF

# 4. Utiliser la configuration environnement stable
echo "📝 Configuration de l'environnement..."
cp docker-fix.env .env

# 5. Reconstruire avec le patch appliqué
echo "🏗️  Reconstruction avec patch import.meta.dirname..."
docker-compose build --no-cache

# 6. Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# 7. Attendre le démarrage
echo "⏳ Attente du démarrage (20 secondes)..."
sleep 20

# 8. Vérifier les logs
echo "📋 Vérification des logs..."
docker-compose logs --tail=20 app

# 9. Test de connectivité
echo ""
echo "🧪 Test de connectivité..."
if curl -s http://162.19.67.3:5000 >/dev/null; then
    echo "✅ Application accessible sur http://162.19.67.3:5000"
    echo "🌐 Interface web opérationnelle"
elif curl -s http://162.19.67.3:5000/api/health >/dev/null; then
    echo "✅ API accessible - Interface en cours de chargement"
else
    echo "❌ Test de connectivité échoué"
    echo ""
    echo "📋 Logs détaillés:"
    docker-compose logs app | tail -30
    echo ""
    echo "🔍 État des conteneurs:"
    docker-compose ps
    echo ""
    echo "🧪 Test de port direct:"
    netstat -tlnp | grep :5000 || echo "Port 5000 non ouvert"
fi

echo ""
echo "🔗 Liens utiles:"
echo "   Interface web: http://162.19.67.3:5000"
echo "   API Health: http://162.19.67.3:5000/api/health"
echo ""
echo "🔍 Commandes de diagnostic:"
echo "   docker-compose logs -f app        # Logs en temps réel"
echo "   docker-compose exec app sh        # Accès au conteneur"
echo "   docker-compose restart app        # Redémarrage"
echo "   curl -v http://162.19.67.3:5000   # Test détaillé"