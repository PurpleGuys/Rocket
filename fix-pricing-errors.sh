#!/bin/bash

echo "🛠️ FIX CALCULATE-PRICING ET AUTRES ERREURS API"
echo "=============================================="

# 1. Tester localement
echo "1. Test local de calculate-pricing..."
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
echo "2. Build de production..."
npm run build

echo ""
echo "3. Test des routes après build..."
if [ -f "dist/server/routes.js" ]; then
    echo "✅ Routes compilées trouvées"
    grep -c "calculate-pricing" dist/server/routes.js && echo "✅ Route calculate-pricing dans le build"
fi

echo ""
echo "✅ Build terminé!"
echo ""
echo "INSTRUCTIONS POUR VPS:"
echo "====================="
echo ""
echo "Sur votre VPS, exécutez ces commandes:"
echo ""
echo "cd /home/ubuntu/JobDone"
echo "git pull"
echo "npm run build"
echo "pm2 restart bennespro"
echo ""
echo "Si pm2 n'existe pas:"
echo "sudo npm start"
echo ""
echo "Pour vérifier les logs:"
echo "pm2 logs bennespro --lines 50"