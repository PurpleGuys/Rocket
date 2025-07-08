import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec clé publique de PRODUCTION
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Forcer l'utilisation de la clé de production en environnement de production
const STRIPE_PRODUCTION_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';
const finalStripeKey = (import.meta.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') 
    ? STRIPE_PRODUCTION_KEY 
    : stripePublicKey;

if (!finalStripeKey) {
    console.error('❌ Clé publique Stripe manquante');
    throw new Error('Clé publique Stripe manquante');
}

// Vérification que nous utilisons bien une clé de production
if (finalStripeKey.startsWith('pk_test')) {
    console.warn('⚠️  ATTENTION: Utilisation d\'une clé de test Stripe en production!');
}

console.log('✅ Stripe configuré avec clé publique:', finalStripeKey.substring(0, 12) + '...');

// Utilisation de loadStripe avec la clé finale
export const stripePromise = loadStripe(finalStripeKey);
