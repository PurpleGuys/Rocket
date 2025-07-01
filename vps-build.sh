#!/bin/bash

# Build et déploiement direct sur VPS
set -e

VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "🚀 BUILD ET DÉPLOIEMENT DIRECT VPS"
echo "=================================="

# Transfert du code source vers VPS
echo "📤 Transfert code source..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p /tmp/bennespro-src"
scp -o StrictHostKeyChecking=no -r server/ client/ shared/ package.json vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js components.json $VPS_USER@$VPS_IP:/tmp/bennespro-src/
if [ -f index.html ]; then
    scp -o StrictHostKeyChecking=no index.html $VPS_USER@$VPS_IP:/tmp/bennespro-src/
fi

# Build et installation sur VPS
echo "⚙️ Build sur VPS..."
ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
set -e

# Nettoyage et préparation
sudo rm -rf /var/www/bennespro
sudo mkdir -p /var/www/bennespro
sudo chown $USER:$USER /var/www/bennespro

# Copie du code source
cp -r /tmp/bennespro-src/* /var/www/bennespro/
cd /var/www/bennespro

# Nettoyage du package-lock.json problématique
rm -f package-lock.json

# Installation complète pour le build
npm install

# Build de l'application
npm run build

# Nettoyage et installation production seulement
rm -rf node_modules
npm install --only=production

# Création du script de démarrage
cat > start-app.sh << 'SCRIPT'
#!/bin/bash
export DATABASE_URL="postgresql://remondis:Remondis60110$@localhost:5432/remondis_db"
export NODE_ENV="production"
export PORT="3000"
export SESSION_SECRET="f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5"
export JWT_SECRET="85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723"
export STRIPE_SECRET_KEY="sk_test_fake_key_for_development"
export STRIPE_PUBLISHABLE_KEY="pk_test_fake_key_for_development"
export STRIPE_WEBHOOK_SECRET="whsec_fake_webhook_secret"
export SENDGRID_API_KEY=""
export SENDGRID_VERIFIED_SENDER_EMAIL=""
export GOOGLE_MAPS_API_KEY=""
export REMONDIS_SALES_EMAIL="commercial@remondis.fr"
export APP_BASE_URL="http://purpleguy.world"

echo "🚀 BennesPro démarré sur port 3000"
node dist/index.js
SCRIPT

chmod +x start-app.sh

echo "✅ Build terminé dans /var/www/bennespro"
echo "Démarrer avec: sudo ./start-app.sh"
REMOTE

echo "✅ DÉPLOIEMENT TERMINÉ"
echo ""
echo "Sur votre VPS, exécutez :"
echo "cd /var/www/bennespro && sudo ./start-app.sh"