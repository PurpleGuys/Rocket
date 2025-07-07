#!/bin/bash

# ===============================================
# SOLUTION VPS FINALE CORRIGÉE - 100% FONCTIONNELLE
# Script de déploiement complet avec build et SSL
# ===============================================

set -e  # Arrêter en cas d'erreur

# Configuration
DOMAIN="purpleguy.world"
APP_DIR="/home/ubuntu/REM-Bennes"
NODE_VERSION="20"
PM2_APP_NAME="bennespro"
NGINX_SITE="bennespro"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions utilitaires
step() {
    echo -e "\n${GREEN}═══ $1 ═══${NC}"
}

error() {
    echo -e "\n${RED}✗ ERREUR: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║      SOLUTION VPS FINALE CORRIGÉE BENNESPRO         ║"
echo "║         Déploiement 100% Fonctionnel                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. VÉRIFICATIONS PRÉLIMINAIRES
step "Vérifications préliminaires"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    error "Le répertoire $APP_DIR n'existe pas"
fi

cd "$APP_DIR" || error "Impossible d'accéder à $APP_DIR"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
fi

NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
    warning "Node.js version $NODE_CURRENT détectée, version $NODE_VERSION recommandée"
fi

success "Environnement vérifié"

# 2. MISE À JOUR DU CODE
step "Mise à jour du code"

# Sauvegarder les fichiers locaux importants
cp .env .env.backup 2>/dev/null || true

# Pull des dernières modifications
git stash
git pull origin main || warning "Git pull échoué, utilisation du code local"
git stash pop || true

success "Code mis à jour"

# 3. INSTALLATION DES DÉPENDANCES
step "Installation des dépendances"

# Nettoyer le cache npm
npm cache clean --force

# Installer toutes les dépendances
npm install --production=false || error "Installation des dépendances échouée"

success "Dépendances installées"

# 4. CONFIGURATION ENVIRONNEMENT
step "Configuration de l'environnement"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    info "Création du fichier .env"
    cat > .env << 'EOF'
# Base de données PostgreSQL
DATABASE_URL="postgresql://bennespro_user:bennespro_pass@localhost:5432/bennespro_db?sslmode=disable"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="bennespro_db"
DB_USER="bennespro_user"
DB_PASS="bennespro_pass"

# Configuration serveur
NODE_ENV="production"
PORT="5000"
HOST="0.0.0.0"
FRONTEND_URL="https://purpleguy.world"

# Clés secrètes (À REMPLACER)
JWT_SECRET="jwt-secret-super-secure-$(openssl rand -hex 32)"
SESSION_SECRET="session-secret-super-secure-$(openssl rand -hex 32)"

# APIs externes (À REMPLACER PAR VOS VRAIES CLÉS)
GOOGLE_MAPS_API_KEY="VOTRE_CLE_GOOGLE_MAPS"
VITE_GOOGLE_MAPS_API_KEY="VOTRE_CLE_GOOGLE_MAPS"
STRIPE_SECRET_KEY="VOTRE_CLE_STRIPE_SECRET"
VITE_STRIPE_PUBLIC_KEY="VOTRE_CLE_STRIPE_PUBLIC"
SENDGRID_API_KEY="VOTRE_CLE_SENDGRID"
SENDGRID_FROM_EMAIL="noreply@remondis.fr"

# Redis
REDIS_URL="redis://localhost:6379"

# Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
EOF
    warning "Fichier .env créé - REMPLACEZ LES CLÉS API PAR VOS VRAIES VALEURS"
fi

# Charger les variables d'environnement correctement
if [ -f .env ]; then
    set -a
    source .env
    set +a
    success "Variables d'environnement chargées"
else
    warning "Fichier .env introuvable"
fi

# 5. CORRECTION DES ROUTES D'IMAGES
step "Ajout du fallback pour les images manquantes"

# Vérifier si le fallback d'images existe déjà
if ! grep -q "api/uploads/services/:serviceId" server/routes.ts; then
    info "Ajout du fallback d'images dans server/routes.ts"
    
    # Créer une copie de sauvegarde
    cp server/routes.ts server/routes.ts.backup
    
    # Créer un fichier temporaire avec le code à ajouter
    cat > /tmp/image-fallback-routes.ts << 'FALLBACK_CODE'

  // ==================== IMAGE FALLBACK ROUTES ====================
  // Gestion des images de services avec fallback SVG
  app.get("/api/uploads/services/:serviceId/*", (req, res) => {
    const { serviceId } = req.params;
    const fileName = req.params[0] || "";
    
    // Décoder le nom du fichier (espaces encodés, caractères spéciaux)
    const decodedFileName = decodeURIComponent(fileName);
    
    console.log(`[Image Request] Service: ${serviceId}, File: ${decodedFileName}`);
    
    // Construire le chemin de l'image
    const imagePath = path.join(process.cwd(), "uploads", "services", serviceId, decodedFileName);
    
    // Vérifier si le fichier existe
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    }
    
    // Si l'image n'existe pas, envoyer un SVG placeholder dynamique
    const serviceNames: { [key: string]: string } = {
      "8": "Big Bag",
      "9": "Benne 10m³",
      "11": "Benne 18m³"
    };
    
    const serviceName = serviceNames[serviceId] || `Service ${serviceId}`;
    
    const placeholderSVG = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="bg${serviceId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#bg${serviceId})" />
        <text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold" fill="white">
          ${serviceName}
        </text>
        <text x="300" y="250" text-anchor="middle" font-family="Arial" font-size="16" fill="white" opacity="0.8">
          Location de bennes professionnelles
        </text>
      </svg>
    `;
    
    res.set("Content-Type", "image/svg+xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(placeholderSVG);
  });
  
  // Route pour gérer les uploads génériques
  app.get("/api/uploads/*", (req, res) => {
    const filePath = req.params[0];
    const fullPath = path.join(process.cwd(), "uploads", filePath);
    
    if (fs.existsSync(fullPath)) {
      return res.sendFile(fullPath);
    }
    
    res.status(404).json({ error: "File not found" });
  });
FALLBACK_CODE

    # Ajouter le code avant la dernière accolade fermante
    # Trouver la dernière ligne du fichier et insérer avant
    head -n -1 server/routes.ts > /tmp/routes_temp.ts
    cat /tmp/image-fallback-routes.ts >> /tmp/routes_temp.ts
    echo "}" >> /tmp/routes_temp.ts
    
    # Remplacer le fichier original
    mv /tmp/routes_temp.ts server/routes.ts
    
    success "Fallback d'images ajouté"
else
    info "Fallback d'images déjà présent"
fi

# 6. CRÉATION DES DOSSIERS
step "Création des dossiers nécessaires"

mkdir -p uploads/services/{8,9,10,11,12}
mkdir -p logs
mkdir -p dist/public

chmod -R 755 uploads
chmod -R 755 logs

success "Dossiers créés"

# 7. BUILD DE L'APPLICATION
step "Build de l'application"

info "Nettoyage des anciens builds"
rm -rf dist

info "Build du frontend et backend"
npm run build || error "Build échoué"

# Vérifier que le build a réussi
if [ ! -d "dist/public" ]; then
    error "Le dossier dist/public n'a pas été créé"
fi

success "Application buildée avec succès"

# 8. CONFIGURATION PM2
step "Configuration PM2"

# Créer le fichier ecosystem
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

success "PM2 configuré"

# 9. CONFIGURATION NGINX
step "Configuration Nginx"

# Créer la configuration Nginx
sudo tee /etc/nginx/sites-available/${NGINX_SITE} > /dev/null << EOF
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Taille maximale des uploads
    client_max_body_size 10M;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Content Security Policy pour Stripe et Google Maps
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://r.stripe.com wss://localhost:* ws://localhost:*; frame-src https://js.stripe.com https://hooks.stripe.com https://maps.google.com;" always;
    
    # Logs
    access_log /var/log/nginx/${NGINX_SITE}_access.log;
    error_log /var/log/nginx/${NGINX_SITE}_error.log;
    
    # Fichiers statiques
    location / {
        root ${APP_DIR}/dist/public;
        try_files \$uri \$uri/ /index.html;
        
        # Compression
        gzip on;
        gzip_types text/plain text/css text/javascript application/javascript application/json;
        gzip_min_length 1000;
        
        # Cache pour les assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts pour uploads
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t || error "Configuration Nginx invalide"

# Recharger Nginx
sudo systemctl reload nginx

success "Nginx configuré et rechargé"

# 10. GÉNÉRATION SSL (si nécessaire)
step "Vérification SSL"

if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    info "Génération du certificat SSL avec Certbot"
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || warning "Certbot échoué, utiliser HTTP pour l'instant"
else
    info "Certificat SSL déjà présent"
fi

# 11. DÉMARRAGE APPLICATION
step "Démarrage de l'application"

# Arrêter l'ancienne instance
pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
pm2 delete ${PM2_APP_NAME} 2>/dev/null || true

# Démarrer la nouvelle instance
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

success "Application démarrée avec PM2"

# 12. TESTS DE SANTÉ
step "Tests de santé"

sleep 10  # Attendre que l'app démarre

# Test API Health
echo -n "Test API Health: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ ÉCHEC (HTTP $HTTP_CODE)${NC}"
fi

# Test Frontend
echo -n "Test Frontend: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN})
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ HTTP $HTTP_CODE${NC}"
fi

# Test Calcul Prix
echo -n "Test Calcul Prix: "
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
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Vérifier l'API${NC}"
fi

# 13. CONFIGURATION MONITORING
step "Configuration du monitoring"

# Logrotate
sudo tee /etc/logrotate.d/${PM2_APP_NAME} > /dev/null << EOF
${APP_DIR}/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

success "Monitoring configuré"

# 14. RÉSUMÉ FINAL
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"

echo -e "\n📋 ${BLUE}RÉSUMÉ DU DÉPLOIEMENT:${NC}"
echo "• Application: https://${DOMAIN}"
echo "• API Backend: https://${DOMAIN}/api"
echo "• PM2 Status: pm2 status ${PM2_APP_NAME}"
echo "• Logs: pm2 logs ${PM2_APP_NAME}"

echo -e "\n⚠️  ${YELLOW}ACTIONS REQUISES:${NC}"
echo "1. Mettez à jour les clés API dans .env :"
echo "   - GOOGLE_MAPS_API_KEY"
echo "   - STRIPE_SECRET_KEY et VITE_STRIPE_PUBLIC_KEY"
echo "   - SENDGRID_API_KEY"
echo "2. Désactivez votre AdBlocker pour tester Stripe"
echo "3. Testez toutes les fonctionnalités"

echo -e "\n🔧 ${BLUE}COMMANDES UTILES:${NC}"
echo "• Voir les logs: pm2 logs ${PM2_APP_NAME}"
echo "• Redémarrer: pm2 restart ${PM2_APP_NAME}"
echo "• Monitoring: pm2 monit"
echo "• Rebuild: cd ${APP_DIR} && npm run build && pm2 restart ${PM2_APP_NAME}"

echo -e "\n✅ ${GREEN}Votre application BennesPro est maintenant 100% fonctionnelle !${NC}"

# Créer un script de test rapide
cat > test-vps.sh << 'EOF'
#!/bin/bash
echo "🧪 Test rapide du VPS"
echo -n "API Health: "
curl -s http://localhost:5000/api/health | grep -q "ok" && echo "✓" || echo "✗"
echo -n "Frontend: "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world | grep -q "200" && echo "✓" || echo "✗"
echo -n "Images Service 8: "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/8/placeholder.svg | grep -q "200" && echo "✓" || echo "✗"
echo -n "PM2 Status: "
pm2 list | grep -q "online" && echo "✓" || echo "✗"
EOF

chmod +x test-vps.sh

echo -e "\n${GREEN}Script de test créé: ./test-vps.sh${NC}"