#!/bin/bash

# CORRECTION PORTS NGINX + BASE DE DONNÉES VPS
echo "🔧 CORRECTION PORTS NGINX + BASE DE DONNÉES"
echo "==========================================="

# 1. Corriger docker-compose.yml pour exposer le port app
echo "📝 Correction docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
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
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bennespro_redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  app:
    build: .
    container_name: bennespro_app
    restart: unless-stopped
    ports:
      - "8080:5000"  # EXPOSITION DIRECTE DU PORT APP
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro
      - STRIPE_SECRET_KEY=sk_test_51RTkOhQWGRGBWlNRxSkMmOTKEGSt6ivClFhscWdpIP0i1B00FXRvUiXeec6PLCFN97lojsJXXLctpsQzWmXEIhh000qYJzLLxB
      - VITE_STRIPE_PUBLIC_KEY=pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: bennespro_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      app:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
EOF

# 2. Corriger nginx.conf pour pointer vers localhost:8080
echo "🌐 Correction NGINX configuration..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server host.docker.internal:8080;  # POINTER VERS HOST
    }

    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world;
        
        # Permettre Let's Encrypt challenges
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirection HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name purpleguy.world www.purpleguy.world;

        # Configuration SSL
        ssl_certificate /etc/letsencrypt/live/purpleguy.world/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/purpleguy.world/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Headers de sécurité
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Proxy vers l'application
        location / {
            proxy_pass http://host.docker.internal:8080;  # DIRECT HOST
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
EOF

# 3. Redémarrer les services avec la nouvelle configuration
echo "🔄 Redémarrage des services..."
sudo docker-compose down
sudo docker-compose up -d

echo "⏳ Attente démarrage services (45s)..."
sleep 45

# 4. Exécuter la migration Drizzle
echo "🗄️ Initialisation base de données..."
chmod +x vps-fix-database-schema.sh
./vps-fix-database-schema.sh

echo ""
echo "✅ CORRECTION PORTS + DB TERMINÉE"
echo "================================="
echo "🌐 Test direct app: http://purpleguy.world:8080"
echo "🔒 Site HTTPS: https://purpleguy.world"
echo "🩺 Health: http://purpleguy.world:8080/api/health"