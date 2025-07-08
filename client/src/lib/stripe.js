import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION KEY - NO ENV VARIABLES
const STRIPE_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

export const stripePromise = loadStripe(STRIPE_KEY, { locale: 'fr' });

console.log('✅ Stripe configured with production key');