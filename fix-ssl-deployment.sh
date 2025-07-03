#!/bin/bash

# DÉPLOIEMENT BENNESPRO AVEC CORRECTION SSL
clear
echo "🔧 CORRECTION SSL POUR BENNESPRO"
echo "================================"

DOMAIN="purpleguy.world"
EMAIL="your-email@example.com"

echo "🛠️ Correction de la configuration SSL pour $DOMAIN"

# Arrêter les services existants
echo "🛑 Arrêt des services existants..."
sudo docker-compose down

# Créer la configuration NGINX corrigée pour SSL
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Serveur HTTP pour Let's Encrypt et redirection HTTPS
    server {
        listen 80;
        server_name $DOMAIN;
        
        # Let's Encrypt ACME challenge - CRUCIAL pour la validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files \$uri =404;
        }
        
        # Redirection HTTPS pour tout le reste
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # Serveur HTTPS (actif seulement après génération du certificat)
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        # Configuration SSL
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Headers de sécurité
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Proxy vers l'application
        location / {
            proxy_pass http://app:5000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Docker Compose pour la phase SSL
cat > docker-compose.yml << EOF
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
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - bennespro_network

  nginx:
    image: nginx:alpine
    container_name: bennespro_nginx
    restart: unless-stopped
    depends_on:
      - app
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/letsencrypt
      - certbot_data:/var/www/certbot
    networks:
      - bennespro_network

volumes:
  postgres_data:
  redis_data:
  certbot_data:

networks:
  bennespro_network:
    driver: bridge
EOF

# Créer les dossiers nécessaires
mkdir -p ssl
mkdir -p certbot_data

echo "🚀 Démarrage des services sans HTTPS..."
sudo docker-compose up -d postgres redis app nginx

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 20

# Vérifier que NGINX répond sur le port 80
echo "🔍 Test de la configuration HTTP..."
if curl -I http://$DOMAIN/.well-known/acme-challenge/test 2>/dev/null | head -n1 | grep -q "404\|200"; then
    echo "✅ NGINX répond correctement sur le port 80"
else
    echo "❌ Problème avec la configuration NGINX"
    echo "📊 État des services:"
    sudo docker-compose ps
    exit 1
fi

# Générer le certificat SSL
echo "🔐 Génération du certificat SSL pour $DOMAIN..."
sudo docker run --rm \
    -v $(pwd)/ssl:/etc/letsencrypt \
    -v $(pwd)/certbot_data:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

# Vérifier si le certificat a été généré
if [ -f "ssl/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificat SSL généré avec succès!"
    
    # Redémarrer NGINX pour activer HTTPS
    echo "🔄 Redémarrage de NGINX avec HTTPS..."
    sudo docker-compose restart nginx
    
    # Attendre le redémarrage
    sleep 10
    
    # Test HTTPS
    echo "🔍 Test de la configuration HTTPS..."
    if curl -I https://$DOMAIN 2>/dev/null | head -n1 | grep -q "200\|301\|302"; then
        echo "✅ HTTPS fonctionne correctement!"
    else
        echo "⚠️ HTTPS en cours de configuration..."
    fi
    
else
    echo "❌ Échec de la génération du certificat SSL"
    echo "📋 Vérifiez que:"
    echo "   1. Le domaine $DOMAIN pointe vers cette adresse IP"
    echo "   2. Les ports 80 et 443 sont ouverts"
    echo "   3. Aucun autre service n'utilise ces ports"
    exit 1
fi

echo ""
echo "🎉 DÉPLOIEMENT SSL TERMINÉ !"
echo "============================"
echo "🔗 Application HTTPS: https://$DOMAIN"
echo "🔧 Redis: port 6379"
echo "🗄️ PostgreSQL: port 5432"
echo ""
echo "📋 Commandes utiles:"
echo "sudo docker-compose logs nginx     # Logs NGINX"
echo "sudo docker-compose ps             # État des services"
echo "curl -I https://$DOMAIN            # Test HTTPS"
EOF

# Rendre le script exécutable
chmod +x fix-ssl-deployment.sh

echo "✅ Script de correction SSL créé: fix-ssl-deployment.sh"