#!/bin/bash

echo "🔧 CRÉATION/VÉRIFICATION DE TOUTES LES TABLES VPS"
echo "================================================="

# Se connecter au VPS et exécuter les commandes
ssh ubuntu@162.19.67.3 << 'EOF'
cd /home/ubuntu/REM-Bennes

echo "📊 Vérification et création des tables manquantes..."

# Créer toutes les tables nécessaires
sudo -u postgres psql -d BennesPro << SQL

-- 1. Table carts (système de panier)
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

-- 2. Table company_activities
CREATE TABLE IF NOT EXISTS company_activities (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Table bank_deposits
CREATE TABLE IF NOT EXISTS bank_deposits (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  deposited_at TIMESTAMP NOT NULL,
  created_by INTEGER REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 4. Table fids
CREATE TABLE IF NOT EXISTS fids (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  producer_name TEXT NOT NULL,
  producer_address TEXT NOT NULL,
  producer_contact TEXT NOT NULL,
  waste_code TEXT NOT NULL,
  waste_description TEXT NOT NULL,
  quantity_tonnes DECIMAL(10, 2),
  container_number TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. Table satisfaction_surveys
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 6. Table survey_notifications
CREATE TABLE IF NOT EXISTS survey_notifications (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) NOT NULL,
  email_sent_at TIMESTAMP,
  response_received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 7. Table abandoned_checkouts
CREATE TABLE IF NOT EXISTS abandoned_checkouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 8. Table inactivity_notifications
CREATE TABLE IF NOT EXISTS inactivity_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at);
CREATE INDEX IF NOT EXISTS idx_fids_order_id ON fids(order_id);
CREATE INDEX IF NOT EXISTS idx_surveys_order_id ON satisfaction_surveys(order_id);
CREATE INDEX IF NOT EXISTS idx_survey_notif_order_id ON survey_notifications(order_id);

-- Afficher toutes les tables
echo "📋 Tables dans la base de données:";
\dt

SQL

echo "✅ Toutes les tables ont été vérifiées/créées"

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
sudo systemctl restart bennespro

echo "✅ Application redémarrée avec succès"
EOF

echo "🎉 TERMINÉ ! Toutes les tables sont maintenant disponibles sur le VPS"
echo "🌐 Le système de panier devrait fonctionner sur https://purpleguy.world"