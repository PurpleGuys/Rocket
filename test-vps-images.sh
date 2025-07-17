#!/bin/bash

echo "Test des images de services..."

# Test service 8 (Big Bag)
echo -n "Service 8 (Big Bag): "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/8/placeholder.svg

echo ""

# Test service 9 (Benne 10m³)  
echo -n "Service 9 (Benne 10m³): "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/9/placeholder.svg

echo ""

# Test service 11 (Benne 18m³)
echo -n "Service 11 (Benne 18m³): "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/11/placeholder.svg

echo ""
