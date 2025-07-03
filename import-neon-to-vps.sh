#!/bin/bash

# IMPORT BASE NEON VERS VPS - SOLUTION DÉFINITIVE
echo "🗄️ IMPORT BASE NEON VERS VPS"
echo "============================="

# 1. VARIABLES NEON
NEON_HOST="ep-nameless-king-a5berec2.us-east-2.aws.neon.tech"
NEON_USER="neon_db_owner"
NEON_DB="neondb"
NEON_PASSWORD="npg_8V6YMKUzIDwv"

# 2. ARRÊT COMPLET
echo "🛑 Arrêt complet des containers..."
sudo docker-compose down -v --remove-orphans
sudo docker volume rm $(sudo docker volume ls -q | grep bennespro) 2>/dev/null || true

# 3. CRÉATION .ENV
echo "📝 Création .env..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro
STRIPE_SECRET_KEY=sk_test_51RTkOhQWGRGBWlNRxSkMmOTKEGSt6ivClFhscWdpIP0i1B00FXRvUiXeec6PLCFN97lojsJXXLctpsQzWmXEIhh000qYJzLLxB
VITE_STRIPE_PUBLIC_KEY=pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B
JWT_SECRET=BennesProJWTSecure2024!SuperSecretKeyForProduction
SESSION_SECRET=BennesProSessionSecure2024!SuperSecretKeyForProduction
SENDGRID_API_KEY=SG.fake_key_for_now
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@purpleguy.world
GOOGLE_MAPS_API_KEY=AIzaSyFakeKeyForNow
COMPANY_NAME=BennesPro
COMPANY_ADDRESS=123 Rue de la Logistique, 75000 Paris, France
COMPANY_PHONE=+33123456789
COMPANY_EMAIL=contact@purpleguy.world
EOF

# 4. DOCKERFILE
echo "🐳 Création Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache curl postgresql-client
COPY package*.json ./
COPY . .
RUN npm ci
RUN mkdir -p uploads dist
EXPOSE 5000
CMD ["npx", "tsx", "server/index.ts"]
EOF

# 5. DOCKER-COMPOSE
echo "🐳 Création docker-compose.yml..."
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
      interval: 3s
      timeout: 3s
      retries: 30

  app:
    build: .
    container_name: bennespro_app
    restart: unless-stopped
    ports:
      - "8080:5000"
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - .env
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
EOF

# 6. INSTALLATION POSTGRESQL CLIENT
echo "🔧 Installation PostgreSQL client..."
sudo apt update -qq
sudo apt install -y postgresql-client-common postgresql-client

# 7. EXPORT DEPUIS NEON
echo "📤 Export depuis Neon Database..."
export PGPASSWORD="$NEON_PASSWORD"
pg_dump -h "$NEON_HOST" -U "$NEON_USER" -d "$NEON_DB" -p 5432 -Fc -f neon.dump

if [ ! -f "neon.dump" ]; then
    echo "❌ Erreur: Export Neon échoué"
    exit 1
fi

echo "✅ Export Neon réussi ($(du -h neon.dump | cut -f1))"

# 8. DÉMARRAGE POSTGRESQL SEUL
echo "🗄️ Démarrage PostgreSQL..."
sudo docker-compose up -d postgres

# 9. ATTENTE POSTGRESQL
echo "⏳ Attente PostgreSQL..."
for i in {1..60}; do
    if sudo docker exec bennespro_postgres pg_isready -U postgres -d bennespro &>/dev/null; then
        echo "✅ PostgreSQL prêt!"
        break
    fi
    echo -ne "\r⏳ $i/60"
    sleep 2
done
echo ""

# 10. IMPORT DANS DOCKER POSTGRESQL
echo "📥 Import dans Docker PostgreSQL..."

# Copier le dump dans le container
sudo docker cp neon.dump bennespro_postgres:/tmp/neon.dump

# Restaurer le dump
sudo docker exec bennespro_postgres pg_restore -U postgres -d bennespro -v --clean --if-exists /tmp/neon.dump

echo "✅ Import terminé"

