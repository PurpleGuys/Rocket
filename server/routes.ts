import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { AuthService, authenticateToken, requireAdmin } from "./auth";
import { insertOrderSchema, insertUserSchema, loginSchema, updateUserSchema, changePasswordSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia" as any,
});

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: "Trop de requêtes. Réessayez plus tard." },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet());
  app.use(generalLimiter);

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
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders(100);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
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

  const httpServer = createServer(app);
  return httpServer;
}
