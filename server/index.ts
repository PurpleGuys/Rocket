// Import du polyfill de chemin en premier pour résoudre import.meta.dirname
import "./path-polyfill.js";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

// Enhanced logging function with detailed information
function log(message: string, source = "express", level = "INFO") {
  const timestamp = new Date().toISOString();
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  
  // Color coding for different log levels
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
  
  // Also log to file in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`${timestamp} [${level}] [${source}] ${message}`);
  }
}

// Initialize Express application
const app = express();

// Startup logging
log('═══════════════════════════════════════════════', 'STARTUP', 'INFO');
log('🚀 BennesPro Application Starting...', 'STARTUP', 'INFO');
log(`Node.js Version: ${process.version}`, 'STARTUP', 'INFO');
log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'STARTUP', 'INFO');
log(`Process ID: ${process.pid}`, 'STARTUP', 'INFO');
log(`Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, 'STARTUP', 'INFO');

// Environment Variables Check
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  log(`Missing environment variables: ${missingEnvVars.join(', ')}`, 'STARTUP', 'WARN');
} else {
  log('✅ All required environment variables present', 'STARTUP', 'SUCCESS');
}

// Optional environment variables
const optionalEnvVars = ['JWT_SECRET', 'SENDGRID_API_KEY', 'VITE_STRIPE_PUBLIC_KEY'];
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    log(`✅ ${varName}: configured`, 'STARTUP', 'SUCCESS');
  } else {
    log(`⚠️  ${varName}: not configured`, 'STARTUP', 'WARN');
  }
});

log('Setting up Express middleware...', 'STARTUP', 'DEBUG');

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
log('✅ Express middleware configured', 'STARTUP', 'SUCCESS');

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const path = req.path;
  const method = req.method;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
  
  // Log request start for API calls
  if (path.startsWith("/api")) {
    log(`→ ${method} ${path} | IP: ${clientIP} | ID: ${requestId}`, 'REQUEST', 'DEBUG');
    
    // Log important headers for debugging (excluding sensitive data)
    const importantHeaders = ['authorization', 'content-type', 'user-agent', 'origin', 'referer'];
    const headerData: Record<string, string> = {};
    importantHeaders.forEach(header => {
      if (req.headers[header]) {
        if (header === 'authorization') {
          headerData[header] = req.headers[header]?.toString().startsWith('Bearer ') ? 'Bearer [TOKEN]' : '[REDACTED]';
        } else {
          headerData[header] = req.headers[header]?.toString() || '';
        }
      }
    });
    log(`Headers: ${JSON.stringify(headerData)}`, 'REQUEST', 'DEBUG');
    
    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body && Object.keys(req.body).length > 0) {
      const body = { ...req.body };
      if (body.password) body.password = '[REDACTED]';
      if (body.token) body.token = '[REDACTED]';
      if (body.apiKey) body.apiKey = '[REDACTED]';
      log(`Body: ${JSON.stringify(body)}`, 'REQUEST', 'DEBUG');
    }
    
    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      log(`Query: ${JSON.stringify(req.query)}`, 'REQUEST', 'DEBUG');
    }
  }

  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const statusColor = res.statusCode >= 500 ? 'ERROR' : 
                         res.statusCode >= 400 ? 'WARN' : 
                         res.statusCode >= 300 ? 'INFO' : 'SUCCESS';
      
      let logLine = `← ${method} ${path} ${res.statusCode} in ${duration}ms | ID: ${requestId}`;
      
      if (capturedJsonResponse) {
        const response = { ...capturedJsonResponse };
        // Redact sensitive response data
        if (response.token) response.token = '[REDACTED]';
        if (response.password) response.password = '[REDACTED]';
        if (response.apiKey) response.apiKey = '[REDACTED]';
        
        // Truncate long responses for readability
        const responseStr = JSON.stringify(response);
        if (responseStr.length > 200) {
          logLine += ` :: ${responseStr.slice(0, 197)}...`;
        } else {
          logLine += ` :: ${responseStr}`;
        }
      }
      
      log(logLine, 'RESPONSE', statusColor);
      
      // Log slow requests
      if (duration > 1000) {
        log(`⚠️ Slow request detected: ${method} ${path} took ${duration}ms`, 'PERFORMANCE', 'WARN');
      }
      
      // Log memory usage on slow requests
      if (duration > 2000) {
        const memUsage = process.memoryUsage();
        log(`Memory: Heap ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`, 'PERFORMANCE', 'INFO');
      }
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup static file serving for production or Vite for development
  if (process.env.NODE_ENV === "production") {
    // Production: serve static files from dist/public folder (where Vite builds)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.join(__dirname, "..", "dist", "public");

    // Serve static assets
    app.use(express.static(distPath));

    // Catch-all handler for SPA routing - serve index.html for non-API routes
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
      log("Error:", error.message);
      // Fallback to basic static serving even in development
      const fallbackDistPath = path.resolve("dist/public");
      app.use(express.static(fallbackDistPath));
      app.get("*", (req, res) => {
        if (!req.path.startsWith("/api")) {
          res.sendFile(path.join(fallbackDistPath, "index.html"));
        }
      });
    }
  }

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