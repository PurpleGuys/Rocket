#!/bin/bash

# COPIER-COLLER CES COMMANDES DIRECTEMENT SUR LE VPS :

# 1. Si vous utilisez Docker :
docker exec -it bennespro-postgres psql -U postgres -d bennespro -c "UPDATE transport_pricing SET is_active = false; INSERT INTO transport_pricing (price_per_km, minimum_flat_rate, hourly_rate, immediate_loading_enabled, is_active) VALUES (4.5, 150, 0, false, true);"

# 2. Si PostgreSQL est installé directement :
sudo -u postgres psql -d bennespro -c "UPDATE transport_pricing SET is_active = false; INSERT INTO transport_pricing (price_per_km, minimum_flat_rate, hourly_rate, immediate_loading_enabled, is_active) VALUES (4.5, 150, 0, false, true);"

# 3. Pour vérifier que c'est bien appliqué :
docker exec -it bennespro-postgres psql -U postgres -d bennespro -c "SELECT * FROM transport_pricing WHERE is_active = true;"