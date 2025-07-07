// ===============================================
// ASSURE LE CHARGEMENT DES VARIABLES ENV
// ===============================================

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour charger le .env avec gestion d'erreur
export function loadEnvironment() {
  const envPath = join(__dirname, '.env');
  
  console.log('🔍 Chargement des variables d\'environnement...');
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(envPath)) {
    console.error('❌ ERREUR: Fichier .env non trouvé!');
    console.error(`   Chemin attendu: ${envPath}`);
    console.error('   Créez un fichier .env à partir de .env.example');
    
    // Créer un .env minimal si inexistant
    const minimalEnv = `# Fichier .env créé automatiquement
# Copiez les valeurs depuis .env.example

NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost:5432/bennespro
`;
    
    fs.writeFileSync(envPath, minimalEnv);
    console.log('✅ Fichier .env minimal créé');
  }
  
  // Charger le fichier
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('❌ Erreur lors du chargement du .env:', result.error);
    return false;
  }
  
  // Afficher les variables chargées (masquées)
  const loadedVars = Object.keys(result.parsed || {});
  console.log(`✅ ${loadedVars.length} variables chargées depuis .env`);
  
  // Vérifier les variables critiques
  const criticalVars = [
    'DATABASE_URL',
    'GOOGLE_MAPS_API_KEY',
    'VITE_STRIPE_PUBLIC_KEY',
    'STRIPE_SECRET_KEY'
  ];
  
  const missingVars = criticalVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Variables critiques manquantes:');
    missingVars.forEach(v => console.warn(`   - ${v}`));
    console.warn('   L\'application fonctionnera avec des limitations');
  }
  
  return true;
}

// Fonction helper pour obtenir une variable avec fallback
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  
  if (!value && !defaultValue) {
    console.warn(`⚠️  Variable ${name} non définie`);
    return '';
  }
  
  return value || defaultValue || '';
}

// Exporter les variables critiques avec validation
export const ENV = {
  // Base de données
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://localhost:5432/bennespro'),
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY'),
  
  // Stripe
  STRIPE_PUBLIC_KEY: getEnvVar('VITE_STRIPE_PUBLIC_KEY'),
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY'),
  
  // Application
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '5000')),
  
  // Sécurité
  JWT_SECRET: getEnvVar('JWT_SECRET', 'default-jwt-secret-change-in-production'),
  SESSION_SECRET: getEnvVar('SESSION_SECRET', 'default-session-secret-change-in-production'),
  
  // Email
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY'),
  
  // URLs
  VITE_API_URL: getEnvVar('VITE_API_URL', 'http://localhost:5000/api'),
  BACKEND_URL: getEnvVar('BACKEND_URL', 'http://localhost:5000')
};

// Charger automatiquement au démarrage
if (import.meta.url === `file://${process.argv[1]}`) {
  loadEnvironment();
  console.log('\n📊 Variables d\'environnement chargées:');
  console.log(JSON.stringify(ENV, null, 2));
}