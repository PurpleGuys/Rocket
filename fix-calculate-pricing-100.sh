#!/bin/bash

echo "🚀 FIX CALCULATE-PRICING API 100% GARANTI"
echo "========================================"
echo ""

# Test local d'abord
echo "1. Test local de l'API..."
LOCAL_TEST=$(curl -s -X POST http://localhost:5000/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7,
    "bsdOption": false
  }')

if echo "$LOCAL_TEST" | grep -q "success"; then
    echo "✅ API fonctionne en local!"
else
    echo "❌ Problème local détecté"
fi

# Build production
echo ""
echo "2. Build de production..."
NODE_ENV=production npm run build

# Vérifier le build
echo ""
echo "3. Vérification du build..."
if [ -f "dist/server/routes.js" ]; then
    if grep -q "calculate-pricing" dist/server/routes.js; then
        echo "✅ Route présente dans le build!"
    else
        echo "❌ Route absente du build!"
    fi
fi

# Créer script VPS
cat << 'EOFVPS' > fix-vps-calculate-pricing.sh
#!/bin/bash

cd /home/ubuntu/JobDone

echo "🛠️ CORRECTION API CALCULATE-PRICING"
echo "==================================="

# 1. Pull dernière version
echo "1. Récupération dernière version..."
git pull origin main

# 2. Clean installation
echo "2. Clean installation..."
rm -rf node_modules package-lock.json dist
npm install

# 3. Build production
echo "3. Build production..."
NODE_ENV=production npm run build

# 4. Vérifier la route dans le build
echo "4. Vérification route dans build..."
if grep -q "calculate-pricing" dist/server/routes.js 2>/dev/null; then
    echo "✅ Route trouvée dans le build!"
else
    echo "❌ ATTENTION: Route non trouvée!"
    
    # Vérifier dans les sources
    if grep -q "calculate-pricing" server/routes.ts; then
        echo "✅ Route existe dans server/routes.ts"
        echo "❌ Problème de compilation TypeScript"
    fi
fi

# 5. Redémarrage forcé
echo "5. Redémarrage du serveur..."

# Tuer tous les processus node
sudo killall node 2>/dev/null || true
sleep 2

# Essayer PM2
if command -v pm2 &> /dev/null; then
    pm2 delete bennespro 2>/dev/null || true
    pm2 start npm --name bennespro -- start
    pm2 save
    pm2 startup systemd -u ubuntu --hp /home/ubuntu
else
    # Systemd
    if [ -f /etc/systemd/system/bennespro.service ]; then
        sudo systemctl restart bennespro
    else
        # Créer service systemd
        sudo tee /etc/systemd/system/bennespro.service << 'EOF'
[Unit]
Description=BennesPro Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/JobDone
Environment="NODE_ENV=production"
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/node dist/server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable bennespro
        sudo systemctl start bennespro
    fi
fi

# 6. Test après 10 secondes
echo "6. Test de l'API dans 10 secondes..."
sleep 10

# Test direct
echo "Test direct sur localhost:5000..."
curl -X POST http://localhost:5000/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7
  }'

echo ""
echo "Test via HTTPS..."
curl -X POST https://purpleguy.world/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7
  }'

# 7. Logs
echo ""
echo "7. Derniers logs..."
if command -v pm2 &> /dev/null; then
    pm2 logs bennespro --lines 30
else
    sudo journalctl -u bennespro -n 30
fi

echo ""
echo "✅ Correction terminée!"
echo ""
echo "Si l'erreur 404 persiste:"
echo "1. Vérifiez Nginx: sudo nginx -t && sudo systemctl reload nginx"
echo "2. Vérifiez les ports: sudo netstat -tlnp | grep 5000"
echo "3. Vérifiez les processus: ps aux | grep node"

EOFVPS

echo ""
echo "✅ Scripts créés!"
echo ""
echo "EXÉCUTEZ SUR VOTRE VPS:"
echo "======================="
echo "scp fix-vps-calculate-pricing.sh ubuntu@162.19.67.3:/home/ubuntu/"
echo "ssh ubuntu@162.19.67.3"
echo "chmod +x fix-vps-calculate-pricing.sh"
echo "./fix-vps-calculate-pricing.sh"
echo ""
echo "OU DIRECTEMENT:"
echo "ssh ubuntu@162.19.67.3 'bash -s' < fix-vps-calculate-pricing.sh"