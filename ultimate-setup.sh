#!/bin/bash

# 🚀 ULTIMATE SETUP SCRIPT - BennesPro Production Complete
# =========================================================
# Ce script configure TOUT de A à Z pour un déploiement production parfait
# - Infrastructure Docker complète
# - Base de données PostgreSQL optimisée
# - Nginx avec SSL/TLS automatique
# - Monitoring et logs
# - Sécurité maximale
# - Performance optimisée
# - Backup automatique
# - CI/CD ready

set -e  # Arrêter en cas d'erreur

echo "🚀 ULTIMATE SETUP - BennesPro Production Complete"
echo "================================================="
echo "🎯 Configuration complète de A à Z en cours..."
echo ""

# Variables de configuration
DOMAIN=${1:-"purpleguy.world"}
EMAIL=${2:-"admin@${DOMAIN}"}
APP_NAME="bennespro"
DB_NAME="remondis_db"
DB_USER="postgres"
BACKUP_RETENTION_DAYS=30

echo "📋 Configuration:"
echo "   Domaine: $DOMAIN"
echo "   Email: $EMAIL"
echo "   App: $APP_NAME"
echo ""

# ==========================================
# 1. SYSTÈME ET DÉPENDANCES
# ==========================================
echo "🔧 1. Installation des dépendances système..."

# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Outils essentiels
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    vim \
    fail2ban \
    ufw \
    logrotate \
    cron \
    rsync

# Docker et Docker Compose
if ! command -v docker &> /dev/null; then
    echo "📦 Installation Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# Node.js (pour builds locaux si nécessaire)
if ! command -v node &> /dev/null; then
    echo "📦 Installation Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "✅ Dépendances système installées"

# ==========================================
# 2. SÉCURITÉ SYSTÈME
# ==========================================
echo "🔒 2. Configuration sécurité système..."

# Firewall UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Fail2ban pour SSH
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configuration fail2ban SSH
sudo tee /etc/fail2ban/jail.local > /dev/null << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl restart fail2ban

echo "✅ Sécurité système configurée"

# ==========================================
# 3. STRUCTURE PROJET
# ==========================================
echo "📁 3. Création structure projet..."

# Créer structure complète
mkdir -p /opt/$APP_NAME/{app,data,logs,backups,ssl,scripts,monitoring}
mkdir -p /opt/$APP_NAME/data/{postgres,redis,uploads}
mkdir -p /opt/$APP_NAME/logs/{nginx,app,postgres,redis,certbot}
mkdir -p /opt/$APP_NAME/ssl/{certs,renewal}
mkdir -p /opt/$APP_NAME/monitoring/{prometheus,grafana}

# Permissions
sudo chown -R $USER:$USER /opt/$APP_NAME
chmod -R 755 /opt/$APP_NAME

echo "✅ Structure projet créée"

# ==========================================
# 4. VARIABLES D'ENVIRONNEMENT SÉCURISÉES
# ==========================================
echo "🔐 4. Génération variables d'environnement..."

# Générer secrets sécurisés
JWT_SECRET=$(openssl rand -hex 64)
SESSION_SECRET=$(openssl rand -hex 64)
DB_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
ADMIN_PASSWORD=$(openssl rand -hex 16)

# Fichier .env production
cat > /opt/$APP_NAME/.env << EOF
# ===========================================
# BENNESPRO PRODUCTION ENVIRONMENT
# ===========================================

# Application
NODE_ENV=production
APP_NAME=$APP_NAME
PORT=5000
DOMAIN=$DOMAIN
BASE_URL=https://$DOMAIN

# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD

# Authentication
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000

# Email (à configurer)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@$DOMAIN
REMONDIS_SALES_EMAIL=commercial@$DOMAIN

# External APIs (à configurer)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# File Upload
UPLOAD_MAX_SIZE=50MB
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,webp

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# SSL/TLS
SSL_EMAIL=$EMAIL
CERTBOT_EMAIL=$EMAIL

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=info

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=$BACKUP_RETENTION_DAYS

