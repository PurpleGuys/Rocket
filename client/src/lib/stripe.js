import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec clé publique correcte
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
    console.error('❌ VITE_STRIPE_PUBLIC_KEY manquante dans les variables d\'environnement');
    throw new Error('Clé publique Stripe manquante');
}

console.log('✅ Stripe configuré avec clé publique:', stripePublicKey.substring(0, 12) + '...');

// Utilisation de loadStripe avec la clé publique depuis import.meta.env
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
