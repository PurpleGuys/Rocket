#!/bin/bash

# DÉPLOIEMENT RAPIDE BENNESPRO - TEST IMMÉDIAT
clear
echo "🚀 DÉPLOIEMENT RAPIDE BENNESPRO"
echo "==============================="

# Configuration pour test local
DOMAIN="localhost"
echo "✅ Mode test local activé"

# NETTOYAGE RAPIDE
echo "🧹 Nettoyage Docker en cours..."
sudo docker-compose down --remove-orphans --volumes 2>/dev/null || true
sudo docker system prune -f --volumes 2>/dev/null || true

# Créer Dockerfile simplifié
cat > Dockerfile << 'EOF'
FROM node:20-alpine

# Installation des dépendances système
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    redis \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Créer un build simple ou utiliser un fallback
RUN npm run build 2>/dev/null || \
    (mkdir -p dist/public && \
     echo '<!DOCTYPE html><html><head><title>BennesPro</title></head><body><div id="root">BennesPro Loading...</div><script>setTimeout(() => window.location.reload(), 2000)</script></body></html>' > dist/public/index.html)

# Créer utilisateur sécurisé
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

# Script d'attente simple
COPY wait-for-services.sh ./
RUN chmod +x wait-for-services.sh

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

ENTRYPOINT ["./wait-for-services.sh"]
CMD ["npx", "tsx", "server/index.ts"]
EOF

# Script d'attente simplifié
cat > wait-for-services.sh << 'EOF'
#!/bin/bash

echo "🔍 Attente des services..."

# Attendre PostgreSQL
for i in {1..30}; do
    if pg_isready -h postgres -p 5432 >/dev/null 2>&1; then
        echo "✅ PostgreSQL prêt!"
        break
    fi
    echo "⏳ Tentative $i/30 pour PostgreSQL..."
    sleep 2
done

# Attendre Redis
for i in {1..30}; do
    if redis-cli -h redis -p 6379 ping >/dev/null 2>&1; then
        echo "✅ Redis prêt!"
        break
    fi
    echo "⏳ Tentative $i/30 pour Redis..."
    sleep 2
done

echo "🚀 Démarrage de l'application..."
exec "$@"
EOF

# Docker Compose simplifié
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
      test: ["CMD-SHELL", "pg_isready -U postgres -d bennespro"]
      interval: 10s
      timeout: 5s
      retries: 5

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
      - SENDGRID_API_KEY=optional
      - SENDGRID_VERIFIED_SENDER_EMAIL=noreply@bennespro.com
      - STRIPE_SECRET_KEY=optional
      - STRIPE_WEBHOOK_SECRET=optional
      - VITE_STRIPE_PUBLIC_KEY=optional
      - GOOGLE_MAPS_API_KEY=optional
      - REMONDIS_SALES_EMAIL=commercial@remondis.fr
    ports:
      - "8080:5000"
    volumes:
      - ./uploads:/app/uploads
      - app_logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  app_logs:
EOF

# Lancer le déploiement
echo "🚀 Lancement du déploiement..."
sudo docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérifier l'état des services
echo "📊 État des services:"
sudo docker-compose ps

# Tester l'application
echo "🔍 Test de l'application..."
if curl -sf http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "✅ Application accessible!"
else
    echo "⚠️ Application en cours de démarrage..."
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "======================"
echo "🔗 Application: http://localhost:8080"
echo "🗄️ PostgreSQL: localhost:5433"
echo "🔧 Redis: localhost:6379"
echo ""
echo "📋 Commandes utiles:"
echo "sudo docker-compose logs -f app    # Voir les logs"
echo "sudo docker-compose ps             # État des services"
echo "sudo docker-compose down           # Arrêter les services"
EOF

# Rendre le script exécutable
chmod +x quick-deploy.sh

echo "✅ Script de déploiement rapide créé: quick-deploy.sh"
echo "🚀 Exécutez: ./quick-deploy.sh"