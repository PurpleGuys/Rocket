// Script pour créer un utilisateur admin localement
const bcrypt = require('bcryptjs');
const { db } = require('./server/db');
const { users } = require('./shared/schema');

async function createAdminUser() {
  const email = 'ethan.petrovic@remondis.fr';
  const password = 'Remondis2025$';
  
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName: 'Ethan',
      lastName: 'Petrovic',
      phone: '+33 1 23 45 67 89',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        updatedAt: new Date()
      }
    })
    .returning();
    
    console.log('✅ Utilisateur admin créé avec succès!');
    console.log('📧 Email:', email);
    console.log('🔐 Mot de passe:', password);
    console.log('👤 ID:', user.id);
    console.log('🛡️ Rôle:', user.role);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

createAdminUser();