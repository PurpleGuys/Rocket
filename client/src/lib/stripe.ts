import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION - Clé Stripe forcée directement
const stripePublicKey = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

console.log('✅ Stripe Production Key configurée:', stripePublicKey.substring(0, 15) + '...');

// Configuration simplifiée - sans apiVersion qui cause l'erreur
const stripeOptions = {
  locale: 'fr' as const
};

// Export direct de stripePromise
export const stripePromise = loadStripe(stripePublicKey, stripeOptions);
