#!/bin/bash

# CORRECTION BUILD VPS - RÉSOUDRE L'ERREUR dist/public/index.html
echo "🔧 CORRECTION BUILD VPS..."

cat > vps-build-fix.sh << 'EOF'
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
EOF

chmod +x vps-build-fix.sh

# Créer aussi un script de démarrage rapide
cat > vps-start-quick.sh << 'EOF'
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
EOF

chmod +x vps-start-quick.sh

echo "📋 INSTRUCTIONS POUR CORRIGER L'ERREUR:"
echo ""
echo "1. Copiez les scripts sur votre VPS:"
echo "   scp vps-build-fix.sh vps-start-quick.sh ubuntu@purpleguy.world:/home/ubuntu/"
echo ""
echo "2. Sur le VPS, exécutez:"
echo "   cd /home/ubuntu"
echo "   ./vps-build-fix.sh"
echo ""
echo "OU pour démarrage rapide:"
echo "   ./vps-start-quick.sh"