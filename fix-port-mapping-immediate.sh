#!/bin/bash

# CORRECTION IMMÉDIATE PORT MAPPING DOCKER
echo "🔧 CORRECTION PORT MAPPING DOCKER"
echo "================================="

# 1. Diagnostic rapide
echo "📦 État containers avant correction:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Arrêter tous les containers
echo "🛑 Arrêt de tous les containers..."
sudo docker-compose down --remove-orphans

# 3. Créer docker-compose.yml corrigé avec port mapping direct
echo "📝 Création docker-compose.yml corrigé..."
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
      interval: 10s
      timeout: 5s
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

  app:
    build: .
    container_name: bennespro_app
    restart: unless-stopped
    ports:
      - "8080:5000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro
      - STRIPE_SECRET_KEY=sk_test_51RTkOhQWGRGBWlNRxSkMmOTKEGSt6ivClFhscWdpIP0i1B00FXRvUiXeec6PLCFN97lojsJXXLctpsQzWmXEIhh000qYJzLLxB
      - VITE_STRIPE_PUBLIC_KEY=pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  postgres_data:
  redis_data:
EOF

# 4. Reconstruire et démarrer avec la nouvelle configuration
echo "🏗️ Reconstruction et démarrage..."
sudo docker-compose up -d --build

# 5. Attendre le démarrage complet
echo "⏳ Attente démarrage complet (90 secondes)..."
sleep 90

# 6. Vérifications post-démarrage
echo "🔍 Vérifications post-démarrage:"
echo "==============================="

echo "📦 État des containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔌 Ports système:"
sudo netstat -tlnp | grep -E ":8080|:5000"

echo ""
echo "🏥 Health check container:"
sudo docker exec bennespro_app curl -s http://localhost:5000/api/health 2>/dev/null || echo "❌ Health check interne échoué"

echo ""
echo "🌐 Test API externe:"
curl -s --connect-timeout 10 http://localhost:8080/api/health 2>/dev/null || echo "❌ API externe non accessible"

echo ""
echo "📊 Test API services:"
curl -s --connect-timeout 10 http://localhost:8080/api/services 2>/dev/null | jq '. | length' 2>/dev/null || echo "❌ API services non accessible"

echo ""
echo "🐘 Test base de données:"
sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c "SELECT COUNT(*) as services_count FROM services;" 2>/dev/null || echo "❌ Base de données non accessible"

echo ""
echo "📋 Logs application (dernières 20 lignes):"
sudo docker logs --tail 20 bennespro_app

echo ""
echo "🎯 TESTS FINAUX:"
echo "==============="

# Test final complet
if curl -s --connect-timeout 5 http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ SUCCESS: API accessible sur port 8080"
    echo "🌐 Site web: http://$(hostname -I | awk '{print $1}'):8080"
    echo "🔒 HTTPS: https://purpleguy.world"
else
    echo "❌ FAILED: API toujours non accessible"
    echo "🔧 Vérifiez les logs: sudo docker logs bennespro_app"
fi

echo ""
echo "🚀 CORRECTION TERMINÉE"
echo "===================="