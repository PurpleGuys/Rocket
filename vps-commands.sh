#!/bin/bash

cd /home/ubuntu/JobDone

echo "1. Pull dernière version..."
git pull

echo "2. Clean build..."
rm -rf dist

echo "3. Install dependencies..."
npm install

echo "4. Build production..."
NODE_ENV=production npm run build

echo "5. Vérification de la route dans le build..."
if grep -q "calculate-pricing" dist/server/routes.js 2>/dev/null; then
    echo "✅ Route calculate-pricing trouvée dans le build!"
else
    echo "❌ ATTENTION: Route calculate-pricing non trouvée dans le build!"
fi

echo "6. Redémarrage du serveur..."
# Essayer PM2 d'abord
if command -v pm2 &> /dev/null; then
    pm2 restart bennespro || pm2 start npm --name bennespro -- start
else
    # Sinon utiliser systemctl
    if systemctl is-active --quiet bennespro; then
        sudo systemctl restart bennespro
    else
        # Dernier recours - kill et restart
        sudo killall node 2>/dev/null || true
        sleep 2
        sudo NODE_ENV=production npm start &
    fi
fi

echo "7. Test de l'endpoint après 5 secondes..."
sleep 5

curl -X POST https://purpleguy.world/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7,
    "bsdOption": false
  }'

echo ""
echo "✅ Déploiement terminé!"
