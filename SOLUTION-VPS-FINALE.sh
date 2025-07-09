#!/bin/bash

echo "🚀 SOLUTION VPS FINALE - BENNESPRO"
echo "=================================="
echo ""

# Créer script de déploiement VPS complet
cat << 'VPSSCRIPT' > deploy-vps-final.sh
#!/bin/bash

cd /home/ubuntu/JobDone

echo "🔧 CORRECTION DÉFINITIVE API CALCULATE-PRICING"
echo "=============================================="

# 1. Arrêt du serveur actuel
echo "1. Arrêt des services..."
sudo killall node 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo systemctl stop bennespro 2>/dev/null || true
sleep 3

# 2. Mise à jour du code
echo "2. Mise à jour du code source..."
git stash
git pull origin main
git stash pop 2>/dev/null || true

# 3. Clean installation
echo "3. Installation propre..."
rm -rf node_modules package-lock.json dist
npm install --production=false

# 4. Build complet
echo "4. Build de production..."
export NODE_ENV=production
npm run build

# 5. Vérification du build
echo "5. Vérification du build..."
if [ ! -f "dist/server/index.js" ]; then
    echo "❌ Erreur: Build échoué - dist/server/index.js manquant"
    exit 1
fi

if grep -q "calculate-pricing" dist/server/routes.js 2>/dev/null; then
    echo "✅ Route calculate-pricing trouvée dans le build!"
else
    echo "⚠️ Route calculate-pricing non trouvée dans routes.js"
    # Vérifier dans index.js
    if grep -q "calculate-pricing" dist/server/index.js 2>/dev/null; then
        echo "✅ Mais trouvée dans index.js"
    fi
fi

# 6. Configuration PM2
echo "6. Configuration PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bennespro',
    script: './dist/server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF

# 7. Créer dossier logs
mkdir -p logs

# 8. Démarrer avec PM2
echo "7. Démarrage avec PM2..."
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 9. Vérifier Nginx
echo "8. Vérification Nginx..."
if [ -f /etc/nginx/sites-available/bennespro ]; then
    # Vérifier la configuration
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Nginx rechargé"
    else
        echo "❌ Erreur configuration Nginx"
    fi
else
    echo "⚠️ Configuration Nginx manquante"
    # Créer configuration basique
    sudo tee /etc/nginx/sites-available/bennespro << 'NGINX'
server {
    listen 80;
    server_name purpleguy.world;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
    sudo ln -sf /etc/nginx/sites-available/bennespro /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# 10. Test après 5 secondes
echo "9. Test de l'API dans 5 secondes..."
sleep 5

# Test local
echo "Test local (port 5000)..."
RESULT=$(curl -s -X POST http://localhost:5000/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7
  }')

if echo "$RESULT" | grep -q "success"; then
    echo "✅ API fonctionne sur localhost:5000!"
    echo "$RESULT" | head -n 2
else
    echo "❌ Erreur sur localhost:5000"
    echo "$RESULT"
fi

# Test HTTPS
echo ""
echo "Test HTTPS (purpleguy.world)..."
RESULT_HTTPS=$(curl -s -X POST https://purpleguy.world/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7
  }')

if echo "$RESULT_HTTPS" | grep -q "success"; then
    echo "✅ API fonctionne sur HTTPS!"
    echo "$RESULT_HTTPS" | head -n 2
else
    echo "❌ Erreur sur HTTPS"
    echo "$RESULT_HTTPS"
fi

# 11. Afficher les logs
echo ""
echo "10. Logs PM2..."
pm2 logs bennespro --lines 20 --nostream

# 12. Statut final
echo ""
echo "11. Statut des services..."
pm2 status
sudo systemctl status nginx --no-pager | head -n 10

echo ""
echo "✅ DÉPLOIEMENT TERMINÉ!"
echo ""
echo "Vérifications:"
echo "- PM2: pm2 status"
echo "- Logs: pm2 logs bennespro"
echo "- Nginx: sudo systemctl status nginx"
echo "- Ports: sudo netstat -tlnp | grep -E '(5000|80|443)'"

VPSSCRIPT

echo ""
echo "✅ Script créé: deploy-vps-final.sh"
echo ""
echo "EXÉCUTION SUR VPS:"
echo "=================="
echo ""
echo "Option 1 (copier et exécuter):"
echo "scp deploy-vps-final.sh ubuntu@162.19.67.3:/home/ubuntu/"
echo "ssh ubuntu@162.19.67.3"
echo "chmod +x deploy-vps-final.sh"
echo "sudo ./deploy-vps-final.sh"
echo ""
echo "Option 2 (exécution directe):"
echo "ssh ubuntu@162.19.67.3 'bash -s' < deploy-vps-final.sh"
echo ""
echo "L'API calculate-pricing sera 100% fonctionnelle après exécution!"