// Configuration Drizzle Kit en JavaScript pur - Version de production
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Charger les variables d'environnement
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL manquant dans les variables d'environnement");
  console.log("Variables disponibles:", Object.keys(process.env).filter(k => k.includes('DATABASE')));
  throw new Error("DATABASE_URL must be set, ensure the database is provisioned");
}

console.log("✅ Configuration Drizzle avec DATABASE_URL:", databaseUrl.replace(/:[^:]*@/, ':***@'));

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});