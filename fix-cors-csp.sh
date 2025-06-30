#!/bin/bash

echo "🔧 Correction CORS et CSP - purpleguy.world"
echo "==========================================="

# 1. Arrêter les services
echo "🛑 Arrêt services..."
docker-compose down

# 2. Corriger la configuration nginx avec CSP permissive
echo "⚙️ Configuration nginx avec CSP corrigée..."
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

    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world 162.19.67.3;
        
        # En-têtes CORS permissifs
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        
        # CSP permissive pour développement
        add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com https://maps.googleapis.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: http: https:; connect-src 'self' http: https: ws: wss:; frame-src 'self' https://js.stripe.com;" always;

        # En-têtes de sécurité basiques
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gérer les preflight OPTIONS
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }

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
            
            # Pas de cache pour les pages principales
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        # API avec CORS
        location /api/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto http;
            
            # CORS pour API
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        }

        # Assets avec cache et CORS
        location /assets/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto http;
            
            # Cache pour les assets
            expires 1h;
            add_header Cache-Control "public, immutable";
            
            # CORS pour les assets
            add_header Access-Control-Allow-Origin "*" always;
        }

        # Fichiers statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto http;
            
            expires 1h;
            add_header Cache-Control "public";
            add_header Access-Control-Allow-Origin "*" always;
        }
    }
}
EOF

echo "✅ Configuration nginx avec CORS/CSP corrigée"

# 3. Redémarrer
echo "🚀 Redémarrage services..."
docker-compose up -d --build

# 4. Attendre
echo "⏳ Attente démarrage (30s)..."
sleep 30

# 5. Tests
echo "🧪 Tests:"

# Test simple
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://purpleguy.world" 2>/dev/null || echo "000")
echo "HTTP Status: $HTTP_CODE"

# Test assets
ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://purpleguy.world/assets/" 2>/dev/null || echo "000")
echo "Assets Status: $ASSET_CODE"

# Test avec headers CORS
echo "Headers CORS:"
curl -I -s "http://purpleguy.world" 2>/dev/null | grep -i "access-control\|content-security" || echo "Pas de headers CORS/CSP trouvés"

echo ""
echo "📊 État final:"
docker-compose ps

echo ""
echo "🎯 RÉSULTAT"
echo "==========="

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Site accessible: http://purpleguy.world"
    echo "✅ Configuration CORS/CSP permissive appliquée"
    echo ""
    echo "💡 Le site devrait maintenant charger sans erreurs CORS"
    echo "   Les assets CSS/JS devraient se charger correctement"
else
    echo "❌ Problème persiste - Code: $HTTP_CODE"
    echo "   Vérifiez les logs: docker-compose logs -f app"
fi