#!/bin/bash

# =====================================
# DÉPLOIEMENT PRODUCTION BENNESPRO
# VPS: 162.19.67.3 | Domain: purpleguy.world
# =====================================

set -e  # Arrêter en cas d'erreur

VPS_IP="162.19.67.3"
VPS_USER="ubuntu"
DOMAIN="purpleguy.world"
APP_NAME="bennespro"
APP_DIR="/var/www/$APP_NAME"

echo "🚀 DÉPLOIEMENT PRODUCTION BENNESPRO"
echo "===================================="
echo "VPS: $VPS_IP"
echo "Domain: $DOMAIN"
echo "App: $APP_NAME"
echo ""

# 1. BUILD LOCAL
echo "📦 1. Construction de l'application..."
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi
echo "✅ Application construite"

# 2. PRÉPARATION ARCHIVE
echo "📋 2. Préparation des fichiers..."
tar -czf bennespro-production.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=attached_assets \
    --exclude=scripts \
    package.json \
    package-lock.json \
    server/ \
    client/ \
    shared/ \
    dist/ \
    uploads/ \
    .env \
    drizzle.config.ts \
    tsconfig.json \
    postcss.config.js \
    tailwind.config.ts \
    vite.config.ts \
    components.json

echo "✅ Archive créée: bennespro-production.tar.gz"

# 3. TRANSFERT VERS VPS
echo "🌐 3. Transfert vers VPS..."
scp bennespro-production.tar.gz $VPS_USER@$VPS_IP:/tmp/
echo "✅ Fichiers transférés"

# 4. INSTALLATION SUR VPS
echo "⚙️ 4. Installation sur VPS..."
ssh $VPS_USER@$VPS_IP << 'REMOTE_SCRIPT'
set -e

APP_NAME="bennespro"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="purpleguy.world"

echo "📦 Installation système..."
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx pm2

# Installation Node.js 18
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "📁 Préparation répertoires..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo "📂 Extraction application..."
cd $APP_DIR
tar -xzf /tmp/bennespro-production.tar.gz
rm /tmp/bennespro-production.tar.gz

echo "📦 Installation dépendances..."
npm ci --only=production

echo "🗄️ Configuration PostgreSQL..."
sudo -u postgres psql << 'SQL'
-- Créer la base et l'utilisateur si ils n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remondis_db') THEN
        CREATE USER remondis_db WITH PASSWORD 'Remondis60110$';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remondis_db') THEN
        CREATE DATABASE remondis_db OWNER remondis_db;
    END IF;
    
    GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis_db;
END $$;
SQL

echo "📋 Configuration environnement production..."
cat > $APP_DIR/.env.production << 'ENV'
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Base de données
DATABASE_URL=postgresql://remondis_db:Remondis60110$@localhost:5432/remondis_db

# Secrets (générés automatiquement)
SESSION_SECRET=f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5
JWT_SECRET=85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723

# Configuration métier
REMONDIS_SALES_EMAIL=commercial@remondis.fr
APP_BASE_URL=https://purpleguy.world
ALLOWED_ORIGINS=https://purpleguy.world,https://www.purpleguy.world

# Tarifs par défaut
DEFAULT_TRANSPORT_PRICE_PER_KM=1.50
DEFAULT_MINIMUM_FLAT_RATE=50.00
DEFAULT_HOURLY_RATE=45.00

# Sécurité
SESSION_MAX_AGE=604800000
FORCE_HTTPS=true
ENABLE_SECURITY_HEADERS=true

# Upload
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=./uploads
ENV

echo "🌐 Configuration Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN << 'NGINX'
server {
    listen 80;
    server_name purpleguy.world www.purpleguy.world;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name purpleguy.world www.purpleguy.world;
    
    # SSL configuration (will be handled by certbot)
    
    # Logs
    access_log /var/log/nginx/bennespro_access.log;
    error_log /var/log/nginx/bennespro_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # File uploads
    client_max_body_size 10M;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /uploads {
        alias /var/www/bennespro/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Activer le site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "🔧 Test configuration Nginx..."
sudo nginx -t

echo "🚀 Démarrage services..."
sudo systemctl reload nginx

# Initialiser la base de données
echo "🗄️ Initialisation base de données..."
cd $APP_DIR
npm run db:push || echo "Migration déjà appliquée"

echo "🎯 Configuration PM2..."
cat > $APP_DIR/ecosystem.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'bennespro',
    script: 'dist/index.js',
    cwd: '/var/www/bennespro',
    env_file: '.env.production',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/bennespro.error.log',
    out_file: '/var/log/pm2/bennespro.out.log',
    log_file: '/var/log/pm2/bennespro.combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
PM2

# Démarrer avec PM2
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "🔒 Configuration SSL..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo "✅ Application déployée et démarrée !"
echo "🌐 Accès: https://$DOMAIN"
echo "📊 Monitoring: pm2 monit"
echo "📝 Logs: pm2 logs bennespro"

REMOTE_SCRIPT

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "========================"
echo "🌐 Site: https://$DOMAIN"
echo "🔧 SSH: ssh $VPS_USER@$VPS_IP"
echo "📊 Status: ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo "📝 Logs: ssh $VPS_USER@$VPS_IP 'pm2 logs bennespro'"
echo ""
echo "📋 Commandes utiles:"
echo "  • Redémarrer: ssh $VPS_USER@$VPS_IP 'pm2 restart bennespro'"
echo "  • Monitoring: ssh $VPS_USER@$VPS_IP 'pm2 monit'"
echo "  • Status: ssh $VPS_USER@$VPS_IP 'sudo systemctl status nginx'"

# Nettoyage
rm -f bennespro-production.tar.gz

echo "🔥 BENNESPRO EN PRODUCTION SUR https://$DOMAIN"