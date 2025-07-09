// STRIPE PRODUCTION KEY - HARDCODED POUR VPS
const STRIPE_PUBLIC_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Force la clé partout
if (typeof window !== 'undefined') {
  window.STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
}

export { STRIPE_PUBLIC_KEY };