# Admin par défaut
DEFAULT_ADMIN_EMAIL=admin@$DOMAIN
DEFAULT_ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF

# Sécuriser le fichier .env
chmod 600 /opt/$APP_NAME/.env

# Copier vers le projet actuel
cp /opt/$APP_NAME/.env .env

echo "✅ Variables d'environnement générées"
echo "📋 Mot de passe admin par défaut: $ADMIN_PASSWORD"

# ==========================================
# 5. DOCKER COMPOSE PRODUCTION COMPLET
# ==========================================
echo "🐳 5. Configuration Docker Compose production..."

cat > /opt/$APP_NAME/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Application principale
  app:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    container_name: bennespro_app
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./data/uploads:/app/uploads
      - ./logs/app:/app/logs
    networks:
      - bennespro_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Base de données PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: bennespro_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
      - ./logs/postgres:/var/log/postgresql
    networks:
      - bennespro_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3
    command: >
      postgres
      -c log_destination=stderr
      -c log_statement=all
      -c log_duration=on
      -c log_line_prefix='%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
      -c shared_preload_libraries=pg_stat_statements
      -c pg_stat_statements.track=all

  # Redis pour cache et sessions
  redis:
    image: redis:7-alpine
    container_name: bennespro_redis
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
      --appendfsync everysec
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
    volumes:
      - ./data/redis:/data
      - ./logs/redis:/var/log/redis
    networks:
      - bennespro_network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: bennespro_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/certs:/etc/letsencrypt:ro
      - ./ssl/renewal:/var/www/certbot:rw
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - app
    networks:
      - bennespro_network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Certbot pour SSL
  certbot:
    image: certbot/certbot:latest
    container_name: bennespro_certbot
    volumes:
      - ./ssl/certs:/etc/letsencrypt
      - ./ssl/renewal:/var/www/certbot
      - ./logs/certbot:/var/log/letsencrypt
    command: >
      sh -c "while :; do
        certbot renew --quiet --webroot --webroot-path=/var/www/certbot;
        sleep 12h;
      done"
    networks:
      - bennespro_network

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: bennespro_prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/prometheus/data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    networks:
      - bennespro_network

  # Monitoring - Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: bennespro_grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD}
    volumes:
      - ./monitoring/grafana/data:/var/lib/grafana
    networks:
      - bennespro_network

networks:
  bennespro_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  grafana_data:
  prometheus_data:
EOF

# Copier vers le projet actuel
cp /opt/$APP_NAME/docker-compose.yml docker-compose.yml

echo "✅ Docker Compose configuré"

# ==========================================
# 6. DOCKERFILE PRODUCTION OPTIMISÉ
# ==========================================
echo "🏗️ 6. Création Dockerfile production..."

cat > /opt/$APP_NAME/Dockerfile.prod << 'EOF'
# Production Dockerfile - Multi-stage optimisé
FROM node:18-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    postgresql-client \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM base AS deps
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci --frozen-lockfile

# ===========================================
# Stage 2: Builder
# ===========================================
FROM base AS builder
WORKDIR /app

# Copier les dépendances depuis l'étape précédente
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build de l'application
RUN npm run build

# Nettoyer les devDependencies
RUN npm ci --only=production && npm cache clean --force

# ===========================================
# Stage 3: Runner
# ===========================================
FROM base AS runner
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000

# Créer les dossiers nécessaires
RUN mkdir -p logs uploads dist && \
    chown -R nodejs:nodejs /app

# Copier les fichiers nécessaires
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/uploads ./uploads

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 5000

# Point d'entrée avec Tini pour la gestion des signaux
ENTRYPOINT ["/sbin/tini", "--"]

# Commande par défaut
CMD ["node", "dist/index.js"]
EOF

# Copier vers le projet actuel
cp /opt/$APP_NAME/Dockerfile.prod Dockerfile.prod

echo "✅ Dockerfile production créé"

# ==========================================
# 7. CONFIGURATION NGINX PRODUCTION
# ==========================================
echo "🌐 7. Configuration Nginx production..."

