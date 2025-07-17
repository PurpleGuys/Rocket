// Script pour créer un utilisateur admin avec les credentials spécifiés
import bcrypt from 'bcryptjs';
import { db } from './server/db.ts';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  const email = 'ethan.petrovic@remondis.fr';
  const password = 'LoulouEP150804@';
  
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      // Mettre à jour l'utilisateur existant
      const [updatedUser] = await db.update(users)
        .set({
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          isVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.email, email))
        .returning();
        
      console.log('✅ Utilisateur admin mis à jour!');
      console.log('👤 ID:', updatedUser.id);
    } else {
      // Créer un nouvel utilisateur
      const [newUser] = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName: 'Ethan',
        lastName: 'Petrovic',
        phone: '+33 1 23 45 67 89',
        role: 'admin',
        isActive: true,
        isVerified: true,
        accountType: 'professionnel',
        companyName: 'Remondis',
        address: '',
        city: '',
        postalCode: '',
        country: 'FR',
        preferredLanguage: 'fr',
        marketingConsent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log('✅ Utilisateur admin créé!');
      console.log('👤 ID:', newUser.id);
    }
    
    console.log('📧 Email:', email);
    console.log('🔐 Mot de passe:', password);
    console.log('🛡️ Rôle: admin (tous les droits)');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

createAdminUser();