#!/bin/bash

# Script de dépannage Docker pour résoudre l'erreur de chemin undefined
# Solution complète pour import.meta.dirname
# Usage: ./docker-troubleshoot.sh

echo "🔧 Résolution DÉFINITIVE du problème Docker - import.meta.dirname"
echo "=================================================================="

# 1. Arrêter tous les conteneurs
echo "📦 Arrêt des conteneurs Docker..."
docker-compose down

# 2. Nettoyer complètement
echo "🧹 Nettoyage complet..."
docker system prune -f

# 3. Créer un Dockerfile modifié avec fix de chemin
echo "🔨 Création du Dockerfile corrigé..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache \
    postgresql-client \
    curl \
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

# Construire l'application
RUN npm run build

# Créer un script de démarrage avec fix de chemin
RUN cat > /app/start-with-path-fix.sh << 'SCRIPT'
#!/bin/sh
echo "🚀 Démarrage avec correction de chemin import.meta.dirname"

# Vérifier la structure des fichiers
echo "📁 Structure des fichiers:"
ls -la /app/dist/ 2>/dev/null || echo "❌ Pas de dossier dist"
ls -la /app/dist/public/ 2>/dev/null || echo "❌ Pas de dossier public"

# Définir explicitement les chemins pour remplacer import.meta.dirname
export __dirname="/app/server"
export CLIENT_TEMPLATE_PATH="/app/client/index.html"
export STATIC_FILES_PATH="/app/dist/public"
export PUBLIC_PATH="/app/dist/public"

echo "🔧 Variables de chemin définies:"
echo "__dirname=$__dirname"
echo "CLIENT_TEMPLATE_PATH=$CLIENT_TEMPLATE_PATH"
echo "STATIC_FILES_PATH=$STATIC_FILES_PATH"

# Si le dossier client n'existe pas, créer un index.html minimal
if [ ! -f "/app/client/index.html" ]; then
    echo "⚠️  Création d'un index.html de base..."
    mkdir -p /app/client
    cat > /app/client/index.html << 'HTML'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REM Bennes - Location de Bennes</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
HTML
fi

# Créer un lien symbolique si nécessaire
if [ -d "/app/dist/public" ] && [ ! -L "/app/public" ]; then
    ln -sf /app/dist/public /app/public
fi

echo "✅ Démarrage de l'application..."
exec node dist/index.js
SCRIPT

RUN chmod +x /app/start-with-path-fix.sh

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

# Commande de démarrage avec fix
CMD ["/app/start-with-path-fix.sh"]
EOF

# 4. Créer la configuration environnement finale
echo "📝 Configuration environnement finale..."
cp docker-fix.env .env

# 5. Reconstruire complètement avec le nouveau Dockerfile
echo "🏗️  Reconstruction complète avec fix de chemin..."
docker-compose build --no-cache

# 6. Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# 7. Attendre le démarrage
echo "⏳ Attente du démarrage (20 secondes)..."
sleep 20

# 8. Vérifier les logs
echo "📋 Logs de démarrage:"
docker-compose logs --tail=30 app

# 9. Test de connectivité
echo ""
echo "🧪 Test de connectivité..."
if curl -f http://162.19.67.3:5000 >/dev/null 2>&1; then
    echo "✅ Application accessible sur http://162.19.67.3:5000"
    echo "🌐 Interface web disponible"
elif curl -f http://162.19.67.3:5000/api/health >/dev/null 2>&1; then
    echo "✅ API accessible sur http://162.19.67.3:5000/api/health"
else
    echo "❌ Application non accessible, analyse des logs..."
    echo ""
    echo "📋 Logs détaillés des erreurs:"
    docker-compose logs app | tail -50
    echo ""
    echo "🔍 État des conteneurs:"
    docker-compose ps
fi

echo ""
echo "🔍 Commandes de débogage utiles:"
echo "docker-compose logs -f app               # Logs en temps réel"
echo "docker-compose exec app sh               # Entrer dans le conteneur"
echo "docker-compose exec app ls -la /app/     # Vérifier les fichiers"
echo "docker-compose restart app               # Redémarrer"
echo "curl http://162.19.67.3:5000             # Test direct"