#!/usr/bin/env node

/**
 * Script de vérification de production
 * S'assure que l'application fonctionne en mode production
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

console.log('🔍 Vérification de la configuration production...');

// 1. Vérifier les variables d'environnement
console.log('📋 Vérification des variables d\'environnement...');
const requiredEnvVars = ['NODE_ENV', 'DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET'];
let envOk = true;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Variable d'environnement manquante: ${envVar}`);
    envOk = false;
  } else {
    console.log(`✅ ${envVar}: configuré`);
  }
}

// 2. Vérifier que NODE_ENV est en production
if (process.env.NODE_ENV !== 'production') {
  console.error(`❌ NODE_ENV doit être 'production', actuellement: ${process.env.NODE_ENV}`);
  envOk = false;
} else {
  console.log('✅ NODE_ENV: production');
}

// 3. Vérifier l'existence des fichiers compilés
console.log('📁 Vérification des fichiers compilés...');
const compiledFile = 'dist/index.js';
if (!existsSync(compiledFile)) {
  console.error(`❌ Fichier compilé manquant: ${compiledFile}`);
  envOk = false;
} else {
  console.log(`✅ Fichier compilé trouvé: ${compiledFile}`);
}

// 4. Vérifier le package.json pour le script start
console.log('📦 Vérification du package.json...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  if (!packageJson.scripts?.start) {
    console.error('❌ Script "start" manquant dans package.json');
    envOk = false;
  } else if (!packageJson.scripts.start.includes('node dist/index.js')) {
    console.error('❌ Script "start" ne pointe pas vers dist/index.js');
    envOk = false;
  } else {
    console.log('✅ Script "start" configuré correctement');
  }
} catch (error) {
  console.error('❌ Erreur lecture package.json:', error.message);
  envOk = false;
}

// 5. Vérifier les scripts Docker
console.log('🐳 Vérification de la configuration Docker...');
if (!existsSync('Dockerfile')) {
  console.error('❌ Dockerfile manquant');
  envOk = false;
} else {
  const dockerfile = readFileSync('Dockerfile', 'utf8');
  if (!dockerfile.includes('CMD ["npm", "start"]')) {
    console.error('❌ Dockerfile ne spécifie pas CMD ["npm", "start"]');
    envOk = false;
  } else {
    console.log('✅ Dockerfile configuré pour production');
  }
}

if (!existsSync('docker-compose.yml')) {
  console.error('❌ docker-compose.yml manquant');
  envOk = false;
} else {
  const dockerCompose = readFileSync('docker-compose.yml', 'utf8');
  if (!dockerCompose.includes('NODE_ENV=production')) {
    console.error('❌ docker-compose.yml ne spécifie pas NODE_ENV=production');
    envOk = false;
  } else {
    console.log('✅ docker-compose.yml configuré pour production');
  }
}

// 6. Résumé final
console.log('\n🎯 Résumé de la vérification production:');
if (envOk) {
  console.log('✅ TOUS LES TESTS PASSÉS - Configuration production OK !');
  console.log('🚀 L\'application est prête pour le déploiement production');
  process.exit(0);
} else {
  console.log('❌ ÉCHEC - Problèmes de configuration détectés');
  console.log('🔧 Corrigez les erreurs ci-dessus avant le déploiement');
  process.exit(1);
}