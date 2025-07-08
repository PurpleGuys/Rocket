#!/bin/bash

echo "🔧 CRÉATION D'UN UTILISATEUR ADMIN DANS BENNESPRO"
echo "================================================"

# Hash du mot de passe Remondis2025$ (généré avec bcrypt)
HASHED_PASSWORD='$2b$10$X9JKqyHnVxMqXyQ8KzJnCOzJMKHxPvB0MsH1CTVRmH6CxqOpkBWnO'

# Exécuter directement la requête SQL
echo "Création de l'utilisateur admin..."

psql $DATABASE_URL << EOF
-- Créer ou mettre à jour l'utilisateur admin
INSERT INTO users (
    email,
    password,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'ethan.petrovic@remondis.fr',
    '$HASHED_PASSWORD',
    'Ethan',
    'Petrovic',
    '+33 1 23 45 67 89',
    'admin',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) 
DO UPDATE SET
    password = EXCLUDED.password,
    role = 'admin',
    is_active = true,
    is_verified = true,
    updated_at = NOW();

-- Afficher le résultat
SELECT id, email, first_name, last_name, role, is_active, is_verified
FROM users 
WHERE email = 'ethan.petrovic@remondis.fr';
EOF

echo ""
echo "✅ TERMINÉ!"
echo "=========="
echo ""
echo "Utilisateur admin créé/mis à jour:"
echo "📧 Email: ethan.petrovic@remondis.fr"
echo "🔐 Mot de passe: Remondis2025$"
echo "👤 Rôle: admin (tous les droits)"
echo ""
echo "Connectez-vous sur votre webapp avec ces identifiants!"