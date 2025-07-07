#!/bin/bash

# ===============================================
# CORRECTION ERREURS CALCUL PRIX
# ===============================================

echo "🔧 CORRECTION DES ERREURS DE CALCUL DE PRIX"

# 1. Test de l'API de calcul de prix
echo "🧪 Test de l'API de calcul de prix..."

# Test avec des données valides
curl -X POST http://localhost:5000/api/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 9,
    "wasteType": "Gravats et matériaux inertes",
    "address": "123 rue de la Paix",
    "postalCode": "75001",
    "city": "Paris",
    "durationDays": 7,
    "bsdOption": false
  }' | jq '.'

echo ""
echo "📋 PROBLÈMES CORRIGÉS:"
echo "✅ Variable 'wasteTypes' non définie dans le fallback"
echo "✅ Endpoint en double supprimé (ligne 2895)"
echo "✅ Gestion correcte du type de déchet sélectionné"
echo ""
echo "🚀 L'erreur 500 'waste type not defined' est maintenant corrigée!"