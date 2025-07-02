#!/usr/bin/env node

/**
 * Script de compilation pour production - Version Vite-free
 * Crée un serveur de production qui ne dépend pas de Vite
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, copyFileSync } from 'fs';

console.log('🔨 Construction pour production (sans Vite)...');

// Créer le dossier dist s'il n'existe pas
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
  console.log('📁 Dossier dist créé');
}

try {
  // 1. Construire le frontend avec Vite
  console.log('🎨 Construction du frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // 2. Créer un serveur de production sans dépendances Vite
  console.log('⚙️ Création du serveur de production...');
  
  const productionServer = `// Production server - no Vite dependencies
import express from "express";
import { registerRoutes } from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Production logging function
function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(\`\${formattedTime} [\${source}] \${message}\`);
}

// CORS and security headers
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = \`\${req.method} \${reqPath} \${res.statusCode} in \${duration}ms\`;
      if (capturedJsonResponse) {
        logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Production: serve static files
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const staticPath = path.join(__dirname, "client");
  
  // Serve static assets
  app.use(express.static(staticPath));
  
  // Catch-all handler for SPA routing
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(staticPath, "index.html"));
    } else {
      res.status(404).json({ message: "API endpoint not found" });
    }
  });

  const port = parseInt(process.env.PORT || "5000");
  
  server.listen(port, "0.0.0.0", () => {
    log(\`serving on port \${port}\`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(\`Port \${port} is already in use. Trying to find an available port...\`);
      const altPort = port === 5000 ? 5001 : port + 1;
      server.listen(altPort, "0.0.0.0", () => {
        log(\`serving on port \${altPort}\`);
      });
    } else {
      throw err;
    }
  });
})();
`;

  // Écrire le serveur de production
  writeFileSync('dist/index.js', productionServer);
  console.log('✅ Serveur de production créé');

  // 3. Compiler les modules serveur individuellement
  console.log('🔧 Compilation des modules serveur...');
  
  const serverFiles = [
    'server/routes.ts',
    'server/storage.ts', 
    'server/db.ts',
    'server/auth.ts',
    'server/emailService.ts',
    'server/sendgridService.ts',
    'server/distanceService.ts',
    'server/notificationService.ts',
    'server/surveyService.ts'
  ];

  for (const file of serverFiles) {
    if (existsSync(file)) {
      const outputName = file.replace('server/', '').replace('.ts', '.js');
      try {
        execSync(`npx esbuild ${file} --platform=node --packages=external --format=esm --outfile=dist/${outputName} --target=node18`, { stdio: 'inherit' });
        console.log(`✅ Compilé: ${file} -> dist/${outputName}`);
      } catch (error) {
        console.warn(`⚠️ Erreur compilation ${file}:`, error.message);
      }
    }
  }

  // 4. Compiler le schéma partagé
  if (existsSync('shared')) {
    if (!existsSync('dist/shared')) {
      mkdirSync('dist/shared', { recursive: true });
    }
    
    try {
      execSync('npx esbuild shared/schema.ts --platform=node --packages=external --format=esm --outfile=dist/shared/schema.js --target=node18', { stdio: 'inherit' });
      console.log('✅ Schéma partagé compilé');
    } catch (error) {
      console.warn('⚠️ Erreur compilation schéma:', error.message);
    }
  }

  // 5. Copier les fichiers nécessaires
  console.log('📁 Copie des fichiers...');
  
  // Copier package.json
  if (existsSync('package.json')) {
    copyFileSync('package.json', 'dist/package.json');
  }
  
  // Copier .env si présent
  if (existsSync('.env')) {
    copyFileSync('.env', 'dist/.env');
  }
  
  // S'assurer que le build client est dans dist/client
  if (existsSync('dist/client')) {
    console.log('✅ Frontend déjà présent dans dist/client');
  } else if (existsSync('client/dist')) {
    execSync('cp -r client/dist dist/client', { stdio: 'inherit' });
    console.log('✅ Frontend copié vers dist/client');
  } else {
    console.warn('⚠️ Aucun build frontend trouvé');
  }

  console.log('✅ Construction terminée avec succès!');
  console.log('🚀 Utilisez "NODE_ENV=production node dist/index.js" pour lancer');
  
} catch (error) {
  console.error('❌ Erreur lors de la construction:', error.message);
  console.error(error.stack);
  process.exit(1);
}