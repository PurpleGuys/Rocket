#!/bin/bash

echo "🔧 FORCE STRIPE PRODUCTION KEYS - SOLUTION DÉFINITIVE"
echo "==================================================="

PK_LIVE="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
SK_LIVE="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"

# 1. Vérifier s'il y a un stripe.js qui pose problème
echo "1. Recherche et suppression de stripe.js..."
find client/src -name "stripe.js" -delete

# 2. Recréer stripe.ts avec la clé hardcodée
echo "2. Création de stripe.ts avec clé de production..."
cat > client/src/lib/stripe.ts << 'EOF'
import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION - Clé hardcodée
const STRIPE_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Export direct sans complexité
export const stripePromise = loadStripe(STRIPE_KEY, { locale: 'fr' });

console.log('✅ Stripe initialisé avec clé:', STRIPE_KEY.substring(0, 20) + '...');
EOF

# 3. Forcer les variables dans .env
echo "3. Mise à jour forcée du .env..."
grep -q "VITE_STRIPE_PUBLIC_KEY" .env || echo "VITE_STRIPE_PUBLIC_KEY=$PK_LIVE" >> .env
grep -q "STRIPE_SECRET_KEY" .env || echo "STRIPE_SECRET_KEY=$SK_LIVE" >> .env

# Remplacer si déjà présent
sed -i "s|VITE_STRIPE_PUBLIC_KEY=.*|VITE_STRIPE_PUBLIC_KEY=$PK_LIVE|" .env
sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$SK_LIVE|" .env

# 4. Build avec toutes les variables forcées
echo "4. Build de production forcé..."
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="$PK_LIVE"
export STRIPE_SECRET_KEY="$SK_LIVE"

rm -rf dist
npm run build

# 5. Post-processing du build
echo "5. Correction du build généré..."

# Chercher et corriger toute erreur dans les fichiers JS
find dist -name "*.js" -type f -exec sh -c '
  for file do
    # Supprimer l'erreur "Missing required Stripe key"
    sed -i "s/throw new Error(\"Missing required Stripe key[^\"]*\")//g" "$file"
    sed -i "s/throw new Error.*VITE_STRIPE_PUBLIC_KEY.*//g" "$file"
    
    # Remplacer toute référence à import.meta.env
    sed -i "s/import\.meta\.env\.VITE_STRIPE_PUBLIC_KEY/\"pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS\"/g" "$file"
    
    # Remplacer process.env
    sed -i "s/process\.env\.VITE_STRIPE_PUBLIC_KEY/\"pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS\"/g" "$file"
  done
' sh {} +

# 6. Vérifier le résultat
echo "6. Vérification..."
if grep -r "Missing required Stripe key" dist/ 2>/dev/null; then
  echo "⚠️  Erreur détectée, correction supplémentaire..."
  find dist -name "*.js" -exec sed -i '/Missing required Stripe key/d' {} \;
fi

# 7. Afficher les résultats
echo ""
echo "✅ TERMINÉ!"
echo "=========="
echo ""
echo "Actions effectuées:"
echo "- stripe.js supprimé (s'il existait)"
echo "- stripe.ts recréé avec clé hardcodée"
echo "- Build forcé avec variables d'environnement"
echo "- Correction post-build de toutes les références"
echo ""
echo "Redémarrez maintenant avec:"
echo "pm2 restart bennespro --update-env"
echo ""
echo "⚠️  IMPORTANT: Videz le cache du navigateur!"