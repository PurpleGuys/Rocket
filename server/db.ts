import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Enhanced logging function for database operations
function dbLog(message: string, level = "INFO") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  
  const colors = {
    INFO: '\x1b[34m',    // Blue
    SUCCESS: '\x1b[92m', // Bright Green
    WARN: '\x1b[33m',    // Yellow
    ERROR: '\x1b[31m',   // Red
    RESET: '\x1b[0m'     // Reset
  };
  
  const color = colors[level as keyof typeof colors] || colors.INFO;
  console.log(`${color}${formattedTime} [${level}] [DATABASE] ${message}${colors.RESET}`);
}

dbLog('Initializing database connection...', 'INFO');
dbLog(`Environment: ${process.env.NODE_ENV || 'development'}`, 'INFO');

// Configuration WebSocket pour Neon avec gestion des erreurs
neonConfig.webSocketConstructor = ws;
dbLog('WebSocket constructor configured', 'SUCCESS');

// Désactiver WebSocket en production si problème de connexion
if (process.env.NODE_ENV === 'production') {
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineConnect = false;
  dbLog('Production mode: WebSocket and pipeline disabled', 'WARN');
} else {
  dbLog('Development mode: Full WebSocket features enabled', 'INFO');
}

if (!process.env.DATABASE_URL) {
  dbLog('❌ DATABASE_URL environment variable not found!', 'ERROR');
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Mask sensitive parts of DATABASE_URL for logging
const maskedUrl = process.env.DATABASE_URL.replace(/(.*:\/\/[^:]+:)[^@]+(@.*)/, '$1[PASSWORD]$2');
dbLog(`Database URL configured: ${maskedUrl}`, 'SUCCESS');

dbLog('Creating connection pool...', 'INFO');
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

dbLog('Initializing Drizzle ORM...', 'INFO');
export const db = drizzle({ client: pool, schema });

dbLog('✅ Database setup completed successfully', 'SUCCESS');
dbLog(`Schema tables loaded: ${Object.keys(schema).length} tables`, 'INFO');
