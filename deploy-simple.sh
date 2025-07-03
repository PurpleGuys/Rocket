#!/bin/bash

# DÉPLOIEMENT SIMPLE BENNESPRO - SANS NGINX
clear
echo "🚀 DÉPLOIEMENT SIMPLE BENNESPRO"
echo "==============================="

# Nettoyer complètement
echo "🧹 Nettoyage complet..."
sudo docker-compose down --remove-orphans --volumes 2>/dev/null || true
sudo docker system prune -f 2>/dev/null || true

# Arrêter les services système qui bloquent les ports
echo "🛑 Libération des ports..."
sudo systemctl stop apache2 nginx 2>/dev/null || true
sudo fuser -k 80/tcp 2>/dev/null || true
sudo fuser -k 443/tcp 2>/dev/null || true

# Créer docker-compose simplifié
cat > docker-compose-simple.yml << 'EOF'
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
      - PORT=5000
    ports:
      - "8080:5000"
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
EOF

# Démarrer les services
echo "🚀 Démarrage des services..."
sudo docker-compose -f docker-compose-simple.yml up -d

# Attendre le démarrage
echo "⏳ Attente du démarrage (60 secondes)..."
for i in {1..60}; do
    if curl -sf http://localhost:8080/api/health >/dev/null 2>&1; then
        echo "✅ Application démarrée avec succès!"
        break
    fi
    echo -n "."
    sleep 1
done

# Vérifications
echo ""
echo "🔍 Vérifications..."
echo "- État des conteneurs:"
sudo docker-compose -f docker-compose-simple.yml ps

echo ""
echo "- Test de connectivité:"
curl -I http://localhost:8080/api/health 2>/dev/null || echo "❌ API non accessible"

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "======================="
echo "🔗 Application: http://purpleguy.world:8080"
echo "🔗 API Health: http://purpleguy.world:8080/api/health"
echo "🗄️ PostgreSQL: port 5433"
echo "🔧 Redis: port 6379"
echo ""
echo "📋 Pour SSL plus tard:"
echo "1. Configurer un reverse proxy externe (Cloudflare, etc.)"
echo "2. Utiliser un certificat Let's Encrypt sur le domaine principal"
echo "3. Rediriger HTTPS vers le port 8080"
echo ""
echo "🧪 Tests rapides:"
echo "curl http://purpleguy.world:8080/api/health"
echo "curl http://purpleguy.world:8080/api/services"