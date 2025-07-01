#!/bin/bash

# Script de configuration PostgreSQL pour BennesPro
set -e

echo "🗄️ CONFIGURATION BASE DE DONNÉES"
echo "================================"

# Variables
DB_USER="remondis"
DB_PASS="Remondis60110$"
DB_NAME="remondis_db"

# Installation PostgreSQL si nécessaire
if ! command -v psql &> /dev/null; then
    echo "📦 Installation PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Configuration de la base de données
echo "🔧 Configuration base de données..."

sudo -u postgres psql << EOF
-- Création de l'utilisateur
DO \$\$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
    END IF;
END \$\$;

-- Création de la base de données
DO \$\$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
        CREATE DATABASE $DB_NAME OWNER $DB_USER;
    END IF;
END \$\$;

-- Attribution des privilèges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

# Création du fichier .env
echo "📝 Création fichier .env..."

cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
SESSION_SECRET=f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5
JWT_SECRET=85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723
EOF

echo "✅ Configuration terminée !"
echo ""
echo "Base de données : $DB_NAME"
echo "Utilisateur     : $DB_USER"
echo "Fichier .env    : créé"
echo ""
echo "Vous pouvez maintenant lancer l'application avec :"
echo "npm start"