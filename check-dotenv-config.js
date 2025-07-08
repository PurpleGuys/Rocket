#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 VÉRIFICATION DE LA CONFIGURATION DOTENV');
console.log('==========================================\n');

const serverFiles = [
  'server/index.ts',
  'server/db.ts',
  'server/auth.ts',
  'server/distanceService.ts',
  'server/emailService.ts',
  'server/routes.ts',
  'server/notificationService.ts',
  'drizzle.config.js'
];

console.log('📋 FICHIERS SERVEUR UTILISANT DES VARIABLES D\'ENVIRONNEMENT:\n');

let allConfigured = true;

serverFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const hasDotenvImport = content.includes('import dotenv from \'dotenv\'') || 
                           content.includes('import { config } from "dotenv"');
    const hasDotenvConfig = content.includes('dotenv.config()') || 
                           content.includes('config()');
    const usesProcessEnv = content.includes('process.env');
    
    if (usesProcessEnv) {
      if (hasDotenvImport && hasDotenvConfig) {
        console.log(`✅ ${file}:`);
        console.log(`   - Import dotenv: OUI`);
        console.log(`   - Config dotenv: OUI`);
        console.log(`   - Variables utilisées: ${(content.match(/process\.env\.\w+/g) || []).length}`);
      } else {
        console.log(`❌ ${file}:`);
        console.log(`   - Import dotenv: ${hasDotenvImport ? 'OUI' : 'NON'}`);
        console.log(`   - Config dotenv: ${hasDotenvConfig ? 'OUI' : 'NON'}`);
        console.log(`   - Variables utilisées: ${(content.match(/process\.env\.\w+/g) || []).length}`);
        allConfigured = false;
      }
    } else {
      console.log(`⚠️  ${file}: N'utilise pas de variables d'environnement`);
    }
  } catch (error) {
    console.log(`❌ ${file}: Fichier non trouvé`);
  }
  console.log('');
});

// Vérifier les fichiers .env
console.log('\n📋 FICHIERS DE CONFIGURATION:\n');

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim());
  
  console.log(`✅ .env existe avec ${envVars.length} variables définies`);
  
  // Variables critiques
  const criticalVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
    'GOOGLE_MAPS_API_KEY',
    'STRIPE_SECRET_KEY',
    'VITE_STRIPE_PUBLIC_KEY',
    'SENDGRID_API_KEY'
  ];
  
  console.log('\n🔑 VARIABLES CRITIQUES:');
  criticalVars.forEach(varName => {
    if (envVars.includes(varName)) {
      const value = envContent.match(new RegExp(`^${varName}=(.*)$`, 'm'))?.[1];
      const hasValue = value && value !== '""' && value !== '';
      console.log(`   ${hasValue ? '✅' : '⚠️ '} ${varName}: ${hasValue ? 'Configurée' : 'Vide'}`);
    } else {
      console.log(`   ❌ ${varName}: Non définie`);
    }
  });
} else {
  console.log('❌ .env n\'existe pas!');
}

console.log('\n==========================================');
console.log(allConfigured ? 
  '✅ TOUS LES FICHIERS SERVEUR SONT CORRECTEMENT CONFIGURÉS AVEC DOTENV' : 
  '❌ CERTAINS FICHIERS NE SONT PAS CORRECTEMENT CONFIGURÉS'
);