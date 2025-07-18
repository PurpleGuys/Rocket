import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { users } from './shared/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Create pool with SSL handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon') 
    ? { rejectUnauthorized: false } 
    : false
});

const db = drizzle(pool);

async function resetAdminPassword() {
  try {
    console.log('🔍 Recherche de l\'utilisateur admin...');
    
    // First, check if the user exists
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'ethan.petrovic@remondis.fr'))
      .limit(1);

    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé!');
      console.log('Création d\'un nouvel utilisateur admin...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash('LoulouEP150804@', 12);
      
      const [newUser] = await db
        .insert(users)
        .values({
          email: 'ethan.petrovic@remondis.fr',
          password: hashedPassword,
          firstName: 'Ethan',
          lastName: 'Petrovic',
          phone: '+33 1 23 45 67 89',
          role: 'admin',
          isVerified: true,
          isActive: true,
          companyName: 'Remondis',
          accountType: 'professionnel',
          address: '',
          city: '',
          postalCode: '',
          country: 'FR',
          preferredLanguage: 'fr',
          marketingConsent: false,
          loginAttempts: 0,
          notifyOnInactivity: true
        })
        .returning();
      
      console.log('✅ Nouvel utilisateur admin créé:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });
    } else {
      console.log('✅ Utilisateur admin trouvé:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isVerified: adminUser.isVerified,
        isActive: adminUser.isActive
      });
      
      // Reset password
      console.log('🔐 Réinitialisation du mot de passe...');
      const hashedPassword = await bcrypt.hash('LoulouEP150804@', 12);
      
      await db
        .update(users)
        .set({
          password: hashedPassword,
          loginAttempts: 0,
          lockUntil: null,
          isVerified: true,
          isActive: true
        })
        .where(eq(users.id, adminUser.id));
      
      console.log('✅ Mot de passe réinitialisé avec succès!');
    }
    
    console.log('\n📌 Informations de connexion:');
    console.log('   Email: ethan.petrovic@remondis.fr');
    console.log('   Mot de passe: LoulouEP150804@');
    console.log('   Rôle: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Run the script
resetAdminPassword();