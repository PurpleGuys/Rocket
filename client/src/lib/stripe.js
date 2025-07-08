import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION UNIQUEMENT - Clé de production forcée
const STRIPE_PRODUCTION_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Toujours utiliser la clé de production
const stripePublicKey = STRIPE_PRODUCTION_KEY;

if (!stripePublicKey) {
    console.error('❌ Clé publique Stripe manquante');
    throw new Error('Clé publique Stripe manquante');
}

console.log('✅ Stripe configuré avec clé publique PRODUCTION:', stripePublicKey.substring(0, 15) + '...');

// Export de stripePromise avec la clé de production
export const stripePromise = loadStripe(stripePublicKey);
