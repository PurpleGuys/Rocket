#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REQUIRED_FILES = [
  '.env.example',
  'Dockerfile',
  'docker-compose.yml',
  'ecosystem.config.js',
  'nginx.conf',
  'deploy.sh',
  'package.json',
  'shared/schema.ts',
  'server/index.ts',
  'client/src/main.tsx'
];

const REQUIRED_DIRECTORIES = [
  'scripts',
  'server',
  'client',
  'shared'
];

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_SECRET',
  'NODE_ENV',
  'PORT'
];

const OPTIONAL_ENV_VARS = [
  'SENDGRID_API_KEY',
  'GOOGLE_MAPS_API_KEY',
  'STRIPE_SECRET_KEY',
  'APP_BASE_URL'
];

function checkFileExists(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return { exists: true, size: stats.size };
  } catch {
    return { exists: false, size: 0 };
  }
}

function checkDirectoryExists(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function checkEnvFile() {
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  console.log('\n🔧 Vérification des fichiers de configuration...');
  
  const envExists = checkFileExists(envPath).exists;
  const envExampleExists = checkFileExists(envExamplePath).exists;
  
  if (!envExampleExists) {
    console.log('❌ .env.example manquant');
    return false;
  }
  
  if (!envExists) {
    console.log('⚠️  .env manquant - utilisez: cp .env.example .env');
    return false;
  }
  
  // Vérifier les variables d'environnement requises
  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingRequired = REQUIRED_ENV_VARS.filter(varName => 
    !envContent.includes(`${varName}=`) || envContent.includes(`${varName}=""`)
  );
  
  const missingOptional = OPTIONAL_ENV_VARS.filter(varName => 
    !envContent.includes(`${varName}=`) || envContent.includes(`${varName}=""`)
  );
  
  if (missingRequired.length > 0) {
    console.log(`❌ Variables d'environnement requises manquantes: ${missingRequired.join(', ')}`);
    return false;
  }
  
  if (missingOptional.length > 0) {
    console.log(`⚠️  Variables d'environnement optionnelles non configurées: ${missingOptional.join(', ')}`);
  }
  
  console.log('✅ Configuration d\'environnement valide');
  return true;
}

function checkRequiredFiles() {
  console.log('\n📁 Vérification des fichiers requis...');
  let allFilesPresent = true;
  
  REQUIRED_FILES.forEach(file => {
    const check = checkFileExists(file);
    if (check.exists) {
      console.log(`✅ ${file} (${Math.round(check.size / 1024)}KB)`);
    } else {
      console.log(`❌ ${file} manquant`);
      allFilesPresent = false;
    }
  });
  
  return allFilesPresent;
}

function checkRequiredDirectories() {
  console.log('\n📂 Vérification des répertoires requis...');
  let allDirsPresent = true;
  
  REQUIRED_DIRECTORIES.forEach(dir => {
    if (checkDirectoryExists(dir)) {
      const files = fs.readdirSync(dir).length;
      console.log(`✅ ${dir}/ (${files} fichiers)`);
    } else {
      console.log(`❌ ${dir}/ manquant`);
      allDirsPresent = false;
    }
  });
  
  return allDirsPresent;
}

function checkNodeModules() {
  console.log('\n📦 Vérification des dépendances...');
  
  if (!checkDirectoryExists('node_modules')) {
    console.log('❌ node_modules manquant - lancez: npm install');
    return false;
  }
  
  try {
    // Vérifier quelques dépendances critiques
    const criticalDeps = ['drizzle-orm', 'express', 'react', 'vite'];
    const missingDeps = criticalDeps.filter(dep => 
      !checkDirectoryExists(`node_modules/${dep}`)
    );
    
    if (missingDeps.length > 0) {
      console.log(`❌ Dépendances manquantes: ${missingDeps.join(', ')}`);
      return false;
    }
    
    console.log('✅ Dépendances installées');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des dépendances');
    return false;
  }
}

function checkBuildCapability() {
  console.log('\n🔨 Vérification de la capacité de build...');
  
  try {
    // Vérifier que TypeScript compile
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ Compilation TypeScript réussie');
    
    // Essayer de builder (en mode test)
    console.log('🔄 Test du processus de build...');
    execSync('npm run build', { stdio: 'pipe' });
    
    // Vérifier que les fichiers de build existent
    if (checkFileExists('dist/index.js').exists) {
      console.log('✅ Build de production réussi');
      return true;
    } else {
      console.log('❌ Build échoué - dist/index.js introuvable');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du build:', error.message.split('\n')[0]);
    return false;
  }
}

function checkDatabaseSchema() {
  console.log('\n🗄️  Vérification du schéma de base de données...');
  
  try {
    // Vérifier que le schéma est valide
    const schemaPath = 'shared/schema.ts';
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const requiredTables = [
      'users', 'services', 'orders', 'sessions',
      'abandonedCheckouts', 'inactivityNotifications'
    ];
    
    const missingTables = requiredTables.filter(table => 
      !schemaContent.includes(`export const ${table}`)
    );
    
    if (missingTables.length > 0) {
      console.log(`❌ Tables manquantes dans le schéma: ${missingTables.join(', ')}`);
      return false;
    }
    
    console.log('✅ Schéma de base de données complet');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la vérification du schéma');
    return false;
  }
}

function checkSecurityConfiguration() {
  console.log('\n🔒 Vérification de la configuration de sécurité...');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  let securityIssues = [];
  
  // Vérifier la longueur des secrets
  const secretVars = ['SESSION_SECRET', 'JWT_SECRET'];
  secretVars.forEach(secret => {
    const match = envContent.match(new RegExp(`${secret}="?([^"\\n]+)"?`));
    if (match && match[1].length < 32) {
      securityIssues.push(`${secret} trop court (minimum 32 caractères)`);
    }
  });
  
  // Vérifier NODE_ENV
  if (!envContent.includes('NODE_ENV="production"')) {
    securityIssues.push('NODE_ENV devrait être "production" pour le déploiement');
  }
  
  // Vérifier les permissions du fichier .env
  try {
    const stats = fs.statSync('.env');
    const permissions = stats.mode & 0o777;
    if (permissions !== 0o600) {
      securityIssues.push('Permissions .env incorrectes (utilisez: chmod 600 .env)');
    }
  } catch (error) {
    securityIssues.push('Impossible de vérifier les permissions .env');
  }
  
  if (securityIssues.length > 0) {
    console.log('⚠️  Problèmes de sécurité détectés:');
    securityIssues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
  
  console.log('✅ Configuration de sécurité appropriée');
  return true;
}

function generateDeploymentReport() {
  console.log('\n📋 Génération du rapport de déploiement...');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
    platform: process.platform,
    checks: {
      files: checkRequiredFiles(),
      directories: checkRequiredDirectories(),
      environment: checkEnvFile(),
      dependencies: checkNodeModules(),
      build: checkBuildCapability(),
      database: checkDatabaseSchema(),
      security: checkSecurityConfiguration()
    }
  };
  
  const reportPath = 'deployment-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Rapport sauvegardé: ${reportPath}`);
  
  return report;
}

function main() {
  console.log('🚀 Vérification de l\'état de préparation au déploiement VPS');
  console.log('========================================================');
  
  const report = generateDeploymentReport();
  const allChecksPass = Object.values(report.checks).every(check => check === true);
  
  console.log('\n📊 RÉSUMÉ DES VÉRIFICATIONS');
  console.log('============================');
  
  Object.entries(report.checks).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const name = check.charAt(0).toUpperCase() + check.slice(1);
    console.log(`${status} ${name}`);
  });
  
  console.log('\n🔍 STATUT GLOBAL');
  console.log('=================');
  
  if (allChecksPass) {
    console.log('🎉 SUCCÈS - Application prête pour le déploiement!');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Transférer les fichiers sur le serveur VPS');
    console.log('2. Configurer la base de données PostgreSQL');
    console.log('3. Lancer le script de déploiement: ./deploy.sh production');
    console.log('4. Configurer Nginx et SSL');
    console.log('5. Tester l\'application en production');
  } else {
    console.log('⚠️  ATTENTION - Problèmes détectés à corriger avant déploiement');
    console.log('\n🔧 Actions requises:');
    
    if (!report.checks.files) {
      console.log('- Vérifier que tous les fichiers requis sont présents');
    }
    if (!report.checks.environment) {
      console.log('- Configurer le fichier .env avec toutes les variables requises');
    }
    if (!report.checks.dependencies) {
      console.log('- Installer les dépendances: npm install');
    }
    if (!report.checks.build) {
      console.log('- Corriger les erreurs de build');
    }
    if (!report.checks.database) {
      console.log('- Vérifier le schéma de base de données');
    }
    if (!report.checks.security) {
      console.log('- Corriger les problèmes de sécurité identifiés');
    }
  }
  
  process.exit(allChecksPass ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}