#!/bin/bash

echo "🔧 FORCE DES CLÉS STRIPE DE PRODUCTION"
echo "====================================="

# Clés de production
PK_LIVE="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
SK_LIVE="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"

# 1. Forcer dans TOUS les fichiers TypeScript et JavaScript
echo "1. Remplacement dans les fichiers source..."
find client/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i "s/import\.meta\.env\.VITE_STRIPE_PUBLIC_KEY/'$PK_LIVE'/g" {} \;

# 2. Nettoyer complètement
echo "2. Nettoyage complet..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf client/.vite

# 3. Build avec variables forcées
echo "3. Build avec clés de production..."
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="$PK_LIVE"
export STRIPE_SECRET_KEY="$SK_LIVE"

npm run build

# 4. Vérifier et corriger le build si nécessaire
echo "4. Vérification du build..."
if grep -r "VITE_STRIPE_PUBLIC_KEY" dist/ 2>/dev/null; then
    echo "Correction post-build nécessaire..."
    find dist -type f -name "*.js" -exec sed -i "s/VITE_STRIPE_PUBLIC_KEY/'$PK_LIVE'/g" {} \;
fi

# 5. S'assurer qu'aucune référence aux clés de test
find dist -type f -name "*.js" -exec sed -i "s/pk_test[^ \"']*/$PK_LIVE/g" {} \;

echo ""
echo "✅ TERMINÉ!"
echo "Les clés de production sont maintenant hardcodées dans l'application."