cat > /opt/$APP_NAME/nginx.conf << EOF
# Configuration Nginx Production - Optimisée et Sécurisée
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Optimisations performance
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Types MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for" '
                    'rt=\$request_time uct="\$upstream_connect_time" '
                    'uht="\$upstream_header_time" urt="\$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    server_tokens off;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream
    upstream app {
        server app:5000;
        keepalive 32;
    }

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        
        # ACME Challenge pour Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files \$uri \$uri/ =404;
        }

        # Redirection HTTPS
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # Configuration HTTPS
    server {
        listen 443 ssl http2;
        server_name $DOMAIN www.$DOMAIN;

        # Certificats SSL
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        # Configuration SSL moderne
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;

        # OCSP Stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

        # En-têtes de sécurité
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://maps.googleapis.com; frame-src https://js.stripe.com;" always;

        # Application principale
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header X-Forwarded-Port \$server_port;
            proxy_cache_bypass \$http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API avec rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://app;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Login avec rate limiting strict
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://app;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Assets statiques avec cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            proxy_pass http://app;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }

        # Uploads
        location /uploads/ {
            proxy_pass http://app;
            expires 1M;
            add_header Cache-Control "public";
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://app;
        }
    }
}
EOF

# Copier vers le projet actuel
cp /opt/$APP_NAME/nginx.conf nginx.conf

echo "✅ Configuration Nginx créée"

# ==========================================
# 8. SCRIPTS D'AUTOMATISATION
# ==========================================
echo "⚙️ 8. Création scripts d'automatisation..."

# Script de déploiement
cat > /opt/$APP_NAME/scripts/deploy.sh << 'EOF'
#!/bin/bash
# Script de déploiement automatisé

set -e

echo "🚀 Déploiement BennesPro..."

# Pull du code
git pull origin main

# Build et déploiement
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Vérification santé
echo "⏳ Vérification santé des services..."
sleep 30

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Déploiement réussi"
else
    echo "❌ Déploiement échoué"
    exit 1
fi
EOF

# Script de backup
cat > /opt/$APP_NAME/scripts/backup.sh << EOF
#!/bin/bash
# Script de backup automatisé

BACKUP_DIR="/opt/$APP_NAME/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/backup_\$DATE.tar.gz"

echo "📦 Backup en cours..."

# Créer le dossier de backup
mkdir -p \$BACKUP_DIR

# Backup base de données
docker exec bennespro_postgres pg_dump -U $DB_USER $DB_NAME > \$BACKUP_DIR/db_\$DATE.sql

# Backup fichiers
tar -czf \$BACKUP_FILE \
    /opt/$APP_NAME/data/uploads \
    /opt/$APP_NAME/.env \
    \$BACKUP_DIR/db_\$DATE.sql

# Nettoyer les anciens backups
find \$BACKUP_DIR -name "backup_*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
find \$BACKUP_DIR -name "db_*.sql" -mtime +$BACKUP_RETENTION_DAYS -delete

echo "✅ Backup terminé: \$BACKUP_FILE"
EOF

# Script de monitoring
cat > /opt/$APP_NAME/scripts/health-check.sh << 'EOF'
#!/bin/bash
# Script de monitoring santé

SERVICES=("app" "postgres" "redis" "nginx")
FAILED=0

echo "🔍 Vérification santé des services..."

for service in "${SERVICES[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "bennespro_$service.*Up"; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: FAILED"
        FAILED=1
    fi
done

# Test HTTP
if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    echo "✅ HTTP: OK"
else
    echo "❌ HTTP: FAILED"
    FAILED=1
fi

if [ $FAILED -eq 1 ]; then
    echo "🚨 Problèmes détectés!"
    exit 1
else
    echo "✅ Tous les services sont opérationnels"
fi
EOF

