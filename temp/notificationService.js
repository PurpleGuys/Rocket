var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  abandonedCheckouts: () => abandonedCheckouts,
  abandonedCheckoutsRelations: () => abandonedCheckoutsRelations,
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  bankDeposits: () => bankDeposits,
  changePasswordSchema: () => changePasswordSchema,
  companyActivities: () => companyActivities,
  emailLogs: () => emailLogs,
  emailLogsRelations: () => emailLogsRelations,
  fids: () => fids,
  fidsRelations: () => fidsRelations,
  inactivityNotifications: () => inactivityNotifications,
  inactivityNotificationsRelations: () => inactivityNotificationsRelations,
  insertAbandonedCheckoutSchema: () => insertAbandonedCheckoutSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBankDepositSchema: () => insertBankDepositSchema,
  insertCompanyActivitiesSchema: () => insertCompanyActivitiesSchema,
  insertEmailLogSchema: () => insertEmailLogSchema,
  insertFidSchema: () => insertFidSchema,
  insertInactivityNotificationSchema: () => insertInactivityNotificationSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertRentalPricingSchema: () => insertRentalPricingSchema,
  insertSatisfactionSurveySchema: () => insertSatisfactionSurveySchema,
  insertServiceImageSchema: () => insertServiceImageSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertSurveyNotificationSchema: () => insertSurveyNotificationSchema,
  insertTimeSlotSchema: () => insertTimeSlotSchema,
  insertTransportPricingSchema: () => insertTransportPricingSchema,
  insertTreatmentPricingSchema: () => insertTreatmentPricingSchema,
  insertUserSchema: () => insertUserSchema,
  insertWasteTypeSchema: () => insertWasteTypeSchema,
  loginSchema: () => loginSchema,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  rentalPricing: () => rentalPricing,
  satisfactionSurveys: () => satisfactionSurveys,
  satisfactionSurveysRelations: () => satisfactionSurveysRelations,
  serviceImages: () => serviceImages,
  serviceImagesRelations: () => serviceImagesRelations,
  services: () => services,
  servicesRelations: () => servicesRelations,
  sessions: () => sessions,
  sessionsRelations: () => sessionsRelations,
  surveyNotifications: () => surveyNotifications,
  surveyNotificationsRelations: () => surveyNotificationsRelations,
  timeSlots: () => timeSlots,
  transportPricing: () => transportPricing,
  treatmentPricing: () => treatmentPricing,
  updateBankDepositSchema: () => updateBankDepositSchema,
  updateCompanyActivitiesSchema: () => updateCompanyActivitiesSchema,
  updateFidSchema: () => updateFidSchema,
  updateRentalPricingSchema: () => updateRentalPricingSchema,
  updateTransportPricingSchema: () => updateTransportPricingSchema,
  updateTreatmentPricingSchema: () => updateTreatmentPricingSchema,
  updateUserSchema: () => updateUserSchema,
  users: () => users,
  usersRelations: () => usersRelations,
  wasteTypes: () => wasteTypes
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("customer"),
  // customer, admin
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
  accountType: text("account_type").notNull().default("particulier"),
  // particulier, professionnel
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  volume: integer("volume").notNull(),
  // in m³
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  length: decimal("length", { precision: 5, scale: 2 }),
  // en mètres
  width: decimal("width", { precision: 5, scale: 2 }),
  // en mètres
  height: decimal("height", { precision: 5, scale: 2 }),
  // en mètres
  wasteTypes: text("waste_types").array(),
  maxWeight: integer("max_weight"),
  // in tonnes
  includedServices: text("included_services").array().default([]),
  // Services inclus
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var serviceImages = pgTable("service_images", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  imageType: text("image_type").notNull(),
  // 'face', 'side_right', 'side_left', 'with_person', 'back'
  altText: text("alt_text"),
  isMain: boolean("is_main").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  // YYYY-MM-DD format
  startTime: text("start_time").notNull(),
  // HH:MM format
  endTime: text("end_time").notNull(),
  // HH:MM format
  isAvailable: boolean("is_available").default(true),
  maxBookings: integer("max_bookings").default(5),
  currentBookings: integer("current_bookings").default(0)
});
var orders = pgTable("orders", {
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
  deliveryLocationType: text("delivery_location_type").notNull().default("company"),
  // "company" or "construction_site"
  deliveryStreet: text("delivery_street").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryPostalCode: text("delivery_postal_code").notNull(),
  deliveryCountry: text("delivery_country").default("FR"),
  deliveryNotes: text("delivery_notes"),
  // Construction site specific contact info
  constructionSiteContactPhone: text("construction_site_contact_phone"),
  // Required if deliveryLocationType is "construction_site"
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  durationPrice: decimal("duration_price", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  totalHT: decimal("total_ht", { precision: 10, scale: 2 }).notNull(),
  vat: decimal("vat", { precision: 10, scale: 2 }).notNull(),
  totalTTC: decimal("total_ttc", { precision: 10, scale: 2 }).notNull(),
  // Order status
  status: text("status").notNull().default("pending"),
  // pending, confirmed, delivered, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending, paid, failed, refunded
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  // Post-order management and delivery date workflow
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  confirmedDeliveryDate: timestamp("confirmed_delivery_date"),
  proposedDeliveryDate: timestamp("proposed_delivery_date"),
  // Date proposée par l'admin
  clientValidationStatus: text("client_validation_status").default("pending"),
  // pending, accepted, rejected
  clientValidationToken: text("client_validation_token"),
  // Token unique pour validation client
  clientValidationExpiresAt: timestamp("client_validation_expires_at"),
  deliveryDateValidatedBy: integer("delivery_date_validated_by"),
  // Admin qui a validé/proposé
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
  fidValidatedBy: integer("fid_validated_by"),
  // Admin qui a validé la FID
  fidValidatedAt: timestamp("fid_validated_at"),
  fidData: jsonb("fid_data"),
  // Données de la FID au format JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id]
  }),
  deliveryTimeSlot: one(timeSlots, {
    fields: [orders.deliveryTimeSlotId],
    references: [timeSlots.id]
  }),
  pickupTimeSlot: one(timeSlots, {
    fields: [orders.pickupTimeSlotId],
    references: [timeSlots.id]
  })
}));
var usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));
var servicesRelations = relations(services, ({ many }) => ({
  orders: many(orders),
  images: many(serviceImages)
}));
var serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, {
    fields: [serviceImages.serviceId],
    references: [services.id]
  })
}));
var sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address")
});
var rentalPricing = pgTable("rental_pricing", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  // Prix par jour en €
  billingStartDay: integer("billing_start_day").notNull().default(0),
  // Jour à partir duquel la facturation commence (0 = dès le premier jour)
  maxTonnage: decimal("max_tonnage", { precision: 10, scale: 2 }).notNull().default("0"),
  // Tonnage maximum de la benne en tonnes
  // Tarification progressive par durée
  durationThreshold1: integer("duration_threshold_1").default(7),
  // Premier seuil (ex: 7 jours)
  durationSupplement1: decimal("duration_supplement_1", { precision: 10, scale: 2 }).default("0"),
  // Supplément après seuil 1
  durationThreshold2: integer("duration_threshold_2").default(14),
  // Deuxième seuil (ex: 14 jours) 
  durationSupplement2: decimal("duration_supplement_2", { precision: 10, scale: 2 }).default("0"),
  // Supplément après seuil 2
  durationThreshold3: integer("duration_threshold_3").default(30),
  // Troisième seuil (ex: 30 jours)
  durationSupplement3: decimal("duration_supplement_3", { precision: 10, scale: 2 }).default("0"),
  // Supplément après seuil 3
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var transportPricing = pgTable("transport_pricing", {
  id: serial("id").primaryKey(),
  // Tarification kilométrique
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull().default("0"),
  // Prix par km aller-retour en €
  minimumFlatRate: decimal("minimum_flat_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  // Prix forfaitaire minimum en €
  // Chargement immédiat
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  // Prix horaire en €
  immediateLoadingEnabled: boolean("immediate_loading_enabled").default(true),
  // Désactivé si prix horaire = 0
  // Métadonnées
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var wasteTypes = pgTable("waste_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // Nom de la matière (ex: "Gravats", "Bois", etc.)
  description: text("description"),
  // Description détaillée
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var treatmentPricing = pgTable("treatment_pricing", {
  id: serial("id").primaryKey(),
  wasteTypeId: integer("waste_type_id").notNull().references(() => wasteTypes.id, { onDelete: "cascade" }),
  pricePerTon: decimal("price_per_ton", { precision: 10, scale: 2 }).notNull(),
  // Prix par tonne en €
  treatmentType: varchar("treatment_type", { length: 100 }).notNull(),
  // Type de traitement
  treatmentCode: varchar("treatment_code", { length: 10 }).notNull(),
  // Code traitement (D1-D15, R1-R12)
  outletAddress: text("outlet_address"),
  // Adresse exutoire
  isManualTreatment: boolean("is_manual_treatment").default(false),
  // Manuel ou automatique
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var bankDeposits = pgTable("bank_deposits", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  wasteTypeId: integer("waste_type_id").notNull().references(() => wasteTypes.id, { onDelete: "cascade" }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  // Montant de l'empreinte en €
  description: text("description"),
  // Description de l'empreinte
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var abandonedCheckouts = pgTable("abandoned_checkouts", {
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
  checkoutData: jsonb("checkout_data").$type(),
  abandonedAt: timestamp("abandoned_at").defaultNow().notNull(),
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var inactivityNotifications = pgTable("inactivity_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastLoginDate: timestamp("last_login_date"),
  orderHistory: jsonb("order_history").$type().notNull(),
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
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
  twoFactorSecret: true
}).extend({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(10, "Num\xE9ro de t\xE9l\xE9phone invalide"),
  verificationToken: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional()
});
var updateUserSchema = createInsertSchema(users).omit({
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
  twoFactorSecret: true
}).partial();
var changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caract\xE8res"),
  confirmPassword: z.string().min(1, "Confirmation du mot de passe requise")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});
var insertServiceSchema = createInsertSchema(services).omit({
  id: true
});
var insertServiceImageSchema = createInsertSchema(serviceImages).omit({
  id: true,
  createdAt: true
});
var insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true
});
var insertRentalPricingSchema = createInsertSchema(rentalPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateRentalPricingSchema = createInsertSchema(rentalPricing).omit({
  id: true,
  serviceId: true,
  createdAt: true,
  updatedAt: true
});
var insertTransportPricingSchema = createInsertSchema(transportPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateTransportPricingSchema = createInsertSchema(transportPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertWasteTypeSchema = createInsertSchema(wasteTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTreatmentPricingSchema = createInsertSchema(treatmentPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateTreatmentPricingSchema = createInsertSchema(treatmentPricing).omit({
  id: true,
  wasteTypeId: true,
  createdAt: true,
  updatedAt: true
});
var insertAbandonedCheckoutSchema = createInsertSchema(abandonedCheckouts).omit({
  id: true,
  createdAt: true
});
var insertInactivityNotificationSchema = createInsertSchema(inactivityNotifications).omit({
  id: true,
  createdAt: true
});
var sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));
var abandonedCheckoutsRelations = relations(abandonedCheckouts, ({ one }) => ({
  user: one(users, {
    fields: [abandonedCheckouts.userId],
    references: [users.id]
  }),
  service: one(services, {
    fields: [abandonedCheckouts.serviceId],
    references: [services.id]
  })
}));
var inactivityNotificationsRelations = relations(inactivityNotifications, ({ one }) => ({
  user: one(users, {
    fields: [inactivityNotifications.userId],
    references: [users.id]
  })
}));
var companyActivities = pgTable("company_activities", {
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
  wasteTypes: jsonb("waste_types").$type().default([]),
  // Equipment configuration
  equipmentMultibenne: jsonb("equipment_multibenne").$type().default([]),
  equipmentAmpliroll: jsonb("equipment_ampliroll").$type().default([]),
  equipmentCaissePalette: jsonb("equipment_caisse_palette").$type().default([]),
  equipmentRolls: jsonb("equipment_rolls").$type().default([]),
  equipmentContenantAlimentaire: jsonb("equipment_contenant_alimentaire").$type().default([]),
  equipmentBac: jsonb("equipment_bac").$type().default([]),
  equipmentBennesFermees: jsonb("equipment_bennes_fermees").$type().default([]),
  // Pricing configuration
  prixForfaitEnabled: boolean("prix_forfait_enabled").default(false),
  // Industrial site address for distance calculation
  industrialSiteAddress: text("industrial_site_address"),
  industrialSiteCity: text("industrial_site_city"),
  industrialSitePostalCode: text("industrial_site_postal_code"),
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCompanyActivitiesSchema = createInsertSchema(companyActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateCompanyActivitiesSchema = createInsertSchema(companyActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBankDepositSchema = createInsertSchema(bankDeposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateBankDepositSchema = createInsertSchema(bankDeposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var fids = pgTable("fids", {
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
  generationProcess: jsonb("generation_process").$type().notNull(),
  // Conditionnement
  packaging: jsonb("packaging").$type().notNull(),
  // Aspect physique
  physicalAspect: jsonb("physical_aspect").$type().notNull(),
  // 4. Constituants principaux
  constituents: jsonb("constituents").$type().notNull(),
  // 5. Nature du déchet (HP1 à HP15)
  hazardousProperties: jsonb("hazardous_properties").$type().notNull(),
  // 6. Déchet POP (PFAS)
  isPop: boolean("is_pop").default(false),
  popSubstances: text("pop_substances"),
  // 7. Absence d'information
  lackOfInformation: boolean("lack_of_information").default(false),
  // 8. Transport
  transportResponsible: text("transport_responsible").notNull(),
  // client, remondis, others
  dangerClass: text("danger_class"),
  unCode: text("un_code"),
  packagingGroup: text("packaging_group"),
  transportDesignation: text("transport_designation"),
  // Fichiers joints
  attachedFiles: jsonb("attached_files").$type().default([]),
  // Validation
  status: text("status").notNull().default("pending"),
  // pending, validated, rejected, modified
  validatedBy: integer("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  rejectionReason: text("rejection_reason"),
  adminComments: text("admin_comments"),
  // RGPD
  rgpdConsent: boolean("rgpd_consent").notNull().default(false),
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var emailLogs = pgTable("email_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  emailType: text("email_type").notNull(),
  // 'confirmation', 'validation', 'update'
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  emailContent: text("email_content"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull().default("sent"),
  // 'sent', 'failed', 'pending'
  errorMessage: text("error_message"),
  sentBy: integer("sent_by")
  // admin user ID if manual send
});
var auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  action: text("action").notNull(),
  // 'order_created', 'delivery_date_updated', 'status_changed', etc.
  entityType: text("entity_type").notNull(),
  // 'order', 'user', 'setting'
  entityId: integer("entity_id"),
  oldValues: text("old_values"),
  // JSON string of old values
  newValues: text("new_values"),
  // JSON string of new values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fidsRelations = relations(fids, ({ one }) => ({
  user: one(users, {
    fields: [fids.userId],
    references: [users.id]
  }),
  order: one(orders, {
    fields: [fids.orderId],
    references: [orders.id]
  }),
  validatedByUser: one(users, {
    fields: [fids.validatedBy],
    references: [users.id]
  })
}));
var emailLogsRelations = relations(emailLogs, ({ one }) => ({
  order: one(orders, {
    fields: [emailLogs.orderId],
    references: [orders.id]
  }),
  sentByUser: one(users, {
    fields: [emailLogs.sentBy],
    references: [users.id]
  })
}));
var auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id]
  }),
  order: one(orders, {
    fields: [auditLogs.orderId],
    references: [orders.id]
  })
}));
var insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});
var insertFidSchema = createInsertSchema(fids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  validatedBy: true,
  validatedAt: true
});
var updateFidSchema = createInsertSchema(fids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true
});
var satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  // Token unique pour accéder au questionnaire
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull(),
  // Expire après 30 jours
  // Questions et réponses du questionnaire
  overallSatisfaction: integer("overall_satisfaction"),
  // 1-5 étoiles
  serviceQuality: integer("service_quality"),
  // 1-5 étoiles
  deliveryTiming: integer("delivery_timing"),
  // 1-5 étoiles
  pickupTiming: integer("pickup_timing"),
  // 1-5 étoiles
  customerService: integer("customer_service"),
  // 1-5 étoiles
  valueForMoney: integer("value_for_money"),
  // 1-5 étoiles
  // Questions ouvertes
  positiveComments: text("positive_comments"),
  negativeComments: text("negative_comments"),
  suggestions: text("suggestions"),
  // Recommandation Net Promoter Score
  npsScore: integer("nps_score"),
  // 0-10
  // Fidélisation
  wouldUseAgain: boolean("would_use_again"),
  wouldRecommend: boolean("would_recommend"),
  // Métadonnées
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  responseTimeSeconds: integer("response_time_seconds"),
  // Temps pour remplir le questionnaire
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var surveyNotifications = pgTable("survey_notifications", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => satisfactionSurveys.id, { onDelete: "cascade" }),
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  reminderCount: integer("reminder_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var satisfactionSurveysRelations = relations(satisfactionSurveys, ({ one }) => ({
  order: one(orders, {
    fields: [satisfactionSurveys.orderId],
    references: [orders.id]
  }),
  user: one(users, {
    fields: [satisfactionSurveys.userId],
    references: [users.id]
  })
}));
var surveyNotificationsRelations = relations(surveyNotifications, ({ one }) => ({
  survey: one(satisfactionSurveys, {
    fields: [surveyNotifications.surveyId],
    references: [satisfactionSurveys.id]
  })
}));
var insertSatisfactionSurveySchema = z.object({
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
  userAgent: z.string().optional()
});
var insertSurveyNotificationSchema = z.object({
  surveyId: z.number(),
  reminderSent: z.boolean().default(false),
  reminderCount: z.number().default(0)
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/sendgridService.ts
import sgMail from "@sendgrid/mail";
var SendGridService = class {
  isConfigured = false;
  fromEmail = process.env.SENDGRID_VERIFIED_SENDER_EMAIL || "noreply@gmail.com";
  constructor() {
    this.initialize();
  }
  initialize() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn("SendGrid API key not configured. Email sending will be disabled.");
      return;
    }
    sgMail.setApiKey(apiKey);
    this.isConfigured = true;
    console.log("SendGrid email service initialized successfully.");
  }
  async sendVerificationEmail(user, verificationToken) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000";
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
      const template = this.generateVerificationTemplate(user, verificationUrl);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      console.log("Attempting to send verification email to:", user.email);
      console.log("From email:", this.fromEmail);
      await sgMail.send(msg);
      console.log("Verification email sent successfully to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      console.error("SendGrid error details:", error.response?.body || error.message);
      return false;
    }
  }
  async sendPasswordResetEmail(user, resetToken) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      const template = this.generatePasswordResetTemplate(user, resetUrl);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Password reset email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }
  async sendWelcomeEmail(user) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const template = this.generateWelcomeTemplate(user);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Welcome email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }
  async sendOrderConfirmationEmail(order, user) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const template = this.generateOrderConfirmationTemplate(order, user);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Order confirmation email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return false;
    }
  }
  async sendDeliveryDateConfirmedEmail(order, user) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const template = this.generateDeliveryDateConfirmedTemplate(order, user);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Delivery date confirmed email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending delivery date confirmed email:", error);
      return false;
    }
  }
  async sendDeliveryDateProposalEmail(order, user, validationToken) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const template = this.generateDeliveryDateProposalTemplate(order, user, validationToken);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Delivery date proposal email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending delivery date proposal email:", error);
      return false;
    }
  }
  async sendDeliveryDateAcceptedEmail(order, user) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const template = this.generateDeliveryDateAcceptedTemplate(order, user);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Delivery date accepted email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending delivery date accepted email:", error);
      return false;
    }
  }
  async sendDeliveryDateRejectedEmail(order, user) {
    if (!this.isConfigured) {
      console.error("SendGrid not configured");
      return false;
    }
    try {
      const template = this.generateDeliveryDateRejectedTemplate(order, user);
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };
      await sgMail.send(msg);
      console.log("Delivery date rejected email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending delivery date rejected email:", error);
      return false;
    }
  }
  generateVerificationTemplate(user, verificationUrl) {
    const subject = "V\xE9rifiez votre adresse email - REMONDIS France";
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>V\xE9rification d'email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>V\xE9rification de votre compte</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || "Cher client"},</h2>
          <p>Merci de vous \xEAtre inscrit sur notre plateforme REMONDIS France. Pour finaliser votre inscription et acc\xE9der \xE0 tous nos services de collecte et traitement de d\xE9chets, veuillez v\xE9rifier votre adresse email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">V\xE9rifier mon email</a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
          
          <p><strong>Ce lien expirera dans 24 heures.</strong></p>
          
          <p>Si vous n'avez pas cr\xE9\xE9 de compte sur notre plateforme, vous pouvez ignorer cet email.</p>
          
          <p>Cordialement,<br>L'\xE9quipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Cet email a \xE9t\xE9 envoy\xE9 automatiquement, merci de ne pas y r\xE9pondre.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    const text2 = `
    V\xE9rification de votre compte REMONDIS France
    
    Bonjour ${user.firstName || "Cher client"},
    
    Merci de vous \xEAtre inscrit sur notre plateforme REMONDIS France. Pour finaliser votre inscription, veuillez v\xE9rifier votre adresse email en cliquant sur le lien suivant :
    
    ${verificationUrl}
    
    Ce lien expirera dans 24 heures.
    
    Si vous n'avez pas cr\xE9\xE9 de compte, vous pouvez ignorer cet email.
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generatePasswordResetTemplate(user, resetUrl) {
    const subject = "R\xE9initialisation de votre mot de passe - REMONDIS France";
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>R\xE9initialisation mot de passe</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        .warning { background: #fef3cd; border: 1px solid #faebcc; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>R\xE9initialisation de mot de passe</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || "Cher client"},</h2>
          <p>Vous avez demand\xE9 la r\xE9initialisation de votre mot de passe pour votre compte REMONDIS France.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">R\xE9initialiser mon mot de passe</a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>Important :</strong> Ce lien expirera dans 1 heure pour des raisons de s\xE9curit\xE9.
          </div>
          
          <p>Si vous n'avez pas demand\xE9 cette r\xE9initialisation, vous pouvez ignorer cet email. Votre mot de passe actuel restera inchang\xE9.</p>
          
          <p>Pour votre s\xE9curit\xE9, nous vous recommandons de :</p>
          <ul>
            <li>Choisir un mot de passe fort et unique</li>
            <li>Ne pas partager vos identifiants</li>
            <li>Vous d\xE9connecter apr\xE8s chaque session</li>
          </ul>
          
          <p>Cordialement,<br>L'\xE9quipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Cet email a \xE9t\xE9 envoy\xE9 automatiquement, merci de ne pas y r\xE9pondre.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    const text2 = `
    R\xE9initialisation de votre mot de passe REMONDIS France
    
    Bonjour ${user.firstName || "Cher client"},
    
    Vous avez demand\xE9 la r\xE9initialisation de votre mot de passe. Cliquez sur le lien suivant pour d\xE9finir un nouveau mot de passe :
    
    ${resetUrl}
    
    Ce lien expirera dans 1 heure pour des raisons de s\xE9curit\xE9.
    
    Si vous n'avez pas demand\xE9 cette r\xE9initialisation, ignorez cet email.
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generateWelcomeTemplate(user) {
    const subject = "Bienvenue chez REMONDIS France !";
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue chez REMONDIS</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        .services { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>Bienvenue chez REMONDIS France !</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || "Cher client"},</h2>
          <p>F\xE9licitations ! Votre compte REMONDIS France a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s. Nous sommes ravis de vous compter parmi nos clients.</p>
          
          <div class="services">
            <h3>Nos services \xE0 votre disposition :</h3>
            <ul>
              <li><strong>Location de bennes</strong> - Diff\xE9rentes tailles selon vos besoins</li>
              <li><strong>Collecte de d\xE9chets</strong> - Service r\xE9gulier ou ponctuel</li>
              <li><strong>Traitement sp\xE9cialis\xE9</strong> - D\xE9chets dangereux et non dangereux</li>
              <li><strong>Conseil environnemental</strong> - Optimisation de votre gestion des d\xE9chets</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5000"}/dashboard" class="button">Acc\xE9der \xE0 mon espace</a>
          </div>
          
          <p>Votre espace client vous permet de :</p>
          <ul>
            <li>Commander nos services en ligne</li>
            <li>Suivre vos commandes en temps r\xE9el</li>
            <li>Consulter vos factures</li>
            <li>G\xE9rer vos abonnements</li>
          </ul>
          
          <p>Notre \xE9quipe reste \xE0 votre disposition pour toute question. N'h\xE9sitez pas \xE0 nous contacter.</p>
          
          <p>Cordialement,<br>L'\xE9quipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>T\xE9l\xE9phone : 03 44 45 11 58 | Email : contact@remondis.fr</p>
        </div>
      </div>
    </body>
    </html>
    `;
    const text2 = `
    Bienvenue chez REMONDIS France !
    
    Bonjour ${user.firstName || "Cher client"},
    
    F\xE9licitations ! Votre compte REMONDIS France a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s.
    
    Nos services \xE0 votre disposition :
    - Location de bennes
    - Collecte de d\xE9chets
    - Traitement sp\xE9cialis\xE9
    - Conseil environnemental
    
    Acc\xE9dez \xE0 votre espace client : ${process.env.FRONTEND_URL || "http://localhost:5000"}/dashboard
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generateOrderConfirmationTemplate(order, user) {
    const subject = `Confirmation de commande #${order.orderNumber} - REMONDIS France`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>Commande confirm\xE9e</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || "Cher client"},</h2>
          <p>Nous avons bien re\xE7u votre commande et nous vous en remercions.</p>
          
          <div class="order-details">
            <h3>D\xE9tails de votre commande</h3>
            <p><strong>Num\xE9ro de commande :</strong> ${order.orderNumber}</p>
            <p><strong>Date de commande :</strong> ${new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
            <p><strong>Montant total :</strong> ${order.totalTTC || order.basePrice}\u20AC</p>
            <p><strong>Statut :</strong> En attente de traitement</p>
          </div>
          
          <p>Votre commande sera trait\xE9e dans les plus brefs d\xE9lais. Vous recevrez une confirmation de livraison d\xE8s que votre commande sera valid\xE9e par nos \xE9quipes.</p>
          
          <p>Vous pouvez suivre l'\xE9tat de votre commande depuis votre espace client.</p>
          
          <p>Cordialement,<br>L'\xE9quipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>T\xE9l\xE9phone : 03 44 45 11 58 | Email : contact@remondis.fr</p>
        </div>
      </div>
    </body>
    </html>
    `;
    const text2 = `
    Confirmation de commande #${order.orderNumber} - REMONDIS France
    
    Bonjour ${user.firstName || "Cher client"},
    
    Nous avons bien re\xE7u votre commande.
    
    D\xE9tails :
    - Num\xE9ro : ${order.orderNumber}
    - Date : ${new Date(order.createdAt).toLocaleDateString("fr-FR")}
    - Montant : ${order.totalTTC || order.basePrice}\u20AC
    - Statut : En attente de traitement
    
    Vous recevrez une confirmation de livraison d\xE8s validation.
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generateDeliveryDateConfirmedTemplate(order, user) {
    const subject = `Date de livraison confirm\xE9e - Commande ${order.orderNumber}`;
    const deliveryDate = new Date(order.deliveryDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Date de livraison confirm\xE9e</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .date-box { background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u2713 Date de livraison confirm\xE9e</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Bonne nouvelle ! La date de livraison de votre commande <strong>${order.orderNumber}</strong> a \xE9t\xE9 confirm\xE9e.</p>
          
          <div class="date-box">
            <h3 style="margin: 0; color: #16a34a;">\u{1F4C5} Livraison pr\xE9vue le</h3>
            <p style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #16a34a;">${deliveryDate}</p>
          </div>
          
          <p>Votre benne sera livr\xE9e \xE0 l'adresse :</p>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
            <strong>${order.deliveryStreet}<br>
            ${order.deliveryPostalCode} ${order.deliveryCity}</strong>
          </p>
          
          <p>Merci de vous assurer qu'une personne soit pr\xE9sente pour r\xE9ceptionner la benne \xE0 la date convenue.</p>
          
          <p>Cordialement,<br>L'\xE9quipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des d\xE9chets professionnelle<br>
          Email : contact@remondis.fr | T\xE9l\xE9phone : 03 44 45 11 58</p>
        </div>
      </div>
    </body>
    </html>`;
    const text2 = `
    Date de livraison confirm\xE9e - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Bonne nouvelle ! La date de livraison de votre commande ${order.orderNumber} a \xE9t\xE9 confirm\xE9e.
    
    Livraison pr\xE9vue le : ${deliveryDate}
    
    Adresse de livraison :
    ${order.deliveryStreet}
    ${order.deliveryPostalCode} ${order.deliveryCity}
    
    Merci de vous assurer qu'une personne soit pr\xE9sente pour r\xE9ceptionner la benne.
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generateDeliveryDateProposalTemplate(order, user, validationToken) {
    const subject = `Nouvelle date de livraison propos\xE9e - Commande ${order.orderNumber}`;
    const proposedDate = new Date(order.proposedDeliveryDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const acceptUrl = `${process.env.FRONTEND_URL || "https://remondis-app.replit.app"}/validate-delivery?token=${validationToken}&action=accept`;
    const rejectUrl = `${process.env.FRONTEND_URL || "https://remondis-app.replit.app"}/validate-delivery?token=${validationToken}&action=reject`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle date de livraison propos\xE9e</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .date-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
        .accept { background: #059669; color: white; }
        .reject { background: #dc2626; color: white; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouvelle date de livraison propos\xE9e</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Nous vous proposons une nouvelle date de livraison pour votre commande <strong>${order.orderNumber}</strong>.</p>
          
          <div class="date-box">
            <h3 style="margin: 0; color: #f59e0b;">Nouvelle date propos\xE9e</h3>
            <p style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #f59e0b;">${proposedDate}</p>
          </div>
          
          <p>Merci de nous indiquer si cette nouvelle date vous convient en cliquant sur l'un des boutons ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" class="button accept">\u2713 J'accepte cette date</a>
            <a href="${rejectUrl}" class="button reject">\u2717 Je refuse cette date</a>
          </div>
          
          <p><strong>D\xE9tails de la commande :</strong></p>
          <ul>
            <li>Num\xE9ro de commande : ${order.orderNumber}</li>
            <li>Adresse de livraison : ${order.deliveryStreet}, ${order.deliveryPostalCode} ${order.deliveryCity}</li>
          </ul>
          
          <p><em>Ce lien expire dans 7 jours. Si vous ne r\xE9pondez pas d'ici l\xE0, vous devrez nous contacter directement.</em></p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des d\xE9chets professionnelle<br>
          Email : contact@remondis.fr | T\xE9l\xE9phone : 03 44 45 11 58</p>
        </div>
      </div>
    </body>
    </html>`;
    const text2 = `
    Nouvelle date de livraison propos\xE9e - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Nous vous proposons une nouvelle date de livraison pour votre commande ${order.orderNumber}.
    
    Nouvelle date propos\xE9e : ${proposedDate}
    
    Pour accepter cette date : ${acceptUrl}
    Pour refuser cette date : ${rejectUrl}
    
    Ce lien expire dans 7 jours.
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generateDeliveryDateAcceptedTemplate(order, user) {
    const subject = `Date de livraison accept\xE9e - Commande ${order.orderNumber}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Date de livraison accept\xE9e</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .success-box { background: #d1fae5; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u2713 Date accept\xE9e</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Merci d'avoir accept\xE9 la nouvelle date de livraison pour votre commande <strong>${order.orderNumber}</strong>.</p>
          
          <div class="success-box">
            <h3 style="margin: 0; color: #059669;">Date confirm\xE9e</h3>
            <p style="margin: 10px 0;">Votre livraison est maintenant programm\xE9e et confirm\xE9e.</p>
          </div>
          
          <p>Vous recevrez un email de confirmation final avec tous les d\xE9tails de livraison.</p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des d\xE9chets professionnelle</p>
        </div>
      </div>
    </body>
    </html>`;
    const text2 = `
    Date de livraison accept\xE9e - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Merci d'avoir accept\xE9 la nouvelle date de livraison pour votre commande ${order.orderNumber}.
    
    Votre livraison est maintenant programm\xE9e et confirm\xE9e.
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  generateDeliveryDateRejectedTemplate(order, user) {
    const subject = `Date de livraison refus\xE9e - Commande ${order.orderNumber}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Date de livraison refus\xE9e</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .info-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Date refus\xE9e</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Nous avons bien not\xE9 que vous avez refus\xE9 la date de livraison propos\xE9e pour votre commande <strong>${order.orderNumber}</strong>.</p>
          
          <div class="info-box">
            <h3 style="margin: 0; color: #dc2626;">Prochaines \xE9tapes</h3>
            <p style="margin: 10px 0;">Notre \xE9quipe va vous proposer une nouvelle date de livraison sous 48h.</p>
          </div>
          
          <p>Vous pouvez \xE9galement nous contacter directement pour discuter d'une date qui vous conviendrait mieux.</p>
          
          <p><strong>Contact :</strong><br>
          Email : contact@remondis.fr<br>
          T\xE9l\xE9phone : 03 44 45 11 58</p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des d\xE9chets professionnelle</p>
        </div>
      </div>
    </body>
    </html>`;
    const text2 = `
    Date de livraison refus\xE9e - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Nous avons bien not\xE9 que vous avez refus\xE9 la date de livraison propos\xE9e pour votre commande ${order.orderNumber}.
    
    Notre \xE9quipe va vous proposer une nouvelle date de livraison sous 48h.
    
    Contact :
    Email : contact@remondis.fr
    T\xE9l\xE9phone : 03 44 45 11 58
    
    Cordialement,
    L'\xE9quipe REMONDIS France
    `;
    return { subject, html, text: text2 };
  }
  /**
   * Envoie une notification à l'équipe commerciale pour un utilisateur inactif
   */
  async sendInactiveUserNotification(user, orderHistory, salesEmail) {
    if (!this.isConfigured) {
      console.log("SendGrid not configured, skipping inactive user notification");
      return false;
    }
    try {
      const template = this.generateInactiveUserNotificationTemplate(user, orderHistory);
      await sgMail.send({
        to: salesEmail,
        from: this.fromEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      console.log(`Inactive user notification sent to ${salesEmail} for user ${user.email}`);
      return true;
    } catch (error) {
      console.error("Error sending inactive user notification:", error);
      return false;
    }
  }
  /**
   * Envoie une notification à l'équipe commerciale pour une commande abandonnée
   */
  async sendAbandonedCheckoutNotification(abandonedCheckout, salesEmail) {
    if (!this.isConfigured) {
      console.log("SendGrid not configured, skipping abandoned checkout notification");
      return false;
    }
    try {
      const template = this.generateAbandonedCheckoutNotificationTemplate(abandonedCheckout);
      await sgMail.send({
        to: salesEmail,
        from: this.fromEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      console.log(`Abandoned checkout notification sent to ${salesEmail} for customer ${abandonedCheckout.customerEmail}`);
      return true;
    } catch (error) {
      console.error("Error sending abandoned checkout notification:", error);
      return false;
    }
  }
  /**
   * Template pour notification d'utilisateur inactif
   */
  generateInactiveUserNotificationTemplate(user, orderHistory) {
    const lastLoginFormatted = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "Jamais connect\xE9";
    const lastOrderFormatted = orderHistory.lastOrderDate ? new Date(orderHistory.lastOrderDate).toLocaleDateString("fr-FR") : "Aucune commande";
    const subject = `Alerte Client Inactif - ${user.firstName} ${user.lastName}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Client Inactif</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .history-box { background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .action-box { background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u26A0\uFE0F Alerte Client Inactif</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Un client n'a pas utilis\xE9 nos services depuis plus d'un mois.</strong></p>
          </div>
          
          <div class="info-box">
            <h3>Informations Client :</h3>
            <p><strong>Nom :</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email :</strong> ${user.email}</p>
            <p><strong>T\xE9l\xE9phone :</strong> ${user.phone || "Non renseign\xE9"}</p>
            <p><strong>Entreprise :</strong> ${user.companyName || "Non renseign\xE9e"}</p>
            <p><strong>Derni\xE8re connexion :</strong> ${lastLoginFormatted}</p>
          </div>

          <div class="history-box">
            <h3>Historique des commandes :</h3>
            <p><strong>Nombre total de commandes :</strong> ${orderHistory.totalOrders}</p>
            <p><strong>Derni\xE8re commande :</strong> ${lastOrderFormatted}</p>
            <p><strong>Montant total :</strong> ${orderHistory.totalAmount.toFixed(2)} \u20AC</p>
            ${orderHistory.services.length > 0 ? `<p><strong>Services utilis\xE9s :</strong> ${orderHistory.services.join(", ")}</p>` : ""}
          </div>
          
          <div class="action-box">
            <h3>Action recommand\xE9e :</h3>
            <p>Nous vous recommandons de contacter ce client pour :</p>
            <ul>
              <li>V\xE9rifier s'il a des besoins actuels</li>
              <li>Lui proposer nos nouveaux services</li>
              <li>Maintenir la relation commerciale</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Notification automatique - Syst\xE8me de gestion des clients REMONDIS</p>
        </div>
      </div>
    </body>
    </html>`;
    const text2 = `
    ALERTE CLIENT INACTIF

    Un client n'a pas utilis\xE9 nos services depuis plus d'un mois :

    Informations Client :
    Nom : ${user.firstName} ${user.lastName}
    Email : ${user.email}
    T\xE9l\xE9phone : ${user.phone || "Non renseign\xE9"}
    Entreprise : ${user.companyName || "Non renseign\xE9e"}
    Derni\xE8re connexion : ${lastLoginFormatted}

    Historique des commandes :
    Nombre total : ${orderHistory.totalOrders}
    Derni\xE8re commande : ${lastOrderFormatted}
    Montant total : ${orderHistory.totalAmount.toFixed(2)} \u20AC
    Services utilis\xE9s : ${orderHistory.services.join(", ")}

    Action recommand\xE9e :
    Contacter ce client pour v\xE9rifier ses besoins actuels et maintenir la relation commerciale.
    `;
    return { subject, html, text: text2 };
  }
  /**
   * Template pour notification de commande abandonnée
   */
  generateAbandonedCheckoutNotificationTemplate(abandonedCheckout) {
    const wasteTypesText = abandonedCheckout.wasteTypes ? abandonedCheckout.wasteTypes.join(", ") : "Non sp\xE9cifi\xE9s";
    const subject = `Commande abandonn\xE9e - ${abandonedCheckout.customerFirstName} ${abandonedCheckout.customerLastName}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande Abandonn\xE9e</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-box { background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .action-box { background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F6D2} Commande Abandonn\xE9e</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Un client a abandonn\xE9 sa commande lors du tunnel de paiement.</strong></p>
          </div>
          
          <div class="info-box">
            <h3>Informations Client :</h3>
            <p><strong>Nom :</strong> ${abandonedCheckout.customerFirstName} ${abandonedCheckout.customerLastName}</p>
            <p><strong>Email :</strong> ${abandonedCheckout.customerEmail}</p>
            <p><strong>T\xE9l\xE9phone :</strong> ${abandonedCheckout.customerPhone || "Non renseign\xE9"}</p>
          </div>

          <div class="order-box">
            <h3>D\xE9tails de la commande abandonn\xE9e :</h3>
            <p><strong>Service :</strong> ${abandonedCheckout.serviceName || "Non sp\xE9cifi\xE9"}</p>
            <p><strong>Montant :</strong> ${abandonedCheckout.totalAmount ? `${abandonedCheckout.totalAmount} \u20AC` : "Non calcul\xE9"}</p>
            <p><strong>Dur\xE9e :</strong> ${abandonedCheckout.durationDays ? `${abandonedCheckout.durationDays} jours` : "Non sp\xE9cifi\xE9e"}</p>
            <p><strong>Types de d\xE9chets :</strong> ${wasteTypesText}</p>
            <p><strong>Adresse de livraison :</strong> ${abandonedCheckout.deliveryAddress || "Non renseign\xE9e"}</p>
            ${abandonedCheckout.deliveryCity ? `<p><strong>Ville :</strong> ${abandonedCheckout.deliveryCity} ${abandonedCheckout.deliveryPostalCode || ""}</p>` : ""}
          </div>
          
          <div class="action-box">
            <h3>Action recommand\xE9e :</h3>
            <p>Contactez rapidement ce client pour :</p>
            <ul>
              <li>Comprendre les raisons de l'abandon</li>
              <li>L'aider \xE0 finaliser sa commande</li>
              <li>Proposer des solutions adapt\xE9es</li>
              <li>R\xE9cup\xE9rer cette vente potentielle</li>
            </ul>
          </div>
          
          <p><small>Date d'abandon : ${new Date(abandonedCheckout.createdAt).toLocaleString("fr-FR")}</small></p>
        </div>
        <div class="footer">
          <p>Notification automatique - Syst\xE8me de gestion des commandes REMONDIS</p>
        </div>
      </div>
    </body>
    </html>`;
    const text2 = `
    COMMANDE ABANDONN\xC9E

    Un client a abandonn\xE9 sa commande lors du paiement :

    Informations Client :
    Nom : ${abandonedCheckout.customerFirstName} ${abandonedCheckout.customerLastName}
    Email : ${abandonedCheckout.customerEmail}
    T\xE9l\xE9phone : ${abandonedCheckout.customerPhone || "Non renseign\xE9"}

    D\xE9tails de la commande :
    Service : ${abandonedCheckout.serviceName || "Non sp\xE9cifi\xE9"}
    Montant : ${abandonedCheckout.totalAmount ? `${abandonedCheckout.totalAmount} \u20AC` : "Non calcul\xE9"}
    Dur\xE9e : ${abandonedCheckout.durationDays ? `${abandonedCheckout.durationDays} jours` : "Non sp\xE9cifi\xE9e"}
    Types de d\xE9chets : ${wasteTypesText}
    Adresse : ${abandonedCheckout.deliveryAddress || "Non renseign\xE9e"}

    Action recommand\xE9e :
    Contacter ce client rapidement pour comprendre les raisons de l'abandon et l'aider \xE0 finaliser sa commande.

    Date d'abandon : ${new Date(abandonedCheckout.createdAt).toLocaleString("fr-FR")}
    `;
    return { subject, html, text: text2 };
  }
  // Envoyer un questionnaire de satisfaction
  async sendSatisfactionSurveyEmail(to, data) {
    const subject = `Votre avis nous int\xE9resse - Commande ${data.orderNumber}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Questionnaire de satisfaction</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #e5e7eb; padding: 20px; font-size: 12px; color: #6b7280; }
          .stars { color: #fbbf24; font-size: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u{1F4CB} Questionnaire de Satisfaction</h1>
            <p>Votre avis compte pour nous !</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.firstName} ${data.lastName},</h2>
            
            <p>Nous esp\xE9rons que notre service de location de bennes pour votre commande <strong>${data.orderNumber}</strong> vous a donn\xE9 enti\xE8re satisfaction.</p>
            
            <p>Afin d'am\xE9liorer continuellement nos services, nous aimerions conna\xEEtre votre avis sur votre exp\xE9rience r\xE9cente avec Remondis.</p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3>\u{1F3AF} Votre avis en 2 minutes</h3>
              <p>Ce questionnaire ne vous prendra que quelques minutes et nous aidera \xE0 :</p>
              <ul>
                <li>\u2705 Am\xE9liorer la qualit\xE9 de nos services</li>
                <li>\u2705 Optimiser nos d\xE9lais de livraison et collecte</li>
                <li>\u2705 Mieux r\xE9pondre \xE0 vos besoins futurs</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.surveyUrl}" class="button">\u{1F680} R\xE9pondre au questionnaire</a>
            </div>
            
            <p><strong>\u23F0 Important :</strong> Ce questionnaire est disponible jusqu'au ${data.expiryDate.toLocaleDateString("fr-FR")}.</p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>\u{1F381} Merci pour votre fid\xE9lit\xE9 !</strong></p>
              <p>Vos r\xE9ponses nous aident \xE0 vous offrir le meilleur service possible. En tant que client fid\xE8le, votre satisfaction est notre priorit\xE9.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Cet email concerne votre commande ${data.orderNumber}. Si vous avez des questions, contactez-nous \xE0 contact@remondis.fr</p>
            <p>Remondis - Solutions durables pour la gestion des d\xE9chets</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const text2 = `
Bonjour ${data.firstName} ${data.lastName},

Nous esp\xE9rons que notre service de location de bennes pour votre commande ${data.orderNumber} vous a donn\xE9 enti\xE8re satisfaction.

Afin d'am\xE9liorer continuellement nos services, nous aimerions conna\xEEtre votre avis sur votre exp\xE9rience r\xE9cente avec Remondis.

R\xE9pondez \xE0 notre questionnaire en cliquant sur ce lien : ${data.surveyUrl}

Ce questionnaire est disponible jusqu'au ${data.expiryDate.toLocaleDateString("fr-FR")}.

Merci pour votre temps et votre fid\xE9lit\xE9 !

L'\xE9quipe Remondis
    `;
    return await this.sendEmailNotification({
      to,
      from: "satisfaction@remondis.fr",
      subject,
      text: text2,
      html
    });
  }
  // Envoyer un rappel de questionnaire de satisfaction
  async sendSatisfactionSurveyReminder(to, data) {
    const subject = `\u23F0 Rappel - Votre avis nous int\xE9resse - Commande ${data.orderNumber}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rappel - Questionnaire de satisfaction</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #e5e7eb; padding: 20px; font-size: 12px; color: #6b7280; }
          .urgent { background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u23F0 Rappel Important</h1>
            <p>Votre questionnaire expire bient\xF4t !</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.firstName} ${data.lastName},</h2>
            
            <p>Nous vous avions r\xE9cemment envoy\xE9 un questionnaire de satisfaction concernant votre commande <strong>${data.orderNumber}</strong>.</p>
            
            <div class="urgent">
              <h3>\u26A0\uFE0F Derni\xE8re chance !</h3>
              <p>Votre questionnaire expire le <strong>${data.expiryDate.toLocaleDateString("fr-FR")}</strong>. Ne manquez pas cette opportunit\xE9 de nous faire part de votre exp\xE9rience.</p>
            </div>
            
            <p>Vos commentaires sont pr\xE9cieux pour nous aider \xE0 am\xE9liorer nos services. Cela ne prend que 2 minutes !</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.surveyUrl}" class="button">\u{1F525} R\xE9pondre maintenant</a>
            </div>
            
            <p>Merci de prendre quelques instants pour partager votre avis.</p>
          </div>
          
          <div class="footer">
            <p>Cet email concerne votre commande ${data.orderNumber}. Si vous avez des questions, contactez-nous \xE0 contact@remondis.fr</p>
            <p>Remondis - Solutions durables pour la gestion des d\xE9chets</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const text2 = `
Bonjour ${data.firstName} ${data.lastName},

RAPPEL - Votre questionnaire de satisfaction expire bient\xF4t !

Nous vous avions r\xE9cemment envoy\xE9 un questionnaire concernant votre commande ${data.orderNumber}.

Votre questionnaire expire le ${data.expiryDate.toLocaleDateString("fr-FR")}.

R\xE9pondez maintenant : ${data.surveyUrl}

Merci pour votre temps !

L'\xE9quipe Remondis
    `;
    return await this.sendEmailNotification({
      to,
      from: "satisfaction@remondis.fr",
      subject,
      text: text2,
      html
    });
  }
};
var sendGridService = new SendGridService();

// server/notificationService.ts
import { eq, lt, and, isNull, desc, or } from "drizzle-orm";
var NotificationService = class {
  static INACTIVITY_THRESHOLD_DAYS = 30;
  static REMONDIS_SALES_EMAIL = process.env.REMONDIS_SALES_EMAIL || "commercial@remondis.fr";
  /**
   * Vérifie et envoie des notifications pour les utilisateurs inactifs depuis 1 mois
   */
  static async checkAndNotifyInactiveUsers() {
    try {
      const oneMonthAgo = /* @__PURE__ */ new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - this.INACTIVITY_THRESHOLD_DAYS);
      const inactiveUsers = await db.select().from(users).where(
        and(
          eq(users.isActive, true),
          eq(users.notifyOnInactivity, true),
          lt(users.lastLogin, oneMonthAgo),
          // Vérifier qu'on n'a pas déjà envoyé de notification récemment
          or(
            isNull(users.lastInactivityNotification),
            lt(users.lastInactivityNotification, oneMonthAgo)
          )
        )
      );
      for (const user of inactiveUsers) {
        await this.sendInactivityNotificationToSales(user);
      }
      console.log(`Processed ${inactiveUsers.length} inactive users for notifications`);
    } catch (error) {
      console.error("Error checking inactive users:", error);
    }
  }
  /**
   * Envoie une notification d'inactivité utilisateur à l'équipe commerciale
   */
  static async sendInactivityNotificationToSales(user) {
    try {
      const userOrders = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
      const orderHistory = {
        totalOrders: userOrders.length,
        lastOrderDate: userOrders.length > 0 ? userOrders[0].createdAt : null,
        totalAmount: userOrders.reduce((sum, order) => sum + parseFloat(order.deliveryPrice || "0"), 0),
        services: Array.from(new Set(userOrders.map((order) => `${order.serviceType || "Service"} - ${order.deliveryCity || "Ville"}`).filter(Boolean)))
      };
      const notificationData = {
        userId: user.id,
        lastLoginDate: user.lastLogin,
        orderHistory,
        notificationSent: true,
        notificationSentAt: /* @__PURE__ */ new Date()
      };
      await db.insert(inactivityNotifications).values(notificationData);
      const emailSuccess = await sendGridService.sendInactiveUserNotification(
        user,
        orderHistory,
        this.REMONDIS_SALES_EMAIL
      );
      if (emailSuccess) {
        await db.update(users).set({ lastInactivityNotification: /* @__PURE__ */ new Date() }).where(eq(users.id, user.id));
        console.log(`Inactivity notification sent for user ${user.email}`);
      }
    } catch (error) {
      console.error(`Error sending inactivity notification for user ${user.id}:`, error);
    }
  }
  /**
   * Enregistre une commande abandonnée lors du tunnel de paiement
   */
  static async recordAbandonedCheckout(checkoutData) {
    try {
      const [abandonedCheckout] = await db.insert(abandonedCheckouts).values(checkoutData).returning();
      await this.sendAbandonedCheckoutNotificationToSales(abandonedCheckout);
      console.log(`Abandoned checkout recorded and notification sent for ${checkoutData.customerEmail}`);
    } catch (error) {
      console.error("Error recording abandoned checkout:", error);
    }
  }
  /**
   * Envoie une notification de commande abandonnée à l'équipe commerciale
   */
  static async sendAbandonedCheckoutNotificationToSales(abandonedCheckout) {
    try {
      const emailSuccess = await sendGridService.sendAbandonedCheckoutNotification(
        abandonedCheckout,
        this.REMONDIS_SALES_EMAIL
      );
      if (emailSuccess) {
        await db.update(abandonedCheckouts).set({
          notificationSent: true,
          notificationSentAt: /* @__PURE__ */ new Date()
        }).where(eq(abandonedCheckouts.id, abandonedCheckout.id));
        console.log(`Abandoned checkout notification sent for ${abandonedCheckout.customerEmail}`);
      }
    } catch (error) {
      console.error(`Error sending abandoned checkout notification:`, error);
    }
  }
  /**
   * Lance une tâche périodique pour vérifier les utilisateurs inactifs (à appeler via cron)
   */
  static async runInactivityCheck() {
    console.log("Running inactivity check...");
    await this.checkAndNotifyInactiveUsers();
  }
};
export {
  NotificationService
};
