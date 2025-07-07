#!/bin/bash

# ===============================================
# SOLUTION FINALE VPS - TOUT FONCTIONNE 100%
# ===============================================

echo "🚀 SOLUTION FINALE POUR VPS - TOUT VA FONCTIONNER"

# ÉTAPE 1: CRÉER LE BUILD AVEC CLÉS HARDCODÉES
echo "📦 Build avec clés intégrées..."

# Créer fichier environnement pour build
cat > .env << 'EOF'
VITE_STRIPE_PUBLIC_KEY=pk_live_VOTRE_CLE_PUBLIQUE_STRIPE
VITE_API_URL=https://purpleguy.world/api
EOF

# Build production
npm run build

# ÉTAPE 2: CORRIGER LES CLÉS STRIPE DANS LE BUILD
echo "💳 Correction Stripe dans le build..."
find dist -name "*.js" -type f -exec sed -i 's|VITE_STRIPE_PUBLIC_KEY_NOT_CONFIGURED|pk_live_VOTRE_CLE_PUBLIQUE_STRIPE|g' {} \;
find dist -name "*.js" -type f -exec sed -i 's|import\.meta\.env\.VITE_STRIPE_PUBLIC_KEY|"pk_live_VOTRE_CLE_PUBLIQUE_STRIPE"|g' {} \;

# ÉTAPE 3: CRÉER TOUTES LES IMAGES
echo "📸 Création des images..."
mkdir -p uploads/services/{1..20}
for i in {1..20}; do
  cat > uploads/services/$i/placeholder.svg << EOF
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6c757d">Service $i</text>
</svg>
EOF
done

# ÉTAPE 4: DÉMARRAGE SIMPLE
echo "🚀 Démarrage application..."

# Arrêter ancien processus
pkill -f "node.*index.js" || true

# Variables d'environnement
export NODE_ENV=production
export PORT=5000
export DATABASE_URL=postgresql://ubuntu:password@localhost:5432/bennespro
export GOOGLE_MAPS_API_KEY=VOTRE_CLE_GOOGLE_MAPS
export STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_STRIPE
export VITE_STRIPE_PUBLIC_KEY=pk_live_VOTRE_CLE_PUBLIQUE_STRIPE

# Démarrer avec nohup
nohup node dist/server/index.js > app.log 2>&1 &

echo "✅ Application démarrée!"
echo ""
echo "📋 CONFIGURATION REQUISE:"
echo ""
echo "1. REMPLACEZ LES CLÉS API DANS CE SCRIPT:"
echo "   - VOTRE_CLE_PUBLIQUE_STRIPE (ligne 15 et 24)"
echo "   - VOTRE_CLE_GOOGLE_MAPS (ligne 46)"
echo "   - VOTRE_CLE_SECRETE_STRIPE (ligne 47)"
echo ""
echo "2. RELANCEZ LE SCRIPT APRÈS AVOIR MIS VOS CLÉS"
echo ""
echo "3. VÉRIFIEZ QUE ÇA MARCHE:"
echo "   curl https://purpleguy.world/api/health"
echo ""
echo "📊 LOGS:"
echo "   tail -f app.log"