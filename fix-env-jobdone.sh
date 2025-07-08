#!/bin/bash

# ===============================================
# SCRIPT DE CORRECTION POUR JOBDONE
# ===============================================

set -e

# Configuration correcte pour JobDone
APP_DIR="/home/ubuntu/JobDone"
PM2_APP_NAME="bennespro"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🔧 CORRECTION DU DÉPLOIEMENT JOBDONE${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Erreur : Le répertoire $APP_DIR n'existe pas${NC}"
    exit 1
fi

cd "$APP_DIR"

# 1. Vérifier le fichier .env
echo -e "\n${BLUE}► Vérification du fichier .env${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ Fichier .env trouvé${NC}"
    
    # Vérifier les clés Stripe
    echo -e "\n${BLUE}► Vérification des clés Stripe :${NC}"
    if grep -q "pk_live" .env && grep -q "sk_live" .env; then
        echo -e "${GREEN}✓ Clés de production Stripe trouvées${NC}"
        grep "STRIPE" .env | grep -v "^#" | head -5
    else
        echo -e "${YELLOW}⚠️  Clés de test détectées, mise à jour nécessaire${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env manquant!${NC}"
    exit 1
fi

# 2. Nettoyer le cache et rebuild
echo -e "\n${BLUE}► Nettoyage du cache et rebuild${NC}"
rm -rf dist
rm -rf node_modules/.vite
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Build réussi${NC}"
else
    echo -e "${RED}❌ Échec du build${NC}"
    exit 1
fi

# 3. Vérifier le build
echo -e "\n${BLUE}► Vérification du build${NC}"
if grep -r "pk_test" dist/ 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Clés de test trouvées dans le build${NC}"
else
    echo -e "${GREEN}✓ Aucune clé de test dans le build${NC}"
fi

# 4. Redémarrer l'application
echo -e "\n${BLUE}► Redémarrage de l'application${NC}"
if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 restart "$PM2_APP_NAME" --update-env
    echo -e "${GREEN}✓ Application redémarrée${NC}"
else
    echo -e "${YELLOW}⚠️  Application non trouvée dans PM2, démarrage...${NC}"
    pm2 start ecosystem.config.cjs --env production
fi

# 5. Status final
echo -e "\n${GREEN}✅ DÉPLOIEMENT TERMINÉ!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Vérifications :"
echo "- PM2 status : pm2 status"
echo "- Logs : pm2 logs $PM2_APP_NAME"
echo "- Test API : curl http://localhost:5000/api/health"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de vider le cache du navigateur!${NC}"