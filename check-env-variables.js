#!/usr/bin/env node

// ===============================================
// VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
// ===============================================

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Charger le fichier .env
const envResult = dotenv.config();

console.log('🔍 VÉRIFICATION DU CHARGEMENT DES VARIABLES D\'ENVIRONNEMENT\n');

// Vérifier si le fichier .env existe
if (envResult.error) {
  console.error('❌ ERREUR: Fichier .env non trouvé!');
  console.error('   Créez un fichier .env à partir de .env.example');
  process.exit(1);
}

console.log('✅ Fichier .env trouvé et chargé\n');

// Variables critiques à vérifier
const criticalVars = {
  // Base de données
  'DATABASE_URL': 'URL de connexion PostgreSQL',
  
  // Google Maps
  'GOOGLE_MAPS_API_KEY': 'Clé API Google Maps (calcul distances)',
  
  // Stripe
  'VITE_STRIPE_PUBLIC_KEY': 'Clé publique Stripe (paiements)',
  'STRIPE_SECRET_KEY': 'Clé secrète Stripe',
  
  // Sécurité
  'SESSION_SECRET': 'Secret pour sessions Express',
  'JWT_SECRET': 'Secret pour tokens JWT',
  
  // Application
  'NODE_ENV': 'Environnement (development/production)',
  'PORT': 'Port du serveur'
};

// Variables optionnelles
const optionalVars = {
  'SENDGRID_API_KEY': 'Clé API SendGrid (emails)',
  'REDIS_URL': 'URL Redis (cache)',
  'STRIPE_WEBHOOK_SECRET': 'Secret webhook Stripe',
  'VITE_API_URL': 'URL API pour le client'
};

console.log('📋 VARIABLES CRITIQUES:');
console.log('========================\n');

let missingCritical = false;

for (const [varName, description] of Object.entries(criticalVars)) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`❌ ${varName}: MANQUANTE - ${description}`);
    missingCritical = true;
  } else {
    // Masquer les valeurs sensibles
    let displayValue = value;
    if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASSWORD')) {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    }
    console.log(`✅ ${varName}: ${displayValue}`);
  }
}

console.log('\n📋 VARIABLES OPTIONNELLES:');
console.log('==========================\n');

for (const [varName, description] of Object.entries(optionalVars)) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`⚠️  ${varName}: Non définie - ${description}`);
  } else {
    let displayValue = value;
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    }
    console.log(`✅ ${varName}: ${displayValue}`);
  }
}

// Vérifier les URLs
console.log('\n🌐 VÉRIFICATION DES URLS:');
console.log('=========================\n');

const urls = {
  'VITE_API_URL': process.env.VITE_API_URL || 'http://localhost:5000/api',
  'APP_URL': process.env.APP_URL || 'http://localhost:5000',
  'BACKEND_URL': process.env.BACKEND_URL || 'http://localhost:5000'
};

for (const [name, url] of Object.entries(urls)) {
  console.log(`${name}: ${url}`);
}

// Vérifier la configuration de production
if (process.env.NODE_ENV === 'production') {
  console.log('\n🚀 CONFIGURATION PRODUCTION:');
  console.log('============================\n');
  
  const prodChecks = {
    'Domaine': process.env.PRODUCTION_DOMAIN || 'Non défini',
    'HTTPS activé': process.env.ENABLE_HTTPS === 'true' ? 'Oui' : 'Non',
    'SSL Cert': process.env.SSL_CERT_PATH ? 'Configuré' : 'Non configuré',
    'URL API production': process.env.VITE_API_URL?.includes('https') ? 'HTTPS ✅' : 'HTTP ⚠️'
  };
  
  for (const [check, status] of Object.entries(prodChecks)) {
    console.log(`${check}: ${status}`);
  }
}

// Test de connexion à la base de données
console.log('\n🗄️  TEST BASE DE DONNÉES:');
console.log('========================\n');

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`Host: ${url.hostname}`);
    console.log(`Port: ${url.port || '5432'}`);
    console.log(`Database: ${url.pathname.substring(1)}`);
    console.log(`User: ${url.username}`);
    console.log(`SSL: ${url.searchParams.get('sslmode') || 'default'}`);
  } catch (error) {
    console.error('❌ URL de base de données invalide');
  }
}

// Résumé
console.log('\n📊 RÉSUMÉ:');
console.log('==========\n');

if (missingCritical) {
  console.error('❌ Des variables critiques sont manquantes!');
  console.error('   L\'application ne fonctionnera pas correctement.');
  console.error('\n📝 Actions requises:');
  console.error('1. Copiez .env.example vers .env');
  console.error('2. Remplissez toutes les variables critiques');
  console.error('3. Relancez ce script pour vérifier');
  process.exit(1);
} else {
  console.log('✅ Toutes les variables critiques sont définies');
  console.log('🚀 L\'application peut démarrer!');
  
  // Créer un fichier de statut
  fs.writeFileSync('.env.status', JSON.stringify({
    checked: new Date().toISOString(),
    status: 'ready',
    environment: process.env.NODE_ENV,
    criticalVars: Object.keys(criticalVars).reduce((acc, key) => {
      acc[key] = !!process.env[key];
      return acc;
    }, {})
  }, null, 2));
  
  console.log('\n✅ Fichier .env.status créé pour référence');
}