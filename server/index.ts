import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { authenticateToken } from "./auth";
import { testDatabaseConnection } from "./db";

function log(message: string, source = "express", level = "INFO") {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${timestamp} [${level}] [${source.toUpperCase()}] ${message}`);
}

(async () => {
  const app = express();
  const port = Number(process.env.PORT) || 5000;

  log("🚀 BennesPro Application Starting...", "STARTUP");
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, "STARTUP");
  log(`Node.js Version: ${process.version}`, "STARTUP");

  // Test database connection first
  await testDatabaseConnection();

  // Basic middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Security headers with Helmet
  if (process.env.NODE_ENV === "production") {
    const helmet = (await import("helmet")).default;
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://maps.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: [
            "'self'", 
            "https://api.stripe.com", 
            "https://*.stripe.com",
            "https://js.stripe.com",
            "https://r.stripe.com", 
            "https://m.stripe.com",
            "https://m.stripe.network",
            "https://maps.googleapis.com",
            "wss://localhost:*",
            "ws://localhost:*"
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          frameSrc: ["'self'", "https://js.stripe.com"]
        }
      },
      crossOriginEmbedderPolicy: false
    }));
    log("🔒 Security headers configured with Helmet", "STARTUP", "SUCCESS");
  }

  // CORS for development
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Setup API routes first
  log("Setting up API routes...", "STARTUP");
  const server = await registerRoutes(app);

  // Setup Vite in development mode
  if (process.env.NODE_ENV !== "production") {
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
      log("🎨 Vite middleware configured successfully", "STARTUP", "SUCCESS");
    } catch (error) {
      log(`❌ Vite setup failed: ${error?.message}`, "STARTUP", "ERROR");
    }
  } else {
    // Production mode - serve static files
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Serve static files
    app.use(express.static(path.join(__dirname, "../dist/public")));
    
    // Catch all handler for client-side routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist/public/index.html"));
    });

    // Error handling middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      log(`❌ Error: ${err.message}`, "ERROR");
      res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  // Start server
  server.listen(port, "0.0.0.0", () => {
    log("═══════════════════════════════════════════════", "STARTUP", "SUCCESS");
    log("🚀 BennesPro Server Successfully Started!", "STARTUP", "SUCCESS");
    log(`📡 Server running on: http://localhost:${port}`, "STARTUP", "SUCCESS");
    log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`, "STARTUP", "SUCCESS");
    if (process.env.NODE_ENV === "production") {
      log("🚀 Production mode: Serving static files", "STARTUP", "SUCCESS");
    }
    log("═══════════════════════════════════════════════", "STARTUP", "SUCCESS");
  });

  server.on('error', (err: any) => {
    log(`❌ Server error: ${err.message}`, "STARTUP", "ERROR");
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use`, "STARTUP", "ERROR");
    }
  });
})();

// Global error handlers for VPS deployment
process.on('uncaughtException', (error) => {
  console.error('🔴 [ERROR] [UNCAUGHT] Uncaught Exception:', error);
  console.error('🔴 [ERROR] [UNCAUGHT] Stack:', error.stack);
  // Don't exit in production - log and continue
  if (process.env.NODE_ENV === 'production') {
    console.error('🔴 [ERROR] [UNCAUGHT] Production: Continuing despite error');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 [ERROR] [UNHANDLED] Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production - log and continue
  if (process.env.NODE_ENV === 'production') {
    console.error('🔴 [ERROR] [UNHANDLED] Production: Continuing despite error');
  } else {
    process.exit(1);
  }
});