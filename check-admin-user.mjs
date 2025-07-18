import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { users } from './shared/schema.js';
import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';

// Create pool with SSL handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon') 
    ? { rejectUnauthorized: false } 
    : false
});

const db = drizzle(pool);

async function checkAdminUser() {
  try {
    console.log('🔍 Vérification des utilisateurs admin dans la base de données...\n');
    
    // Get all admin users
    const adminUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isVerified: users.isVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
        loginAttempts: users.loginAttempts,
        lockUntil: users.lockUntil
      })
      .from(users)
      .where(or(
        eq(users.role, 'admin'),
        eq(users.email, 'ethan.petrovic@remondis.fr')
      ));

    if (adminUsers.length === 0) {
      console.log('❌ Aucun utilisateur admin trouvé dans la base de données!');
      console.log('\nPour créer un utilisateur admin, exécutez:');
      console.log('   node reset-admin-password.mjs');
    } else {
      console.log(`✅ ${adminUsers.length} utilisateur(s) admin trouvé(s):\n`);
      
      for (const user of adminUsers) {
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Nom: ${user.firstName} ${user.lastName}`);
        console.log(`Rôle: ${user.role}`);
        console.log(`Vérifié: ${user.isVerified ? 'Oui' : 'Non'}`);
        console.log(`Actif: ${user.isActive ? 'Oui' : 'Non'}`);
        console.log(`Tentatives de connexion: ${user.loginAttempts || 0}`);
        console.log(`Verrouillé jusqu'à: ${user.lockUntil || 'Non verrouillé'}`);
        console.log(`Créé le: ${user.createdAt}`);
        console.log('---');
      }
    }
    
    // Test password for ethan.petrovic@remondis.fr
    console.log('\n🔐 Test du mot de passe pour ethan.petrovic@remondis.fr...');
    const [ethanUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'ethan.petrovic@remondis.fr'))
      .limit(1);
    
    if (ethanUser) {
      const testPassword = 'LoulouEP150804@';
      const isValid = await bcrypt.compare(testPassword, ethanUser.password);
      console.log(`Mot de passe "${testPassword}" valide: ${isValid ? '✅ Oui' : '❌ Non'}`);
      
      if (!isValid) {
        console.log('\nPour réinitialiser le mot de passe, exécutez:');
        console.log('   node reset-admin-password.mjs');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Run the script
checkAdminUser();