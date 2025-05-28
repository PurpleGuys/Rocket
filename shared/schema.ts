import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // customer, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  volume: integer("volume").notNull(), // in m³
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  wasteTypes: text("waste_types").array(),
  maxWeight: integer("max_weight"), // in tonnes
  isActive: boolean("is_active").default(true),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
  maxBookings: integer("max_bookings").default(5),
  currentBookings: integer("current_bookings").default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id"),
  serviceId: integer("service_id").notNull(),
  deliveryTimeSlotId: integer("delivery_time_slot_id"),
  pickupTimeSlotId: integer("pickup_time_slot_id"),
  
  // Customer info (for guest checkout)
  customerFirstName: text("customer_first_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  
  // Delivery address
  deliveryStreet: text("delivery_street").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryPostalCode: text("delivery_postal_code").notNull(),
  deliveryCountry: text("delivery_country").default("FR"),
  deliveryNotes: text("delivery_notes"),
  
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  durationPrice: decimal("duration_price", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  totalHT: decimal("total_ht", { precision: 10, scale: 2 }).notNull(),
  vat: decimal("vat", { precision: 10, scale: 2 }).notNull(),
  totalTTC: decimal("total_ttc", { precision: 10, scale: 2 }).notNull(),
  
  // Order status
  status: text("status").notNull().default("pending"), // pending, confirmed, delivered, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Selected waste types
  wasteTypes: text("waste_types").array(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id],
  }),
  deliveryTimeSlot: one(timeSlots, {
    fields: [orders.deliveryTimeSlotId],
    references: [timeSlots.id],
  }),
  pickupTimeSlot: one(timeSlots, {
    fields: [orders.pickupTimeSlotId],
    references: [timeSlots.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  orders: many(orders),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
