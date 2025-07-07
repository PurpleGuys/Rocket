#!/bin/bash

# ===============================================
# CONFIGURATION FINALE .ENV POUR VPS
# ===============================================

echo "🚀 CRÉATION DU .ENV POUR VPS PRODUCTION"

# Créer le fichier .env de production
cat > .env << 'EOF'
# ===============================================
# PRODUCTION VPS - BENNESPRO
# ===============================================

# Base de données PostgreSQL VPS
DATABASE_URL=postgresql://ubuntu:password@localhost:5432/bennespro
DB_HOST=localhost
DB_PORT=5432
DB_USER=ubuntu
DB_PASSWORD=password
DB_NAME=bennespro

# Google Maps API (REMPLACEZ PAR VOTRE CLÉ)
GOOGLE_MAPS_API_KEY=AIzaSyD_VOTRE_CLE_GOOGLE_MAPS_ICI

# Stripe Production (REMPLACEZ PAR VOS CLÉS)
VITE_STRIPE_PUBLIC_KEY=pk_live_VOTRE_CLE_PUBLIQUE_STRIPE
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_STRIPE

# SendGrid (optionnel)
SENDGRID_API_KEY=SG.VOTRE_CLE_SENDGRID

# Sécurité (générez des secrets uniques)
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Application
NODE_ENV=production
PORT=5000

# URLs Production
VITE_API_URL=https://purpleguy.world/api
BACKEND_URL=https://purpleguy.world
APP_URL=https://purpleguy.world

# Entreprise
COMPANY_NAME=REMONDIS FRANCE
INDUSTRIAL_SITE_ADDRESS=Zone Industrielle, 92000 Nanterre

# Tarification
BASE_RENTAL_PRICE_PER_DAY=50
TRANSPORT_COST_PER_KM=2.5
TREATMENT_COST_PER_M3=80
VAT_RATE=20
BSD_COST=25

# Fonctionnalités
ENABLE_ONLINE_PAYMENT=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_ADDRESS_AUTOCOMPLETE=true
ENABLE_AUTO_PRICING=true
EOF

echo "✅ Fichier .env créé!"
echo ""
echo "📋 ÉTAPES SUIVANTES:"
echo ""
echo "1. REMPLACEZ les clés API dans le fichier .env :"
echo "   - GOOGLE_MAPS_API_KEY"
echo "   - VITE_STRIPE_PUBLIC_KEY" 
echo "   - STRIPE_SECRET_KEY"
echo "   - SENDGRID_API_KEY (optionnel)"
echo ""
echo "2. BUILD l'application :"
echo "   npm run build"
echo ""
echo "3. DÉMARREZ le serveur :"
echo "   NODE_ENV=production node dist/server/index.js"
echo ""
echo "4. VÉRIFIEZ que tout fonctionne :"
echo "   curl https://purpleguy.world/api/health"
echo ""
echo "✅ Les variables seront automatiquement chargées depuis .env!"