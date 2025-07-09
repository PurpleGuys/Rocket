// STRIPE CONFIGURATION - HARDCODED PRODUCTION KEY
export const STRIPE_PUBLIC_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Override any environment variable checks
if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
}

console.log('✅ Stripe configuration loaded with production key');
