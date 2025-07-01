#!/bin/bash

# =====================================
# CORRECTION DÉPLOIEMENT VPS BENNESPRO
# Corrige les erreurs détectées
# =====================================

set -e

VPS_IP="162.19.67.3"
VPS_USER="ubuntu"
APP_DIR="/var/www/bennespro"

echo "🔧 CORRECTION DÉPLOIEMENT VPS"
echo "============================="

# 1. Créer les fichiers manquants localement
echo "📁 1. Préparation fichiers locaux..."

# Créer uploads si manquant
mkdir -p uploads

# Créer .env local pour validation
if [ ! -f ".env" ]; then
    cat > .env << 'LOCALENV'
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://remondis_db:Remondis60110$@localhost:5432/remondis_db
SESSION_SECRET=f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5
JWT_SECRET=85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723
REMONDIS_SALES_EMAIL=commercial@remondis.fr
APP_BASE_URL=https://purpleguy.world
DEFAULT_TRANSPORT_PRICE_PER_KM=1.50
DEFAULT_MINIMUM_FLAT_RATE=50.00
DEFAULT_HOURLY_RATE=45.00
UPLOAD_DIR=./uploads
LOCALENV
    echo "✅ .env local créé"
fi

# 2. Build si nécessaire
echo "🏗️ 2. Construction application..."
if [ ! -d "dist" ]; then
    npm run build
fi
echo "✅ Application construite"

# 3. Créer archive corrigée
echo "📦 3. Création archive corrigée..."
tar -czf bennespro-fixed.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=attached_assets \
    --exclude=scripts \
    --exclude=database-export \
    package.json \
    package-lock.json \
    server/ \
    client/ \
    shared/ \
    dist/ \
    uploads/ \
    drizzle.config.ts \
    tsconfig.json \
    postcss.config.js \
    tailwind.config.ts \
    vite.config.ts \
    components.json

echo "✅ Archive créée"

# 4. Transfert et correction sur VPS
echo "🚀 4. Transfert et correction VPS..."
scp bennespro-fixed.tar.gz $VPS_USER@$VPS_IP:/tmp/

ssh $VPS_USER@$VPS_IP << 'REMOTE'
set -e

APP_DIR="/var/www/bennespro"
echo "📂 Mise à jour application sur VPS..."

# Créer répertoire si nécessaire
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Extraire nouvelle version
cd $APP_DIR
tar -xzf /tmp/bennespro-fixed.tar.gz
rm /tmp/bennespro-fixed.tar.gz

# Créer .env de production
echo "📋 Création .env production..."
cat > $APP_DIR/.env << 'ENVPROD'
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Base de données
DATABASE_URL=postgresql://remondis_db:Remondis60110$@localhost:5432/remondis_db

# Secrets
SESSION_SECRET=f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5
JWT_SECRET=85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723

# Configuration métier
REMONDIS_SALES_EMAIL=commercial@remondis.fr
APP_BASE_URL=https://purpleguy.world
ALLOWED_ORIGINS=https://purpleguy.world,https://www.purpleguy.world

# Tarifs
DEFAULT_TRANSPORT_PRICE_PER_KM=1.50
DEFAULT_MINIMUM_FLAT_RATE=50.00
DEFAULT_HOURLY_RATE=45.00

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# Sécurité
FORCE_HTTPS=true
ENABLE_SECURITY_HEADERS=true
ENVPROD

# Installer dépendances si nécessaire
echo "📦 Installation dépendances..."
npm ci --only=production

# Créer dossiers nécessaires
mkdir -p uploads logs

echo "✅ Correction terminée"
REMOTE

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "======================="
echo "Maintenant vous pouvez ré-exécuter :"
echo "./deploy-production.sh"
echo ""
echo "Ou continuer manuellement avec :"
echo "ssh $VPS_USER@$VPS_IP"

# Nettoyage
rm -f bennespro-fixed.tar.gz

echo "✅ Fichiers corrigés et transférés"