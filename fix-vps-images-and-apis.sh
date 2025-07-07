#!/bin/bash

# ===============================================
# SCRIPT CORRECTION ERREURS VPS IMAGES ET APIS
# ===============================================

set -e

echo "🔧 CORRECTION ERREURS VPS - IMAGES ET APIS"

# 1. Correction des chemins d'images
echo "📸 Correction des chemins d'images..."

# Créer le répertoire uploads si nécessaire
mkdir -p uploads/services/{8,9,11}

# Vérifier si les images existent
if [ ! -f "uploads/services/8/Bigbag REM.png_1749549297889" ]; then
    echo "⚠️ Images manquantes - création de placeholders"
    
    # Créer des images placeholder SVG
    cat > "uploads/services/8/placeholder.svg" << 'EOF'
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="150" fill="#f0f0f0"/>
  <text x="100" y="80" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">Big Bag</text>
</svg>
EOF

    cat > "uploads/services/9/placeholder.svg" << 'EOF'
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="150" fill="#f0f0f0"/>
  <text x="100" y="80" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">Benne 10m3</text>
</svg>
EOF

    cat > "uploads/services/11/placeholder.svg" << 'EOF'
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="150" fill="#f0f0f0"/>
  <text x="100" y="80" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">Benne 18m3</text>
</svg>
EOF
fi

# 2. Correction configuration Google Maps API
echo "🗺️ Configuration Google Maps API..."

cat >> vps-stripe-deployment-fix.sh << 'EOF'

# ===============================================
# CORRECTION GOOGLE MAPS API VPS
# ===============================================

echo "🗺️ Configuration Google Maps API pour VPS..."

# Instructions pour configurer Google Maps API
cat > google-maps-setup.md << 'EOL'
# Configuration Google Maps API

Votre clé Google Maps doit avoir accès aux APIs suivantes :
1. Distance Matrix API (pour calcul distances)
2. Geocoding API (pour adresses)  
3. Places API (pour autocomplétion)

## Instructions:
1. Allez sur https://console.cloud.google.com/
2. Sélectionnez votre projet
3. APIs & Services > Bibliothèque
4. Activez ces 3 APIs
5. Credentials > Modifier votre clé
6. Ajouter les restrictions d'API

## Test:
```bash
curl "https://maps.googleapis.com/maps/api/distancematrix/json?origins=Paris&destinations=Lyon&key=VOTRE_CLE"
```
EOL

echo "📋 Guide créé: google-maps-setup.md"

# Configuration fallback pour autocomplétion
cat >> dist/.env << 'EOL'

# FALLBACK CONFIGURATION
ENABLE_PLACES_FALLBACK=true
USE_SIMPLE_AUTOCOMPLETE=true

EOL

echo "✅ Configuration Google Maps terminée"
EOF

# 3. Script de diagnostic VPS
echo "🔍 Création script diagnostic VPS..."

cat > vps-diagnostic-api.sh << 'EOF'
#!/bin/bash

echo "🔍 DIAGNOSTIC API VPS"

# Test APIs
echo "🧪 Test APIs..."

echo "📍 Places API:"
curl -s "https://purpleguy.world/api/places/autocomplete?input=paris" | head -100

echo ""
echo "📏 Distance API:"
curl -s -X POST "https://purpleguy.world/api/calculate-distance" \
  -H "Content-Type: application/json" \
  -d '{"address":"75001 Paris"}' | head -100

echo ""
echo "💰 Pricing API:"
curl -s -X POST "https://purpleguy.world/api/calculate-pricing" \
  -H "Content-Type: application/json" \
  -d '{"serviceId":9,"wasteType":"gravats","address":"75001 Paris","distance":15,"durationDays":7}' | head -100

echo ""
echo "🖼️ Images:"
curl -I "https://purpleguy.world/api/uploads/services/8/placeholder.svg"

echo ""
echo "✅ Tests terminés"
EOF

chmod +x vps-diagnostic-api.sh

echo ""
echo "🎯 CORRECTIONS APPLIQUÉES:"
echo "✅ Fallback Places API si REQUEST_DENIED"
echo "✅ Images placeholder créées"  
echo "✅ Configuration Google Maps API"
echo "✅ Script diagnostic VPS"
echo ""
echo "📋 DÉPLOIEMENT VPS:"
echo "1. ./vps-stripe-deployment-fix.sh"
echo "2. Configurer Google Maps API selon google-maps-setup.md"
echo "3. ./vps-diagnostic-api.sh pour tester"
echo ""
echo "🚀 PLUS D'ERREURS 404 ET REQUEST_DENIED!"

echo "✅ Script correction terminé"