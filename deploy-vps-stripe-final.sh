#!/bin/bash

echo "🚀 DÉPLOIEMENT VPS AVEC STRIPE HARDCODÉ"

# 1. Build avec Stripe hardcodé
./build-vps-stripe.sh

# 2. Créer archive
tar -czf bennespro-vps.tar.gz \
  dist/ \
  server/ \
  shared/ \
  package*.json \
  drizzle.config.ts \
  .env.example

# 3. Instructions VPS
cat << 'INSTRUCTIONS'

=== DÉPLOIEMENT SUR VPS ===

1. Upload: scp bennespro-vps.tar.gz user@vps:/path/to/app/

2. Sur le VPS:
   cd /path/to/app
   tar -xzf bennespro-vps.tar.gz
   npm install --production
   
3. Variables d'environnement (.env):
   DATABASE_URL=your_database_url
   # PAS BESOIN DE VITE_STRIPE_PUBLIC_KEY - HARDCODÉ!

4. Démarrer:
   NODE_ENV=production node server/index.js

=== STRIPE EST HARDCODÉ - AUCUNE CONFIG NÉCESSAIRE ===

INSTRUCTIONS
