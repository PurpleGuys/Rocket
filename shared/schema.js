import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export var users = pgTable("users", {
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
export var services = pgTable("services", {
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
export var timeSlots = pgTable("time_slots", {
    id: serial("id").primaryKey(),
    date: text("date").notNull(), // YYYY-MM-DD format
    startTime: text("start_time").notNull(), // HH:MM format
    endTime: text("end_time").notNull(), // HH:MM format
    isAvailable: boolean("is_available").default(true),
    maxBookings: integer("max_bookings").default(5),
    currentBookings: integer("current_bookings").default(0),
});
export var orders = pgTable("orders", {
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Relations
export var ordersRelations = relations(orders, function (_a) {
    var one = _a.one;
    return ({
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
    });
});
export var usersRelations = relations(users, function (_a) {
    var many = _a.many;
    return ({
        orders: many(orders),
    });
});
export var servicesRelations = relations(services, function (_a) {
    var many = _a.many;
    return ({
        orders: many(orders),
    });
});
// Add session table for secure session management
export var sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: integer("user_id").notNull().references(function () { return users.id; }, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
});
// Table pour les tarifs de location quotidiens avec seuils progressifs
export var rentalPricing = pgTable("rental_pricing", {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull().references(function () { return services.id; }, { onDelete: "cascade" }),
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
export var transportPricing = pgTable("transport_pricing", {
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
export var wasteTypes = pgTable("waste_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(), // Nom de la matière (ex: "Gravats", "Bois", etc.)
    description: text("description"), // Description détaillée
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Table pour les tarifs de traitement
export var treatmentPricing = pgTable("treatment_pricing", {
    id: serial("id").primaryKey(),
    wasteTypeId: integer("waste_type_id").notNull().references(function () { return wasteTypes.id; }, { onDelete: "cascade" }),
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
export var bankDeposits = pgTable("bank_deposits", {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull().references(function () { return services.id; }, { onDelete: "cascade" }),
    wasteTypeId: integer("waste_type_id").notNull().references(function () { return wasteTypes.id; }, { onDelete: "cascade" }),
    depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(), // Montant de l'empreinte en €
    description: text("description"), // Description de l'empreinte
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Insert schemas
export var insertUserSchema = createInsertSchema(users).omit({
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
export var loginSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
    rememberMe: z.boolean().optional(),
});
export var updateUserSchema = createInsertSchema(users).omit({
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
export var changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmation du mot de passe requise"),
}).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
export var insertServiceSchema = createInsertSchema(services).omit({
    id: true,
});
export var insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
    id: true,
});
export var insertOrderSchema = createInsertSchema(orders).omit({
    id: true,
    orderNumber: true,
    createdAt: true,
    updatedAt: true,
});
export var insertRentalPricingSchema = createInsertSchema(rentalPricing).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var updateRentalPricingSchema = createInsertSchema(rentalPricing).omit({
    id: true,
    serviceId: true,
    createdAt: true,
    updatedAt: true,
});
export var insertTransportPricingSchema = createInsertSchema(transportPricing).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var updateTransportPricingSchema = createInsertSchema(transportPricing).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertWasteTypeSchema = createInsertSchema(wasteTypes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertTreatmentPricingSchema = createInsertSchema(treatmentPricing).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var updateTreatmentPricingSchema = createInsertSchema(treatmentPricing).omit({
    id: true,
    wasteTypeId: true,
    createdAt: true,
    updatedAt: true,
});
// Relations
export var sessionsRelations = relations(sessions, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [sessions.userId],
            references: [users.id],
        }),
    });
});
// Company Activities Configuration
export var companyActivities = pgTable("company_activities", {
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
    updatedAt: timestamp("updated_at").defaultNow(),
});
export var insertCompanyActivitiesSchema = createInsertSchema(companyActivities).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var updateCompanyActivitiesSchema = createInsertSchema(companyActivities).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertBankDepositSchema = createInsertSchema(bankDeposits).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var updateBankDepositSchema = createInsertSchema(bankDeposits).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Email logs table for audit trail
export var emailLogs = pgTable("email_logs", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    orderId: integer("order_id").notNull().references(function () { return orders.id; }),
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
export var auditLogs = pgTable("audit_logs", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: integer("user_id").references(function () { return users.id; }),
    orderId: integer("order_id").references(function () { return orders.id; }),
    action: text("action").notNull(), // 'order_created', 'delivery_date_updated', 'status_changed', etc.
    entityType: text("entity_type").notNull(), // 'order', 'user', 'setting'
    entityId: integer("entity_id"),
    oldValues: text("old_values"), // JSON string of old values
    newValues: text("new_values"), // JSON string of new values
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Email logs relations
export var emailLogsRelations = relations(emailLogs, function (_a) {
    var one = _a.one;
    return ({
        order: one(orders, {
            fields: [emailLogs.orderId],
            references: [orders.id],
        }),
        sentByUser: one(users, {
            fields: [emailLogs.sentBy],
            references: [users.id],
        }),
    });
});
// Audit logs relations
export var auditLogsRelations = relations(auditLogs, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [auditLogs.userId],
            references: [users.id],
        }),
        order: one(orders, {
            fields: [auditLogs.orderId],
            references: [orders.id],
        }),
    });
});
// Email logs schemas
export var insertEmailLogSchema = createInsertSchema(emailLogs).omit({
    id: true,
    sentAt: true,
});
export var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
    id: true,
    createdAt: true,
});
