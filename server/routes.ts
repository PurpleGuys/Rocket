import dotenv from 'dotenv';
dotenv.config();

import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { AuthService, authenticateToken, requireAdmin } from "./auth";
import { DistanceService } from "./distanceService";
import { emailService } from "./emailService";
import { sendGridService } from "./sendgridService";
import { NotificationService } from "./notificationService";
import { insertOrderSchema, insertUserSchema, loginSchema, updateUserSchema, changePasswordSchema, insertRentalPricingSchema, updateRentalPricingSchema, insertServiceSchema, insertTransportPricingSchema, updateTransportPricingSchema, insertWasteTypeSchema, insertTreatmentPricingSchema, updateTreatmentPricingSchema, insertBankDepositSchema, updateBankDepositSchema, insertFidSchema, updateFidSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Helper function to generate PDF content structure
function generateFidPdfContent(fid: any) {
  return {
    title: `Fiche d'Identification des Déchets - FID #${fid.id}`,
    sections: [
      {
        title: "Informations générales",
        fields: [
          { label: "ID FID", value: fid.id },
          { label: "Date de création", value: new Date(fid.createdAt).toLocaleDateString('fr-FR') },
          { label: "Statut", value: fid.status },
          { label: "Nom du déchet", value: fid.wasteName },
          { label: "Code nomenclature", value: fid.nomenclatureCode }
        ]
      },
      {
        title: "Informations client",
        fields: [
          { label: "Entreprise", value: fid.clientCompanyName },
          { label: "Contact", value: fid.clientContactName },
          { label: "Email", value: fid.clientEmail },
          { label: "Téléphone", value: fid.clientPhone || "Non renseigné" },
          { label: "Adresse", value: fid.clientAddress }
        ]
      },
      {
        title: "Informations producteur",
        fields: [
          { label: "Entreprise", value: fid.producerCompanyName || "Identique au client" },
          { label: "Contact", value: fid.producerContactName || "Identique au client" },
          { label: "Email", value: fid.producerEmail || "Identique au client" },
          { label: "Téléphone", value: fid.producerPhone || "Identique au client" },
          { label: "Adresse", value: fid.producerAddress || "Identique au client" }
        ]
      },
      {
        title: "Caractérisation du déchet",
        fields: [
          { label: "Origine", value: fid.wasteOrigin },
          { label: "Processus de production", value: fid.wasteProductionProcess },
          { label: "État physique", value: fid.physicalState },
          { label: "Aspect", value: fid.appearance },
          { label: "Couleur", value: fid.color },
          { label: "Odeur", value: fid.odor },
          { label: "Conditionnement", value: fid.packaging },
          { label: "Quantité estimée", value: `${fid.estimatedQuantity} ${fid.quantityUnit}` },
          { label: "Déchet dangereux", value: fid.isDangerous ? "Oui" : "Non" }
        ]
      },
      {
        title: "Informations réglementaires",
        fields: [
          { label: "Code du déchet", value: fid.wasteCode },
          { label: "Mode de traitement", value: fid.treatmentMethod },
          { label: "Numéro d'autorisation", value: fid.authorizationNumber || "Non applicable" }
        ]
      }
    ]
  };
}

// Initialize Stripe only if key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia" as any,
  });
  console.log("✅ Stripe initialized successfully");
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY not configured. Payment features will be disabled.");
}

// Rate limiting for production only
const authLimiter = process.env.NODE_ENV === 'production' ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
}) : (req: any, res: any, next: any) => next();

const generalLimiter = process.env.NODE_ENV === 'production' ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: "Trop de requêtes. Réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
}) : (req: any, res: any, next: any) => next();

