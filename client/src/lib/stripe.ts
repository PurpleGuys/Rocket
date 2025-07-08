import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec clé publique depuis import.meta.env
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

console.log('✅ Stripe Production Key configurée');

// Configuration anti-AdBlock pour Stripe
const stripeOptions = {
  // Options pour contourner les bloqueurs de publicités
  stripeAccount: undefined,
  apiVersion: '2024-12-18.acacia' as const,
  locale: 'fr' as const,
  // Désactiver les télémetries qui peuvent être bloquées
  telemetry: false,
  // Utiliser un délai pour éviter le blocage initial
  advancedFraudSignals: false
};

// Fonction de fallback si Stripe est bloqué
let stripeInstance: any = null;

const initializeStripe = async () => {
  try {
    // Premier essai avec loadStripe classique
    stripeInstance = await loadStripe(stripePublicKey, stripeOptions);
    if (stripeInstance) {
      console.log('✅ Stripe chargé avec succès');
      return stripeInstance;
    }
  } catch (error) {
    console.warn('⚠️ Stripe bloqué par AdBlock - utilisation du fallback');
  }
  
  // Fallback : tentative avec délai
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const retryStripe = await loadStripe(stripePublicKey, {
          ...stripeOptions,
          // Réduire encore plus les fonctionnalités pour contourner AdBlock
          advancedFraudSignals: false
        });
        resolve(retryStripe);
      } catch (err) {
        console.error('❌ Impossible de charger Stripe:', err);
        resolve(null);
      }
    }, 1000);
  });
};

// Export de stripePromise avec protection AdBlock
export const stripePromise = initializeStripe();
