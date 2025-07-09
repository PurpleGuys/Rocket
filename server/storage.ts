import dotenv from 'dotenv';
dotenv.config();

import { users, services, serviceImages, timeSlots, orders, sessions, rentalPricing, transportPricing, wasteTypes, treatmentPricing, companyActivities, emailLogs, auditLogs, bankDeposits, satisfactionSurveys, surveyNotifications, fids, abandonedCheckouts, inactivityNotifications, type User, type InsertUser, type UpdateUser, type Service, type InsertService, type ServiceImage, type InsertServiceImage, type TimeSlot, type InsertTimeSlot, type Order, type InsertOrder, type Session, type RentalPricing, type InsertRentalPricing, type UpdateRentalPricing, type TransportPricing, type InsertTransportPricing, type UpdateTransportPricing, type WasteType, type InsertWasteType, type TreatmentPricing, type InsertTreatmentPricing, type UpdateTreatmentPricing, type CompanyActivities, type InsertCompanyActivities, type UpdateCompanyActivities, type EmailLog, type InsertEmailLog, type AuditLog, type InsertAuditLog, type BankDeposit, type InsertBankDeposit, type UpdateBankDeposit, type SatisfactionSurvey, type InsertSatisfactionSurvey, type SurveyNotification, type InsertSurveyNotification, type Fid, type InsertFid, type UpdateFid, type AbandonedCheckout, type InsertAbandonedCheckout, type InactivityNotification, type InsertInactivityNotification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gte, lte, sql, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
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
  updateUserNotificationSettings(id: number, notifyOnInactivity: boolean): Promise<void>;
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
  getServices(): Promise<(Service & { images: ServiceImage[] })[]>;
  getService(id: number): Promise<(Service & { images: ServiceImage[] }) | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Service Images
  getServiceImages(serviceId: number): Promise<ServiceImage[]>;
  createServiceImage(image: InsertServiceImage): Promise<ServiceImage>;
  deleteServiceImage(id: number): Promise<void>;
  setMainServiceImage(id: number): Promise<void>;
  
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
  
  // Satisfaction Surveys
  createSatisfactionSurvey(survey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey>;
  getSatisfactionSurvey(id: number): Promise<SatisfactionSurvey | undefined>;
  getSatisfactionSurveyByToken(token: string): Promise<SatisfactionSurvey | undefined>;
  getSatisfactionSurveysByOrder(orderId: number): Promise<SatisfactionSurvey[]>;
  getSatisfactionSurveys(): Promise<(SatisfactionSurvey & { order: Order; user: User })[]>;
  updateSatisfactionSurvey(id: number, survey: Partial<InsertSatisfactionSurvey>): Promise<SatisfactionSurvey | undefined>;
  getOrdersReadyForSurvey(): Promise<Order[]>; // Commandes terminées depuis 1 semaine sans questionnaire
  
  // Survey Notifications
  createSurveyNotification(notification: InsertSurveyNotification): Promise<SurveyNotification>;
  updateSurveyNotification(surveyId: number, notification: Partial<InsertSurveyNotification>): Promise<SurveyNotification | undefined>;
  
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

  // FIDs
  getFids(filters?: { status?: string; search?: string }): Promise<any[]>;
  getFidById(id: number): Promise<any | undefined>;
  createFid(fid: InsertFid): Promise<Fid>;
  updateFid(id: number, fid: Partial<UpdateFid>): Promise<Fid | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
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

  async updateUserNotificationSettings(id: number, notifyOnInactivity: boolean): Promise<void> {
    await db
      .update(users)
      .set({
        notifyOnInactivity,
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
  async getServices(): Promise<(Service & { images: ServiceImage[] })[]> {
    try {
      const servicesData = await db.select().from(services).where(eq(services.isActive, true));
      
      const servicesWithImages = await Promise.all(
        servicesData.map(async (service) => {
          try {
            const images = await this.getServiceImages(service.id);
            return { ...service, images };
          } catch (imageError) {
            console.error(`Error loading images for service ${service.id}:`, imageError);
            // Return service without images if image loading fails
            return { ...service, images: [] };
          }
        })
      );
      
      return servicesWithImages;
    } catch (error) {
      console.error('Error in getServices():', error);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }
  }

  async getService(id: number): Promise<(Service & { images: ServiceImage[] }) | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    if (!service) return undefined;
    
    const images = await this.getServiceImages(id);
    return { ...service, images };
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

  // Service Images
  async getServiceImages(serviceId: number): Promise<ServiceImage[]> {
    return await db
      .select()
      .from(serviceImages)
      .where(eq(serviceImages.serviceId, serviceId))
      .orderBy(asc(serviceImages.sortOrder), asc(serviceImages.id));
  }

  async createServiceImage(image: InsertServiceImage): Promise<ServiceImage> {
    const [newImage] = await db
      .insert(serviceImages)
      .values(image)
      .returning();
    return newImage;
  }

  async deleteServiceImage(id: number): Promise<void> {
    await db.delete(serviceImages).where(eq(serviceImages.id, id));
  }

  async setMainServiceImage(id: number): Promise<void> {
    // First get the service ID for this image
    const [image] = await db
      .select({ serviceId: serviceImages.serviceId })
      .from(serviceImages)
      .where(eq(serviceImages.id, id));
    
    if (!image) return;

    // Reset all images for this service to not be main
    await db
      .update(serviceImages)
      .set({ isMain: false })
      .where(eq(serviceImages.serviceId, image.serviceId));

    // Set the specified image as main
    await db
      .update(serviceImages)
      .set({ isMain: true })
      .where(eq(serviceImages.id, id));
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
      const userOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          totalTTC: orders.totalTTC,
          createdAt: orders.createdAt,
          estimatedDeliveryDate: orders.estimatedDeliveryDate,
          confirmedDeliveryDate: orders.confirmedDeliveryDate,
          deliveryStreet: orders.deliveryStreet,
          deliveryCity: orders.deliveryCity,
          deliveryPostalCode: orders.deliveryPostalCode,
          service: {
            id: services.id,
            name: services.name,
            volume: services.volume,
            imageUrl: services.imageUrl
          }
        })
        .from(orders)
        .leftJoin(services, eq(orders.serviceId, services.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      return userOrders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async updateOrderPayment(id: number, paymentIntentId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    todayOrders: number;
    monthlyRevenue: string;
    rentedDumpsters: number;
    activeCustomers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Today's orders
    const [todayResult] = await db
      .select({ count: sql`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    
    // Monthly revenue
    const [monthlyResult] = await db
      .select({ total: sql`sum(${orders.totalTTC})` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfMonth),
          eq(orders.paymentStatus, 'paid')
        )
      );
    
    // Rented dumpsters (confirmed orders)
    const [rentedResult] = await db
      .select({ count: sql`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'confirmed'));
    
    // Active customers (users with orders in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const [activeCustomersResult] = await db
      .select({ count: sql`count(distinct ${orders.userId})` })
      .from(orders)
      .where(gte(orders.createdAt, sixMonthsAgo));

    return {
      todayOrders: Number(todayResult?.count || 0),
      monthlyRevenue: monthlyResult?.total || '0',
      rentedDumpsters: Number(rentedResult?.count || 0),
      activeCustomers: Number(activeCustomersResult?.count || 0),
    };
  }

  // Rental Pricing
  async getRentalPricing(): Promise<(RentalPricing & { service: Service })[]> {
    const pricing = await db
      .select({
        id: rentalPricing.id,
        serviceId: rentalPricing.serviceId,
        dailyRate: rentalPricing.dailyRate,
        billingStartDay: rentalPricing.billingStartDay,
        maxTonnage: rentalPricing.maxTonnage,
        durationThreshold1: rentalPricing.durationThreshold1,
        durationSupplement1: rentalPricing.durationSupplement1,
        durationThreshold2: rentalPricing.durationThreshold2,
        durationSupplement2: rentalPricing.durationSupplement2,
        durationThreshold3: rentalPricing.durationThreshold3,
        durationSupplement3: rentalPricing.durationSupplement3,
        isActive: rentalPricing.isActive,
        createdAt: rentalPricing.createdAt,
        updatedAt: rentalPricing.updatedAt,
        service: {
          id: services.id,
          name: services.name,
          volume: services.volume,
          basePrice: services.basePrice,
          description: services.description,
          imageUrl: services.imageUrl,
          length: services.length,
          width: services.width,
          height: services.height,
          wasteTypes: services.wasteTypes,
          maxWeight: services.maxWeight,
          includedServices: services.includedServices,
          isActive: services.isActive,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt,
        }
      })
      .from(rentalPricing)
      .leftJoin(services, eq(rentalPricing.serviceId, services.id))
      .where(eq(rentalPricing.isActive, true));

    return pricing as (RentalPricing & { service: Service })[];
  }

  async getRentalPricingByServiceId(serviceId: number): Promise<RentalPricing | undefined> {
    const [pricing] = await db
      .select()
      .from(rentalPricing)
      .where(and(eq(rentalPricing.serviceId, serviceId), eq(rentalPricing.isActive, true)));
    return pricing || undefined;
  }

  async createRentalPricing(pricing: InsertRentalPricing): Promise<RentalPricing> {
    const [newPricing] = await db
      .insert(rentalPricing)
      .values(pricing)
      .returning();
    return newPricing;
  }

  async updateRentalPricing(serviceId: number, pricing: UpdateRentalPricing): Promise<RentalPricing | undefined> {
    const [updatedPricing] = await db
      .update(rentalPricing)
      .set({
        ...pricing,
        updatedAt: new Date()
      })
      .where(eq(rentalPricing.serviceId, serviceId))
      .returning();
    return updatedPricing || undefined;
  }

  async deleteRentalPricing(serviceId: number): Promise<void> {
    await db.delete(rentalPricing).where(eq(rentalPricing.serviceId, serviceId));
  }

  // Transport Pricing
  async getTransportPricing(): Promise<TransportPricing | undefined> {
    try {
      console.log('[DEBUG] getTransportPricing called');
      
      const result = await db
        .select()
        .from(transportPricing)
        .where(eq(transportPricing.isActive, true))
        .orderBy(desc(transportPricing.createdAt));
      
      console.log('[DEBUG] getTransportPricing query result:', result);
      console.log('[DEBUG] Result length:', result.length);
      
      const [pricing] = result;
      console.log('[DEBUG] First pricing:', pricing);
      
      return pricing || undefined;
    } catch (error) {
      console.error('[DEBUG] Error in getTransportPricing:', error);
      throw error;
    }
  }

  async createTransportPricing(pricing: InsertTransportPricing): Promise<TransportPricing> {
    const [newPricing] = await db
      .insert(transportPricing)
      .values(pricing)
      .returning();
    return newPricing;
  }

  async updateTransportPricing(pricing: UpdateTransportPricing): Promise<TransportPricing | undefined> {
    // Get the current active pricing
    console.log('[DEBUG] updateTransportPricing called with:', pricing);
    const current = await this.getTransportPricing();
    console.log('[DEBUG] Current transport pricing:', current);
    
    if (!current) {
      throw new Error('No active transport pricing found');
    }

    const [updatedPricing] = await db
      .update(transportPricing)
      .set({
        ...pricing,
        updatedAt: new Date()
      })
      .where(eq(transportPricing.id, current.id))
      .returning();
    
    console.log('[DEBUG] Updated transport pricing:', updatedPricing);
    return updatedPricing || undefined;
  }

  // Waste Types
  async getWasteTypes(): Promise<WasteType[]> {
    try {
      return await db
        .select()
        .from(wasteTypes)
        .where(eq(wasteTypes.isActive, true))
        .orderBy(wasteTypes.name);
    } catch (error) {
      console.error('Error in getWasteTypes():', error);
      throw new Error(`Failed to fetch waste types: ${error.message}`);
    }
  }

  async getWasteType(id: number): Promise<WasteType | undefined> {
    const [wasteType] = await db
      .select()
      .from(wasteTypes)
      .where(eq(wasteTypes.id, id));
    return wasteType || undefined;
  }

  async createWasteType(wasteType: InsertWasteType): Promise<WasteType> {
    const [newWasteType] = await db
      .insert(wasteTypes)
      .values(wasteType)
      .returning();
    return newWasteType;
  }

  async updateWasteType(id: number, wasteType: Partial<InsertWasteType>): Promise<WasteType | undefined> {
    const [updatedWasteType] = await db
      .update(wasteTypes)
      .set({
        ...wasteType,
        updatedAt: new Date()
      })
      .where(eq(wasteTypes.id, id))
      .returning();
    return updatedWasteType || undefined;
  }

  async deleteWasteType(id: number): Promise<void> {
    await db
      .update(wasteTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(wasteTypes.id, id));
  }

  // Treatment Pricing
  async getTreatmentPricing(): Promise<(TreatmentPricing & { wasteType: WasteType })[]> {
    try {
      const pricing = await db
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
          wasteType: {
            id: wasteTypes.id,
            name: wasteTypes.name,
            description: wasteTypes.description,
            isActive: wasteTypes.isActive,
            createdAt: wasteTypes.createdAt,
            updatedAt: wasteTypes.updatedAt,
          }
        })
        .from(treatmentPricing)
        .innerJoin(wasteTypes, eq(treatmentPricing.wasteTypeId, wasteTypes.id))
        .where(eq(treatmentPricing.isActive, true));

      return pricing as (TreatmentPricing & { wasteType: WasteType })[];
    } catch (error) {
      console.error('Error in getTreatmentPricing():', error);
      throw new Error(`Failed to fetch treatment pricing: ${error.message}`);
    }
  }

  async getTreatmentPricingByWasteTypeId(wasteTypeId: number): Promise<TreatmentPricing | undefined> {
    const [pricing] = await db
      .select()
      .from(treatmentPricing)
      .where(and(eq(treatmentPricing.wasteTypeId, wasteTypeId), eq(treatmentPricing.isActive, true)));
    return pricing || undefined;
  }

  async createTreatmentPricing(pricing: InsertTreatmentPricing): Promise<TreatmentPricing> {
    const [newPricing] = await db
      .insert(treatmentPricing)
      .values(pricing)
      .returning();
    return newPricing;
  }

  async updateTreatmentPricing(id: number, pricing: UpdateTreatmentPricing): Promise<TreatmentPricing | undefined> {
    const [updatedPricing] = await db
      .update(treatmentPricing)
      .set({
        ...pricing,
        updatedAt: new Date()
      })
      .where(eq(treatmentPricing.id, id))
      .returning();
    return updatedPricing || undefined;
  }

  async deleteTreatmentPricing(id: number): Promise<void> {
    await db
      .update(treatmentPricing)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(treatmentPricing.id, id));
  }

  // Company Activities
  async getCompanyActivities(): Promise<CompanyActivities | undefined> {
    const [activities] = await db
      .select()
      .from(companyActivities)
      .where(eq(companyActivities.isActive, true))
      .orderBy(desc(companyActivities.createdAt));
    return activities || undefined;
  }

  async createCompanyActivities(activities: InsertCompanyActivities): Promise<CompanyActivities> {
    const [newActivities] = await db
      .insert(companyActivities)
      .values(activities)
      .returning();
    return newActivities;
  }

  async updateCompanyActivities(activities: UpdateCompanyActivities): Promise<CompanyActivities | undefined> {
    // Get the current active configuration
    const current = await this.getCompanyActivities();
    if (!current) {
      throw new Error('No active company activities configuration found');
    }

    const [updatedActivities] = await db
      .update(companyActivities)
      .set({
        ...activities,
        updatedAt: new Date()
      })
      .where(eq(companyActivities.id, current.id))
      .returning();
    return updatedActivities || undefined;
  }

  // Bank Deposits
  async getBankDeposits(): Promise<BankDeposit[]> {
    return await db
      .select()
      .from(bankDeposits)
      .where(eq(bankDeposits.isActive, true))
      .orderBy(bankDeposits.id);
  }

  async getBankDepositByServiceAndWasteType(serviceId: number, wasteTypeId: number): Promise<BankDeposit | undefined> {
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
    return deposit || undefined;
  }

  async createBankDeposit(deposit: InsertBankDeposit): Promise<BankDeposit> {
    const [newDeposit] = await db
      .insert(bankDeposits)
      .values(deposit)
      .returning();
    return newDeposit;
  }

  async updateBankDeposit(id: number, deposit: UpdateBankDeposit): Promise<BankDeposit> {
    const [updatedDeposit] = await db
      .update(bankDeposits)
      .set({
        ...deposit,
        updatedAt: new Date()
      })
      .where(eq(bankDeposits.id, id))
      .returning();
    return updatedDeposit;
  }

  // Email Logs
  async createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog> {
    const [newEmailLog] = await db
      .insert(emailLogs)
      .values(emailLog)
      .returning();
    return newEmailLog;
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
    const [newAuditLog] = await db
      .insert(auditLogs)
      .values(auditLog)
      .returning();
    return newAuditLog;
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
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));
  }

  // Satisfaction Surveys
  async createSatisfactionSurvey(survey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey> {
    const [created] = await db
      .insert(satisfactionSurveys)
      .values(survey)
      .returning();
    return created;
  }

  async getSatisfactionSurvey(id: number): Promise<SatisfactionSurvey | undefined> {
    const [survey] = await db
      .select()
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.id, id));
    return survey;
  }

  async getSatisfactionSurveyByToken(token: string): Promise<SatisfactionSurvey | undefined> {
    const [survey] = await db
      .select()
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.token, token));
    return survey;
  }

  async getSatisfactionSurveysByOrder(orderId: number): Promise<SatisfactionSurvey[]> {
    return await db
      .select()
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.orderId, orderId));
  }

  async getSatisfactionSurveys(): Promise<(SatisfactionSurvey & { order: Order; user: User })[]> {
    return await db
      .select()
      .from(satisfactionSurveys)
      .leftJoin(orders, eq(satisfactionSurveys.orderId, orders.id))
      .leftJoin(users, eq(satisfactionSurveys.userId, users.id))
      .orderBy(desc(satisfactionSurveys.createdAt)) as any;
  }

  async updateSatisfactionSurvey(id: number, survey: Partial<InsertSatisfactionSurvey>): Promise<SatisfactionSurvey | undefined> {
    const [updatedSurvey] = await db
      .update(satisfactionSurveys)
      .set({
        ...survey,
        updatedAt: new Date()
      })
      .where(eq(satisfactionSurveys.id, id))
      .returning();
    return updatedSurvey || undefined;
  }

  async getOrdersReadyForSurvey(): Promise<Order[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          lte(orders.updatedAt, oneWeekAgo)
        )
      )
      .orderBy(desc(orders.updatedAt));
  }

  // Survey Notifications
  async createSurveyNotification(notification: InsertSurveyNotification): Promise<SurveyNotification> {
    const [newNotification] = await db
      .insert(surveyNotifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async updateSurveyNotification(surveyId: number, notification: Partial<InsertSurveyNotification>): Promise<SurveyNotification | undefined> {
    const [updatedNotification] = await db
      .update(surveyNotifications)
      .set({
        ...notification,
        updatedAt: new Date()
      })
      .where(eq(surveyNotifications.surveyId, surveyId))
      .returning();
    return updatedNotification || undefined;
  }

  // Order Delivery Date Management
  async updateOrderDeliveryDate(orderId: number, confirmedDate: Date, adminUserId: number, adminNotes?: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        confirmedDeliveryDate: confirmedDate,
        adminValidatedBy: adminUserId,
        adminValidatedAt: new Date(),
        adminNotes: adminNotes,
        status: 'confirmed',
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder || undefined;
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
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder || undefined;
  }

  async getOrderByValidationToken(token: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.clientValidationToken, token));
    return order || undefined;
  }

  // FIDs
  async getFids(filters?: { status?: string; search?: string }): Promise<any[]> {
    let query = db
      .select({
        id: fids.id,
        userId: fids.userId,
        orderId: fids.orderId,
        clientCompanyName: fids.clientCompanyName,
        clientContactName: fids.clientContactName,
        clientEmail: fids.clientEmail,
        wasteName: fids.wasteName,
        nomenclatureCode: fids.nomenclatureCode,
        status: fids.status,
        validatedBy: fids.validatedBy,
        validatedAt: fids.validatedAt,
        rejectionReason: fids.rejectionReason,
        adminComments: fids.adminComments,
        createdAt: fids.createdAt,
        updatedAt: fids.updatedAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        },
        validatedByUser: {
          firstName: sql`validated_user.first_name`,
          lastName: sql`validated_user.last_name`
        }
      })
      .from(fids)
      .leftJoin(users, eq(fids.userId, users.id))
      .leftJoin(sql`users AS validated_user`, sql`fids.validated_by = validated_user.id`)
      .orderBy(desc(fids.createdAt));

    if (filters?.status && filters.status !== 'all') {
      query = query.where(eq(fids.status, filters.status));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        sql`(
          ${fids.clientCompanyName} ILIKE ${searchTerm} OR
          ${fids.clientContactName} ILIKE ${searchTerm} OR
          ${fids.wasteName} ILIKE ${searchTerm} OR
          ${fids.nomenclatureCode} ILIKE ${searchTerm}
        )`
      );
    }

    return await query;
  }

  async getFidById(id: number): Promise<any | undefined> {
    const [fid] = await db
      .select()
      .from(fids)
      .leftJoin(users, eq(fids.userId, users.id))
      .where(eq(fids.id, id));

    return fid || undefined;
  }

  async createFid(fid: InsertFid): Promise<Fid> {
    const [newFid] = await db
      .insert(fids)
      .values(fid)
      .returning();
    return newFid;
  }

  async updateFid(id: number, fid: Partial<UpdateFid>): Promise<Fid | undefined> {
    const [updatedFid] = await db
      .update(fids)
      .set({
        ...fid,
        updatedAt: new Date()
      })
      .where(eq(fids.id, id))
      .returning();
    return updatedFid || undefined;
  }
}

export const storage = new DatabaseStorage();