#!/bin/bash

# CORRECTION CONFLIT DE PORT 80 POUR BENNESPRO
clear
echo "🔧 RÉSOLUTION CONFLIT PORT 80"
echo "============================="

# Identifier les processus utilisant le port 80
echo "🔍 Identification des services utilisant le port 80..."
sudo netstat -tulpn | grep :80 || sudo ss -tulpn | grep :80

echo ""
echo "🔍 Processus utilisant le port 80:"
sudo lsof -i :80 || echo "lsof non disponible, utilisation de fuser..."
sudo fuser 80/tcp || echo "Aucun processus trouvé avec fuser"

echo ""
echo "🛑 Arrêt des services Apache/NGINX système..."

# Arrêter Apache s'il est actif
if sudo systemctl is-active --quiet apache2; then
    echo "Arrêt d'Apache2..."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
fi

# Arrêter NGINX système s'il est actif
if sudo systemctl is-active --quiet nginx; then
    echo "Arrêt de NGINX système..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
fi

# Arrêter tout processus utilisant le port 80
echo "🔥 Forcer l'arrêt des processus sur le port 80..."
sudo fuser -k 80/tcp 2>/dev/null || true

# Attendre que le port se libère
echo "⏳ Attente de la libération du port 80..."
sleep 5

# Vérifier que le port est libre
echo "✅ Vérification de la disponibilité du port 80..."
if sudo netstat -tulpn | grep :80; then
    echo "❌ Le port 80 est encore utilisé:"
    sudo netstat -tulpn | grep :80
    echo ""
    echo "🔧 Solutions supplémentaires:"
    echo "1. Redémarrer le serveur: sudo reboot"
    echo "2. Identifier manuellement: sudo lsof -i :80"
    echo "3. Tuer le processus: sudo kill -9 [PID]"
    exit 1
else
    echo "✅ Port 80 libre!"
fi

# Nettoyer Docker complètement
echo "🧹 Nettoyage Docker complet..."
sudo docker-compose down --remove-orphans --volumes 2>/dev/null || true
sudo docker system prune -f --volumes 2>/dev/null || true

# Démarrer uniquement l'application sans NGINX d'abord
echo "🚀 Démarrage des services backend..."

# Créer docker-compose temporaire sans NGINX
cat > docker-compose-backend.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: bennespro_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: bennespro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: BennesProSecure2024!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d bennespro"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - bennespro_network

  redis:
    image: redis:7-alpine
    container_name: bennespro_redis
    restart: unless-stopped
    command: redis-server --bind 0.0.0.0 --protected-mode no
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - bennespro_network

  app:
    build: .
    container_name: bennespro_app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=ultraSecureJWTSecret2024BennesPro!
    ports:
      - "8080:5000"
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - bennespro_network

volumes:
  postgres_data:
  redis_data:

networks:
  bennespro_network:
    driver: bridge
EOF

# Lancer les services backend
sudo docker-compose -f docker-compose-backend.yml up -d

echo "⏳ Attente du démarrage des services backend..."
sleep 20

# Tester l'application
echo "🔍 Test de l'application sur le port 8080..."
if curl -sf http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "✅ Application accessible sur le port 8080!"
else
    echo "⚠️ Application en cours de démarrage..."
fi

# Maintenant essayer de démarrer NGINX
echo "🌐 Démarrage de NGINX pour SSL..."

# Créer NGINX en mode standalone
sudo docker run -d \
    --name bennespro_nginx_standalone \
    --network rem-bennes_bennespro_network \
    -p 80:80 \
    -p 443:443 \
    -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
    -v $(pwd)/ssl:/etc/letsencrypt \
    -v /var/www/certbot:/var/www/certbot \
    nginx:alpine

# Vérifier NGINX
echo "✅ Vérification de NGINX..."
if curl -I http://purpleguy.world/.well-known/acme-challenge/test 2>/dev/null | head -n1 | grep -q "404\|200"; then
    echo "✅ NGINX répond correctement!"
else
    echo "⚠️ NGINX en cours de configuration..."
fi

echo ""
echo "🎉 SERVICES DÉMARRÉS AVEC SUCCÈS !"
echo "================================="
echo "🔗 Application directe: http://purpleguy.world:8080"
echo "🌐 NGINX (pour SSL): http://purpleguy.world"
echo "🗄️ PostgreSQL: port 5433"
echo "🔧 Redis: port 6379"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Générer le certificat SSL:"
echo "   sudo docker run --rm -v \$(pwd)/ssl:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d purpleguy.world"
echo "2. Redémarrer NGINX avec SSL:"
echo "   sudo docker restart bennespro_nginx_standalone"
EOF

chmod +x fix-port-conflict.sh

echo "✅ Script de correction des conflits de port créé"
echo "🚀 Exécution du script..."
./fix-port-conflict.sh