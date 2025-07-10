#!/bin/bash

cd /home/ubuntu/JobDone

# Si dist/public n'existe pas, le créer et copier les fichiers
if [ ! -f "dist/public/index.html" ]; then
  echo "⚠️ dist/public/index.html manquant, build nécessaire..."
  
  # Option 1: Build complet
  npm run build
  
  # Option 2: Si le build échoue, démarrer en mode dev
  if [ ! -f "dist/public/index.html" ]; then
    echo "🔄 Démarrage en mode développement..."
    export NODE_ENV=development
    export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
    npx tsx server/index.ts
    exit 0
  fi
fi

# Démarrer en production
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
npx tsx server/index.ts
