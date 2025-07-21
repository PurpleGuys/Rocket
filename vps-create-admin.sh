#!/bin/bash

# Script pour créer l'utilisateur admin sur le VPS
# Usage: ./vps-create-admin.sh

echo "==================================="
echo "Création de l'utilisateur admin VPS"
echo "==================================="

# Variables pour l'admin
ADMIN_EMAIL="ethan.petrovic@remondis.fr"
ADMIN_PASSWORD="LoulouEP150804@"

# Créer le script SQL pour l'admin
cat > create-admin-vps.sql << 'EOF'
-- Vérifier si l'utilisateur existe déjà
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ethan.petrovic@remondis.fr') THEN
        -- Créer l'utilisateur admin
        INSERT INTO users (
            email, 
            username, 
            password_hash, 
            role, 
            is_verified, 
            first_name, 
            last_name,
            phone,
            created_at,
            updated_at
        ) VALUES (
            'ethan.petrovic@remondis.fr',
            'ethan.petrovic',
            '$2b$10$0FhHKJYX.gE7xjbQ7a7Kyu6xsD.fRfJAG0Iqt5UfQ7h3VjRhBsXBa', -- Hash de LoulouEP150804@
            'admin',
            true,
            'Ethan',
            'Petrovic',
            '0123456789',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        -- Mettre à jour le mot de passe si l'utilisateur existe
        UPDATE users 
        SET 
            password_hash = '$2b$10$0FhHKJYX.gE7xjbQ7a7Kyu6xsD.fRfJAG0Iqt5UfQ7h3VjRhBsXBa',
            role = 'admin',
            is_verified = true,
            updated_at = NOW()
        WHERE email = 'ethan.petrovic@remondis.fr';
        RAISE NOTICE 'Admin user updated successfully';
    END IF;
END $$;

-- Vérifier le résultat
SELECT id, email, username, role, is_verified FROM users WHERE email = 'ethan.petrovic@remondis.fr';
EOF

echo "Script SQL créé avec succès."

echo ""
echo "==================================="
echo "INSTRUCTIONS POUR LE VPS:"
echo "==================================="
echo ""
echo "1. Connectez-vous à votre VPS:"
echo "   ssh votre_utilisateur@purpleguy.world"
echo ""
echo "2. Exécutez le script SQL:"
echo "   sudo -u postgres psql -d bennespro < create-admin-vps.sql"
echo ""
echo "3. Ou si vous utilisez Docker:"
echo "   docker exec -i bennespro-postgres psql -U postgres -d bennespro < create-admin-vps.sql"
echo ""
echo "4. Vérifiez que l'utilisateur a été créé:"
echo "   sudo -u postgres psql -d bennespro -c \"SELECT * FROM users WHERE email='ethan.petrovic@remondis.fr';\""
echo ""
echo "5. Redémarrez l'application:"
echo "   sudo systemctl restart bennespro"
echo "   # ou"
echo "   docker-compose restart app"
echo ""
echo "Credentials:"
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo ""