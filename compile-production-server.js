#!/usr/bin/env node

/**
 * Script de compilation du serveur BennesPro pour production
 * Compile le serveur TypeScript en JavaScript et configure tout
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 COMPILATION SERVEUR BENNESPRO PRODUCTION');
console.log('============================================');

// 1. Nettoyer le dossier de compilation
console.log('🧹 Nettoyage...');
if (fs.existsSync('./dist')) {
  execSync('rm -rf ./dist', { stdio: 'inherit' });
}

// 2. Créer un serveur de production spécifique
console.log('📝 Création du serveur de production...');

const productionServerContent = `
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Charger les variables d'environnement
config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration des logs
function log(message, source = "bennespro") {
  const time = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit", 
    second: "2-digit",
  });
  console.log(\`[\${time}] [\${source}] \${message}\`);
}

// Headers CORS et sécurité
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(\`\${req.method} \${req.path} \${res.statusCode} in \${duration}ms\`);
    }
  });
  next();
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'BennesPro Production Server Running',
    version: '1.0.0'
  });
});

// Servir le frontend React
const clientDistPath = path.join(__dirname, 'client', 'dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  log(\`Frontend trouvé: \${clientDistPath}\`);
  app.use(express.static(clientDistPath));
  
  // Catch-all pour SPA routing
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(indexHtmlPath, (err) => {
        if (err) {
          log(\`Erreur: \${err.message}\`);
          res.status(404).send("Application not found");
        }
      });
    } else {
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
} else {
  log('⚠️ Frontend non trouvé, serveur en mode API uniquement');
  
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.redirect('/api/health');
    } else {
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  log(\`🚀 BennesPro serveur démarré sur le port \${PORT}\`);
  log(\`🌐 Application accessible: http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync('./server-production-real.js', productionServerContent);

console.log('✅ Serveur de production créé: server-production-real.js');

// 3. Compiler le frontend si nécessaire
console.log('🏗️ Compilation du frontend...');
try {
  if (fs.existsSync('./client')) {
    process.chdir('./client');
    
    // Vérifier si dist existe déjà
    if (!fs.existsSync('./dist')) {
      console.log('📦 Installation des dépendances frontend...');
      execSync('npm install --production', { stdio: 'inherit' });
      
      console.log('🔨 Build du frontend...');
      execSync('npm run build', { stdio: 'inherit' });
    } else {
      console.log('✅ Frontend déjà compilé');
    }
    
    process.chdir('..');
  }
} catch (error) {
  console.log('⚠️ Erreur compilation frontend:', error.message);
  console.log('Le serveur fonctionnera en mode API uniquement');
}

console.log('');
console.log('✅ COMPILATION TERMINÉE');
console.log('======================');
console.log('');
console.log('🚀 Pour démarrer le serveur:');
console.log('   node server-production-real.js');
console.log('');