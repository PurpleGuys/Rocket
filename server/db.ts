import dotenv from 'dotenv';
dotenv.config();

import { Pool as PgPool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Détection automatique de l'environnement de base de données
function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL!;
  
  // Si c'est une URL Neon Database (cloud), utiliser SSL
  const isNeonDatabase = databaseUrl.includes('neon.tech') || databaseUrl.includes('pooler.supabase.com');
  
  // Si c'est PostgreSQL Docker local, pas de SSL
  const isDockerPostgres = databaseUrl.includes('postgres:5432') || databaseUrl.includes('localhost:5433');
  
  let sslConfig;
  if (isNeonDatabase) {
    sslConfig = { rejectUnauthorized: false };
    console.log(`✅ Neon Database SSL config applied`);
  } else if (isDockerPostgres) {
    sslConfig = false;
    console.log(`✅ Docker PostgreSQL config applied (no SSL)`);
  } else {
    // Fallback: essayer sans SSL pour PostgreSQL local
    sslConfig = false;
    console.log(`✅ Local PostgreSQL config applied (no SSL)`);
  }
  
  return {
    connectionString: databaseUrl,
    ssl: sslConfig
  };
}

export const pool = new PgPool(getDatabaseConfig());

export const db = pgDrizzle(pool, { schema });

// Test database connectivity function
export async function testDatabaseConnection() {
  try {
    console.log(`1:24:19 PM [INFO] [DATABASE] 🔍 Testing database connectivity...`);
    
    // Test basic connectivity
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    const { current_time, version } = result.rows[0];
    
    // Detect database type
    const isNeon = process.env.DATABASE_URL?.includes('neon.tech') || false;
    const dbType = isNeon ? 'Neon Database (Cloud)' : 'PostgreSQL (Standard)';
    
    console.log(`1:24:19 PM [INFO] [DATABASE] 🔗 Database Type: ${dbType}`);
    console.log(`1:24:19 PM [SUCCESS] [DATABASE] ✅ Database connected successfully`);
    console.log(`1:24:19 PM [INFO] [DATABASE] 📅 PostgreSQL Time: ${current_time}`);
    console.log(`1:24:19 PM [INFO] [DATABASE] 🗄️ PostgreSQL Version: ${version}`);
    
    // Get table count
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`1:24:19 PM [INFO] [DATABASE] 📊 Found ${tablesResult.rows.length} tables in database:`);
    tablesResult.rows.forEach(row => {
      console.log(`1:24:19 PM [INFO] [DATABASE]    - ${row.table_name} (${row.table_type})`);
    });
    
    return true;
  } catch (error) {
    console.error(`1:24:19 PM [ERROR] [DATABASE] ❌ Database connection failed:`, error);
    throw error;
  }
}
