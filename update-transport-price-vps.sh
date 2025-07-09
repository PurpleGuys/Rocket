#!/bin/bash

# Script pour mettre à jour le prix de transport sur le VPS
# Prix de base : 4.5€/km, Forfait minimum : 150€, Tarif horaire : 0€

echo "=== Mise à jour du prix de transport BennesPro ==="
echo "Prix de base : 4.5€/km"
echo "Forfait minimum : 150€"
echo "Tarif horaire : 0€"
echo ""

# Variables de connexion PostgreSQL
DB_NAME="bennespro"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Demander le mot de passe si nécessaire
echo "Connexion à la base de données PostgreSQL..."

# Exécuter les requêtes SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Désactiver tous les anciens enregistrements
UPDATE transport_pricing SET is_active = false;

-- Créer un nouvel enregistrement actif avec le prix à 4.5€/km
INSERT INTO transport_pricing (
    price_per_km, 
    minimum_flat_rate, 
    hourly_rate, 
    immediate_loading_enabled, 
    is_active,
    created_at,
    updated_at
) VALUES (
    4.5,     -- Prix par km
    150,     -- Forfait minimum
    0,       -- Tarif horaire
    false,   -- Chargement immédiat désactivé
    true,    -- Actif
    NOW(),   -- Date de création
    NOW()    -- Date de mise à jour
) RETURNING *;

-- Vérifier le résultat
SELECT * FROM transport_pricing WHERE is_active = true;
EOF

echo ""
echo "✅ Prix de transport mis à jour avec succès !"
echo ""
echo "Pour utiliser ce script sur le VPS :"
echo "1. Copiez ce fichier sur le VPS"
echo "2. Rendez-le exécutable : chmod +x update-transport-price-vps.sh"
echo "3. Exécutez-le : ./update-transport-price-vps.sh"
echo ""
echo "Si vous utilisez Docker, utilisez cette commande :"
echo "docker exec -it bennespro-postgres psql -U postgres -d bennespro"