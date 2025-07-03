#!/bin/bash

# CRÉATION MANUELLE DES TABLES POSTGRESQL
echo "🗄️ CRÉATION MANUELLE DES TABLES"
echo "==============================="

# 1. Créer toutes les tables essentielles
echo "📝 Création des tables PostgreSQL..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOF'
-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS waste_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;

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
    company_name VARCHAR(255),
    company_address VARCHAR(500),
    company_postal_code VARCHAR(20),
    company_city VARCHAR(100),
    siret VARCHAR(50),
    account_type VARCHAR(50) DEFAULT 'individual',
    tva_number VARCHAR(50),
    ape_code VARCHAR(10),
    notify_on_inactivity BOOLEAN DEFAULT true,
    last_inactivity_notification TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    last_login TIMESTAMP,
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
    delivery_address VARCHAR(500) NOT NULL,
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

-- Insérer des données de test
INSERT INTO services (name, volume, base_price, description, image_url, waste_types, max_weight, included_services, is_active) VALUES
('Benne 10m³', 10, 150.00, 'Benne standard pour déchets de construction', '/images/benne-10m3.jpg', '{"construction", "renovation"}', 3000, '{"livraison", "collecte"}', true),
('Benne 20m³', 20, 250.00, 'Grande benne pour gros chantiers', '/images/benne-20m3.jpg', '{"construction", "demolition"}', 5000, '{"livraison", "collecte", "bâchage"}', true),
('Benne 30m³', 30, 350.00, 'Très grande benne pour démolition', '/images/benne-30m3.jpg', '{"demolition", "industriel"}', 7000, '{"livraison", "collecte", "bâchage", "nettoyage"}', true),
('Benne 5m³', 5, 120.00, 'Petite benne pour particuliers', '/images/benne-5m3.jpg', '{"domestique", "jardin"}', 2000, '{"livraison", "collecte"}', true);

INSERT INTO waste_types (name, category, price_per_ton, description, is_hazardous, is_active) VALUES
('Déchets de construction', 'Construction', 80.00, 'Béton, briques, carrelage', false, true),
('Déchets verts', 'Organique', 45.00, 'Branches, feuilles, gazon', false, true),
('Déchets mixtes', 'Mixte', 120.00, 'Déchets non triés', false, true),
('Déchets industriels', 'Industriel', 150.00, 'Déchets d''activités industrielles', false, true),
('Déchets dangereux', 'Dangereux', 300.00, 'Déchets nécessitant traitement spécial', true, true);

-- Créer un utilisateur administrateur de test
INSERT INTO users (email, password, first_name, last_name, role, is_verified) VALUES
('admin@remondis.fr', '$2b$10$rQZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8q', 'Admin', 'Système', 'admin', true);

-- Créer quelques créneaux horaires
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
\dt

-- Afficher le nombre d'enregistrements
SELECT 'services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'waste_types' as table_name, COUNT(*) as count FROM waste_types
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'time_slots' as table_name, COUNT(*) as count FROM time_slots;

EOF

# 2. Redémarrer l'application pour recharger les connexions
echo "🔄 Redémarrage de l'application..."
sudo docker restart bennespro_app

echo "⏳ Attente redémarrage (30 secondes)..."
sleep 30

# 3. Tester les API
echo "🧪 Test des API..."
echo "================================="

echo "🩺 Health Check:"
curl -s http://localhost:8080/api/health | jq . 2>/dev/null || echo "❌ Health check échoué"

echo ""
echo "🛠️ Services API:"
SERVICES_COUNT=$(curl -s http://localhost:8080/api/services | jq '. | length' 2>/dev/null)
if [ "$SERVICES_COUNT" -gt 0 ]; then
    echo "✅ $SERVICES_COUNT services trouvés"
else
    echo "❌ Erreur API services"
fi

echo ""
echo "🗑️ Waste Types API:"
WASTE_TYPES_COUNT=$(curl -s http://localhost:8080/api/waste-types | jq '. | length' 2>/dev/null)
if [ "$WASTE_TYPES_COUNT" -gt 0 ]; then
    echo "✅ $WASTE_TYPES_COUNT types de déchets trouvés"
else
    echo "❌ Erreur API waste-types"
fi

echo ""
echo "✅ CRÉATION DES TABLES TERMINÉE"
echo "==============================="
echo "🌐 Site web: https://purpleguy.world"
echo "📊 API Health: https://purpleguy.world/api/health"
echo "🛠️ Services: https://purpleguy.world/api/services"
echo "🗑️ Waste Types: https://purpleguy.world/api/waste-types"