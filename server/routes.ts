import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { AuthService, authenticateToken, requireAdmin } from "./auth";
import { DistanceService } from "./distanceService";
import { insertOrderSchema, insertUserSchema, loginSchema, updateUserSchema, changePasswordSchema, insertRentalPricingSchema, updateRentalPricingSchema, insertServiceSchema, insertTransportPricingSchema, updateTransportPricingSchema, insertWasteTypeSchema, insertTreatmentPricingSchema, updateTreatmentPricingSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia" as any,
});

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
}) : (req: any, res: any, next: any) => next();

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware - relaxed for development
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    // Development: disable CSP to allow Vite and Replit scripts
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
  }
  
  // Only enable rate limiting in production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
    app.use(generalLimiter);
  }

  // ==================== AUTH ROUTES ====================
  
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
      const { password, verificationToken, resetPasswordToken, twoFactorSecret, ...safeUser } = req.user!;
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
      });

      // Update time slot bookings
      if (orderData.deliveryTimeSlotId) {
        await storage.updateTimeSlotBookings(orderData.deliveryTimeSlotId, 1);
      }
      if (orderData.pickupTimeSlotId) {
        await storage.updateTimeSlotBookings(orderData.pickupTimeSlotId, 1);
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
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { serviceId, wasteTypes, address, postalCode, city } = req.body;

      if (!serviceId || !address || !postalCode || !city) {
        return res.status(400).json({ 
          success: false, 
          message: "Service ID et adresse complète requis" 
        });
      }

      // Récupérer la tarification transport
      const transportPricing = await storage.getTransportPricing();
      if (!transportPricing) {
        return res.status(404).json({ 
          success: false, 
          message: "Tarification transport non configurée" 
        });
      }

      // Récupérer les activités pour l'adresse du site industriel
      const companyActivities = await storage.getCompanyActivities();
      if (!companyActivities || !companyActivities.industrialSiteAddress) {
        return res.status(400).json({ 
          success: false, 
          message: "Adresse du site industriel non configurée" 
        });
      }

      const customerAddress = `${address}, ${postalCode} ${city}`;
      const industrialAddress = companyActivities.industrialSiteAddress;

      try {
        // Calculer la distance réelle avec Google Maps
        const distanceResult = await DistanceService.calculateDistance(
          industrialAddress,
          customerAddress
        );

        // Calculer le coût de transport
        const transportCost = DistanceService.calculateTransportCost(
          distanceResult.distance,
          parseFloat(transportPricing.pricePerKm),
          parseFloat(transportPricing.minimumFlatRate)
        );

        res.json({
          success: true,
          distance: {
            kilometers: distanceResult.distance,
            duration: distanceResult.duration
          },
          transportCost: transportCost,
          addresses: {
            customer: customerAddress,
            industrial: industrialAddress
          }
        });

      } catch (distanceError: any) {
        console.error("Erreur calcul distance Google Maps:", distanceError);
        
        // Utiliser une distance estimée par défaut
        const estimatedDistance = 15;
        const transportCost = DistanceService.calculateTransportCost(
          estimatedDistance,
          parseFloat(transportPricing.pricePerKm),
          parseFloat(transportPricing.minimumFlatRate)
        );

        res.json({
          success: true,
          distance: {
            kilometers: estimatedDistance,
            duration: 30,
            estimated: true
          },
          transportCost: transportCost,
          warning: "Distance estimée - Erreur API Google Maps"
        });
      }

    } catch (error: any) {
      console.error("Erreur calcul pricing:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors du calcul de tarification: " + error.message 
      });
    }
  });

  // Calculate distance between addresses
  app.post("/api/calculate-distance", async (req, res) => {
    try {
      const { customerAddress, industrialAddress } = req.body;

      if (!customerAddress || !industrialAddress) {
        return res.status(400).json({ 
          message: "Adresses du client et du site industriel requises" 
        });
      }

      const result = await DistanceService.calculateDistance(customerAddress, industrialAddress);
      
      res.json({
        success: true,
        distance: result.distance,
        duration: result.duration,
        roundTripDistance: result.distance * 2
      });
    } catch (error: any) {
      console.error("Erreur calcul distance:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Erreur lors du calcul de distance"
      });
    }
  });

  // Calculate pricing with real distance
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { serviceId, wasteTypes, address, postalCode, city } = req.body;

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

      // Get company activities for industrial site address
      const activities = await storage.getCompanyActivities();
      if (!activities || !activities.industrialSiteAddress) {
        return res.status(400).json({ 
          message: "Adresse du site industriel non configurée. Veuillez configurer l'adresse dans 'Mes activités'." 
        });
      }

      let totalPrice = service.basePrice;
      let breakdown = {
        service: service.basePrice,
        transport: 0,
        treatment: 0,
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
        totalPrice += transportCost;

        // Add treatment costs for each waste type
        for (const wasteTypeName of wasteTypes) {
          const wasteType = await storage.getWasteTypes();
          const wasteTypeObj = wasteType.find(wt => wt.name === wasteTypeName);
          
          if (wasteTypeObj) {
            const treatmentPricing = await storage.getTreatmentPricingByWasteTypeId(wasteTypeObj.id);
            if (treatmentPricing) {
              const treatmentCost = parseFloat(treatmentPricing.pricePerTon);
              breakdown.treatment += treatmentCost;
              totalPrice += treatmentCost;
            }
          }
        }

        breakdown.total = totalPrice;

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

        // Add treatment costs for each waste type
        for (const wasteTypeName of wasteTypes) {
          const wasteType = await storage.getWasteTypes();
          const wasteTypeObj = wasteType.find(wt => wt.name === wasteTypeName);
          
          if (wasteTypeObj) {
            const treatmentPricing = await storage.getTreatmentPricingByWasteTypeId(wasteTypeObj.id);
            if (treatmentPricing) {
              const treatmentCost = parseFloat(treatmentPricing.pricePerTon);
              breakdown.treatment += treatmentCost;
              totalPrice += treatmentCost;
            }
          }
        }

        breakdown.total = totalPrice;

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
          }
        });
      }
    } catch (error: any) {
      console.error("Erreur calcul prix:", error);
      res.status(500).json({ message: "Erreur lors du calcul du prix: " + error.message });
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

  const httpServer = createServer(app);
  return httpServer;
}
