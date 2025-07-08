#!/bin/bash

echo "🔧 SOLUTION STRIPE + CONTOURNEMENT ADBLOCKER"
echo "==========================================="

# 1. Créer une version anti-AdBlocker de stripe.ts
echo "1. Création de stripe.ts anti-AdBlocker..."
cat > client/src/lib/stripe.ts << 'EOF'
import { loadStripe } from '@stripe/stripe-js';

// PRODUCTION - Clé directement dans le code
const stripePublicKey = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

console.log('✅ Stripe configuré avec clé de production:', stripePublicKey.substring(0, 15) + '...');

// Fonction pour charger Stripe avec gestion des AdBlockers
async function loadStripeWithFallback() {
  try {
    // Tentative 1: Chargement normal
    const stripe = await loadStripe(stripePublicKey, {
      locale: 'fr'
    });
    
    if (stripe) {
      console.log('✅ Stripe chargé avec succès');
      return stripe;
    }
  } catch (error) {
    console.warn('⚠️ Stripe bloqué, tentative alternative...');
  }

  // Tentative 2: Sans options
  try {
    const stripe = await loadStripe(stripePublicKey);
    if (stripe) {
      console.log('✅ Stripe chargé (mode simplifié)');
      return stripe;
    }
  } catch (error) {
    console.error('❌ Impossible de charger Stripe');
  }

  // Si tout échoue, retourner null
  console.error('⚠️ ADBLOCKER DÉTECTÉ: Stripe ne peut pas être chargé');
  console.error('Désactivez votre AdBlocker pour ce site ou utilisez le mode incognito');
  return null;
}

// Export de stripePromise
export const stripePromise = loadStripeWithFallback();

// Export d'une fonction pour vérifier si Stripe est disponible
export const isStripeAvailable = async () => {
  const stripe = await stripePromise;
  return stripe !== null;
};
EOF

# 2. Créer un composant de fallback pour AdBlocker
echo "2. Création du composant AdBlockWarning..."
cat > client/src/components/AdBlockWarning.tsx << 'EOF'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink } from "lucide-react";

export function AdBlockWarning() {
  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Paiement bloqué par AdBlocker</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          Votre bloqueur de publicités empêche le chargement du système de paiement sécurisé Stripe.
        </p>
        <div className="space-y-2">
          <p className="font-semibold">Pour continuer votre réservation :</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Désactivez votre AdBlocker pour ce site</li>
            <li>Ou utilisez le mode navigation privée/incognito</li>
            <li>Ou contactez-nous pour une réservation manuelle</li>
          </ol>
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
          <Button variant="outline" asChild>
            <a href="tel:+33123456789">
              Appeler le service client
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
EOF

echo ""
echo "✅ CORRECTIONS APPLIQUÉES!"
echo "========================="
echo ""
echo "Solutions implémentées:"
echo "1. Suppression de apiVersion qui causait l'erreur"
echo "2. Gestion des AdBlockers avec fallback"
echo "3. Composant d'avertissement pour les utilisateurs"
echo ""
echo "POUR TESTER:"
echo "1. Videz le cache du navigateur"
echo "2. Désactivez l'AdBlocker ou utilisez le mode incognito"
echo "3. La console devrait afficher: '✅ Stripe chargé avec succès'"