/**
 * Script de diagnostic PostgreSQL pour VPS BennesPro
 * Teste la connectivité PostgreSQL standard sans dépendances Neon
 */

const { Pool } = require('pg');
require('dotenv').config();

class VPSPostgreSQLDiagnostic {
  constructor() {
    this.databaseUrl = process.env.DATABASE_URL;
    this.pool = null;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m'
    };
    console.log(`${colors[type]}[${type}] ${timestamp} - ${message}\x1b[0m`);
  }

  async testDatabaseConnection() {
    this.log('🔍 Diagnostic PostgreSQL VPS - Début des tests', 'INFO');
    
    if (!this.databaseUrl) {
      this.log('❌ DATABASE_URL manquante dans les variables d\'environnement', 'ERROR');
      return false;
    }

    this.log(`🔗 URL de base de données configurée: ${this.databaseUrl.replace(/:[^:@]*@/, ':***@')}`, 'INFO');

    try {
      // Configuration PostgreSQL pour VPS
      this.pool = new Pool({
        connectionString: this.databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 20
      });

      this.log('📡 Tentative de connexion à PostgreSQL...', 'INFO');
      
      // Test de connexion de base
      const client = await this.pool.connect();
      this.log('✅ Connexion PostgreSQL établie avec succès', 'SUCCESS');

      // Test de requête simple
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      this.log(`📅 Temps PostgreSQL: ${result.rows[0].current_time}`, 'INFO');
      this.log(`🗄️ Version PostgreSQL: ${result.rows[0].pg_version}`, 'INFO');

      // Test des tables
      const tablesResult = await client.query(`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      this.log(`📊 Tables trouvées: ${tablesResult.rows.length}`, 'SUCCESS');
      tablesResult.rows.forEach(table => {
        this.log(`   - ${table.table_name} (${table.table_type})`, 'INFO');
      });

      // Test des données essentielles
      await this.testEssentialData(client);

      client.release();
      return true;

    } catch (error) {
      this.log(`❌ Erreur de connexion PostgreSQL: ${error.message}`, 'ERROR');
      this.log(`❌ Code d'erreur: ${error.code}`, 'ERROR');
      if (error.stack) {
        this.log(`❌ Stack trace: ${error.stack}`, 'ERROR');
      }
      return false;
    }
  }

  async testEssentialData(client) {
    try {
      // Test des utilisateurs
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      this.log(`👥 Utilisateurs en base: ${usersResult.rows[0].count}`, 'INFO');

      // Test des services
      const servicesResult = await client.query('SELECT COUNT(*) as count FROM services');
      this.log(`🚛 Services en base: ${servicesResult.rows[0].count}`, 'INFO');

      // Test des types de déchets
      const wasteTypesResult = await client.query('SELECT COUNT(*) as count FROM waste_types');
      this.log(`♻️  Types de déchets en base: ${wasteTypesResult.rows[0].count}`, 'INFO');

      // Test des commandes
      const ordersResult = await client.query('SELECT COUNT(*) as count FROM orders');
      this.log(`📦 Commandes en base: ${ordersResult.rows[0].count}`, 'INFO');

    } catch (error) {
      this.log(`⚠️  Erreur lors du test des données: ${error.message}`, 'WARN');
    }
  }

  async testAPIEndpoints() {
    this.log('🌐 Test des endpoints API locaux...', 'INFO');
    
    const endpoints = [
      { url: 'http://localhost:5000/api/health', method: 'GET' },
      { url: 'http://localhost:5000/api/services', method: 'GET' },
      { url: 'http://localhost:5000/api/waste-types', method: 'GET' },
      { url: 'http://localhost:5000/api/database/info', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        const contentType = response.headers.get('content-type');
        
        if (response.ok) {
          this.log(`✅ ${endpoint.method} ${endpoint.url} - Status: ${response.status}`, 'SUCCESS');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            this.log(`   📄 Response (JSON): ${JSON.stringify(data).substring(0, 100)}...`, 'INFO');
          } else {
            const text = await response.text();
            this.log(`   📄 Response (TEXT): ${text.substring(0, 100)}...`, 'INFO');
          }
        } else {
          this.log(`❌ ${endpoint.method} ${endpoint.url} - Status: ${response.status}`, 'ERROR');
        }
      } catch (error) {
        this.log(`❌ ${endpoint.method} ${endpoint.url} - Error: ${error.message}`, 'ERROR');
      }
    }
  }

  async cleanup() {
    if (this.pool) {
      await this.pool.end();
      this.log('🔒 Connexions PostgreSQL fermées', 'INFO');
    }
  }

  async runCompleteDiagnostic() {
    this.log('🚀 Diagnostic VPS PostgreSQL - Démarrage', 'INFO');
    
    const dbSuccess = await this.testDatabaseConnection();
    
    if (dbSuccess) {
      await this.testAPIEndpoints();
    }
    
    await this.cleanup();
    
    this.log(`🏁 Diagnostic terminé - Database: ${dbSuccess ? 'OK' : 'KO'}`, dbSuccess ? 'SUCCESS' : 'ERROR');
    return dbSuccess;
  }
}

// Exécution du diagnostic
async function main() {
  const diagnostic = new VPSPostgreSQLDiagnostic();
  const success = await diagnostic.runCompleteDiagnostic();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VPSPostgreSQLDiagnostic;