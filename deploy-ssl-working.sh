#!/bin/bash

# DÉPLOIEMENT SSL COMPLET QUI MARCHE
clear
echo "🔐 DÉPLOIEMENT SSL COMPLET"
echo "========================="

DOMAIN="purpleguy.world"
EMAIL="admin@purpleguy.world"

# 1. Nettoyer complètement
echo "🧹 Nettoyage complet..."
sudo docker stop $(sudo docker ps -q) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true
sudo docker system prune -f

# 2. Créer les dossiers SSL
mkdir -p ssl/live/$DOMAIN
mkdir -p ssl/archive/$DOMAIN
mkdir -p certbot-webroot

# 3. Créer NGINX pour phase 1 (HTTP + ACME challenge)
cat > nginx-ssl-phase1.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN;
        
        # ACME challenge pour Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Proxy vers l'app pour le reste
        location / {
            proxy_pass http://bennespro_app:5000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }
    }
}
EOF

# 4. Créer NGINX pour phase 2 (HTTPS complet)
cat > nginx-ssl-phase2.conf << EOF
events {
    worker_connections 1024;
}

http {
    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name $DOMAIN;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }
    
    # Serveur HTTPS
    server {
        listen 443 ssl;
        server_name $DOMAIN;
        
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        location / {
            proxy_pass http://bennespro_app:5000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF

# 5. Docker Compose pour SSL
cat > docker-compose-ssl.yml << EOF
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
      - ./nginx-current.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/letsencrypt
      - ./certbot-webroot:/var/www/certbot
    networks:
      - bennespro_network

volumes:
  postgres_data:
  redis_data:

networks:
  bennespro_network:
    driver: bridge
EOF

# 6. PHASE 1: Démarrer avec HTTP pour générer SSL
echo "🚀 PHASE 1: Démarrage avec HTTP..."
cp nginx-ssl-phase1.conf nginx-current.conf
sudo docker-compose -f docker-compose-ssl.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente des services..."
sleep 30

# 7. Générer le certificat SSL
echo "🔐 PHASE 2: Génération certificat SSL..."
sudo docker run --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

# 8. Vérifier que le certificat a été généré
if [ -f "ssl/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificat SSL généré avec succès!"
    
    # PHASE 3: Activer HTTPS
    echo "🔐 PHASE 3: Activation HTTPS..."
    cp nginx-ssl-phase2.conf nginx-current.conf
    sudo docker restart bennespro_nginx
    
    sleep 10
    
    # Test HTTPS
    echo "🔍 Test HTTPS..."
    if curl -I https://$DOMAIN/api/health 2>/dev/null | head -n1 | grep -q "200\|301\|302"; then
        echo "✅ HTTPS fonctionne parfaitement!"
    else
        echo "⚠️ HTTPS en cours de configuration..."
    fi
    
else
    echo "❌ Échec génération certificat SSL"
    echo "🔍 Diagnostic:"
    echo "- Vérifiez que $DOMAIN pointe vers cette IP"
    echo "- Vérifiez les ports 80/443 ouverts"
    echo "- Logs NGINX:"
    sudo docker logs bennespro_nginx | tail -10
    exit 1
fi

echo ""
echo "🎉 DÉPLOIEMENT SSL TERMINÉ !"
echo "============================"
echo "🔐 Application HTTPS: https://$DOMAIN"
echo "🔗 Redirection HTTP: http://$DOMAIN → https://$DOMAIN"
echo "🔒 Certificat SSL valide pour $DOMAIN"
echo ""
echo "🧪 Tests:"
echo "curl -I https://$DOMAIN"
echo "curl -I http://$DOMAIN  # Doit rediriger vers HTTPS"