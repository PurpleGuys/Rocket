#!/bin/bash

# Script pour corriger le problème de build manquant sur VPS
VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "🔧 CORRECTION BUILD MANQUANT VPS"
echo "================================"

ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
set -e

echo "📁 Vérification répertoire..."
cd /var/www/bennespro

echo "🏗️ Exécution du build frontend..."
# Build complet avec toutes les dépendances
npm install
npm run build

echo "📋 Vérification fichiers générés..."
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html créé"
else
    echo "❌ Erreur: dist/index.html non créé"
    echo "Contenu du dossier dist:"
    ls -la dist/ || echo "Dossier dist non trouvé"
fi

if [ -f "dist/index.js" ]; then
    echo "✅ dist/index.js créé"
else
    echo "❌ Erreur: dist/index.js non créé"
fi

echo "✅ Build terminé"
REMOTE

echo "Maintenant sur votre VPS, exécutez :"
echo "cd /var/www/bennespro && sudo ./start-app.sh"