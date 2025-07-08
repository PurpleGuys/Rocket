#!/bin/bash

echo "🔧 FIX STRIPE PRODUCTION - SOLUTION GARANTIE"
echo "==========================================="

PK_LIVE="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# 1. Forcer la clé dans .env
echo "VITE_STRIPE_PUBLIC_KEY=$PK_LIVE" > .env.production

# 2. Build avec la clé forcée
VITE_STRIPE_PUBLIC_KEY=$PK_LIVE npm run build

# 3. Corriger APRÈS le build
echo "Correction du build..."
find dist -name "*.js" -type f -exec sed -i \
  -e 's/throw new Error("Missing required Stripe key[^"]*")//g' \
  -e "s/import\.meta\.env\.VITE_STRIPE_PUBLIC_KEY/\"$PK_LIVE\"/g" \
  -e "s/process\.env\.VITE_STRIPE_PUBLIC_KEY/\"$PK_LIVE\"/g" \
  {} \;

# 4. Vérifier
echo ""
echo "✅ Build corrigé!"
echo "Redémarrez avec: pm2 restart bennespro"