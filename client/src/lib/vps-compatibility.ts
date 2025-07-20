/**
 * VPS Compatibility Layer - Correctifs pour déploiement VPS
 * Résout les problèmes d'AdBlocker, authentification, et API
 */

// Détection d'environnement VPS
export const isVPSEnvironment = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.includes('replit.') &&
    !window.location.hostname.includes('gitpod.')
  );
};

// Configuration Stripe anti-AdBlock - DÉSACTIVÉ
export const configureStripeForVPS = () => {
  // Fonction désactivée - Stripe est maintenant chargé uniquement via loadStripe
  // depuis @stripe/stripe-js dans client/src/lib/stripe.js
  console.log('✅ Stripe est chargé via loadStripe (méthode officielle)');
};

// Configuration des headers API pour VPS
export const getVPSHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Ajouter les tokens d'authentification si disponibles
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (sessionToken) {
    headers['x-session-token'] = sessionToken;
  }
  
  // Headers spécifiques VPS
  if (isVPSEnvironment()) {
    headers['X-VPS-Environment'] = 'true';
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  
  return headers;
};

// Détection et gestion des erreurs AdBlock
export const detectAdBlockStatus = async (): Promise<boolean> => {
  try {
    // Test 1: Vérifier les ressources Stripe
    const testUrls = [
      'https://js.stripe.com/v3/',
      'https://r.stripe.com/favicon.ico',
      'https://m.stripe.com/favicon.ico'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-store'
        });
        // Si on arrive ici, pas de blocage
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          return true; // AdBlock détecté
        }
      }
    }
    
    // Test 2: Élément DOM test
    const testElement = document.createElement('div');
    testElement.innerHTML = '&nbsp;';
    testElement.className = 'adsbox';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.height = '1px';
    
    document.body.appendChild(testElement);
    
    // Attendre un peu pour la détection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const isBlocked = testElement.offsetHeight === 0;
    document.body.removeChild(testElement);
    
    return isBlocked;
  } catch (error) {
    console.error('Erreur lors de la détection AdBlock:', error);
    return false;
  }
};

// Gestion des erreurs API spécifiques VPS
export const handleVPSAPIError = (error: any, endpoint: string) => {
  console.error(`❌ Erreur API VPS sur ${endpoint}:`, error);
  
  // Erreurs spécifiques VPS
  if (error.message?.includes('net::ERR_BLOCKED_BY_ADBLOCKER')) {
    return {
      type: 'adblocker',
      message: 'Ressource bloquée par AdBlock',
      solution: 'Désactiver le bloqueur de publicités'
    };
  }
  
  if (error.message?.includes('401')) {
    return {
      type: 'auth',
      message: 'Session expirée',
      solution: 'Reconnexion nécessaire'
    };
  }
  
  if (error.message?.includes('Failed to fetch')) {
    return {
      type: 'network',
      message: 'Problème de connexion',
      solution: 'Vérifier la connexion internet'
    };
  }
  
  return {
    type: 'unknown',
    message: error.message || 'Erreur inconnue',
    solution: 'Réessayer plus tard'
  };
};

// Initialisation VPS
export const initializeVPSCompatibility = () => {
  if (typeof window === 'undefined') return;
  
  // Ne plus appeler configureStripeForVPS() - Stripe est chargé via loadStripe
  
  // Écouter les erreurs Stripe
  window.addEventListener('stripe-blocked', (event) => {
    console.error('🚫 Stripe bloqué sur VPS:', event.detail);
    // Déclencher l'affichage du message d'erreur
    document.dispatchEvent(new CustomEvent('show-stripe-error'));
  });
  
  // Gérer les erreurs d'authentification
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      console.warn('🔒 Erreur d\'authentification détectée, nettoyage des tokens');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('session_token');
    }
  });
  
  console.log('✅ Compatibilité VPS initialisée');
};

// Export des utilitaires
export default {
  isVPSEnvironment,
  configureStripeForVPS,
  getVPSHeaders,
  detectAdBlockStatus,
  handleVPSAPIError,
  initializeVPSCompatibility
};