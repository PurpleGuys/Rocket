#!/bin/bash

echo "🔧 Correction Mixed Content HTTP/HTTPS - purpleguy.world"
echo "======================================================="

# 1. Arrêter services
echo "🛑 Arrêt services..."
docker-compose down

# 2. Configuration nginx ultra-permissive
echo "⚙️ Configuration nginx ultra-permissive..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 50M;

    upstream app {
        server app:5000;
    }

    # Configuration HTTP ULTRA-PERMISSIVE
    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world 162.19.67.3;
        
        # Désactiver complètement CSP
        # add_header Content-Security-Policy "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" always;
        
        # Headers CORS ultra-permissifs
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "*" always;
        add_header Access-Control-Allow-Headers "*" always;
        add_header Access-Control-Expose-Headers "*" always;

        # Proxy avec headers simplifiés
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # FORCER HTTP dans tous les forwards
            proxy_set_header X-Forwarded-Proto http;
            proxy_set_header X-Forwarded-Port 80;
            proxy_set_header X-Forwarded-Host $host;
            
            proxy_cache_bypass $http_upgrade;
        }

        # Proxy pour assets sans cache
        location /assets/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto http;
            proxy_set_header X-Real-IP $remote_addr;
            
            # Pas de cache pour debug
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        # API
        location /api/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto http;
        }
    }
}
EOF

echo "✅ Configuration nginx ultra-permissive créée"

# 3. Variables d'environnement FORCE HTTP
echo "⚙️ Variables d'environnement HTTP forcées..."
cat >> .env << 'EOF'

# FORCE HTTP - Pas de HTTPS
FORCE_HTTP=true
BASE_URL=http://purpleguy.world
ASSET_BASE_URL=http://purpleguy.world
VITE_API_URL=http://purpleguy.world/api
PUBLIC_URL=http://purpleguy.world

EOF

echo "✅ Variables d'environnement HTTP ajoutées"

# 4. Rebuild complet sans cache
echo "🚀 Rebuild complet sans cache..."
docker-compose build --no-cache
docker-compose up -d

# 5. Attendre longtemps pour le build
echo "⏳ Attente build et démarrage (45s)..."
sleep 45

# 6. Tests détaillés
echo "🧪 Tests détaillés:"

echo "📊 État conteneurs:"
docker-compose ps

echo ""
echo "🔍 Test connectivité de base:"
if curl -s -m 10 "http://purpleguy.world" > /tmp/test_page.html 2>/dev/null; then
    echo "✅ Page téléchargée avec succès"
    
    # Analyser le contenu
    if grep -q "https://" /tmp/test_page.html; then
        echo "⚠️ Page contient encore des URLs HTTPS:"
        grep -o 'https://[^"]*' /tmp/test_page.html | head -5
    else
        echo "✅ Pas d'URLs HTTPS détectées dans la page"
    fi
    
    # Vérifier les assets
    if grep -q "/assets/" /tmp/test_page.html; then
        echo "✅ Assets détectés dans la page"
        grep -o '/assets/[^"]*' /tmp/test_page.html | head -3
    else
        echo "⚠️ Pas d'assets détectés"
    fi
    
else
    echo "❌ Impossible de télécharger la page"
fi

echo ""
echo "🔍 Test asset direct:"
ASSET_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://purpleguy.world/assets/index-UROmFd9v.css" 2>/dev/null || echo "000")
echo "Asset CSS Status: $ASSET_TEST"

ASSET_JS_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://purpleguy.world/assets/index-B6RjP4Vf.js" 2>/dev/null || echo "000")
echo "Asset JS Status: $ASSET_JS_TEST"

echo ""
echo "📋 Logs app (dernières lignes):"
docker logs rem-bennes_app_1 2>&1 | tail -10

echo ""
echo "🎯 RÉSULTAT MIXED CONTENT"
echo "========================="

if [ -f "/tmp/test_page.html" ] && [ "$ASSET_TEST" = "200" ]; then
    echo "✅ SUCCÈS: Page chargée et assets accessibles"
    echo "   Site: http://purpleguy.world"
    echo "   Assets CSS/JS chargent correctement"
    echo ""
    echo "💡 L'écran blanc devrait être résolu"
    echo "   Les erreurs CORS/CSP devraient disparaître"
else
    echo "❌ Problème persiste"
    echo "   Page HTTP: $([ -f "/tmp/test_page.html" ] && echo "OK" || echo "KO")"
    echo "   Assets: $ASSET_TEST"
    echo ""
    echo "🔍 Debugging supplémentaire requis"
    echo "   Vérifiez: docker-compose logs -f app"
fi

rm -f /tmp/test_page.html