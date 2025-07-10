import { loadStripe } from '@stripe/stripe-js';

// STRIPE KEY - HARDCODED AVEC PROTECTION MAXIMALE
const STRIPE_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

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
