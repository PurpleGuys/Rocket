#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Fonction pour générer une clé sécurisée
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Fonction pour générer un UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Configuration des secrets à générer
const secrets = {
  SESSION_SECRET: generateSecureKey(64),
  JWT_SECRET: generateSecureKey(64),
  ENCRYPTION_KEY: generateSecureKey(32),
  APP_SECRET: generateSecureKey(32),
  WEBHOOK_SECRET: generateSecureKey(32),
  API_SECRET: generateSecureKey(32)
};

// Template du fichier .env avec les secrets générés
const envTemplate = `# ===========================================
# CONFIGURATION AUTOMATIQUE - NE PAS MODIFIER
# Généré le ${new Date().toISOString()}
# ===========================================

# SECRETS GÉNÉRÉS AUTOMATIQUEMENT
SESSION_SECRET="${secrets.SESSION_SECRET}"
JWT_SECRET="${secrets.JWT_SECRET}"
ENCRYPTION_KEY="${secrets.ENCRYPTION_KEY}"
APP_SECRET="${secrets.APP_SECRET}"
WEBHOOK_SECRET="${secrets.WEBHOOK_SECRET}"
API_SECRET="${secrets.API_SECRET}"

# ===========================================
# CONFIGURATION SERVEUR
# ===========================================
NODE_ENV="production"
PORT=5000
HOST="0.0.0.0"

# ===========================================
# BASE DE DONNÉES (À CONFIGURER)
# ===========================================
DATABASE_URL="postgresql://username:password@localhost:5432/remondis_db"

# ===========================================
# SERVICES EXTERNES (À CONFIGURER)
# ===========================================
# SendGrid
SENDGRID_API_KEY=""
SENDGRID_VERIFIED_SENDER_EMAIL=""

# Google Maps
GOOGLE_MAPS_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET="${secrets.WEBHOOK_SECRET}"

# ===========================================
# CONFIGURATION MÉTIER
# ===========================================
REMONDIS_SALES_EMAIL="commercial@remondis.fr"
APP_BASE_URL="https://votre-domaine.com"
ALLOWED_ORIGINS="https://votre-domaine.com,https://www.votre-domaine.com"

# Configuration des tarifs
DEFAULT_TRANSPORT_PRICE_PER_KM="1.50"
DEFAULT_MINIMUM_FLAT_RATE="50.00"
DEFAULT_HOURLY_RATE="45.00"

# Adresse du site industriel
INDUSTRIAL_SITE_ADDRESS="123 Rue de l'Industrie"
INDUSTRIAL_SITE_CITY="Votre Ville"
INDUSTRIAL_SITE_POSTAL_CODE="12345"
INDUSTRIAL_SITE_COUNTRY="France"

# ===========================================
# SÉCURITÉ
# ===========================================
SESSION_MAX_AGE="604800000"
MAX_LOGIN_ATTEMPTS="5"
ACCOUNT_LOCK_TIME="1800000"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
FORCE_HTTPS="true"
ENABLE_SECURITY_HEADERS="true"

# ===========================================
# LOGS ET MONITORING
# ===========================================
LOG_LEVEL="info"
ENABLE_PERFORMANCE_MONITORING="true"
MAX_FILE_SIZE_MB="10"
UPLOAD_DIR="./uploads"
`;

function main() {
  console.log('🔐 Génération des secrets sécurisés...');
  
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  try {
    // Vérifier si .env existe déjà
    if (fs.existsSync(envPath)) {
      console.log('⚠️  Le fichier .env existe déjà.');
      console.log('   Sauvegarde en cours...');
      
      // Créer une sauvegarde
      const backupPath = `.env.backup.${Date.now()}`;
      fs.copyFileSync(envPath, backupPath);
      console.log(`   Sauvegarde créée: ${backupPath}`);
    }
    
    // Écrire le nouveau fichier .env
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Fichier .env généré avec succès');
    
    // Mettre à jour .env.example si nécessaire
    if (!fs.existsSync(envExamplePath)) {
      const exampleTemplate = envTemplate.replace(/="[^"]*"/g, '=""');
      fs.writeFileSync(envExamplePath, exampleTemplate);
      console.log('✅ Fichier .env.example généré');
    }
    
    // Afficher les informations importantes
    console.log('\n🔑 Secrets générés:');
    Object.entries(secrets).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.substring(0, 16)}...`);
    });
    
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Configurez DATABASE_URL avec vos informations de base de données');
    console.log('   2. Ajoutez vos clés API (SendGrid, Google Maps, Stripe)');
    console.log('   3. Modifiez APP_BASE_URL avec votre domaine');
    console.log('   4. Lancez: chmod 600 .env (pour sécuriser le fichier)');
    console.log('   5. Testez la configuration avec: npm run dev');
    
    // Sécuriser le fichier .env
    try {
      fs.chmodSync(envPath, 0o600);
      console.log('✅ Permissions du fichier .env sécurisées (600)');
    } catch (error) {
      console.log('⚠️  Impossible de modifier les permissions:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSecureKey, generateUUID, secrets };