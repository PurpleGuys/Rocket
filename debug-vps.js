#!/usr/bin/env node

/**
 * Script de diagnostic pour VPS BennesPro
 * Teste directement les méthodes de stockage
 */

const { DatabaseStorage } = require('./server/storage.ts');
const { pool } = require('./server/db.ts');

async function testVPSEndpoints() {
  console.log('🔍 Test de diagnostic VPS BennesPro');
  console.log('=====================================');
  
  try {
    const storage = new DatabaseStorage();
    
    // Test 1: Connexion base de données
    console.log('\n📡 Test 1: Connexion PostgreSQL');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connexion OK:', result.rows[0].current_time);
    
    // Test 2: Méthode getServices()
    console.log('\n🔧 Test 2: Méthode getServices()');
    const services = await storage.getServices();
    console.log(`✅ Services récupérés: ${services.length} services`);
    console.log('Premier service:', services[0]?.name || 'Aucun');
    
    // Test 3: Méthode getWasteTypes()
    console.log('\n♻️ Test 3: Méthode getWasteTypes()');
    const wasteTypes = await storage.getWasteTypes();
    console.log(`✅ Types de déchets: ${wasteTypes.length} types`);
    
    // Test 4: Méthode getTreatmentPricing()
    console.log('\n💰 Test 4: Méthode getTreatmentPricing()');
    const pricing = await storage.getTreatmentPricing();
    console.log(`✅ Tarifs traitement: ${pricing.length} tarifs`);
    
    // Test 5: Test de la méthode getServiceImages()
    console.log('\n🖼️ Test 5: Méthode getServiceImages()');
    if (services.length > 0) {
      const images = await storage.getServiceImages(services[0].id);
      console.log(`✅ Images pour service ${services[0].id}: ${images.length} images`);
    }
    
    console.log('\n🎉 Tous les tests ont réussi !');
    console.log('Le problème ne vient pas du stockage database.');
    
  } catch (error) {
    console.error('❌ Erreur de diagnostic:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testVPSEndpoints();