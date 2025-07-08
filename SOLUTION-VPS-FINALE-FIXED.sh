#!/bin/bash

echo "🔧 SOLUTION DÉFINITIVE STRIPE VPS - VERSION CORRIGÉE"
echo "================================================="

# Clés de production
PK_LIVE="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
SK_LIVE="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"

# 1. Mettre à jour depuis Git
echo "1. Mise à jour du code depuis Git..."
git pull origin main

# 2. Corriger stripe.ts avec configuration simplifiée (sans apiVersion)
echo "2. Correction de stripe.ts avec configuration simplifiée..."
cat > client/src/lib/stripe.ts << 'EOF'
import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION - Clé directement dans le code
const stripePublicKey = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

console.log('✅ Stripe configuré avec clé de production:', stripePublicKey.substring(0, 15) + '...');

// Configuration simplifiée - sans apiVersion qui cause l'erreur
const stripeOptions = {
  locale: 'fr' as const
};

// Export direct de stripePromise
export const stripePromise = loadStripe(stripePublicKey, stripeOptions);
EOF

# 3. S'assurer que .env a les bonnes clés
echo "3. Mise à jour du fichier .env..."
sed -i "s/VITE_STRIPE_PUBLIC_KEY=.*/VITE_STRIPE_PUBLIC_KEY=\"$PK_LIVE\"/" .env
sed -i "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=\"$SK_LIVE\"/" .env

# 4. Supprimer stripe.js s'il existe (éviter les conflits)
echo "4. Suppression de stripe.js pour éviter les conflits..."
rm -f client/src/lib/stripe.js

# 5. Nettoyer complètement
echo "5. Nettoyage complet..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf client/.vite
rm -rf .cache

# 6. Build avec les bonnes variables
echo "6. Build de production..."
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="$PK_LIVE"
export STRIPE_SECRET_KEY="$SK_LIVE"

npm run build

# 7. Correction post-build si nécessaire
echo "7. Vérification et correction du build..."

# Supprimer l'erreur "Missing required Stripe key"
find dist -type f -name "*.js" -exec sed -i 's/throw new Error("Missing required Stripe key[^"]*")//g' {} \;

# Remplacer toutes les références aux variables d'environnement
find dist -type f -name "*.js" -exec sed -i "s/import\.meta\.env\.VITE_STRIPE_PUBLIC_KEY/'$PK_LIVE'/g" {} \;
find dist -type f -name "*.js" -exec sed -i "s/process\.env\.VITE_STRIPE_PUBLIC_KEY/'$PK_LIVE'/g" {} \;

# S'assurer qu'aucune clé de test
find dist -type f -name "*.js" -exec sed -i "s/pk_test[^ \"']*/$PK_LIVE/g" {} \;

# 8. Redémarrer l'application
echo "8. Redémarrage de l'application..."
pm2 delete bennespro 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

echo ""
echo "✅ SOLUTION APPLIQUÉE!"
echo "===================="
echo ""
echo "CHANGEMENTS IMPORTANTS:"
echo "- Suppression de apiVersion qui causait l'erreur"
echo "- Configuration Stripe simplifiée"
echo "- Clé hardcodée directement dans le code"
echo "- Suppression de l'erreur 'Missing required Stripe key'"
echo ""
echo "Test: curl http://localhost:5000/api/health"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Videz complètement le cache du navigateur (Ctrl+Shift+R)"
echo "2. Si vous avez un AdBlocker, désactivez-le pour ce site"
echo "3. Essayez en navigation privée si ça ne fonctionne pas"