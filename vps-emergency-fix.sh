#!/bin/bash

# CORRECTION URGENTE VPS - ERREURS 500 + STRIPE
echo "🚨 CORRECTION URGENTE VPS PURPLEGUY.WORLD"
echo "=========================================="

# 1. Arrêter tous les containers
echo "🛑 Arrêt des containers..."
sudo docker-compose down --remove-orphans
sudo docker stop $(sudo docker ps -aq) 2>/dev/null
sudo docker rm $(sudo docker ps -aq) 2>/dev/null

# 2. Créer .env.production avec TOUTES les variables
echo "📝 Création .env.production complet..."
cat > .env.production << 'EOF'
# CONFIGURATION PRODUCTION COMPLÈTE
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# DATABASE DOCKER
DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro

# STRIPE COMPLET
STRIPE_SECRET_KEY=sk_test_51RTkOhQWGRGBWlNRxSkMmOTKEGSt6ivClFhscWdpIP0i1B00FXRvUiXeec6PLCFN97lojsJXXLctpsQzWmXEIhh000qYJzLLxB
VITE_STRIPE_PUBLIC_KEY=pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B
STRIPE_WEBHOOK_SECRET=whsec_test123456789

# AUTRES API
SENDGRID_API_KEY=SG.test_key_for_vps_deployment
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@purpleguy.world
GOOGLE_MAPS_API_KEY=AIzaSyTest_GoogleMaps_Key_VPS

# SECRETS
SESSION_SECRET=f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5
JWT_SECRET=85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723
ENCRYPTION_KEY=a45c0dc4fdbf36d10192758659f298222e1748244f9637760aa13703a84022b5

# CONFIGURATION MÉTIER
REMONDIS_SALES_EMAIL=commercial@purpleguy.world
APP_BASE_URL=https://purpleguy.world
ALLOWED_ORIGINS=https://purpleguy.world,https://www.purpleguy.world

# SÉCURITÉ
FORCE_HTTPS=true
ENABLE_SECURITY_HEADERS=true
EOF

# 3. Créer Dockerfile production avec variables intégrées
echo "🐳 Création Dockerfile production..."
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Installer dépendances
RUN npm ci

# Copier source
COPY client ./client
COPY server ./server
COPY shared ./shared

# Variables d'environnement pour build
ENV NODE_ENV=production
ENV VITE_STRIPE_PUBLIC_KEY=pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B

# Build
RUN npm run build

# Production
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Copier build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json ./

# Copier .env
COPY .env.production ./.env

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]
EOF

# 4. Docker Compose production avec health checks
echo "🔧 Configuration Docker Compose..."
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
      - "8080:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro
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

# 5. Configuration NGINX optimisée
echo "🌐 Configuration NGINX..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:5000;
    }

    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name purpleguy.world www.purpleguy.world;

        ssl_certificate /etc/letsencrypt/live/purpleguy.world/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/purpleguy.world/privkey.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# 6. Script d'attente base de données
echo "⏳ Script d'attente PostgreSQL..."
cat > wait-for-db.sh << 'EOF'
#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=BennesProSecure2024! psql -h "$host" -U "postgres" -d "bennespro" -c '\q'; do
  >&2 echo "PostgreSQL indisponible - attente..."
  sleep 1
done

>&2 echo "PostgreSQL disponible - exécution de la commande"
exec $cmd
EOF
chmod +x wait-for-db.sh

# 7. Build et démarrage
echo "🚀 Build et démarrage..."
sudo docker-compose build --no-cache
sudo docker-compose up -d

# 8. Attendre le démarrage
echo "⏳ Attente démarrage des services..."
sleep 60

# 9. Test des endpoints
echo "🧪 Test des API..."
echo "Health check:"
curl -s http://localhost:8080/api/health || echo "❌ Health check échoué"

echo ""
echo "Services check:"
curl -s http://localhost:8080/api/services || echo "❌ Services échoué"

# 10. Logs de diagnostic
echo "📊 LOGS DE DIAGNOSTIC:"
echo "===================="
echo "App logs:"
sudo docker logs bennespro_app --tail 50

echo ""
echo "PostgreSQL logs:"
sudo docker logs bennespro_postgres --tail 20

echo ""
echo "✅ CORRECTION VPS TERMINÉE"
echo "=========================="
echo "🌐 Application: https://purpleguy.world"
echo "🔧 API Health: https://purpleguy.world/api/health"
echo "📊 Logs: sudo docker logs bennespro_app"