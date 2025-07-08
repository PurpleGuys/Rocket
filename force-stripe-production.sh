#!/bin/bash

echo "🔧 FORÇAGE DES CLÉS STRIPE DE PRODUCTION"
echo "========================================"

# 1. Vérifier les clés dans .env
echo -e "\n1️⃣ VÉRIFICATION DES CLÉS DANS .ENV..."

STRIPE_PUBLIC=$(grep "VITE_STRIPE_PUBLIC_KEY" .env | cut -d'"' -f2)
STRIPE_SECRET=$(grep "STRIPE_SECRET_KEY" .env | cut -d'"' -f2)

echo "Clé publique actuelle: ${STRIPE_PUBLIC:0:15}..."
echo "Clé secrète actuelle: ${STRIPE_SECRET:0:15}..."

# 2. S'assurer que ce sont des clés de production
if [[ $STRIPE_PUBLIC != pk_live* ]]; then
    echo "❌ ERREUR: La clé publique n'est pas une clé de production!"
    echo "   Veuillez mettre à jour VITE_STRIPE_PUBLIC_KEY dans .env avec une clé pk_live_..."
    exit 1
fi

if [[ $STRIPE_SECRET != sk_live* ]]; then
    echo "❌ ERREUR: La clé secrète n'est pas une clé de production!"
    echo "   Veuillez mettre à jour STRIPE_SECRET_KEY dans .env avec une clé sk_live_..."
    exit 1
fi

echo "✅ Les clés sont bien des clés de production"

# 3. Forcer l'export des variables pour le build
echo -e "\n2️⃣ EXPORT DES VARIABLES D'ENVIRONNEMENT..."

export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="$STRIPE_PUBLIC"
export STRIPE_SECRET_KEY="$STRIPE_SECRET"

# 4. Nettoyer complètement le cache
echo -e "\n3️⃣ NETTOYAGE COMPLET DU CACHE..."

rm -rf dist
rm -rf node_modules/.vite
rm -rf .cache
rm -rf client/.vite
find . -name "*.cache" -type f -delete 2>/dev/null

echo "✅ Cache nettoyé"

# 5. Rebuild complet
echo -e "\n4️⃣ REBUILD COMPLET DE L'APPLICATION..."

npm run build

# 6. Vérifier le résultat
echo -e "\n5️⃣ VÉRIFICATION DU BUILD..."

echo "Recherche de pk_test dans le build..."
if grep -r "pk_test" dist/ 2>/dev/null; then
    echo "⚠️  Des références à pk_test trouvées!"
    grep -r "pk_test" dist/ | head -5
else
    echo "✅ Aucune référence à pk_test"
fi

echo ""
echo "Recherche de pk_live dans le build..."
if grep -r "pk_live" dist/ 2>/dev/null | head -1; then
    echo "✅ Clés de production pk_live trouvées dans le build"
else
    echo "❌ Aucune clé de production trouvée dans le build"
fi

# 7. Instructions finales
echo -e "\n✅ SCRIPT TERMINÉ!"
echo "=================="
echo ""
echo "ACTIONS REQUISES:"
echo "1. Redémarrer l'application: pm2 restart bennespro"
echo "2. Vider le cache du navigateur (Ctrl+Shift+R)"
echo "3. Tester en mode incognito"
echo ""
echo "Si le problème persiste:"
echo "- Vérifiez les logs: pm2 logs bennespro"
echo "- Testez l'API: curl http://localhost:5000/api/health"