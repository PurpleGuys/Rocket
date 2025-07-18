// STRIPE CONFIGURATION - From Environment Variables
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  console.error('[Stripe] Missing public key. Please set VITE_STRIPE_PUBLIC_KEY in your .env file');
}

console.log('[Stripe] Configuration loaded from environment');
