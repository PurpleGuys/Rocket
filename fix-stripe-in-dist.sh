#!/bin/bash
# Correction rapide dans les fichiers déjà buildés

echo "🔍 Recherche des fichiers JS dans dist..."

# Chercher tous les fichiers JS et remplacer les références Stripe
find dist -name "*.js" -type f -exec grep -l "VITE_STRIPE_PUBLIC_KEY" {} \; | while read file; do
  echo "📝 Modification de $file"
  # Remplacer toute référence à une clé vide ou undefined
  sed -i 's/VITE_STRIPE_PUBLIC_KEY:""/VITE_STRIPE_PUBLIC_KEY:"pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"/g' "$file"
  sed -i 's/VITE_STRIPE_PUBLIC_KEY:void 0/VITE_STRIPE_PUBLIC_KEY:"pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"/g' "$file"
done

echo "✅ Fichiers dist modifiés!"
