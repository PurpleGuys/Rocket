import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec gestion d'erreur souple
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
    console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY not found - Stripe features will be disabled');
    console.warn('Please configure your Stripe public key in your environment variables');
}

export var stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;
