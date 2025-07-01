#!/usr/bin/env node

/**
 * Serveur de production simple - Node.js pur
 * Sans dépendances TypeScript ou Vite
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration des logs
function log(message, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${time} [${source}] ${message}`);
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

// Middleware de logging simple
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Route API de test simple
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'BennesPro Production Server Running'
  });
});

// Route API pour services (simulation)
app.get('/api/services', (req, res) => {
  res.json({
    services: [
      { id: 1, name: "Benne 10m³", volume: 10, basePrice: "150.00" },
      { id: 2, name: "Benne 20m³", volume: 20, basePrice: "250.00" },
      { id: 3, name: "Benne 30m³", volume: 30, basePrice: "350.00" }
    ]
  });
});

// Servir les fichiers statiques du frontend
const clientDistPath = path.join(__dirname, "client", "dist");
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));
  
  // Catch-all pour SPA routing
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      const indexPath = path.join(clientDistPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          log(`Error serving index.html: ${err.message}`);
          res.status(404).send("Application not found");
        }
      });
    } else {
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
} else {
  // Mode développement - message simple
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.send(`
        <html>
          <head><title>BennesPro - Development</title></head>
          <body>
            <h1>BennesPro Development Server</h1>
            <p>Application en cours de développement</p>
            <p>API disponible sur /api/health</p>
          </body>
        </html>
      `);
    }
  });
}

// Démarrage du serveur
const port = parseInt(process.env.PORT || "5000");

app.listen(port, "0.0.0.0", () => {
  log(`🚀 BennesPro Production Server running on port ${port}`);
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`Frontend path: ${clientDistPath}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying port ${port + 1}...`);
    app.listen(port + 1, "0.0.0.0", () => {
      log(`🚀 BennesPro Production Server running on port ${port + 1}`);
    });
  } else {
    console.error('Server error:', err);
    throw err;
  }
});