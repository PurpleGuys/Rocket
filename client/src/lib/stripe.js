import { loadStripe } from '@stripe/stripe-js';

// Load Stripe public key from environment variable
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error('[Stripe] Missing public key. Please set VITE_STRIPE_PUBLIC_KEY in your .env file');
}

// Initialize Stripe according to official documentation
// https://stripe.com/docs/stripe-js
// Note: apiVersion is not supported in the client-side Stripe.js
export const stripePromise = stripePublicKey ? loadStripe(stripePublicKey, {
  locale: 'fr'
}) : null;

// Export the public key for components that need it
export const STRIPE_PUBLIC_KEY = stripePublicKey;

if (stripePublicKey) {
  console.log('[Stripe] Initialized with key:', stripePublicKey.substring(0, 20) + '...');
}