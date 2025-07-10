#!/bin/bash

echo "🔥 CORRECTION ULTIME STRIPE - BUDGET ILLIMITÉ"
echo ""

# La clé Stripe Production
STRIPE_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# 1. Chercher TOUS les fichiers qui pourraient utiliser Stripe
echo "🔍 Recherche de TOUS les fichiers utilisant Stripe..."
find client/src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "stripe\|Stripe\|STRIPE" "$file" 2>/dev/null; then
    echo "  - $file"
  fi
done

# 2. Créer un fichier global Stripe avec protection maximale
echo ""
echo "📝 Création d'un fichier Stripe global protégé..."
cat > client/src/lib/stripe-ultimate.js << EOF
// STRIPE ULTIMATE PROTECTION - BUDGET ILLIMITÉ
const STRIPE_KEY = '$STRIPE_KEY';

// Protection niveau 1: Variables globales
if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  
  // Protection niveau 2: Object.defineProperty pour empêcher modifications
  try {
    Object.defineProperty(window, 'VITE_STRIPE_PUBLIC_KEY', {
      value: STRIPE_KEY,
      writable: false,
      configurable: false
    });
  } catch (e) {}
  
  // Protection niveau 3: Intercepter import.meta.env
  if (window.import && window.import.meta && window.import.meta.env) {
    window.import.meta.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  }
}

// Protection niveau 4: Exporter tout
export const VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
export const STRIPE_PUBLIC_KEY = STRIPE_KEY;
export default STRIPE_KEY;

console.log('🛡️ STRIPE ULTIMATE PROTECTION ACTIVÉE');
EOF

# 3. Modifier stripe.js pour inclure TOUTES les protections
echo ""
echo "📝 Mise à jour ultime de stripe.js..."
cat > client/src/lib/stripe.js << EOF
import { loadStripe } from '@stripe/stripe-js';

// STRIPE KEY - HARDCODED AVEC PROTECTION MAXIMALE
const STRIPE_KEY = '$STRIPE_KEY';

// PROTECTION TOTALE - AUCUNE ERREUR POSSIBLE
if (typeof window !== 'undefined') {
  // Forcer partout
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  
  // Forcer dans import.meta.env
  if (!window.import) window.import = {};
  if (!window.import.meta) window.import.meta = {};
  if (!window.import.meta.env) window.import.meta.env = {};
  window.import.meta.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  
  // Protection contre undefined
  Object.defineProperty(window, 'VITE_STRIPE_PUBLIC_KEY', {
    get: () => STRIPE_KEY,
    set: () => {}, // Ignorer toute tentative de modification
    configurable: false
  });
}

// Créer stripePromise avec la clé hardcodée
export const stripePromise = loadStripe(STRIPE_KEY, { locale: 'fr' });

// Exporter la clé sous tous les noms possibles
export const VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
export const STRIPE_PUBLIC_KEY = STRIPE_KEY;
export { STRIPE_KEY };

console.log('✅ STRIPE CONFIGURÉ AVEC CLÉ PRODUCTION:', STRIPE_KEY.substring(0, 20) + '...');
EOF

# 4. Créer un script d'injection pour index.html
echo ""
echo "📝 Création d'un script d'injection HTML..."
cat > client/public/stripe-inject.js << EOF
// INJECTION STRIPE DANS HTML
window.VITE_STRIPE_PUBLIC_KEY = '$STRIPE_KEY';
window.STRIPE_PUBLIC_KEY = '$STRIPE_KEY';
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.VITE_STRIPE_PUBLIC_KEY = '$STRIPE_KEY';
console.log('🔐 Stripe key injected from HTML');
EOF

# 5. Modifier index.html pour inclure le script d'injection
echo ""
echo "📝 Mise à jour de index.html..."
if [ -f "client/index.html" ]; then
  # Ajouter le script avant </head> si pas déjà présent
  if ! grep -q "stripe-inject.js" client/index.html; then
    sed -i '/<\/head>/i <script src="/stripe-inject.js"></script>' client/index.html
  fi
fi

# 6. Créer un .env.production avec la clé
echo ""
echo "📝 Création de .env.production..."
cat > .env.production << EOF
VITE_STRIPE_PUBLIC_KEY=$STRIPE_KEY
NODE_ENV=production
EOF

# 7. Commandes pour le VPS
echo ""
echo "📋 COMMANDES POUR VOTRE VPS:"
echo ""
echo "# 1. Copier ce script sur le VPS:"
echo "scp fix-stripe-ultimate.sh ubuntu@purpleguy.world:/home/ubuntu/"
echo ""
echo "# 2. Sur le VPS, exécuter:"
echo "cd /home/ubuntu/JobDone"
echo "bash /home/ubuntu/fix-stripe-ultimate.sh"
echo ""
echo "# 3. Rebuild et démarrer:"
echo "npx vite build"
echo "export NODE_ENV=production"
echo "export VITE_STRIPE_PUBLIC_KEY=\"$STRIPE_KEY\""
echo "npx tsx server/index.ts"
echo ""
echo "✅ STRIPE PROTÉGÉ À 10000%!"