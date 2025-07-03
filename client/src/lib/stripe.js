import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec gestion d'erreur souple
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RTkOhQWGRGBWlNRLtI1Rc4q4qE4H4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B4B';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY not found in environment - using fallback key');
}

export var stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;
