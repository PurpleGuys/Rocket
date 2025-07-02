// Import du polyfill de chemin en premier pour résoudre import.meta.dirname
import "./path-polyfill.js";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

// Production-compatible logging function
function log(message: string, source = "express", level = "INFO") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Simple logging without colors
    console.log(`${formattedTime} [${source}] ${message}`);
  } else {
    // Development: Enhanced logging with colors
    const colors = {
      INFO: '\x1b[32m',    // Green
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      DEBUG: '\x1b[36m',   // Cyan
      SUCCESS: '\x1b[92m', // Bright Green
      RESET: '\x1b[0m'     // Reset
    };
    
    const color = colors[level as keyof typeof colors] || colors.INFO;
    console.log(`${color}${formattedTime} [${level}] [${source}] ${message}${colors.RESET}`);
  }
}

// Initialize Express application
const app = express();

// Simplified startup logging for production compatibility
if (process.env.NODE_ENV !== 'production') {
  log('🚀 BennesPro Application Starting...', 'STARTUP');
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'STARTUP');
  log(`Node.js Version: ${process.version}`, 'STARTUP');
}

log('Setting up Express middleware...', 'startup');

// CORS headers only (CSP is handled by Helmet in routes.ts)
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  log('Express middleware configured', 'startup');
}

// Simple request logging middleware (production compatible)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const responseStr = JSON.stringify(capturedJsonResponse);
        if (responseStr.length > 80) {
          logLine += ` :: ${responseStr.slice(0, 77)}...`;
        } else {
          logLine += ` :: ${responseStr}`;
        }
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  if (process.env.NODE_ENV !== 'production') {
    log('Registering API routes and middleware...', 'startup');
  }
  
  // CRITICAL: Register ALL API routes FIRST before any catch-all handlers
  const server = await registerRoutes(app);
  
  if (process.env.NODE_ENV !== 'production') {
    log('Routes registered successfully', 'startup');
  }

  // Setup static file serving for production or Vite for development
  if (process.env.NODE_ENV === "production") {
    // Production: serve static files from dist/public folder (where Vite builds)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.join(__dirname, "..", "dist", "public");

    // Serve static assets
    app.use(express.static(distPath));

    // Catch-all handler for SPA routing - serve index.html for non-API routes
    // IMPORTANT: This must come AFTER all API routes are registered
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        res.status(404).json({ message: "API endpoint not found" });
      }
    });
  } else {
    // Development: use Vite (only when Vite is available)
    try {
      const { setupVite } = await import("./vite.ts");
      await setupVite(app, server);
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

  server.listen(port, host, () => {
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