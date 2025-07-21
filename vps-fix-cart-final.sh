#!/bin/bash

echo "🚀 DÉPLOIEMENT FINAL PANIER VPS"
echo "==============================="

# Build l'application
echo "📦 Building application..."
npm run build

echo "📤 Deploying to VPS..."

# Se connecter au VPS et faire tout en une fois
ssh ubuntu@162.19.67.3 << 'EOF'
cd /home/ubuntu/REM-Bennes

echo "🔧 Création de la table carts si elle n'existe pas..."
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

-- Vérifier que la table existe
SELECT COUNT(*) as cart_count FROM carts;
SQL

echo "✅ Table carts créée/vérifiée"

# Mettre à jour le code
echo "📥 Mise à jour du code serveur..."
EOF

# Copier les fichiers
echo "📤 Copie des fichiers..."
scp -r dist/* ubuntu@162.19.67.3:/home/ubuntu/REM-Bennes/dist/
scp server/routes.ts ubuntu@162.19.67.3:/home/ubuntu/REM-Bennes/server/
scp server/storage.ts ubuntu@162.19.67.3:/home/ubuntu/REM-Bennes/server/

# Redémarrer l'application
ssh ubuntu@162.19.67.3 << 'EOF'
cd /home/ubuntu/REM-Bennes

echo "🔄 Redémarrage de l'application..."
sudo systemctl restart bennespro

echo "✅ Application redémarrée"

# Test rapide
echo "🧪 Test du panier..."
SESSION_ID="session_vps_test_$(date +%s)"
echo "Test avec session: $SESSION_ID"

# Ajouter un article
curl -s -X POST https://purpleguy.world/api/cart/add \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{
    "serviceId": 1,
    "wasteTypeId": 1,
    "quantity": 1,
    "totalPrice": "220.00",
    "deliveryAddress": "Test VPS",
    "deliveryPostalCode": "75001",
    "deliveryCity": "Paris"
  }' | jq

# Récupérer le panier
echo "Récupération du panier..."
curl -s -X GET https://purpleguy.world/api/cart \
  -H "x-session-id: $SESSION_ID" | jq

EOF

echo "🎉 Déploiement terminé!"
echo "🌐 Testez sur https://purpleguy.world"