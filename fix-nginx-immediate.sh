#!/bin/bash

# CORRECTION IMMÉDIATE NGINX - SANS SSL
clear
echo "🔧 CORRECTION NGINX SANS SSL"
echo "============================"

# 1. Arrêter NGINX qui crash en boucle
echo "🛑 Arrêt de NGINX défaillant..."
sudo docker stop bennespro_nginx 2>/dev/null || true
sudo docker rm bennespro_nginx 2>/dev/null || true

# 2. Créer configuration NGINX simple SANS SSL
cat > nginx-http-only.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    upstream app {
        server bennespro_app:5000;
    }
    
    server {
        listen 80;
        server_name purpleguy.world _;
        
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_read_timeout 30s;
            proxy_send_timeout 30s;
        }
        
        location /api/health {
            proxy_pass http://app/api/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            access_log off;
        }
    }
}
EOF

# 3. Démarrer NGINX simple sans SSL
echo "🚀 Démarrage NGINX HTTP simple..."
sudo docker run -d \
  --name bennespro_nginx_simple \
  --network rem-bennes_bennespro_network \
  -p 80:80 \
  -v $(pwd)/nginx-http-only.conf:/etc/nginx/nginx.conf:ro \
  --restart unless-stopped \
  nginx:alpine

# 4. Attendre le démarrage
echo "⏳ Attente du démarrage NGINX..."
sleep 10

# 5. Vérifier que NGINX fonctionne
echo "🔍 Vérification NGINX..."
if curl -I http://localhost:80/api/health 2>/dev/null | head -n1 | grep -q "200\|302\|301"; then
    echo "✅ NGINX fonctionne!"
else
    echo "⚠️ NGINX en cours de démarrage..."
fi

# 6. Vérifier les logs NGINX
echo "📋 Logs NGINX (dernières 5 lignes):"
sudo docker logs bennespro_nginx_simple 2>&1 | tail -5

# 7. Test complet de connectivité
echo "🧪 Tests de connectivité:"
echo "- Port 80 (NGINX):"
curl -I http://localhost/api/health 2>/dev/null | head -n1 || echo "❌ Port 80 non accessible"

echo "- Port 8080 (direct):"
curl -I http://localhost:8080/api/health 2>/dev/null | head -n1 || echo "❌ Port 8080 non accessible"

# 8. Afficher l'état des conteneurs
echo "📊 État des conteneurs:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "======================"
echo "✅ NGINX simple démarré (HTTP seulement)"
echo "✅ Pas de certificats SSL requis"
echo "🔗 Application accessible: http://purpleguy.world"
echo "🔗 API Health: http://purpleguy.world/api/health"
echo ""
echo "📝 Pour SSL plus tard:"
echo "1. D'abord s'assurer que HTTP fonctionne"
echo "2. Générer certificats Let's Encrypt séparément"
echo "3. Redémarrer avec configuration SSL"