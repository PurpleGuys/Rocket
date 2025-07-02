import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { Server } from "http";
import path from "path";
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
  
  if (process.env.NODE_ENV !== "production") {
    // Development: use Vite AFTER routes registration
    try {
      const { setupVite } = await import("./vite.ts");
      // Vite will be setup later with the created server
    } catch (error) {
      log("Vite not available, falling back to static serving");
      log(`Error: ${error?.message || 'Unknown error'}`);
      // Fallback to basic static serving even in development
      const fallbackDistPath = path.resolve("dist/public");
      app.use(express.static(fallbackDistPath));
      app.get("*", (req, res) => {
        if (!req.path.startsWith("/api")) {
          res.sendFile(path.join(fallbackDistPath, "index.html"));
        } else {
          res.status(404).json({ message: "API endpoint not found" });
        }
      });
    }
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

  const server = app.listen(port, host, () => {
    log('═══════════════════════════════════════════════', 'STARTUP', 'SUCCESS');
    log('🚀 BennesPro Server Successfully Started!', 'STARTUP', 'SUCCESS');
    log(`📡 Server running on: http://${host}:${port}`, 'STARTUP', 'SUCCESS');
    log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`, 'STARTUP', 'SUCCESS');
    log(`💾 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, 'STARTUP', 'SUCCESS');
    log(`⏰ Server started at: ${new Date().toISOString()}`, 'STARTUP', 'SUCCESS');
    log('═══════════════════════════════════════════════', 'STARTUP', 'SUCCESS');
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