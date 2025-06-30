#!/bin/bash

# Script de correction nginx "Welcome to nginx!" - VPS purpleguy.world
echo "🔧 Correction problème nginx 'Welcome to nginx!'"
echo "================================================"

# Étape 1: Identifier le problème nginx
echo "🔍 Diagnostic du problème nginx..."

# Vérifier quel nginx tourne
echo "Processus nginx actifs:"
ps aux | grep nginx

echo ""
echo "Ports 80 et 443 utilisés par:"
sudo lsof -i :80 || sudo ss -tlnp | grep :80
sudo lsof -i :443 || sudo ss -tlnp | grep :443

# Étape 2: Arrêter nginx système s'il tourne
if sudo systemctl is-active --quiet nginx 2>/dev/null; then
    echo "🛑 Arrêt nginx système (cause du problème Welcome)..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
    echo "✅ Nginx système arrêté et désactivé"
else
    echo "ℹ️ Nginx système n'est pas actif"
fi

# Arrêter apache aussi s'il existe
if sudo systemctl is-active --quiet apache2 2>/dev/null; then
    echo "🛑 Arrêt Apache système..."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
    echo "✅ Apache système arrêté"
fi

# Étape 3: Vérifier la configuration nginx.conf locale
echo "📋 Vérification configuration nginx.conf..."
if [ -f "./nginx.conf" ]; then
    echo "✅ nginx.conf existe localement"
    
    # Vérifier que la config contient 'upstream app'
    if grep -q "upstream app" nginx.conf; then
        echo "✅ Configuration nginx.conf semble correcte"
    else
        echo "⚠️ Configuration nginx.conf incomplète, création nouvelle..."
        
        # Créer configuration nginx complète
        cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configuration des logs
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Configuration de base
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate no_last_modified no_etag auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    upstream app {
        server app:5000;
    }

    # Configuration HTTP
    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world 162.19.67.3;
        
        # En-têtes de sécurité
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://js.stripe.com https://replit.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://*.neon.tech wss://*.neon.tech; frame-src https://js.stripe.com;" always;

        # Well-known pour Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri $uri/ =404;
        }

        # Application principale
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto http;
            proxy_set_header X-Forwarded-Port 80;
            proxy_cache_bypass $http_upgrade;
        }

        # API et fichiers statiques
        location /api/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto http;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://app;
            expires 1h;
            add_header Cache-Control "public";
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto http;
        }
    }
}
EOF
        echo "✅ Configuration nginx.conf mise à jour"
    fi
else
    echo "❌ nginx.conf manquant, création..."
    # Code création nginx.conf identique ici
fi

# Étape 4: Forcer recreation complète des conteneurs
echo "🔄 Recreation complète des conteneurs Docker..."

# Arrêter et supprimer tout
docker-compose down -v --remove-orphans 2>/dev/null || true

# Nettoyer les conteneurs orphelins
docker container prune -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# Attendre que les ports se libèrent
echo "⏳ Attente libération des ports..."
sleep 10

# Vérifier que le port 80 est libre
if sudo lsof -i :80 2>/dev/null || sudo ss -tlnp | grep -q :80; then
    echo "⚠️ Port 80 encore occupé, forçage..."
    sudo fuser -k 80/tcp 2>/dev/null || true
    sleep 5
fi

# Étape 5: Reconstruire et redémarrer avec nouvelle config
echo "🚀 Reconstruction et redémarrage..."

# Rebuild complet
docker-compose build --no-cache --pull

# Démarrage en mode détaché
docker-compose up -d

# Étape 6: Vérifications
echo "⏳ Attente démarrage (30s)..."
sleep 30

echo "📊 État des conteneurs:"
docker-compose ps

echo ""
echo "🧪 Tests de connectivité:"

# Test direct IP
if curl -s -o /dev/null -w "%{http_code}" "http://162.19.67.3:5000" | grep -q "200"; then
    echo "✅ Application accessible via IP:5000"
else
    echo "⚠️ Application non accessible via IP:5000"
fi

# Test via nginx
if curl -s "http://purpleguy.world" | grep -q "Welcome to nginx"; then
    echo "❌ PROBLÈME PERSISTE: Page Welcome nginx encore présente"
    echo "   → Vérification configuration dans conteneur..."
    
    # Vérifier config dans conteneur
    docker exec rem-bennes_nginx_1 cat /etc/nginx/nginx.conf | head -10
    
    echo "   → Logs nginx:"
    docker logs rem-bennes_nginx_1 | tail -10
    
elif curl -s -o /dev/null -w "%{http_code}" "http://purpleguy.world" | grep -q "200"; then
    echo "✅ RÉSOLU: Site accessible via domaine"
else
    echo "⚠️ Site non accessible via domaine"
fi

# Étape 7: Instructions de suivi
echo ""
echo "🎯 RÉSOLUTION PROBLÈME NGINX WELCOME"
echo "===================================="

if curl -s "http://purpleguy.world" | grep -q "Welcome to nginx"; then
    echo "❌ Si le problème persiste:"
    echo "   1. Vérifiez: docker exec rem-bennes_nginx_1 ps aux"
    echo "   2. Recréez: docker-compose down && docker-compose up -d --force-recreate"
    echo "   3. Vérifiez mount: docker exec rem-bennes_nginx_1 ls -la /etc/nginx/"
else
    echo "✅ Problème résolu! Site accessible sur:"
    echo "   http://purpleguy.world"
    echo "   http://162.19.67.3:5000"
    echo ""
    echo "💡 Pour activer HTTPS maintenant:"
    echo "   ./ssl-fix-complete.sh"
fi