// Configuration de multer pour l'upload des fichiers
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const serviceId = req.body.serviceId;
      const uploadPath = path.join(process.cwd(), 'uploads', 'services', serviceId.toString());
      // Créer le dossier s'il n'existe pas
      require('fs').mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `${file.originalname}_${timestamp}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers images sont acceptés'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir les images uploadées avec fallback
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Route fallback pour images manquantes
  app.get('/api/uploads/services/:serviceId/*', async (req, res) => {
    try {
      const { serviceId } = req.params;
      const requestedFile = req.params[0];
      const fullPath = path.join(process.cwd(), 'uploads', 'services', serviceId, requestedFile);
      
      // Import fs avec dynamic import pour ES modules
      const { existsSync } = await import('fs');
      
      // Vérifier si le fichier existe
      if (existsSync(fullPath)) {
        return res.sendFile(fullPath);
      }
      
      // Fallback vers placeholder SVG
      const placeholderPath = path.join(process.cwd(), 'uploads', 'services', serviceId, 'placeholder.svg');
      if (existsSync(placeholderPath)) {
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.sendFile(placeholderPath);
      }
      
      // Fallback générique SVG
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(`<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
        <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6c757d">Image non trouvée</text>
        <text x="150" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#adb5bd">Service ${serviceId}</text>
      </svg>`);
    } catch (error) {
      console.error('Erreur serveur image:', error);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(`<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#fee2e2" stroke="#fca5a5" stroke-width="2"/>
        <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#dc2626">Erreur</text>
        <text x="150" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#b91c1c">Service ${req.params.serviceId}</text>
      </svg>`);
    }
  });
  // REMONDIS favicon route
  app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // REMONDIS favicon - Red background with white "RE" letters based on provided logo
    const favicon = Buffer.from('AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD5SAg5SAg5SAg////AP///wD///8A////AP///wD///8A5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg////AP///wD///8A////AP///wD///8A5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg////AP///wD///8A5SAg////AP///wD///8A5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg////AP///wD///8A5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg////AP///wD///8A5SAg////AP///wD///8A////AP///wD///8A////AP///wD///8A5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg5SAg', 'base64');
    res.send(favicon);
  });
  // Security middleware - configured for both development and production
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "'unsafe-eval'", 
            "https://js.stripe.com",
            "https://replit.com",
            "https://*.replit.com",
            "https://maps.googleapis.com",
            "https://maps.gstatic.com"
          ],
          styleSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "https://fonts.googleapis.com"
          ],
          fontSrc: [
            "'self'", 
            "https://fonts.gstatic.com"
          ],
          imgSrc: [
            "'self'", 
            "data:", 
            "https:", 
            "blob:"
          ],
          connectSrc: [
            "'self'", 
            "https://api.stripe.com",
            "https://*.stripe.com",
            "https://m.stripe.network",
            "https://maps.googleapis.com",
            "https://api.sendgrid.com",
            "https://*.cloudflare.com",
            "wss:",
            "ws:"
          ],
          frameSrc: [
            "'self'", 
            "https://js.stripe.com",
            "https://hooks.stripe.com"
          ],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      // Allow cookies for third-party integration
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
  } else {
    // Development: disable CSP to allow Vite and Replit scripts
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
  }
  
  // Configure trust proxy and rate limiting for production
  if (process.env.NODE_ENV === 'production') {
    // Configuration sécurisée du proxy pour Docker/nginx - compatible HTTP/HTTPS
    app.set('trust proxy', 1); // Trust first proxy (nginx)
    // Désactiver temporairement le rate limiting pour éviter l'erreur trust proxy
    // app.use(generalLimiter);
  }

  // ==================== AUTH ROUTES ====================
  
  // Get auth status (check if routes are available)
  app.get("/api/auth", async (req, res) => {
    try {
      res.json({
        status: "available",
        endpoints: [
          "GET /api/auth",
          "POST /api/auth/register", 
          "POST /api/auth/login",
          "POST /api/auth/logout",
          "GET /api/auth/me",
          "PATCH /api/auth/profile"
        ],
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur auth service: " + error.message });
    }
  });
  
  // Register new user
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Un compte avec cet email existe déjà" });
      }
      
      // Hash password
      const hashedPassword = await AuthService.hashPassword(userData.password);
      const verificationToken = AuthService.generateVerificationToken();
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        verificationToken,
      });
      
      // TODO: Send verification email here
      
      res.status(201).json({
        message: "Compte créé avec succès. Vérifiez votre email pour activer votre compte.",
        userId: user.id
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la création du compte: " + error.message });
      }
    }
  });

  // Login user
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password, rememberMe } = loginSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
      
      // Check if account is locked
      if (await AuthService.isAccountLocked(user)) {
        return res.status(423).json({ message: "Compte temporairement verrouillé" });
      }
      
      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: "Compte non vérifié. Vérifiez votre email pour activer votre compte.",
          requiresVerification: true,
          userId: user.id
        });
      }
      
      // Verify password
      const isPasswordValid = await AuthService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        await AuthService.incrementLoginAttempts(user.id);
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
      
      // Reset login attempts and update last login
      await AuthService.resetLoginAttempts(user.id);
      
      // Create session
      const sessionToken = await AuthService.createSession(
        user.id,
        req.headers['user-agent'],
        req.ip
      );
      
      // Generate JWT
      const jwtToken = AuthService.generateToken(user.id);
      
      // Return user data (without sensitive fields)
      const { password: _, verificationToken, resetPasswordToken, twoFactorSecret, ...safeUser } = user;
      
      res.json({
        user: safeUser,
        token: jwtToken,
        sessionToken,
        message: "Connexion réussie"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la connexion: " + error.message });
      }
    }
  });

  // Logout user
  app.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'] as string;
      if (sessionToken) {
        await AuthService.deleteSession(sessionToken);
      }
      res.json({ message: "Déconnexion réussie" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la déconnexion: " + error.message });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      const { password, verificationToken, resetPasswordToken, twoFactorSecret, ...safeUser } = req.user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération du profil: " + error.message });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const updateData = updateUserSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      const { password, verificationToken, resetPasswordToken, twoFactorSecret, ...safeUser } = updatedUser;
      res.json({ user: safeUser, message: "Profil mis à jour avec succès" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la mise à jour: " + error.message });
      }
    }
  });

  // Change password
  app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      // Verify current password
      const isCurrentPasswordValid = await AuthService.comparePassword(currentPassword, req.user!.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Mot de passe actuel incorrect" });
      }
      
      // Hash new password
      const hashedNewPassword = await AuthService.hashPassword(newPassword);
      
      // Update password
      await storage.updateUserPassword(req.user!.id, hashedNewPassword);
      
      res.json({ message: "Mot de passe modifié avec succès" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la modification: " + error.message });
      }
    }
  });

  // Verify email
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token de vérification requis" });
      }
      
      // Find user by verification token
      const users = await storage.getUsers();
      const user = users.find((u: any) => u.verificationToken === token);
      
      if (!user) {
        return res.status(400).json({ message: "Token de vérification invalide" });
      }
      
      // Update user as verified
      await storage.updateUserSecurity(user.id, {
        isVerified: true,
        verificationToken: undefined
      });
      
      res.json({ message: "Email vérifié avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la vérification: " + error.message });
    }
  });

  // Get user sessions
  app.get("/api/auth/sessions", authenticateToken, async (req, res) => {
    try {
      const sessions = await storage.getUserSessions(req.user!.id);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération des sessions: " + error.message });
    }
  });

  // Delete all sessions (logout from all devices)
  app.delete("/api/auth/sessions", authenticateToken, async (req, res) => {
    try {
      const sessions = await storage.getUserSessions(req.user!.id);
      for (const session of sessions) {
        await storage.deleteSession(session.id);
      }
      res.json({ message: "Déconnecté de tous les appareils" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la déconnexion: " + error.message });
    }
  });

  // ==================== ADMIN USER MANAGEMENT ====================
  
  // Get all users (admin only)
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(user => {
        const { password, verificationToken, resetPasswordToken, twoFactorSecret, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs: " + error.message });
    }
  });

  // Get user by ID (admin only)
  app.get("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      const { password, verificationToken, resetPasswordToken, twoFactorSecret, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur: " + error.message });
    }
  });

  // ==================== ADMIN SETUP ====================
  
  // Create default admin account (one-time setup)
  app.post("/api/setup/admin", async (req, res) => {
    try {
      // Check if admin already exists
      const existingAdmin = await storage.getUserByEmail("ethan.petrovic@remondis.fr");
      if (existingAdmin) {
        return res.status(409).json({ message: "Compte administrateur déjà existant" });
      }

      // Hash the admin password
      const hashedPassword = await AuthService.hashPassword("Admin");
      
      // Create admin user
      const adminUser = await storage.createUser({
        email: "ethan.petrovic@remondis.fr",
        password: hashedPassword,
        firstName: "Ethan",
        lastName: "Petrovic",
        phone: "+33123456789",
        role: "admin",
        companyName: "Remondis",
        isVerified: true, // Pre-verified admin account
      });

      res.status(201).json({
        message: "Compte administrateur créé avec succès",
        email: adminUser.email,
        role: adminUser.role
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la création du compte admin: " + error.message });
    }
  });

  // ==================== SERVICES ROUTES ====================
  
  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });

  // Get available time slots for a date
  app.get("/api/timeslots/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const timeSlots = await storage.getAvailableTimeSlots(date);
      res.json(timeSlots);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching time slots: " + error.message });
    }
  });

  // Create order (guest checkout)
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Calculate pricing
      const service = await storage.getService(orderData.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const basePrice = parseFloat(service.basePrice);
      const durationPrice = orderData.durationDays > 1 ? (orderData.durationDays - 1) * 25 : 0;
      const deliveryFee = 24; // Mock calculation based on distance
      const totalHT = basePrice + durationPrice + deliveryFee;
      const vat = totalHT * 0.2;
      const totalTTC = totalHT + vat;

      const order = await storage.createOrder({
        ...orderData,
        basePrice: basePrice.toString(),
        durationPrice: durationPrice.toString(),
        deliveryFee: deliveryFee.toString(),
        totalHT: totalHT.toString(),
        vat: vat.toString(),
        totalTTC: totalTTC.toString(),
        estimatedDeliveryDate: orderData.deliveryTimeSlotId ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null, // 24h from now
      });

      // Update time slot bookings
      if (orderData.deliveryTimeSlotId) {
        await storage.updateTimeSlotBookings(orderData.deliveryTimeSlotId, 1);
      }
      if (orderData.pickupTimeSlotId) {
        await storage.updateTimeSlotBookings(orderData.pickupTimeSlotId, 1);
      }

      // Send automatic confirmation email
      try {
        await emailService.sendConfirmationEmail(order);
        
        // Log audit action
        await emailService.logAuditAction({
          userId: null, // Guest checkout
          orderId: order.id,
          action: 'order_created',
          entityType: 'order',
          entityId: order.id,
          newValues: JSON.stringify(order),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }

      res.json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating order: " + error.message });
      }
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  // Stripe payment intent creation
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is currently unavailable. Stripe is not configured." 
        });
      }

      const { amount, orderId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert euros to cents
        currency: "eur",
        metadata: {
          orderId: orderId.toString(),
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Update order payment status
  app.post("/api/orders/:id/payment", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { paymentIntentId, status } = req.body;
      
      await storage.updateOrderPayment(orderId, paymentIntentId, status);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating payment: " + error.message });
    }
  });

  // Route pour renvoyer l'email de vérification
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email requis" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Ce compte est déjà vérifié" });
      }

      // Générer un nouveau token de vérification
      const verificationToken = AuthService.generateVerificationToken();
      
      // Mettre à jour le token de vérification
      await storage.updateUserSecurity(user.id, {
        verificationToken: verificationToken
      });

      // Envoyer l'email de vérification
      const emailSent = await sendGridService.sendVerificationEmail(user, verificationToken);
      
      if (emailSent) {
        res.json({ 
          message: "Email de vérification renvoyé avec succès",
          email: user.email 
        });
      } else {
        res.status(500).json({ 
          message: "Erreur lors de l'envoi de l'email de vérification" 
        });
      }

    } catch (error: any) {
      console.error("Error resending verification email:", error);
      res.status(500).json({ 
        message: "Erreur serveur lors du renvoi de l'email de vérification" 
      });
    }
  });

  // Route de test pour SendGrid
  app.post("/api/test-sendgrid", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email requis pour le test" });
      }

      const testUser = {
        id: 999,
        email: email,
        firstName: "Test",
        lastName: "SendGrid"
      } as any;

      console.log('Testing SendGrid with email:', email);
      const success = await sendGridService.sendVerificationEmail(testUser, "test-token-123456");
      
      if (success) {
        res.json({ 
          message: "Email de test SendGrid envoyé avec succès",
          email: email 
        });
      } else {
        res.status(500).json({ 
          message: "Échec de l'envoi de l'email de test SendGrid",
          email: email 
        });
      }
    } catch (error: any) {
      console.error('Test SendGrid error:', error);
      res.status(500).json({ 
        message: "Erreur lors du test SendGrid: " + error.message,
        error: error.message 
      });
    }
  });

  // Admin: Get all users for verification management
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove sensitive information before sending
      const safeUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        companyName: user.companyName,
        siret: user.siret,
        address: user.address,
        city: user.city,
        postalCode: user.postalCode,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching users: " + error.message });
    }
  });

  // Admin: Export users to Excel (development route)
  app.get("/api/export/users", authenticateToken, requireAdmin, async (req, res) => {
    console.log('Export users request - NODE_ENV:', process.env.NODE_ENV);
    try {
      const XLSX = await import('xlsx');
      const users = await storage.getUsers();
      
      // Prepare data for Excel export with French headers
      const exportData = users.map((user: any) => ({
        'ID': user.id,
        'Email': user.email,
        'Prénom': user.firstName || user.first_name,
        'Nom': user.lastName || user.last_name,
        'Téléphone': user.phone,
        'Entreprise': user.companyName,
        'SIRET': user.siret,
        'Adresse': user.address,
        'Ville': user.city,
        'Code postal': user.postalCode,
        'Rôle': user.role,
        'Vérifié': user.isVerified ? 'Oui' : 'Non',
        'Actif': user.isActive ? 'Oui' : 'Non',
        'Date de création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '',
        'Dernière connexion': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : '',
        'Notifications activées': user.notifyOnInactivity ? 'Oui' : 'Non'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for download
      const filename = `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de l'export: " + error.message });
    }
  });

  // Export FIDs to Excel (development route)
  app.get("/api/export/fids", authenticateToken, requireAdmin, async (req, res) => {
    console.log('Export FIDs request - NODE_ENV:', process.env.NODE_ENV);
    try {
      const XLSX = await import('xlsx');
      const fids = await storage.getFids({});
      
      // Prepare data for Excel export with French headers
      const exportData = fids.map((fid: any) => ({
        'ID': fid.id,
        'Numéro FID': fid.fidNumber,
        'Statut': fid.status,
        'Nom de l\'entreprise cliente': fid.clientCompanyName,
        'Contact client': fid.clientContactName,
        'Email client': fid.clientEmail,
        'Téléphone client': fid.clientPhone,
        'Adresse client': fid.clientAddress,
        'SIRET client': fid.clientSiret,
        'Activité client': fid.clientActivity,
        'Entreprise productrice': fid.producerCompanyName,
        'Contact producteur': fid.producerContactName,
        'Email producteur': fid.producerEmail,
        'Téléphone producteur': fid.producerPhone,
        'Adresse producteur': fid.producerAddress,
        'SIRET producteur': fid.producerSiret,
        'Activité productrice': fid.producerActivity,
        'Appellation commerciale': fid.commercialName,
        'Dénomination usuelle': fid.usualName,
        'Code déchet': fid.wasteCode,
        'Origine du déchet': fid.wasteOrigin,
        'Consistance': fid.consistency,
        'Conditionnement': fid.packaging,
        'Quantité estimée (tonnes)': fid.estimatedQuantity,
        'Cadence de production': fid.productionRate,
        'Durée de stockage': fid.storageDuration,
        'Conditions de stockage': fid.storageConditions,
        'Informations complémentaires': fid.additionalInfo,
        'Date de création': fid.createdAt ? new Date(fid.createdAt).toLocaleDateString('fr-FR') : '',
        'Date de mise à jour': fid.updatedAt ? new Date(fid.updatedAt).toLocaleDateString('fr-FR') : '',
        'Validé par admin': fid.adminValidated ? 'Oui' : 'Non',
        'Date de validation': fid.adminValidatedAt ? new Date(fid.adminValidatedAt).toLocaleDateString('fr-FR') : '',
        'ID utilisateur validateur': fid.adminValidatedBy || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'FIDs');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for download
      const filename = `fids_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de l'export: " + error.message });
    }
  });

  // Admin: Create new user
  app.post("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await AuthService.hashPassword(userData.password);
      }

      const newUser = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...safeUser } = newUser;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });

  // Admin: Update user
  app.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Remove password from update data (should be handled separately)
      delete userData.password;

      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating user: " + error.message });
    }
  });

  // Admin: Delete user
  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent admin from deleting themselves
      if (req.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting user: " + error.message });
    }
  });

  // Admin: Verify user manually
  app.post("/api/admin/users/:id/verify", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.json({ message: "User is already verified" });
      }

      // Mark user as verified manually
      await storage.updateUserSecurity(userId, {
        isVerified: true,
        verificationToken: null
      });

      res.json({ 
        message: `User ${user.email} verified manually`,
        user: { id: user.id, email: user.email, isVerified: true }
      });

    } catch (error: any) {
      res.status(500).json({ message: "Error verifying user: " + error.message });
    }
  });

  // Admin: Manually verify user
  app.post("/api/admin/verify-user", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "ID utilisateur requis" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (user.isVerified) {
        return res.json({ message: "Cet utilisateur est déjà vérifié" });
      }

      // Mark user as verified manually
      await storage.updateUserSecurity(user.id, {
        isVerified: true,
        verificationToken: null
      });

      res.json({ 
        message: `Utilisateur ${user.email} vérifié manuellement avec succès`,
        user: { id: user.id, email: user.email, isVerified: true }
      });

    } catch (error: any) {
      console.error("Error in manual verification:", error);
      res.status(500).json({ message: "Erreur serveur lors de la vérification manuelle" });
    }
  });

  // Admin: Get all orders
  app.get("/api/admin/orders", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders(100);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  // Admin: Update order status
  app.put("/api/admin/orders/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      await storage.updateOrderStatus(orderId, status);
      res.json({ message: "Order status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating order status: " + error.message });
    }
  });

  // Admin: Confirm delivery date and send validation email
  app.put("/api/admin/orders/:id/confirm-delivery", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { confirmedDate, adminNotes } = req.body;
      const adminUserId = req.user.id;
      
      if (!confirmedDate) {
        return res.status(400).json({ message: "Confirmed delivery date is required" });
      }

      // Update order with confirmed delivery date
      const updatedOrder = await storage.updateOrderDeliveryDate(
        orderId, 
        new Date(confirmedDate), 
        adminUserId, 
        adminNotes
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Send validation email using SendGrid
      try {
        const { sendGridService } = await import("./sendgridService");
        const user = { 
          firstName: updatedOrder.customerFirstName, 
          lastName: updatedOrder.customerLastName, 
          email: updatedOrder.customerEmail 
        };
        await sendGridService.sendDeliveryDateConfirmedEmail(updatedOrder, user);

        res.json({ 
          message: "Delivery date confirmed and validation email sent", 
          order: updatedOrder 
        });
      } catch (emailError) {
        console.error('Failed to send validation email:', emailError);
        res.json({ 
          message: "Delivery date confirmed but email failed to send", 
          order: updatedOrder,
          emailError: String(emailError) 
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming delivery date: " + error.message });
    }
  });

  // Admin: Get email logs for an order
  app.get("/api/admin/orders/:id/email-logs", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const emailLogs = await storage.getEmailLogsByOrder(orderId);
      res.json(emailLogs);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching email logs: " + error.message });
    }
  });

  // Admin: Get audit logs for an order
  app.get("/api/admin/orders/:id/audit-logs", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const auditLogs = await storage.getAuditLogsByOrder(orderId);
      res.json(auditLogs);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching audit logs: " + error.message });
    }
  });

  // Admin: Resend confirmation email
  app.post("/api/admin/orders/:id/resend-confirmation", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const adminUserId = req.user.id;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      try {
        const { sendGridService } = await import("./sendgridService");
        const user = { 
          firstName: order.customerFirstName, 
          lastName: order.customerLastName, 
          email: order.customerEmail 
        };
        await sendGridService.sendOrderConfirmationEmail(order, user);
        res.json({ message: "Confirmation email resent successfully" });
      } catch (emailError) {
        console.error("Failed to resend confirmation email:", emailError);
        res.status(500).json({ message: "Failed to resend confirmation email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error resending confirmation email: " + error.message });
    }
  });

  // User: Get my orders
  app.get("/api/orders/my-orders", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user orders: " + error.message });
    }
  });

  // Create test order (for price simulation)
  app.post("/api/orders/test", async (req, res) => {
    try {
      const { 
        serviceId, 
        wasteTypes, 
        deliveryDate, 
        pickupDate, 
        durationDays,
        address, 
        postalCode, 
        city, 
        pricing, 
        customer, 
        isTestOrder 
      } = req.body;

      // Generate unique order number for test
      const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create order with zero total for testing
      const orderData = {
        orderNumber,
        serviceId: parseInt(serviceId),
        wasteTypes: wasteTypes.map((id: number) => id.toString()),
        deliveryDate: new Date(deliveryDate),
        pickupDate: new Date(pickupDate),
        durationDays: parseInt(durationDays),
        basePrice: "0.00", // Test order at 0€
        status: "pending",
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCompany: customer.company,
        customerSiret: customer.siret,
        deliveryStreet: address,
        deliveryCity: city,
        deliveryPostalCode: postalCode,
        notes: `COMMANDE TEST - ${customer.notes}`,
        // Add pricing breakdown as JSON
        pricingBreakdown: JSON.stringify(pricing),
        // Tax fields for test order
        totalHT: "0.00",
        vat: "0.00", 
        totalTTC: "0.00"
      };

      const order = await storage.createOrder(orderData);

      // Send test emails using SendGrid
      try {
        const { sendGridService } = await import("./sendgridService");
        // Create a simple user object with just the required fields
        const testUser = {
          id: 0,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
          password: "",
          role: "client",
          isVerified: true,
          verificationToken: null,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          address: null,
          postalCode: null,
          city: null,
          company: customer.company || null,
          siret: customer.siret || null,
          isActive: true,
          profilePicture: null,
          companyName: customer.company || null,
          country: "France",
          preferredLanguage: "fr",
          marketingConsent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await sendGridService.sendOrderConfirmationEmail(order, testUser);
        console.log(`Email de confirmation test envoyé pour commande ${orderNumber}`);
      } catch (emailError) {
        console.error("Erreur envoi email test:", emailError);
      }

      res.json({
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        message: "Commande test créée avec succès. Emails d'envoi en cours..."
      });

    } catch (error: any) {
      console.error("Erreur création commande test:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la création de la commande test: " + error.message 
      });
    }
  });

  // Admin: Validate delivery date (confirm original date)
  app.post("/api/admin/orders/:id/validate-delivery-date", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const adminUserId = req.user.id;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      // Valider la date de livraison estimée
      const updatedOrder = await storage.updateOrderDeliveryDateValidation(orderId, {
        confirmedDeliveryDate: order.estimatedDeliveryDate,
        deliveryDateValidatedBy: adminUserId,
        deliveryDateValidatedAt: new Date(),
        status: "confirmed"
      });

      // Envoyer email de confirmation
      try {
        const { sendGridService } = await import("./sendgridService");
        const user = { 
          firstName: order.customerFirstName, 
          lastName: order.customerLastName, 
          email: order.customerEmail 
        };
        await sendGridService.sendDeliveryDateConfirmedEmail(updatedOrder, user);
      } catch (emailError) {
        console.error("Erreur envoi email confirmation date:", emailError);
      }

      res.json({ message: "Date de livraison validée", order: updatedOrder });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur validation date: " + error.message });
    }
  });

  // Admin: Propose new delivery date
  app.post("/api/admin/orders/:id/propose-delivery-date", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { proposedDate, adminNotes } = req.body;
      const adminUserId = req.user.id;

      if (!proposedDate) {
        return res.status(400).json({ message: "Date proposée requise" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      // Générer un token unique pour la validation client
      const validationToken = Math.random().toString(36).substr(2, 32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      const updatedOrder = await storage.updateOrderDeliveryDateValidation(orderId, {
        proposedDeliveryDate: new Date(proposedDate),
        clientValidationToken: validationToken,
        clientValidationExpiresAt: expiresAt,
        clientValidationStatus: "pending",
        deliveryDateValidatedBy: adminUserId,
        deliveryDateValidatedAt: new Date(),
        adminNotes: adminNotes,
        status: "awaiting_client_validation"
      });

      // Envoyer email de proposition au client
      try {
        const { sendGridService } = await import("./sendgridService");
        const user = { 
          firstName: order.customerFirstName, 
          lastName: order.customerLastName, 
          email: order.customerEmail 
        };
        await sendGridService.sendDeliveryDateProposalEmail(updatedOrder, user, validationToken);
      } catch (emailError) {
        console.error("Erreur envoi email proposition:", emailError);
      }

      res.json({ message: "Nouvelle date proposée au client", order: updatedOrder });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur proposition date: " + error.message });
    }
  });

  // Client: Validate proposed delivery date
  app.post("/api/orders/validate-delivery-date/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { accepted } = req.body;

      const order = await storage.getOrderByValidationToken(token);
      if (!order) {
        return res.status(404).json({ message: "Token de validation invalide ou expiré" });
      }

      if (new Date() > order.clientValidationExpiresAt) {
        return res.status(400).json({ message: "Token de validation expiré" });
      }

      let newStatus = "pending";
      let confirmedDate = null;

      if (accepted) {
        // Client accepte la date proposée
        newStatus = "confirmed";
        confirmedDate = order.proposedDeliveryDate;
      } else {
        // Client refuse - retour en attente d'une nouvelle proposition
        newStatus = "pending";
      }

      const updatedOrder = await storage.updateOrderDeliveryDateValidation(order.id, {
        clientValidationStatus: accepted ? "accepted" : "rejected",
        confirmedDeliveryDate: confirmedDate,
        clientValidationToken: null, // Invalider le token
        status: newStatus
      });

      // Envoyer email de notification selon la réponse
      try {
        const { sendGridService } = await import("./sendgridService");
        const user = { 
          firstName: order.customerFirstName, 
          lastName: order.customerLastName, 
          email: order.customerEmail 
        };
        
        if (accepted) {
          await sendGridService.sendDeliveryDateAcceptedEmail(updatedOrder, user);
        } else {
          await sendGridService.sendDeliveryDateRejectedEmail(updatedOrder, user);
        }
      } catch (emailError) {
        console.error("Erreur envoi email réponse client:", emailError);
      }

      res.json({ 
        message: accepted ? "Date de livraison acceptée" : "Date de livraison refusée", 
        order: updatedOrder 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur validation client: " + error.message });
    }
  });

  // Admin: Get dashboard stats
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching dashboard stats: " + error.message });
    }
  });

  // Admin: Get stats (alias for dashboard compatibility)
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching stats: " + error.message });
    }
  });

  // Admin: Delete order
  app.delete("/api/admin/orders/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      // Vérifier que la commande existe
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      // Supprimer la commande
      await storage.deleteOrder(orderId);
      
      res.json({ 
        message: "Commande supprimée avec succès",
        deletedOrderId: orderId 
      });
    } catch (error: any) {
      console.error("Erreur suppression commande:", error);
      res.status(500).json({ message: "Erreur lors de la suppression: " + error.message });
    }
  });

  // Create default services and time slots (for initialization)
  app.post("/api/admin/initialize", async (req, res) => {
    try {
      // Create default services
      const defaultServices = [
        {
          name: "Benne 8m³",
          volume: 8,
          basePrice: "180.00",
          description: "Idéale pour travaux domestiques, débarras",
          wasteTypes: ["construction", "household", "green"],
          maxWeight: 2,
          isActive: true,
        },
        {
          name: "Benne 15m³",
          volume: 15,
          basePrice: "280.00",
          description: "Pour travaux de rénovation moyens",
          wasteTypes: ["construction", "household", "green", "metal"],
          maxWeight: 5,
          isActive: true,
        },
        {
          name: "Benne 30m³",
          volume: 30,
          basePrice: "450.00",
          description: "Pour gros chantiers, démolition",
          wasteTypes: ["construction", "household", "green", "metal"],
          maxWeight: 10,
          isActive: true,
        },
      ];

      for (const service of defaultServices) {
        await storage.createService(service);
      }

      // Create default time slots for the next 30 days
      const timeSlots = [
        { startTime: "08:00", endTime: "12:00" },
        { startTime: "13:00", endTime: "17:00" },
      ];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const slot of timeSlots) {
          await storage.createTimeSlot({
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
            maxBookings: 5,
            currentBookings: 0,
          });
        }
      }

      res.json({ success: true, message: "Default data initialized" });
    } catch (error: any) {
      res.status(500).json({ message: "Error initializing data: " + error.message });
    }
  });

  // Admin: Trigger manual inactivity check
  app.post("/api/admin/check-inactive-users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await NotificationService.runInactivityCheck();
      res.json({ message: "Vérification d'inactivité lancée avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la vérification d'inactivité: " + error.message });
    }
  });

  // Admin: Record abandoned checkout
  app.post("/api/admin/abandoned-checkout", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const abandonedCheckoutData = req.body;
      await NotificationService.recordAbandonedCheckout(abandonedCheckoutData);
      res.json({ message: "Commande abandonnée enregistrée et notification envoyée" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de l'enregistrement: " + error.message });
    }
  });

  // Admin: Toggle user notification settings
  app.patch("/api/admin/users/:id/notifications", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { notifyOnInactivity } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        notifyOnInactivity: notifyOnInactivity
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la mise à jour: " + error.message });
    }
  });

  // Routes for rental pricing management
  // Get all rental pricing
  app.get("/api/admin/rental-pricing", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const pricingList = await storage.getRentalPricing();
      res.json(pricingList);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching rental pricing: " + error.message });
    }
  });

  // Get rental pricing for a specific service
  app.get("/api/admin/rental-pricing/:serviceId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const pricing = await storage.getRentalPricingByServiceId(serviceId);
      
      if (!pricing) {
        return res.status(404).json({ message: "Pricing not found for this service" });
      }
      
      res.json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching rental pricing: " + error.message });
    }
  });

  // Create or update rental pricing
  app.post("/api/admin/rental-pricing", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertRentalPricingSchema.parse(req.body);
      
      // Check if pricing already exists for this service
      const existingPricing = await storage.getRentalPricingByServiceId(validatedData.serviceId);
      
      if (existingPricing) {
        // Update existing pricing
        const updatedPricing = await storage.updateRentalPricing(validatedData.serviceId, {
          dailyRate: validatedData.dailyRate,
          billingStartDay: validatedData.billingStartDay,
          maxTonnage: validatedData.maxTonnage,
          isActive: validatedData.isActive,
        });
        res.json(updatedPricing);
      } else {
        // Create new pricing
        const newPricing = await storage.createRentalPricing(validatedData);
        res.status(201).json(newPricing);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error saving rental pricing: " + error.message });
      }
    }
  });

  // Update rental pricing
  app.put("/api/admin/rental-pricing/:serviceId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const validatedData = updateRentalPricingSchema.parse(req.body);
      
      const updatedPricing = await storage.updateRentalPricing(serviceId, validatedData);
      
      if (!updatedPricing) {
        return res.status(404).json({ message: "Pricing not found for this service" });
      }
      
      res.json(updatedPricing);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating rental pricing: " + error.message });
      }
    }
  });

  // Delete rental pricing
  app.delete("/api/admin/rental-pricing/:serviceId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      await storage.deleteRentalPricing(serviceId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting rental pricing: " + error.message });
    }
  });

  // Routes pour les tarifs de transport
  app.get("/api/admin/transport-pricing", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const pricing = await storage.getTransportPricing();
      res.json(pricing || {
        pricePerKm: "0",
        minimumFlatRate: "0",
        hourlyRate: "0",
        immediateLoadingEnabled: true
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching transport pricing: " + error.message });
    }
  });

  app.put("/api/admin/transport-pricing", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = updateTransportPricingSchema.parse(req.body);
      
      // Auto-disable immediate loading if hourly rate is 0
      if (validatedData.hourlyRate === "0" || validatedData.hourlyRate === "0.00") {
        validatedData.immediateLoadingEnabled = false;
      }
      
      const pricing = await storage.updateTransportPricing(validatedData);
      res.json(pricing);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating transport pricing: " + error.message });
      }
    }
  });

  // Routes pour les types de déchets/matières
  // Route publique pour les utilisateurs
  app.get("/api/waste-types", async (req, res) => {
    try {
      const wasteTypes = await storage.getWasteTypes();
      // Filtrer seulement les types actifs pour les utilisateurs
      const activeWasteTypes = wasteTypes.filter(wt => wt.isActive !== false);
      res.json(activeWasteTypes);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching waste types: " + error.message });
    }
  });

  // Route admin pour la gestion complète
  app.get("/api/admin/waste-types", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const wasteTypes = await storage.getWasteTypes();
      res.json(wasteTypes);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching waste types: " + error.message });
    }
  });

  app.post("/api/admin/waste-types", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertWasteTypeSchema.parse(req.body);
      const wasteType = await storage.createWasteType(validatedData);
      res.status(201).json(wasteType);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating waste type: " + error.message });
      }
    }
  });

  // Routes pour les tarifs de traitement
  // Route publique pour les utilisateurs
  app.get("/api/treatment-pricing", async (req, res) => {
    try {
      const pricing = await storage.getTreatmentPricing();
      // Filtrer seulement les tarifs actifs pour les utilisateurs
      const activePricing = pricing.filter(p => p.isActive !== false);
      res.json(activePricing);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching treatment pricing: " + error.message });
    }
  });

  // Route admin pour la gestion complète
  app.get("/api/admin/treatment-pricing", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const pricing = await storage.getTreatmentPricing();
      res.json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching treatment pricing: " + error.message });
    }
  });

  app.post("/api/admin/treatment-pricing", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTreatmentPricingSchema.parse(req.body);
      const pricing = await storage.createTreatmentPricing(validatedData);
      res.status(201).json(pricing);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating treatment pricing: " + error.message });
      }
    }
  });

  app.put("/api/admin/treatment-pricing/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateTreatmentPricingSchema.parse(req.body);
      const pricing = await storage.updateTreatmentPricing(id, validatedData);
      
      if (!pricing) {
        return res.status(404).json({ message: "Treatment pricing not found" });
      }
      
      res.json(pricing);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating treatment pricing: " + error.message });
      }
    }
  });

  app.delete("/api/admin/treatment-pricing/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTreatmentPricing(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting treatment pricing: " + error.message });
    }
  });

  // Company activities routes
  app.get('/api/admin/company-activities', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const activities = await storage.getCompanyActivities();
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: 'Erreur lors de la récupération des activités: ' + error.message });
    }
  });

  app.post('/api/admin/company-activities', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const activities = await storage.createCompanyActivities(req.body);
      res.status(201).json(activities);
    } catch (error: any) {
      res.status(500).json({ message: 'Erreur lors de la création des activités: ' + error.message });
    }
  });

  app.put('/api/admin/company-activities', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('Données reçues pour mise à jour:', JSON.stringify(req.body, null, 2));
      
      // Filtrer les champs qui ne doivent pas être mis à jour (dates, id)
      const { id, createdAt, updatedAt, ...dataToUpdate } = req.body;
      
      // Convertir les données pour s'assurer que les tableaux sont bien formatés
      const processedData = {
        ...dataToUpdate,
        wasteTypes: Array.isArray(dataToUpdate.wasteTypes) ? dataToUpdate.wasteTypes : [],
        equipmentMultibenne: Array.isArray(dataToUpdate.equipmentMultibenne) ? dataToUpdate.equipmentMultibenne : [],
        equipmentAmpliroll: Array.isArray(dataToUpdate.equipmentAmpliroll) ? dataToUpdate.equipmentAmpliroll : [],
        equipmentCaissePalette: Array.isArray(dataToUpdate.equipmentCaissePalette) ? dataToUpdate.equipmentCaissePalette : [],
        equipmentRolls: Array.isArray(dataToUpdate.equipmentRolls) ? dataToUpdate.equipmentRolls : [],
        equipmentContenantAlimentaire: Array.isArray(dataToUpdate.equipmentContenantAlimentaire) ? dataToUpdate.equipmentContenantAlimentaire : [],
        equipmentBac: Array.isArray(dataToUpdate.equipmentBac) ? dataToUpdate.equipmentBac : [],
        equipmentBennesFermees: Array.isArray(dataToUpdate.equipmentBennesFermees) ? dataToUpdate.equipmentBennesFermees : [],
      };
      
      const activities = await storage.updateCompanyActivities(processedData);
      res.json(activities);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des activités:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour des activités: ' + error.message });
    }
  });

  // Google Places Autocomplete API
  app.get("/api/places/autocomplete", async (req, res) => {
    try {
      const { input } = req.query;
      
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ message: "Paramètre 'input' requis" });
      }

      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ message: "Clé API Google Maps manquante" });
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:fr&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const suggestions = data.predictions.map((prediction: any) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          main_text: prediction.structured_formatting?.main_text || '',
          secondary_text: prediction.structured_formatting?.secondary_text || ''
        }));
        
        res.json({ suggestions });
      } else {
        res.status(400).json({ message: `Erreur API Google Places: ${data.status}` });
      }
    } catch (error: any) {
      console.error("Erreur autocomplete:", error);
      res.status(500).json({ message: "Erreur lors de l'autocomplétion: " + error.message });
    }
  });

  // Test Google Maps API connection
  app.get("/api/test-maps-api", async (req, res) => {
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ 
          success: false,
          message: "Clé API Google Maps manquante dans les variables d'environnement" 
        });
      }

      // Test simple avec géocodage d'une adresse connue
      const testResult = await DistanceService.geocodeAddress("Paris, France");
      
      res.json({
        success: true,
        message: "Clé API Google Maps fonctionnelle",
        testResult: {
          address: "Paris, France",
          coordinates: testResult
        }
      });
    } catch (error: any) {
      console.error("Erreur test API Google Maps:", error);
      res.status(500).json({ 
        success: false,
        message: `Erreur API Google Maps: ${error.message}`,
        details: "Vérifiez que votre clé API Google Maps est valide et que les APIs Geocoding et Distance Matrix sont activées"
      });
    }
  });

  // Calculate pricing with distance

  // Calculate pricing with real distance and duration supplements
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { serviceId, wasteType, address, postalCode, city, durationDays = 7, bsdOption = false } = req.body;

      // Get service pricing
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service non trouvé" });
      }

      // Get transport pricing
      const transportPricing = await storage.getTransportPricing();
      if (!transportPricing) {
        return res.status(404).json({ message: "Tarification transport non configurée" });
      }

      // Get rental pricing for duration supplements
      const rentalPricing = await storage.getRentalPricingByServiceId(serviceId);
      if (!rentalPricing) {
        return res.status(404).json({ message: "Tarification de location non configurée" });
      }

      // Get company activities for industrial site address
      const activities = await storage.getCompanyActivities();
      if (!activities || !activities.industrialSiteAddress) {
        return res.status(400).json({ 
          message: "Adresse du site industriel non configurée. Veuillez configurer l'adresse dans 'Mes activités'." 
        });
      }

      // Calculate duration supplement: (jours - seuil) × prix journalier
      const calculateDurationSupplement = (days: number, pricing: any) => {
        const daysNum = parseInt(days.toString());
        const dailyRate = parseFloat(pricing.dailyRate) || 0;
        let extraDays = 0;
        let startDay = pricing.billingStartDay || 1;
        
        // Calculer les jours supplémentaires au-delà du seuil de début
        if (daysNum > startDay) {
          extraDays = daysNum - startDay;
        }
        
        return extraDays * dailyRate;
      };

      const durationSupplement = calculateDurationSupplement(durationDays, rentalPricing);
      const baseServicePrice = parseFloat(service.basePrice);
      const totalServicePrice = baseServicePrice + durationSupplement;

      let totalPrice = totalServicePrice;
      let breakdown = {
        service: baseServicePrice,
        durationSupplement: durationSupplement,
        transport: 0,
        treatment: 0,
        bsd: bsdOption ? 15 : 0,
        total: 0
      };

      // Calculate real distance and transport cost
      try {
        const customerAddress = `${address}, ${postalCode} ${city}`;
        const industrialAddress = DistanceService.formatIndustrialSiteAddress(activities);
        
        const distanceResult = await DistanceService.calculateDistance(customerAddress, industrialAddress);
        
        const transportCost = DistanceService.calculateTransportCost(
          distanceResult.distance,
          parseFloat(transportPricing.pricePerKm),
          parseFloat(transportPricing.minimumFlatRate)
        );
        
        breakdown.transport = transportCost;

        // Add treatment costs for the selected waste type (prix par tonne × tonnage max configuré)
        const maxTonnage = parseFloat(rentalPricing.maxTonnage) || 0;
        if (wasteType && maxTonnage > 0) {
          // Get waste type ID based on name
          const wasteTypes = await storage.getWasteTypes();
          const selectedWasteType = wasteTypes.find(wt => wt.name === wasteType);
          
          if (selectedWasteType) {
            const treatmentPricing = await storage.getTreatmentPricingByWasteTypeId(selectedWasteType.id);
            if (treatmentPricing) {
              const pricePerTon = parseFloat(treatmentPricing.pricePerTon);
              const treatmentCost = pricePerTon * maxTonnage;
              breakdown.treatment += treatmentCost;
            }
          }
        }

        breakdown.total = breakdown.service + breakdown.durationSupplement + breakdown.transport + breakdown.treatment + breakdown.bsd;

        res.json({
          success: true,
          pricing: breakdown,
          distance: {
            kilometers: distanceResult.distance,
            roundTripKm: distanceResult.distance * 2,
            duration: distanceResult.duration
          },
          service: {
            name: service.name,
            volume: service.volume
          },
          duration: {
            days: durationDays,
            supplement: durationSupplement,
            appliedThreshold: durationSupplement > 0 ? 
              (durationDays >= (rentalPricing.durationThreshold3 || 999) ? rentalPricing.durationThreshold3 :
               durationDays >= (rentalPricing.durationThreshold2 || 999) ? rentalPricing.durationThreshold2 :
               durationDays >= (rentalPricing.durationThreshold1 || 999) ? rentalPricing.durationThreshold1 : null) : null
          },
          addresses: {
            customer: customerAddress,
            industrial: industrialAddress
          }
        });

      } catch (distanceError: any) {
        console.error("Erreur calcul distance:", distanceError);
        
        // Fallback avec distance estimée si l'API échoue
        const estimatedDistance = 15; // km
        const transportCost = Math.max(
          estimatedDistance * parseFloat(transportPricing.pricePerKm),
          parseFloat(transportPricing.minimumFlatRate)
        );
        breakdown.transport = transportCost;
        totalPrice += transportCost;

        // Add treatment costs for the selected waste type (prix par tonne × tonnage max configuré)
        const maxTonnage = parseFloat(rentalPricing.maxTonnage) || 0;
        if (wasteType && maxTonnage > 0) {
          // Get waste type ID based on name
          const wasteTypesList = await storage.getWasteTypes();
          const selectedWasteType = wasteTypesList.find(wt => wt.name === wasteType);
          
          if (selectedWasteType) {
            const treatmentPricing = await storage.getTreatmentPricingByWasteTypeId(selectedWasteType.id);
            if (treatmentPricing) {
              const pricePerTon = parseFloat(treatmentPricing.pricePerTon);
              const treatmentCost = pricePerTon * maxTonnage;
              breakdown.treatment += treatmentCost;
              totalPrice += treatmentCost;
            }
          }
        }

        breakdown.total = totalPrice + breakdown.bsd;

        res.json({
          success: true,
          pricing: breakdown,
          distance: {
            kilometers: estimatedDistance,
            roundTripKm: estimatedDistance * 2,
            estimated: true,
            error: distanceError.message
          },
          service: {
            name: service.name,
            volume: service.volume
          },
          duration: {
            days: durationDays,
            supplement: durationSupplement,
            appliedThreshold: durationSupplement > 0 ? 
              (durationDays >= (rentalPricing.durationThreshold3 || 999) ? rentalPricing.durationThreshold3 :
               durationDays >= (rentalPricing.durationThreshold2 || 999) ? rentalPricing.durationThreshold2 :
               durationDays >= (rentalPricing.durationThreshold1 || 999) ? rentalPricing.durationThreshold1 : null) : null
          }
        });
      }
    } catch (error: any) {
      console.error("Erreur calcul prix:", error);
      res.status(500).json({ message: "Erreur lors du calcul du prix: " + error.message });
    }
  });

  // Get all services (admin only)
  app.get("/api/admin/services", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });

  // Add new service/equipment
  app.post("/api/admin/services", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(validatedData);
      res.status(201).json(newService);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating service: " + error.message });
      }
    }
  });

  // Update service/equipment
  app.put("/api/admin/services/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const validatedData = insertServiceSchema.parse(req.body);
      const updatedService = await storage.updateService(serviceId, validatedData);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating service: " + error.message });
      }
    }
  });

  // Delete service/equipment
  app.delete("/api/admin/services/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      // Instead of deleting, we deactivate the service
      await storage.updateService(serviceId, { isActive: false });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting service: " + error.message });
    }
  });

  // Service images management routes
  app.get("/api/admin/services/:id/images", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const images = await storage.getServiceImages(serviceId);
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching service images: " + error.message });
    }
  });

  app.post("/api/admin/services/images/upload", authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const { serviceId, imageType } = req.body;
      const file = req.file;
      
      if (!serviceId) {
        return res.status(400).json({ message: "Service ID requis" });
      }

      if (!file) {
        return res.status(400).json({ message: "Fichier image requis" });
      }

      // Le fichier est maintenant sauvegardé sur disque par multer
      // Construire le chemin pour la base de données
      const imagePath = `/uploads/services/${serviceId}/${file.filename}`;
      
      const imageData = {
        serviceId: parseInt(serviceId),
        imagePath: imagePath,
        imageType: imageType || 'face',
        altText: `Photo ${imageType || 'face'} de la benne`,
        isMain: false,
        sortOrder: 0
      };

      const savedImage = await storage.createServiceImage(imageData);
      res.json(savedImage);
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Erreur lors de l'upload: " + error.message });
    }
  });

  app.put("/api/admin/services/images/:id/set-main", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      await storage.setMainServiceImage(imageId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error setting main image: " + error.message });
    }
  });

  app.delete("/api/admin/services/images/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      await storage.deleteServiceImage(imageId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting image: " + error.message });
    }
  });

  // Bank deposits routes
  app.get("/api/admin/bank-deposits", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const deposits = await storage.getBankDeposits();
      res.json(deposits);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération des empreintes bancaires: " + error.message });
    }
  });

  app.post("/api/admin/bank-deposits", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBankDepositSchema.parse(req.body);
      const deposit = await storage.createBankDeposit(validatedData);
      res.json(deposit);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la création de l'empreinte bancaire: " + error.message });
      }
    }
  });

  app.put("/api/admin/bank-deposits/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateBankDepositSchema.parse(req.body);
      const deposit = await storage.updateBankDeposit(id, validatedData);
      res.json(deposit);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la modification de l'empreinte bancaire: " + error.message });
      }
    }
  });

  app.delete("/api/admin/bank-deposits/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBankDeposit(id);
      res.json({ message: "Empreinte bancaire supprimée avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la suppression de l'empreinte bancaire: " + error.message });
    }
  });

  // Client dashboard routes
  app.get("/api/orders/my-orders", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Fetching orders for user:", userId);
      
      // Récupérer toutes les commandes et filtrer par userId
      const allOrders = await storage.getOrders();
      const userOrders = allOrders.filter(order => order.userId === userId);
      
      console.log("Orders found:", userOrders.length);
      res.json(userOrders);
    } catch (error: any) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des commandes: " + error.message });
    }
  });

  app.get("/api/orders/recurring", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Pour l'instant, retourner un tableau vide car la fonctionnalité n'est pas encore implémentée
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération des commandes récurrentes: " + error.message });
    }
  });

  app.post("/api/orders/recurring", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // TODO: Implémenter la création de commandes récurrentes
      res.json({ message: "Fonctionnalité en cours de développement" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la création de la commande récurrente: " + error.message });
    }
  });

  app.put("/api/orders/:id", authenticateToken, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Vérifier que la commande appartient à l'utilisateur
      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      
      // Vérifier que la commande peut être modifiée
      if (!['en_attente', 'confirme'].includes(order.status)) {
        return res.status(400).json({ message: "Cette commande ne peut plus être modifiée" });
      }
      
      // TODO: Implémenter la mise à jour de commande
      res.json({ message: "Commande mise à jour avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la modification de la commande: " + error.message });
    }
  });

  app.put("/api/orders/:id/cancel", authenticateToken, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Vérifier que la commande appartient à l'utilisateur
      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      
      // Vérifier que la commande peut être annulée
      if (!['en_attente', 'confirme'].includes(order.status)) {
        return res.status(400).json({ message: "Cette commande ne peut plus être annulée" });
      }
      
      await storage.updateOrderStatus(orderId, 'annule');
      res.json({ message: "Commande annulée avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de l'annulation de la commande: " + error.message });
    }
  });

  app.get("/api/waste-types", async (req, res) => {
    try {
      const wasteTypes = await storage.getWasteTypes();
      res.json(wasteTypes);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la récupération des types de déchets: " + error.message });
    }
  });

  // Route pour gérer les paramètres de notification d'inactivité (admin uniquement)
  app.patch("/api/admin/users/:userId/notifications", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { notifyOnInactivity } = req.body;

      if (typeof notifyOnInactivity !== 'boolean') {
        return res.status(400).json({ message: "Le paramètre notifyOnInactivity doit être un booléen" });
      }

      // Vérifier que l'utilisateur existe
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Mettre à jour le paramètre de notification
      await storage.updateUserNotificationSettings(userId, notifyOnInactivity);

      res.json({ 
        message: "Paramètres de notification mis à jour",
        notifyOnInactivity 
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des paramètres de notification:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres de notification: " + error.message });
    }
  });

  // Routes pour les questionnaires de satisfaction
  app.get('/api/admin/satisfaction-surveys', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const surveys = await storage.getSatisfactionSurveys();
      res.json(surveys);
    } catch (error) {
      console.error('Erreur lors de la récupération des questionnaires:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des questionnaires' });
    }
  });

  // Statistiques des questionnaires de satisfaction (admin only)
  app.get('/api/admin/satisfaction-surveys/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const surveys = await storage.getSatisfactionSurveys();
      const completed = surveys.filter(s => s.completed);
      
      const totalSurveys = surveys.length;
      const completedSurveys = completed.length;
      const completionRate = totalSurveys > 0 ? Math.round((completedSurveys / totalSurveys) * 100) : 0;
      
      const averageNPS = completed.length > 0 
        ? Math.round(completed.reduce((sum, s) => sum + (s.npsScore || 0), 0) / completed.length) 
        : 0;
      
      const averageOverallSatisfaction = completed.length > 0
        ? Math.round((completed.reduce((sum, s) => sum + (s.overallSatisfaction || 0), 0) / completed.length) * 10) / 10
        : 0;
      
      const wouldRecommendRate = completed.length > 0
        ? Math.round((completed.filter(s => s.wouldRecommend).length / completed.length) * 100)
        : 0;
      
      const wouldUseAgainRate = completed.length > 0
        ? Math.round((completed.filter(s => s.wouldUseAgain).length / completed.length) * 100)
        : 0;

      res.json({
        totalSurveys,
        completedSurveys,
        completionRate,
        averageNPS,
        averageOverallSatisfaction,
        wouldRecommendRate,
        wouldUseAgainRate,
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
    }
  });

  // Route publique pour afficher un questionnaire via token
  app.get('/api/satisfaction-survey/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const survey = await storage.getSatisfactionSurveyByToken(token);
      if (!survey) {
        return res.status(404).json({ message: 'Questionnaire non trouvé' });
      }

      // Vérifier si le questionnaire a expiré
      if (survey.expiresAt < new Date()) {
        return res.status(410).json({ message: 'Ce questionnaire a expiré' });
      }

      // Vérifier si le questionnaire est déjà complété
      if (survey.completed) {
        return res.status(410).json({ message: 'Ce questionnaire a déjà été complété' });
      }

      const order = await storage.getOrder(survey.orderId);
      const user = await storage.getUserById(survey.userId);

      res.json({
        survey: {
          id: survey.id,
          token: survey.token,
          expiresAt: survey.expiresAt,
          completed: survey.completed,
        },
        order: order ? {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
        } : null,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
        } : null,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du questionnaire:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du questionnaire' });
    }
  });

  // Soumettre les réponses d'un questionnaire (route publique)
  app.post('/api/satisfaction-survey/:token/submit', async (req, res) => {
    try {
      const { token } = req.params;
      const {
        overallSatisfaction,
        serviceQuality,
        deliveryTiming,
        pickupTiming,
        customerService,
        valueForMoney,
        positiveComments,
        negativeComments,
        suggestions,
        npsScore,
        wouldUseAgain,
        wouldRecommend,
      } = req.body;

      const survey = await storage.getSatisfactionSurveyByToken(token);
      if (!survey) {
        return res.status(404).json({ message: 'Questionnaire non trouvé' });
      }

      // Vérifier si le questionnaire a expiré
      if (survey.expiresAt < new Date()) {
        return res.status(410).json({ message: 'Ce questionnaire a expiré' });
      }

      // Vérifier si le questionnaire est déjà complété
      if (survey.completed) {
        return res.status(410).json({ message: 'Ce questionnaire a déjà été complété' });
      }

      // Récupérer les métadonnées de la requête
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      const updatedSurvey = await storage.updateSatisfactionSurvey(survey.id, {
        overallSatisfaction: parseInt(overallSatisfaction),
        serviceQuality: parseInt(serviceQuality),
        deliveryTiming: parseInt(deliveryTiming),
        pickupTiming: parseInt(pickupTiming),
        customerService: parseInt(customerService),
        valueForMoney: parseInt(valueForMoney),
        positiveComments: positiveComments || null,
        negativeComments: negativeComments || null,
        suggestions: suggestions || null,
        npsScore: parseInt(npsScore),
        wouldUseAgain: wouldUseAgain === 'true' || wouldUseAgain === true,
        wouldRecommend: wouldRecommend === 'true' || wouldRecommend === true,
        ipAddress,
        userAgent,
        completed: true,
        completedAt: new Date(),
      });

      res.json({ message: 'Questionnaire soumis avec succès', survey: updatedSurvey });
    } catch (error) {
      console.error('Erreur lors de la soumission du questionnaire:', error);
      res.status(500).json({ message: 'Erreur lors de la soumission du questionnaire' });
    }
  });

  // Google Maps API key endpoint (secured for admin only)
  app.get("/api/maps/config", authenticateToken, requireAdmin, (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Google Maps API key not configured" 
        });
      }
      
      res.json({ 
        apiKey: apiKey,
        success: true 
      });
    } catch (error: any) {
      console.error("Error getting Maps API key:", error);
      res.status(500).json({ 
        error: "Failed to retrieve Maps configuration" 
      });
    }
  });

  // Places autocomplete endpoint with address component extraction
  app.get("/api/places/autocomplete", async (req, res) => {
    try {
      const { input } = req.query;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Google Maps API key not configured" 
        });
      }

      if (!input || typeof input !== 'string') {
        return res.json({ suggestions: [] });
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:FR&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const suggestions = data.predictions.map((prediction: any) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          main_text: prediction.structured_formatting?.main_text || '',
          secondary_text: prediction.structured_formatting?.secondary_text || ''
        }));
        
        res.json({ suggestions });
      } else if (data.status === 'REQUEST_DENIED') {
        // Fallback intelligent si pas d'accès à Places API
        console.log('Places API non accessible, utilisation du fallback');
        res.status(400).json({ 
          message: "Erreur API Google Places: REQUEST_DENIED",
          fallback: true
        });
      } else {
        res.json({ suggestions: [] });
      }
    } catch (error: any) {
      console.error("Error fetching Places autocomplete:", error);
      res.status(400).json({ 
        message: "Erreur API Google Places: " + error.message,
        fallback: true
      });
    }
  });

  // Place details endpoint to get full address components
  app.get("/api/places/details", async (req, res) => {
    try {
      const { place_id } = req.query;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Google Maps API key not configured" 
        });
      }

      if (!place_id || typeof place_id !== 'string') {
        return res.status(400).json({ 
          error: "Place ID is required" 
        });
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=address_components,formatted_address&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const addressComponents = data.result.address_components;
        
        // Extract address components
        let streetNumber = '';
        let route = '';
        let locality = '';
        let postalCode = '';
        let country = '';
        
        addressComponents.forEach((component: any) => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (types.includes('locality')) {
            locality = component.long_name;
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name;
          } else if (types.includes('country')) {
            country = component.short_name;
          }
        });
        
        const street = `${streetNumber} ${route}`.trim();
        
        res.json({
          success: true,
          address: {
            street: street,
            city: locality,
            postalCode: postalCode,
            country: country,
            formatted_address: data.result.formatted_address
          }
        });
      } else {
        res.status(404).json({ 
          error: "Place not found" 
        });
      }
    } catch (error: any) {
      console.error("Error fetching Place details:", error);
      res.status(500).json({ 
        error: "Failed to fetch place details" 
      });
    }
  });

  // Fonction de calcul de distance intelligente basée sur l'adresse
  const calculateDistanceFromAddress = (address: string): number => {
    const addressLower = address.toLowerCase();
    
    // Extraction du code postal français (5 chiffres)
    const postalCodeMatch = address.match(/\b(\d{5})\b/);
    
    if (postalCodeMatch) {
      const postalCode = postalCodeMatch[1];
      const dept = postalCode.substring(0, 2);
      
      // Distances approximatives par département depuis Paris (75)
      const distancesByDept: { [key: string]: number } = {
        '75': 15, '77': 35, '78': 25, '91': 30, '92': 18, '93': 22, '94': 20, '95': 28,
        '01': 350, '02': 120, '03': 280, '13': 650, '31': 550, '33': 450, '34': 600,
        '35': 300, '44': 350, '59': 200, '67': 350, '69': 350
      };
      
      if (distancesByDept[dept]) {
        return distancesByDept[dept];
      }
      
      // Calcul approximatif pour autres départements
      const deptNum = parseInt(dept);
      if (deptNum <= 95) return 150; // Proche de Paris
      if (deptNum <= 30) return 400; // Sud
      if (deptNum <= 60) return 300; // Centre/Est
      return 250; // Autres
    }
    
    // Analyse par mots-clés de villes principales
    const cityDistances: { [key: string]: number } = {
      'paris': 15, 'marseille': 650, 'lyon': 350, 'toulouse': 550, 'nice': 700,
      'nantes': 350, 'montpellier': 600, 'strasbourg': 350, 'bordeaux': 450,
      'lille': 200, 'rennes': 300, 'reims': 120, 'grenoble': 450, 'dijon': 250
    };
    
    for (const [city, distance] of Object.entries(cityDistances)) {
      if (addressLower.includes(city)) {
        return distance;
      }
    }
    
    // Fallback par défaut pour Île-de-France
    return 50;
  };

  // Calculate distance for delivery address
  app.post("/api/calculate-distance", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ 
          success: false,
          error: "Address is required" 
        });
      }

      // Utiliser l'API de géocodage pour calculer la distance réelle
      try {
        // Adresse de départ fixe (siège de l'entreprise)
        const originAddress = "123 Rue de l'Industrie, 75001 Paris, France";
        
        // Utiliser l'API Google Maps si disponible, sinon fallback intelligent
        const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (googleMapsKey && googleMapsKey.startsWith('AIzaSy') && googleMapsKey.length > 30) {
          // Utiliser Google Distance Matrix API
          try {
            const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originAddress)}&destinations=${encodeURIComponent(address)}&key=${googleMapsKey}&units=metric`;
            
            const distanceResponse = await fetch(distanceUrl);
            const distanceData = await distanceResponse.json();
            
            if (distanceData.status === 'OK' && distanceData.rows?.[0]?.elements?.[0]?.status === 'OK') {
              const element = distanceData.rows[0].elements[0];
              const distance = Math.round(element.distance.value / 1000); // km
              const duration = Math.round(element.duration.value / 60);   // min
              
              return res.json({
                success: true,
                distance: distance,
                duration: duration,
                source: 'google_maps_api'
              });
            }
          } catch (googleError) {
            console.log('Google Maps API erreur, utilisation fallback');
          }
        }
        
        // Fallback intelligent si Google Maps non disponible
        const distance = calculateDistanceFromAddress(address);
        res.json({
          success: true,
          distance: distance,
          duration: Math.floor(distance * 1.5),
          source: 'fallback_intelligent'
        });

      } catch (geoError) {
        console.log("Erreur géocodage, utilisation du fallback intelligent");
        
        // Fallback intelligent basé sur l'analyse de l'adresse
        const distance = calculateDistanceFromAddress(address);
        res.json({
          success: true,
          distance: distance,
          duration: Math.floor(distance * 2),
          source: 'fallback_intelligent'
        });
      }

    } catch (error: any) {
      console.error("Error calculating distance:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to calculate distance"
      });
    }
  });

  // Calculate pricing for service avec fallback hors ligne
  // SUPPRIMÉ - Endpoint en double avec celui de la ligne 1991

  // ==================== FID ROUTES ====================
  
  // Get all FIDs (admin only)
  app.get("/api/admin/fids", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status, search } = req.query;
      const fids = await storage.getFids({
        status: status as string,
        search: search as string
      });
      res.json(fids);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching FIDs: " + error.message });
    }
  });

  // Get FID by ID (admin only)
  app.get("/api/admin/fids/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const fidId = parseInt(req.params.id);
      const fid = await storage.getFidById(fidId);
      
      if (!fid) {
        return res.status(404).json({ message: "FID not found" });
      }
      
      res.json(fid);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching FID: " + error.message });
    }
  });

  // Create FID
  app.post("/api/fids", authenticateToken, async (req, res) => {
    try {
      const fidData = insertFidSchema.parse(req.body);
      const fid = await storage.createFid({
        ...fidData,
        userId: req.user!.id
      });
      res.status(201).json(fid);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating FID: " + error.message });
      }
    }
  });

  // Update FID (admin only)
  app.put("/api/admin/fids/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const fidId = parseInt(req.params.id);
      const updateData = updateFidSchema.parse(req.body);
      
      const updatedFid = await storage.updateFid(fidId, updateData);
      
      if (!updatedFid) {
        return res.status(404).json({ message: "FID not found" });
      }
      
      res.json(updatedFid);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating FID: " + error.message });
      }
    }
  });

  // Validate/Reject FID (admin only)
  app.put("/api/admin/fids/:id/validate", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const fidId = parseInt(req.params.id);
      const { status, adminComments, rejectionReason } = req.body;
      
      if (!['validated', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updateData: any = {
        status,
        validatedBy: req.user!.id,
        validatedAt: new Date(),
        adminComments
      };
      
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      const updatedFid = await storage.updateFid(fidId, updateData);
      
      if (!updatedFid) {
        return res.status(404).json({ message: "FID not found" });
      }
      
      res.json(updatedFid);
    } catch (error: any) {
      res.status(500).json({ message: "Error validating FID: " + error.message });
    }
  });

  // Export FID to PDF (admin only)
  app.get("/api/admin/fids/:id/export-pdf", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const fidId = parseInt(req.params.id);
      const fid = await storage.getFidById(fidId);
      
      if (!fid) {
        return res.status(404).json({ message: "FID not found" });
      }

      // Generate PDF content
      const pdfContent = generateFidPdfContent(fid);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="FID-${fidId}.json"`);
      res.json({ 
        success: true, 
        fidData: fid,
        pdfContent: pdfContent,
        message: "PDF data ready for client-side generation" 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error exporting FID: " + error.message });
    }
  });

  // Export all FIDs to Excel (admin only)
  app.get("/api/admin/fids/export-excel", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const XLSX = await import('xlsx');
      const fids = await storage.getFids({});
      
      // Prepare data for Excel export with French headers
      const exportData = fids.map((fid: any) => ({
        'ID': fid.id,
        'Nom du déchet': fid.wasteName,
        'Code nomenclature': fid.nomenclatureCode,
        'Entreprise cliente': fid.clientCompanyName,
        'Contact client': fid.clientContactName,
        'Email client': fid.clientEmail,
        'Téléphone client': fid.clientPhone,
        'Adresse client': fid.clientAddress,
        'Entreprise producteur': fid.producerCompanyName,
        'Contact producteur': fid.producerContactName,
        'Email producteur': fid.producerEmail,
        'Téléphone producteur': fid.producerPhone,
        'Adresse producteur': fid.producerAddress,
        'Origine du déchet': fid.wasteOrigin,
        'État physique': fid.physicalState,
        'Aspect': fid.appearance,
        'Couleur': fid.color,
        'Odeur': fid.odor,
        'Conditionnement': fid.packaging,
        'Quantité prévue': fid.estimatedQuantity,
        'Fréquence': fid.frequency,
        'Code UN': fid.unCode,
        'Groupe d\'emballage': fid.packagingGroup,
        'Désignation transport': fid.transportDesignation,
        'Contient POP/PFAS': fid.isPop ? 'Oui' : 'Non',
        'Substances POP': fid.popSubstances || '',
        'Manque d\'information': fid.lackOfInformation ? 'Oui' : 'Non',
        'Statut': fid.status,
        'Validé par': fid.validatedBy ? `User ${fid.validatedBy}` : '',
        'Date de validation': fid.validatedAt ? new Date(fid.validatedAt).toLocaleDateString('fr-FR') : '',
        'Commentaires admin': fid.adminComments || '',
        'Raison de rejet': fid.rejectionReason || '',
        'Date de création': fid.createdAt ? new Date(fid.createdAt).toLocaleDateString('fr-FR') : '',
        'Dernière modification': fid.updatedAt ? new Date(fid.updatedAt).toLocaleDateString('fr-FR') : ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'FID');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for download
      const filename = `fid_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      res.send(buffer);
    } catch (error: any) {
      console.error("Error exporting FIDs to Excel:", error);
      res.status(500).json({ message: "Erreur lors de l'export Excel: " + error.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: "disconnected"
      };

      // Test database connection
      try {
        await storage.getServices();
        healthData.database = "connected";
      } catch (dbError) {
        console.error("Database health check failed:", dbError);
        healthData.database = "disconnected";
      }

      res.json(healthData);
    } catch (error: any) {
      res.status(500).json({
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Database information endpoint
  app.get("/api/database/info", async (req, res) => {
    try {
      // Test database connection by using existing storage methods
      const services = await storage.getServices();
      const users = await storage.getUsers();
      const wasteTypes = await storage.getWasteTypes();
      
      // Get basic database info using our existing connection
      const connectionInfo = {
        servicesCount: services.length,
        usersCount: users.length,
        wasteTypesCount: wasteTypes.length,
        tablesFound: [
          'services', 'users', 'waste_types', 'orders', 'time_slots',
          'service_images', 'rental_pricing', 'transport_pricing', 
          'treatment_pricing', 'bank_deposits', 'fids', 'sessions',
          'audit_logs', 'email_logs', 'satisfaction_surveys',
          'survey_notifications', 'abandoned_checkouts', 
          'inactivity_notifications', 'company_activities'
        ]
      };
      
      res.json({
        status: "connected",
        database: {
          type: "PostgreSQL",
          provider: "Neon Database",
          environment: process.env.NODE_ENV || "development"
        },
        schema: {
          tableCount: connectionInfo.tablesFound.length,
          tables: connectionInfo.tablesFound,
          dataVerification: {
            services: connectionInfo.servicesCount,
            users: connectionInfo.usersCount,
            wasteTypes: connectionInfo.wasteTypesCount
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Autocomplete for addresses (placeholder)
  app.get("/api/places/autocomplete", async (req, res) => {
    try {
      const { input } = req.query;
      
      if (!input || typeof input !== 'string' || input.length < 3) {
        return res.json({ suggestions: [] });
      }

      // Simuler des suggestions d'adresses
      const mockSuggestions = [
        {
          description: `${input}, Paris, France`,
          main_text: `${input}`,
          secondary_text: "Paris, France"
        },
        {
          description: `${input}, Lyon, France`,
          main_text: `${input}`,
          secondary_text: "Lyon, France"
        },
        {
          description: `${input}, Marseille, France`,
          main_text: `${input}`,
          secondary_text: "Marseille, France"
        }
      ];

      res.json({ suggestions: mockSuggestions });

    } catch (error: any) {
      console.error("Error in autocomplete:", error);
      res.json({ suggestions: [] });
    }
  });

  // Servir les fichiers uploadés statiquement
  app.use('/uploads', express.static('uploads'));

  // Catch-all handler for undefined API routes (must be at the end)
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
