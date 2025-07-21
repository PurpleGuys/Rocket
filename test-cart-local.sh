#!/bin/bash

echo "🧪 TEST PANIER EN LOCAL"
echo "====================="

# Générer un session ID de test
SESSION_ID="session_test_$(date +%s)"
echo "Session ID: $SESSION_ID"

# 1. Ajouter un article au panier
echo -e "\n📦 Ajout d'un article au panier..."
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{
    "serviceId": 1,
    "wasteTypeId": 1,
    "quantity": 1,
    "transportDistance": 10,
    "transportPrice": "20.00",
    "rentalPrice": "150.00",
    "treatmentPrice": "50.00",
    "totalPrice": "220.00",
    "deliveryAddress": "123 Rue Test",
    "deliveryPostalCode": "75001",
    "deliveryCity": "Paris",
    "deliveryDate": "2025-01-25",
    "deliveryTimeSlot": "8h-12h",
    "notes": "Test local"
  }'

echo -e "\n\n🛒 Récupération du panier..."
curl -X GET http://localhost:5000/api/cart \
  -H "x-session-id: $SESSION_ID" | jq

echo -e "\n\n✅ Test terminé!"