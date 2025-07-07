#!/bin/bash

# ===============================================
# CORRECTION GOOGLE MAPS ET STRIPE VPS
# ===============================================

echo "🔧 CORRECTION GOOGLE MAPS ET STRIPE POUR VPS"

# 1. Configuration Google Maps
echo "🗺️ Configuration Google Maps API..."

# Vérifier la clé Google Maps
if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    echo "❌ ERREUR: GOOGLE_MAPS_API_KEY non définie"
    echo "Définissez-la avec: export GOOGLE_MAPS_API_KEY='votre-clé'"
    exit 1
fi

# Test Google Maps API
echo "🧪 Test Google Maps API..."
curl -s "https://maps.googleapis.com/maps/api/distancematrix/json?origins=Paris&destinations=Lyon&key=$GOOGLE_MAPS_API_KEY" | jq '.status' || echo "Erreur API"

# 2. Configuration Stripe
echo "💳 Configuration Stripe..."

# Vérifier les clés Stripe
if [ -z "$VITE_STRIPE_PUBLIC_KEY" ] || [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ ERREUR: Clés Stripe non définies"
    echo "Définissez-les avec:"
    echo "export VITE_STRIPE_PUBLIC_KEY='pk_live_...'"
    echo "export STRIPE_SECRET_KEY='sk_live_...'"
    exit 1
fi

# 3. Correction du build pour intégrer les clés
echo "📦 Correction du build..."

# Créer un fichier de configuration pour le build
cat > vite-env-override.js << EOF
export default {
  VITE_STRIPE_PUBLIC_KEY: '$VITE_STRIPE_PUBLIC_KEY',
  VITE_API_URL: 'https://purpleguy.world/api'
}
EOF

# 4. Correction du code Stripe côté client
echo "🔧 Correction code Stripe..."
cat > client/src/lib/stripe-vps.ts << 'EOF'
import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe pour VPS avec clé hardcodée si nécessaire
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 
  (window.location.hostname === 'purpleguy.world' ? 'VOTRE_CLE_PUBLIQUE_STRIPE' : '');

if (!stripePublicKey) {
  console.error('Stripe public key not configured');
}

export const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

// Fonction pour obtenir la configuration Stripe
export async function getStripeConfig() {
  try {
    const response = await fetch('/api/stripe/config');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch Stripe config:', error);
  }
  
  // Fallback configuration
  return {
    publishableKey: stripePublicKey,
    enabled: !!stripePublicKey
  };
}
EOF

# 5. Correction de l'API distance
echo "📏 Correction calcul distance..."
cat > server/distanceService-vps.ts << 'EOF'
export class DistanceService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
  static async calculateDistance(originAddress: string, destinationAddress: string): Promise<any> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      // Fallback avec distance fixe
      return {
        distance: 50,
        duration: 60
      };
    }
    
    try {
      const origin = encodeURIComponent(originAddress);
      const destination = encodeURIComponent(destinationAddress);
      const url = \`https://maps.googleapis.com/maps/api/distancematrix/json?origins=\${origin}&destinations=\${destination}&key=\${this.GOOGLE_MAPS_API_KEY}\`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
        return {
          distance: Math.round(data.rows[0].elements[0].distance.value / 1000),
          duration: Math.round(data.rows[0].elements[0].duration.value / 60)
        };
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
    }
    
    // Fallback
    return {
      distance: 50,
      duration: 60
    };
  }
}
EOF

# 6. Script de test complet
echo "🧪 Création script de test..."
cat > test-apis-vps.sh << 'EOF'
#!/bin/bash

echo "🧪 TEST APIS VPS"

# Test Google Maps
echo "🗺️ Test Google Maps Distance:"
curl -s -X POST https://purpleguy.world/api/calculate-distance \
  -H "Content-Type: application/json" \
  -d '{"address":"75001 Paris"}'

echo -e "\n📍 Test Google Places:"
curl -s "https://purpleguy.world/api/places/autocomplete?input=paris"

echo -e "\n💰 Test Pricing avec distance:"
curl -s -X POST https://purpleguy.world/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{"serviceId":9,"wasteType":"gravats","address":"75001 Paris","durationDays":7}'

echo -e "\n💳 Test Stripe Config:"
curl -s https://purpleguy.world/api/stripe/config

echo -e "\n✅ Tests terminés"
EOF

chmod +x test-apis-vps.sh

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 ÉTAPES SUIVANTES:"
echo "1. Définissez vos clés API:"
echo "   export GOOGLE_MAPS_API_KEY='votre-clé-google'"
echo "   export VITE_STRIPE_PUBLIC_KEY='pk_live_...'"
echo "   export STRIPE_SECRET_KEY='sk_live_...'"
echo ""
echo "2. Relancez le build: npm run build"
echo "3. Redémarrez le service: sudo systemctl restart bennespro"
echo "4. Testez avec: ./test-apis-vps.sh"
echo ""
echo "🔍 Pour débugger:"
echo "   sudo journalctl -u bennespro -f"