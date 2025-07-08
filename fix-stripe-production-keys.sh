#!/bin/bash

echo "🔧 CORRECTION DES CLÉS STRIPE POUR PRODUCTION"
echo "============================================="

# 1. Vérifier les clés actuelles dans .env
echo -e "\n1️⃣ VÉRIFICATION DES CLÉS STRIPE DANS .ENV..."

if grep -q "pk_live" .env && grep -q "sk_live" .env; then
    echo "✅ Clés de production (pk_live/sk_live) trouvées dans .env"
    
    # Afficher les clés (masquées)
    STRIPE_PUBLIC=$(grep "VITE_STRIPE_PUBLIC_KEY" .env | cut -d'"' -f2)
    STRIPE_SECRET=$(grep "STRIPE_SECRET_KEY" .env | cut -d'"' -f2)
    
    echo "   - Clé publique: ${STRIPE_PUBLIC:0:12}..."
    echo "   - Clé secrète: ${STRIPE_SECRET:0:12}..."
else
    echo "❌ Clés de production manquantes dans .env"
    exit 1
fi

# 2. Nettoyer le cache de build
echo -e "\n2️⃣ NETTOYAGE DU CACHE..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .cache
echo "✅ Cache nettoyé"

# 3. Forcer la reconstruction avec les bonnes clés
echo -e "\n3️⃣ RECONSTRUCTION DE L'APPLICATION..."

# S'assurer que les variables sont exportées pour le build
export NODE_ENV=production
source .env

# Build avec les variables d'environnement
npm run build

if [ -d "dist" ]; then
    echo "✅ Build réussi avec les clés de production"
else
    echo "❌ Échec du build"
    exit 1
fi

# 4. Vérifier que les clés sont correctes dans le build
echo -e "\n4️⃣ VÉRIFICATION DES CLÉS DANS LE BUILD..."

# Chercher pk_test dans les fichiers générés
if grep -r "pk_test" dist/ 2>/dev/null; then
    echo "⚠️  ATTENTION: Des clés de test (pk_test) trouvées dans le build!"
    echo "   Le cache du navigateur doit être vidé côté client"
else
    echo "✅ Aucune clé de test trouvée dans le build"
fi

# Chercher pk_live dans les fichiers générés
if grep -r "pk_live" dist/ 2>/dev/null | head -1; then
    echo "✅ Clés de production (pk_live) présentes dans le build"
else
    echo "❌ Clés de production non trouvées dans le build"
fi

# 5. Instructions pour le déploiement
echo -e "\n5️⃣ INSTRUCTIONS POUR LE DÉPLOIEMENT:"
echo "===================================="
echo ""
echo "1. Redémarrer l'application:"
echo "   pm2 restart bennespro"
echo ""
echo "2. Vider le cache du navigateur:"
echo "   - Chrome: Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)"
echo "   - Mode incognito recommandé pour tester"
echo ""
echo "3. Vérifier dans la console du navigateur:"
echo "   - Doit afficher: '✅ Stripe configuré avec clé publique: pk_live...'"
echo "   - Ne doit PAS afficher: 'pk_test...'"
echo ""
echo "✅ Script terminé!"