# Rendre les scripts exécutables
chmod +x /opt/$APP_NAME/scripts/*.sh

# Copier vers le projet actuel
cp -r /opt/$APP_NAME/scripts/ .

echo "✅ Scripts d'automatisation créés"

# ==========================================
# 9. CONFIGURATION MONITORING
# ==========================================
echo "📊 9. Configuration monitoring..."

# Prometheus configuration
mkdir -p /opt/$APP_NAME/monitoring/prometheus
cat > /opt/$APP_NAME/monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'bennespro-app'
    static_configs:
      - targets: ['app:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
EOF

echo "✅ Monitoring configuré"

# ==========================================
# 10. TÂCHES CRON
# ==========================================
echo "⏰ 10. Configuration tâches automatiques..."

# Backup quotidien
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/$APP_NAME/scripts/backup.sh >> /opt/$APP_NAME/logs/backup.log 2>&1") | crontab -

# Health check toutes les 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/$APP_NAME/scripts/health-check.sh >> /opt/$APP_NAME/logs/health.log 2>&1") | crontab -

# Nettoyage logs hebdomadaire
(crontab -l 2>/dev/null; echo "0 1 * * 0 find /opt/$APP_NAME/logs -name '*.log' -mtime +7 -delete") | crontab -

echo "✅ Tâches automatiques configurées"

# ==========================================
# 11. INITIALISATION SSL
# ==========================================
echo "🔐 11. Initialisation SSL..."

# Script SSL initial
cat > /opt/$APP_NAME/scripts/ssl-init.sh << EOF
#!/bin/bash

echo "🔐 Initialisation SSL pour $DOMAIN..."

# Créer certificat temporaire
mkdir -p /opt/$APP_NAME/ssl/certs/live/$DOMAIN
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout /opt/$APP_NAME/ssl/certs/live/$DOMAIN/privkey.pem \
    -out /opt/$APP_NAME/ssl/certs/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN"

# Démarrer nginx temporairement
docker-compose up -d nginx

# Obtenir certificat réel
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Redémarrer nginx avec le vrai certificat
docker-compose restart nginx

echo "✅ SSL configuré pour $DOMAIN"
EOF

chmod +x /opt/$APP_NAME/scripts/ssl-init.sh

echo "✅ SSL prêt à être initialisé"

# ==========================================
# 12. SCRIPT DE DÉMARRAGE COMPLET
# ==========================================
echo "🚀 12. Script de démarrage complet..."

cat > /opt/$APP_NAME/scripts/start.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage BennesPro Production..."

cd /opt/bennespro

# Vérifier que Docker fonctionne
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker n'est pas disponible"
    exit 1
fi

# Build et démarrage
echo "📦 Build des conteneurs..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente démarrage des services..."
sleep 60

# Vérification
echo "🔍 Vérification des services..."
./scripts/health-check.sh

echo "✅ BennesPro démarré avec succès!"
echo "🌐 Application disponible sur: https://purpleguy.world"
echo "📊 Monitoring Grafana: http://localhost:3000"
echo "📈 Prometheus: http://localhost:9090"
EOF

chmod +x /opt/$APP_NAME/scripts/start.sh

echo "✅ Script de démarrage créé"

# ==========================================
# 13. COPIE VERS PROJET ACTUEL
# ==========================================
echo "📋 13. Copie des fichiers vers le projet..."

# Copier tous les fichiers essentiels
cp /opt/$APP_NAME/.env .
cp /opt/$APP_NAME/docker-compose.yml .
cp /opt/$APP_NAME/Dockerfile.prod .
cp /opt/$APP_NAME/nginx.conf .

# Créer structure dans le projet actuel
mkdir -p scripts monitoring/prometheus
cp -r /opt/$APP_NAME/scripts/* scripts/
cp -r /opt/$APP_NAME/monitoring/* monitoring/

echo "✅ Fichiers copiés"

# ==========================================
# 14. DOCUMENTATION FINALE
# ==========================================
echo "📚 14. Génération documentation..."

cat > PRODUCTION_SETUP.md << EOF
# 🚀 BennesPro - Setup Production Complet

## 📋 Résumé de l'installation

✅ **Système sécurisé** avec firewall et fail2ban  
✅ **Docker Compose** complet avec tous les services  
✅ **Base de données PostgreSQL** optimisée  
✅ **Redis** pour cache et sessions  
✅ **Nginx** avec SSL/TLS automatique  
✅ **Monitoring** Prometheus + Grafana  
✅ **Backups automatiques** quotidiens  
✅ **Scripts d'automatisation** complets  
✅ **Sécurité maximale** et optimisations  

## 🔐 Credentials générés

- **Admin par défaut**: admin@$DOMAIN / $ADMIN_PASSWORD
- **Base de données**: $DB_USER / [généré automatiquement]
- **Grafana**: admin / $ADMIN_PASSWORD

## 🚀 Démarrage rapide

\`\`\`bash
# 1. Aller dans le dossier production
cd /opt/$APP_NAME

# 2. Initialiser SSL (première fois)
./scripts/ssl-init.sh

# 3. Démarrer l'application
./scripts/start.sh
\`\`\`

## 🌐 URLs d'accès

- **Application**: https://$DOMAIN
- **Monitoring**: http://localhost:3000 (Grafana)
- **Métriques**: http://localhost:9090 (Prometheus)

## 📊 Scripts disponibles

- \`scripts/deploy.sh\` - Déploiement automatisé
- \`scripts/backup.sh\` - Backup complet
- \`scripts/health-check.sh\` - Vérification santé
- \`scripts/ssl-init.sh\` - Initialisation SSL
- \`scripts/start.sh\` - Démarrage complet

## 🔧 Configuration requise

Avant le premier démarrage, configurer dans \`.env\`:

\`\`\`env
SENDGRID_API_KEY=your-sendgrid-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
\`\`\`

## 📦 Backups

- **Automatique**: Tous les jours à 2h00
- **Localisation**: /opt/$APP_NAME/backups
- **Rétention**: $BACKUP_RETENTION_DAYS jours

## 🔍 Monitoring

- **Health checks**: Toutes les 5 minutes
- **Métriques**: Collectées par Prometheus
- **Dashboards**: Disponibles dans Grafana
- **Logs**: Centralisés dans /opt/$APP_NAME/logs

## 🚨 En cas de problème

\`\`\`bash
# Vérifier les services
./scripts/health-check.sh

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart [service]
\`\`\`
EOF

echo "✅ Documentation générée"

# ==========================================
# 15. RÉSUMÉ FINAL
# ==========================================
echo ""
echo "🎉 SETUP COMPLET TERMINÉ!"
echo "========================="
echo ""
echo "📁 Installation dans: /opt/$APP_NAME"
echo "🌐 Domaine configuré: $DOMAIN"
echo "📧 Email SSL: $EMAIL"
echo ""
echo "🔐 CREDENTIALS IMPORTANTS:"
echo "   Admin: admin@$DOMAIN / $ADMIN_PASSWORD"
echo "   Grafana: admin / $ADMIN_PASSWORD"
echo ""
echo "🚀 PROCHAINES ÉTAPES:"
echo "   1. Configurer les clés API dans .env"
echo "   2. cd /opt/$APP_NAME"
echo "   3. ./scripts/ssl-init.sh"
echo "   4. ./scripts/start.sh"
echo ""
echo "📊 URLS D'ACCÈS:"
echo "   Application: https://$DOMAIN"
echo "   Grafana: http://localhost:3000"
echo "   Prometheus: http://localhost:9090"
echo ""
echo "📚 Documentation: PRODUCTION_SETUP.md"
echo ""
echo "✅ Tout est prêt pour la production!"

# Sauvegarder les infos importantes
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" > /opt/$APP_NAME/CREDENTIALS.txt
echo "DB_PASSWORD=$DB_PASSWORD" >> /opt/$APP_NAME/CREDENTIALS.txt
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> /opt/$APP_NAME/CREDENTIALS.txt
chmod 600 /opt/$APP_NAME/CREDENTIALS.txt

echo ""
echo "💾 Credentials sauvegardés dans: /opt/$APP_NAME/CREDENTIALS.txt"
echo ""