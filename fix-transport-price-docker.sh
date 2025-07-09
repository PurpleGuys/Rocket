#!/bin/bash

echo "=== Fix Transport Price 4.5€/km pour BennesPro VPS ==="
echo ""

# Commande Docker pour mettre à jour le prix
docker exec -i bennespro-postgres psql -U postgres -d bennespro << 'EOF'
-- Désactiver tous les anciens prix
UPDATE transport_pricing SET is_active = false;

-- Insérer le nouveau prix à 4.5€/km
INSERT INTO transport_pricing (
    price_per_km, 
    minimum_flat_rate, 
    hourly_rate, 
    immediate_loading_enabled, 
    is_active
) VALUES (
    4.5,     -- 4.5 euros par km
    150,     -- 150 euros minimum
    0,       -- 0 euro tarif horaire
    false,   -- pas de chargement immédiat
    true     -- actif
);

-- Vérifier
SELECT id, price_per_km, minimum_flat_rate, is_active 
FROM transport_pricing 
WHERE is_active = true;
EOF

echo ""
echo "✅ Prix transport fixé à 4.5€/km !"