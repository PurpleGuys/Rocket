import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error('VITE_STRIPE_PUBLIC_KEY not found in environment variables');
  console.log('Available env vars:', Object.keys(import.meta.env));
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

export const stripePromise = loadStripe(stripePublicKey);
