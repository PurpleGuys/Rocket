#!/bin/bash

echo "🚀 Script de création/réinitialisation de l'admin pour VPS"
echo "================================================"

# Créer un fichier JavaScript temporaire
cat > /tmp/vps-admin-reset.mjs << 'EOF'
import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

// Create pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function createOrResetAdmin() {
  try {
    console.log('🔍 Vérification de l\'utilisateur admin...');
    
    // Check if user exists using raw SQL
    const existingUsers = await db.execute(
      sql`SELECT * FROM users WHERE email = 'ethan.petrovic@remondis.fr'`
    );
    
    const hashedPassword = await bcrypt.hash('LoulouEP150804@', 12);
    
    if (existingUsers.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé. Création...');
      
      // Create new admin user
      await db.execute(sql`
        INSERT INTO users (
          email, password, "firstName", "lastName", phone, role, 
          "isVerified", "isActive", "companyName", "accountType",
          address, city, "postalCode", country, "preferredLanguage",
          "marketingConsent", "loginAttempts", "notifyOnInactivity"
        ) VALUES (
          'ethan.petrovic@remondis.fr', 
          ${hashedPassword},
          'Ethan', 
          'Petrovic', 
          '+33 1 23 45 67 89', 
          'admin',
          true, 
          true, 
          'Remondis', 
          'professionnel',
          '', 
          '', 
          '', 
          'FR', 
          'fr',
          false, 
          0, 
          true
        )
      `);
      
      console.log('✅ Utilisateur admin créé avec succès!');
    } else {
      console.log('✅ Utilisateur trouvé. Réinitialisation du mot de passe...');
      
      // Update password and unlock account
      await db.execute(sql`
        UPDATE users 
        SET 
          password = ${hashedPassword},
          "loginAttempts" = 0,
          "lockUntil" = NULL,
          "isVerified" = true,
          "isActive" = true
        WHERE email = 'ethan.petrovic@remondis.fr'
      `);
      
      console.log('✅ Mot de passe réinitialisé avec succès!');
    }
    
    console.log('\n📌 Informations de connexion:');
    console.log('   URL: https://purpleguy.world');
    console.log('   Email: ethan.petrovic@remondis.fr');
    console.log('   Mot de passe: LoulouEP150804@');
    console.log('   Rôle: admin');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await pool.end();
    process.exit(1);
  }
}

createOrResetAdmin();
EOF

# Exécuter le script
echo ""
echo "📦 Installation des dépendances..."
npm install bcryptjs pg drizzle-orm dotenv

echo ""
echo "🔧 Exécution du script..."
node /tmp/vps-admin-reset.mjs

# Nettoyer
rm -f /tmp/vps-admin-reset.mjs

echo ""
echo "✅ Script terminé!"