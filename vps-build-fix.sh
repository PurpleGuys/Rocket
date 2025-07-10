#!/bin/bash

echo "🏗️ BUILD DE L'APPLICATION SUR VPS..."

cd /home/ubuntu/JobDone

# 1. Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

# 2. Exporter les variables d'environnement pour le build
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# 3. Builder l'application
echo "🔨 Build de l'application..."
npm run build

# 4. Vérifier que le build est réussi
if [ -f "dist/public/index.html" ]; then
  echo "✅ Build réussi! dist/public/index.html existe"
else
  echo "❌ Build échoué. Tentative alternative..."
  
  # Alternative: créer la structure manuellement si nécessaire
  mkdir -p dist/public
  
  # Si le build a créé les fichiers ailleurs
  if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "📁 Déplacement des fichiers..."
    mkdir -p dist/public
    mv dist/*.* dist/public/ 2>/dev/null || true
    mv dist/assets dist/public/ 2>/dev/null || true
  fi
fi

# 5. Démarrer l'application
echo "🚀 Démarrage de l'application..."
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# Utiliser screen pour garder l'app active
screen -dmS bennespro bash -c "cd /home/ubuntu/JobDone && npx tsx server/index.ts"

echo "✅ Application démarrée dans screen 'bennespro'"
echo ""
echo "📋 Commandes utiles:"
echo "  - Voir les logs: screen -r bennespro"
echo "  - Détacher: Ctrl+A puis D"
echo "  - Arrêter: screen -X -S bennespro quit"
