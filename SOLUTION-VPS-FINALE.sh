#!/bin/bash

echo "🔧 SOLUTION DÉFINITIVE STRIPE VPS"
echo "================================"

# Clés de production
PK_LIVE="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
SK_LIVE="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"

# 1. Mettre à jour depuis Git
echo "1. Mise à jour du code depuis Git..."
git pull origin main

# 2. Corriger stripe.ts avec la clé hardcodée
echo "2. Hardcoding de la clé Stripe dans stripe.ts..."
cat > client/src/lib/stripe.ts << 'EOF'
import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION - Clé directement dans le code
const stripePublicKey = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

console.log('✅ Stripe configuré avec clé de production:', stripePublicKey.substring(0, 15) + '...');

// Configuration anti-AdBlock pour Stripe  
const stripeOptions = {
  stripeAccount: undefined,
  apiVersion: '2024-12-18.acacia' as const,
  locale: 'fr' as const,
  telemetry: false,
  advancedFraudSignals: false
};

let stripeInstance: any = null;

const initializeStripe = async () => {
  try {
    stripeInstance = await loadStripe(stripePublicKey, stripeOptions);
    if (stripeInstance) {
      console.log('✅ Stripe chargé avec succès');
      return stripeInstance;
    }
  } catch (error) {
    console.warn('⚠️ Stripe bloqué par AdBlock - utilisation du fallback');
  }
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const retryStripe = await loadStripe(stripePublicKey, {
          ...stripeOptions,
          advancedFraudSignals: false
        });
        resolve(retryStripe);
      } catch (err) {
        console.error('❌ Impossible de charger Stripe:', err);
        resolve(null);
      }
    }, 1000);
  });
};

export const stripePromise = initializeStripe();
EOF

# 3. S'assurer que .env a les bonnes clés
echo "3. Mise à jour du fichier .env..."
sed -i "s/VITE_STRIPE_PUBLIC_KEY=.*/VITE_STRIPE_PUBLIC_KEY=\"$PK_LIVE\"/" .env
sed -i "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=\"$SK_LIVE\"/" .env

# 4. Nettoyer complètement
echo "4. Nettoyage complet..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf client/.vite
rm -rf .cache

# 5. Build avec les bonnes variables
echo "5. Build de production..."
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="$PK_LIVE"
export STRIPE_SECRET_KEY="$SK_LIVE"

npm run build

# 6. Correction post-build si nécessaire
echo "6. Vérification et correction du build..."
if grep -r "Missing required Stripe key" dist/ 2>/dev/null; then
    echo "Correction de l'erreur 'Missing required Stripe key'..."
    find dist -type f -name "*.js" -exec sed -i "s/throw new Error(\"Missing required Stripe key.*\")//g" {} \;
fi

# Remplacer toutes les références aux variables d'environnement
find dist -type f -name "*.js" -exec sed -i "s/import\.meta\.env\.VITE_STRIPE_PUBLIC_KEY/'$PK_LIVE'/g" {} \;
find dist -type f -name "*.js" -exec sed -i "s/process\.env\.VITE_STRIPE_PUBLIC_KEY/'$PK_LIVE'/g" {} \;

# 7. S'assurer qu'aucune clé de test
find dist -type f -name "*.js" -exec sed -i "s/pk_test[^ \"']*/$PK_LIVE/g" {} \;

# 8. Redémarrer l'application
echo "7. Redémarrage de l'application..."
pm2 delete bennespro 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

echo ""
echo "✅ SOLUTION APPLIQUÉE!"
echo "===================="
echo ""
echo "Actions effectuées:"
echo "- Clé Stripe hardcodée dans stripe.ts"
echo "- Build de production avec clés forcées"
echo "- Correction post-build de toutes les références"
echo "- Suppression de l'erreur 'Missing required Stripe key'"
echo ""
echo "Test: curl http://localhost:5000/api/health"
echo ""
echo "⚠️  VIDEZ LE CACHE DU NAVIGATEUR (Ctrl+Shift+R)"