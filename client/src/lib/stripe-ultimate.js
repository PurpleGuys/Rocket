// STRIPE ULTIMATE PROTECTION - BUDGET ILLIMITÉ
const STRIPE_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Protection niveau 1: Variables globales
if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  
  // Protection niveau 2: Object.defineProperty pour empêcher modifications
  try {
    Object.defineProperty(window, 'VITE_STRIPE_PUBLIC_KEY', {
      value: STRIPE_KEY,
      writable: false,
      configurable: false
    });
  } catch (e) {}
  
  // Protection niveau 3: Intercepter import.meta.env
  if (window.import && window.import.meta && window.import.meta.env) {
    window.import.meta.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
  }
}

// Protection niveau 4: Exporter tout
export const VITE_STRIPE_PUBLIC_KEY = STRIPE_KEY;
export const STRIPE_PUBLIC_KEY = STRIPE_KEY;
export default STRIPE_KEY;

console.log('🛡️ STRIPE ULTIMATE PROTECTION ACTIVÉE');
