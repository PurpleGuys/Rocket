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
  // Type de compte et informations professionnelles
  accountType: text("account_type").notNull().default("particulier"), // particulier, professionnel
  companyName: text("company_name"),
  siret: text("siret"),
  tvaNumber: text("tva_number"),
  apeCode: text("ape_code"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("FR"),
  preferredLanguage: text("preferred_language").default("fr"),
  marketingConsent: boolean("marketing_consent").default(false),
  isActive: boolean("is_active").default(true),
  profilePicture: text("profile_picture"),
  // Notification settings for sales team
  notifyOnInactivity: boolean("notify_on_inactivity").default(true),
  lastInactivityNotification: timestamp("last_inactivity_notification"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  volume: integer("volume").notNull(), // in m³
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  length: decimal("length", { precision: 5, scale: 2 }), // en mètres
  width: decimal("width", { precision: 5, scale: 2 }), // en mètres
  height: decimal("height", { precision: 5, scale: 2 }), // en mètres
  wasteTypes: text("waste_types").array(),
  maxWeight: integer("max_weight"), // in tonnes
  includedServices: text("included_services").array().default([]), // Services inclus
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceImages = pgTable("service_images", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  imageType: text("image_type").notNull(), // 'face', 'side_right', 'side_left', 'with_person', 'back'
  altText: text("alt_text"),
  isMain: boolean("is_main").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
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
  
  // Delivery location type and address
  deliveryLocationType: text("delivery_location_type").notNull().default("company"), // "company" or "construction_site"
  deliveryStreet: text("delivery_street").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryPostalCode: text("delivery_postal_code").notNull(),
  deliveryCountry: text("delivery_country").default("FR"),
  deliveryNotes: text("delivery_notes"),
  
  // Construction site specific contact info
  constructionSiteContactPhone: text("construction_site_contact_phone"), // Required if deliveryLocationType is "construction_site"
  
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
  
  // Post-order management and delivery date workflow
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  confirmedDeliveryDate: timestamp("confirmed_delivery_date"),
  proposedDeliveryDate: timestamp("proposed_delivery_date"), // Date proposée par l'admin
  clientValidationStatus: text("client_validation_status").default("pending"), // pending, accepted, rejected
  clientValidationToken: text("client_validation_token"), // Token unique pour validation client
  clientValidationExpiresAt: timestamp("client_validation_expires_at"),
  deliveryDateValidatedBy: integer("delivery_date_validated_by"), // Admin qui a validé/proposé
  deliveryDateValidatedAt: timestamp("delivery_date_validated_at"),
  adminValidatedBy: integer("admin_validated_by"),
  adminValidatedAt: timestamp("admin_validated_at"),
  confirmationEmailSent: boolean("confirmation_email_sent").default(false),
  validationEmailSent: boolean("validation_email_sent").default(false),
  deliveryDateProposalEmailSent: boolean("delivery_date_proposal_email_sent").default(false),
  adminNotes: text("admin_notes"),
  
  // Selected waste types
  wasteTypes: text("waste_types").array(),
  
  // BSD Option (Bordereau de Suivi des Déchets)
  bsdOption: boolean("bsd_option").default(false),
  bsdPrice: decimal("bsd_price", { precision: 10, scale: 2 }).default("0"),
  
  // FID (Fiche d'Identification des Déchets) - required when BSD option is selected
  fidRequired: boolean("fid_required").default(false),
  fidCompleted: boolean("fid_completed").default(false),
  fidValidated: boolean("fid_validated").default(false),
  fidValidatedBy: integer("fid_validated_by"), // Admin qui a validé la FID
  fidValidatedAt: timestamp("fid_validated_at"),
  fidData: jsonb("fid_data"), // Données de la FID au format JSON
  
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
  images: many(serviceImages),
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, {
    fields: [serviceImages.serviceId],
    references: [services.id],
  }),
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

// Table pour les tarifs de location quotidiens avec seuils progressifs
export const rentalPricing = pgTable("rental_pricing", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(), // Prix par jour en €
  billingStartDay: integer("billing_start_day").notNull().default(0), // Jour à partir duquel la facturation commence (0 = dès le premier jour)
  maxTonnage: decimal("max_tonnage", { precision: 10, scale: 2 }).notNull().default("0"), // Tonnage maximum de la benne en tonnes
  
  // Tarification progressive par durée
  durationThreshold1: integer("duration_threshold_1").default(7), // Premier seuil (ex: 7 jours)
  durationSupplement1: decimal("duration_supplement_1", { precision: 10, scale: 2 }).default("0"), // Supplément après seuil 1
  durationThreshold2: integer("duration_threshold_2").default(14), // Deuxième seuil (ex: 14 jours) 
  durationSupplement2: decimal("duration_supplement_2", { precision: 10, scale: 2 }).default("0"), // Supplément après seuil 2
  durationThreshold3: integer("duration_threshold_3").default(30), // Troisième seuil (ex: 30 jours)
  durationSupplement3: decimal("duration_supplement_3", { precision: 10, scale: 2 }).default("0"), // Supplément après seuil 3
  
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

// Table pour les empreintes bancaires
export const bankDeposits = pgTable("bank_deposits", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  wasteTypeId: integer("waste_type_id").notNull().references(() => wasteTypes.id, { onDelete: "cascade" }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(), // Montant de l'empreinte en €
  description: text("description"), // Description de l'empreinte
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table pour suivre les commandes abandonnées
export const abandonedCheckouts = pgTable("abandoned_checkouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceName: text("service_name"),
  deliveryAddress: text("delivery_address"),
  deliveryCity: text("delivery_city"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  checkoutData: jsonb("checkout_data").$type<{
    deliveryDate?: string;
    pickupDate?: string;
    specialInstructions?: string;
    wasteTypes?: string[];
    estimatedWeight?: number;
  }>(),
  abandonedAt: timestamp("abandoned_at").defaultNow().notNull(),
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table pour suivre les notifications d'inactivité
export const inactivityNotifications = pgTable("inactivity_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastLoginDate: timestamp("last_login_date"),
  orderHistory: jsonb("order_history").$type<{
    totalOrders: number;
    lastOrderDate: Date | null;
    totalAmount: number;
    services: string[];
  }>().notNull(),
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const insertServiceImageSchema = createInsertSchema(serviceImages).omit({
  id: true,
  createdAt: true,
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

export const insertAbandonedCheckoutSchema = createInsertSchema(abandonedCheckouts).omit({
  id: true,
  createdAt: true,
});

export const insertInactivityNotificationSchema = createInsertSchema(inactivityNotifications).omit({
  id: true,
  createdAt: true,
});

// Relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const abandonedCheckoutsRelations = relations(abandonedCheckouts, ({ one }) => ({
  user: one(users, {
    fields: [abandonedCheckouts.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [abandonedCheckouts.serviceId],
    references: [services.id],
  }),
}));

export const inactivityNotificationsRelations = relations(inactivityNotifications, ({ one }) => ({
  user: one(users, {
    fields: [inactivityNotifications.userId],
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
export type ServiceImage = typeof serviceImages.$inferSelect;
export type InsertServiceImage = z.infer<typeof insertServiceImageSchema>;
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

export type AbandonedCheckout = typeof abandonedCheckouts.$inferSelect;
export type InsertAbandonedCheckout = z.infer<typeof insertAbandonedCheckoutSchema>;

export type InactivityNotification = typeof inactivityNotifications.$inferSelect;
export type InsertInactivityNotification = z.infer<typeof insertInactivityNotificationSchema>;

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

export const insertBankDepositSchema = createInsertSchema(bankDeposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBankDepositSchema = createInsertSchema(bankDeposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CompanyActivities = typeof companyActivities.$inferSelect;
export type InsertCompanyActivities = z.infer<typeof insertCompanyActivitiesSchema>;
export type UpdateCompanyActivities = z.infer<typeof updateCompanyActivitiesSchema>;

export type BankDeposit = typeof bankDeposits.$inferSelect;
export type InsertBankDeposit = z.infer<typeof insertBankDepositSchema>;
export type UpdateBankDeposit = z.infer<typeof updateBankDepositSchema>;

// FID (Fiche d'Identification des Déchets) table
export const fids = pgTable("fids", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // 1. Coordonnées client
  clientCompanyName: text("client_company_name").notNull(),
  clientContactName: text("client_contact_name").notNull(),
  clientAddress: text("client_address").notNull(),
  clientVatNumber: text("client_vat_number"),
  clientPhone: text("client_phone").notNull(),
  clientEmail: text("client_email").notNull(),
  clientSiret: text("client_siret").notNull(),
  clientActivity: text("client_activity").notNull(),
  
  // 2. Producteur
  sameAsClient: boolean("same_as_client").default(true),
  producerCompanyName: text("producer_company_name"),
  producerContactName: text("producer_contact_name"),
  producerAddress: text("producer_address"),
  producerVatNumber: text("producer_vat_number"),
  producerPhone: text("producer_phone"),
  producerEmail: text("producer_email"),
  producerSiret: text("producer_siret"),
  producerActivity: text("producer_activity"),
  
  // 3. Information déchet
  wasteName: text("waste_name").notNull(),
  nomenclatureCode: text("nomenclature_code").notNull(),
  annualQuantity: text("annual_quantity").notNull(),
  collectionFrequency: text("collection_frequency").notNull(),
  
  // Procédé ayant généré le déchet
  generationProcess: jsonb("generation_process").$type<{
    destockage: boolean;
    depollution: boolean;
    production: boolean;
    fabricationIncident: boolean;
    other: boolean;
    otherText: string;
  }>().notNull(),
  
  // Conditionnement
  packaging: jsonb("packaging").$type<{
    containers: boolean;
    smallConfinements: boolean;
    drums200L: boolean;
    bigBag: boolean;
    other: boolean;
    otherText: string;
  }>().notNull(),
  
  // Aspect physique
  physicalAspect: jsonb("physical_aspect").$type<{
    liquid: boolean;
    solid: boolean;
    pasty: boolean;
    powdery: boolean;
    gas: boolean;
    other: boolean;
    otherText: string;
  }>().notNull(),
  
  // 4. Constituants principaux
  constituents: jsonb("constituents").$type<Array<{
    name: string;
    percentage: string;
  }>>().notNull(),
  
  // 5. Nature du déchet (HP1 à HP15)
  hazardousProperties: jsonb("hazardous_properties").$type<{
    hp1: boolean;
    hp2: boolean;
    hp3: boolean;
    hp4: boolean;
    hp5: boolean;
    hp6: boolean;
    hp7: boolean;
    hp8: boolean;
    hp9: boolean;
    hp10: boolean;
    hp11: boolean;
    hp12: boolean;
    hp13: boolean;
    hp14: boolean;
    hp15: boolean;
  }>().notNull(),
  
  // 6. Déchet POP (PFAS)
  isPop: boolean("is_pop").default(false),
  popSubstances: text("pop_substances"),
  
  // 7. Absence d'information
  lackOfInformation: boolean("lack_of_information").default(false),
  
  // 8. Transport
  transportResponsible: text("transport_responsible").notNull(), // client, remondis, others
  dangerClass: text("danger_class"),
  unCode: text("un_code"),
  packagingGroup: text("packaging_group"),
  transportDesignation: text("transport_designation"),
  
  // Fichiers joints
  attachedFiles: jsonb("attached_files").$type<Array<{
    filename: string;
    url: string;
    fileType: string;
    uploadedAt: string;
  }>>().default([]),
  
  // Validation
  status: text("status").notNull().default("pending"), // pending, validated, rejected, modified
  validatedBy: integer("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  rejectionReason: text("rejection_reason"),
  adminComments: text("admin_comments"),
  
  // RGPD
  rgpdConsent: boolean("rgpd_consent").notNull().default(false),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email logs table for audit trail
export const emailLogs = pgTable("email_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  emailType: text("email_type").notNull(), // 'confirmation', 'validation', 'update'
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  emailContent: text("email_content"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull().default("sent"), // 'sent', 'failed', 'pending'
  errorMessage: text("error_message"),
  sentBy: integer("sent_by"), // admin user ID if manual send
});

// Audit logs table for tracking admin actions
export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  action: text("action").notNull(), // 'order_created', 'delivery_date_updated', 'status_changed', etc.
  entityType: text("entity_type").notNull(), // 'order', 'user', 'setting'
  entityId: integer("entity_id"),
  oldValues: text("old_values"), // JSON string of old values
  newValues: text("new_values"), // JSON string of new values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// FID relations
export const fidsRelations = relations(fids, ({ one }) => ({
  user: one(users, {
    fields: [fids.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [fids.orderId],
    references: [orders.id],
  }),
  validatedByUser: one(users, {
    fields: [fids.validatedBy],
    references: [users.id],
  }),
}));

// Email logs relations
export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  order: one(orders, {
    fields: [emailLogs.orderId],
    references: [orders.id],
  }),
  sentByUser: one(users, {
    fields: [emailLogs.sentBy],
    references: [users.id],
  }),
}));

// Audit logs relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [auditLogs.orderId],
    references: [orders.id],
  }),
}));

// Email logs schemas
export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// FID schemas
export const insertFidSchema = createInsertSchema(fids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  validatedBy: true,
  validatedAt: true,
});

export const updateFidSchema = createInsertSchema(fids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export type Fid = typeof fids.$inferSelect;
export type InsertFid = z.infer<typeof insertFidSchema>;
export type UpdateFid = z.infer<typeof updateFidSchema>;

// Table des questionnaires de satisfaction
export const satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), // Token unique pour accéder au questionnaire
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull(), // Expire après 30 jours
  
  // Questions et réponses du questionnaire
  overallSatisfaction: integer("overall_satisfaction"), // 1-5 étoiles
  serviceQuality: integer("service_quality"), // 1-5 étoiles
  deliveryTiming: integer("delivery_timing"), // 1-5 étoiles
  pickupTiming: integer("pickup_timing"), // 1-5 étoiles
  customerService: integer("customer_service"), // 1-5 étoiles
  valueForMoney: integer("value_for_money"), // 1-5 étoiles
  
  // Questions ouvertes
  positiveComments: text("positive_comments"),
  negativeComments: text("negative_comments"),
  suggestions: text("suggestions"),
  
  // Recommandation Net Promoter Score
  npsScore: integer("nps_score"), // 0-10
  
  // Fidélisation
  wouldUseAgain: boolean("would_use_again"),
  wouldRecommend: boolean("would_recommend"),
  
  // Métadonnées
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  responseTimeSeconds: integer("response_time_seconds"), // Temps pour remplir le questionnaire
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table pour les notifications de questionnaire (suivi des envois)
export const surveyNotifications = pgTable("survey_notifications", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => satisfactionSurveys.id, { onDelete: "cascade" }),
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  reminderCount: integer("reminder_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations pour les questionnaires
export const satisfactionSurveysRelations = relations(satisfactionSurveys, ({ one }) => ({
  order: one(orders, {
    fields: [satisfactionSurveys.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [satisfactionSurveys.userId],
    references: [users.id],
  }),
}));

export const surveyNotificationsRelations = relations(surveyNotifications, ({ one }) => ({
  survey: one(satisfactionSurveys, {
    fields: [surveyNotifications.surveyId],
    references: [satisfactionSurveys.id],
  }),
}));

// Schémas Zod simplifiés pour éviter les timeouts
export const insertSatisfactionSurveySchema = z.object({
  orderId: z.number(),
  userId: z.number().optional(),
  surveyToken: z.string(),
  overallSatisfaction: z.number().min(1).max(5),
  serviceQuality: z.number().min(1).max(5),
  deliveryTiming: z.number().min(1).max(5),
  pickupTiming: z.number().min(1).max(5),
  customerService: z.number().min(1).max(5),
  valueForMoney: z.number().min(1).max(5),
  positiveComments: z.string().optional(),
  negativeComments: z.string().optional(),
  suggestions: z.string().optional(),
  npsScore: z.number().min(0).max(10),
  wouldUseAgain: z.boolean(),
  wouldRecommend: z.boolean(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const insertSurveyNotificationSchema = z.object({
  surveyId: z.number(),
  reminderSent: z.boolean().default(false),
  reminderCount: z.number().default(0),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
export type InsertSatisfactionSurvey = z.infer<typeof insertSatisfactionSurveySchema>;
export type SurveyNotification = typeof surveyNotifications.$inferSelect;
export type InsertSurveyNotification = z.infer<typeof insertSurveyNotificationSchema>;
