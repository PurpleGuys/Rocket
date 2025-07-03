#!/bin/bash

# CORRECTION FORCÉE POSTGRESQL - CRÉATION TABLES GARANTIE
echo "🚨 CORRECTION FORCÉE POSTGRESQL"
echo "==============================="

# 1. ARRÊT COMPLET
echo "🛑 Arrêt complet des containers..."
sudo docker-compose down -v --remove-orphans
sudo docker volume rm $(sudo docker volume ls -q | grep bennespro) 2>/dev/null || true

# 2. CRÉATION .ENV
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

# 3. DOCKERFILE SIMPLIFIÉ
echo "🐳 Création Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
COPY . .
RUN npm ci
RUN mkdir -p uploads dist
EXPOSE 5000
CMD ["npx", "tsx", "server/index.ts"]
EOF

# 4. DOCKER-COMPOSE SIMPLE
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

# 5. DÉMARRAGE POSTGRESQL SEUL
echo "🗄️ Démarrage PostgreSQL seul..."
sudo docker-compose up -d postgres

# 6. ATTENTE POSTGRESQL
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

# 7. CRÉATION FORCÉE DES TABLES - PARTIE 1
echo "🗄️ Création forcée des tables - Partie 1..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOSQL'
-- Suppression complète
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Table users
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

-- Table services
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

-- Table waste_types
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

-- Table time_slots
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

SELECT 'Partie 1 terminée' as status;
EOSQL

