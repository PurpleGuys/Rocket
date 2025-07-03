#!/bin/bash

# CORRECTION COMPLÈTE IMMÉDIATE VPS BENNESPRO
echo "🚨 CORRECTION COMPLÈTE IMMÉDIATE VPS"
echo "====================================="

# 1. Arrêter tous les containers
echo "🛑 Arrêt de tous les containers..."
sudo docker-compose down --remove-orphans

# 2. Nettoyer complètement les volumes pour repartir à zéro
echo "🧹 Nettoyage complet des volumes..."
sudo docker volume prune -f
sudo docker system prune -f

# 3. Créer le fichier .env avec toutes les variables nécessaires
echo "📝 Création du fichier .env complet..."
cat > .env << 'EOF'
# Base configuration
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51RTkOhQWGRGBWlNRxSkMmOTKEGSt6ivClFhscWdpIP0i1B00FXRvUiXeec6PLCFN97lojsJXXLctpsQzWmXEIhh000qYJzLLxB
VITE_STRIPE_PUBLIC_KEY=pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B

# Security
JWT_SECRET=BennesProJWTSecure2024!SuperSecretKey
SESSION_SECRET=BennesProSessionSecure2024!SuperSecretKey

# Email Configuration (optional)
SENDGRID_API_KEY=optional_key_here
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@purpleguy.world

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=optional_key_here

# Application Settings
REMONDIS_SALES_EMAIL=commercial@purpleguy.world
COMPANY_NAME=BennesPro
COMPANY_ADDRESS=123 Rue de la Logistique, 75000 Paris, France
COMPANY_PHONE=+33123456789
COMPANY_EMAIL=contact@purpleguy.world
EOF

# 4. Créer docker-compose.yml optimisé
echo "🐳 Création docker-compose.yml optimisé..."
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
  redis_data:
EOF

# 5. Créer le Dockerfile optimisé
echo "🏗️ Création Dockerfile optimisé..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache curl

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads dist

# Build de l'application
RUN npm run build

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["npm", "start"]
EOF

# 6. Démarrer les services
echo "🚀 Démarrage des services..."
sudo docker-compose up -d --build

# 7. Attendre que PostgreSQL soit prêt
echo "⏳ Attente démarrage PostgreSQL..."
sleep 30

# 8. Créer toutes les tables nécessaires
echo "🗄️ Création des tables PostgreSQL..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOSQL'
-- Supprimer les tables existantes
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS service_images CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS waste_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;

-- Créer la table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    lock_until TIMESTAMP,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    account_type VARCHAR(50) DEFAULT 'individual',
    company_name VARCHAR(255),
    siret VARCHAR(50),
    tva_number VARCHAR(50),
    ape_code VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'France',
    preferred_language VARCHAR(10) DEFAULT 'fr',
    marketing_consent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notify_on_inactivity BOOLEAN DEFAULT true,
    last_inactivity_notification TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table services
