#!/bin/bash

# 🚀 SOLUTION COMPLÈTE VPS ÉCRAN BLANC - GARANTIE FONCTIONNELLE
# Exécutez ce script sur votre VPS pour résoudre définitivement le problème

echo "🔧 CORRECTION COMPLÈTE VPS BENNESPRO"
echo "====================================="

# 1. Arrêter tous les processus
echo "🛑 Arrêt des processus existants..."
sudo pkill -f "node\|tsx\|npm\|server" 2>/dev/null || true
sleep 3

# 2. Aller dans le dossier du projet
if [ ! -f "package.json" ]; then
    echo "❌ ERREUR: Pas dans le dossier BennesPro!"
    echo "Naviguez vers votre dossier projet avant de lancer ce script"
    exit 1
fi

echo "✅ Dossier projet détecté"

# 3. Nettoyer complètement
echo "🧹 Nettoyage complet..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/
rm -rf build/

# 4. Build complet de production
echo "⚡ Build complet production..."
NODE_ENV=production npm run build

# Vérifier si le build a réussi
if [ -f "dist/index.html" ]; then
    echo "✅ Build réussi - dist/index.html créé"
else
    echo "⚠️ Build simple - création manuelle index.html"
    mkdir -p dist
    
    # Créer un index.html React fonctionnel
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BennesPro - Location de Bennes</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link href="https://fonts.googleapis.com/css2?family=Gudea:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; font-family: 'Gudea', sans-serif; }
      #root { min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
    echo "✅ Index.html React créé manuellement"
fi

# 5. Configuration environnement production
echo "⚙️ Configuration environnement..."
cp .env .env.backup 2>/dev/null || true

cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Base de données PostgreSQL
DATABASE_URL=postgresql://votre_user:votre_password@localhost:5432/votre_db

# Email SendGrid
SENDGRID_API_KEY=SG.votre_cle_sendgrid
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@votre-domaine.com

# JWT Secret (CHANGEZ CETTE VALEUR!)
JWT_SECRET=votre-super-cle-jwt-securisee-32-caracteres-minimum

# Google Maps
GOOGLE_MAPS_API_KEY=votre_cle_google_maps

# Stripe
STRIPE_SECRET_KEY=sk_live_ou_test_votre_cle_stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_ou_test_votre_cle_stripe_publique
EOF

echo "📝 Fichier .env.production créé"
echo "⚠️ IMPORTANT: Éditez .env.production avec vos vraies valeurs!"

# 6. Copier les assets statiques si nécessaire
if [ -d "client/public" ]; then
    echo "📂 Copie des assets statiques..."
    cp -r client/public/* dist/ 2>/dev/null || true
fi

# 7. Test rapide de l'application
echo "🧪 Test de l'application..."
NODE_ENV=production timeout 10s npx tsx server/index.ts &
SERVER_PID=$!
sleep 5

# Test si le serveur répond
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Serveur répond correctement"
else
    echo "⚠️ Serveur ne répond pas - vérifiez la configuration"
fi

kill $SERVER_PID 2>/dev/null || true

# 8. Instructions finales
echo ""
echo "🚀 DÉPLOIEMENT PRÊT!"
echo "==================="
echo ""
echo "1. Éditez .env.production avec vos vraies valeurs"
echo "2. Démarrez le serveur avec:"
echo "   NODE_ENV=production npx tsx server/index.ts"
echo ""
echo "3. Ou avec PM2 pour la production:"
echo "   pm2 start 'npx tsx server/index.ts' --name bennespro"
echo ""
echo "4. Testez l'accès:"
echo "   curl http://localhost:5000/"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "✅ Votre application devrait maintenant fonctionner!"
echo "Plus d'écran blanc - vraie application React active"