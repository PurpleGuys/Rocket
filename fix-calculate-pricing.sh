#!/bin/bash

echo "🛠️ FIX CALCULATE-PRICING API ENDPOINT"
echo "====================================="

# 1. Vérifier si la route existe dans le code actuel
echo "1. Vérification de la route dans server/routes.ts..."
if grep -q "calculate-pricing" server/routes.ts; then
    echo "✅ Route trouvée dans server/routes.ts"
    grep -n "calculate-pricing" server/routes.ts | head -5
else
    echo "❌ Route manquante dans server/routes.ts"
fi

# 2. Vérifier le build
echo ""
echo "2. Vérification du build..."
if [ -d "dist" ]; then
    echo "✅ Dossier dist trouvé"
    if [ -f "dist/server/routes.js" ]; then
        echo "Recherche dans dist/server/routes.js..."
        grep -q "calculate-pricing" dist/server/routes.js && echo "✅ Route dans le build" || echo "❌ Route absente du build"
    fi
else
    echo "❌ Pas de dossier dist - rebuild nécessaire"
fi

# 3. Rebuild l'application
echo ""
echo "3. Rebuild de l'application..."
npm run build

# 4. Vérifier après build
echo ""
echo "4. Vérification après build..."
if [ -f "dist/server/routes.js" ]; then
    grep -q "calculate-pricing" dist/server/routes.js && echo "✅ Route dans le nouveau build" || echo "❌ Route toujours absente"
fi

# 5. Test local de la route
echo ""
echo "5. Test local de l'endpoint..."
curl -X POST http://localhost:5000/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7,
    "bsdOption": false
  }' | jq '.'

echo ""
echo "✅ Script terminé"
echo ""
echo "Pour déployer sur VPS:"
echo "1. git add -A && git commit -m 'Fix calculate-pricing endpoint' && git push"
echo "2. Sur le VPS: cd /home/ubuntu/JobDone"
echo "3. git pull"
echo "4. npm run build"
echo "5. pm2 restart bennespro"