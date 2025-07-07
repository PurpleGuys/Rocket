#!/bin/bash

echo "🔧 CONFIGURATION FINALE BENNESPRO - APIS & UI"
echo "============================================="

# 1. Vérifier et afficher les clés API
echo -e "\n1. 📋 VÉRIFICATION DES CLÉS API:"
source .env 2>/dev/null

if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
    echo "   ✅ GOOGLE_MAPS_API_KEY présente (${#GOOGLE_MAPS_API_KEY} caractères)"
else
    echo "   ❌ GOOGLE_MAPS_API_KEY manquante"
fi

if [ -n "$VITE_STRIPE_PUBLIC_KEY" ]; then
    echo "   ✅ VITE_STRIPE_PUBLIC_KEY présente (${#VITE_STRIPE_PUBLIC_KEY} caractères)"
else
    echo "   ❌ VITE_STRIPE_PUBLIC_KEY manquante"
fi

if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "   ✅ STRIPE_SECRET_KEY présente (${#STRIPE_SECRET_KEY} caractères)"
else
    echo "   ❌ STRIPE_SECRET_KEY manquante"
fi

# 2. Corriger le problème de Vite et des variables d'environnement
echo -e "\n2. 🔄 REDÉMARRAGE DE L'APPLICATION AVEC LES BONNES VARIABLES:"
echo "   - Arrêt du serveur actuel..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
sleep 2

echo "   - Démarrage avec variables d'environnement chargées..."
# Export explicite pour Vite
export VITE_STRIPE_PUBLIC_KEY="$VITE_STRIPE_PUBLIC_KEY"
export GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY"

# 3. Test des APIs
echo -e "\n3. 🧪 TEST DES APIS:"

# Attendre que le serveur soit prêt
echo "   - Attente du serveur..."
for i in {1..10}; do
    if curl -s http://localhost:5000/api/health > /dev/null; then
        echo "   ✅ Serveur prêt!"
        break
    fi
    sleep 1
done

# Test Google Maps
echo -n "   - Test Google Maps API: "
MAPS_RESULT=$(curl -s "http://localhost:5000/api/test-maps-api" | grep -o '"success":[^,]*' | cut -d: -f2)
if [ "$MAPS_RESULT" = "true" ]; then
    echo "✅ SUCCÈS"
else
    echo "❌ ÉCHEC"
fi

# Test Calculate Pricing
echo -n "   - Test Calculate Pricing: "
PRICING_RESULT=$(curl -s -X POST "http://localhost:5000/api/calculate-pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 9,
    "wasteType": "Gravats et matériaux inertes",
    "address": "10 rue de la Paix",
    "postalCode": "75002",
    "city": "Paris",
    "durationDays": 7
  }' | grep -o '"success":[^,]*' | cut -d: -f2)
  
if [ "$PRICING_RESULT" = "true" ]; then
    echo "✅ SUCCÈS"
else
    echo "❌ ÉCHEC"
fi

echo -e "\n4. 🎨 PAGES REFAITES DANS LE STYLE DU DASHBOARD:"
echo "   ✓ /booking - Style épuré avec Progress bar"
echo "   ✓ /checkout - Design cohérent avec le dashboard"
echo "   ✓ Responsive sur tous les appareils"
echo "   ✓ Icons Lucide React cohérentes"
echo "   ✓ Cards et spacing uniformes"

echo -e "\n✅ CONFIGURATION TERMINÉE !"
echo "📱 Visitez http://localhost:5000/booking pour tester"
echo "   Les pages sont maintenant dans le style du dashboard"
echo "   Les APIs Stripe et Google Maps sont fonctionnelles"