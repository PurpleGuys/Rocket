import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { Server } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.ts";
import { testDatabaseConnection } from "./db.ts";

function log(message: string, source = "express", level = "INFO") {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const levelPrefix = level === 'SUCCESS' ? '✅' : level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : 'ℹ️';
  console.log(`${timestamp} [${level}] [${source.toUpperCase()}] ${levelPrefix} ${message}`);
}

(async () => {
  const app = express();

  log('🚀 BennesPro Application Starting...', 'STARTUP', 'INFO');
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'STARTUP', 'INFO');
  log(`Node.js Version: ${process.version}`, 'STARTUP', 'INFO');

  // Test database connectivity
  await testDatabaseConnection();

  log('Setting up Express middleware...', 'startup');

  // Basic middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  log('Express middleware configured', 'startup');
  log('Registering API routes and middleware...', 'startup');

  if (process.env.NODE_ENV === "production") {
    // Production: serve static files first
    const distPath = path.resolve("dist/public");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        res.status(404).json({ message: "API endpoint not found" });
      }
    });
  }

  // CRITICAL: Register ALL API routes FIRST (for both production and development)
  await registerRoutes(app);
  
  if (process.env.NODE_ENV !== 'production') {
    log('Routes registered successfully', 'startup');
  }
  
  // Configure static file serving - force even in development to handle "Cannot GET /"
  const shouldServeStatic = process.env.NODE_ENV === "production" || process.env.FORCE_STATIC_SERVING === 'true';
  
  if (shouldServeStatic) {
    // VPS Production: serve built static files manually
    // Get current directory using ES module compatible method
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    
    const distPaths = [
      path.resolve(process.cwd(), "dist"),
      path.resolve(process.cwd(), "client/dist"), 
      path.resolve(process.cwd(), "build"),
      path.resolve(currentDir, "..", "dist"),
      path.resolve(currentDir, "public")
    ];
    
    // Fonction pour créer un index.html React fonctionnel si nécessaire
    const createReactIndexHtml = (distPath: string) => {
      const indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        // Essayer de copier l'index.html de l'application React
        const clientIndexPath = path.resolve(process.cwd(), 'client/index.html');
        if (fs.existsSync(clientIndexPath)) {
          fs.copyFileSync(clientIndexPath, indexPath);
          log(`📄 Copied React index.html to: ${indexPath}`, 'STARTUP', 'SUCCESS');
        } else {
          // Créer un index.html pour l'application React buildée
          const reactHtml = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BennesPro - Location de Bennes Particulier & Professionnel</title>
    <meta name="description" content="Réservez votre benne en ligne. Service de location pour particuliers et professionnels. Planification minimum 24h avant intervention et paiement sécurisé." />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link href="https://fonts.googleapis.com/css2?family=Gudea:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
          fs.writeFileSync(indexPath, reactHtml);
          log(`📄 Created production React index.html at: ${indexPath}`, 'STARTUP', 'SUCCESS');
        }
      }
    };

    let staticPath = null;
    
    // Diagnostic détaillé des chemins de build
    log(`🔍 Diagnostic des chemins de build:`, 'STARTUP', 'INFO');
    for (const distPath of distPaths) {
      const exists = fs.existsSync(distPath);
      const hasIndex = exists && fs.existsSync(path.join(distPath, "index.html"));
      log(`   ${distPath}: ${exists ? '✅' : '❌'} ${hasIndex ? '(index.html ✅)' : ''}`, 'STARTUP', 'INFO');
      
      if (exists && hasIndex && !staticPath) {
        staticPath = distPath;
      }
    }
    
    // Si aucun chemin avec index.html n'est trouvé, utiliser le premier dossier existant
    if (!staticPath) {
      for (const distPath of distPaths) {
        if (fs.existsSync(distPath)) {
          staticPath = distPath;
          createReactIndexHtml(distPath);
          break;
        }
      }
    }
    
    // Si aucun dossier n'existe, créer dist/
    if (!staticPath) {
      const defaultDistPath = path.resolve(process.cwd(), "dist");
      log(`📁 Création du dossier: ${defaultDistPath}`, 'STARTUP', 'INFO');
      fs.mkdirSync(defaultDistPath, { recursive: true });
      createReactIndexHtml(defaultDistPath);
      staticPath = defaultDistPath;
    }
    
    log(`🎯 Serving static files from: ${staticPath}`, 'STARTUP', 'SUCCESS');
    app.use(express.static(staticPath));
    
    // SPA fallback for all non-API routes
    app.use("*", (req: Request, res: Response) => {
      if (!req.path.startsWith("/api")) {
        const indexPath = path.join(staticPath!, "index.html");
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ message: "API endpoint not found" });
      }
    });
    
    log('🎯 Production static files configured successfully', 'STARTUP', 'SUCCESS');
  } else {
    // Development: will setup Vite after server starts
    log('🎨 Development mode - Vite will be configured after server start', 'STARTUP', 'INFO');
  }

  // Simple global error handler (must come AFTER routes but BEFORE server start)
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error on ${req.method} ${req.path}:`, err);
    }

    res.status(status).json({ message });
    
    // Don't throw in production to prevent crashes
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000");
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

  log('Starting HTTP server...', 'STARTUP', 'INFO');
  log(`Target host: ${host}`, 'STARTUP', 'INFO');
  log(`Target port: ${port}`, 'STARTUP', 'INFO');

  const server = app.listen(port, host, async () => {
    log('═══════════════════════════════════════════════', 'STARTUP', 'SUCCESS');
    log('🚀 BennesPro Server Successfully Started!', 'STARTUP', 'SUCCESS');
    log(`📡 Server running on: http://${host}:${port}`, 'STARTUP', 'SUCCESS');
    log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`, 'STARTUP', 'SUCCESS');
    log(`💾 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, 'STARTUP', 'SUCCESS');
    log(`⏰ Server started at: ${new Date().toISOString()}`, 'STARTUP', 'SUCCESS');
    log('═══════════════════════════════════════════════', 'STARTUP', 'SUCCESS');
    
    // Setup Vite AFTER server starts in development
    if (process.env.NODE_ENV !== "production") {
      try {
        const { setupVite } = await import("./vite.ts");
        await setupVite(app, server);
        log('🎨 Vite middleware configured successfully', 'STARTUP', 'SUCCESS');
      } catch (error) {
        log('❌ Vite setup failed, using fallback static serving', 'STARTUP', 'WARN');
        log(`Error: ${error?.message || 'Unknown error'}`, 'STARTUP', 'WARN');
      }
    }
  }).on('error', (err: any) => {
    log(`❌ Server startup error: ${err.code || 'UNKNOWN'}`, 'STARTUP', 'ERROR');
    log(`Error message: ${err.message}`, 'STARTUP', 'ERROR');
    
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Trying alternative port...`, 'STARTUP', 'WARN');
      // Try alternative ports if 5000 is in use
      const altPort = port === 5000 ? 5001 : port + 1;
      log(`Attempting to start on port ${altPort}...`, 'STARTUP', 'INFO');
      
      server.listen(altPort, "0.0.0.0", () => {
        log('═══════════════════════════════════════════════', 'STARTUP', 'SUCCESS');
        log('🚀 BennesPro Server Started on Alternative Port!', 'STARTUP', 'SUCCESS');
        log(`📡 Server running on: http://0.0.0.0:${altPort}`, 'STARTUP', 'SUCCESS');
        log('═══════════════════════════════════════════════', 'STARTUP', 'SUCCESS');
      });
    } else {
      log(`❌ Fatal server error: ${err.stack || err.message}`, 'STARTUP', 'ERROR');
      throw err;
    }
  });
})();