# 11. VÉRIFICATION DES TABLES
echo "🔍 Vérification des tables..."
TABLES=$(sudo docker exec bennespro_postgres psql -U postgres -d bennespro -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "📊 $TABLES tables importées"

# Vérification spécifique table services
SERVICES_COUNT=$(sudo docker exec bennespro_postgres psql -U postgres -d bennespro -t -c "SELECT COUNT(*) FROM services;" 2>/dev/null | tr -d ' ')
if [ -n "$SERVICES_COUNT" ] && [ "$SERVICES_COUNT" -gt 0 ]; then
    echo "✅ Table services: $SERVICES_COUNT enregistrements"
else
    echo "❌ Table services vide ou inexistante"
    
    # Création manuelle si nécessaire
    echo "🛠️ Création manuelle de la table services..."
    sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOSQL'
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    volume INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    length INTEGER,
    width INTEGER,
    height INTEGER,
    waste_types TEXT[],
    max_weight INTEGER,
    included_services TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services (name, volume, base_price, description, image_url, waste_types, max_weight, included_services, is_active) VALUES
('Benne 5m³', 5, 120.00, 'Idéale pour les petits travaux', '/images/benne-5m3.jpg', ARRAY['Déchets verts', 'Gravats'], 2000, ARRAY['Livraison', 'Collecte'], true),
('Benne 10m³', 10, 180.00, 'Parfaite pour les rénovations', '/images/benne-10m3.jpg', ARRAY['Gravats', 'Bois'], 4000, ARRAY['Livraison', 'Collecte'], true),
('Benne 20m³', 20, 280.00, 'Solution pour les gros chantiers', '/images/benne-20m3.jpg', ARRAY['Gravats', 'Béton'], 8000, ARRAY['Livraison', 'Collecte'], true),
('Benne 30m³', 30, 380.00, 'Grande capacité pour démolitions', '/images/benne-30m3.jpg', ARRAY['Tous déchets'], 12000, ARRAY['Livraison', 'Collecte'], true);

SELECT COUNT(*) FROM services;
EOSQL
fi

# 12. DÉMARRAGE APPLICATION
echo "🚀 Démarrage application..."
sudo docker-compose up -d app

# 13. ATTENTE ET TESTS
echo "⏳ Attente démarrage application (60 secondes)..."
sleep 60

echo ""
echo "🧪 TESTS FINAUX"
echo "==============="

# Test table services
SERVICES_FINAL=$(sudo docker exec bennespro_postgres psql -U postgres -d bennespro -t -c "SELECT COUNT(*) FROM services;" | tr -d ' ')
echo "🛠️ Services en base: $SERVICES_FINAL"

# Test API Health
echo ""
echo "🏥 Test API Health:"
if curl -s --connect-timeout 10 http://localhost:8080/api/health &>/dev/null; then
    echo "✅ API Health accessible"
else
    echo "❌ API Health non accessible"
fi

# Test API Services
echo ""
echo "🛠️ Test API Services:"
SERVICES_API=$(curl -s --connect-timeout 10 http://localhost:8080/api/services)
if [ -n "$SERVICES_API" ] && [[ "$SERVICES_API" == *"Benne"* ]]; then
    echo "✅ API Services retourne des données valides"
    echo "$SERVICES_API" | jq '. | length' 2>/dev/null && echo " services trouvés"
else
    echo "❌ API Services ne retourne pas de données"
    echo "Réponse API: $SERVICES_API"
fi

# 14. NETTOYAGE
echo ""
echo "🧹 Nettoyage..."
rm -f neon.dump

# 15. RÉSULTAT FINAL
echo ""
echo "🎯 RÉSULTAT FINAL"
echo "================="

if [ "$SERVICES_FINAL" -gt 0 ] && curl -s --connect-timeout 5 http://localhost:8080/api/health &>/dev/null; then
    echo "✅ SUCCÈS COMPLET!"
    echo ""
    echo "📊 Base de données: $TABLES tables importées"
    echo "🛠️ Services: $SERVICES_FINAL enregistrements"
    echo ""
    echo "🌐 Site web: https://purpleguy.world"
    echo "🔗 API Health: http://localhost:8080/api/health"
    echo "🛠️ API Services: http://localhost:8080/api/services"
    echo ""
    echo "📧 Accès admin: admin@purpleguy.world"
    echo "🔑 Mot de passe: password123"
else
    echo "❌ Problèmes détectés"
    echo ""
    echo "🔧 Commandes de diagnostic:"
    echo "   sudo docker logs bennespro_app"
    echo "   sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c '\\dt'"
fi

echo ""
echo "🚀 IMPORT NEON TERMINÉ"