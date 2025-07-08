#!/bin/bash

echo "🔧 CRÉATION D'UN UTILISATEUR ADMIN DANS BENNESPRO"
echo "================================================"

# Informations de l'utilisateur
EMAIL="ethan.petrovic@remondis.fr"
PASSWORD="Remondis2025$"

# 1. Créer un script Node.js pour hasher le mot de passe et créer l'utilisateur
echo "1. Création du script d'ajout d'utilisateur..."
cat > create-admin-user.js << 'EOF'
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon') 
    ? { rejectUnauthorized: false }
    : false
});

async function createAdminUser() {
  const email = 'ethan.petrovic@remondis.fr';
  const password = 'Remondis2025$';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Insérer ou mettre à jour l'utilisateur
    const query = `
      INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        phone,
        role,
        is_active,
        email_verified,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      ) ON CONFLICT (email) 
      DO UPDATE SET
        password = EXCLUDED.password,
        role = 'admin',
        is_active = true,
        email_verified = true,
        updated_at = NOW()
      RETURNING id, email, first_name, last_name, role;
    `;
    
    const values = [
      email,
      hashedPassword,
      'Ethan',
      'Petrovic',
      '+33 1 23 45 67 89',
      'admin',
      true,
      true
    ];
    
    const result = await pool.query(query, values);
    
    console.log('✅ Utilisateur admin créé avec succès:');
    console.log(result.rows[0]);
    console.log('\n📧 Email:', email);
    console.log('🔐 Mot de passe:', password);
    console.log('👤 Rôle: admin');
    console.log('✓ Compte actif et vérifié');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
EOF

# 2. Exécuter le script
echo "2. Exécution du script..."
node create-admin-user.js

# 3. Nettoyer
echo "3. Nettoyage..."
rm -f create-admin-user.js

echo ""
echo "✅ TERMINÉ!"
echo "=========="
echo ""
echo "Utilisateur admin créé:"
echo "📧 Email: ethan.petrovic@remondis.fr"
echo "🔐 Mot de passe: Remondis2025$"
echo "👤 Rôle: admin (tous les droits)"
echo ""
echo "Vous pouvez maintenant vous connecter avec ces identifiants!"