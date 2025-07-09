import { loadStripe } from '@stripe/stripe-js';

// STRIPE PRODUCTION KEY - HARDCODED
const STRIPE_PUBLIC_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Force key everywhere
if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
}

// Create stripe promise with hardcoded key
export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY, { locale: 'fr' });

console.log('✅ Stripe configured with hardcoded production key:', STRIPE_PUBLIC_KEY.substring(0, 15) + '...');
