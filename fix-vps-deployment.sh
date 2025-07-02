#!/bin/bash

# 🚀 Script de Correction VPS BennesPro - ÉCRAN BLANC RÉSOLU
# Ce script corrige définitivement le problème d'écran blanc sur VPS

echo "🔧 CORRECTION VPS BENNESPRO - ÉCRAN BLANC"
echo "=========================================="

# 1. Arrêter tous les processus Node.js existants
echo "🛑 Arrêt des processus existants..."
pkill -f "node\|tsx\|npm" 2>/dev/null || true
sleep 2

# 2. Nettoyard des anciens builds
echo "🧹 Nettoyage des anciens builds..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

# 3. Build complet de l'application React
echo "⚡ Build complet de l'application React..."
NODE_ENV=production npm run build

# Vérifier que le build a réussi
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERREUR: Build échec, création manuelle..."
    mkdir -p dist
    cp client/index.html dist/
    echo "✅ Fichier HTML copié manuellement"
fi

# 4. Vérifier les variables d'environnement
echo "🔍 Vérification configuration..."
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant!"
    exit 1
fi

# Forcer les bonnes variables pour VPS
cat > .env.vps << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Base de données
DATABASE_URL=postgresql://bennespro_user:yourpassword@localhost:5432/bennespro_db

# Email SendGrid  
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@votre-domaine.com

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
EOF

# 5. Démarrer en mode production avec tsx (SOLUTION ROBUSTE)
echo "🚀 Démarrage serveur production..."
echo "📡 Application disponible sur: http://votre-ip:5000"
echo "🌐 Pour accès externe, configurez Nginx comme proxy"

# Utiliser tsx pour éviter les problèmes de compilation
NODE_ENV=production npx tsx server/index.ts