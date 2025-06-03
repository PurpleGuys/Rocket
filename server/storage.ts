import { users, services, timeSlots, orders, sessions, rentalPricing, transportPricing, wasteTypes, treatmentPricing, companyActivities, emailLogs, auditLogs, bankDeposits, type User, type InsertUser, type UpdateUser, type Service, type InsertService, type TimeSlot, type InsertTimeSlot, type Order, type InsertOrder, type Session, type RentalPricing, type InsertRentalPricing, type UpdateRentalPricing, type TransportPricing, type InsertTransportPricing, type UpdateTransportPricing, type WasteType, type InsertWasteType, type TreatmentPricing, type InsertTreatmentPricing, type UpdateTreatmentPricing, type CompanyActivities, type InsertCompanyActivities, type UpdateCompanyActivities, type EmailLog, type InsertEmailLog, type AuditLog, type InsertAuditLog, type BankDeposit, type InsertBankDeposit, type UpdateBankDeposit } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  updateUserSecurity(id: number, security: {
    loginAttempts?: number;
    lockUntil?: Date | null;
    lastLogin?: Date;
    verificationToken?: string | null | undefined;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified?: boolean;
  }): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  deleteUser(id: number): Promise<void>;
  
  // Sessions
  createSession(session: {
    userId: number;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  deleteSessionByToken(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  getUserSessions(userId: number): Promise<Session[]>;
  
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Time slots
  getAvailableTimeSlots(date: string): Promise<TimeSlot[]>;
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlotBookings(id: number, increment: number): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrders(limit?: number): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;
  updateOrderPayment(id: number, paymentIntentId: string, status: string): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    todayOrders: number;
    monthlyRevenue: string;
    rentedDumpsters: number;
    activeCustomers: number;
  }>;

  // Rental Pricing
  getRentalPricing(): Promise<(RentalPricing & { service: Service })[]>;
  getRentalPricingByServiceId(serviceId: number): Promise<RentalPricing | undefined>;
  createRentalPricing(pricing: InsertRentalPricing): Promise<RentalPricing>;
  updateRentalPricing(serviceId: number, pricing: UpdateRentalPricing): Promise<RentalPricing | undefined>;
  deleteRentalPricing(serviceId: number): Promise<void>;

  // Transport Pricing
  getTransportPricing(): Promise<TransportPricing | undefined>;
  createTransportPricing(pricing: InsertTransportPricing): Promise<TransportPricing>;
  updateTransportPricing(pricing: UpdateTransportPricing): Promise<TransportPricing | undefined>;

  // Waste Types
  getWasteTypes(): Promise<WasteType[]>;
  getWasteType(id: number): Promise<WasteType | undefined>;
  createWasteType(wasteType: InsertWasteType): Promise<WasteType>;
  updateWasteType(id: number, wasteType: Partial<InsertWasteType>): Promise<WasteType | undefined>;
  deleteWasteType(id: number): Promise<void>;

  // Treatment Pricing
  getTreatmentPricing(): Promise<(TreatmentPricing & { wasteType: WasteType })[]>;
  getTreatmentPricingByWasteTypeId(wasteTypeId: number): Promise<TreatmentPricing | undefined>;
  createTreatmentPricing(pricing: InsertTreatmentPricing): Promise<TreatmentPricing>;
  updateTreatmentPricing(id: number, pricing: UpdateTreatmentPricing): Promise<TreatmentPricing | undefined>;
  deleteTreatmentPricing(id: number): Promise<void>;

  // Company Activities
  getCompanyActivities(): Promise<CompanyActivities | undefined>;
  createCompanyActivities(activities: InsertCompanyActivities): Promise<CompanyActivities>;
  updateCompanyActivities(activities: UpdateCompanyActivities): Promise<CompanyActivities | undefined>;

  // Email Logs
  createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog>;
  getEmailLogsByOrder(orderId: number): Promise<EmailLog[]>;

  // Audit Logs
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByOrder(orderId: number): Promise<AuditLog[]>;

  // Order Email Status
  updateOrderEmailStatus(orderId: number, status: { confirmationEmailSent?: boolean; validationEmailSent?: boolean }): Promise<void>;
  
  // Order Delivery Date Management
  updateOrderDeliveryDate(orderId: number, confirmedDate: Date, adminUserId: number, adminNotes?: string): Promise<Order | undefined>;
  updateOrderDeliveryDateValidation(orderId: number, updates: {
    confirmedDeliveryDate?: Date;
    proposedDeliveryDate?: Date;
    clientValidationStatus?: string;
    clientValidationToken?: string | null;
    clientValidationExpiresAt?: Date;
    deliveryDateValidatedBy?: number;
    deliveryDateValidatedAt?: Date;
    adminNotes?: string;
    status?: string;
  }): Promise<Order | undefined>;
  getOrderByValidationToken(token: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, user: UpdateUser): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...user,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserSecurity(id: number, security: {
    loginAttempts?: number;
    lockUntil?: Date | null;
    lastLogin?: Date;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified?: boolean;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        ...security,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Sessions
  async createSession(session: {
    userId: number;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newSession] = await db
      .insert(sessions)
      .values({
        id: sessionId,
        ...session,
      })
      .returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session || undefined;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteSessionByToken(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  // Time slots
  async getAvailableTimeSlots(date: string): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.date, date),
          eq(timeSlots.isAvailable, true),
          sql`${timeSlots.currentBookings} < ${timeSlots.maxBookings}`
        )
      );
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const [timeSlot] = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return timeSlot || undefined;
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [newTimeSlot] = await db
      .insert(timeSlots)
      .values(timeSlot)
      .returning();
    return newTimeSlot;
  }

  async updateTimeSlotBookings(id: number, increment: number): Promise<void> {
    await db
      .update(timeSlots)
      .set({
        currentBookings: sql`${timeSlots.currentBookings} + ${increment}`
      })
      .where(eq(timeSlots.id, id));
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    // Generate order number
    const orderNumber = `BNE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        orderNumber,
      })
      .returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getOrders(limit: number = 50): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getUserOrders(userId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      return results.map(row => ({
        id: row.id,
        orderNumber: row.orderNumber || "",
        status: row.status || "pending",
        totalAmount: row.totalTTC?.toString() || "0",
        createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
        deliveryDate: row.estimatedDeliveryDate?.toISOString() || null,
        confirmedDeliveryDate: row.confirmedDeliveryDate?.toISOString() || null,
        address: row.deliveryStreet || "",
        postalCode: row.deliveryPostalCode || "",
        city: row.deliveryCity || "",
        wasteTypes: Array.isArray(row.wasteTypes) ? row.wasteTypes : [],
        serviceName: "Benne",
        serviceVolume: 8,
        distance: 0,
        transportCost: row.deliveryFee?.toString() || "0",
        serviceCost: row.basePrice?.toString() || "0",
      }));
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return [];
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id));
  }

  async updateOrderPayment(id: number, paymentIntentId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: status,
        status: status === 'paid' ? 'confirmed' : 'pending',
        updatedAt: new Date()
      })
      .where(eq(orders.id, id));
  }

  async deleteOrder(id: number): Promise<void> {
    await db
      .delete(orders)
      .where(eq(orders.id, id));
  }

  async getDashboardStats(): Promise<{
    todayOrders: number;
    yesterdayOrders: number;
    monthlyRevenue: string;
    lastMonthRevenue: string;
    rentedDumpsters: number;
    activeCustomers: number;
    ordersGrowth: number;
    revenueGrowth: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString();

    // Today's PAID orders only
    const [todayOrdersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(
        and(
          sql`date(${orders.createdAt}) = ${today}`,
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Yesterday's PAID orders for comparison
    const [yesterdayOrdersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(
        and(
          sql`date(${orders.createdAt}) = ${yesterday}`,
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Monthly revenue (PAID orders only)
    const [monthlyRevenueResult] = await db
      .select({ total: sql<string>`cast(coalesce(sum(${orders.totalTTC}), 0) as text)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, new Date(startOfMonth)),
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Last month revenue for comparison
    const [lastMonthRevenueResult] = await db
      .select({ total: sql<string>`cast(coalesce(sum(${orders.totalTTC}), 0) as text)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, new Date(startOfLastMonth)),
          lte(orders.createdAt, new Date(endOfLastMonth)),
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Rented dumpsters (delivered orders with PAID status)
    const [rentedDumpstersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'delivered'),
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Active customers (users with PAID orders this month)
    const [activeCustomersResult] = await db
      .select({ count: sql<number>`cast(count(distinct ${orders.userId}) as integer)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, new Date(startOfMonth)),
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Calculate growth percentages
    const todayCount = todayOrdersResult?.count || 0;
    const yesterdayCount = yesterdayOrdersResult?.count || 0;
    const ordersGrowth = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0;

    const monthlyRev = parseFloat(monthlyRevenueResult?.total || "0");
    const lastMonthRev = parseFloat(lastMonthRevenueResult?.total || "0");
    const revenueGrowth = lastMonthRev > 0 ? ((monthlyRev - lastMonthRev) / lastMonthRev) * 100 : 0;

    return {
      todayOrders: todayCount,
      yesterdayOrders: yesterdayCount,
      monthlyRevenue: monthlyRevenueResult?.total || "0",
      lastMonthRevenue: lastMonthRevenueResult?.total || "0",
      rentedDumpsters: rentedDumpstersResult?.count || 0,
      activeCustomers: activeCustomersResult?.count || 0,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10, // Round to 1 decimal
      revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal
    };
  }

  // Rental Pricing methods
  async getRentalPricing(): Promise<(RentalPricing & { service: Service })[]> {
    const result = await db
      .select({
        id: rentalPricing.id,
        serviceId: rentalPricing.serviceId,
        dailyRate: rentalPricing.dailyRate,
        billingStartDay: rentalPricing.billingStartDay,
        maxTonnage: rentalPricing.maxTonnage,
        isActive: rentalPricing.isActive,
        createdAt: rentalPricing.createdAt,
        updatedAt: rentalPricing.updatedAt,
        service: services,
      })
      .from(rentalPricing)
      .leftJoin(services, eq(rentalPricing.serviceId, services.id))
      .where(eq(rentalPricing.isActive, true));

    return result.map(row => ({
      ...row,
      service: row.service!,
    }));
  }

  async getRentalPricingByServiceId(serviceId: number): Promise<RentalPricing | undefined> {
    const [result] = await db
      .select()
      .from(rentalPricing)
      .where(and(
        eq(rentalPricing.serviceId, serviceId),
        eq(rentalPricing.isActive, true)
      ));
    return result;
  }

  async createRentalPricing(pricing: InsertRentalPricing): Promise<RentalPricing> {
    const [result] = await db
      .insert(rentalPricing)
      .values(pricing)
      .returning();
    return result;
  }

  async updateRentalPricing(serviceId: number, pricing: UpdateRentalPricing): Promise<RentalPricing | undefined> {
    const [result] = await db
      .update(rentalPricing)
      .set({
        ...pricing,
        updatedAt: new Date(),
      })
      .where(eq(rentalPricing.serviceId, serviceId))
      .returning();
    return result;
  }

  async deleteRentalPricing(serviceId: number): Promise<void> {
    await db
      .update(rentalPricing)
      .set({ isActive: false })
      .where(eq(rentalPricing.serviceId, serviceId));
  }

  // Transport Pricing methods
  async getTransportPricing(): Promise<TransportPricing | undefined> {
    const [result] = await db
      .select()
      .from(transportPricing)
      .where(eq(transportPricing.isActive, true))
      .limit(1);
    return result;
  }

  async createTransportPricing(pricing: InsertTransportPricing): Promise<TransportPricing> {
    const [result] = await db
      .insert(transportPricing)
      .values(pricing)
      .returning();
    return result;
  }

  async updateTransportPricing(pricing: UpdateTransportPricing): Promise<TransportPricing | undefined> {
    // Get the current active transport pricing
    const existing = await this.getTransportPricing();
    
    if (existing) {
      const [result] = await db
        .update(transportPricing)
        .set({
          ...pricing,
          updatedAt: new Date(),
        })
        .where(eq(transportPricing.id, existing.id))
        .returning();
      return result;
    } else {
      // Create new if none exists
      return await this.createTransportPricing({
        pricePerKm: pricing.pricePerKm || "0",
        minimumFlatRate: pricing.minimumFlatRate || "0",
        hourlyRate: pricing.hourlyRate || "0",
        immediateLoadingEnabled: pricing.immediateLoadingEnabled ?? true,
        isActive: true,
      });
    }
  }

  // Waste Types methods
  async getWasteTypes(): Promise<WasteType[]> {
    return await db
      .select()
      .from(wasteTypes)
      .where(eq(wasteTypes.isActive, true))
      .orderBy(wasteTypes.name);
  }

  async getWasteType(id: number): Promise<WasteType | undefined> {
    const [result] = await db
      .select()
      .from(wasteTypes)
      .where(eq(wasteTypes.id, id));
    return result;
  }

  async createWasteType(wasteType: InsertWasteType): Promise<WasteType> {
    const [result] = await db
      .insert(wasteTypes)
      .values(wasteType)
      .returning();
    return result;
  }

  async updateWasteType(id: number, wasteType: Partial<InsertWasteType>): Promise<WasteType | undefined> {
    const [result] = await db
      .update(wasteTypes)
      .set({
        ...wasteType,
        updatedAt: new Date(),
      })
      .where(eq(wasteTypes.id, id))
      .returning();
    return result;
  }

  async deleteWasteType(id: number): Promise<void> {
    await db
      .update(wasteTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(wasteTypes.id, id));
  }

  // Treatment Pricing methods
  async getTreatmentPricing(): Promise<(TreatmentPricing & { wasteType: WasteType })[]> {
    return await db
      .select({
        id: treatmentPricing.id,
        wasteTypeId: treatmentPricing.wasteTypeId,
        pricePerTon: treatmentPricing.pricePerTon,
        treatmentType: treatmentPricing.treatmentType,
        treatmentCode: treatmentPricing.treatmentCode,
        outletAddress: treatmentPricing.outletAddress,
        isManualTreatment: treatmentPricing.isManualTreatment,
        isActive: treatmentPricing.isActive,
        createdAt: treatmentPricing.createdAt,
        updatedAt: treatmentPricing.updatedAt,
        wasteType: wasteTypes,
      })
      .from(treatmentPricing)
      .leftJoin(wasteTypes, eq(treatmentPricing.wasteTypeId, wasteTypes.id))
      .where(eq(treatmentPricing.isActive, true))
      .orderBy(wasteTypes.name);
  }

  async getTreatmentPricingByWasteTypeId(wasteTypeId: number): Promise<TreatmentPricing | undefined> {
    const [result] = await db
      .select()
      .from(treatmentPricing)
      .where(and(
        eq(treatmentPricing.wasteTypeId, wasteTypeId),
        eq(treatmentPricing.isActive, true)
      ));
    return result;
  }

  async createTreatmentPricing(pricing: InsertTreatmentPricing): Promise<TreatmentPricing> {
    const [result] = await db
      .insert(treatmentPricing)
      .values(pricing)
      .returning();
    return result;
  }

  async updateTreatmentPricing(id: number, pricing: UpdateTreatmentPricing): Promise<TreatmentPricing | undefined> {
    const [result] = await db
      .update(treatmentPricing)
      .set({
        ...pricing,
        updatedAt: new Date(),
      })
      .where(eq(treatmentPricing.id, id))
      .returning();
    return result;
  }

  async deleteTreatmentPricing(id: number): Promise<void> {
    await db
      .update(treatmentPricing)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(treatmentPricing.id, id));
  }

  // Company Activities
  async getCompanyActivities(): Promise<CompanyActivities | undefined> {
    const [activities] = await db.select().from(companyActivities).where(eq(companyActivities.isActive, true));
    return activities;
  }

  async createCompanyActivities(activities: InsertCompanyActivities): Promise<CompanyActivities> {
    const [newActivities] = await db
      .insert(companyActivities)
      .values({
        ...activities,
        wasteTypes: activities.wasteTypes || [],
        equipmentMultibenne: activities.equipmentMultibenne || [],
        equipmentAmpliroll: activities.equipmentAmpliroll || [],
        equipmentCaissePalette: activities.equipmentCaissePalette || [],
        equipmentRolls: activities.equipmentRolls || [],
        equipmentContenantAlimentaire: activities.equipmentContenantAlimentaire || [],
        equipmentBac: activities.equipmentBac || [],
        equipmentBennesFermees: activities.equipmentBennesFermees || [],
      })
      .returning();
    return newActivities;
  }

  async updateCompanyActivities(activities: UpdateCompanyActivities): Promise<CompanyActivities | undefined> {
    // Obtenir l'ID de la configuration existante
    const existing = await this.getCompanyActivities();
    if (!existing) {
      // Si aucune configuration n'existe, créer une nouvelle
      return this.createCompanyActivities(activities as InsertCompanyActivities);
    }

    // Filtrer les champs non autorisés pour la mise à jour
    const { id, createdAt, updatedAt, ...cleanActivities } = activities as any;

    const [updated] = await db
      .update(companyActivities)
      .set({
        ...cleanActivities,
        wasteTypes: cleanActivities.wasteTypes || [],
        equipmentMultibenne: cleanActivities.equipmentMultibenne || [],
        equipmentAmpliroll: cleanActivities.equipmentAmpliroll || [],
        equipmentCaissePalette: cleanActivities.equipmentCaissePalette || [],
        equipmentRolls: cleanActivities.equipmentRolls || [],
        equipmentContenantAlimentaire: cleanActivities.equipmentContenantAlimentaire || [],
        equipmentBac: cleanActivities.equipmentBac || [],
        equipmentBennesFermees: cleanActivities.equipmentBennesFermees || [],
        updatedAt: new Date(),
      })
      .where(eq(companyActivities.id, existing.id))
      .returning();
    return updated;
  }

  // Email Logs
  async createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog> {
    const [log] = await db
      .insert(emailLogs)
      .values(emailLog)
      .returning();
    return log;
  }

  async getEmailLogsByOrder(orderId: number): Promise<EmailLog[]> {
    return await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.orderId, orderId))
      .orderBy(desc(emailLogs.sentAt));
  }

  // Audit Logs
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values(auditLog)
      .returning();
    return log;
  }

  async getAuditLogsByOrder(orderId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.orderId, orderId))
      .orderBy(desc(auditLogs.createdAt));
  }

  // Order Email Status
  async updateOrderEmailStatus(orderId: number, status: { confirmationEmailSent?: boolean; validationEmailSent?: boolean }): Promise<void> {
    await db
      .update(orders)
      .set({
        ...status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }
  
  // Order Delivery Date Management
  async updateOrderDeliveryDate(orderId: number, confirmedDate: Date, adminUserId: number, adminNotes?: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({
        confirmedDeliveryDate: confirmedDate,
        adminValidatedBy: adminUserId,
        adminValidatedAt: new Date(),
        adminNotes: adminNotes,
        status: 'confirmed',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async updateOrderDeliveryDateValidation(orderId: number, updates: {
    confirmedDeliveryDate?: Date;
    proposedDeliveryDate?: Date;
    clientValidationStatus?: string;
    clientValidationToken?: string | null;
    clientValidationExpiresAt?: Date;
    deliveryDateValidatedBy?: number;
    deliveryDateValidatedAt?: Date;
    adminNotes?: string;
    status?: string;
  }): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async getOrderByValidationToken(token: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.clientValidationToken, token));
    return order;
  }

  // Bank deposits operations
  async createBankDeposit(data: InsertBankDeposit): Promise<BankDeposit> {
    const [deposit] = await db
      .insert(bankDeposits)
      .values(data)
      .returning();
    return deposit;
  }

  async updateBankDeposit(id: number, data: Partial<InsertBankDeposit>): Promise<BankDeposit> {
    const [deposit] = await db
      .update(bankDeposits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bankDeposits.id, id))
      .returning();
    return deposit;
  }

  async deleteBankDeposit(id: number): Promise<void> {
    await db.delete(bankDeposits).where(eq(bankDeposits.id, id));
  }

  async getBankDeposits(): Promise<BankDeposit[]> {
    return await db.select().from(bankDeposits).where(eq(bankDeposits.isActive, true));
  }

  async getBankDepositById(id: number): Promise<BankDeposit | null> {
    const [deposit] = await db.select().from(bankDeposits).where(eq(bankDeposits.id, id));
    return deposit || null;
  }

  async getBankDepositByServiceAndWaste(serviceId: number, wasteTypeId: number): Promise<BankDeposit | null> {
    const [deposit] = await db
      .select()
      .from(bankDeposits)
      .where(
        and(
          eq(bankDeposits.serviceId, serviceId),
          eq(bankDeposits.wasteTypeId, wasteTypeId),
          eq(bankDeposits.isActive, true)
        )
      );
    return deposit || null;
  }
}

export const storage = new DatabaseStorage();
