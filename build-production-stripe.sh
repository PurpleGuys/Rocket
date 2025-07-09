#!/bin/bash
echo "🏗️ BUILD PRODUCTION AVEC STRIPE HARDCODÉ..."

# Exporter la clé pour le build
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# Build avec la config production
npm run build -- --config ./vite.config.production.ts

echo "✅ Build production terminé"
