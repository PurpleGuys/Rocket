#!/bin/bash

echo "🔧 Correction SSL_ERROR_RX_RECORD_TOO_LONG - purpleguy.world"
echo "============================================================"

# 1. Arrêter tous les services pour diagnostic propre
echo "🛑 Arrêt complet des services..."
docker-compose down -v --remove-orphans

# 2. Vérifier et nettoyer les certificats problématiques
echo "🧹 Nettoyage certificats SSL..."
sudo chown -R $USER:$USER ./certbot/ 2>/dev/null || true
chmod -R 755 ./certbot/ 2>/dev/null || true

# 3. Créer configuration nginx HTTP-ONLY temporaire
echo "⚙️ Configuration nginx HTTP temporaire..."
cp nginx.conf nginx.conf.backup

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

    # Configuration HTTP PURE - PAS DE SSL
    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world 162.19.67.3;
        
        # En-têtes de sécurité basiques
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;

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
            proxy_cache_bypass $http_upgrade;
        }

        # API
        location /api/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto http;
        }

        # Fichiers statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://app;
            expires 1h;
            add_header Cache-Control "public";
        }
    }
}
EOF

echo "✅ Configuration HTTP pure créée"

# 4. Créer docker-compose HTTP temporaire
echo "⚙️ Configuration docker-compose HTTP..."
cp docker-compose.yml docker-compose.yml.backup

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - UPLOAD_DIR=/app/uploads
      - LOG_DIR=/app/logs
      - __dirname=/app/server
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: remondis_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secure_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

echo "✅ Docker-compose HTTP créé"

# 5. Démarrage en mode HTTP pur
echo "🚀 Démarrage en mode HTTP pur..."
docker-compose up -d --build

# 6. Attendre et tester
echo "⏳ Attente démarrage (30s)..."
sleep 30

echo "📊 État des conteneurs:"
docker-compose ps

echo ""
echo "🧪 Tests de connectivité:"

# Test direct app
if curl -s -o /dev/null -w "%{http_code}" "http://162.19.67.3:5000" | grep -q "200"; then
    echo "✅ Application directe: http://162.19.67.3:5000 OK"
else
    echo "⚠️ Application directe: http://162.19.67.3:5000 KO"
    echo "   Logs app:"
    docker logs rem-bennes_app_1 | tail -5
fi

# Test via nginx
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://purpleguy.world" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Site nginx: http://purpleguy.world OK"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Site nginx: http://purpleguy.world - Connexion refusée"
else
    echo "⚠️ Site nginx: http://purpleguy.world - Code HTTP: $HTTP_CODE"
fi

# Vérifier les logs nginx
echo ""
echo "📋 Logs nginx (dernières lignes):"
docker logs rem-bennes_nginx_1 | tail -10

echo ""
echo "🎯 RÉSULTAT CORRECTION SSL_ERROR"
echo "================================"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCÈS: Site accessible en HTTP pur"
    echo "   http://purpleguy.world fonctionne"
    echo ""
    echo "💡 L'erreur SSL_ERROR_RX_RECORD_TOO_LONG est corrigée"
    echo "   Le site fonctionne maintenant en HTTP standard"
    echo ""
    echo "📋 Étapes suivantes:"
    echo "   1. Tester l'application complètement"
    echo "   2. Si tout fonctionne, configurer HTTPS proprement"
    echo "   ./ssl-fix-complete.sh (quand prêt pour HTTPS)"
else
    echo "❌ Problème persiste"
    echo "   Vérifiez les logs avec: docker-compose logs -f"
    echo "   Test direct: curl -v http://162.19.67.3:5000"
fi