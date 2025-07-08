#!/bin/bash

echo "🔍 TEST DES ENDPOINTS API BENNESPRO SUR VPS"
echo "==========================================="

# URL de base
BASE_URL="https://purpleguy.world"

echo ""
echo "1. Test API health"
echo "-----------------"
curl -s "${BASE_URL}/api/health" | jq '.' || echo "❌ Erreur"

echo ""
echo "2. Test services"
echo "---------------"
curl -s "${BASE_URL}/api/services" | jq '.' || echo "❌ Erreur"

echo ""
echo "3. Test waste-types"
echo "------------------"
curl -s "${BASE_URL}/api/waste-types" | jq '.' || echo "❌ Erreur"

echo ""
echo "4. Test calculate-pricing (POST)"
echo "-------------------------------"
curl -X POST "${BASE_URL}/api/calculate-pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7,
    "bsdOption": false
  }' | jq '.' || echo "❌ Erreur"

echo ""
echo "5. Test pricing-service (fallback)"
echo "---------------------------------"
curl -X POST "${BASE_URL}/api/pricing/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 8,
    "wasteType": "construction",
    "address": "123 rue de la République, 75001 Paris",
    "durationDays": 7
  }' | jq '.' || echo "❌ Erreur"

echo ""
echo "6. Liste toutes les routes API disponibles"
echo "----------------------------------------"
echo "Routes attendues:"
echo "- GET  /api/health"
echo "- GET  /api/services"
echo "- GET  /api/waste-types"
echo "- POST /api/calculate-pricing"
echo "- GET  /api/treatment-pricing"
echo "- POST /api/auth/login"
echo "- POST /api/auth/register"
echo "- POST /api/orders"

echo ""
echo "✅ Test terminé"