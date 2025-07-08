#!/bin/bash

echo "🔧 CORRECTION DÉFINITIVE DES CLÉS STRIPE EN PRODUCTION"
echo "====================================================="

# 1. Supprimer toute référence aux clés de test dans TOUS les fichiers
echo -e "\n1️⃣ SUPPRESSION DE TOUTES LES RÉFÉRENCES AUX CLÉS DE TEST..."

# Rechercher et remplacer dans tous les fichiers
find . -type f \( -name "*.sh" -o -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.env*" \) \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -exec grep -l "pk_test\|sk_test" {} \; | while read file; do
    echo "  Nettoyage de: $file"
    sed -i 's/pk_test[^ "]*/pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS/g' "$file"
    sed -i 's/sk_test[^ "]*/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/g' "$file"
done

# 2. Forcer les variables d'environnement dans le build
echo -e "\n2️⃣ CONFIGURATION DES VARIABLES D'ENVIRONNEMENT..."

# Créer un fichier .env.production
cat > .env.production << 'EOF'
NODE_ENV=production
VITE_STRIPE_PUBLIC_KEY=pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS
STRIPE_SECRET_KEY=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
EOF

# Copier toutes les autres variables depuis .env
grep -v "NODE_ENV\|STRIPE" .env >> .env.production

# 3. Nettoyer complètement
echo -e "\n3️⃣ NETTOYAGE COMPLET..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf client/.vite
rm -rf .cache

# 4. Build avec les variables de production forcées
echo -e "\n4️⃣ BUILD AVEC VARIABLES DE PRODUCTION FORCÉES..."
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
export STRIPE_SECRET_KEY="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"

# Build avec dotenv-cli pour forcer les variables
npx dotenv -e .env.production -- npm run build

# 5. Vérifier le résultat
echo -e "\n5️⃣ VÉRIFICATION DU BUILD..."
echo "Recherche de clés de test..."
if grep -r "pk_test" dist/ 2>/dev/null; then
    echo "❌ ERREUR: Des clés de test trouvées!"
    
    # Si on trouve encore des clés de test, on les remplace directement dans le build
    echo "Application du correctif post-build..."
    find dist -type f -name "*.js" -exec sed -i 's/pk_test[^ "]*/pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS/g' {} \;
else
    echo "✅ Aucune clé de test dans le build"
fi

echo ""
echo "Recherche de clés de production..."
if grep -r "pk_live" dist/ 2>/dev/null | head -1; then
    echo "✅ Clés de production trouvées dans le build"
fi

# 6. Remplacer .env par .env.production
echo -e "\n6️⃣ MISE À JOUR DU FICHIER .ENV..."
cp .env .env.backup
cp .env.production .env

# 7. Redémarrer avec les nouvelles variables
echo -e "\n7️⃣ REDÉMARRAGE DE L'APPLICATION..."
pm2 delete bennespro 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

echo -e "\n✅ CORRECTION TERMINÉE!"
echo "======================"
echo ""
echo "Actions effectuées:"
echo "- Suppression de TOUTES les références aux clés de test"
echo "- Build forcé avec clés de production"
echo "- Correctif post-build si nécessaire"
echo "- Redémarrage avec environnement de production"
echo ""
echo "Test: curl http://localhost:5000/api/health"
echo ""
echo "⚠️  IMPORTANT: Videz complètement le cache du navigateur!"