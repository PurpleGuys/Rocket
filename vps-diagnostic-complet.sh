#!/bin/bash

# ===============================================
# DIAGNOSTIC VPS COMPLET - BENNESPRO
# ===============================================

echo "🔍 DIAGNOSTIC VPS COMPLET"

# 1. Test des APIs principales
echo "🧪 Test des APIs principales..."

echo "📍 Places API (autocomplétion):"
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
echo "🖼️ Images Services:"
echo "Service 8 (Big Bag):"
curl -I "https://purpleguy.world/api/uploads/services/8/placeholder.svg"

echo "Service 9 (Benne 10m³):"
curl -I "https://purpleguy.world/api/uploads/services/9/placeholder.svg"

echo "Service 11 (Benne 18m³):"
curl -I "https://purpleguy.world/api/uploads/services/11/placeholder.svg"

echo ""
echo "📊 Services API:"
curl -s "https://purpleguy.world/api/services" | head -100

echo ""
echo "🗑️ Waste Types API:"
curl -s "https://purpleguy.world/api/waste-types" | head -100

echo ""
echo "🛡️ Health Check:"
curl -s "https://purpleguy.world/api/health"

echo ""
echo "✅ Diagnostic terminé"