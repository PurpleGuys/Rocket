#!/bin/bash

# Script de configuration initiale pour VPS - IP: 162.19.67.3
# Usage: ./vps-setup.sh

set -e

echo "🚀 Configuration initiale du VPS pour l'application Remondis"
echo "============================================================="

# Vérifier si nous sommes sur le bon VPS
VPS_IP="162.19.67.3"
CURRENT_IP=$(hostname -I | awk '{print $1}')

if [[ "$CURRENT_IP" != "$VPS_IP" ]]; then
    echo "⚠️  Attention: IP détectée ($CURRENT_IP) différente de l'IP configurée ($VPS_IP)"
    echo "Continuez-vous quand même? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 1. Installer PostgreSQL si nécessaire
echo "📊 Configuration de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "Installation de PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# 2. Configurer PostgreSQL
echo "🔧 Configuration de la base de données..."
sudo -u postgres psql << EOF
-- Créer la base de données et l'utilisateur
CREATE DATABASE IF NOT EXISTS remondis_db;
CREATE USER IF NOT EXISTS remondis_user WITH ENCRYPTED PASSWORD 'RemondisSecure2024!';
GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis_user;
ALTER USER remondis_user CREATEDB;
\q
EOF

# 3. Configurer PostgreSQL pour les connexions réseau
echo "🌐 Configuration des connexions PostgreSQL..."
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

# Sauvegarder les fichiers originaux
sudo cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup"
sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"

# Configurer postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '162.19.67.3,localhost'/" "$PG_CONFIG_DIR/postgresql.conf"

# Configurer pg_hba.conf
echo "host    remondis_db    remondis_user    162.19.67.3/32    md5" | sudo tee -a "$PG_CONFIG_DIR/pg_hba.conf"

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# 4. Créer le fichier .env avec la configuration VPS
echo "📝 Création du fichier .env..."
cat > .env << EOF
# ===========================================
# CONFIGURATION VPS - IP: 162.19.67.3
# ===========================================

# Base de données
DATABASE_URL="postgresql://remondis_user:RemondisSecure2024!@162.19.67.3:5432/remondis_db"

# Serveur
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# URLs et domaines
APP_BASE_URL="http://162.19.67.3:5000"
ALLOWED_ORIGINS="http://162.19.67.3:5000,http://162.19.67.3,http://162.19.67.3:80"

# Sécurité (CHANGEZ CES VALEURS EN PRODUCTION)
SESSION_SECRET="VotreCleSecrete32CaracteresMinimum123"
JWT_SECRET="VotreCleJWT32CaracteresMinimumSecure456"
ENCRYPTION_KEY="VotreCleChiffrement32CaracMinimum789"

# Email (À CONFIGURER)
SENDGRID_API_KEY="SG.votre-cle-sendgrid-ici"
SENDGRID_VERIFIED_SENDER_EMAIL="noreply@votre-domaine.com"
REMONDIS_SALES_EMAIL="commercial@votre-domaine.com"

# Google Maps (À CONFIGURER)
GOOGLE_MAPS_API_KEY="AIzaSy_votre_cle_google_maps_ici"

# Configuration métier
DEFAULT_TRANSPORT_PRICE_PER_KM="1.50"
DEFAULT_MINIMUM_FLAT_RATE="50.00"
DEFAULT_HOURLY_RATE="45.00"

# Sécurité
FORCE_HTTPS=false
ENABLE_SECURITY_HEADERS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true

# Fichiers
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=./uploads
EOF

# 5. Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p uploads logs

# 6. Définir les permissions
echo "🔒 Configuration des permissions..."
chmod 600 .env
chmod +x deploy.sh health-check.sh

# 7. Tester la connexion à la base de données
echo "🧪 Test de connexion à la base de données..."
if PGPASSWORD="RemondisSecure2024!" psql -h 162.19.67.3 -U remondis_user -d remondis_db -c "SELECT 1;" &> /dev/null; then
    echo "✅ Connexion à la base de données réussie"
else
    echo "❌ Échec de connexion à la base de données"
    echo "Vérifiez la configuration PostgreSQL"
    exit 1
fi

# 8. Installer les dépendances Node.js si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# 9. Construire l'application
echo "🔨 Construction de l'application..."
npm run build

echo ""
echo "✅ Configuration VPS terminée avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Éditez le fichier .env pour ajouter vos vraies clés API"
echo "2. Lancez l'application: npm run start"
echo "3. Ou utilisez PM2: pm2 start ecosystem.config.js"
echo "4. Vérifiez l'état: ./health-check.sh"
echo ""
echo "🌐 URLs d'accès:"
echo "- Application: http://162.19.67.3:5000"
echo "- API: http://162.19.67.3:5000/api"
echo ""
EOF