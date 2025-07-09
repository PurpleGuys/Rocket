#!/bin/bash
echo "🏗️ BUILD VPS AVEC STRIPE HARDCODÉ..."

# Build avec config production
npm run build -- --config ./vite.config.production.ts

# Vérifier que Stripe est dans le build
echo "🔍 Vérification Stripe dans le build..."
grep -r "pk_live_51RTkOE" dist/public/assets/ || echo "⚠️ Clé Stripe non trouvée dans le build!"

echo "✅ Build VPS terminé"
