import { loadStripe } from '@stripe/stripe-js';

// Stripe temporairement désactivé pour tests
const STRIPE_DISABLED = true;

console.log('🚫 Stripe temporairement désactivé pour tests');

// Export conditionnel de stripePromise - null quand désactivé
export const stripePromise = STRIPE_DISABLED 
  ? Promise.resolve(null)
  : loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');
