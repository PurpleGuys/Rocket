// ===============================================
// TEST CHARGEMENT VARIABLES ENVIRONNEMENT
// ===============================================

import dotenv from 'dotenv';

// Charger les variables
dotenv.config();

console.log('🔍 TEST DE CHARGEMENT DES VARIABLES D\'ENVIRONNEMENT\n');

// Afficher le nombre de variables chargées
const envCount = Object.keys(process.env).filter(key => !key.startsWith('npm_')).length;
console.log(`✅ ${envCount} variables d'environnement chargées\n`);

// Tester les variables critiques
const criticalTests = {
  'DATABASE_URL': () => {
    const url = process.env.DATABASE_URL;
    if (!url) return '❌ Non définie';
    try {
      const parsed = new URL(url);
      return `✅ ${parsed.hostname}:${parsed.port || 5432}${parsed.pathname}`;
    } catch {
      return '❌ URL invalide';
    }
  },
  
  'GOOGLE_MAPS_API_KEY': () => {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return '❌ Non définie';
    if (key.startsWith('AIza')) return '✅ Format valide';
    return '⚠️  Format suspect';
  },
  
  'VITE_STRIPE_PUBLIC_KEY': () => {
    const key = process.env.VITE_STRIPE_PUBLIC_KEY;
    if (!key) return '❌ Non définie';
    if (key.startsWith('pk_')) return '✅ Format valide';
    return '⚠️  Format suspect';
  },
  
  'STRIPE_SECRET_KEY': () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return '❌ Non définie';
    if (key.startsWith('sk_')) return '✅ Format valide';
    return '⚠️  Format suspect';
  },
  
  'JWT_SECRET': () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) return '❌ Non définie';
    if (secret.length >= 32) return '✅ Longueur suffisante';
    return '⚠️  Trop courte (min 32 caractères)';
  },
  
  'SESSION_SECRET': () => {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return '❌ Non définie';
    if (secret.length >= 32) return '✅ Longueur suffisante';
    return '⚠️  Trop courte (min 32 caractères)';
  }
};

console.log('📋 TESTS DES VARIABLES CRITIQUES:');
console.log('==================================\n');

for (const [varName, testFn] of Object.entries(criticalTests)) {
  const result = testFn();
  console.log(`${varName}: ${result}`);
}

// Test de l'environnement
console.log('\n🌍 ENVIRONNEMENT:');
console.log('==================\n');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`PORT: ${process.env.PORT || '5000'}`);

// URLs configurées
console.log('\n🌐 URLS CONFIGURÉES:');
console.log('=====================\n');
console.log(`VITE_API_URL: ${process.env.VITE_API_URL || 'Non définie'}`);
console.log(`BACKEND_URL: ${process.env.BACKEND_URL || 'Non définie'}`);

// Résumé
console.log('\n📊 RÉSUMÉ:');
console.log('===========\n');

const allCritical = Object.entries(criticalTests).every(([_, testFn]) => {
  const result = testFn();
  return result.includes('✅');
});

if (allCritical) {
  console.log('✅ Toutes les variables critiques sont correctement configurées!');
  console.log('🚀 L\'application est prête à démarrer!');
} else {
  console.log('⚠️  Certaines variables critiques nécessitent votre attention.');
  console.log('📝 Vérifiez votre fichier .env');
}