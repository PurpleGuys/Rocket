#!/bin/bash

echo "🚀 DÉPLOIEMENT VPS FINAL - CORRECTION COMPLÈTE"
echo "=============================================="

# 1. Vérifier les prérequis
echo -e "\n1️⃣ VÉRIFICATION DES PRÉREQUIS..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi
echo "✅ npm v$(npm -v)"

# 2. Vérifier le fichier .env
echo -e "\n2️⃣ VÉRIFICATION DU FICHIER .ENV..."

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant"
    exit 1
fi

# Vérifier les variables critiques
MISSING_VARS=()
for var in DATABASE_URL JWT_SECRET SESSION_SECRET GOOGLE_MAPS_API_KEY STRIPE_SECRET_KEY VITE_STRIPE_PUBLIC_KEY; do
    if ! grep -q "^$var=" .env || grep -q "^$var=\"\"" .env; then
        MISSING_VARS+=($var)
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Variables manquantes ou vides: ${MISSING_VARS[*]}"
    echo "   Veuillez configurer ces variables dans le fichier .env"
else
    echo "✅ Toutes les variables critiques sont configurées"
fi

# 3. Installation des dépendances
echo -e "\n3️⃣ INSTALLATION DES DÉPENDANCES..."
npm install

# 4. Build de l'application
echo -e "\n4️⃣ BUILD DE L'APPLICATION..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Le build a échoué (dossier dist manquant)"
    exit 1
fi
echo "✅ Build réussi"

# 5. Configuration TypeScript pour production
echo -e "\n5️⃣ CRÉATION DU FICHIER tsconfig.prod.json..."

cat > tsconfig.prod.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": false,
    "noEmit": false,
    "outDir": "./dist-server"
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules", "dist", "client"]
}
EOF

echo "✅ tsconfig.prod.json créé"

# 6. Configuration PM2
echo -e "\n6️⃣ CONFIGURATION PM2..."

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bennespro',
    script: 'npx',
    args: 'tsx server/index.ts',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    time: true
  }]
};
EOF

echo "✅ ecosystem.config.js créé"

# 7. Créer le dossier logs
mkdir -p logs

# 8. Configuration Nginx
echo -e "\n7️⃣ CONFIGURATION NGINX..."

sudo tee /etc/nginx/sites-available/bennespro > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Logs
    access_log /var/log/nginx/bennespro_access.log;
    error_log /var/log/nginx/bennespro_error.log;

    # Taille max des uploads
    client_max_body_size 50M;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Fichiers statiques
    location /uploads {
        alias /home/ubuntu/JobDone/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/bennespro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configuré"

# 9. Démarrage avec PM2
echo -e "\n8️⃣ DÉMARRAGE DE L'APPLICATION..."

# Arrêter l'instance existante si elle existe
pm2 stop bennespro 2>/dev/null || true
pm2 delete bennespro 2>/dev/null || true

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo -e "\n✅ DÉPLOIEMENT TERMINÉ !"
echo "============================"
echo ""
echo "📋 VÉRIFICATIONS:"
echo "  - Application: http://$(hostname -I | awk '{print $1}')"
echo "  - Logs PM2: pm2 logs bennespro"
echo "  - Status: pm2 status"
echo ""
echo "🧪 TEST DE L'API:"
echo "  curl http://localhost:5000/api/health"
echo ""

# Test de santé
sleep 5
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo "✅ L'API répond correctement !"
else
    echo "❌ L'API ne répond pas, vérifiez les logs avec: pm2 logs bennespro"
fi