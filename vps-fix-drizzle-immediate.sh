#!/bin/bash

# CORRECTION IMMÉDIATE DRIZZLE CONFIG
echo "🔧 CORRECTION DRIZZLE CONFIG VPS"
echo "================================"

# 1. Copier les fichiers nécessaires dans le container
echo "📋 Copie des fichiers de configuration..."
sudo docker cp drizzle.config.ts bennespro_app:/app/
sudo docker cp drizzle.config.js bennespro_app:/app/
sudo docker cp shared bennespro_app:/app/

# 2. Créer drizzle.config.js simple dans le container
echo "🔧 Création drizzle.config.js direct..."
sudo docker exec bennespro_app sh -c 'cat > /app/drizzle.config.js << "EOF"
/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro",
  },
};
EOF'

# 3. Exécuter drizzle-kit avec le bon fichier
echo "🚀 Exécution migration Drizzle..."
sudo docker exec -e DATABASE_URL="postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro" bennespro_app sh -c "
    cd /app && 
    npx drizzle-kit push --config=./drizzle.config.js
"

# 4. Si ça échoue, créer les tables manuellement
echo "🗄️ Création manuelle des tables si nécessaire..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro << 'EOF'
-- Créer la table services si elle n'existe pas
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

-- Créer la table waste_types si elle n'existe pas
CREATE TABLE IF NOT EXISTS waste_types (
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

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
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
    account_type VARCHAR(50),
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

-- Insérer des données de test
INSERT INTO services (name, volume, base_price, description, image_url, waste_types, is_active) 
VALUES 
    ('Benne 10m³', 10, 150.00, 'Benne standard pour déchets de construction', '/images/benne-10m3.jpg', '{"construction", "renovation"}', true),
    ('Benne 20m³', 20, 250.00, 'Grande benne pour gros chantiers', '/images/benne-20m3.jpg', '{"construction", "demolition"}', true),
    ('Benne 30m³', 30, 350.00, 'Très grande benne pour démolition', '/images/benne-30m3.jpg', '{"demolition", "industriel"}', true)
ON CONFLICT DO NOTHING;

INSERT INTO waste_types (name, category, price_per_ton, description, is_hazardous, is_active) 
VALUES 
    ('Déchets de construction', 'Construction', 80.00, 'Béton, briques, carrelage', false, true),
    ('Déchets verts', 'Organique', 45.00, 'Branches, feuilles, gazon', false, true),
    ('Déchets mixtes', 'Mixte', 120.00, 'Déchets non triés', false, true),
    ('Déchets industriels', 'Industriel', 150.00, 'Déchets d''activités industrielles', false, true)
ON CONFLICT DO NOTHING;

-- Afficher les tables créées
\dt
EOF

# 5. Redémarrer l'application
echo "🔄 Redémarrage application..."
sudo docker restart bennespro_app

echo "⏳ Attente redémarrage (30s)..."
sleep 30

# 6. Test des API
echo "🧪 Test des API..."
echo "Health check:"
curl -s http://localhost:8080/api/health | jq . || echo "Erreur health check"

echo ""
echo "Services:"
curl -s http://localhost:8080/api/services | jq '. | length' && echo " services trouvés" || echo "Erreur API services"

echo ""
echo "✅ CORRECTION DRIZZLE TERMINÉE"
echo "============================="
echo "🌐 Testez maintenant: https://purpleguy.world"