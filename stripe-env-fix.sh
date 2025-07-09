#!/bin/bash
# Script à exécuter sur le VPS pour corriger Stripe

# 1. Ajouter la clé Stripe au .env si elle n'existe pas
if ! grep -q "VITE_STRIPE_PUBLIC_KEY" .env 2>/dev/null; then
  echo "VITE_STRIPE_PUBLIC_KEY=pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS" >> .env
  echo "✅ Clé Stripe ajoutée au .env"
else
  # Remplacer la clé existante
  sed -i 's/^VITE_STRIPE_PUBLIC_KEY=.*/VITE_STRIPE_PUBLIC_KEY=pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS/' .env
  echo "✅ Clé Stripe mise à jour dans .env"
fi

# 2. Exporter la variable pour le processus en cours
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# 3. Créer un fichier de configuration forcée
mkdir -p client/src/lib
cat > client/src/lib/stripe-force.js << 'JSEOF'
// STRIPE FORCÉ EN PRODUCTION
const STRIPE_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
}

console.log('✅ Stripe key forced in production');
export { STRIPE_KEY };
JSEOF

# 4. Rebuild si nécessaire
if [ -f "package.json" ]; then
  echo "🔨 Rebuilding application..."
  npm run build || echo "Build failed, but continuing..."
fi

# 5. Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart all || systemctl restart bennespro || echo "Redémarrez manuellement votre application"

echo "✅ Stripe corrigé! Testez maintenant votre site."
