#!/bin/bash

echo "🛠️ FIX VPS CALCULATE-PRICING 404 ERROR"
echo "====================================="
echo ""
echo "Ce script va corriger l'erreur 404 sur /api/calculate-pricing"
echo ""

# Instructions pour le VPS
cat << 'EOF'
INSTRUCTIONS POUR VOTRE VPS:
===========================

1. Connectez-vous au VPS:
   ssh ubuntu@162.19.67.3

2. Allez dans le dossier du projet:
   cd /home/ubuntu/JobDone

3. Récupérez la dernière version:
   git pull

4. Rebuild l'application:
   npm run build

5. Redémarrez le serveur:
   - Si vous utilisez PM2:
     pm2 restart bennespro
   
   - Si vous utilisez systemd:
     sudo systemctl restart bennespro
   
   - Si vous lancez manuellement:
     sudo killall node
     sudo NODE_ENV=production npm start

6. Vérifiez les logs:
   - PM2: pm2 logs bennespro --lines 50
   - Systemd: sudo journalctl -u bennespro -f
   - Manuel: Les logs apparaissent dans le terminal

7. Testez l'endpoint:
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

PROBLÈMES COURANTS:
==================

Si l'erreur 404 persiste:

1. Vérifiez que la route existe dans le build:
   grep -n "calculate-pricing" dist/server/routes.js

2. Vérifiez le processus node:
   ps aux | grep node

3. Vérifiez les ports:
   sudo netstat -tlnp | grep :5000

4. Vérifiez Nginx (si utilisé):
   sudo nginx -t
   sudo systemctl reload nginx

5. Si le build échoue:
   - Supprimez node_modules et réinstallez:
     rm -rf node_modules package-lock.json
     npm install
     npm run build

EOF

echo ""
echo "✅ Instructions créées!"
echo ""
echo "Suivez ces étapes sur votre VPS pour corriger l'erreur 404."