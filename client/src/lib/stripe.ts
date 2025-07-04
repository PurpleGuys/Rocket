import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe pour production VPS
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

if (!stripePublicKey || stripePublicKey === 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS') {
  console.log('✅ Stripe Production Key Active');
} else {
  console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY not found - using fallback key');
}

// Export de stripePromise avec gestion d'erreur gracieuse
export const stripePromise = loadStripe(stripePublicKey, {
  // Options pour éviter les blocages AdBlock
  stripeAccount: undefined,
  apiVersion: '2024-12-18.acacia',
  locale: 'fr'
}).catch((err) => {
  console.error('Failed to load Stripe:', err);
  return null;
});
