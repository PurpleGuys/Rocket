#!/bin/bash

# ===============================================
# SCRIPT DE CORRECTION RAPIDE ET CONTINUATION
# ===============================================

set -e

# Configuration
DOMAIN="purpleguy.world"
APP_DIR="/home/ubuntu/REM-Bennes"
PM2_APP_NAME="bennespro"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🔧 CORRECTION ET CONTINUATION DU DÉPLOIEMENT${NC}"

cd "$APP_DIR"

# 1. Charger correctement les variables d'environnement
echo -e "\n${BLUE}► Chargement correct des variables d'environnement${NC}"
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}✓ Variables d'environnement chargées${NC}"
else
    echo -e "${RED}✗ Fichier .env introuvable${NC}"
    exit 1
fi

# 2. Build de l'application
echo -e "\n${BLUE}► Build de l'application${NC}"
rm -rf dist
npm run build || {
    echo -e "${RED}✗ Build échoué${NC}"
    exit 1
}

if [ -d "dist/public" ]; then
    echo -e "${GREEN}✓ Build réussi${NC}"
else
    echo -e "${RED}✗ Le dossier dist/public n'existe pas${NC}"
    exit 1
fi

# 3. Redémarrage PM2
echo -e "\n${BLUE}► Redémarrage de l'application avec PM2${NC}"

# Vérifier si ecosystem.config.js existe
if [ ! -f ecosystem.config.js ]; then
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${APP_DIR}',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true
  }]
};
EOF
fi

pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✓ Application redémarrée${NC}"

# 4. Tests rapides
echo -e "\n${BLUE}► Tests de santé${NC}"
sleep 10

echo -n "API Health: "
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "Calcul Prix: "
RESPONSE=$(curl -s -X POST http://localhost:5000/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 9,
    "wasteType": "Gravats et matériaux inertes",
    "address": "123 rue de la Paix",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7,
    "bsdOption": false
  }' 2>/dev/null)

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "$RESPONSE" | head -n 3
fi

# 5. Résumé
echo -e "\n${GREEN}═════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DÉPLOIEMENT CORRIGÉ ET CONTINUÉ${NC}"
echo -e "${GREEN}═════════════════════════════════════════${NC}"

echo -e "\n📋 STATUT:"
echo "• Application: https://${DOMAIN}"
echo "• PM2: pm2 status ${PM2_APP_NAME}"
echo "• Logs: pm2 logs ${PM2_APP_NAME}"

echo -e "\n⚠️  RAPPEL:"
echo "Mettez à jour vos clés API dans .env si nécessaire"
echo "Désactivez AdBlocker pour tester Stripe"

echo -e "\n✅ Terminé !"