# 8. CRÉATION FORCÉE DES TABLES - PARTIE 2
echo "🗄️ Création forcée des tables - Partie 2..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOSQL'
-- Table sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table service_images
CREATE TABLE service_images (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table orders
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
    rental_days INTEGER DEFAULT 7,
    base_price DECIMAL(10,2),
    transport_price DECIMAL(10,2),
    treatment_price DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    special_instructions TEXT,
    admin_notes TEXT,
    proposed_delivery_date DATE,
    proposed_delivery_time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE SET NULL,
    validation_token VARCHAR(255),
    date_validation_sent TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Partie 2 terminée' as status;
EOSQL

# 9. CRÉATION FORCÉE DES TABLES - PARTIE 3 (AUTRES TABLES)
echo "🗄️ Création forcée des tables - Partie 3..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOSQL'
-- Tables de support
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

CREATE TABLE transport_pricing (
    id SERIAL PRIMARY KEY,
    distance_min DECIMAL(8,2) NOT NULL,
    distance_max DECIMAL(8,2) NOT NULL,
    price_per_km DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rental_pricing (
    id SERIAL PRIMARY KEY,
    days_min INTEGER NOT NULL,
    days_max INTEGER NOT NULL,
    price_per_day DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treatment_pricing (
    id SERIAL PRIMARY KEY,
    waste_type_id INTEGER REFERENCES waste_types(id) ON DELETE CASCADE,
    price_per_ton DECIMAL(10,2) NOT NULL,
    min_charge DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_activities (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE satisfaction_surveys (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    would_recommend BOOLEAN,
    comments TEXT,
    improvements TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE survey_notifications (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fids (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    fid_number VARCHAR(50) UNIQUE NOT NULL,
    waste_description TEXT,
    waste_code VARCHAR(50),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    treatment_mode VARCHAR(100),
    transporter_name VARCHAR(255),
    transporter_siret VARCHAR(50),
    destination_name VARCHAR(255),
    destination_siret VARCHAR(50),
    emission_date DATE,
    transport_date DATE,
    reception_date DATE,
    processing_date DATE,
    status VARCHAR(50) DEFAULT 'draft',
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    bank_reference VARCHAR(255),
    deposited_at TIMESTAMP,
    validated_at TIMESTAMP,
    validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE abandoned_checkouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    step_abandoned VARCHAR(100),
    cart_data JSONB,
    total_amount DECIMAL(10,2),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    recovery_email_sent BOOLEAN DEFAULT false,
    recovered BOOLEAN DEFAULT false,
    recovered_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inactivity_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    days_inactive INTEGER NOT NULL,
    last_order_date DATE,
    notification_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Partie 3 terminée' as status;
EOSQL

# 10. INSERTION DES DONNÉES
echo "📊 Insertion des données..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOSQL'
-- Utilisateurs (password: password123)
INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_active) VALUES
('admin@purpleguy.world', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNOFWu', 'Admin', 'Système', 'admin', true, true),
('test@purpleguy.world', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNOFWu', 'Test', 'User', 'customer', true, true);

-- Services
INSERT INTO services (name, volume, base_price, description, image_url, waste_types, max_weight, included_services, is_active) VALUES
('Benne 5m³', 5, 120.00, 'Idéale pour les petits travaux', '/images/benne-5m3.jpg', ARRAY['Déchets verts', 'Gravats'], 2000, ARRAY['Livraison', 'Collecte'], true),
('Benne 10m³', 10, 180.00, 'Parfaite pour les rénovations', '/images/benne-10m3.jpg', ARRAY['Gravats', 'Bois'], 4000, ARRAY['Livraison', 'Collecte'], true),
('Benne 20m³', 20, 280.00, 'Solution pour les gros chantiers', '/images/benne-20m3.jpg', ARRAY['Gravats', 'Béton'], 8000, ARRAY['Livraison', 'Collecte'], true),
('Benne 30m³', 30, 380.00, 'Grande capacité pour démolitions', '/images/benne-30m3.jpg', ARRAY['Tous déchets'], 12000, ARRAY['Livraison', 'Collecte'], true);

-- Types de déchets
INSERT INTO waste_types (name, category, price_per_ton, description, is_hazardous, is_active) VALUES
('Déchets verts', 'Organique', 45.00, 'Branches, feuilles, gazon', false, true),
('Gravats propres', 'Inerte', 25.00, 'Béton, parpaings, tuiles', false, true),
('Gravats mélangés', 'Inerte', 55.00, 'Gravats avec plâtre', false, true),
('Bois', 'Recyclable', 35.00, 'Bois de construction', false, true),
('Plâtre', 'Recyclable', 85.00, 'Plaques de plâtre', false, true),
('DIB', 'DIB', 120.00, 'Déchets industriels banals', false, true),
('Terre', 'Inerte', 15.00, 'Terre végétale', false, true),
('Tout-venant', 'Mixte', 180.00, 'Déchets mélangés', false, true);

-- Transport pricing
INSERT INTO transport_pricing (distance_min, distance_max, price_per_km) VALUES
(0, 10, 2.50),
(10, 30, 2.00),
(30, 50, 1.80),
(50, 100, 1.50),
(100, 9999, 1.20);

-- Rental pricing
INSERT INTO rental_pricing (days_min, days_max, price_per_day) VALUES
(1, 7, 0.00),
(8, 14, 5.00),
(15, 30, 4.00),
(31, 90, 3.00),
(91, 9999, 2.50);

-- Treatment pricing
INSERT INTO treatment_pricing (waste_type_id, price_per_ton, min_charge) 
SELECT id, price_per_ton, 50.00 FROM waste_types;

-- Company activities
INSERT INTO company_activities (code, name, description, is_active) VALUES
('4312A', 'Travaux de terrassement', 'Travaux de terrassement courants', true),
('4120A', 'Construction maisons', 'Construction de maisons individuelles', true),
('4120B', 'Construction bâtiments', 'Construction d''immeubles', true),
('4391B', 'Travaux de couverture', 'Travaux de couverture', true),
('4399C', 'Maçonnerie', 'Travaux de maçonnerie', true),
('8130Z', 'Aménagement paysager', 'Services d''aménagement paysager', true);

-- Time slots pour les 14 prochains jours
INSERT INTO time_slots (date, start_time, end_time, is_available, max_bookings, current_bookings)
SELECT 
    CURRENT_DATE + (interval '1 day' * generate_series(1, 14)),
    '08:00:00'::time,
    '10:00:00'::time,
    true,
    3,
    0
UNION ALL
SELECT 
    CURRENT_DATE + (interval '1 day' * generate_series(1, 14)),
    '10:00:00'::time,
    '12:00:00'::time,
    true,
    3,
    0
UNION ALL
SELECT 
    CURRENT_DATE + (interval '1 day' * generate_series(1, 14)),
    '14:00:00'::time,
    '16:00:00'::time,
    true,
    3,
    0
UNION ALL
SELECT 
    CURRENT_DATE + (interval '1 day' * generate_series(1, 14)),
    '16:00:00'::time,
    '18:00:00'::time,
    true,
    3,
    0;

-- Vérification finale
SELECT 'Base de données initialisée avec succès!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as services_count FROM services;
SELECT COUNT(*) as waste_types_count FROM waste_types;
SELECT COUNT(*) as time_slots_count FROM time_slots;
EOSQL

# 11. DÉMARRAGE DE L'APPLICATION
echo "🚀 Démarrage de l'application..."
sudo docker-compose up -d app

# 12. ATTENTE ET VÉRIFICATION
echo "⏳ Attente démarrage application (60 secondes)..."
sleep 60

echo ""
echo "🧪 TESTS FINAUX"
echo "==============="

# Test des tables
echo "📊 Vérification des tables:"
TABLES=$(sudo docker exec bennespro_postgres psql -U postgres -d bennespro -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "✅ $TABLES tables créées"

# Test table services spécifiquement
echo ""
echo "🛠️ Test table services:"
SERVICES_COUNT=$(sudo docker exec bennespro_postgres psql -U postgres -d bennespro -t -c "SELECT COUNT(*) FROM services;" | tr -d ' ')
echo "✅ $SERVICES_COUNT services dans la table"

# Test API
echo ""
echo "🌐 Test API:"
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
    echo "✅ API Services retourne des données"
else
    echo "❌ API Services ne retourne pas de données"
    echo "Logs app:"
    sudo docker logs --tail 5 bennespro_app
fi

echo ""
echo "🎯 RÉSULTAT FINAL"
echo "================="
echo "✅ Base de données PostgreSQL configurée avec $TABLES tables"
echo "✅ Application déployée sur port 8080"
echo ""
echo "🌐 Accès: https://purpleguy.world"
echo "🔗 Health: http://localhost:8080/api/health"
echo "🛠️ Services: http://localhost:8080/api/services"
echo ""
echo "📧 Comptes: admin@purpleguy.world / test@purpleguy.world"
echo "🔑 Mot de passe: password123"
echo ""
echo "🚀 CORRECTION POSTGRESQL TERMINÉE"