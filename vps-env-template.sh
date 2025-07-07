#!/bin/bash

# ===============================================
# TEMPLATE VARIABLES D'ENVIRONNEMENT VPS
# ===============================================

echo "📋 Création du fichier .env.production avec vos vraies clés..."

# Demander les clés API
read -p "🔑 Entrez votre GOOGLE_MAPS_API_KEY: " GOOGLE_KEY
read -p "💳 Entrez votre VITE_STRIPE_PUBLIC_KEY (pk_live_...): " STRIPE_PUBLIC
read -p "🔐 Entrez votre STRIPE_SECRET_KEY (sk_live_...): " STRIPE_SECRET
read -p "📧 Entrez votre SENDGRID_API_KEY (optionnel): " SENDGRID_KEY

# Créer le fichier .env.production
cat > .env.production << EOF
# Database PostgreSQL locale
DATABASE_URL=postgresql://ubuntu:password@localhost:5432/bennespro
DB_HOST=localhost
DB_PORT=5432
DB_USER=ubuntu
DB_PASSWORD=password
DB_NAME=bennespro

# Google Maps API
GOOGLE_MAPS_API_KEY=$GOOGLE_KEY

# Stripe API
VITE_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC
STRIPE_SECRET_KEY=$STRIPE_SECRET

# SendGrid (optionnel)
SENDGRID_API_KEY=$SENDGRID_KEY

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# URLs Production
VITE_API_URL=https://purpleguy.world/api
BACKEND_URL=https://purpleguy.world
EOF

echo "✅ Fichier .env.production créé!"

# Créer aussi un fichier pour le build
cat > .env.production.local << EOF
VITE_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC
VITE_API_URL=https://purpleguy.world/api
EOF

echo "✅ Fichier .env.production.local créé pour le build!"

# Exporter les variables pour la session courante
export GOOGLE_MAPS_API_KEY=$GOOGLE_KEY
export VITE_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC
export STRIPE_SECRET_KEY=$STRIPE_SECRET

echo ""
echo "🚀 Variables d'environnement configurées!"
echo "📦 Lancez maintenant: npm run build"
echo "🔄 Puis: sudo systemctl restart bennespro"