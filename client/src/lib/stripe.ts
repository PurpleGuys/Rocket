import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe pour production
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY not found in environment - Stripe payments will be disabled');
}

// Export de stripePromise avec gestion d'erreur gracieuse
export const stripePromise = stripePublicKey 
  ? loadStripe(stripePublicKey).catch((err) => {
      console.error('Failed to load Stripe:', err);
      return null;
    })
  : Promise.resolve(null);
