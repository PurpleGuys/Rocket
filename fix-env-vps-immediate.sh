#!/bin/bash

echo "🔧 CORRECTION IMMÉDIATE DU FICHIER .ENV SUR VPS"
echo "=============================================="

# 1. Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet"
    echo "   Faites : cd /home/ubuntu/JobDone"
    exit 1
fi

# 2. Sauvegarder l'ancien .env
echo "📋 Sauvegarde de l'ancien .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 3. Vérifier les clés actuelles
echo -e "\n🔍 Clés Stripe actuelles :"
grep "STRIPE" .env | grep -v "^#"

# 4. Remplacer les clés de test par les clés de production
echo -e "\n🔄 Mise à jour des clés Stripe..."

# Remplacer toute clé pk_test par la clé de production
sed -i 's/pk_test_[^"]*/pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS/g' .env

# Remplacer toute clé sk_test par la clé de production
sed -i 's/sk_test_[^"]*/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/g' .env

# S'assurer que les bonnes clés sont présentes
if ! grep -q "VITE_STRIPE_PUBLIC_KEY" .env; then
    echo 'VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"' >> .env
fi

if ! grep -q "STRIPE_SECRET_KEY" .env; then
    echo 'STRIPE_SECRET_KEY="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"' >> .env
fi

# 5. Afficher les nouvelles clés
echo -e "\n✅ Nouvelles clés Stripe :"
grep "STRIPE" .env | grep -v "^#"

# 6. Nettoyer et reconstruire
echo -e "\n🧹 Nettoyage du cache..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .cache

echo -e "\n🔨 Rebuild de l'application..."
npm run build

# 7. Vérifier le résultat
echo -e "\n🔍 Vérification du build..."
if grep -r "pk_test" dist/ 2>/dev/null; then
    echo "⚠️  ATTENTION : Des clés de test trouvées dans le build !"
else
    echo "✅ Aucune clé de test dans le build"
fi

if grep -r "pk_live" dist/ 2>/dev/null | head -1; then
    echo "✅ Clés de production présentes dans le build"
fi

# 8. Redémarrer l'application
echo -e "\n🚀 Redémarrage de l'application..."
pm2 restart bennespro --update-env

echo -e "\n✅ TERMINÉ !"
echo "==========="
echo ""
echo "Vérifiez maintenant sur votre site :"
echo "1. Ouvrez un navigateur en mode incognito"
echo "2. Videz le cache (Ctrl+Shift+R)"
echo "3. La console doit afficher : 'Stripe configuré avec clé publique: pk_live...'"