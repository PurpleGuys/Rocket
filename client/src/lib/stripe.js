import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from './stripe-config';

// Create stripe promise with error handling
let stripePromise = null;
try {
  stripePromise = loadStripe(STRIPE_PUBLIC_KEY, { locale: 'fr' });
  console.log('✅ Stripe configured with production key:', STRIPE_PUBLIC_KEY.substring(0, 15) + '...');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error);
  // Return null to avoid breaking the app
  stripePromise = Promise.resolve(null);
}

export { stripePromise };