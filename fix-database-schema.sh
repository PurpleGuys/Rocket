#!/bin/bash

# FIX DATABASE SCHEMA + NGINX ISSUES
clear
echo "🔧 CORRECTION BASE DE DONNÉES + NGINX"
echo "====================================="

# 1. Initialiser le schema de la base de données
echo "🗄️ Initialisation du schéma de base de données..."
sudo docker exec bennespro_app npx drizzle-kit push --force

# 2. Arrêter NGINX qui redémarre en boucle
echo "🛑 Arrêt de NGINX problématique..."
sudo docker stop bennespro_nginx 2>/dev/null || true
sudo docker rm bennespro_nginx 2>/dev/null || true

# 3. Redémarrer l'application pour s'assurer qu'elle voit les tables
echo "🔄 Redémarrage de l'application..."
sudo docker restart bennespro_app

# Attendre le redémarrage
echo "⏳ Attente du redémarrage..."
sleep 15

# 4. Vérifier les tables
echo "🔍 Vérification des tables créées..."
sudo docker exec bennespro_app psql -h postgres -U postgres -d bennespro -c "\dt"

# 5. Tester l'application directement
echo "🧪 Test de l'application..."
curl -I http://localhost:8080/api/health 2>/dev/null || echo "❌ Application non accessible"

# 6. Exposer l'application sur le port 80 sans NGINX
echo "🌐 Exposition de l'application sur le port 80..."
sudo docker run -d \
  --name bennespro_proxy \
  --network rem-bennes_bennespro_network \
  -p 80:80 \
  -p 443:443 \
  --restart unless-stopped \
  nginx:alpine \
  sh -c 'echo "
events { worker_connections 1024; }
http {
  server {
    listen 80;
    location / {
      proxy_pass http://bennespro_app:5000;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }
  }
}
" > /etc/nginx/nginx.conf && nginx -g "daemon off;"'

# Test final
echo "⏳ Attente de la configuration proxy..."
sleep 10

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "======================"
echo "🔗 Application: http://purpleguy.world"
echo "🔗 Application directe: http://purpleguy.world:8080"
echo "🔗 API Health: http://purpleguy.world/api/health"
echo ""
echo "📊 Vérifications:"
echo "sudo docker ps                    # État des conteneurs"
echo "curl http://purpleguy.world       # Test HTTP"
echo "curl http://purpleguy.world/api/health  # Test API"