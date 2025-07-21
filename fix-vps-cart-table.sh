#!/bin/bash

echo "🔧 CRÉATION TABLE CARTS SUR VPS"
echo "================================"

# Variables
VPS_HOST="ubuntu@162.19.67.3"
DB_NAME="BennesPro"

echo "📊 Création de la table carts..."

# Exécuter le SQL directement sur le VPS
ssh $VPS_HOST << 'EOF'
cd /home/ubuntu/REM-Bennes

# Créer la table carts
sudo -u postgres psql -d BennesPro << SQL
-- Création de la table carts
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  service_id INTEGER REFERENCES services(id) NOT NULL,
  waste_type_id INTEGER REFERENCES waste_types(id) NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  transport_distance DECIMAL(10, 2),
  transport_price DECIMAL(10, 2),
  rental_price DECIMAL(10, 2),
  treatment_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_postal_code TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_date TIMESTAMP,
  delivery_time_slot TEXT,
  pickup_date TIMESTAMP,
  pickup_time_slot TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at);

-- Vérifier que la table existe
\dt carts
SQL

echo "✅ Table carts créée"

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
sudo systemctl restart bennespro

echo "✅ Application redémarrée"
EOF

echo "🎉 Terminé ! La table carts est maintenant disponible sur le VPS"
echo "🌐 Testez à nouveau sur https://purpleguy.world"