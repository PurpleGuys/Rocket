import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("customer"), // customer, admin
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  lastLogin: timestamp("last_login"),
  loginAttempts: integer("login_attempts").default(0),
  lockUntil: timestamp("lock_until"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  companyName: text("company_name"),
  siret: text("siret"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("FR"),
  preferredLanguage: text("preferred_language").default("fr"),
  marketingConsent: boolean("marketing_consent").default(false),
  isActive: boolean("is_active").default(true),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Add session table for secure session management
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

// Table pour les tarifs de location quotidiens
export const rentalPricing = pgTable("rental_pricing", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(), // Prix par jour en €
  billingStartDay: integer("billing_start_day").notNull().default(0), // Jour à partir duquel la facturation commence (0 = dès le premier jour)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table pour les tarifs de transport
export const transportPricing = pgTable("transport_pricing", {
  id: serial("id").primaryKey(),
  // Tarification kilométrique
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull().default("0"), // Prix par km aller-retour en €
  minimumFlatRate: decimal("minimum_flat_rate", { precision: 10, scale: 2 }).notNull().default("0"), // Prix forfaitaire minimum en €
  // Chargement immédiat
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull().default("0"), // Prix horaire en €
  immediateLoadingEnabled: boolean("immediate_loading_enabled").default(true), // Désactivé si prix horaire = 0
  // Métadonnées
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table pour les matières/déchets
export const wasteTypes = pgTable("waste_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Nom de la matière (ex: "Gravats", "Bois", etc.)
  description: text("description"), // Description détaillée
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table pour les tarifs de traitement
export const treatmentPricing = pgTable("treatment_pricing", {
  id: serial("id").primaryKey(),
  wasteTypeId: integer("waste_type_id").notNull().references(() => wasteTypes.id, { onDelete: "cascade" }),
  pricePerTon: decimal("price_per_ton", { precision: 10, scale: 2 }).notNull(), // Prix par tonne en €
  treatmentType: varchar("treatment_type", { length: 100 }).notNull(), // Type de traitement
  treatmentCode: varchar("treatment_code", { length: 10 }).notNull(), // Code traitement (D1-D15, R1-R12)
  outletAddress: text("outlet_address"), // Adresse exutoire
  isManualTreatment: boolean("is_manual_treatment").default(false), // Manuel ou automatique
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  verificationToken: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  lastLogin: true,
  loginAttempts: true,
  lockUntil: true,
  twoFactorSecret: true,
}).extend({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  verificationToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional(),
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  verificationToken: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  lastLogin: true,
  loginAttempts: true,
  lockUntil: true,
  twoFactorSecret: true,
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "Confirmation du mot de passe requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
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

export const insertRentalPricingSchema = createInsertSchema(rentalPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRentalPricingSchema = createInsertSchema(rentalPricing).omit({
  id: true,
  serviceId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransportPricingSchema = createInsertSchema(transportPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTransportPricingSchema = createInsertSchema(transportPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWasteTypeSchema = createInsertSchema(wasteTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTreatmentPricingSchema = createInsertSchema(treatmentPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTreatmentPricingSchema = createInsertSchema(treatmentPricing).omit({
  id: true,
  wasteTypeId: true,
  createdAt: true,
  updatedAt: true,
});

// Relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type Session = typeof sessions.$inferSelect;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type RentalPricing = typeof rentalPricing.$inferSelect;
export type InsertRentalPricing = z.infer<typeof insertRentalPricingSchema>;
export type UpdateRentalPricing = z.infer<typeof updateRentalPricingSchema>;
export type TransportPricing = typeof transportPricing.$inferSelect;
export type InsertTransportPricing = z.infer<typeof insertTransportPricingSchema>;
export type UpdateTransportPricing = z.infer<typeof updateTransportPricingSchema>;
export type WasteType = typeof wasteTypes.$inferSelect;
export type InsertWasteType = z.infer<typeof insertWasteTypeSchema>;
export type TreatmentPricing = typeof treatmentPricing.$inferSelect;
export type InsertTreatmentPricing = z.infer<typeof insertTreatmentPricingSchema>;
export type UpdateTreatmentPricing = z.infer<typeof updateTreatmentPricingSchema>;

// Company Activities Configuration
export const companyActivities = pgTable("company_activities", {
  id: serial("id").primaryKey(),
  // Services configuration
  collecteBenne: boolean("collecte_benne").default(false),
  collecteBac: boolean("collecte_bac").default(false),
  collecteVrac: boolean("collecte_vrac").default(false),
  collecteBigBag: boolean("collecte_big_bag").default(false),
  collecteSacGravats: boolean("collecte_sac_gravats").default(false),
  collecteHuileFriture: boolean("collecte_huile_friture").default(false),
  collecteDechetsBureaux: boolean("collecte_dechets_bureaux").default(false),
  
  // Waste types configuration
  wasteTypes: jsonb("waste_types").$type<string[]>().default([]),
  
  // Equipment configuration
  equipmentMultibenne: jsonb("equipment_multibenne").$type<string[]>().default([]),
  equipmentAmpliroll: jsonb("equipment_ampliroll").$type<string[]>().default([]),
  equipmentCaissePalette: jsonb("equipment_caisse_palette").$type<string[]>().default([]),
  equipmentRolls: jsonb("equipment_rolls").$type<string[]>().default([]),
  equipmentContenantAlimentaire: jsonb("equipment_contenant_alimentaire").$type<string[]>().default([]),
  equipmentBac: jsonb("equipment_bac").$type<string[]>().default([]),
  equipmentBennesFermees: jsonb("equipment_bennes_fermees").$type<string[]>().default([]),
  
  // Pricing configuration
  prixForfaitEnabled: boolean("prix_forfait_enabled").default(false),
  
  // Industrial site address for distance calculation
  industrialSiteAddress: text("industrial_site_address"),
  industrialSiteCity: text("industrial_site_city"),
  industrialSitePostalCode: text("industrial_site_postal_code"),
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCompanyActivitiesSchema = createInsertSchema(companyActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCompanyActivitiesSchema = createInsertSchema(companyActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CompanyActivities = typeof companyActivities.$inferSelect;
export type InsertCompanyActivities = z.infer<typeof insertCompanyActivitiesSchema>;
export type UpdateCompanyActivities = z.infer<typeof updateCompanyActivitiesSchema>;
