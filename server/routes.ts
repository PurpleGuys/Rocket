import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertOrderSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
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
