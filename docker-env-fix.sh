#!/bin/bash

# Script de correction finale pour l'erreur de chemin Docker
# Résout définitivement le problème import.meta.dirname undefined

echo "🔧 Correction finale du problème de chemin Docker"
echo "================================================="

# 1. Arrêter tous les services
echo "📦 Arrêt des services..."
docker-compose down

# 2. Créer un fichier .env complet avec tous les chemins nécessaires
echo "📝 Création de la configuration environnement complète..."
cat > .env << 'EOF'
# Configuration complète pour résoudre l'erreur de chemin Docker
# IP VPS: 162.19.67.3

# ===========================================
# BASE DE DONNÉES
# ===========================================
DATABASE_URL="postgresql://remondis_user:RemondisSecure2024!@162.19.67.3:5432/remondis_db"

# ===========================================
# SERVEUR
# ===========================================
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# URLs et origines autorisées
APP_BASE_URL="http://162.19.67.3:5000"
ALLOWED_ORIGINS="http://162.19.67.3:5000,http://162.19.67.3,http://162.19.67.3:80"

# ===========================================
# CORRECTION CHEMINS (Fix principal)
# ===========================================
CLIENT_TEMPLATE_PATH="/app/client/index.html"
STATIC_FILES_PATH="/app/dist/public"
UPLOAD_PATH="/app/uploads"
LOG_PATH="/app/logs"
ROOT_PATH="/app"
SERVER_PATH="/app/server"

# ===========================================
# SÉCURITÉ
# ===========================================
SESSION_SECRET="VotreCleSecrete32CaracteresMinimum123456789"
JWT_SECRET="VotreCleJWT32CaracteresMinimumSecure456789abc"
ENCRYPTION_KEY="VotreCleChiffrement32CaracMinimum789abcdef"

# ===========================================
# SERVICES EMAIL
# ===========================================
SENDGRID_API_KEY="SG.votre-cle-sendgrid-ici"
SENDGRID_VERIFIED_SENDER_EMAIL="noreply@votre-domaine.com"
REMONDIS_SALES_EMAIL="commercial@votre-domaine.com"

# ===========================================
# SERVICES EXTERNES
# ===========================================
GOOGLE_MAPS_API_KEY="AIzaSy_votre_cle_google_maps_ici"

# ===========================================
# CONFIGURATION MÉTIER
# ===========================================
DEFAULT_TRANSPORT_PRICE_PER_KM="1.50"
DEFAULT_MINIMUM_FLAT_RATE="50.00"
DEFAULT_HOURLY_RATE="45.00"

# Adresse du site industriel
INDUSTRIAL_SITE_ADDRESS="123 Rue de l'Industrie"
INDUSTRIAL_SITE_CITY="Votre Ville"
INDUSTRIAL_SITE_POSTAL_CODE="12345"
INDUSTRIAL_SITE_COUNTRY="France"

# ===========================================
# AUTRES PARAMÈTRES
# ===========================================
FORCE_HTTPS=false
ENABLE_SECURITY_HEADERS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
MAX_FILE_SIZE_MB=10
SESSION_MAX_AGE=604800000
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=1800000
EOF

# 3. Modifier le Dockerfile pour inclure la correction de chemin
echo "🔨 Modification du Dockerfile..."
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

# Script de démarrage avec correction de chemin
COPY <<'SCRIPT' /app/start.sh
#!/bin/sh
echo "🚀 Démarrage de l'application avec correction de chemin..."
echo "📁 Vérification des chemins..."
ls -la /app/
ls -la /app/dist/ 2>/dev/null || echo "⚠️  Pas de dossier dist"
ls -la /app/client/ 2>/dev/null || echo "⚠️  Pas de dossier client"

# Définir les variables d'environnement pour les chemins
export CLIENT_TEMPLATE_PATH="/app/client/index.html"
export STATIC_FILES_PATH="/app/dist/public"

echo "🔧 Variables de chemin définies:"
echo "CLIENT_TEMPLATE_PATH=$CLIENT_TEMPLATE_PATH"
echo "STATIC_FILES_PATH=$STATIC_FILES_PATH"

# Démarrer l'application
exec node dist/index.js
SCRIPT

RUN chmod +x /app/start.sh

# Commande de démarrage
CMD ["/app/start.sh"]
EOF

# 4. Reconstruire complètement
echo "🏗️  Reconstruction complète..."
docker-compose build --no-cache

# 5. Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# 6. Attendre et vérifier
echo "⏳ Attente du démarrage..."
sleep 15

echo "📋 Vérification des logs..."
docker-compose logs --tail=30 app

echo "🧪 Test de connectivité..."
if curl -f http://162.19.67.3:5000/api/health >/dev/null 2>&1; then
    echo "✅ Application accessible sur http://162.19.67.3:5000"
else
    echo "❌ Problème de connectivité, logs détaillés:"
    docker-compose logs app
fi

echo ""
echo "🔍 Commandes de débogage utiles:"
echo "docker-compose logs -f app          # Voir les logs en temps réel"
echo "docker-compose exec app sh          # Entrer dans le conteneur"
echo "docker-compose restart app          # Redémarrer l'application"
echo "docker-compose exec app env | grep PATH  # Vérifier les variables"