CREATE TABLE services (
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

-- Créer la table waste_types
CREATE TABLE waste_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price_per_ton DECIMAL(10,2),
    description TEXT,
    is_hazardous BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table time_slots
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    max_bookings INTEGER DEFAULT 3,
    current_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    delivery_address TEXT NOT NULL,
    delivery_postal_code VARCHAR(20),
    delivery_city VARCHAR(100),
    delivery_date DATE,
    delivery_time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE SET NULL,
    pickup_date DATE,
    pickup_time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE SET NULL,
    waste_type_id INTEGER REFERENCES waste_types(id) ON DELETE SET NULL,
    estimated_weight DECIMAL(8,2),
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table service_images
CREATE TABLE service_images (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table audit_logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table email_logs
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email_type VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer des données de test
INSERT INTO users (email, password, first_name, last_name, role, is_verified) VALUES
('admin@purpleguy.world', '$2b$10$rQZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8q', 'Admin', 'Système', 'admin', true),
('test@purpleguy.world', '$2b$10$rQZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8q', 'Test', 'User', 'customer', true);

INSERT INTO services (name, volume, base_price, description, image_url, waste_types, max_weight, included_services, is_active) VALUES
('Benne 5m³', 5, 120.00, 'Petite benne pour particuliers', '/images/benne-5m3.jpg', '{"domestique", "jardin"}', 2000, '{"livraison", "collecte"}', true),
('Benne 10m³', 10, 180.00, 'Benne standard pour déchets de construction', '/images/benne-10m3.jpg', '{"construction", "renovation"}', 3000, '{"livraison", "collecte"}', true),
('Benne 20m³', 20, 280.00, 'Grande benne pour gros chantiers', '/images/benne-20m3.jpg', '{"construction", "demolition"}', 5000, '{"livraison", "collecte", "bâchage"}', true),
('Benne 30m³', 30, 380.00, 'Très grande benne pour démolition', '/images/benne-30m3.jpg', '{"demolition", "industriel"}', 7000, '{"livraison", "collecte", "bâchage", "nettoyage"}', true);

INSERT INTO waste_types (name, category, price_per_ton, description, is_hazardous, is_active) VALUES
('Déchets de construction', 'Construction', 80.00, 'Béton, briques, carrelage', false, true),
('Déchets verts', 'Organique', 45.00, 'Branches, feuilles, gazon', false, true),
('Déchets mixtes', 'Mixte', 120.00, 'Déchets non triés', false, true),
('Déchets industriels', 'Industriel', 150.00, 'Déchets d''activités industrielles', false, true),
('Déchets dangereux', 'Dangereux', 300.00, 'Déchets nécessitant traitement spécial', true, true);

-- Créer des créneaux horaires
INSERT INTO time_slots (date, start_time, end_time, is_available, max_bookings, current_bookings) VALUES
('2025-01-04', '08:00:00', '10:00:00', true, 3, 0),
('2025-01-04', '10:00:00', '12:00:00', true, 3, 0),
('2025-01-04', '14:00:00', '16:00:00', true, 3, 0),
('2025-01-04', '16:00:00', '18:00:00', true, 3, 0),
('2025-01-05', '08:00:00', '10:00:00', true, 3, 0),
('2025-01-05', '10:00:00', '12:00:00', true, 3, 0),
('2025-01-05', '14:00:00', '16:00:00', true, 3, 0),
('2025-01-05', '16:00:00', '18:00:00', true, 3, 0);

-- Afficher les tables créées
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Compter les enregistrements
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'waste_types' as table_name, COUNT(*) as count FROM waste_types
UNION ALL
SELECT 'time_slots' as table_name, COUNT(*) as count FROM time_slots;

EOSQL

# 9. Attendre le démarrage de l'application
echo "⏳ Attente démarrage application (60 secondes)..."
sleep 60

# 10. Tests complets
echo "🧪 TESTS COMPLETS"
echo "=================="

echo "📦 État des containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🩺 Health Check interne:"
sudo docker exec bennespro_app curl -s http://localhost:5000/api/health || echo "❌ Health check interne échoué"

echo ""
echo "🌐 Test API externe:"
curl -s --connect-timeout 10 http://localhost:8080/api/health || echo "❌ API externe non accessible"

echo ""
echo "🛠️ Test API Services:"
SERVICES_RESPONSE=$(curl -s --connect-timeout 10 http://localhost:8080/api/services)
if [ -n "$SERVICES_RESPONSE" ]; then
    echo "✅ API Services accessible"
    echo "$SERVICES_RESPONSE" | jq '. | length' 2>/dev/null && echo " services trouvés"
else
    echo "❌ API Services non accessible"
fi

echo ""
echo "🗑️ Test API Waste Types:"
WASTE_TYPES_RESPONSE=$(curl -s --connect-timeout 10 http://localhost:8080/api/waste-types)
if [ -n "$WASTE_TYPES_RESPONSE" ]; then
    echo "✅ API Waste Types accessible"
    echo "$WASTE_TYPES_RESPONSE" | jq '. | length' 2>/dev/null && echo " types de déchets trouvés"
else
    echo "❌ API Waste Types non accessible"
fi

echo ""
echo "📊 Logs application (dernières 20 lignes):"
sudo docker logs --tail 20 bennespro_app

echo ""
echo "🎯 RÉSULTATS FINAUX"
echo "==================="

if curl -s --connect-timeout 5 http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ SUCCESS: Application VPS complètement fonctionnelle"
    echo "🌐 Site web: https://purpleguy.world"
    echo "🔗 API Health: https://purpleguy.world/api/health"
    echo "🛠️ Services: https://purpleguy.world/api/services"
    echo "🗑️ Waste Types: https://purpleguy.world/api/waste-types"
else
    echo "❌ FAILED: Application encore non accessible"
    echo "🔧 Vérifiez les logs: sudo docker logs bennespro_app"
fi

echo ""
echo "🚀 CORRECTION VPS TERMINÉE"
echo "=========================="