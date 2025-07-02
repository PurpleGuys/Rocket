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

// Utiliser PostgreSQL standard pour tous les environnements
// Compatible avec Neon Database (qui supporte aussi le driver PostgreSQL standard)
export const pool = new PgPool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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
